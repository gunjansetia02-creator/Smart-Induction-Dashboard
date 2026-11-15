import { notFound } from 'next/navigation'
import { getCeoMessage, CEO_MESSAGES } from '@/lib/ceo-messages'
import { CEO_WORDS } from '@/lib/ceo-words'

export function generateStaticParams() {
  return CEO_MESSAGES.map(m => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const m = getCeoMessage((await params).slug)
  return { title: m ? `${m.title} · ${m.date}` : 'Not found' }
}

// Opened from the joiner's materials list ("Open Document ↗"), so it stands
// on its own: no sidebar, readable on a phone.
export default async function CeoMessagePage({ params }: { params: Promise<{ slug: string }> }) {
  const m = getCeoMessage((await params).slug)
  if (!m) notFound()

  return (
    <main className="min-h-screen bg-ground px-4 py-8">
      <article className="max-w-[760px] mx-auto bg-white border border-bdr rounded-[12px] shadow-[0_2px_12px_rgba(16,24,40,0.06)] overflow-hidden">
        <header className="bg-navy px-6 sm:px-8 py-7">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-[7px] bg-sky flex items-center justify-center text-white font-extrabold text-[14px]">K</div>
            <div className="text-white/60 text-[10.5px] tracking-[0.8px] uppercase">Koenig Solutions · Induction</div>
          </div>
          <h1 className="text-white text-[22px] sm:text-[26px] font-extrabold leading-tight">{m.title}</h1>
          <div className="text-[#93D0FF] text-[13px] font-semibold mt-1">{m.date}</div>
          <p className="text-white/75 text-[14px] leading-relaxed mt-4">{m.intro}</p>
        </header>

        <div className="px-6 sm:px-8 py-6 flex flex-col gap-6">
          {m.sections.map((s, i) => (
            <section key={s.heading}>
              <h2 className="flex items-center gap-2.5 text-[16px] font-bold text-navy mb-2">
                <span className="w-6 h-6 rounded-full bg-sky-dim text-blue-700 text-[11.5px] font-extrabold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                {s.heading}
              </h2>
              {s.intro && <p className="text-[14px] text-[#374151] leading-relaxed mb-2.5">{s.intro}</p>}
              <ul className="flex flex-col gap-1.5 pl-1">
                {s.points.map(p => (
                  <li key={p} className="flex gap-2.5 text-[14px] text-[#374151] leading-relaxed">
                    <span className="text-sky font-bold mt-[1px]">›</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section id="words" className="mx-6 sm:mx-8 mb-6 pt-5 border-t border-bdr scroll-mt-4">
          <h2 className="text-[16px] font-bold text-navy mb-1">Our CEO&rsquo;s words</h2>
          <p className="text-[13px] text-muted mb-3">The phrases you&rsquo;ll hear across Koenig, what they mean, and how our CEO puts it.</p>
          <div className="flex flex-col gap-2.5">
            {CEO_WORDS.map(w => (
              <div key={w.id} className="border border-bdr rounded-[6px] px-4 py-3">
                <div className="text-[14px] font-bold text-navy">
                  {w.phrase}
                  {w.audience === 'sales' && <span className="ml-2 align-middle text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-dim text-blue-700">Sales</span>}
                </div>
                <p className="text-[13px] text-[#374151] mt-0.5">{w.meaning}</p>
                <p className="text-[13px] text-navy italic mt-1">&ldquo;{w.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mx-6 sm:mx-8 mb-7 px-5 py-4 rounded-[8px] bg-kamber-dim border-l-[4px] border-kamber">
          <p className="text-[15px] font-bold text-navy">{m.closing}</p>
        </footer>
      </article>
    </main>
  )
}
