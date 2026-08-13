import { graphPost } from './graph-client'

const HR_EMAIL    = process.env.HR_EMAIL    ?? 'Gunjan.setia@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

// Fires once, the moment a joiner finishes every material — invites Gunjan to
// give her own HR feedback on them, which (once submitted on the dashboard)
// also gets pushed into the RMS reporting-feedback panel.
export async function notifyHRInductionComplete(opts: {
  employeeEmail: string
  employeeName: string | null
}): Promise<void> {
  const name = opts.employeeName || opts.employeeEmail
  const feedbackLink = `${DASHBOARD_URL}/hr?tab=feedback&employeeEmail=${encodeURIComponent(opts.employeeEmail)}`

  const payload = {
    message: {
      subject: `🎓 ${name} completed their induction — give your feedback`,
      body: {
        contentType: 'HTML',
        content: `
<p><strong>${name}</strong> (${opts.employeeEmail}) has completed every material in their induction.</p>
<p>Now's a good time to give your own feedback on how they came across during induction — it'll be saved on the dashboard and also recorded on the RMS reporting-feedback panel automatically.</p>
<p><a href="${feedbackLink}">Give feedback for ${name.split(' ')[0]} →</a></p>`,
      },
      toRecipients: [{ emailAddress: { address: HR_EMAIL } }],
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)
  if (!res.ok) throw new Error(`Failed to send induction-complete notification: ${await res.text()}`)
}
