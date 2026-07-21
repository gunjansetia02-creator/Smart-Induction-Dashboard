import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { getJoinerStatuses } from '@/lib/data/get-joiner-statuses'
import { getBatchmates } from '@/lib/data/get-batchmates'
import type { Joiner } from '@/lib/types'
import { DEMO_EMPLOYEE_EMAIL, DEMO_EMPLOYEE_NAME } from './Materials'

const AVATAR_COLORS = ['#4A9BE8', '#27B882', '#F4A622', '#E85A4A', '#1B2D50', '#6B7A99']

const R = 37
const CIRC = 2 * Math.PI * R

// Same "push late-week joiners to the following Monday" rule as
// lib/automation/welcome-email.ts, so the date shown here matches what was
// emailed and what the real Teams invite is for.
function nextMondayLabel(): string {
  const d = new Date()
  const day = d.getDay()
  let days = day === 1 ? 7 : (8 - day) % 7 || 7
  if (days < 4) days += 7
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export async function Home({
  employeeEmail = DEMO_EMPLOYEE_EMAIL,
  employeeName = DEMO_EMPLOYEE_NAME,
  joiner,
}: {
  employeeEmail?: string
  employeeName?: string
  joiner?: Joiner | null
} = {}) {
  const [statuses, batchmates] = await Promise.all([
    getJoinerStatuses([employeeEmail]),
    joiner ? getBatchmates(joiner, 4) : Promise.resolve([]),
  ])
  const s = statuses[employeeEmail]

  const firstName = employeeName.split(' ')[0]
  const progress = s?.materialsPercent ?? 0
  const offset = CIRC * (1 - progress / 100)
  const materialsLabel = s ? `${s.materialsComplete} / ${s.materialsTotal}` : '0 / 0'
  const materialsDone = s ? s.materialsComplete === s.materialsTotal && s.materialsTotal > 0 : false
  const openDoubts = s?.openDoubts ?? 0
  const materialsBadgeVariant: 'green' | 'blue' = materialsDone ? 'green' : 'blue'

  const checklist = [
    { label: 'Open your Induction Dashboard',  done: true,  active: false, badge: null },
    { label: 'Join the batch channel on Teams',done: true,  active: false, badge: null },
    { label: 'Introduce yourself to the batch',done: true,  active: false, badge: null },
    { label: 'Complete all materials & quizzes (70%+)', done: materialsDone, active: !materialsDone, badge: { text: materialsLabel, variant: materialsBadgeVariant } },
  ]

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
              strokeDasharray={CIRC} strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-extrabold text-white tabular leading-none">{progress}%</span>
            <span className="text-[9px] text-white/50 tracking-[0.7px] uppercase mt-0.5">done</span>
          </div>
        </div>

        {/* Text */}
        <div>
          <h2 className="text-[17px] font-extrabold text-white mb-1">Welcome, {firstName}!</h2>
          <p className="text-[13px] text-white/65 mb-2.5">
            {materialsDone
              ? "You've completed your induction. Nicely done!"
              : `You're ${progress}% through your induction. Keep going.`}
          </p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold"
            style={{ background: 'rgba(74,155,232,0.2)', color: '#93D0FF' }}>
            {joiner ? `${joiner.designation} · Joined ${joiner.joinedDate}` : 'New Joiner'}
          </span>
        </div>

        {/* Date chips */}
        <div className="ml-auto flex flex-col gap-[9px] items-end">
          {[
            { label: 'Doubt-Clearing Call (Optional)', date: `Mon ${nextMondayLabel()} · 12 PM` },
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
            <p className="text-[12px] text-muted mb-2.5">
              {batchmates.length > 0 ? `${batchmates.length} other${batchmates.length !== 1 ? 's' : ''} joined around the same time` : 'No one else joined within 10 days of you yet'}
            </p>
            <div className="flex flex-col gap-2">
              {batchmates.map((b, i) => (
                <div key={b.id} className="flex items-center gap-2.5 text-[13px]">
                  <div className="w-[25px] h-[25px] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {b.initials}
                  </div>
                  <span>{b.name}</span>
                  <span className="text-muted text-[11.5px]">{b.designation}</span>
                </div>
              ))}
            </div>
            <button disabled title="Not connected yet — ask HR" className="mt-3 w-full px-[10px] py-[5px] text-[11.5px] font-semibold bg-ground text-faint border border-bdr rounded cursor-not-allowed">
              Open Teams Channel (Coming Soon)
            </button>
          </Card>

          <div className="bg-navy border border-navy rounded-[5px] p-[15px_17px]">
            <div className="text-[11px] text-white/50 tracking-[0.6px] uppercase mb-1">My Flagged Doubts</div>
            <div className="text-[30px] font-extrabold text-white tabular mb-1">{openDoubts}</div>
            <div className="text-[12.5px] text-white/60 mb-3">
              {openDoubts > 0 ? "Sent to HR — reply pending, or raise it on Monday's call" : 'Nothing open right now'}
            </div>
            <Link href={joiner ? `/employee?tab=doubt&email=${encodeURIComponent(joiner.email)}` : '/employee?tab=doubt'} className="block text-center w-full px-[10px] py-[5px] text-[11.5px] font-semibold rounded cursor-pointer hover:opacity-85 no-underline"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              View My Doubts
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
