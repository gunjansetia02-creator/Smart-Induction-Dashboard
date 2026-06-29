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

function daysSince(d: Date) {
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86_400_000))
}

function deriveStatus(days: number): { progress: number; status: JoinerStatus } {
  if (days >= 5) return { progress: 100, status: 'complete' }
  if (days >= 3) return { progress: 75,  status: 'in-progress' }
  if (days >= 1) return { progress: 40,  status: 'in-progress' }
  return           { progress: 0,   status: 'not-started' }
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
      const days   = daysSince(doj)
      const { progress, status } = deriveStatus(days)

      return {
        _doj:          doj,
        id:            String(emp['Emp Code'] ?? i + 1),
        name,
        initials:      initials(name),
        dept:          emp['Department'] ?? emp['Designation'] ?? 'Koenig Solutions',
        joinedDate:    fmtDate(doj),
        videosWatched: Math.round((progress / 100) * 4),
        totalVideos:   4,
        progress,
        status,
        inviteStatus:  'pending' as InviteStatus,
        emailStatus:   (email ? 'delivered' : 'bounced') as 'delivered' | 'bounced',
        email,
        avatarColor:   AVATAR_COLORS[i % AVATAR_COLORS.length],
      }
    })
    .sort((a, b) => b._doj.getTime() - a._doj.getTime())
}

// Joiners from last N days — falls back to mock if PMS is unreachable
export async function getRecentJoiners(withinDays = 60): Promise<Joiner[]> {
  try {
    return await fetchMapped(withinDays)
  } catch {
    return mockJoiners
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
