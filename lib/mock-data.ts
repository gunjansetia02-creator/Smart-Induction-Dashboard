import type { Joiner, Doubt, FeedItem } from './types'

const joinersBase = [
  { id: '1', name: 'Rahul Mehta',  initials: 'RM', designation: 'Software Engineer',     dept: 'IT Department', doj: '2026-06-16', joinedDate: '16 Jun', videosWatched: 4, totalVideos: 4, progress: 100, status: 'complete',     inviteStatus: 'accepted',    emailStatus: 'delivered', email: 'rahul.m@koenig.com',  avatarColor: '#27B882' },
  { id: '2', name: 'Priya Singh',  initials: 'PS', designation: 'HR Executive',          dept: 'HR Department', doj: '2026-06-16', joinedDate: '16 Jun', videosWatched: 3, totalVideos: 4, progress: 85,  status: 'in-progress',   inviteStatus: 'accepted',    emailStatus: 'delivered', email: 'priya.s@koenig.com',  avatarColor: '#4A9BE8' },
  { id: '3', name: 'Arjun Kapoor', initials: 'AK', designation: 'Sales Executive',       dept: 'Sales',         doj: '2026-07-06', joinedDate: '6 Jul', videosWatched: 2, totalVideos: 4, progress: 72,  status: 'in-progress',   inviteStatus: 'accepted',    emailStatus: 'delivered', email: 'arjun.k@koenig.com',  avatarColor: '#4A9BE8' },
  { id: '4', name: 'Sneha Patel',  initials: 'SP', designation: 'Finance Analyst',       dept: 'Finance',       doj: '2026-06-23', joinedDate: '23 Jun', videosWatched: 2, totalVideos: 4, progress: 60,  status: 'in-progress',   inviteStatus: 'accepted',    emailStatus: 'delivered', email: 'sneha.p@koenig.com',  avatarColor: '#27B882' },
  { id: '5', name: 'Dev Sharma',   initials: 'DS', designation: 'Software Engineer',     dept: 'IT Department', doj: '2026-06-23', joinedDate: '23 Jun', videosWatched: 1, totalVideos: 4, progress: 45,  status: 'needs-nudge',   inviteStatus: 'pending',     emailStatus: 'delivered', email: 'dev.s@koenig.com',    avatarColor: '#F4A622' },
  { id: '6', name: 'Kavya Nair',   initials: 'KN', designation: 'Marketing Executive',   dept: 'Marketing',     doj: '2026-06-23', joinedDate: '23 Jun', videosWatched: 1, totalVideos: 4, progress: 30,  status: 'behind',        inviteStatus: 'accepted',    emailStatus: 'delivered', email: 'kavya.n@koenig.com',  avatarColor: '#E85A4A' },
  { id: '7', name: 'Rohan Gupta',  initials: 'RG', designation: 'Sales Executive',       dept: 'Sales',         doj: '2026-06-24', joinedDate: '24 Jun', videosWatched: 0, totalVideos: 4, progress: 20,  status: 'not-started',   inviteStatus: 'no-response', emailStatus: 'bounced',   email: 'rohan.g@koenig.com',  avatarColor: '#1B2D50' },
  { id: '8', name: 'Ananya Raj',   initials: 'AR', designation: 'HR Executive',          dept: 'HR Department', doj: '2026-06-24', joinedDate: '24 Jun', videosWatched: 0, totalVideos: 4, progress: 8,   status: 'not-started',   inviteStatus: 'no-response', emailStatus: 'delivered', email: 'ananya.r@koenig.com', avatarColor: '#E85A4A' },
] as const

export const joiners: Joiner[] = joinersBase.map(j => ({
  ...j,
  reportingManager: 'Rohit Aggarwal',
  reportingManagerEmail: 'rohit.aggarwal@koenig-solutions.com',
  baseLocation: 'Delhi',
  phone: null,
  personalEmail: null,
  officeEmail: j.email,
  linkedIn: null,
  pipStatus: null,
}))

export const thisWeekJoiners = joiners.filter(j => ['23 Jun','24 Jun'].includes(j.joinedDate))

export const doubts: Doubt[] = [
  { id: '1', question: 'What is the escalation process for client complaints?',           askedBy: 'Arjun Kapoor', dept: 'Sales',    videoSource: 'Video 3: Client Relations & Escalations', timestamp: '14:23', flaggedDate: 'Tue 24 Jun', answered: false },
  { id: '2', question: 'How are leave balances calculated for mid-year joiners?',          askedBy: 'Sneha Patel',  dept: 'Finance',  videoSource: 'Video 2: HR Policies & Leave',            timestamp: '08:41', flaggedDate: 'Tue 24 Jun', answered: false },
  { id: '3', question: 'Is the VPN mandatory for all remote work or only specific roles?', askedBy: 'Dev Sharma',   dept: 'IT',       videoSource: 'Video 4: IT Systems & VPN Setup',         timestamp: '22:10', flaggedDate: 'Wed 25 Jun', answered: false },
  { id: '4', question: 'Who approves travel reimbursements for the sales team?',           askedBy: 'Kavya Nair',   dept: 'Marketing',videoSource: 'Video 3: Client Relations & Escalations', timestamp: '31:05', flaggedDate: 'Wed 25 Jun', answered: false },
]

export const feedItems: FeedItem[] = [
  { id: '1', text: 'Rahul Mehta completed induction — 100%',                 time: '2h ago',    type: 'green' },
  { id: '2', text: 'Kavya Nair flagged a doubt on Video 3',                  time: '3h ago',    type: 'blue'  },
  { id: '3', text: 'Friday session auto-scheduled for 27 Jun · 12 PM',       time: 'Today',     type: 'blue'  },
  { id: '4', text: "Dev Sharma hasn't opened materials yet",                 time: 'Yesterday', type: 'amber' },
  { id: '5', text: 'Collaterals auto-sent to 5 new joiners at 1 PM',         time: 'Mon',       type: 'green' },
  { id: '6', text: 'Welcome emails auto-sent to Rohan, Ananya',              time: 'Mon',       type: 'green' },
]

export const collaterals = [
  'Welcome & Company Overview',
  'HR Policies & Leave Management',
  'Client Relations & Escalations',
  'IT Systems & VPN Setup',
  'Employee Handbook (PDF)',
  'Sales Playbook Q2 2025',
]
