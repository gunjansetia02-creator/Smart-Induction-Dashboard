import { graphPost } from './graph-client'
import { fetchAllEmployees, parseDOJ, businessDaysBetween } from './pms-client'
import { isIndiaBasedLocation } from './india-location'
import { getJoinerStatuses } from '@/lib/data/get-joiner-statuses'
import { countsForJoiner } from '@/lib/data/material-applicability'
import { supabase } from '@/lib/supabase'

const HR_EMAIL      = process.env.HR_EMAIL      ?? 'Gunjan.setia@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

// Working days after DOJ at which an unfinished joiner gets reminder 1, 2, 3.
// Day 5 is left free for the week-1 check-in email. Three at most, then HR
// follows up personally.
export const REMINDER_SCHEDULE = [3, 7, 12] as const
// Only joiners this recent are chased, so switching auto-reminders on doesn't
// suddenly email people who joined months ago.
const LOOKBACK_DAYS = 30

export interface ReminderCandidate {
  name: string
  email: string
  dept: string | null
  doj: string
  workingDays: number
  materialsComplete: number
  materialsTotal: number
  remindersSent: number
  nextReminderNo: number | null // null = nothing due today
}

export async function getReminderSettings(): Promise<{ autoEnabled: boolean }> {
  const { data } = await supabase.from('reminder_settings').select('auto_enabled').eq('id', 1).maybeSingle()
  return { autoEnabled: Boolean(data?.auto_enabled) }
}

export async function setReminderAutoEnabled(autoEnabled: boolean): Promise<void> {
  const { error } = await supabase.from('reminder_settings')
    .update({ auto_enabled: autoEnabled, updated_at: new Date().toISOString() }).eq('id', 1)
  if (error) throw new Error(error.message)
}

export async function getReminderCounts(): Promise<Record<string, { count: number; last: string }>> {
  const { data } = await supabase.from('completion_reminders').select('employee_email, sent_at')
  const out: Record<string, { count: number; last: string }> = {}
  for (const r of data ?? []) {
    const k = r.employee_email.toLowerCase()
    const prev = out[k]
    out[k] = { count: (prev?.count ?? 0) + 1, last: !prev || r.sent_at > prev.last ? r.sent_at : prev.last }
  }
  return out
}

// Recent India-based joiners who haven't finished their materials, with which
// reminder (if any) is due today. A missed run catches up one step at a time.
export async function planReminders(now = new Date()): Promise<ReminderCandidate[]> {
  const cutoff = new Date(now.getTime() - LOOKBACK_DAYS * 86_400_000)
  const recent = (await fetchAllEmployees())
    .filter(e => isIndiaBasedLocation(e['Base Location']))
    .map(e => ({ e, doj: parseDOJ(e['DOJ']) }))
    .filter(({ e, doj }) => doj && doj >= cutoff && doj <= now && (e['Office Email'] || e['Personal Email']))

  const refs = recent.map(({ e }) => ({ email: (e['Office Email'] ?? e['Personal Email'])!, dept: e['Department'] }))
  const [statuses, counts] = await Promise.all([getJoinerStatuses(refs), getReminderCounts()])

  const out: ReminderCandidate[] = []
  for (const { e, doj } of recent) {
    const email = (e['Office Email'] ?? e['Personal Email'])!
    const s = statuses[email]
    if (!s || s.materialsTotal === 0 || s.materialsComplete >= s.materialsTotal) continue

    const workingDays = businessDaysBetween(doj!, now)
    const sent = counts[email.toLowerCase()]?.count ?? 0
    const due = REMINDER_SCHEDULE.filter(d => workingDays >= d).length
    // Never two reminders within 2 working days of each other, even when catching up.
    const last = counts[email.toLowerCase()]?.last
    const tooSoon = last ? businessDaysBetween(new Date(last), now) < 2 : false

    out.push({
      name: (e['Name'] ?? 'New Joiner').trim(),
      email,
      dept: e['Department'],
      doj: doj!.toISOString().substring(0, 10),
      workingDays,
      materialsComplete: s.materialsComplete,
      materialsTotal: s.materialsTotal,
      remindersSent: sent,
      nextReminderNo: sent < due && !tooSoon ? sent + 1 : null,
    })
  }
  return out.sort((a, b) => a.doj.localeCompare(b.doj))
}

async function pendingMaterialTitles(email: string, dept: string | null): Promise<string[]> {
  const [{ data: materials }, { data: progress }, { data: comms }] = await Promise.all([
    supabase.from('materials').select('id, title, required_department, created_at, day, sort_order')
      .order('day', { ascending: true, nullsFirst: false }).order('sort_order', { ascending: true, nullsFirst: false }),
    supabase.from('material_progress').select('material_id, status').eq('employee_email', email),
    supabase.from('joiner_communications').select('materials_complete_at').eq('employee_email', email).maybeSingle(),
  ])
  const done = new Set((progress ?? []).filter(p => p.status === 'complete').map(p => p.material_id))
  return (materials ?? [])
    .filter(m => countsForJoiner(m, dept, comms?.materials_complete_at))
    .filter(m => !done.has(m.id))
    .map(m => m.title)
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

// `sendTo` overrides the recipient — used for HR previews, which go to HR only.
export async function sendCompletionReminder(
  c: Pick<ReminderCandidate, 'name' | 'email' | 'dept' | 'materialsComplete' | 'materialsTotal'>,
  reminderNo: number,
  sendTo?: string,
): Promise<void> {
  const firstName = esc(c.name.split(' ')[0])
  const pending = await pendingMaterialTitles(c.email, c.dept)
  const remaining = c.materialsTotal - c.materialsComplete
  const link = `${DASHBOARD_URL}/employee?email=${encodeURIComponent(c.email)}`
  const final = reminderNo >= REMINDER_SCHEDULE.length

  const subject = final
    ? `Final reminder: ${remaining} induction material${remaining === 1 ? '' : 's'} still pending, ${c.name.split(' ')[0]}`
    : `Reminder: please complete your induction materials (${c.materialsComplete}/${c.materialsTotal} done)`

  const intro = reminderNo === 1
    ? `Hope your first few days at Koenig are going well! A quick nudge: you've completed <strong>${c.materialsComplete} of ${c.materialsTotal}</strong> induction materials so far.`
    : final
      ? `This is a final reminder: <strong>${remaining}</strong> of your induction materials are still pending (${c.materialsComplete} of ${c.materialsTotal} done). Please complete them at the earliest.`
      : `Just following up: you've completed <strong>${c.materialsComplete} of ${c.materialsTotal}</strong> induction materials so far. Please set aside some time to finish the rest.`

  const shown = pending.slice(0, 8)
  const list = shown.map(t => `<li style="margin:0 0 4px;">${esc(t)}</li>`).join('') +
    (pending.length > shown.length ? `<li style="margin:0;color:#6B7A99;">…and ${pending.length - shown.length} more</li>` : '')

  const payload = {
    message: {
      subject,
      body: {
        contentType: 'HTML',
        content: `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<style>[data-ogsc] .cta-td,[data-ogsc] .cta-td a,[data-ogsb] .cta-td,[data-ogsb] .cta-td a{background-color:#1B2D50 !important;color:#ffffff !important;}</style>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="padding:36px 40px 28px;">
        <p style="margin:0 0 16px;font-size:17px;color:#1B2D50;font-weight:600;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">${intro}</p>
        ${list ? `<p style="margin:0 0 8px;font-size:14px;color:#374151;font-weight:600;">Still pending:</p>
        <ul style="margin:0 0 20px;padding-left:20px;font-size:13.5px;color:#374151;line-height:1.6;">${list}</ul>` : ''}
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">
          Each material has a short quiz at the end. If anything is unclear, ask your doubt right there on the dashboard and it'll come straight to me.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:8px auto;"><tr>
          <td class="cta-td" bgcolor="#1B2D50" style="background-color:#1B2D50;border-radius:8px;mso-padding-alt:14px 32px;">
            <a href="${link}" target="_blank" style="display:block;padding:14px 32px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
              <span style="color:#ffffff !important;">Continue My Induction →</span>
            </a>
          </td>
        </tr></table>
        <p style="margin:10px 0 0;font-size:11.5px;color:#9AA6BB;text-align:center;">
          Button not working? Copy this link into your browser:<br>
          <a href="${link}" style="color:#4A9BE8;word-break:break-all;">${link}</a>
        </p>
      </td></tr>
      <tr><td style="background:#EDF1F7;padding:20px 40px;">
        <p style="margin:0;font-size:12px;color:#6B7A99;line-height:1.6;">
          Warm regards,<br><strong style="color:#1B2D50;">Gunjan Setia</strong><br>HR Executive, Koenig Solutions<br>
          <a href="mailto:${HR_EMAIL}" style="color:#4A9BE8;text-decoration:none;">${HR_EMAIL}</a>
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
      },
      toRecipients: [{ emailAddress: { address: sendTo ?? c.email, name: sendTo ? 'HR preview' : c.name } }],
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)
  if (!res.ok) throw new Error(`Failed to send reminder: ${await res.text()}`)
}

export async function logReminder(c: Pick<ReminderCandidate, 'name' | 'email' | 'materialsComplete' | 'materialsTotal'>, reminderNo: number, sentBy: 'auto' | 'hr') {
  const { error } = await supabase.from('completion_reminders').insert({
    employee_email: c.email, employee_name: c.name, reminder_no: reminderNo, sent_by: sentBy,
    materials_complete: c.materialsComplete, materials_total: c.materialsTotal,
  })
  if (error) console.error('[reminders] log failed:', error.message)
}
