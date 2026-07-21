import { Card } from '@/components/ui/Card'
import { getBatchmates } from '@/lib/data/get-batchmates'
import type { Joiner } from '@/lib/types'

const AVATAR_COLORS = ['#4A9BE8', '#27B882', '#F4A622', '#E85A4A', '#1B2D50', '#6B7A99']

export async function BatchChannel({ joiner }: { joiner?: Joiner | null } = {}) {
  const batchmates = joiner ? await getBatchmates(joiner) : []

  return (
    <Card
      title={joiner ? `Your Batch · ${batchmates.length + 1} Joined Around ${joiner.joinedDate}` : 'Batch Channel'}
      noPad
      action={
        <button
          disabled
          title="Not connected yet — ask HR"
          className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-ground text-faint border border-bdr rounded cursor-not-allowed"
        >
          Open in Teams (Coming Soon)
        </button>
      }
    >
      <div className="p-4">
        {!joiner ? (
          <div className="text-center py-10 text-muted text-[13px]">
            This preview needs a real employee identity to show your batch — open this via your personalized dashboard link.
          </div>
        ) : batchmates.length === 0 ? (
          <div className="text-center py-10 text-muted text-[13px]">
            No other joiners found within 10 days of your start date yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {batchmates.map((b, i) => (
              <div key={b.id} className="flex items-center gap-2.5 text-[13px] bg-ground rounded-[4px] p-2.5">
                <div
                  className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {b.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy">{b.name}</div>
                  <div className="text-muted text-[11.5px]">{b.designation} · Joined {b.joinedDate}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center text-[11.5px] text-faint pt-3 mt-2 border-t border-bdr">
          Real-time chat isn&apos;t connected yet — this will show a live Teams feed once that&apos;s set up.
        </div>
      </div>
    </Card>
  )
}
