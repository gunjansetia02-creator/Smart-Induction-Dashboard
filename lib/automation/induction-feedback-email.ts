import { graphPost } from './graph-client'

const HR_EMAIL    = process.env.HR_EMAIL    ?? 'Gunjan.setia@koenig-solutions.com'
const RASHI_EMAIL = process.env.RASHI_EMAIL ?? 'rashi.oberoi@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

// Fires once, when a joiner submits their end-of-induction feedback —
// to Gunjan, cc'd to Rashi, so both see how the process actually landed.
export async function notifyInductionFeedback(opts: {
  employeeEmail: string
  employeeName: string | null
  rating: number | null
  feedbackText: string
}): Promise<void> {
  const name = opts.employeeName || opts.employeeEmail
  const stars = opts.rating ? '⭐'.repeat(opts.rating) + '☆'.repeat(5 - opts.rating) : null

  const payload = {
    message: {
      subject: `📋 Induction feedback from ${name}`,
      body: {
        contentType: 'HTML',
        content: `
<p><strong>${name}</strong> (${opts.employeeEmail}) just completed their induction and left feedback on the process:</p>
${stars ? `<p style="font-size:18px;margin:10px 0;">${stars} <span style="font-size:13px;color:#6B7A99;">(${opts.rating}/5)</span></p>` : ''}
<blockquote style="margin:12px 0;padding:10px 16px;border-left:3px solid #1B2D50;background:#F4F6FB;color:#1B2D50;white-space:pre-wrap;">${opts.feedbackText}</blockquote>
<p><a href="${DASHBOARD_URL}/hr?tab=profiles">View their profile in the dashboard →</a></p>`,
      },
      toRecipients: [{ emailAddress: { address: HR_EMAIL } }],
      ccRecipients: [{ emailAddress: { address: RASHI_EMAIL } }],
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)
  if (!res.ok) throw new Error(`Failed to send induction feedback email: ${await res.text()}`)
}
