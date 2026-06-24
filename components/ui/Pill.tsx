type PillVariant = 'green' | 'blue' | 'amber' | 'red' | 'grey'

const styles: Record<PillVariant, string> = {
  green: 'bg-kgreen-dim text-emerald-700',
  blue:  'bg-sky-dim text-blue-700',
  amber: 'bg-kamber-dim text-amber-800',
  red:   'bg-kred-dim text-red-700',
  grey:  'bg-ground text-muted',
}

export function Pill({ variant, children }: { variant: PillVariant; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-[7px] py-[2px] rounded-[3px] text-[11px] font-bold tracking-tight whitespace-nowrap ${styles[variant]}`}>
      {children}
    </span>
  )
}
