'use client'

import { useEffect, useRef, useState } from 'react'

export type DateRange = { from: Date; to: Date } | null

type PresetKey = '7d' | '14d' | '30d' | '90d' | 'all' | 'custom'

const PRESETS: { key: PresetKey; label: string; days?: number }[] = [
  { key: '7d',  label: 'Last 7 Days'  , days: 7  },
  { key: '14d', label: 'Last 2 Weeks' , days: 14 },
  { key: '30d', label: 'Last Month'   , days: 30 },
  { key: '90d', label: 'Last Quarter' , days: 90 },
  { key: 'all', label: 'All Time' },
]

function startOfDay(d: Date) { const c = new Date(d); c.setHours(0, 0, 0, 0); return c }
function endOfDay(d: Date)   { const c = new Date(d); c.setHours(23, 59, 59, 999); return c }

export function DateRangeFilter({ onChange }: { onChange: (range: DateRange, label: string) => void }) {
  const [open, setOpen] = useState(false)
  const [preset, setPreset] = useState<PresetKey>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function applyPreset(key: PresetKey) {
    setPreset(key)
    setOpen(false)
    const def = PRESETS.find(p => p.key === key)
    if (!def?.days) { onChange(null, 'All Time'); return }
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
    setOpen(false)
    const label = `${from.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${to.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    setCustomLabel(label)
    onChange({ from, to }, label)
  }

  const triggerLabel = preset === 'custom' ? customLabel : (PRESETS.find(p => p.key === preset)?.label ?? 'All Time')

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85 flex items-center gap-1.5 whitespace-nowrap"
      >
        📅 {triggerLabel}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[250px] bg-white border border-bdr rounded-[6px] shadow-lg p-3">
          <div className="text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint mb-2">Quick Ranges</div>
          <div className="flex flex-col gap-1 mb-3">
            {PRESETS.map(p => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                className={[
                  'text-left px-[10px] py-[6px] text-[12.5px] rounded cursor-pointer',
                  preset === p.key ? 'bg-sky text-white font-semibold' : 'hover:bg-ground text-navy',
                ].join(' ')}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-ground">
            <div className="text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint mb-2">Custom Range</div>
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
        </div>
      )}
    </div>
  )
}
