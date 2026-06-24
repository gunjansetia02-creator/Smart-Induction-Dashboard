import { KpiCard } from '@/components/ui/KpiCard'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { ProgressRow } from '@/components/ui/ProgressBar'
import { TrendChart } from './TrendChart'
import { feedItems, thisWeekJoiners } from '@/lib/mock-data'
import type { JoinerStatus } from '@/lib/types'

const dotColor: Record<string, string> = {
  green: 'bg-kgreen',
  blue:  'bg-sky',
  amber: 'bg-kamber',
}

function statusPill(s: JoinerStatus) {
  if (s === 'complete')     return <Pill variant="green">Complete</Pill>
  if (s === 'in-progress')  return <Pill variant="blue">In Progress</Pill>
  if (s === 'needs-nudge')  return <Pill variant="amber">Needs Nudge</Pill>
  if (s === 'behind')       return <Pill variant="amber">Behind</Pill>
  return <Pill variant="red">Not Started</Pill>
}

export function Overview() {
  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-[14px] mb-5">
        <KpiCard color="blue"  label="Joiners This Month" value={14} sub={<><span className="text-kgreen font-bold mr-1">↑ 3</span>vs last month</>} />
        <KpiCard color="green" label="Inductions Complete" value={9}  sub="64% completion rate" />
        <KpiCard color="amber" label="Pending"             value={5}  sub="3 in progress · 2 not started" />
        <KpiCard color="red"   label="My Actions"          value={2}  sub="Session prep · 1 email bounce" />
      </div>

      {/* Chart + Feed */}
      <div className="grid grid-cols-[1fr_300px] gap-[18px] mb-5">
        <Card title="Completion Trend — June 2025" bodyClass="px-[17px] py-[14px]">
          <TrendChart />
        </Card>

        <Card title="Activity Feed" noPad>
          <div className="px-[17px]">
            {feedItems.map((item) => (
              <div key={item.id} className="flex items-start gap-[11px] py-[9px] border-b border-ground last:border-0">
                <span className={`w-[7px] h-[7px] rounded-full mt-[6px] flex-shrink-0 ${dotColor[item.type]}`} />
                <span className="text-[12.5px] text-navy flex-1" dangerouslySetInnerHTML={{ __html: item.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                <span className="text-[11px] text-faint whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* This week table */}
      <Card title="This Week · 5 Active Joiners" noPad>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Name','Dept','Joined','Videos','Progress','Status'].map(h => (
                  <th key={h} className="px-[13px] py-[9px] text-left text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint bg-ground border-b border-bdr whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thisWeekJoiners.map((j) => (
                <tr key={j.id} className="hover:bg-[#F7FAFD]">
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground last:border-0">
                    <strong>{j.name}</strong>
                  </td>
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground">{j.dept}</td>
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground">{j.joinedDate}</td>
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground tabular">{j.videosWatched} / {j.totalVideos}</td>
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground min-w-[140px]">
                    <ProgressRow value={j.progress} />
                  </td>
                  <td className="px-[13px] py-[11px] text-[13px] border-b border-ground">
                    {statusPill(j.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
