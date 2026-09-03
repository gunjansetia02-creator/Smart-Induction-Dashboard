import { getRecentJoinersWithStatus } from '@/lib/data/get-joiners'
import { FeedbackClient } from './FeedbackClient'
import { InductionFeedbackSummary } from './InductionFeedbackSummary'

export async function Feedback({ initialEmployeeEmail }: { initialEmployeeEmail?: string } = {}) {
  const { joiners, live } = await getRecentJoinersWithStatus(3650)
  return (
    <div className="flex flex-col gap-5">
      <InductionFeedbackSummary />
      <FeedbackClient joiners={joiners} live={live} initialEmployeeEmail={initialEmployeeEmail} />
    </div>
  )
}
