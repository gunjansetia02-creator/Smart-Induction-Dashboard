import { getRecentJoinersWithStatus } from '@/lib/data/get-joiners'
import { FeedbackClient } from './FeedbackClient'

export async function Feedback({ initialEmployeeEmail }: { initialEmployeeEmail?: string } = {}) {
  const { joiners, live } = await getRecentJoinersWithStatus(3650)
  return <FeedbackClient joiners={joiners} live={live} initialEmployeeEmail={initialEmployeeEmail} />
}
