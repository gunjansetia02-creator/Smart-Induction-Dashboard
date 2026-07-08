'use client'

import { useEffect, useState } from 'react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_index: number
}

const EMPTY_OPTIONS = ['', '', '', '']

export function QuizManagerModal({
  materialId,
  materialTitle,
  onClose,
  onCountChange,
}: {
  materialId: string
  materialTitle: string
  onClose: () => void
  onCountChange: (count: number) => void
}) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [newQuestion, setNewQuestion] = useState('')
  const [newOptions, setNewOptions] = useState<string[]>(EMPTY_OPTIONS)
  const [newCorrect, setNewCorrect] = useState(0)
  const [saving, setSaving] = useState(false)

  function load() {
    fetch(`/api/materials/${materialId}/quiz?admin=true`)
      .then(r => r.json())
      .then(d => {
        setQuestions(d.questions ?? [])
        onCountChange((d.questions ?? []).length)
      })
      .catch(() => setQuestions([]))
  }

  useEffect(load, [materialId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function addQuestion() {
    const trimmedOptions = newOptions.map(o => o.trim())
    if (!newQuestion.trim() || trimmedOptions.some(o => !o)) return
    setSaving(true)
    try {
      const res = await fetch(`/api/materials/${materialId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion.trim(), options: trimmedOptions, correctIndex: newCorrect }),
      })
      if (res.ok) {
        setNewQuestion('')
        setNewOptions(EMPTY_OPTIONS)
        setNewCorrect(0)
        load()
      }
    } finally {
      setSaving(false)
    }
  }

  async function deleteQuestion(qid: string) {
    await fetch(`/api/materials/quiz/${qid}`, { method: 'DELETE' })
    load()
  }

  const count = questions?.length ?? 0

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-[8px] shadow-lg w-full max-w-[520px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-ground">
          <div className="text-[14px] font-bold text-navy">Quiz: {materialTitle}</div>
          <div className="text-[11.5px] text-muted mt-0.5">
            Employees must score 70%+ to mark this material complete. Recommend 5–7 questions.
          </div>
        </div>

        <div className="p-4">
          {questions === null ? (
            <div className="text-center py-6 text-muted text-[13px]">Loading…</div>
          ) : (
            <>
              {count === 0 && (
                <div className="text-center py-4 text-muted text-[12.5px] mb-3">No quiz questions yet — this material can be marked done without a quiz until you add some.</div>
              )}
              <div className="flex flex-col gap-2.5 mb-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="border border-bdr rounded-[5px] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-[12.5px] font-semibold text-navy">{i + 1}. {q.question}</div>
                      <button onClick={() => deleteQuestion(q.id)} className="text-[11px] text-red-600 hover:underline cursor-pointer bg-transparent border-none p-0 whitespace-nowrap">Delete</button>
                    </div>
                    <div className="mt-1.5 flex flex-col gap-1">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`text-[11.5px] px-2 py-1 rounded ${oi === q.correct_index ? 'bg-kgreen-dim text-kgreen font-semibold' : 'text-muted'}`}>
                          {oi === q.correct_index ? '✓ ' : ''}{opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border border-dashed border-bdr rounded-[5px] p-3">
                <div className="text-[11px] font-bold tracking-[0.6px] uppercase text-faint mb-2">Add Question</div>
                <input
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Question text"
                  className="w-full border border-bdr rounded px-2.5 py-1.5 text-[12.5px] mb-2"
                />
                <div className="flex flex-col gap-1.5 mb-2">
                  {newOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={newCorrect === i}
                        onChange={() => setNewCorrect(i)}
                        title="Mark as correct answer"
                      />
                      <input
                        value={opt}
                        onChange={e => setNewOptions(prev => prev.map((o, oi) => (oi === i ? e.target.value : o)))}
                        placeholder={`Option ${i + 1}${i === 0 ? ' (select the radio button for the correct one)' : ''}`}
                        className="flex-1 border border-bdr rounded px-2.5 py-1.5 text-[12.5px]"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={addQuestion}
                  disabled={saving || !newQuestion.trim() || newOptions.some(o => !o.trim())}
                  className="px-[10px] py-[5px] text-[11.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40"
                >
                  {saving ? 'Adding…' : '+ Add Question'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-ground flex justify-end">
          <button onClick={onClose} className="px-[12px] py-[7px] text-[12px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">Done</button>
        </div>
      </div>
    </div>
  )
}
