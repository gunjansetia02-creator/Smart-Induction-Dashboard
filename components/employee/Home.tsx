import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'

const batchmates = [
  { initials: 'SP', name: 'Sneha Patel',  role: 'Finance',   color: '#27B882' },
  { initials: 'DS', name: 'Dev Sharma',   role: 'IT',        color: '#F4A622' },
  { initials: 'KN', name: 'Kavya Nair',   role: 'Marketing', color: '#E85A4A' },
  { initials: 'RG', name: 'Rohan Gupta',  role: 'Sales',     color: '#1B2D50' },
]

const checklist = [
  { label: 'Open your Induction Dashboard',  done: true,  active: false, badge: null },
  { label: 'Join the batch channel on Teams',done: true,  active: false, badge: null },
  { label: 'Introduce yourself to the batch',done: true,  active: false, badge: null },
  { label: 'Watch all induction materials',  done: false, active: true,  badge: { text: '2 / 4',  variant: 'blue' as const } },
  { label: 'Pass each quiz (70%+)',          done: false, active: false, badge: { text: '0 / 4',  variant: 'grey' as const } },
]

const PROGRESS = 60
const R = 37
const CIRC = 2 * Math.PI * R
const OFFSET = CIRC * (1 - PROGRESS / 100)

export function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-navy rounded-[6px] p-[22px_26px] flex items-center gap-[22px] mb-5">
        {/* Ring */}
        <div className="relative flex-shrink-0" style={{ width: 86, height: 86 }}>
          <svg width={86} height={86} viewBox="0 0 86 86" style={{ transform: 'rotate(-90deg)' }}>
            <circle fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={6} cx={43} cy={43} r={R} />
            <circle fill="none" stroke="#4A9BE8" strokeWidth={6} strokeLinecap="round"
              cx={43} cy={43} r={R}
              strokeDasharray={CIRC} strokeDashoffset={OFFSET}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-extrabold text-white tabular leading-none">{PROGRESS}%</span>
            <span className="text-[9px] text-white/50 tracking-[0.7px] uppercase mt-0.5">done</span>
          </div>
        </div>

        {/* Text */}
        <div>
          <h2 className="text-[17px] font-extrabold text-white mb-1">Welcome, Arjun!</h2>
          <p className="text-[13px] text-white/65 mb-2.5">
            You&apos;re 60% through your induction. Keep going — you&apos;re nearly there.
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold"
            style={{ background: 'rgba(74,155,232,0.2)', color: '#93D0FF' }}>
            Sales · Joined 23 Jun 2025
          </span>
        </div>

        {/* Date chips */}
        <div className="ml-auto flex flex-col gap-[9px] items-end">
          {[
            { label: 'Doubt-Clearing Call (Optional)', date: 'Mon 30 Jun · 12 PM' },
          ].map((d) => (
            <div key={d.label}
              className="rounded-[4px] py-[7px] px-[13px] text-right"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div className="text-[9.5px] text-white/45 tracking-[0.6px] uppercase mb-0.5">{d.label}</div>
              <div className="text-[12.5px] font-bold text-white">{d.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-col */}
      <div className="grid grid-cols-[1fr_260px] gap-[18px]">
        <Card title="My Induction Checklist">
          <div className="flex flex-col gap-[9px]">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-[11px] px-[13px] py-[10px] bg-ground rounded-[4px]">
                <div className={[
                  'w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0',
                  item.done   ? 'bg-kgreen text-white' :
                  item.active ? 'bg-sky text-white' :
                                'bg-bdr text-faint',
                ].join(' ')}>
                  {item.done ? '✓' : item.active ? '→' : '○'}
                </div>
                <span className={`flex-1 text-[13px] ${item.done ? 'text-muted line-through' : 'text-navy'}`}>
                  {item.label}
                </span>
                {item.badge && <Pill variant={item.badge.variant}>{item.badge.text}</Pill>}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card title="My Batch">
            <p className="text-[12px] text-muted mb-2.5">5 people joined with you this week</p>
            <div className="flex flex-col gap-2">
              {batchmates.map((b) => (
                <div key={b.initials} className="flex items-center gap-2.5 text-[13px]">
                  <div className="w-[25px] h-[25px] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                    style={{ background: b.color }}>
                    {b.initials}
                  </div>
                  <span>{b.name}</span>
                  <span className="text-muted text-[11.5px]">{b.role}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
              Open Teams Channel
            </button>
          </Card>

          <div className="bg-navy border border-navy rounded-[5px] p-[15px_17px]">
            <div className="text-[11px] text-white/50 tracking-[0.6px] uppercase mb-1">My Flagged Doubts</div>
            <div className="text-[30px] font-extrabold text-white tabular mb-1">1</div>
            <div className="text-[12.5px] text-white/60 mb-3">Sent to HR — reply pending, or raise it on Monday&apos;s call</div>
            <button className="w-full px-[10px] py-[5px] text-[11.5px] font-semibold rounded cursor-pointer hover:opacity-85"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              View My Doubt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
