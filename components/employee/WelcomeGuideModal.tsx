'use client'

import { useState } from 'react'

const STEPS = [
  {
    icon: '👋',
    title: 'Welcome to your Induction Dashboard',
    body: 'This is where you\'ll complete your one-week induction — everything you need is right here. Here\'s a quick tour before you get started.',
  },
  {
    icon: '🏠',
    title: 'Home',
    body: 'Your progress at a glance — how much you\'ve completed, what\'s left, and any upcoming calls.',
  },
  {
    icon: '🎬',
    title: 'My Materials',
    body: 'Review each video or document in order. After each one, take its short quiz — score 70% or more and it\'s marked complete. Below that, you\'ll review it again and retake the quiz.',
  },
  {
    icon: '👋',
    title: 'Batch Channel',
    body: 'Meet the other new joiners who started around the same time as you.',
  },
  {
    icon: '💬',
    title: 'Doubt Session',
    body: 'Have a question about any material? Ask it right here — it goes straight to HR by email. Still stuck after that? Join Monday\'s optional doubt-clearing call to talk it through live.',
  },
  {
    icon: '✅',
    title: "You're all set!",
    body: 'Once every material and its quiz are complete, your induction is officially wrapped up. Let\'s get started.',
  },
]

export function WelcomeGuideModal() {
  const [open, setOpen] = useState(true)
  const [step, setStep] = useState(0)

  if (!open) return null

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[12px] shadow-lg w-full max-w-[440px] overflow-hidden">
        <div className="p-6 text-center">
          <div className="text-[40px] mb-3">{current.icon}</div>
          <div className="text-[16px] font-bold text-navy mb-2">{current.title}</div>
          <p className="text-[13.5px] text-muted leading-relaxed">{current.body}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 pb-4">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i === step ? 'bg-sky' : 'bg-bdr'}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-ground">
          <button
            onClick={() => setOpen(false)}
            className="text-[12px] text-muted hover:text-navy cursor-pointer bg-transparent border-none"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-[14px] py-[7px] text-[12.5px] font-semibold bg-white text-navy border border-bdr rounded cursor-pointer hover:opacity-85"
              >
                Back
              </button>
            )}
            <button
              onClick={() => (isLast ? setOpen(false) : setStep(s => s + 1))}
              className="px-[14px] py-[7px] text-[12.5px] font-semibold bg-sky text-white rounded cursor-pointer hover:opacity-85"
            >
              {isLast ? "Let's go →" : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
