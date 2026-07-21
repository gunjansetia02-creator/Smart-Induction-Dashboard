import { supabase } from '@/lib/supabase'
import { MaterialsListClient, type EmployeeMaterial } from './MaterialsListClient'

// Fallback identity for HR's "Employee View" preview toggle, which has no
// real joiner behind it — real joiners are identified via ?email= on their
// personalized dashboard link (see app/employee/page.tsx).
export const DEMO_EMPLOYEE_EMAIL = 'arjun.k@koenig.com'
export const DEMO_EMPLOYEE_NAME = 'Arjun Kapoor'

export async function Materials({
  employeeEmail = DEMO_EMPLOYEE_EMAIL,
  employeeName = DEMO_EMPLOYEE_NAME,
}: {
  employeeEmail?: string
  employeeName?: string
} = {}) {
  const { data: materials, error } = await supabase
    .from('materials')
    .select('*')
    .order('day', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (error) {
    return <div className="text-center py-16 text-red-600 text-[13px]">Failed to load materials: {error.message}</div>
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-16 text-muted text-[13px]">
        No induction materials have been added yet — check back soon, or ask HR.
      </div>
    )
  }

  const materialIds = materials.map(m => m.id)
  const [{ data: progress }, { data: questions }, { data: quizQuestions }] = await Promise.all([
    supabase.from('material_progress').select('*').eq('employee_email', employeeEmail).in('material_id', materialIds),
    supabase.from('material_questions').select('*').eq('employee_email', employeeEmail).in('material_id', materialIds).order('created_at', { ascending: true }),
    supabase.from('material_quiz_questions').select('id, material_id').in('material_id', materialIds),
  ])

  const progressByMaterial = new Map((progress ?? []).map(p => [p.material_id, p]))
  const questionsByMaterial = new Map<string, typeof questions>()
  for (const q of questions ?? []) {
    questionsByMaterial.set(q.material_id, [...(questionsByMaterial.get(q.material_id) ?? []), q])
  }
  const quizCountByMaterial = new Map<string, number>()
  for (const q of quizQuestions ?? []) {
    quizCountByMaterial.set(q.material_id, (quizCountByMaterial.get(q.material_id) ?? 0) + 1)
  }

  const enriched: EmployeeMaterial[] = materials.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    type: m.type,
    url: m.url,
    duration: m.duration,
    day: m.day,
    subject: m.subject,
    status: progressByMaterial.get(m.id)?.status ?? 'not-started',
    watchedPercent: progressByMaterial.get(m.id)?.watched_percent ?? 0,
    lastPosition: progressByMaterial.get(m.id)?.last_position_seconds ?? 0,
    quizCount: quizCountByMaterial.get(m.id) ?? 0,
    questions: (questionsByMaterial.get(m.id) ?? []).map(q => ({
      id: q.id,
      question: q.question,
      aiAnswer: q.ai_answer,
      hrAnswer: q.hr_answer,
      resolved: q.resolved,
      escalated: q.escalated,
    })),
  }))

  return (
    <div>
      <div className="mb-4">
        <div className="text-[14px] font-bold text-navy">My Materials</div>
      </div>
      <MaterialsListClient
        materials={enriched}
        employeeEmail={employeeEmail}
        employeeName={employeeName}
      />
    </div>
  )
}
