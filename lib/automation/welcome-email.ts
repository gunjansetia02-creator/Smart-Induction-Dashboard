import { graphPost } from './graph-client'

const HR_EMAIL     = process.env.HR_EMAIL     ?? 'Gunjan.setia@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

function nextMonday(): string {
  const d = new Date()
  const day = d.getDay()           // 0=Sun … 6=Sat
  const daysUntil = day === 1 ? 7 : (8 - day) % 7 || 7
  d.setDate(d.getDate() + daysUntil)
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function buildEmailHtml(name: string): string {
  const firstName = name.split(' ')[0]
  const monday    = nextMonday()

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
              We're thrilled to have you join the Koenig family. To make your first week smooth and structured,
              we've set up our <strong>Smart Induction Programme</strong> — a guided Mon–Fri journey that gets
              you up to speed quickly.
            </p>

            <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
              Here's what happens next:
            </p>

            <!-- Steps -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #EDF1F7;">
                  <span style="display:inline-block;background:#D0E7F8;color:#1B2D50;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-right:10px;">TODAY</span>
                  <span style="font-size:13px;color:#374151;">Join the Induction Dashboard and meet your fellow new joiners in the Batch Channel.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #EDF1F7;">
                  <span style="display:inline-block;background:#C5F0DF;color:#0F6B48;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-right:10px;">MONDAY</span>
                  <span style="font-size:13px;color:#374151;"><strong>12:00 PM</strong> — Live Induction Call with me and your batch. A Teams invite has been sent to you separately.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #EDF1F7;">
                  <span style="display:inline-block;background:#FDE8C2;color:#7C4A00;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-right:10px;">MON–FRI</span>
                  <span style="font-size:13px;color:#374151;">Watch induction videos and flag any doubts directly on the dashboard.</span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <span style="display:inline-block;background:#F8D5D1;color:#7C1B0F;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;margin-right:10px;">FRIDAY</span>
                  <span style="font-size:13px;color:#374151;"><strong>12:00 PM</strong> — Doubt Session: all your questions answered live.</span>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.7;">
              Your first session is on <strong>${monday} at 12:00 PM</strong>. You'll receive a separate Teams calendar invite shortly.
            </p>

            <!-- CTA -->
            <p style="margin:28px 0 8px;text-align:center;">
              <a href="${DASHBOARD_URL}/employee"
                 style="display:inline-block;background:#1B2D50;color:#ffffff;font-size:14px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.3px;">
                Open Your Induction Dashboard →
              </a>
            </p>
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
  const html = buildEmailHtml(joiner.name)

  const payload = {
    message: {
      subject: `Welcome to Koenig, ${joiner.name.split(' ')[0]}! Your Induction Starts Monday 🎉`,
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
