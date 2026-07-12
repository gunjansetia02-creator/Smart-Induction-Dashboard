import { graphPost } from './graph-client'

const HR_EMAIL     = process.env.HR_EMAIL     ?? 'Gunjan.setia@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

// A joiner who starts Thu–Sun would otherwise be pointed at a doubt-clearing
// call only 1–3 days out, before they've had a real chance to review any
// material. If the immediate next Monday is that close, skip to the one
// after instead — this must match getNextMondayISO() in meeting-invite.ts,
// since that's what actually creates the Teams event.
function daysUntilNextMonday(): number {
  const day = new Date().getDay()  // 0=Sun … 6=Sat
  let days = day === 1 ? 7 : (8 - day) % 7 || 7
  if (days < 4) days += 7
  return days
}

function nextMonday(): string {
  const d = new Date()
  d.setDate(d.getDate() + daysUntilNextMonday())
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function buildEmailHtml(name: string, email: string): string {
  const firstName = name.split(' ')[0]
  const monday    = nextMonday()
  const dashboardLink = `${DASHBOARD_URL}/employee?email=${encodeURIComponent(email)}`

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1B2D50;padding:28px 40px;">
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">Koenig Solutions</p>
            <p style="margin:4px 0 0;color:#8EB8E8;font-size:13px;">Smart Induction Programme</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 20px;font-size:17px;color:#1B2D50;font-weight:600;">Welcome aboard, ${firstName}! 🎉</p>

            <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
              We're thrilled to have you join the Koenig family. To get you up to speed quickly, HR has designed
              a structured <strong>one-week Smart Induction Programme</strong>, run entirely through your
              personal Induction Dashboard. You're expected to complete it — every material and its quiz —
              within your first week.
            </p>

            <!-- Quick-start callout -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="background:#F4F8FD;border:1px solid #D0E7F8;border-radius:8px;padding:14px 16px;">
                  <p style="margin:0;font-size:12px;color:#1B2D50;font-weight:700;letter-spacing:0.3px;">📋 YOUR WEEK AT A GLANCE</p>
                  <p style="margin:6px 0 0;font-size:13px;color:#374151;line-height:1.6;">
                    Review each material → Pass its quiz (70%+) → Ask doubts anytime → Induction complete within 7 days.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
              Here's exactly what's expected of you:
            </p>

            <!-- Steps -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #EDF1F7;">
                  <span style="display:inline-block;background:#D0E7F8;color:#1B2D50;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-right:10px;">TODAY</span>
                  <span style="font-size:13px;color:#374151;">Open your Induction Dashboard — the first time you log in, it'll walk you through each tab so you know exactly what to do. Then start reviewing your materials, one by one, in the order they're listed.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #EDF1F7;">
                  <span style="display:inline-block;background:#FDE8C2;color:#7C4A00;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-right:10px;">AFTER EACH ONE</span>
                  <span style="font-size:13px;color:#374151;">Attempt the short quiz for that material. Score <strong>70% or more</strong> and it's marked complete — below that, you'll review it again and retake the quiz.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #EDF1F7;">
                  <span style="display:inline-block;background:#E4D9F7;color:#5B2A9E;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-right:10px;">GOT A QUESTION?</span>
                  <span style="font-size:13px;color:#374151;">Ask it right there on the dashboard against that material — it comes straight to me by email and I'll answer it directly.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #EDF1F7;">
                  <span style="display:inline-block;background:#C5F0DF;color:#0F6B48;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-right:10px;">MONDAY · 12 PM</span>
                  <span style="font-size:13px;color:#374151;">Optional doubt-clearing call with me, next on <strong>${monday}</strong> — join if anything's still unresolved or you'd rather talk it through live. A Teams invite will follow separately; no need to attend if you have nothing pending.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <span style="display:inline-block;background:#DCEFE1;color:#1F6E3A;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-right:10px;">ALL DONE</span>
                  <span style="font-size:13px;color:#374151;">Once every material and its quiz are complete, your induction is officially wrapped up.</span>
                </td>
              </tr>
            </table>

            <!-- CTA (table-based "bulletproof" button — a plain styled <a> with
                 display:inline-block can silently lose its href/background in
                 Outlook's Word rendering engine) -->
            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 8px;">
              <tr>
                <td bgcolor="#1B2D50" style="border-radius:8px;mso-padding-alt:14px 36px;">
                  <a href="${dashboardLink}" target="_blank"
                     style="display:inline-block;padding:14px 36px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                    Open Your Induction Dashboard →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#EDF1F7;padding:20px 40px;">
            <p style="margin:0;font-size:12px;color:#6B7A99;line-height:1.6;">
              Warm regards,<br>
              <strong style="color:#1B2D50;">Gunjan Setia</strong><br>
              HR Executive, Koenig Solutions<br>
              <a href="mailto:${HR_EMAIL}" style="color:#4A9BE8;text-decoration:none;">${HR_EMAIL}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export interface NewJoiner {
  name:       string
  email:      string
  department?: string
}

export async function sendWelcomeEmail(joiner: NewJoiner): Promise<void> {
  const html = buildEmailHtml(joiner.name, joiner.email)

  const payload = {
    message: {
      subject: `Welcome to Koenig, ${joiner.name.split(' ')[0]}! Start Your Induction Today 🎉`,
      body: { contentType: 'HTML', content: html },
      toRecipients: [
        { emailAddress: { address: joiner.email, name: joiner.name } },
      ],
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to send welcome email: ${err}`)
  }
}
