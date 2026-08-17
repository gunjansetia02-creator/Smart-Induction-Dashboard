import { graphPost } from './graph-client'

const HR_EMAIL      = process.env.HR_EMAIL      ?? 'Gunjan.setia@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

const EVENT_DATE = '21st August 2026'

function buildEmailHtml(): string {
  const confirmLink = `${DASHBOARD_URL}/f2f-rsvp?response=confirmed`
  const changeLink  = `${DASHBOARD_URL}/f2f-rsvp?response=change`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <style>
    [data-ogsc] .confirm-td, [data-ogsc] .confirm-td a { background-color:#1E8E3E !important; color:#ffffff !important; }
    [data-ogsb] .confirm-td, [data-ogsb] .confirm-td a { background-color:#1E8E3E !important; color:#ffffff !important; }
    [data-ogsc] .change-td, [data-ogsc] .change-td a { background-color:#D93025 !important; color:#ffffff !important; }
    [data-ogsb] .change-td, [data-ogsb] .change-td a { background-color:#D93025 !important; color:#ffffff !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <tr>
          <td style="padding:32px 40px 8px;">
            <p style="margin:0 0 20px;font-size:17px;color:#111827;font-weight:700;">Final Confirmation: F2F on ${EVENT_DATE}</p>

            <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">Hi all,</p>

            <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
              The wait is almost over &mdash; the F2F is scheduled for <strong>${EVENT_DATE}</strong>.
            </p>

            <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">
              As per our records, based on the poll we ran earlier, you had confirmed that you'll be attending.
              Since we need to finalize logistics, this is a final check to make sure there's been no change in plan.
            </p>

            <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">
              If everything is on track, please confirm below. If there's been any change and you won't be able to
              attend, please let us know using the same buttons so we can adjust arrangements accordingly.
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
              <tr>
                <td class="confirm-td" bgcolor="#1E8E3E" style="background-color:#1E8E3E;border-radius:24px;mso-padding-alt:12px 24px;">
                  <a href="${confirmLink}" target="_blank"
                     style="display:inline-block;padding:12px 24px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                    <span style="color:#ffffff !important;">&#10003; Confirmed, I'll Attend</span>
                  </a>
                </td>
                <td style="width:16px;">&nbsp;</td>
                <td class="change-td" bgcolor="#D93025" style="background-color:#D93025;border-radius:24px;mso-padding-alt:12px 24px;">
                  <a href="${changeLink}" target="_blank"
                     style="display:inline-block;padding:12px 24px;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">
                    <span style="color:#ffffff !important;">&#10005; Change of Plan</span>
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:16px 0 24px;font-size:12px;color:#6B7280;line-height:1.6;">
              Clicking a button will take you to a short form to confirm your name and email, so we can match your
              response for logistics planning.
            </p>

            <p style="margin:0 0 4px;font-size:14px;color:#374151;">Thanks &amp; Regards,</p>
            <p style="margin:0;font-size:14px;color:#374151;">Team HR</p>
          </td>
        </tr>

        <tr>
          <td style="background:#EDF1F7;padding:16px 40px;">
            <p style="margin:0;font-size:11px;color:#9AA6BB;">
              Sent by <a href="mailto:${HR_EMAIL}" style="color:#6B7A99;">${HR_EMAIL}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendF2FConfirmationEmail(opts: {
  to: string[]
  bcc?: string[]
}): Promise<void> {
  const html = buildEmailHtml()

  const payload = {
    message: {
      subject: `Final Confirmation: F2F on ${EVENT_DATE}`,
      body: { contentType: 'HTML', content: html },
      toRecipients: opts.to.map((address) => ({ emailAddress: { address } })),
      bccRecipients: (opts.bcc ?? []).map((address) => ({ emailAddress: { address } })),
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to send F2F confirmation email: ${err}`)
  }
}
