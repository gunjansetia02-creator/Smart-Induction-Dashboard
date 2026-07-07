'use client'

import { useEffect, useState } from 'react'
import type { AdminMaterial } from './MaterialsAdmin'

type FormState = {
  id?: string
  title: string
  description: string
  type: 'video' | 'pdf'
  url: string
  duration: string
  day: string // kept as string for the input; '' = no day assigned
}

const EMPTY_FORM: FormState = { title: '', description: '', type: 'video', url: '', duration: '', day: '' }

interface EscalatedQuestion {
  id: string
  material_id: string
  employee_email: string
  employee_name: string | null
  question: string
  ai_answer: string | null
  created_at: string
  materials?: { title: string }
}

function typeIcon(t: 'video' | 'pdf') { return t === 'pdf' ? '📄' : '▶' }

export function MaterialsAdminClient({ initialMaterials }: { initialMaterials: AdminMaterial[] }) {
  const [materials, setMaterials] = useState(initialMaterials)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [escalated, setEscalated] = useState<EscalatedQuestion[] | null>(null)

  useEffect(() => {
    fetch('/api/materials/questions')
      .then(r => r.json())
      .then(d => setEscalated(d.questions ?? []))
      .catch(() => setEscalated([]))
  }, [])

  function openAdd() {
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(m: AdminMaterial) {
    setForm({
      id: m.id,
      title: m.title,
      description: m.description,
      type: m.type,
      url: m.url,
      duration: m.duration ?? '',
      day: m.day === null ? '' : String(m.day),
    })
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this material? This also removes employee progress and questions tied to it.')) return
    const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' })
    if (res.ok) setMaterials(prev => prev.filter(m => m.id !== id))
  }

  async function handleSave() {
    if (!form.title.trim() || !form.url.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        url: form.url.trim(),
        duration: form.duration.trim() || null,
        day: form.day.trim() === '' ? null : Number(form.day),
      }

      const res = form.id
        ? await fetch(`/api/materials/${form.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch('/api/materials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })

      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      const data = await res.json()
      const saved = data.material as AdminMaterial

      setMaterials(prev => {
        const withStats = { ...saved, learnersStarted: form.id ? prev.find(m => m.id === form.id)?.learnersStarted ?? 0 : 0, learnersComplete: form.id ? prev.find(m => m.id === form.id)?.learnersComplete ?? 0 : 0, openQuestions: form.id ? prev.find(m => m.id === form.id)?.openQuestions ?? 0 : 0 }
        const next = form.id ? prev.map(m => (m.id === form.id ? withStats : m)) : [...prev, withStats]
        return next.sort((a, b) => (a.day ?? Infinity) - (b.day ?? Infinity))
      })
      setModalOpen(false)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save material')
    } finally {
      setSaving(false)
    }
  }

  async function markResolved(qid: string) {
    await fetch(`/api/materials/questions/${qid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolved: true }) })
    const resolvedQuestion = (escalated ?? []).find(q => q.id === qid)
    setEscalated(prev => (prev ?? []).filter(q => q.id !== qid))
    if (resolvedQuestion) {
      setMaterials(prev => prev.map(m => (m.id === resolvedQuestion.material_id ? { ...m, openQuestions: Math.max(0, m.openQuestions - 1) } : m)))
    }
  }

  // Group by day; materials without a day go in a trailing "General" bucket
  const grouped = new Map<string, AdminMaterial[]>()
  for (const m of materials) {
    const key = m.day === null ? 'General / Anytime' : `Day ${m.day}`
    grouped.set(key, [...(grouped.get(key) ?? []), m])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[14px] font-bold text-navy">Induction Materials</div>
          <div className="text-[12px] text-muted mt-0.5">{materials.length} material{materials.length !== 1 ? 's' : ''} · shown to employees in their My Materials view</div>
        </div>
        <button onClick={openAdd} className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
          + Add Material
        </button>
      </div>

      {escalated && escalated.length > 0 && (
        <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-[12px] font-bold text-amber-900 mb-2">⚠️ {escalated.length} question{escalated.length !== 1 ? 's' : ''} escalated to HR</div>
          <div className="flex flex-col gap-2">
            {escalated.map(q => (
              <div key={q.id} className="flex items-start justify-between gap-3 bg-white rounded p-2.5 border border-amber-100">
                <div className="flex-1">
                  <div className="text-[12.5px] text-navy font-medium">{q.question}</div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {q.employee_name ?? q.employee_email} · on &ldquo;{q.materials?.title ?? 'a material'}&rdquo;
                    {q.ai_answer ? ' · AI answered but employee still needs help' : ' · AI unavailable'}
                  </div>
                </div>
                <button onClick={() => markResolved(q.id)} className="px-[9px] py-[4px] text-[11px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85 whitespace-nowrap">
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="text-center py-16 text-muted text-[13px]">No materials yet. Click "Add Material" to create your first one.</div>
      ) : (
        Array.from(grouped.entries()).map(([groupLabel, items]) => (
          <div key={groupLabel} className="mb-5">
            <div className="text-[11px] font-bold tracking-[0.6px] uppercase text-faint mb-2">{groupLabel}</div>
            <div className="flex flex-col gap-2">
              {items.map(m => (
                <div key={m.id} className="bg-white border border-bdr rounded-[5px] p-4 flex items-start gap-3">
                  <div className="w-[36px] h-[36px] rounded-[4px] bg-ground flex items-center justify-center text-[16px] flex-shrink-0">{typeIcon(m.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold text-navy">{m.title}</div>
                    {m.description && <div className="text-[12px] text-muted mt-0.5">{m.description}</div>}
                    <div className="flex items-center gap-3 text-[11px] text-faint mt-1.5">
                      <span>{m.type === 'pdf' ? 'PDF' : 'Video'}{m.duration ? ` · ${m.duration}` : ''}</span>
                      <span>· {m.learnersComplete}/{m.learnersStarted || 0} completed</span>
                      {m.openQuestions > 0 && <span className="text-kamber font-semibold">· {m.openQuestions} open question{m.openQuestions !== 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(m)} className="px-[9px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="px-[9px] py-[5px] text-[11.5px] font-semibold bg-kred-dim text-red-700 rounded cursor-pointer hover:opacity-85">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-[8px] shadow-lg w-full max-w-[460px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-ground">
              <div className="text-[14px] font-bold text-navy">{form.id ? 'Edit Material' : 'Add Material'}</div>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <label className="text-[12px] text-muted flex flex-col gap-1">
                Title *
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="border border-bdr rounded px-2.5 py-1.5 text-[13px]" placeholder="e.g. HR Policies & Leave Management" />
              </label>
              <label className="text-[12px] text-muted flex flex-col gap-1">
                Description
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="border border-bdr rounded px-2.5 py-1.5 text-[13px] min-h-[70px]" placeholder="What this covers, so the AI assistant can answer questions about it accurately" />
              </label>
              <div className="flex gap-3">
                <label className="text-[12px] text-muted flex flex-col gap-1 flex-1">
                  Type
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'video' | 'pdf' }))}
                    className="border border-bdr rounded px-2.5 py-1.5 text-[13px]">
                    <option value="video">Video</option>
                    <option value="pdf">PDF / Document</option>
                  </select>
                </label>
                <label className="text-[12px] text-muted flex flex-col gap-1 flex-1">
                  Duration <span className="text-faint">(optional)</span>
                  <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="border border-bdr rounded px-2.5 py-1.5 text-[13px]" placeholder="e.g. 18 min or 12 pages" />
                </label>
              </div>
              <label className="text-[12px] text-muted flex flex-col gap-1">
                {form.type === 'pdf' ? 'Document URL' : 'Video URL'} * <span className="text-faint">(a direct link the browser can open{form.type === 'video' ? ' — an .mp4 link plays inline with watch-time tracking' : ''})</span>
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  className="border border-bdr rounded px-2.5 py-1.5 text-[13px]" placeholder="https://…" />
              </label>
              <label className="text-[12px] text-muted flex flex-col gap-1">
                Day <span className="text-faint">(optional — leave blank if it doesn't need a specific day)</span>
                <input type="number" min={1} value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                  className="border border-bdr rounded px-2.5 py-1.5 text-[13px] w-[100px]" placeholder="e.g. 1" />
              </label>
            </div>
            <div className="p-4 border-t border-ground flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-[12px] py-[7px] text-[12px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.url.trim()}
                className="px-[12px] py-[7px] text-[12px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? 'Saving…' : form.id ? 'Save Changes' : 'Add Material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
