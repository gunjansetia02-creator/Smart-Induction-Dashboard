export function Card({
  title,
  action,
  children,
  className = '',
  bodyClass = '',
  noPad = false,
}: {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClass?: string
  noPad?: boolean
}) {
  return (
    <div className={`bg-white border border-bdr rounded-[10px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.06)] overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-bdr bg-white">
          <span className="text-[13px] font-bold text-navy">{title}</span>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPad ? '' : (bodyClass || 'p-[18px]')}>
        {children}
      </div>
    </div>
  )
}
