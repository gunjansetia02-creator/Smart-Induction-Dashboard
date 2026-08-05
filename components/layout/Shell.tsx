import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function Shell({
  children,
  isHR,
  activeTab,
  employeeEmail,
  employeeName,
}: {
  children: React.ReactNode
  isHR: boolean
  activeTab: string
  employeeEmail?: string
  employeeName?: string
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar isHR={isHR} activeTab={activeTab} employeeEmail={employeeEmail} employeeName={employeeName} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar isHR={isHR} activeTab={activeTab} employeeEmail={employeeEmail} />
        <main className="flex-1 p-6 bg-ground">{children}</main>
      </div>
    </div>
  )
}
