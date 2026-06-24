import { Card } from '@/components/ui/Card'

const messages = [
  {
    initials: '🤖',
    name: 'Induction Bot',
    text: 'Welcome to Koenig Solutions! Please take a moment to introduce yourself — name, role, and one fun fact about you!',
    time: 'Mon 23 Jun · 8:00 AM',
    color: '#4A9BE8',
    mine: false,
  },
  {
    initials: 'AK',
    name: 'Arjun Kapoor',
    text: "Hi everyone! I'm Arjun, joining the Sales team from Delhi. Big cricket fan — hoping to find some IPL buddies here!",
    time: 'Mon 23 Jun · 9:14 AM',
    color: '#1B2D50',
    mine: true,
  },
  {
    initials: 'SP',
    name: 'Sneha Patel',
    text: "Welcome Arjun! I'm Sneha from Finance, based in Mumbai. Fun fact — I've visited 14 countries but never been to Goa!",
    time: 'Mon 23 Jun · 9:32 AM',
    color: '#27B882',
    mine: false,
  },
  {
    initials: 'DS',
    name: 'Dev Sharma',
    text: "Hey all! Dev here, IT department. I can code in 6 languages but can't cook to save my life.",
    time: 'Mon 23 Jun · 10:05 AM',
    color: '#F4A622',
    mine: false,
  },
]

export function BatchChannel() {
  return (
    <Card
      title="June Batch Channel · 5 Members"
      noPad
      action={
        <button className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
          Open in Teams
        </button>
      }
    >
      <div className="bg-ground p-4 flex flex-col gap-3 min-h-[260px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-[9px] items-end ${m.mine ? 'flex-row-reverse' : ''}`}>
            <div
              className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ background: m.color }}
            >
              {m.initials}
            </div>
            <div
              className={`rounded-[5px] p-[9px_12px] max-w-[75%] ${
                m.mine
                  ? 'rounded-tr-none text-white'
                  : 'rounded-tl-none bg-white border border-bdr'
              }`}
              style={m.mine ? { background: '#1B2D50', borderRadius: '5px 0 5px 5px' } : {}}
            >
              <div
                className="text-[10.5px] font-bold mb-0.5"
                style={{ color: m.mine ? 'rgba(255,255,255,0.55)' : m.color }}
              >
                {m.name}
              </div>
              <div className={`text-[13px] leading-[1.45] ${m.mine ? 'text-white' : 'text-navy'}`}>
                {m.text}
              </div>
              <div className={`text-[10px] mt-1 ${m.mine ? 'text-white/45' : 'text-faint'}`}>
                {m.time}
              </div>
            </div>
          </div>
        ))}
        <div className="text-center text-[12px] text-faint pt-2 border-t border-bdr">
          Open Teams for the full conversation
        </div>
      </div>
    </Card>
  )
}
