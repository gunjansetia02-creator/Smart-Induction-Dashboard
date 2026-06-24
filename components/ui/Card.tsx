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
    <div className={`bg-white border border-bdr rounded-[5px] overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-[17px] py-[13px] border-b border-bdr">
          <span className="text-[13px] font-bold text-navy">{title}</span>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPad ? '' : (bodyClass || 'p-[17px]')}>
        {children}
      </div>
    </div>
  )
}
