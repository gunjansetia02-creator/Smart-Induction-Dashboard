'use client'

import { useRef, useState } from 'react'
import { Pill } from '@/components/ui/Pill'
import { ProgressBar } from '@/components/ui/ProgressBar'

export interface EmployeeQuestion {
  id: string
  question: string
  aiAnswer: string | null
  resolved: boolean
  escalated: boolean
}

export interface EmployeeMaterial {
  id: string
  title: string
  description: string
  type: 'video' | 'pdf'
  url: string
  duration: string | null
  day: number | null
  status: 'not-started' | 'in-progress' | 'complete' | 'has-doubt'
  watchedPercent: number
  questions: EmployeeQuestion[]
}

function statusPill(m: EmployeeMaterial) {
  if (m.status === 'complete')    return <Pill variant="green">{m.type === 'pdf' ? 'Read' : 'Watched'}</Pill>
  if (m.status === 'has-doubt')   return <Pill variant="amber">Has open question</Pill>
  if (m.status === 'in-progress') return <Pill variant="blue">{m.type === 'pdf' ? 'In Progress' : `${m.watchedPercent}% watched`}</Pill>
  return <Pill variant="grey">Not started</Pill>
}

function iconBg(m: EmployeeMaterial) {
  if (m.status === 'complete')    return 'bg-kgreen-dim text-kgreen'
  if (m.status === 'in-progress') return 'bg-sky text-white'
  if (m.type === 'pdf')           return 'bg-kamber-dim text-kamber'
  return 'bg-sky-dim text-sky'
}

async function saveProgress(materialId: string, employeeEmail: string, employeeName: string, patch: { status?: string; watchedPercent?: number }) {
  await fetch(`/api/materials/${materialId}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeEmail, employeeName, ...patch }),
  }).catch(() => {})
}

function MaterialRow({
  material,
  employeeEmail,
  employeeName,
  onUpdate,
}: {
  material: EmployeeMaterial
  employeeEmail: string
  employeeName: string
  onUpdate: (patch: Partial<EmployeeMaterial>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [asking, setAsking] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const lastSentRef = useRef(0)

  function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const video = e.currentTarget
    if (!video.duration) return
    const percent = Math.round((video.currentTime / video.duration) * 100)
    if (percent <= material.watchedPercent) return // never regress on scrub-back

    const now = Date.now()
    const status = percent >= 95 ? 'complete' : 'in-progress'
    onUpdate({ watchedPercent: percent, status })

    if (now - lastSentRef.current > 4000 || percent >= 95) {
      lastSentRef.current = now
      saveProgress(material.id, employeeEmail, employeeName, { watchedPercent: percent, status })
    }
  }

  function markDone() {
    onUpdate({ status: 'complete', watchedPercent: 100 })
    saveProgress(material.id, employeeEmail, employeeName, { status: 'complete', watchedPercent: 100 })
  }

  function startIfNeeded() {
    if (material.status === 'not-started') {
      onUpdate({ status: 'in-progress' })
      saveProgress(material.id, employeeEmail, employeeName, { status: 'in-progress' })
    }
  }

  async function askQuestion() {
    if (!questionText.trim()) return
    setAsking(true)
    try {
      const res = await fetch(`/api/materials/${material.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionText.trim(), employeeEmail, employeeName }),
      })
      const data = await res.json()
      if (res.ok) {
        const nextStatus = material.status === 'not-started' ? 'in-progress' : material.status
        onUpdate({
          questions: [...material.questions, { id: data.question.id, question: data.question.question, aiAnswer: data.question.ai_answer, resolved: data.question.resolved, escalated: data.question.escalated }],
          status: nextStatus,
        })
        if (nextStatus !== material.status) {
          saveProgress(material.id, employeeEmail, employeeName, { status: nextStatus })
        }
        setQuestionText('')
      }
    } finally {
      setAsking(false)
    }
  }

  async function markQuestionResolved(qid: string, resolved: boolean) {
    await fetch(`/api/materials/questions/${qid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolved ? { resolved: true } : { escalated: true }),
    })
    const nextStatus = resolved ? material.status : 'has-doubt'
    onUpdate({
      questions: material.questions.map(q => (q.id === qid ? { ...q, resolved, escalated: !resolved || q.escalated } : q)),
      status: nextStatus,
    })
    if (!resolved) {
      saveProgress(material.id, employeeEmail, employeeName, { status: nextStatus })
    }
  }

  const openQuestions = material.questions.filter(q => !q.resolved)

  return (
    <div className="border-b border-ground last:border-0 py-[13px]">
      <div className="flex items-center gap-[13px]">
        <div className={`w-[38px] h-[38px] rounded-[4px] flex items-center justify-center text-[16px] flex-shrink-0 ${iconBg(material)}`}>
          {material.type === 'pdf' ? '📄' : '▶'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-navy">{material.title}</div>
          {material.description && <div className="text-[11.5px] text-muted mt-0.5">{material.description}</div>}
          <div className="flex items-center gap-[9px] text-[11.5px] text-muted mt-1 flex-wrap">
            <span>{material.type === 'pdf' ? 'PDF' : 'Video'}{material.duration ? ` · ${material.duration}` : ''}</span>
            {statusPill(material)}
            {openQuestions.length > 0 && <span className="text-kamber">{openQuestions.length} awaiting answer</span>}
          </div>
          <div className="mt-1.5 max-w-[280px]">
            <ProgressBar value={material.status === 'complete' ? 100 : material.watchedPercent} color={material.status === 'complete' ? 'green' : 'sky'} />
          </div>
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => { setExpanded(e => !e); startIfNeeded() }}
            className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85"
          >
            {expanded ? 'Close' : material.status === 'complete' ? (material.type === 'pdf' ? 'Reopen' : 'Rewatch') : 'Open'}
          </button>
          <button
            onClick={() => setAskOpen(a => !a)}
            className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85"
          >
            Ask a Question
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 ml-[51px] p-3 bg-ground rounded-[5px]">
          {material.type === 'video' ? (
            videoError ? (
              <div className="text-[12px] text-muted mb-2">Couldn&apos;t load a preview for this link. You can still mark it done once you&apos;ve watched it.</div>
            ) : (
              <video
                src={material.url}
                controls
                className="w-full max-w-[480px] rounded-[4px] bg-black"
                onTimeUpdate={handleTimeUpdate}
                onError={() => setVideoError(true)}
                onEnded={markDone}
              />
            )
          ) : (
            <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-sky font-semibold no-underline hover:underline">
              Open Document ↗
            </a>
          )}
          {material.status !== 'complete' && (
            <div className="mt-2.5">
              <button onClick={markDone} className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-kgreen text-white rounded cursor-pointer hover:opacity-85">
                ✓ Mark as Done
              </button>
            </div>
          )}
        </div>
      )}

      {askOpen && (
        <div className="mt-3 ml-[51px] p-3 bg-ground rounded-[5px] max-w-[480px]">
          {material.questions.length > 0 && (
            <div className="flex flex-col gap-2.5 mb-3">
              {material.questions.map(q => (
                <div key={q.id} className="bg-white rounded-[4px] p-2.5 border border-bdr">
                  <div className="text-[12.5px] text-navy font-medium">Q: {q.question}</div>
                  {q.aiAnswer ? (
                    <div className="text-[12px] text-muted mt-1.5">🤖 {q.aiAnswer}</div>
                  ) : (
                    <div className="text-[12px] text-kamber mt-1.5">Sent straight to HR — AI assistant isn&apos;t set up yet.</div>
                  )}
                  {q.aiAnswer && !q.resolved && (
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => markQuestionResolved(q.id, true)} className="px-[8px] py-[3px] text-[11px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">👍 This helped</button>
                      <button onClick={() => markQuestionResolved(q.id, false)} className="px-[8px] py-[3px] text-[11px] font-semibold bg-kred-dim text-red-700 rounded cursor-pointer hover:opacity-85">Still need help</button>
                    </div>
                  )}
                  {q.escalated && !q.resolved && <div className="text-[11px] text-kamber mt-1.5">⚠️ Escalated to HR</div>}
                  {q.resolved && <div className="text-[11px] text-kgreen mt-1.5">✓ Resolved</div>}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askQuestion()}
              placeholder="Ask something about this material…"
              className="flex-1 border border-bdr rounded px-2.5 py-1.5 text-[12.5px]"
            />
            <button onClick={askQuestion} disabled={asking || !questionText.trim()} className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40">
              {asking ? 'Asking…' : 'Ask'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function MaterialsListClient({
  materials,
  employeeEmail,
  employeeName,
}: {
  materials: EmployeeMaterial[]
  employeeEmail: string
  employeeName: string
}) {
  const [items, setItems] = useState(materials)

  function updateMaterial(id: string, patch: Partial<EmployeeMaterial>) {
    setItems(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)))
  }

  const grouped = new Map<string, EmployeeMaterial[]>()
  for (const m of items) {
    const key = m.day === null ? 'General / Anytime' : `Day ${m.day}`
    grouped.set(key, [...(grouped.get(key) ?? []), m])
  }

  return (
    <>
      {Array.from(grouped.entries()).map(([groupLabel, groupItems]) => (
        <div key={groupLabel} className="mb-5">
          <div className="text-[11px] font-bold tracking-[0.6px] uppercase text-faint mb-2">{groupLabel}</div>
          <div className="bg-white border border-bdr rounded-[5px] px-[17px]">
            {groupItems.map(m => (
              <MaterialRow
                key={m.id}
                material={m}
                employeeEmail={employeeEmail}
                employeeName={employeeName}
                onUpdate={patch => updateMaterial(m.id, patch)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}
