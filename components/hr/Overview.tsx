import { KpiCard }    from '@/components/ui/KpiCard'
import { Card }       from '@/components/ui/Card'
import { Pill }       from '@/components/ui/Pill'
import { ProgressRow } from '@/components/ui/ProgressBar'
import { TrendChart } from './TrendChart'
import { feedItems }  from '@/lib/mock-data'
import { getRecentJoiners, getThisWeekJoiners } from '@/lib/data/get-joiners'
import type { JoinerStatus } from '@/lib/types'

const dotColor: Record<string, string> = {
  green: 'bg-kgreen', blue: 'bg-sky', amber: 'bg-kamber',
}

function statusPill(s: JoinerStatus) {
  if (s === 'complete')    return <Pill variant="green">Complete</Pill>
  if (s === 'in-progress') return <Pill variant="blue">In Progress</Pill>
  if (s === 'needs-nudge') return <Pill variant="amber">Needs Nudge</Pill>
  if (s === 'behind')      return <Pill variant="amber">Behind</Pill>
  return <Pill variant="red">Not Started</Pill>
}

export async function Overview() {
  const [allJoiners, weekJoiners] = await Promise.all([
    getRecentJoiners(30),
    getThisWeekJoiners(),
  ])

  const thisMonth  = allJoiners.length
  const complete   = allJoiners.filter(j => j.status === 'complete').length
  const pending    = allJoiners.filter(j => j.status !== 'complete').length
  const needsAction = allJoiners.filter(j => j.status === 'not-started' || j.emailStatus === 'bounced').length
  const completionPct = thisMonth > 0 ? Math.round((complete / thisMonth) * 100) : 0

  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-[14px] mb-5">
        <KpiCard color="blue"  icon="👥" label={`Joiners — ${monthLabel}`} value={thisMonth}     sub="From PMS · live data" />
        <KpiCard color="green" icon="✅" label="Inductions Complete"        value={complete}      sub={`${completionPct}% completion rate`} />
        <KpiCard color="amber" icon="⏳" label="Pending"                    value={pending}       sub={`${allJoiners.filter(j=>j.status==='in-progress').length} in progress · ${allJoiners.filter(j=>j.status==='not-started').length} not started`} />
        <KpiCard color="red"   icon="⚠️" label="Needs Attention"            value={needsAction}   sub="Not started or email bounced" />
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
      <Card title={`This Week · ${weekJoiners.length} Active Joiner${weekJoiners.length !== 1 ? 's' : ''}`} noPad>
        {weekJoiners.length === 0 ? (
          <p className="px-[13px] py-5 text-[13px] text-muted">No new joiners this week yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Name','Dept','Joined','Videos','Progress','Status'].map(h => (
                    <th key={h} className="px-[13px] py-[10px] text-left text-[10.5px] font-bold tracking-[0.6px] uppercase text-white/70 bg-navy whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekJoiners.map((j) => (
                  <tr key={j.id} className="hover:bg-[#F7FAFD] transition-colors">
                    <td className="px-[13px] py-[11px] text-[13px] border-b border-ground"><strong>{j.name}</strong></td>
                    <td className="px-[13px] py-[11px] text-[13px] border-b border-ground">{j.dept}</td>
                    <td className="px-[13px] py-[11px] text-[13px] border-b border-ground">{j.joinedDate}</td>
                    <td className="px-[13px] py-[11px] text-[13px] border-b border-ground tabular">{j.videosWatched} / {j.totalVideos}</td>
                    <td className="px-[13px] py-[11px] text-[13px] border-b border-ground min-w-[140px]">
                      <ProgressRow value={j.progress} />
                    </td>
                    <td className="px-[13px] py-[11px] text-[13px] border-b border-ground">{statusPill(j.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
