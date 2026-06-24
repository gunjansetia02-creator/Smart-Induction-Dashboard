import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function Shell({
  children,
  isHR,
  activeTab,
}: {
  children: React.ReactNode
  isHR: boolean
  activeTab: string
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar isHR={isHR} activeTab={activeTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar isHR={isHR} activeTab={activeTab} />
        <main className="flex-1 p-6 bg-ground">{children}</main>
      </div>
    </div>
  )
}
