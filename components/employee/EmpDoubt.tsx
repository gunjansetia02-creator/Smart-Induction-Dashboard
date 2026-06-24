import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'

export function EmpDoubt() {
  return (
    <div>
      {/* Session Banner */}
      <div className="bg-navy text-white rounded-[5px] p-[14px_18px] flex items-center gap-4 mb-5">
        <div className="flex-1">
          <div className="text-[13.5px] font-bold mb-0.5">
            Friday Doubt Session · 27 June 2025 · 12:00 – 12:20 PM
          </div>
          <div className="text-[12px] text-white/75">
            Your question has been sent to Gunjan in advance. Join the call to get it answered.
          </div>
        </div>
        <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
          Join Teams Call
        </button>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-[18px]">
        {/* Doubts */}
        <Card
          title="My Flagged Doubts"
          noPad
          action={
            <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
              Flag New Doubt
            </button>
          }
        >
          <div className="px-[17px]">
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1">
                <div className="text-[13px] text-navy font-medium">
                  What is the escalation process for client complaints?
                </div>
                <div className="text-[11.5px] text-muted mt-0.5">
                  Video 3: Client Relations · Flagged at 14:23 · Tue 24 Jun
                </div>
              </div>
              <Pill variant="amber">Pending</Pill>
            </div>
          </div>
        </Card>

        {/* Completion status */}
        <Card title="Completion Criteria">
          <div className="flex flex-col gap-[9px] mb-4">
            {[
              { icon: '→', label: 'Watch all 4 videos',   badge: { text: '2 / 4', variant: 'amber' as const }, active: true },
              { icon: '→', label: 'Read both documents',  badge: { text: '1 / 2', variant: 'amber' as const }, active: true },
              { icon: '○', label: 'Attend Friday session',badge: { text: '27 Jun', variant: 'grey' as const },  active: false },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-[9px]">
                  <span className={c.active ? 'text-sky font-bold' : 'text-faint'}>{c.icon}</span>
                  <span>{c.label}</span>
                </div>
                <Pill variant={c.badge.variant}>{c.badge.text}</Pill>
              </div>
            ))}
          </div>
          <div className="bg-ground rounded-[4px] p-[12px_13px] text-[12.5px] text-muted leading-[1.5]">
            Complete all materials and attend Friday&apos;s session to receive your{' '}
            <strong className="text-navy">100% completion</strong> — Gunjan will be notified instantly.
          </div>
        </Card>
      </div>
    </div>
  )
}
