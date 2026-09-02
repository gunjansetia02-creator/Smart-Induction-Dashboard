import { graphPost } from './graph-client'

const HR_EMAIL    = process.env.HR_EMAIL    ?? 'Gunjan.setia@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

// Fires once, roughly a business week after DOJ, for anyone who hasn't
// finished their induction — without this, someone who never completes
// every material would never hit the completion-triggered feedback prompt,
// and their feedback would simply never get collected.
export async function sendWeek1CheckinEmail(joiner: { name: string; email: string }): Promise<void> {
  const firstName = joiner.name.split(' ')[0]
  const dashboardLink = `${DASHBOARD_URL}/employee?email=${encodeURIComponent(joiner.email)}`

  const payload = {
    message: {
      subject: `Quick check-in, ${firstName} — how's your induction going?`,
      body: {
        contentType: 'HTML',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    [data-ogsc] .cta-td, [data-ogsc] .cta-td a { background-color:#1B2D50 !important; color:#ffffff !important; }
    [data-ogsc] .cta-td2, [data-ogsc] .cta-td2 a { background-color:#4A9BE8 !important; color:#ffffff !important; }
    [data-ogsb] .cta-td, [data-ogsb] .cta-td a { background-color:#1B2D50 !important; color:#ffffff !important; }
    [data-ogsb] .cta-td2, [data-ogsb] .cta-td2 a { background-color:#4A9BE8 !important; color:#ffffff !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="padding:36px 40px 28px;">
            <p style="margin:0 0 16px;font-size:17px;color:#1B2D50;font-weight:600;">Hi ${firstName}, checking in 👋</p>
            <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
              It's been about a week since you joined, so I wanted to check how your induction is going.
              Have you had a chance to go through the materials on your dashboard? Are you facing any doubts
              or stuck on anything?
            </p>
            <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.7;">
              If something's unclear, ask it right on the dashboard against that material and it'll come
              straight to me.
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">
              <strong>I'd also love to hear how the process has felt so far</strong> — there's a short feedback
              box waiting for you on your dashboard home screen. Takes less than a minute, and it directly
              shapes how we run induction for the next person who joins.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:8px auto 8px;">
              <tr>
                <td class="cta-td" bgcolor="#1B2D50" style="background-color:#1B2D50;border-radius:8px;mso-padding-alt:14px 32px;">
                  <a href="${dashboardLink}" target="_blank"
                     style="display:inline-block;padding:14px 32px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                    <span style="color:#ffffff !important;">Continue My Materials & Share Feedback →</span>
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:10px 0 0;font-size:11.5px;color:#9AA6BB;text-align:center;">
              Button not showing up right? Copy and paste this link into your browser:<br>
              <a href="${dashboardLink}" style="color:#4A9BE8;word-break:break-all;">${dashboardLink}</a>
            </p>
          </td>
        </tr>
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
</html>`,
      },
      toRecipients: [{ emailAddress: { address: joiner.email, name: joiner.name } }],
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)
  if (!res.ok) throw new Error(`Failed to send week-1 check-in email: ${await res.text()}`)
}
