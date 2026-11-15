// Key messages from our CEO's Quarterly Kites Meets, written up for new
// joiners. Source: the meet's deck (masterclass dashboard, presenter upload)
// and its saved recap. Internal numbers (NR, attrition, ratings) are left out
// on purpose — this is culture and direction, not a results review.

export interface CeoMessageSection {
  heading: string
  intro?: string
  points: string[]
}

export interface CeoMessage {
  slug: string
  title: string
  date: string
  intro: string
  sections: CeoMessageSection[]
  closing: string
}

export const CEO_MESSAGES: CeoMessage[] = [
  {
    slug: 'kites-meet-oct-2026',
    title: 'Quarterly Kites Meet with our CEO',
    date: '23 October 2026',
    intro:
      'Every quarter, our CEO meets all Kites to share where Koenig stands and where we are headed. These are the key messages from the October 2026 meet. Read them carefully: they describe how we think and work today.',
    sections: [
      {
        heading: 'Our vision',
        points: [
          'Creating global prosperity by unlocking human potential in the age of AI.',
          'Empowering people to earn Money, Respect and Peace of Mind (MRP).',
        ],
      },
      {
        heading: 'Experimentation is the call of the day',
        intro:
          "China led the world in technology until the 15th century; Europe overtook it in the 16th. Why? China valued experience, Europe valued experiments. Experience is slow learning; experiments are fast learning. The Royal Society's motto says it best: “Nullius in verba” — take nobody's word for it.",
        points: [
          'The cost of experimenting has fallen almost to zero, for both digital and non-digital experiments.',
          'The impact of an experiment is easy to measure.',
          'An experiment is simply another word for improvement or innovation.',
          'Koenig works this way: small experiments, fast feedback, measured impact (for example, on the CSM Dashboard and LET, with results visible within weeks).',
        ],
      },
      {
        heading: 'RISE — Rapid Iteration & Solution Engineering',
        intro: 'RISE is how we run these experiments: weekly progress and brainstorming meets, fast development and fast feedback from the people who use the tools.',
        points: [
          'Current RISE projects cover LET, the CSM Dashboard, AI CSM, AR, AP, Accounts, Freelancer Management, Indexes, the new website, an Interview Agent, Masterclasses, the DC team, Salary, TA bill submission, and courseware & exam ordering.',
          'Each project pairs a developer with real users and a clear goal, such as frictionless training operations, faster collections, or more transparency for Kites.',
          'Keep looking for things that can be improved. A good idea can become the next RISE project.',
        ],
      },
      {
        heading: 'Thriving in the AI era',
        points: [
          'Whatever can be automated will be automated — and there will be no layoffs due to automation.',
          'Be ambitious: set high performance goals for yourself.',
          'Develop rare skills (business development, teaching, cognitive thinking). AI has made work more cognitive.',
          'Dependability and honesty are very valuable.',
          'AI capability increases every month. Be suspicious of “it has always been like this”.',
          'Only the energetic will thrive: fight “WFH laziness” and create work for yourself.',
        ],
      },
      {
        heading: 'Koenig-ism: our culture',
        points: ['Faith in AI', 'Constant improvement', 'Energy', 'Koenig Ethos — being truthful'],
      },
      {
        heading: 'Our priorities',
        points: [
          'Remain #1 in delivery capability — What, When, Where.',
          'Leadership in multilingual training.',
          'OEM growth.',
          "BEAST-AI — the arc back to Koenig's original vision, building software alongside training.",
          'Creating “WOW” for customers and Kites, through super-fast responses and personalisation.',
        ],
      },
      {
        heading: 'For our Sales team (CSMs)',
        points: [
          'Automation has removed the drudgery from a CSM’s daily routine, so CSMs can focus on business development.',
          'Quarter-on-quarter growth and consistent performance every quarter are expected.',
          'We are waiting for the first “KBC” (Kaun Banega Crorepati) from Sales: a CSM earning ₹1 crore in one year.',
          'Three support agents help everyone: aicsm@koenig-solutions.com (AI CSM), let@koenig-solutions.com (LET) and csm-d@koenig-solutions.com (sales support). The CSM Dashboard answers CSM queries 24x7.',
        ],
      },
    ],
    closing: 'Retain the information, and act upon it.',
  },
]

export function getCeoMessage(slug: string): CeoMessage | undefined {
  return CEO_MESSAGES.find(m => m.slug === slug)
}

// Plain text of a message, stored as the material's content_text so the AI
// doubt-answering on the dashboard can ground its answers in it.
export function ceoMessageAsText(m: CeoMessage): string {
  return [
    `${m.title} — ${m.date}`,
    m.intro,
    ...m.sections.map(s => [s.heading.toUpperCase(), s.intro ?? '', ...s.points.map(p => `- ${p}`)].filter(Boolean).join('\n')),
    m.closing,
  ].join('\n\n')
}
