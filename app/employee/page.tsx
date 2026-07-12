import Link from 'next/link'
import { Shell } from '@/components/layout/Shell'
import { Home } from '@/components/employee/Home'
import { Materials } from '@/components/employee/Materials'
import { BatchChannel } from '@/components/employee/BatchChannel'
import { EmpDoubt } from '@/components/employee/EmpDoubt'
import { markJoinerLogin } from '@/lib/data/mark-login'

const TABS = ['home', 'materials', 'batch', 'doubt'] as const
type Tab = typeof TABS[number]

const TAB_LABELS: Record<Tab, string> = {
  home:      'Home',
  materials: 'My Materials',
  batch:     'Batch Channel',
  doubt:     'Doubt Session',
}

export default async function EmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; email?: string }>
}) {
  const { tab: rawTab, email } = await searchParams
  const tab: Tab = (TABS as readonly string[]).includes(rawTab ?? '') ? (rawTab as Tab) : 'home'

  if (email) markJoinerLogin(email).catch(() => {})

  return (
    <Shell isHR={false} activeTab={tab === 'home' ? '' : tab}>
      {/* Tab bar */}
      <div className="flex border-b border-bdr mb-5 -mt-1">
        {TABS.map((key) => (
          <Link
            key={key}
            href={key === 'home' ? '/employee' : `/employee?tab=${key}`}
            prefetch
            className={[
              'px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px no-underline transition-colors',
              tab === key
                ? 'text-navy border-sky font-bold'
                : 'text-muted border-transparent hover:text-navy',
            ].join(' ')}
          >
            {TAB_LABELS[key]}
          </Link>
        ))}
      </div>

      {tab === 'home'      && <Home />}
      {tab === 'materials' && <Materials />}
      {tab === 'batch'     && <BatchChannel />}
      {tab === 'doubt'     && <EmpDoubt />}
    </Shell>
  )
}
