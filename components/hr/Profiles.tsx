import { Pill } from '@/components/ui/Pill'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { joiners } from '@/lib/mock-data'
import type { JoinerStatus } from '@/lib/types'

function ringColor(s: JoinerStatus) {
  if (s === 'complete')    return '#27B882'
  if (s === 'in-progress') return '#4A9BE8'
  if (s === 'needs-nudge') return '#F4A622'
  if (s === 'behind')      return '#F4A622'
  return '#E85A4A'
}

function statusPill(s: JoinerStatus) {
  if (s === 'complete')    return <Pill variant="green">Complete</Pill>
  if (s === 'in-progress') return <Pill variant="blue">In Progress</Pill>
  if (s === 'needs-nudge') return <Pill variant="amber">Needs Nudge</Pill>
  if (s === 'behind')      return <Pill variant="amber">Behind</Pill>
  return <Pill variant="red">Not Started</Pill>
}

export function Profiles() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[14px] font-bold text-navy">New Joiner Profiles — June 2025</div>
          <div className="text-[12px] text-muted mt-0.5">Progress updates every 60 seconds · Last sync 2 min ago</div>
        </div>
        <div className="flex gap-2">
          <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
            Export CSV
          </button>
          <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
            Add Joiner
          </button>
        </div>
      </div>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))' }}>
        {joiners.map((j) => (
          <div
            key={j.id}
            className="bg-white border border-bdr rounded-[5px] p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:-translate-y-[2px] transition-all"
          >
            <div className="mb-3">
              <ProgressRing value={j.progress} color={ringColor(j.status)} size={70} />
            </div>
            <div className="text-[13px] font-bold text-navy mb-0.5">{j.name}</div>
            <div className="text-[11.5px] text-muted mb-2.5">{j.dept}</div>
            {statusPill(j.status)}
            <div className="text-[11px] text-faint mt-2">
              {j.joinedDate} · {j.videosWatched}/{j.totalVideos} videos
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
