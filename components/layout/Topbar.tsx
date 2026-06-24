import Link from 'next/link'

const hrTitles: Record<string, string> = {
  '':          'Induction Overview',
  scheduler:   'Induction Scheduler',
  profiles:    'New Joiner Profiles',
  doubt:       'Friday Doubt Session',
}

const empTitles: Record<string, string> = {
  '':          'My Induction',
  materials:   'My Materials',
  batch:       'Batch Channel',
  doubt:       'My Doubt Session',
}

export function Topbar({ isHR, activeTab }: { isHR: boolean; activeTab: string }) {
  const title = isHR ? (hrTitles[activeTab] ?? 'Dashboard') : (empTitles[activeTab] ?? 'My Induction')

  return (
    <header className="bg-white border-b border-bdr h-[54px] flex items-center gap-4 px-6 sticky top-0 z-10">
      <div className="flex-1 text-[15px] font-extrabold text-navy">{title}</div>
      <div className="flex bg-ground border border-bdr rounded p-0.5 gap-0.5">
        <Link
          href="/hr"
          className={[
            'px-3.5 py-1 rounded text-[12.5px] font-medium no-underline transition-all',
            isHR ? 'bg-navy text-white' : 'text-muted hover:text-navy',
          ].join(' ')}
        >
          HR Admin
        </Link>
        <Link
          href="/employee"
          className={[
            'px-3.5 py-1 rounded text-[12.5px] font-medium no-underline transition-all',
            !isHR ? 'bg-navy text-white' : 'text-muted hover:text-navy',
          ].join(' ')}
        >
          Employee View
        </Link>
      </div>
    </header>
  )
}
