const palette: Record<string, { bg: string; text: string; ring: string }> = {
  blue:  { bg: 'bg-sky-dim',    text: 'text-sky',    ring: 'bg-sky' },
  green: { bg: 'bg-kgreen-dim', text: 'text-kgreen', ring: 'bg-kgreen' },
  amber: { bg: 'bg-kamber-dim', text: 'text-kamber', ring: 'bg-kamber' },
  red:   { bg: 'bg-kred-dim',   text: 'text-kred',   ring: 'bg-kred' },
}

export function KpiCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string
  value: number | string
  sub: React.ReactNode
  color: 'blue' | 'green' | 'amber' | 'red'
  icon?: string
}) {
  const p = palette[color]
  return (
    <div className="bg-white border border-bdr rounded-[10px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden relative hover:-translate-y-[1px] hover:shadow-[0_4px_10px_rgba(16,24,40,0.08)] transition-all">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${p.ring}`} />
      <div className="p-4 pt-5">
        <div className="flex items-start justify-between mb-2">
          <div className="text-[10.5px] font-bold tracking-[0.7px] uppercase text-faint">{label}</div>
          {icon && (
            <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-[15px] flex-shrink-0 ${p.bg} ${p.text}`}>
              {icon}
            </div>
          )}
        </div>
        <div className="text-[34px] font-extrabold text-navy leading-none tabular mb-1.5">{value}</div>
        <div className="text-xs text-muted">{sub}</div>
      </div>
    </div>
  )
}
