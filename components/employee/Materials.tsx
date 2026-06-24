import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { materials } from '@/lib/mock-data'
import type { Material } from '@/lib/types'

function statusPill(m: Material) {
  if (m.status === 'complete')     return <Pill variant="green">{m.type === 'pdf' ? 'Read' : 'Watched'}</Pill>
  if (m.status === 'in-progress')  return <Pill variant="blue">{m.progress}% watched</Pill>
  return <Pill variant="grey">Not started</Pill>
}

function iconBg(m: Material) {
  if (m.status === 'complete')    return 'bg-kgreen-dim text-kgreen'
  if (m.status === 'in-progress') return 'bg-sky text-white'
  if (m.type === 'pdf')           return 'bg-kamber-dim text-kamber'
  return 'bg-sky-dim text-sky'
}

export function Materials() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[14px] font-bold text-navy">My Materials</div>
          <div className="text-[12px] text-muted mt-0.5">4 videos · 2 documents · 60% complete</div>
        </div>
      </div>

      <Card noPad>
        <div className="px-[17px]">
          {materials.map((m) => {
            const isActive = m.status === 'in-progress'
            return (
              <div
                key={m.id}
                className={`flex items-center gap-[13px] py-[13px] border-b border-ground last:border-0 ${isActive ? 'bg-[#F7FAFD] -mx-[17px] px-[17px]' : ''}`}
              >
                {/* Icon */}
                <div className={`w-[38px] h-[38px] rounded-[4px] flex items-center justify-center text-[16px] flex-shrink-0 ${iconBg(m)}`}>
                  {m.type === 'pdf' ? '📄' : '▶'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-navy truncate">{m.title}</div>
                  <div className="flex items-center gap-[9px] text-[11.5px] text-muted mt-0.5 flex-wrap">
                    <span>{m.type === 'pdf' ? 'PDF' : 'Video'} · {m.duration}</span>
                    {statusPill(m)}
                    {isActive && m.resumeAt && (
                      <span className="text-sky">Resume at {m.resumeAt}</span>
                    )}
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={m.progress} color={m.status === 'complete' ? 'green' : 'sky'} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  {m.status === 'complete' && (
                    <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
                      {m.type === 'pdf' ? 'Open' : 'Rewatch'}
                    </button>
                  )}
                  {m.status === 'in-progress' && (
                    <>
                      <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
                        Continue
                      </button>
                      <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-kred-dim text-red-700 rounded cursor-pointer hover:opacity-85">
                        Flag Doubt
                      </button>
                    </>
                  )}
                  {m.status === 'not-started' && (
                    <>
                      <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
                        {m.type === 'pdf' ? 'Open' : 'Watch'}
                      </button>
                      <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
                        Flag Doubt
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
