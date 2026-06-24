type Variant = 'primary' | 'navy' | 'ghost' | 'green' | 'danger' | 'warn'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  primary: 'bg-sky text-white hover:opacity-85',
  navy:    'bg-navy text-white hover:opacity-85',
  ghost:   'bg-white text-navy border border-bdr hover:opacity-85',
  green:   'bg-kgreen text-white hover:opacity-85',
  danger:  'bg-kred-dim text-red-700 hover:opacity-85',
  warn:    'bg-kamber-dim text-amber-800 hover:opacity-85',
}

const sizes: Record<Size, string> = {
  sm: 'px-[10px] py-[5px] text-[11.5px] rounded',
  md: 'px-[14px] py-[7px] text-[12.5px] rounded-[4px]',
}

export function Button({
  variant = 'ghost',
  size = 'md',
  children,
  onClick,
  className = '',
}: {
  variant?: Variant
  size?: Size
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold cursor-pointer border-0 transition-opacity ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
