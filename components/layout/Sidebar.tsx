import Link from 'next/link'

const hrNav = [
  { label: 'Overview',      href: '/hr',                  badge: '' },
  { label: 'Scheduler',     href: '/hr?tab=scheduler',    badge: '' },
  { label: 'New Joiners',   href: '/hr?tab=profiles',     badge: '5' },
  { label: 'Materials',     href: '/hr?tab=materials',    badge: '' },
  { label: 'Doubt Session', href: '/hr?tab=doubt',        badge: '4' },
]

const empNav = [
  { label: 'Home',          href: '/employee',                badge: '' },
  { label: 'My Materials',  href: '/employee?tab=materials',  badge: '' },
  { label: 'Batch Channel', href: '/employee?tab=batch',      badge: '' },
  { label: 'Doubt Session', href: '/employee?tab=doubt',      badge: '' },
]

function navKey(href: string) {
  if (!href.includes('?')) return ''
  return href.split('tab=')[1] ?? ''
}

export function Sidebar({ isHR, activeTab }: { isHR: boolean; activeTab: string }) {
  const nav = isHR ? hrNav : empNav

  return (
    <aside className="w-[220px] bg-navy flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-[18px] py-[17px] border-b border-white/[0.07]">
        <div className="w-8 h-8 bg-sky rounded-[5px] flex items-center justify-center text-[15px] font-black text-white flex-shrink-0">
          K
        </div>
        <div>
          <div className="text-white text-[13px] font-semibold">Koenig Solutions</div>
          <div className="text-white/35 text-[10px] uppercase tracking-[0.7px]">Induction Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2.5">
        <div className="px-[18px] py-2 text-[10px] font-bold tracking-[1px] uppercase text-white/30">
          {isHR ? 'HR Admin' : 'My Induction'}
        </div>
        {nav.map((item) => {
          const itemKey = navKey(item.href)
          const isActive = itemKey === activeTab || (itemKey === '' && activeTab === '')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-2.5 px-[18px] py-[9px] text-[13.5px]',
                'border-l-[3px] transition-all no-underline',
                isActive
                  ? 'text-white border-sky bg-sky/[0.13] font-semibold'
                  : 'text-white/58 border-transparent hover:text-white/88 hover:bg-white/[0.05]',
              ].join(' ')}
            >
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
          {isHR ? 'GS' : 'AK'}
        </div>
        <div>
          <div className="text-white text-[12.5px] font-medium">
            {isHR ? 'Gunjan Setia' : 'Arjun Kapoor'}
          </div>
          <div className="text-white/38 text-[10.5px]">
            {isHR ? 'HR Executive' : 'Sales'}
          </div>
        </div>
      </div>
    </aside>
  )
}
