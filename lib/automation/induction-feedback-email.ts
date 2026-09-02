import { graphPost } from './graph-client'

const HR_EMAIL    = process.env.HR_EMAIL    ?? 'Gunjan.setia@koenig-solutions.com'
const RASHI_EMAIL = process.env.RASHI_EMAIL ?? 'rashi.oberoi@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

// Fires once, when a joiner submits feedback on their induction (whether
// that's right after finishing everything, or from the week-1 check-in
// nudge for anyone still mid-induction) — to Gunjan, cc'd to Rashi. The CTA
// deep-links straight into the Feedback tab for this employee, since the
// natural next step is for HR to leave their own read on the joiner there —
// which also pushes to RMS's reporting-feedback panel.
export async function notifyInductionFeedback(opts: {
  employeeEmail: string
  employeeName: string | null
  rating: number | null
  feedbackText: string
}): Promise<void> {
  const name = opts.employeeName || opts.employeeEmail
  const stars = opts.rating ? '⭐'.repeat(opts.rating) + '☆'.repeat(5 - opts.rating) : null
  const feedbackLink = `${DASHBOARD_URL}/hr?tab=feedback&employeeEmail=${encodeURIComponent(opts.employeeEmail)}`

  const payload = {
    message: {
      subject: `📋 Induction feedback from ${name}`,
      body: {
        contentType: 'HTML',
        content: `
<p><strong>${name}</strong> (${opts.employeeEmail}) just left feedback on their induction:</p>
${stars ? `<p style="font-size:18px;margin:10px 0;">${stars} <span style="font-size:13px;color:#6B7A99;">(${opts.rating}/5)</span></p>` : ''}
<blockquote style="margin:12px 0;padding:10px 16px;border-left:3px solid #1B2D50;background:#F4F6FB;color:#1B2D50;white-space:pre-wrap;">${opts.feedbackText}</blockquote>
<p style="color:#6B7A99;font-size:13px;">Now's a good time to leave your own read on how ${name.split(' ')[0]} is coming along — it'll also be recorded on the RMS reporting-feedback panel.</p>
<p><a href="${feedbackLink}">Give your feedback on ${name.split(' ')[0]} →</a></p>`,
      },
      toRecipients: [{ emailAddress: { address: HR_EMAIL } }],
      ccRecipients: [{ emailAddress: { address: RASHI_EMAIL } }],
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)
  if (!res.ok) throw new Error(`Failed to send induction feedback email: ${await res.text()}`)
}
