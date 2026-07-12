import { fetchAllEmployees, parseDOJ } from '@/lib/automation/pms-client'
import { joiners as mockJoiners }       from '@/lib/mock-data'
import type { Joiner, JoinerStatus, InviteStatus } from '@/lib/types'

const AVATAR_COLORS = ['#4A9BE8','#27B882','#F4A622','#E85A4A','#1B2D50','#6B7A99']

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase()
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function currentMonthBounds() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return { start, end }
}

function currentWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now)
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  return { start: mon, end: sun }
}

// Internal: fetch & map PMS employees to Joiner shape, keyed by doj for filtering
interface MappedJoiner extends Joiner { _doj: Date }

async function fetchMapped(withinDays: number): Promise<MappedJoiner[]> {
  const all    = await fetchAllEmployees()
  const cutoff = new Date(Date.now() - withinDays * 86_400_000)

  return all
    .filter(emp => {
      const doj = parseDOJ(emp['DOJ'])
      return doj && doj >= cutoff && emp['Name']
    })
    .map((emp, i) => {
      const doj    = parseDOJ(emp['DOJ'])!
      const name   = emp['Name']!.trim()
      const email  = emp['Office Email'] ?? emp['Personal Email'] ?? ''

      return {
        _doj:          doj,
        // Index-suffixed: some PMS records share an Emp Code (rehires), and a
        // duplicate id as a React list key silently breaks reconciliation.
        id:            `${emp['Emp Code'] ?? 'x'}-${i}`,
        name,
        initials:      initials(name),
        designation:   emp['Designation'] ?? 'Employee',
        dept:          emp['Department'] ?? emp['Designation'] ?? 'Koenig Solutions',
        doj:           doj.toISOString().substring(0, 10),
        joinedDate:    fmtDate(doj),
        // Real progress/status come from Supabase (see getJoinerStatuses) — these
        // placeholder fields are never rendered, kept only to satisfy the Joiner type.
        videosWatched: 0,
        totalVideos:   0,
        progress:      0,
        status:        'not-started' as JoinerStatus,
        inviteStatus:  'pending' as InviteStatus,
        emailStatus:   (email ? 'delivered' : 'bounced') as 'delivered' | 'bounced',
        email,
        avatarColor:   AVATAR_COLORS[i % AVATAR_COLORS.length],
        reportingManager:      emp['Reporting Manager'] ?? null,
        reportingManagerEmail: emp['Reporting Manager Email'] ?? null,
        baseLocation:          emp['Base Location'] ?? null,
        phone:                 emp['Phone'] || null,
        personalEmail:         emp['Personal Email'] || null,
        officeEmail:           emp['Office Email'] || null,
        linkedIn:              emp['LinkedIn Profile'] || null,
        pipStatus:             emp['PIP Status'] || null,
      }
    })
    .sort((a, b) => b._doj.getTime() - a._doj.getTime())
}

// Looks up a single real employee by email (any tenure, not just recent
// joiners) — used to personalize the employee dashboard for whoever's actual
// link (?email=...) they clicked, instead of showing hardcoded demo data.
export async function getJoinerByEmail(email: string): Promise<Joiner | null> {
  if (!email) return null
  try {
    const all = await fetchMapped(3650)
    const target = email.trim().toLowerCase()
    return all.find(j => j.email.toLowerCase() === target) ?? null
  } catch {
    return null
  }
}

// Joiners from last N days — falls back to mock if PMS is unreachable
export async function getRecentJoiners(withinDays = 60): Promise<Joiner[]> {
  try {
    return await fetchMapped(withinDays)
  } catch (error) {
    console.error('[PMS Error] Failed to fetch joiners:', error instanceof Error ? error.message : String(error))
    return mockJoiners
  }
}

// Same as getRecentJoiners, but also reports whether the data is really live from PMS
export async function getRecentJoinersWithStatus(withinDays = 60): Promise<{ joiners: Joiner[]; live: boolean; error?: string }> {
  try {
    const joiners = await fetchMapped(withinDays)
    return { joiners, live: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[PMS Error] Failed to fetch joiners:', message)
    return { joiners: mockJoiners, live: false, error: message }
  }
}

// Joiners with DOJ in the current calendar month
export async function getThisMonthJoiners(): Promise<Joiner[]> {
  try {
    const { start, end } = currentMonthBounds()
    const all = await fetchMapped(90)
    return all.filter(j => j._doj >= start && j._doj <= end)
  } catch {
    return mockJoiners
  }
}

// Joiners with DOJ in the current Mon–Sun week
export async function getThisWeekJoiners(): Promise<Joiner[]> {
  try {
    const { start, end } = currentWeekBounds()
    const all = await fetchMapped(14)
    return all.filter(j => j._doj >= start && j._doj <= end)
  } catch {
    return mockJoiners
  }
}

// Same as getThisWeekJoiners, but also reports whether the data is really live from PMS
export async function getThisWeekJoinersWithStatus(): Promise<{ joiners: Joiner[]; live: boolean; error?: string }> {
  try {
    const { start, end } = currentWeekBounds()
    const all = await fetchMapped(14)
    return { joiners: all.filter(j => j._doj >= start && j._doj <= end), live: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[PMS Error] Failed to fetch this week\'s joiners:', message)
    return { joiners: mockJoiners, live: false, error: message }
  }
}
