import { supabase } from '@/lib/supabase'
import { MaterialsAdminClient } from './MaterialsAdminClient'

export interface AdminMaterial {
  id: string
  title: string
  description: string
  type: 'video' | 'pdf'
  url: string
  duration: string | null
  day: number | null
  created_at: string
  learnersStarted: number
  learnersComplete: number
  openQuestions: number
}

export async function MaterialsAdmin() {
  const { data: materials, error } = await supabase
    .from('materials')
    .select('*')
    .order('day', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (error) {
    return (
      <div className="text-center py-16 text-red-600 text-[13px]">
        Failed to load materials: {error.message}
      </div>
    )
  }

  const materialIds = materials.map(m => m.id)
  const [{ data: progress }, { data: questions }] = await Promise.all([
    supabase.from('material_progress').select('material_id, status').in('material_id', materialIds),
    supabase.from('material_questions').select('material_id, resolved').in('material_id', materialIds),
  ])

  const enriched: AdminMaterial[] = materials.map(m => ({
    ...m,
    learnersStarted: (progress ?? []).filter(p => p.material_id === m.id).length,
    learnersComplete: (progress ?? []).filter(p => p.material_id === m.id && p.status === 'complete').length,
    openQuestions: (questions ?? []).filter(q => q.material_id === m.id && !q.resolved).length,
  }))

  return <MaterialsAdminClient initialMaterials={enriched} />
}
