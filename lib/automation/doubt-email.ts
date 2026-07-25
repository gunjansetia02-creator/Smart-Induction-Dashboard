import { graphPost } from './graph-client'

const HR_EMAIL = process.env.HR_EMAIL ?? 'Gunjan.setia@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

// Fires only when a question actually needs Gunjan's own answer (escalated) —
// not for every question, since most are handled silently by the AI. Sending
// on every AI-resolved question too would defeat the point of having the AI
// in the first place.
export async function notifyHRNewDoubt(opts: {
  employeeEmail: string
  employeeName: string | null
  materialTitle: string
  question: string
  aiAttempted: boolean
}): Promise<void> {
  const name = opts.employeeName || opts.employeeEmail

  const payload = {
    message: {
      subject: `Doubt needs your answer — ${name} on "${opts.materialTitle}"`,
      body: {
        contentType: 'HTML',
        content: `
<p><strong>${name}</strong> (${opts.employeeEmail}) has a question on <strong>"${opts.materialTitle}"</strong> that needs your answer:</p>
<blockquote style="margin:12px 0;padding:10px 16px;border-left:3px solid #1B2D50;background:#F4F6FB;color:#1B2D50;">${opts.question}</blockquote>
<p style="color:#6B7A99;font-size:13px;">${opts.aiAttempted ? 'The AI assistant tried to help but the employee still needs you.' : 'The AI assistant isn’t available right now, so this went straight to you.'}</p>
<p><a href="${DASHBOARD_URL}/hr?tab=doubt">Answer it in the Doubt Session tab →</a></p>`,
      },
      toRecipients: [{ emailAddress: { address: HR_EMAIL } }],
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)
  if (!res.ok) throw new Error(`Failed to send doubt notification email: ${await res.text()}`)
}

// Fires for every question the AI successfully answers (not just escalated
// ones), so Gunjan can audit AI answers in real time — confirm the good ones,
// correct the wrong ones — from the Doubt Session tab.
export async function notifyHRAiAnswered(opts: {
  employeeEmail: string
  employeeName: string | null
  materialTitle: string
  question: string
  aiAnswer: string
}): Promise<void> {
  const name = opts.employeeName || opts.employeeEmail

  const payload = {
    message: {
      subject: `🤖 AI answered a question — please review (${name})`,
      body: {
        contentType: 'HTML',
        content: `
<p><strong>${name}</strong> (${opts.employeeEmail}) asked a question on <strong>"${opts.materialTitle}"</strong>. The AI assistant answered it automatically — please check it's right:</p>
<blockquote style="margin:12px 0;padding:10px 16px;border-left:3px solid #1B2D50;background:#F4F6FB;color:#1B2D50;">${opts.question}</blockquote>
<p style="margin:12px 0;padding:10px 16px;border-left:3px solid #4A9BE8;background:#EAF4FE;color:#1B2D50;"><strong>🤖 AI Suggested Answer:</strong><br/>${opts.aiAnswer}</p>
<p style="color:#6B7A99;font-size:13px;">If this is correct, no action needed — you can mark it confirmed in the dashboard so the AI reuses this exact answer next time. If it's wrong, correct it there and the right answer goes straight to ${name} — and every joiner after them.</p>
<p><a href="${DASHBOARD_URL}/hr?tab=doubt">Review it in the Doubt Session tab →</a></p>`,
      },
      toRecipients: [{ emailAddress: { address: HR_EMAIL } }],
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)
  if (!res.ok) throw new Error(`Failed to send AI-answered notification email: ${await res.text()}`)
}
