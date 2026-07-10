export type JoinerStatus = 'complete' | 'in-progress' | 'needs-nudge' | 'behind' | 'not-started'
export type InviteStatus = 'accepted' | 'pending' | 'no-response'
export type EmailStatus = 'delivered' | 'bounced'
export type FeedType = 'green' | 'blue' | 'amber'

export interface Joiner {
  id: string
  name: string
  initials: string
  designation: string
  dept: string
  doj: string
  joinedDate: string
  videosWatched: number
  totalVideos: number
  progress: number
  status: JoinerStatus
  inviteStatus: InviteStatus
  emailStatus: EmailStatus
  email: string
  avatarColor: string
  // Richer PMS fields, shown in the joiner detail modal
  reportingManager: string | null
  reportingManagerEmail: string | null
  baseLocation: string | null
  phone: string | null
  personalEmail: string | null
  officeEmail: string | null
  linkedIn: string | null
  pipStatus: string | null
}

export interface Doubt {
  id: string
  question: string
  askedBy: string
  dept: string
  videoSource: string
  timestamp: string
  flaggedDate: string
  answered: boolean
}

export interface FeedItem {
  id: string
  text: string
  time: string
  type: FeedType
}
