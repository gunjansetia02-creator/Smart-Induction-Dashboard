import Link from 'next/link'

const hrNav = [
  { label: 'Overview',      href: '/hr',                  badge: '', icon: '📊' },
  { label: 'Scheduler',     href: '/hr?tab=scheduler',    badge: '', icon: '📅' },
  { label: 'New Joiners',   href: '/hr?tab=profiles',     badge: '5', icon: '🧑‍💼' },
  { label: 'Materials',     href: '/hr?tab=materials',    badge: '', icon: '🎬' },
  { label: 'Doubt Session', href: '/hr?tab=doubt',        badge: '4', icon: '💬' },
  { label: 'Feedback',      href: '/hr?tab=feedback',     badge: '', icon: '📝' },
]

const empNavBase = [
  { label: 'Home',          tab: '',           badge: '', icon: '🏠' },
  { label: 'My Materials',  tab: 'materials',  badge: '', icon: '🎬' },
  { label: 'Batch Channel', tab: 'batch',      badge: '', icon: '👋' },
  { label: 'Doubt Session', tab: 'doubt',      badge: '', icon: '💬' },
]

function navKey(href: string) {
  if (!href.includes('?')) return ''
  return href.split('tab=')[1]?.split('&')[0] ?? ''
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'NJ'
}

export function Sidebar({
  isHR,
  activeTab,
  employeeEmail,
  employeeName,
}: {
  isHR: boolean
  activeTab: string
  // Real employees only — without this, every sidebar click (the primary
  // nav) drops back to /employee with no ?email=, silently falling through
  // to the demo account default and misattributing everything they do next.
  employeeEmail?: string
  employeeName?: string
}) {
  const nav = isHR
    ? hrNav
    : empNavBase.map(item => ({
        label: item.label,
        badge: item.badge,
        icon: item.icon,
        href: employeeEmail
          ? `/employee?${new URLSearchParams({ ...(item.tab ? { tab: item.tab } : {}), email: employeeEmail }).toString()}`
          : item.tab ? `/employee?tab=${item.tab}` : '/employee',
      }))

  return (
    <aside className="w-[224px] bg-navy flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-[18px] py-[17px] border-b border-white/[0.07]">
        <div className="w-8 h-8 bg-gradient-to-br from-sky to-[#2f6fc4] rounded-[8px] flex items-center justify-center text-[15px] font-black text-white flex-shrink-0 shadow-[0_2px_6px_rgba(74,155,232,0.4)]">
          K
        </div>
        <div>
          <div className="text-white text-[13px] font-semibold">Koenig Solutions</div>
          <div className="text-white/35 text-[10px] uppercase tracking-[0.7px]">Induction Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5">
        <div className="px-[10px] py-2 text-[10px] font-bold tracking-[1px] uppercase text-white/30">
          {isHR ? 'HR Admin' : 'My Induction'}
        </div>
        {nav.map((item) => {
          const itemKey = navKey(item.href)
          const isActive = itemKey === activeTab || (itemKey === '' && activeTab === '')
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={[
                'flex items-center gap-2.5 px-[12px] py-[9px] my-[1px] text-[13.5px] rounded-[8px]',
                'transition-all no-underline',
                isActive
                  ? 'text-white bg-white/[0.12] font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                  : 'text-white/58 hover:text-white/88 hover:bg-white/[0.05]',
              ].join(' ')}
            >
              <span className="text-[14px] leading-none flex-shrink-0">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-kamber text-navy text-[10px] font-black px-1.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-[18px] py-3.5 border-t border-white/[0.07] flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-full bg-sky flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
          {isHR ? 'GS' : initialsOf(employeeName || 'New Joiner')}
        </div>
        <div>
          <div className="text-white text-[12.5px] font-medium">
            {isHR ? 'Gunjan Setia' : (employeeName || 'New Joiner')}
          </div>
          <div className="text-white/38 text-[10.5px]">
            {isHR ? 'HR Executive' : 'New Joiner'}
          </div>
        </div>
        {isHR && (
          <a href="/api/hr-logout" className="ml-auto text-[11px] text-white/50 hover:text-white no-underline" title="Sign out of the HR dashboard">
            Sign out
          </a>
        )}
      </div>
    </aside>
  )
}
