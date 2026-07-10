'use client'

import { useEffect, useRef, useState } from 'react'

export type DateRange = { from: Date; to: Date } | null

type PresetKey = '7d' | '14d' | '21d' | '30d' | 'all' | 'custom'

const PRESETS: { key: PresetKey; label: string; shortLabel: string; days?: number }[] = [
  { key: '7d',  label: 'Last 7 Days',  shortLabel: '7D',  days: 7  },
  { key: '14d', label: 'Last 14 Days', shortLabel: '14D', days: 14 },
  { key: '21d', label: 'Last 21 Days', shortLabel: '21D', days: 21 },
  { key: '30d', label: 'Last Month',   shortLabel: '1M',  days: 30 },
  { key: 'all', label: 'All Time',     shortLabel: 'All' },
]

function startOfDay(d: Date) { const c = new Date(d); c.setHours(0, 0, 0, 0); return c }
function endOfDay(d: Date)   { const c = new Date(d); c.setHours(23, 59, 59, 999); return c }

export function DateRangeFilter({
  onChange,
  initialPreset = 'all',
}: {
  onChange: (range: DateRange, label: string) => void
  initialPreset?: PresetKey
}) {
  const [preset, setPreset] = useState<PresetKey>(initialPreset)
  const [customOpen, setCustomOpen] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setCustomOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Fire the initial preset once on mount so the parent's filtered list matches the highlighted button
  useEffect(() => {
    applyPreset(initialPreset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyPreset(key: PresetKey) {
    setPreset(key)
    setCustomOpen(false)
    const def = PRESETS.find(p => p.key === key)
    if (!def?.days) {
      onChange(null, 'All Time')
      return
    }
    const to = endOfDay(new Date())
    const from = startOfDay(new Date(Date.now() - (def.days - 1) * 86_400_000))
    onChange({ from, to }, def.label)
  }

  function applyCustom() {
    if (!customFrom || !customTo) return
    const from = startOfDay(new Date(customFrom))
    const to = endOfDay(new Date(customTo))
    if (from > to) return
    setPreset('custom')
    setCustomOpen(false)
    const label = `${from.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${to.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    setCustomLabel(label)
    onChange({ from, to }, label)
  }

  return (
    <div className="bg-white border border-bdr rounded-[10px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] p-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-faint mr-1 flex items-center gap-1">📅 Filter by Join Date</span>

        <div className="flex gap-1.5 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className={[
                'px-[13px] py-[7px] text-[12.5px] font-semibold rounded-full cursor-pointer transition-all whitespace-nowrap',
                preset === p.key
                  ? 'bg-sky text-white shadow-[0_2px_6px_rgba(74,155,232,0.4)]'
                  : 'bg-ground text-navy hover:bg-sky-dim',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}

          <div className="relative" ref={popRef}>
            <button
              onClick={() => setCustomOpen(o => !o)}
              className={[
                'px-[13px] py-[7px] text-[12.5px] font-semibold rounded-full cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5',
                preset === 'custom'
                  ? 'bg-sky text-white shadow-[0_2px_6px_rgba(74,155,232,0.4)]'
                  : 'bg-ground text-navy hover:bg-sky-dim',
              ].join(' ')}
            >
              {preset === 'custom' ? customLabel : 'Custom Range ▾'}
            </button>

            {customOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[240px] bg-white border border-bdr rounded-[8px] shadow-lg p-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[11.5px] text-muted flex flex-col gap-1">
                    From
                    <input
                      type="date"
                      value={customFrom}
                      max={customTo || undefined}
                      onChange={e => setCustomFrom(e.target.value)}
                      className="border border-bdr rounded px-2 py-1 text-[12.5px]"
                    />
                  </label>
                  <label className="text-[11.5px] text-muted flex flex-col gap-1">
                    To
                    <input
                      type="date"
                      value={customTo}
                      min={customFrom || undefined}
                      onChange={e => setCustomTo(e.target.value)}
                      className="border border-bdr rounded px-2 py-1 text-[12.5px]"
                    />
                  </label>
                  <button
                    onClick={applyCustom}
                    disabled={!customFrom || !customTo}
                    className="mt-1 px-[10px] py-[6px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
