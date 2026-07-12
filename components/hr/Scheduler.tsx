import { Card } from '@/components/ui/Card'
import { collaterals } from '@/lib/mock-data'
import { getRecentJoinersWithStatus } from '@/lib/data/get-joiners'
import { getJoinerStatuses } from '@/lib/data/get-joiner-statuses'
import { SchedulerClient } from './SchedulerClient'

export async function Scheduler() {
  // Fetch a wide window so the client-side date filter (7/14/21/30/custom) can
  // switch instantly without a server round-trip, same pattern as Profiles.
  const { joiners, live } = await getRecentJoinersWithStatus(3650)
  const statuses = await getJoinerStatuses(joiners.map(j => j.email))

  return (
    <div>
      {/* Session Banner */}
      <div className="bg-sky text-white rounded-[5px] p-[15px_18px] flex items-center gap-4 mb-5">
        <div className="flex-1">
          <div className="text-[13.5px] font-bold mb-0.5">
            Monday Induction Session · 30 June 2025 · 12:00 – 13:00 PM IST
          </div>
          <div className="text-[12px] text-white/80">
            Teams invite auto-created at 7:00 AM · 5 attendees · Gunjan Setia (host)
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

          <Card title="Upcoming Sessions">
            <div className="flex flex-col gap-[9px]">
              {[
                { label: 'Fri Doubt Session', date: '27 Jun · 12 PM', highlight: true },
                { label: 'Mon Induction',     date: '30 Jun · 12 PM', highlight: true },
                { label: 'Mon Induction',     date: '7 Jul · 12 PM',  highlight: false },
              ].map((s) => (
                <div key={s.date} className="flex justify-between text-[13px]">
                  <span>{s.label}</span>
                  <strong className={s.highlight ? 'text-sky' : 'text-muted'}>{s.date}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
