import { Card } from '@/components/ui/Card'
import { collaterals } from '@/lib/mock-data'
import { getRecentJoinersWithStatus } from '@/lib/data/get-joiners'
import { getJoinerStatuses } from '@/lib/data/get-joiner-statuses'
import { SchedulerClient } from './SchedulerClient'

// Induction is now self-paced through the dashboard — Monday is an optional
// doubt-clearing call, not a scheduled induction lecture, and there is no
// longer a separate Friday session.
function nextMondays(count: number): Date[] {
  const now = new Date()
  const day = now.getDay()
  const daysUntil = day === 1 ? 7 : (8 - day) % 7 || 7
  const first = new Date(now)
  first.setDate(now.getDate() + daysUntil)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(first)
    d.setDate(first.getDate() + i * 7)
    return d
  })
}

function fmt(d: Date) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export async function Scheduler() {
  // Fetch a wide window so the client-side date filter (7/14/21/30/custom) can
  // switch instantly without a server round-trip, same pattern as Profiles.
  const { joiners, live } = await getRecentJoinersWithStatus(3650)
  const statuses = await getJoinerStatuses(joiners.map(j => j.email))
  const [thisMonday, ...laterMondays] = nextMondays(3)

  return (
    <div>
      {/* Session Banner */}
      <div className="bg-sky text-white rounded-[5px] p-[15px_18px] flex items-center gap-4 mb-5">
        <div className="flex-1">
          <div className="text-[13.5px] font-bold mb-0.5">
            Induction Doubt-Clearing Call · {thisMonday.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · 12:00 – 13:00 PM IST
          </div>
          <div className="text-[12px] text-white/80">
            Optional — join if you have unresolved questions · Teams invite auto-created · Gunjan Setia (host)
          </div>
        </div>
        <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white/15 text-white border border-white/20 rounded cursor-pointer hover:bg-white/20">
          Copy Link
        </button>
        <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-navy text-white rounded cursor-pointer hover:opacity-85">
          Join Teams
        </button>
      </div>

      {/* Two-col */}
      <div className="grid grid-cols-[1fr_280px] gap-[18px]">
        {/* Attendees */}
        <Card title="Attendees" noPad>
          <div className="px-[13px] pt-[11px]">
            <SchedulerClient joiners={joiners} live={live} initialStatuses={statuses} />
          </div>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <Card title="Collateral Auto-Send · 1:00 PM">
            <p className="text-[12px] text-muted mb-3">Sent to all attendees automatically after the session ends.</p>
            <div className="flex flex-col gap-[7px]">
              {collaterals.map((c) => (
                <div key={c} className="flex items-center gap-[9px] text-[13px]">
                  <span className="text-kgreen font-bold">✓</span> {c}
                </div>
              ))}
            </div>
          </Card>

          <Card title="Upcoming Doubt-Clearing Calls">
            <div className="flex flex-col gap-[9px]">
              {[thisMonday, ...laterMondays].map((d, i) => (
                <div key={d.toISOString()} className="flex justify-between text-[13px]">
                  <span>Mon Doubt Call</span>
                  <strong className={i === 0 ? 'text-sky' : 'text-muted'}>{fmt(d)} · 12 PM</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
