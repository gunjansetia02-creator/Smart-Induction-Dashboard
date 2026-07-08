import { graphPost } from './graph-client'

const HR_EMAIL = process.env.HR_EMAIL ?? 'Gunjan.setia@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

export const BUSINESS_START_HOUR = 10 // 10:00 IST
export const BUSINESS_END_HOUR = 18   // 18:00 IST
export const SLOT_MINUTES = 30

// IST is UTC+5:30 with no DST — safe to hardcode the offset
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000

function istDateStringToUtc(dateStr: string, hour: number, minute = 0): Date {
  // dateStr is "YYYY-MM-DD" interpreted as an IST wall-clock time
  const utcMs = Date.parse(`${dateStr}T00:00:00.000Z`) + hour * 3600000 + minute * 60000 - IST_OFFSET_MS
  return new Date(utcMs)
}

export interface Slot {
  start: string // ISO UTC
  end: string   // ISO UTC
}

// Returns every business-hour slot for the day, each tagged free/busy per HR's real calendar
export async function getDaySlotsWithAvailability(dateStr: string): Promise<{ slot: Slot; free: boolean }[]> {
  const dayStartUtc = istDateStringToUtc(dateStr, BUSINESS_START_HOUR)
  const dayEndUtc = istDateStringToUtc(dateStr, BUSINESS_END_HOUR)

  const slots: Slot[] = []
  for (let t = dayStartUtc.getTime(); t < dayEndUtc.getTime(); t += SLOT_MINUTES * 60000) {
    slots.push({ start: new Date(t).toISOString(), end: new Date(t + SLOT_MINUTES * 60000).toISOString() })
  }

  const res = await graphPost('/users/' + encodeURIComponent(HR_EMAIL) + '/calendar/getSchedule', {
    schedules: [HR_EMAIL],
    startTime: { dateTime: dayStartUtc.toISOString().replace('Z', ''), timeZone: 'UTC' },
    endTime: { dateTime: dayEndUtc.toISOString().replace('Z', ''), timeZone: 'UTC' },
    availabilityViewInterval: SLOT_MINUTES,
  })

  if (!res.ok) {
    // If we can't reach the calendar, fail safe: show nothing bookable rather than double-booking blind
    return slots.map(slot => ({ slot, free: false }))
  }

  const data = await res.json()
  const view: string = data.value?.[0]?.availabilityView ?? ''

  return slots.map((slot, i) => ({ slot, free: view[i] === '0' || view[i] === undefined }))
}

export async function createDoubtSessionEvent(opts: {
  employeeEmail: string
  employeeName: string
  slotStart: string
  slotEnd: string
}): Promise<string> {
  const payload = {
    subject: `1:1 Doubt Session with ${opts.employeeName}`,
    body: {
      contentType: 'HTML',
      content: `<p>Quick 1:1 to help with any onboarding questions.</p><p><a href="${DASHBOARD_URL}/employee">Induction Dashboard</a></p>`,
    },
    start: { dateTime: opts.slotStart, timeZone: 'UTC' },
    end: { dateTime: opts.slotEnd, timeZone: 'UTC' },
    location: { displayName: 'Microsoft Teams' },
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',
    attendees: [{ emailAddress: { address: opts.employeeEmail, name: opts.employeeName }, type: 'required' }],
  }

  const res = await graphPost(`/users/${HR_EMAIL}/events`, payload)
  if (!res.ok) throw new Error(`Failed to create doubt session event: ${await res.text()}`)
  const data = await res.json()
  return data.id as string
}

export async function sendBookingRequestEmail(opts: {
  employeeEmail: string
  employeeName: string
  slotStart: string
}): Promise<void> {
  const when = new Date(opts.slotStart).toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata',
  })

  const payload = {
    message: {
      subject: `1:1 request from ${opts.employeeName} — ${when} IST`,
      body: {
        contentType: 'HTML',
        content: `<p><strong>${opts.employeeName}</strong> (${opts.employeeEmail}) requested a 1:1 doubt session on <strong>${when} IST</strong>.</p>
<p>Go to the <a href="${DASHBOARD_URL}/hr?tab=doubt">Doubt Session tab</a> in the Induction Dashboard to accept or decline.</p>`,
      },
      toRecipients: [{ emailAddress: { address: HR_EMAIL } }],
    },
    saveToSentItems: true,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/sendMail`, payload)
  if (!res.ok) throw new Error(`Failed to send booking request email: ${await res.text()}`)
}
