'use client'

import { useMemo, useState } from 'react'
import { Pill } from '@/components/ui/Pill'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { VideoPlayer } from './VideoPlayer'
import { detectVideoSource } from '@/lib/video-embed'

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
  lastPosition: number
  questions: EmployeeQuestion[]
}

type StatusFilter = 'all' | 'not-started' | 'in-progress' | 'complete' | 'has-doubt'

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

async function saveProgress(materialId: string, employeeEmail: string, employeeName: string, patch: { status?: string; watchedPercent?: number; lastPositionSeconds?: number }) {
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
  isOpen,
  onToggleOpen,
  onUpdate,
}: {
  material: EmployeeMaterial
  employeeEmail: string
  employeeName: string
  isOpen: boolean
  onToggleOpen: () => void
  onUpdate: (patch: Partial<EmployeeMaterial>) => void
}) {
  const [askOpen, setAskOpen] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [asking, setAsking] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [faq, setFaq] = useState<{ id: string; question: string; ai_answer: string }[] | null>(null)

  const videoSource = material.type === 'video' ? detectVideoSource(material.url) : null

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

  function handleVideoProgress(percent: number, positionSeconds: number) {
    const status = percent >= 95 ? 'complete' : 'in-progress'
    onUpdate({ watchedPercent: percent, lastPosition: positionSeconds, status })
    saveProgress(material.id, employeeEmail, employeeName, { watchedPercent: percent, lastPositionSeconds: positionSeconds, status })
  }

  function toggleAsk() {
    const next = !askOpen
    setAskOpen(next)
    if (next && faq === null) {
      fetch(`/api/materials/${material.id}/faq`)
        .then(r => r.json())
        .then(d => setFaq(d.faq ?? []))
        .catch(() => setFaq([]))
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
            onClick={() => { onToggleOpen(); startIfNeeded() }}
            className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85"
          >
            {isOpen ? 'Close' : material.status === 'complete' ? (material.type === 'pdf' ? 'Reopen' : 'Rewatch') : material.watchedPercent > 0 ? 'Continue' : 'Open'}
          </button>
          <button
            onClick={toggleAsk}
            className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85"
          >
            Ask a Question
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 ml-[51px] p-3 bg-ground rounded-[5px]">
          {material.type === 'video' ? (
            videoError || videoSource?.kind === 'unsupported' ? (
              <div className="text-[12px] text-muted mb-2">Couldn&apos;t load a preview for this link. You can still mark it done once you&apos;ve watched it.</div>
            ) : (
              <VideoPlayer
                url={material.url}
                initialPercent={material.watchedPercent}
                initialPositionSeconds={material.lastPosition}
                onProgress={handleVideoProgress}
                onComplete={markDone}
                onUnplayable={() => setVideoError(true)}
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
          {faq && faq.length > 0 && (
            <div className="mb-3">
              <div className="text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint mb-1.5">Common Questions</div>
              <div className="flex flex-col gap-2">
                {faq.map(f => (
                  <div key={f.id} className="bg-white rounded-[4px] p-2.5 border border-bdr">
                    <div className="text-[12px] text-navy font-medium">Q: {f.question}</div>
                    <div className="text-[11.5px] text-muted mt-1">🤖 {f.ai_answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {material.questions.length > 0 && (
            <div className="flex flex-col gap-2.5 mb-3">
              <div className="text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint">Your Questions</div>
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
  const [openId, setOpenId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  function updateMaterial(id: string, patch: Partial<EmployeeMaterial>) {
    setItems(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)))
  }

  const total = items.length
  const completeCount = items.filter(m => m.status === 'complete').length
  const overallPercent = total > 0 ? Math.round((completeCount / total) * 100) : 0
  const continueItem = useMemo(
    () => items.find(m => m.status === 'in-progress' || m.status === 'has-doubt'),
    [items]
  )

  const filtered = items.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (search.trim() && !m.title.toLowerCase().includes(search.trim().toLowerCase()) && !m.description.toLowerCase().includes(search.trim().toLowerCase())) return false
    return true
  })

  const grouped = new Map<string, EmployeeMaterial[]>()
  for (const m of filtered) {
    const key = m.day === null ? 'General / Anytime' : `Day ${m.day}`
    grouped.set(key, [...(grouped.get(key) ?? []), m])
  }

  return (
    <div>
      <div className="flex items-center gap-4 bg-white border border-bdr rounded-[6px] p-4 mb-4">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <ProgressRing value={overallPercent} color={overallPercent === 100 ? '#27B882' : '#4A9BE8'} size={56} strokeWidth={5} />
          <span className="text-[9.5px] text-faint uppercase tracking-[0.5px] font-bold">Overall</span>
        </div>
        <div className="flex-1">
          {overallPercent === 100 ? (
            <div className="text-[13.5px] font-bold text-kgreen">🎉 Induction complete — nice work!</div>
          ) : continueItem ? (
            <>
              <div className="text-[11px] text-faint uppercase tracking-[0.5px] font-bold mb-0.5">Continue where you left off</div>
              <div className="text-[13.5px] font-bold text-navy">{continueItem.title}</div>
            </>
          ) : (
            <div className="text-[13.5px] font-bold text-navy">{completeCount}/{total} materials complete</div>
          )}
        </div>
        {continueItem && overallPercent !== 100 && (
          <button
            onClick={() => setOpenId(continueItem.id)}
            className="px-[12px] py-[7px] text-[12px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 flex-shrink-0"
          >
            Continue →
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search materials…"
          className="flex-1 max-w-[260px] border border-bdr rounded px-2.5 py-1.5 text-[12.5px]"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as StatusFilter)}
          className="border border-bdr rounded px-2.5 py-1.5 text-[12.5px]"
        >
          <option value="all">All statuses</option>
          <option value="not-started">Not started</option>
          <option value="in-progress">In progress</option>
          <option value="complete">Complete</option>
          <option value="has-doubt">Has open question</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-[13px]">No materials match your search/filter.</div>
      ) : (
        Array.from(grouped.entries()).map(([groupLabel, groupItems]) => (
          <div key={groupLabel} className="mb-5">
            <div className="text-[11px] font-bold tracking-[0.6px] uppercase text-faint mb-2">{groupLabel}</div>
            <div className="bg-white border border-bdr rounded-[5px] px-[17px]">
              {groupItems.map(m => (
                <MaterialRow
                  key={m.id}
                  material={m}
                  employeeEmail={employeeEmail}
                  employeeName={employeeName}
                  isOpen={openId === m.id}
                  onToggleOpen={() => setOpenId(prev => (prev === m.id ? null : m.id))}
                  onUpdate={patch => updateMaterial(m.id, patch)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
