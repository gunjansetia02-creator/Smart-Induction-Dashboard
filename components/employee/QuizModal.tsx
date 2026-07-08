'use client'

import { useEffect, useState } from 'react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
}

interface AttemptResult {
  score: number
  total: number
  passed: boolean
  threshold: number
}

export function QuizModal({
  materialId,
  materialTitle,
  employeeEmail,
  employeeName,
  onClose,
  onPassed,
}: {
  materialId: string
  materialTitle: string
  employeeEmail: string
  employeeName: string
  onClose: () => void
  onPassed: () => void
}) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AttemptResult | null>(null)

  useEffect(() => {
    fetch(`/api/materials/${materialId}/quiz`)
      .then(r => r.json())
      .then(d => setQuestions(d.questions ?? []))
      .catch(() => setQuestions([]))
  }, [materialId])

  async function submit() {
    if (!questions) return
    setSubmitting(true)
    try {
      const orderedAnswers = questions.map(q => answers[q.id] ?? -1)
      const res = await fetch(`/api/materials/${materialId}/quiz/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeEmail, employeeName, answers: orderedAnswers }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
        if (data.passed) onPassed()
      }
    } finally {
      setSubmitting(false)
    }
  }

  function retry() {
    setResult(null)
    setAnswers({})
  }

  const allAnswered = questions !== null && questions.length > 0 && questions.every(q => answers[q.id] !== undefined)

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-[8px] shadow-lg w-full max-w-[520px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-ground">
          <div className="text-[14px] font-bold text-navy">Quick Check: {materialTitle}</div>
          <div className="text-[11.5px] text-muted mt-0.5">Score 70% or higher to mark this material complete.</div>
        </div>

        <div className="p-4">
          {questions === null ? (
            <div className="text-center py-8 text-muted text-[13px]">Loading questions…</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-muted text-[13px]">No quiz has been set up for this material yet.</div>
          ) : result ? (
            <div className="text-center py-4">
              <div className={`text-[28px] font-extrabold ${result.passed ? 'text-kgreen' : 'text-red-600'}`}>
                {result.score}/{result.total}
              </div>
              <div className="text-[13px] text-navy font-semibold mt-1">
                {result.passed ? '🎉 Passed — material marked complete!' : `Below ${Math.round(result.threshold * 100)}% — review the material and try again.`}
              </div>
              {!result.passed && (
                <button onClick={retry} className="mt-4 px-[14px] py-[8px] text-[12.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85">
                  Retake Quiz
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {questions.map((q, i) => (
                <div key={q.id}>
                  <div className="text-[13px] font-semibold text-navy mb-1.5">{i + 1}. {q.question}</div>
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-2 px-2.5 py-1.5 rounded border text-[12.5px] cursor-pointer ${answers[q.id] === oi ? 'border-sky bg-sky-dim' : 'border-bdr hover:bg-ground'}`}>
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === oi}
                          onChange={() => setAnswers(a => ({ ...a, [q.id]: oi }))}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-ground flex justify-end gap-2">
          <button onClick={onClose} className="px-[12px] py-[7px] text-[12px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85">
            {result?.passed ? 'Close' : 'Cancel'}
          </button>
          {questions && questions.length > 0 && !result && (
            <button onClick={submit} disabled={submitting || !allAnswered} className="px-[12px] py-[7px] text-[12px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
