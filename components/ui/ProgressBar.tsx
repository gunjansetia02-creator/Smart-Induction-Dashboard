export function ProgressBar({ value, color = 'sky' }: { value: number; color?: 'sky' | 'green' }) {
  return (
    <div className="h-1 bg-ground rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color === 'green' ? 'bg-kgreen' : 'bg-sky'}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function ProgressRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-[60px] h-1 bg-ground rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-sky" style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11.5px] text-muted tabular whitespace-nowrap">{value}%</span>
    </div>
  )
}
