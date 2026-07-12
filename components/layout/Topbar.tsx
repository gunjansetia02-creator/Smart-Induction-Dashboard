import Link from 'next/link'

const hrTitles: Record<string, string> = {
  '':          'Induction Overview',
  scheduler:   'Induction Scheduler',
  profiles:    'New Joiner Profiles',
  materials:   'Induction Materials',
  doubt:       'Doubt Session',
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
    <header className="bg-white border-b border-bdr h-[56px] flex items-center gap-4 px-6 sticky top-0 z-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="w-[3px] h-6 rounded-full bg-gradient-to-b from-sky to-navy" />
      <div className="flex-1 text-[15px] font-extrabold text-navy">{title}</div>
      <div className="flex bg-ground border border-bdr rounded-full p-0.5 gap-0.5">
        <Link
          href="/hr"
          className={[
            'px-3.5 py-1 rounded-full text-[12.5px] font-medium no-underline transition-all',
            isHR ? 'bg-navy text-white' : 'text-muted hover:text-navy',
          ].join(' ')}
        >
          HR Admin
        </Link>
        <Link
          href="/employee"
          className={[
            'px-3.5 py-1 rounded-full text-[12.5px] font-medium no-underline transition-all',
            !isHR ? 'bg-navy text-white' : 'text-muted hover:text-navy',
          ].join(' ')}
        >
          Employee View
        </Link>
      </div>
    </header>
  )
}
