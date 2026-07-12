'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { BookSession } from './BookSession'
import { DEMO_EMPLOYEE_EMAIL, DEMO_EMPLOYEE_NAME } from './Materials'

interface DoubtQuestion {
  id: string
  question: string
  ai_answer: string | null
  hr_answer: string | null
  resolved: boolean
  created_at: string
  materials?: { title: string }
}

export function EmpDoubt({
  employeeEmail = DEMO_EMPLOYEE_EMAIL,
  employeeName = DEMO_EMPLOYEE_NAME,
}: {
  employeeEmail?: string
  employeeName?: string
} = {}) {
  const [questions, setQuestions] = useState<DoubtQuestion[] | null>(null)

  useEffect(() => {
    fetch(`/api/materials/questions/mine?employeeEmail=${encodeURIComponent(employeeEmail)}`)
      .then(r => r.json())
      .then(d => setQuestions(d.questions ?? []))
      .catch(() => setQuestions([]))
  }, [employeeEmail])

  return (
    <div className="grid grid-cols-[1fr_320px] gap-[18px]">
      <Card title="My Doubts" noPad>
        <div className="px-[17px]">
          {questions === null ? (
            <div className="text-center py-10 text-muted text-[13px]">Loading…</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 text-muted text-[13px]">
              You haven&apos;t needed to escalate anything to HR yet. Ask a question on any material in{' '}
              <strong className="text-navy">My Materials</strong> — if the AI can&apos;t help, it&apos;ll show up here.
            </div>
          ) : (
            questions.map(d => (
              <div key={d.id} className="py-3 border-b border-ground last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-[13px] text-navy font-medium">{d.question}</div>
                    <div className="text-[11.5px] text-muted mt-0.5">on &ldquo;{d.materials?.title ?? 'a material'}&rdquo;</div>
                  </div>
                  <Pill variant={d.resolved ? 'green' : 'amber'}>{d.resolved ? 'Answered' : 'Pending'}</Pill>
                </div>
                {d.hr_answer && (
                  <div className="mt-2 bg-kgreen-dim rounded-[4px] p-2.5 text-[12.5px] text-navy">
                    <strong>Gunjan&apos;s answer:</strong> {d.hr_answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <BookSession employeeEmail={employeeEmail} employeeName={employeeName} />
    </div>
  )
}
