'use client'

import { useMemo, useState } from 'react'
import { Pill }        from '@/components/ui/Pill'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { PmsSyncStatus } from './PmsSyncStatus'
import { DateRangeFilter, type DateRange } from './DateRangeFilter'
import type { Joiner, JoinerStatus } from '@/lib/types'

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

export function ProfilesClient({
  joiners,
  live,
  error,
}: {
  joiners: Joiner[]
  live: boolean
  error?: string
}) {
  const [range, setRange] = useState<DateRange>(null)
  const [rangeLabel, setRangeLabel] = useState('All Time')

  const filtered = useMemo(() => {
    if (!range) return joiners
    return joiners.filter(j => {
      const d = new Date(j.doj)
      return d >= range.from && d <= range.to
    })
  }, [joiners, range])

  return (
    <div>
      <PmsSyncStatus live={live} error={error} />

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <div className="text-[14px] font-bold text-navy">New Joiner Profiles</div>
          <div className="text-[12px] text-muted mt-0.5">
            {filtered.length} joiner{filtered.length !== 1 ? 's' : ''} · {rangeLabel} · {live ? 'Live data from PMS' : 'Demo data (PMS unreachable)'}
          </div>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter onChange={(r, label) => { setRange(r); setRangeLabel(label) }} />
          <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
            Export CSV
          </button>
          <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
            Add Joiner
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-[13px]">No joiners match this date range.</div>
      ) : (
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))' }}>
          {filtered.map((j) => (
            <div
              key={j.id}
              className="bg-white border border-bdr rounded-[5px] p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:-translate-y-[2px] transition-all"
            >
              <div className="mb-3">
                <ProgressRing value={j.progress} color={ringColor(j.status)} size={70} />
              </div>
              <div className="text-[13px] font-bold text-navy mb-0.5">{j.name}</div>
              <div className="text-[11.5px] text-muted mb-2.5">{j.designation}</div>
              {statusPill(j.status)}
              <div className="text-[11px] text-faint mt-2" title={`Date of Joining: ${j.joinedDate}`}>
                DOJ: {j.joinedDate} · {j.videosWatched}/{j.totalVideos} videos
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
