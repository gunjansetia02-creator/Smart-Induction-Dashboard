import { getRecentJoinersWithStatus } from '@/lib/data/get-joiners'
import { ProfilesClient } from './ProfilesClient'

export async function Profiles() {
  const { joiners, live, error } = await getRecentJoinersWithStatus(3650)

  return <ProfilesClient joiners={joiners} live={live} error={error} />
}
