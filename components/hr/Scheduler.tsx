import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { thisWeekJoiners, collaterals } from '@/lib/mock-data'
import type { InviteStatus, EmailStatus } from '@/lib/types'

function invitePill(s: InviteStatus) {
  if (s === 'accepted')    return <Pill variant="green">Accepted</Pill>
  if (s === 'pending')     return <Pill variant="amber">Pending</Pill>
  return <Pill variant="red">No Response</Pill>
}

function emailPill(s: EmailStatus) {
  if (s === 'delivered') return <Pill variant="green">Delivered</Pill>
  return <Pill variant="red">Bounced</Pill>
}

export function Scheduler() {
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
        <Card title="Attendees · 5 New Joiners" noPad
          action={
            <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
              Resend All
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Name','Email','Dept','Teams Invite','Welcome Email',''].map((h, i) => (
                    <th key={i} className="px-[13px] py-[9px] text-left text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint bg-ground border-b border-bdr whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {thisWeekJoiners.map((j) => (
                  <tr key={j.id} className="hover:bg-[#F7FAFD]">
                    <td className="px-[13px] py-[11px] text-[13px] border-b border-ground"><strong>{j.name}</strong></td>
                    <td className="px-[13px] py-[11px] text-[12px] text-muted border-b border-ground">{j.email}</td>
                    <td className="px-[13px] py-[11px] text-[13px] border-b border-ground">{j.dept}</td>
                    <td className="px-[13px] py-[11px] border-b border-ground">{invitePill(j.inviteStatus)}</td>
                    <td className="px-[13px] py-[11px] border-b border-ground">{emailPill(j.emailStatus)}</td>
                    <td className="px-[13px] py-[11px] border-b border-ground">
                      {j.inviteStatus === 'pending' && (
                        <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
                          Resend
                        </button>
                      )}
                      {j.emailStatus === 'bounced' && (
                        <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-kred-dim text-red-700 rounded cursor-pointer hover:opacity-85">
                          Fix Email
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
