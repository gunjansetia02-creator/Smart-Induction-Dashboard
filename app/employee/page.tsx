import Link from 'next/link'
import { Shell } from '@/components/layout/Shell'
import { Home } from '@/components/employee/Home'
import { Materials } from '@/components/employee/Materials'
import { BatchChannel } from '@/components/employee/BatchChannel'
import { EmpDoubt } from '@/components/employee/EmpDoubt'
import { WelcomeGuideModal } from '@/components/employee/WelcomeGuideModal'
import { markJoinerLogin } from '@/lib/data/mark-login'
import { getJoinerByEmail } from '@/lib/data/get-joiners'

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

  const [isFirstVisit, joiner] = await Promise.all([
    email ? markJoinerLogin(email).catch(() => false) : Promise.resolve(false),
    email ? getJoinerByEmail(email) : Promise.resolve(null),
  ])
  const employeeEmail = email || undefined
  const employeeName = joiner?.name || undefined

  return (
    <Shell isHR={false} activeTab={tab === 'home' ? '' : tab}>
      {isFirstVisit && <WelcomeGuideModal />}

      {/* Tab bar — carries ?email= across tabs so a real joiner's identity
          doesn't get lost the moment they navigate away from Home */}
      <div className="flex border-b border-bdr mb-5 -mt-1">
        {TABS.map((key) => {
          const params = new URLSearchParams()
          if (key !== 'home') params.set('tab', key)
          if (email) params.set('email', email)
          const qs = params.toString()
          return (
            <Link
              key={key}
              href={qs ? `/employee?${qs}` : '/employee'}
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
          )
        })}
      </div>

      {tab === 'home'      && <Home employeeEmail={employeeEmail} employeeName={employeeName} joiner={joiner} />}
      {tab === 'materials' && <Materials employeeEmail={employeeEmail} employeeName={employeeName} />}
      {tab === 'batch'     && <BatchChannel />}
      {tab === 'doubt'     && <EmpDoubt employeeEmail={employeeEmail} employeeName={employeeName} />}
    </Shell>
  )
}
