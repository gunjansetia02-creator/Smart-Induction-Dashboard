// Koenig's PMS "Base Location" field holds a city name with no separate country
// field. We default every joiner to India-based UNLESS their location matches a
// known overseas office/city — safer than an allowlist, since an unrecognised
// Indian city (any small-town branch) still correctly counts as India-based.
const OVERSEAS_KEYWORDS = [
  'dubai', 'sharjah', 'abu dhabi', 'uae', 'u.a.e',
  'nairobi', 'kenya',
  'usa', 'u.s.a', 'united states', 'new york', 'california', 'texas',
  'uk', 'united kingdom', 'london',
  'canada', 'toronto', 'vancouver',
  'singapore',
  'nepal', 'kathmandu',
  'bangladesh', 'dhaka',
  'sri lanka', 'colombo',
  'qatar', 'doha',
  'saudi', 'riyadh', 'jeddah',
  'bahrain',
  'oman', 'muscat',
  'kuwait',
  'australia', 'sydney', 'melbourne',
  'malaysia', 'kuala lumpur',
  'south africa', 'johannesburg',
]

export function isIndiaBasedLocation(location: string | null | undefined): boolean {
  if (!location) return true // unknown location — default to India rather than silently skipping someone
  const normalized = location.trim().toLowerCase()
  return !OVERSEAS_KEYWORDS.some(keyword => normalized.includes(keyword))
}
