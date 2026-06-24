const stripes: Record<string, string> = {
  blue:  'bg-sky',
  green: 'bg-kgreen',
  amber: 'bg-kamber',
  red:   'bg-kred',
}

export function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: number | string
  sub: React.ReactNode
  color: 'blue' | 'green' | 'amber' | 'red'
}) {
  return (
    <div className="bg-white border border-bdr rounded-[5px] overflow-hidden relative">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${stripes[color]}`} />
      <div className="p-4 pt-5">
        <div className="text-[10.5px] font-bold tracking-[0.7px] uppercase text-faint mb-2">{label}</div>
        <div className="text-[34px] font-extrabold text-navy leading-none tabular mb-1">{value}</div>
        <div className="text-xs text-muted">{sub}</div>
      </div>
    </div>
  )
}
