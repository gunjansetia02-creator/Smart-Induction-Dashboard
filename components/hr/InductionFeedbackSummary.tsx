import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// Every joiner's induction-process feedback (submitted from the Home tab,
// either at 100% completion or via the week-1 check-in nudge) in one place —
// previously the only way to see this at all was the per-submission email.
export async function InductionFeedbackSummary() {
  const { data: entries, error } = await supabase
    .from('induction_feedback')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <Card title="Induction Process Feedback">
        <div className="text-center py-8 text-red-600 text-[13px]">Failed to load feedback: {error.message}</div>
      </Card>
    )
  }

  const rated = (entries ?? []).filter(e => e.rating !== null)
  const avgRating = rated.length > 0 ? rated.reduce((sum, e) => sum + (e.rating ?? 0), 0) / rated.length : null

  return (
    <Card
      title="Induction Process Feedback"
      action={
        <div className="flex items-center gap-3 text-[11.5px] text-muted">
          {avgRating !== null && <span>⭐ {avgRating.toFixed(1)} avg</span>}
          <span>{(entries ?? []).length} submitted</span>
        </div>
      }
      bodyClass="p-0"
    >
      {!entries || entries.length === 0 ? (
        <div className="text-center py-10 text-muted text-[13px]">
          No one has submitted induction feedback yet — it shows up here the moment someone does.
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {entries.map(e => (
            <div key={e.id} className="px-[18px] py-3 border-b border-ground last:border-0">
              <div className="flex items-start justify-between gap-3">
                <div className="text-[13px] font-semibold text-navy">{e.employee_name ?? e.employee_email}</div>
                {e.rating && (
                  <div className="text-[13px] whitespace-nowrap">
                    {'⭐'.repeat(e.rating)}{'☆'.repeat(5 - e.rating)}
                  </div>
                )}
              </div>
              <div className="text-[12.5px] text-muted mt-1 whitespace-pre-wrap">{e.feedback_text}</div>
              <div className="text-[11px] text-faint mt-1">{fmt(e.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
