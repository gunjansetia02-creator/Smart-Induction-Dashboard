import { graphPost, graphGet, graphPatch } from './graph-client'
import type { NewJoiner } from './welcome-email'

const HR_EMAIL    = process.env.HR_EMAIL    ?? 'Gunjan.setia@koenig-solutions.com'
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'

function getNextMondayISO(): { date: string; start: string; end: string } {
  const now  = new Date()
  const day  = now.getDay()
  let daysUntil = day === 1 ? 0 : (8 - day) % 7
  // A joiner starting Thu–Sun would otherwise land a doubt-clearing call only
  // 1–3 days out, before they've had a real chance to review any material —
  // push to the following Monday instead. Must match daysUntilNextMonday() in
  // welcome-email.ts so the email text and the actual invite agree. Monday
  // itself (day === 1) is left alone: that's today's own session, not a
  // future one to reschedule.
  if (day !== 1 && daysUntil < 4) daysUntil += 7
  const monday = new Date(now)
  monday.setDate(now.getDate() + daysUntil)

  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`
  return { date, start: `${date}T12:00:00`, end: `${date}T13:00:00` }
}

async function findExistingMondayEvent(mondayDate: string): Promise<string | null> {
  // calendarView requires UTC times — IST is UTC+5:30, so 12:00 IST = 06:30 UTC
  const res = await graphGet(
    `/users/${HR_EMAIL}/calendarView` +
    `?startDateTime=${mondayDate}T06:00:00Z` +
    `&endDateTime=${mondayDate}T07:30:00Z` +
    `&$select=id,subject&$top=10`
  )
  if (!res.ok) return null

  const data = await res.json()
  const events: Array<{ id: string; subject: string }> = data.value ?? []
  const match = events.find(e =>
    e.subject.toLowerCase().includes('induction') ||
    e.subject.toLowerCase().includes('monday meet')
  )
  return match?.id ?? null
}

// Creates one Monday event with ALL this week's joiners as attendees
async function createMondayEvent(
  joiners: NewJoiner[],
  slot: ReturnType<typeof getNextMondayISO>
): Promise<void> {
  const attendees = joiners.map(j => ({
    emailAddress: { address: j.email, name: j.name },
    type: 'required',
  }))

  const payload = {
    subject: 'Induction Doubt-Clearing Call – Monday 12 PM',
    body: {
      contentType: 'HTML',
      content: `<p>This is your optional weekly doubt-clearing call with Gunjan — join if you have anything left unresolved from your induction materials, or want to talk something through live.</p>
<p>No need to attend if you don't have any open questions. Review your materials and quizzes on the <a href="${DASHBOARD_URL}/employee">Induction Dashboard</a> beforehand.</p>`,
    },
    start: { dateTime: slot.start, timeZone: 'India Standard Time' },
    end:   { dateTime: slot.end,   timeZone: 'India Standard Time' },
    location: { displayName: 'Microsoft Teams' },
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',
    attendees,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/events`, payload)
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create Monday meeting event: ${err}`)
  }
}

// Adds any new joiners (not already on the event) to the existing event in one PATCH
async function addAttendeesToEvent(eventId: string, joiners: NewJoiner[]): Promise<void> {
  const getRes = await graphGet(`/users/${HR_EMAIL}/events/${eventId}?$select=attendees`)
  if (!getRes.ok) throw new Error('Failed to fetch event attendees')

  const event = await getRes.json()
  const existing: Array<{ emailAddress: { address: string; name: string }; type: string }> =
    event.attendees ?? []

  const existingEmails = new Set(existing.map(a => a.emailAddress.address.toLowerCase()))

  const newAttendees = joiners
    .filter(j => !existingEmails.has(j.email.toLowerCase()))
    .map(j => ({ emailAddress: { address: j.email, name: j.name }, type: 'required' }))

  if (newAttendees.length === 0) return  // all already on the invite

  const res = await graphPatch(`/users/${HR_EMAIL}/events/${eventId}`, {
    attendees: [...existing, ...newAttendees],
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to add attendees to Monday event: ${err}`)
  }
}

// Accepts ALL of this week's joiners — creates or updates ONE shared meeting
export async function addAllToMondayMeeting(joiners: NewJoiner[]): Promise<void> {
  if (joiners.length === 0) return

  const slot       = getNextMondayISO()
  const existingId = await findExistingMondayEvent(slot.date)

  if (existingId) {
    await addAttendeesToEvent(existingId, joiners)
  } else {
    await createMondayEvent(joiners, slot)
  }
}
