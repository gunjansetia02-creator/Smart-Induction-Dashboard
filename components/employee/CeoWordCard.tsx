import type { CeoWord } from '@/lib/ceo-words'
import { CEO_WORDS_SOURCE } from '@/lib/ceo-words'

// "In our CEO's words" — one of our CEO's phrases with what it means and his
// actual line. Used on Home (word of the day) and above each materials day.
export function CeoWordCard({ word, label = 'In our CEO’s words', compact = false }: { word: CeoWord; label?: string; compact?: boolean }) {
  return (
    <div className={`bg-white border border-bdr border-l-[4px] border-l-sky rounded-[6px] ${compact ? 'p-[11px_15px]' : 'p-[16px_20px]'}`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
        <div className="text-[10.5px] font-bold text-blue-700 tracking-[0.6px] uppercase">{label}</div>
        {!compact && (
          <a href="/ceo-message/kites-meet-oct-2026#words" target="_blank" rel="noopener noreferrer" className="text-[11px] text-sky font-semibold no-underline hover:underline">
            All of our CEO’s words ↗
          </a>
        )}
      </div>
      <div className={`${compact ? 'text-[13.5px]' : 'text-[15px]'} font-bold text-navy`}>{word.phrase}</div>
      <p className={`${compact ? 'text-[12px]' : 'text-[13px]'} text-muted mt-0.5`}>{word.meaning}</p>
      <p className={`${compact ? 'text-[12px]' : 'text-[13px]'} text-navy italic mt-1.5`}>
        &ldquo;{word.quote}&rdquo; <span className="not-italic text-faint text-[11px]">— our CEO, {CEO_WORDS_SOURCE}</span>
      </p>
    </div>
  )
}
