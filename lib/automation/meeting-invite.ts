import { graphPost, graphGet, graphPatch } from './graph-client'
import type { NewJoiner } from './welcome-email'

const HR_EMAIL = process.env.HR_EMAIL ?? 'Gunjan.setia@koenig-solutions.com'
const MEET_LINK = process.env.TEAMS_MEET_LINK ?? ''

// Returns the date of the next Monday (or this Monday if today is Monday)
function getNextMondayISO(): { date: string; start: string; end: string } {
  const now  = new Date()
  const day  = now.getDay()                         // 0=Sun … 6=Sat
  const daysUntil = day === 1 ? 0 : (8 - day) % 7  // 0 if today is Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() + daysUntil)

  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`

  return {
    date,
    start: `${date}T12:00:00`,
    end:   `${date}T13:00:00`,
  }
}

// Finds an existing Monday 12 PM induction event this week (if one was already created)
async function findExistingMondayEvent(mondayDate: string): Promise<string | null> {
  const start = `${mondayDate}T11:00:00`
  const end   = `${mondayDate}T13:00:00`

  const res = await graphGet(
    `/users/${HR_EMAIL}/calendarView?startDateTime=${start}&endDateTime=${end}&$select=id,subject`
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

// Creates a new Monday 12 PM Teams meeting event for this week's batch
async function createMondayEvent(joiner: NewJoiner, slot: ReturnType<typeof getNextMondayISO>): Promise<void> {
  const payload = {
    subject: 'Weekly Induction – Monday 12 PM',
    body: {
      contentType: 'HTML',
      content: `<p>Welcome to your induction session! This is your weekly Monday meeting with Gunjan and your fellow new joiners.</p>
<p>Please ensure you have visited the <a href="${process.env.DASHBOARD_URL ?? 'https://induction-dashboard.vercel.app'}/employee">Induction Dashboard</a> before the call.</p>`,
    },
    start: { dateTime: slot.start, timeZone: 'India Standard Time' },
    end:   { dateTime: slot.end,   timeZone: 'India Standard Time' },
    location: { displayName: 'Microsoft Teams' },
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',
    attendees: [
      {
        emailAddress: { address: joiner.email, name: joiner.name },
        type: 'required',
      },
    ],
    recurrence: null,
  }

  const res = await graphPost(`/users/${HR_EMAIL}/events`, payload)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to create Monday meeting event: ${err}`)
  }
}

// Adds the new joiner as an attendee to an existing event (sends them an invite automatically)
async function addAttendeeToEvent(eventId: string, joiner: NewJoiner): Promise<void> {
  // First fetch current attendees so we don't overwrite them
  const getRes = await graphGet(`/users/${HR_EMAIL}/events/${eventId}?$select=attendees`)
  if (!getRes.ok) throw new Error('Failed to fetch event attendees')

  const event = await getRes.json()
  const existing: Array<{ emailAddress: { address: string; name: string }; type: string }> = event.attendees ?? []

  // Skip if already added
  if (existing.some(a => a.emailAddress.address.toLowerCase() === joiner.email.toLowerCase())) return

  const updated = [
    ...existing,
    { emailAddress: { address: joiner.email, name: joiner.name }, type: 'required' },
  ]

  const res = await graphPatch(`/users/${HR_EMAIL}/events/${eventId}`, { attendees: updated })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to add attendee to Monday event: ${err}`)
  }
}

export async function addToMondayMeeting(joiner: NewJoiner): Promise<void> {
  const slot       = getNextMondayISO()
  const existingId = await findExistingMondayEvent(slot.date)

  if (existingId) {
    // Event already exists for this Monday — add the new joiner to it
    await addAttendeeToEvent(existingId, joiner)
  } else {
    // First joiner this week — create a fresh Monday event
    await createMondayEvent(joiner, slot)
  }
}
