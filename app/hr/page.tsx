import { Shell } from '@/components/layout/Shell'
import { Overview } from '@/components/hr/Overview'
import { Scheduler } from '@/components/hr/Scheduler'
import { Profiles } from '@/components/hr/Profiles'
import { DoubtSession } from '@/components/hr/DoubtSession'

const TABS = ['overview', 'scheduler', 'profiles', 'doubt'] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  overview:  'Overview',
  scheduler: 'Scheduler',
  profiles:  'New Joiners',
  doubt:     'Doubt Session',
}

export default async function HRPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: rawTab } = await searchParams
  const tab: Tab = (TABS as readonly string[]).includes(rawTab ?? '') ? (rawTab as Tab) : 'overview'

  return (
    <Shell isHR activeTab={tab === 'overview' ? '' : tab}>
      {/* Tab bar */}
      <div className="flex border-b border-bdr mb-5 -mt-1">
        {TABS.map((key) => (
          <a
            key={key}
            href={key === 'overview' ? '/hr' : `/hr?tab=${key}`}
            className={[
              'px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px no-underline transition-colors',
              tab === key
                ? 'text-navy border-sky font-bold'
                : 'text-muted border-transparent hover:text-navy',
            ].join(' ')}
          >
            {TAB_LABELS[key]}
          </a>
        ))}
      </div>

      {tab === 'overview'  && <Overview />}
      {tab === 'scheduler' && <Scheduler />}
      {tab === 'profiles'  && <Profiles />}
      {tab === 'doubt'     && <DoubtSession />}
    </Shell>
  )
}
