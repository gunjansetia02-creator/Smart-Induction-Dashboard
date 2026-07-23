'use client'

import { useEffect, useState } from 'react'
import { WelcomeGuideModal } from './WelcomeGuideModal'

// Deliberately client-side: the actual "mark first visit" call only fires
// from a real browser running this script, after hydration — never during
// SSR of the page itself. That makes it immune to chat apps/messaging
// clients auto-fetching a shared link to build a preview card, which would
// otherwise silently consume the one-time flag before the real person opens
// it (a GET request never runs this effect).
export function FirstVisitGate({ email, isTestAccount }: { email: string; isTestAccount: boolean }) {
  const [show, setShow] = useState(isTestAccount)

  useEffect(() => {
    if (isTestAccount) return
    fetch('/api/joiners/mark-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(r => r.json())
      .then(d => { if (d.isFirstVisit) setShow(true) })
      .catch(() => {})
  }, [email, isTestAccount])

  if (!show) return null
  return <WelcomeGuideModal />
}
