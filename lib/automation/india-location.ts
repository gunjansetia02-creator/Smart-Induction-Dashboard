// Koenig's PMS "Base Location" field holds a city name with no separate country
// field. We default every joiner to India-based UNLESS their location matches a
// known overseas office/city — safer than an allowlist, since an unrecognised
// Indian city (any small-town branch) still correctly counts as India-based.
// Keywords match whole words only, so short ones like "uk" or "oman" can't
// accidentally hit an Indian city name that merely contains those letters.
const OVERSEAS_KEYWORDS = [
  // Middle East
  'dubai', 'sharjah', 'abu dhabi', 'ajman', 'uae', 'u.a.e', 'united arab emirates',
  'qatar', 'doha', 'saudi', 'saudi arabia', 'riyadh', 'jeddah', 'dammam', 'al-khobar', 'al khobar', 'khobar',
  'bahrain', 'manama', 'oman', 'muscat', 'kuwait',
  // Africa
  'egypt', 'cairo', 'alexandria', 'giza',
  'ethiopia', 'addis ababa',
  'nigeria', 'lagos', 'abuja',
  'ghana', 'accra',
  'kenya', 'nairobi', 'mombasa',
  'tanzania', 'dar e salaam', 'dar es salaam',
  'senegal', 'dakar',
  'uganda', 'kampala', 'rwanda', 'kigali', 'zambia', 'lusaka', 'zimbabwe', 'harare',
  'south africa', 'johannesburg', 'pretoria', 'cape town', 'durban',
  'morocco', 'casablanca',
  // Americas
  'usa', 'u.s.a', 'united states', 'new york', 'new york city', 'california', 'texas', 'chicago',
  'san francisco', 'los angeles', 'seattle', 'boston', 'new jersey', 'florida', 'atlanta',
  'canada', 'toronto', 'vancouver', 'ontario', 'british columbia', 'alberta', 'calgary', 'montreal', 'quebec',
  'mexico', 'brazil', 'sao paulo',
  // Europe
  'uk', 'u.k', 'united kingdom', 'england', 'scotland', 'wales', 'ireland', 'dublin',
  'london', 'bristol', 'surrey', 'manchester', 'birmingham', 'leicester', 'edinburgh',
  'france', 'paris', 'germany', 'berlin', 'munich', 'frankfurt',
  'netherlands', 'amsterdam', 'belgium', 'brussels', 'spain', 'madrid', 'italy', 'rome', 'milan',
  'switzerland', 'zurich', 'geneva', 'sweden', 'stockholm', 'poland', 'warsaw', 'portugal', 'lisbon',
  // Asia-Pacific
  'singapore',
  'malaysia', 'kuala lumpur', 'kula lampur', 'kuala lampur',
  'indonesia', 'jakarta', 'bekasi',
  'thailand', 'bangkok', 'philippines', 'manila', 'vietnam', 'hanoi',
  'china', 'beijing', 'shanghai', 'hong kong', 'japan', 'tokyo', 'korea', 'seoul',
  'nepal', 'kathmandu', 'bangladesh', 'dhaka', 'sri lanka', 'colombo', 'pakistan', 'bhutan', 'maldives',
  'australia', 'sydney', 'melbourne', 'canberra', 'brisbane', 'perth', 'adelaide',
  'new zealand', 'auckland', 'wellington',
]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const OVERSEAS_PATTERN = new RegExp(
  `(^|[^a-z])(${OVERSEAS_KEYWORDS.map(escape).join('|')})($|[^a-z])`,
)

export function isIndiaBasedLocation(location: string | null | undefined): boolean {
  if (!location) return true // unknown location — default to India rather than silently skipping someone
  return !OVERSEAS_PATTERN.test(location.trim().toLowerCase())
}
