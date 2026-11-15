// Our CEO's own words and the priorities he explains, threaded through the
// whole induction (Home card, materials day banners, quiz results, joiner
// emails, AI doubt answers) so new Kites hear his language everywhere, not
// just in one summary. Quotes come from the 23 Oct 2026 Quarterly Kites Meet
// transcript, lightly tidied where the auto-transcription garbled words.
// Add a new meet's words here; everything else picks them up.

export interface CeoWord {
  id: string
  phrase: string // the term or saying itself
  meaning: string // what it means for a Kite, in one or two plain sentences
  quote: string // our CEO, in his words
  audience?: 'sales' | 'trainers' // omitted = everyone
}

export const CEO_WORDS_SOURCE = 'Quarterly Kites Meet, 23 Oct 2026'

export const CEO_WORDS: CeoWord[] = [
  {
    id: 'experiment',
    phrase: 'Experiment is fast learning',
    meaning: 'Don’t wait years to learn from experience. Try small changes, measure what happens, keep what works.',
    quote: 'China valued experience and Europe valued experiments. Experience is slow learning. Experiment is fast learning.',
  },
  {
    id: 'nullius',
    phrase: 'Nullius in verba — take nobody’s word for it',
    meaning: 'If something has not been tested and proven, don’t just assume it is true. Check it.',
    quote: 'If something is not experimented and proven, then don’t just assume that it is true.',
  },
  {
    id: 'improvement',
    phrase: 'Experiment = improvement = innovation',
    meaning: 'These are the same idea. Every improvement at Koenig starts as an experiment.',
    quote: 'Improvement happens from experiments, innovation comes from experiments. So nothing new. Start from experiments — let’s try this out.',
  },
  {
    id: 'impact',
    phrase: 'Know the impact',
    meaning: 'An experiment is only useful if you measure its result. Always ask: what changed because of this?',
    quote: 'Without knowing the impact, it’s difficult to even do an experiment, because you don’t know what will work or not work.',
  },
  {
    id: 'rise',
    phrase: 'RISE — Rapid Iteration & Solution Engineering',
    meaning: 'Developers and real users meet weekly, build fast and give feedback instantly. Any Kite can ask HR to join a RISE meet.',
    quote: 'Now even complex features can be implemented within half an hour. Then the user can give feedback: see, this is something else to be done.',
  },
  {
    id: 'energy',
    phrase: 'Energy',
    meaning: 'Energy is at the core of everything. Bring energy to your work and motivate yourself to rise.',
    quote: 'Information is a form of energy. So it’s very important to have energy, to be able to motivate your own self to rise.',
  },
  {
    id: 'eye',
    phrase: 'Look the problem in the eye',
    meaning: 'Like the ostrich hiding its head, ignoring a problem doesn’t make it go away. Face it — we are not scared of the AI era.',
    quote: 'If we ignore the problem, it is not like the problem will just die on its own. We have to look the problem in the eye.',
  },
  {
    id: 'automated',
    phrase: 'Whatever can be automated will be automated',
    meaning: 'Accept it, and use it. Automation removes drudgery — and Koenig has promised no layoffs due to automation.',
    quote: 'Whatever will be automated will be automated. And this is a promise we have made: no layoffs due to automation.',
  },
  {
    id: 'ambitious',
    phrase: 'This is the time to be ambitious',
    meaning: 'The AI era is an opportunity and a threat. Set high goals and rise with it.',
    quote: 'This is the time to be ambitious. It’s an opportunity and a threat. It’s an opportunity for you to rise.',
  },
  {
    id: 'rare-skills',
    phrase: 'Develop rare skills',
    meaning: 'Some skills stay human: business development (especially B2B), teaching, judgement. Clients want to talk to real people.',
    quote: 'We can’t say to a client, okay, AI will do the client meeting with you. The clients will not accept that.',
  },
  {
    id: 'cognitive',
    phrase: 'Work has become more cognitive',
    meaning: 'Less following fixed steps, more thinking: check what AI has done and where it could be making a mistake.',
    quote: 'Now the work has become more cognitive, which means more thinking. We have to analyse what AI has done and where it could be making a mistake.',
  },
  {
    id: 'dependable',
    phrase: 'Be honest and dependable',
    meaning: 'If you say something, it should be the truth — no one should need to recheck it. Be the person others can rely on in a crisis.',
    quote: 'If they have said something, it is the truth. We don’t have to recheck it. Can you depend upon them to solve the problem?',
  },
  {
    id: 'always-been',
    phrase: '“It has always been like this” is not a reason',
    meaning: 'Whenever you hear it, that’s exactly the area to rethink and improve.',
    quote: 'It has always been like that doesn’t mean that it should always be like that in future also.',
  },
  {
    id: 'wfh-laziness',
    phrase: 'Fight WFH laziness',
    meaning: 'Working from home is a privilege. Keep your routine, stay energised, and don’t wait to be chased.',
    quote: 'How do we energise ourselves and fight the work-from-home laziness? How can we keep our 9-to-5 routine, whatever time we fix for work?',
  },
  {
    id: 'create-work',
    phrase: 'Create work',
    meaning: 'Get back to people before time. When you have a free hour, find something that creates value for the company.',
    quote: 'We get back to them before time. We create work — we say, okay, we have got some time, let us do something which can create value for the company.',
  },
  {
    id: 'koenigism',
    phrase: 'Koenig-ism',
    meaning: 'Our culture: Faith in AI, constant improvement, energy, and being truthful (Koenig Ethos).',
    quote: 'If I believe in AI, I will survive and thrive. If I constantly improve, if I have energy, if I’m honest — I will survive and thrive.',
  },
  {
    id: 'what-when-where',
    phrase: 'Any training, anywhere, anytime — What, When, Where',
    meaning: 'Our biggest strength is delivery capability. If a customer needs it and will pay for it, we should not have to say no.',
    quote: 'We have been known for being able to deliver any training anywhere in the world, anytime. If a customer has a requirement, we should not have to say no.',
  },
  {
    id: 'oem',
    phrase: 'OEM first',
    meaning: 'Our training is OEM-authorised, and we intend to be the number one training vendor for every OEM.',
    quote: 'We have been an OEM-first company. We intend to be the number one training vendor for all the OEMs.',
  },
  {
    id: 'wow',
    phrase: 'Create WOW',
    meaning: 'Customers should feel “wow” after signing up: super-fast replies, every question answered, every promise kept.',
    quote: 'I ask 10 questions, I get 10 answers. If they say they will get back, they get back. That is the wow factor for the customer.',
  },
  {
    id: 'oyster',
    phrase: 'The world is your oyster',
    meaning: 'Every CSM can sell anywhere in the world. If business is slow in one region this quarter, target another.',
    quote: 'All CSMs can sell anywhere in the world. The world is an oyster for everyone — you can find pearls anywhere in the world.',
    audience: 'sales',
  },
  {
    id: 'kbc',
    phrase: 'KBC — Kaun Banega Crorepati',
    meaning: 'Our CEO’s dream: a CSM earning ₹1 crore in a year, as proof of how AI can transform lives.',
    quote: 'If we can do this, it will be a big achievement for me, and it will be proof of how AI can transform lives.',
    audience: 'sales',
  },
  {
    id: 'scold',
    phrase: '“Please scold me”',
    meaning: 'Criticism — or a failure — helps us improve. Welcome it instead of avoiding it.',
    quote: 'When we see our scolding, then we improve. A scold does not have to be verbal; it can also be an event — a failure.',
  },
  {
    id: 'pain',
    phrase: 'No pain, no gain',
    meaning: 'Change is uncomfortable, but we can’t succeed in the AI era without changing.',
    quote: 'Change is painful. But without pain there is no gain, and we can’t be successful in the AI era unless we change.',
  },
  {
    id: 'mrp',
    phrase: 'Money, Respect & Peace of Mind (MRP)',
    meaning: 'Our vision: unlock human potential with AI so people achieve more Money, Respect and Peace of Mind.',
    quote: 'We have faith in AI. We believe AI can help people achieve more — more money, respect, and peace of mind.',
  },
  {
    id: 'act',
    phrase: 'Note it down, act upon it',
    meaning: 'Hearing an idea once isn’t enough. Re-read what matters every day until it becomes how you work.',
    quote: 'If you just read it once, it will not become part of your subconscious. Read it every day. Then slowly your subconscious will accept it.',
  },
]

export function wordsFor(dept?: string | null): CeoWord[] {
  const d = (dept ?? '').toLowerCase()
  const isSales = /sales/.test(d)
  const isTrainer = /training delivery/.test(d)
  return CEO_WORDS.filter(w => !w.audience || (w.audience === 'sales' && isSales) || (w.audience === 'trainers' && isTrainer))
}

export function ceoWord(id: string): CeoWord {
  const w = CEO_WORDS.find(x => x.id === id)
  if (!w) throw new Error(`Unknown CEO word: ${id}`)
  return w
}

// One word per day of the joiner's induction, in order, so each visit
// teaches the next idea (and the same day shows the same word everywhere).
export function wordOfTheDay(dayIndex: number, dept?: string | null): CeoWord {
  const list = wordsFor(dept)
  return list[((dayIndex % list.length) + list.length) % list.length]
}

// The banner shown above each induction day's materials, matched to its theme.
export const DAY_BANNER_WORDS: Record<string, string> = {
  'Day 1': 'koenigism',
  'Day 2': 'dependable',
  'Day 3': 'automated',
  'General / Anytime': 'act',
}

// Deterministic answer for "what is RISE / KBC / Koenig-ism…" questions, used
// before (or without) the AI. Only fires on a definition-style question that
// names one of these terms, so ordinary doubts still go to the AI / HR.
const LOOKUP_KEYS: Record<string, RegExp> = {
  rise: /\brise\b/i,
  kbc: /\bkbc\b|crorepati/i,
  koenigism: /koenig[\s-]?ism|uniism/i,
  mrp: /\bmrp\b|money,? respect/i,
  nullius: /nullius/i,
  'wfh-laziness': /wfh laziness|work[\s-]from[\s-]home laziness/i,
  'create-work': /create work/i,
  oyster: /oyster/i,
  wow: /\bwow\b/i,
  'what-when-where': /what,? when,? where/i,
  'rare-skills': /rare skill/i,
}

export function lookupCeoWordAnswer(question: string): string | null {
  if (!/\b(what|meaning|mean|means|explain|define|stand for)\b/i.test(question)) return null
  for (const [id, re] of Object.entries(LOOKUP_KEYS)) {
    if (re.test(question)) {
      const w = ceoWord(id)
      return `${w.phrase}: ${w.meaning}\n\nIn our CEO's words: “${w.quote}”`
    }
  }
  return null
}

// Email-safe "In our CEO's words" block (tables + inline styles for Outlook).
export function ceoWordEmailHtml(id: string): string {
  const w = ceoWord(id)
  const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
  <tr><td style="border-left:4px solid #4A9BE8;background:#F2F7FD;padding:12px 16px;border-radius:4px;">
    <p style="margin:0 0 4px;font-size:10.5px;letter-spacing:0.6px;text-transform:uppercase;color:#1D4ED8;font-weight:700;">In our CEO&rsquo;s words &middot; ${esc(w.phrase)}</p>
    <p style="margin:0;font-size:13.5px;color:#1B2D50;font-style:italic;line-height:1.6;">&ldquo;${esc(w.quote)}&rdquo;</p>
  </td></tr>
</table>`
}

// Glossary block given to the AI doubt-answerer, so "what is RISE / KBC /
// Koenig-ism" is answered the way our CEO explains it.
export function ceoWordsForAi(): string {
  return [
    `OUR CEO'S WORDS AND PRIORITIES (${CEO_WORDS_SOURCE}) — use these terms and explanations when relevant:`,
    ...CEO_WORDS.map(w => `- ${w.phrase}: ${w.meaning} Our CEO: "${w.quote}"`),
  ].join('\n')
}
