import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { doubts } from '@/lib/mock-data'

const pastSessions = [
  { date: '20 Jun 2025', doubts: 3 },
  { date: '13 Jun 2025', doubts: 5 },
  { date: '6 Jun 2025',  doubts: 2 },
]

export function DoubtSession() {
  return (
    <div className="grid grid-cols-[1fr_280px] gap-[18px]">
      {/* Doubts list */}
      <Card
        title="Flagged Doubts · Fri 27 Jun · 12:00 PM"
        noPad
        action={
          <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
            Join Teams Call
          </button>
        }
      >
        <div className="px-[17px]">
          {doubts.map((d) => (
            <div key={d.id} className="flex items-center gap-3 py-3 border-b border-ground last:border-0">
              <div className="flex-1">
                <div className="text-[13px] text-navy font-medium">{d.question}</div>
                <div className="text-[11.5px] text-muted mt-0.5">
                  {d.askedBy} · {d.videoSource} · {d.timestamp}
                </div>
              </div>
              <Pill variant="blue">{d.dept}</Pill>
              <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85 whitespace-nowrap">
                Mark Answered
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <Card title="Session Summary">
          <div className="grid grid-cols-2 gap-[10px] mb-4">
            {[
              { val: doubts.length, lbl: 'Doubts Queued' },
              { val: 4,             lbl: 'Attendees' },
            ].map((s) => (
              <div key={s.lbl} className="bg-ground rounded-[4px] p-3 text-center">
                <div className="text-[22px] font-extrabold text-navy tabular">{s.val}</div>
                <div className="text-[11px] text-muted mt-0.5">{s.lbl}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-[7px] pt-3 border-t border-ground text-[13px]">
            {[
              ['Date',           '27 Jun 2025'],
              ['Time',           '12:00 – 12:20 PM'],
              ['Host',           'Gunjan Setia'],
              ['Auto-scheduled', 'Yes'],
            ].map(([lbl, val]) => (
              <div key={lbl} className="flex justify-between">
                <span className="text-muted">{lbl}</span>
                <strong className={lbl === 'Auto-scheduled' ? 'text-kgreen' : ''}>{val}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Past Sessions" noPad>
          <div className="px-[17px]">
            {pastSessions.map((s) => (
              <div key={s.date} className="flex items-center justify-between py-2 border-b border-ground last:border-0 text-[13px]">
                <span>{s.date}</span>
                <span className="text-muted">{s.doubts} doubts</span>
                <Pill variant="green">Done</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
