'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pill }        from '@/components/ui/Pill'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { PmsSyncStatus } from './PmsSyncStatus'
import { DateRangeFilter, type DateRange } from './DateRangeFilter'
import { WelcomeKitButton } from './WelcomeKitButton'
import { JoinerDetailModal } from './JoinerDetailModal'
import type { Joiner, JoinerStatus } from '@/lib/types'
import type { JoinerStatusEntry } from '@/app/api/joiners/status/route'

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

// Real induction status, derived from actual material/doubt completion —
// never from days-since-DOJ, which showed "100% complete" for people who
// hadn't opened a single material.
function statusFromEntry(s: JoinerStatusEntry | undefined): JoinerStatus {
  if (!s) return 'not-started'
  if (s.inductionComplete) return 'complete'
  if (s.openDoubts > 0) return 'needs-nudge'
  if (s.materialsPercent > 0) return 'in-progress'
  return 'not-started'
}

function StatusChips({ s }: { s: JoinerStatusEntry | undefined }) {
  if (!s) return <div className="text-[10px] text-faint mt-2">Loading status…</div>
  return (
    <div className="flex flex-wrap justify-center gap-1 mt-2">
      <span className={`text-[9.5px] font-semibold px-1.5 py-[2px] rounded ${s.welcomeEmailSent ? 'bg-kgreen-dim text-emerald-700' : 'bg-ground text-faint'}`}>
        ✉️ {s.welcomeEmailSent ? 'Invited' : 'No Invite'}
      </span>
      <span className={`text-[9.5px] font-semibold px-1.5 py-[2px] rounded ${s.loggedIn ? 'bg-kgreen-dim text-emerald-700' : 'bg-kamber-dim text-amber-800'}`}>
        🔑 {s.loggedIn ? 'Logged In' : 'Not Yet'}
      </span>
      <span className="text-[9.5px] font-semibold px-1.5 py-[2px] rounded bg-sky-dim text-blue-700">
        🎬 {s.materialsPercent}%
      </span>
      <span className={`text-[9.5px] font-semibold px-1.5 py-[2px] rounded ${s.openDoubts > 0 ? 'bg-kamber-dim text-amber-800' : 'bg-ground text-faint'}`}>
        💬 {s.openDoubts > 0 ? `${s.openDoubts} Open` : 'No Doubts'}
      </span>
      {s.inductionComplete && (
        <span className="text-[9.5px] font-semibold px-1.5 py-[2px] rounded bg-kgreen-dim text-emerald-700">🎉 Done</span>
      )}
    </div>
  )
}

export function ProfilesClient({
  joiners,
  live,
  error,
  hrEmail,
}: {
  joiners: Joiner[]
  live: boolean
  error?: string
  hrEmail: string
}) {
  // 'pending' until DateRangeFilter's mount effect supplies the real default
  // range. Must NOT compute a Date-based range here: that runs during SSR too,
  // and the server (UTC on Vercel) and the client (the visitor's local time)
  // can disagree on which joiners fall in range, corrupting hydration for the
  // whole list. 'pending' keeps the first render identical on both sides and
  // — as a bonus — avoids ever rendering the full unfiltered 500+ joiner list.
  const [range, setRange] = useState<DateRange | 'pending'>('pending')
  const [rangeLabel, setRangeLabel] = useState('Loading…')
  const [statuses, setStatuses] = useState<Record<string, JoinerStatusEntry>>({})
  const [selected, setSelected] = useState<Joiner | null>(null)

  const filtered = useMemo(() => {
    if (range === 'pending') return []
    if (!range) return joiners
    return joiners.filter(j => {
      const d = new Date(j.doj)
      return d >= range.from && d <= range.to
    })
  }, [joiners, range])

  // Batched status fetch — one request for the whole visible set, not one per card
  useEffect(() => {
    const emails = filtered.map(j => j.email).filter(Boolean)
    if (emails.length === 0) return
    fetch('/api/joiners/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails }),
    })
      .then(r => r.json())
      .then(d => setStatuses(prev => ({ ...prev, ...(d.statuses ?? {}) })))
      .catch(() => {})
  }, [filtered])

  return (
    <div>
      <PmsSyncStatus live={live} error={error} />

      <DateRangeFilter initialPreset="30d" onChange={(r, label) => { setRange(r); setRangeLabel(label) }} />

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <div className="text-[14px] font-bold text-navy">New Joiner Profiles</div>
          <div className="text-[12px] text-muted mt-0.5">
            {range === 'pending'
              ? 'Loading…'
              : `${filtered.length} joiner${filtered.length !== 1 ? 's' : ''} · ${rangeLabel} · ${live ? 'Live data from PMS' : 'Demo data (PMS unreachable)'}`}
          </div>
        </div>
        <div className="flex gap-2">
          <WelcomeKitButton joiners={filtered} live={live} hrEmail={hrEmail} />
          <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
            Export CSV
          </button>
          <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
            Add Joiner
          </button>
        </div>
      </div>

      {range === 'pending' ? (
        <div className="text-center py-16 text-muted text-[13px]">Loading joiners…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-[13px]">No joiners match this date range.</div>
      ) : (
        <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
          {filtered.map((j) => {
            const s = statuses[j.email]
            const displayStatus = statusFromEntry(s)
            return (
              <div
                key={j.id}
                onClick={() => setSelected(j)}
                className="bg-white border border-bdr rounded-[10px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-[0_4px_10px_rgba(16,24,40,0.08)] hover:-translate-y-[2px] transition-all"
              >
                <div className="mb-3">
                  <ProgressRing value={s ? s.materialsPercent : 0} color={s ? ringColor(displayStatus) : '#C7D0DE'} size={70} />
                </div>
                <div className="text-[13px] font-bold text-navy mb-0.5">{j.name}</div>
                <div className="text-[11.5px] text-muted mb-2.5">{j.designation}</div>
                {s ? statusPill(displayStatus) : <Pill variant="grey">Loading…</Pill>}
                <div className="text-[11px] text-faint mt-2" title={`Date of Joining: ${j.joinedDate}`}>
                  DOJ: {j.joinedDate} · {s ? `${s.materialsComplete}/${s.materialsTotal}` : '…'} materials
                </div>
                <StatusChips s={s} />
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <JoinerDetailModal joiner={selected} status={statuses[selected.email] ?? null} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
