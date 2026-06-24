export type JoinerStatus = 'complete' | 'in-progress' | 'needs-nudge' | 'behind' | 'not-started'
export type InviteStatus = 'accepted' | 'pending' | 'no-response'
export type EmailStatus = 'delivered' | 'bounced'
export type MaterialStatus = 'complete' | 'in-progress' | 'not-started'
export type FeedType = 'green' | 'blue' | 'amber'

export interface Joiner {
  id: string
  name: string
  initials: string
  dept: string
  joinedDate: string
  videosWatched: number
  totalVideos: number
  progress: number
  status: JoinerStatus
  inviteStatus: InviteStatus
  emailStatus: EmailStatus
  email: string
  avatarColor: string
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

export interface Material {
  id: string
  title: string
  type: 'video' | 'pdf'
  duration: string
  progress: number
  status: MaterialStatus
  resumeAt?: string
}

export interface FeedItem {
  id: string
  text: string
  time: string
  type: FeedType
}
