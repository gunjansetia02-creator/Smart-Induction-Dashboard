import { getRecentJoiners } from './get-joiners'
import type { Joiner } from '@/lib/types'

// Real joiners within ~10 days of this employee's own DOJ, excluding
// themself — used anywhere the UI wants to show "people starting around the
// same time as you" without a real batch/cohort concept in the data model.
export async function getBatchmates(joiner: Joiner, limit = 6): Promise<Joiner[]> {
  const all = await getRecentJoiners(3650)
  const myDoj = new Date(joiner.doj).getTime()
  const windowMs = 10 * 86_400_000
  return all
    .filter(j => j.email !== joiner.email && Math.abs(new Date(j.doj).getTime() - myDoj) <= windowMs)
    .slice(0, limit)
}
