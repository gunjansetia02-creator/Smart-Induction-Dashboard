'use client'

import { Pill } from '@/components/ui/Pill'
import type { Joiner } from '@/lib/types'
import type { JoinerStatusEntry } from '@/app/api/joiners/status/route'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-[9px] border-b border-ground last:border-0 text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="text-navy font-medium text-right">{value || '—'}</span>
    </div>
  )
}

export function JoinerDetailModal({
  joiner,
  status,
  onClose,
}: {
  joiner: Joiner
  status: JoinerStatusEntry | null
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-[10px] shadow-lg w-full max-w-[480px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-ground flex items-start gap-3">
          <div
            className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-[15px] font-bold text-white flex-shrink-0"
            style={{ background: joiner.avatarColor }}
          >
            {joiner.initials}
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-bold text-navy">{joiner.name}</div>
            <div className="text-[12.5px] text-muted">{joiner.designation} · {joiner.dept}</div>
          </div>
          <button onClick={onClose} className="text-faint hover:text-navy cursor-pointer text-[18px] leading-none">✕</button>
        </div>

        <div className="p-5">
          <div className="text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint mb-1.5">Induction Status</div>
          {status ? (
            <div className="grid grid-cols-2 gap-2 mb-5">
              <div className="bg-ground rounded-[6px] p-2.5">
                <div className="text-[10.5px] text-muted mb-1">Welcome Invite</div>
                {status.welcomeEmailSent ? <Pill variant="green">Sent</Pill> : <Pill variant="grey">Not Sent</Pill>}
              </div>
              <div className="bg-ground rounded-[6px] p-2.5">
                <div className="text-[10.5px] text-muted mb-1">Meeting Invite</div>
                {status.meetingInviteSent ? <Pill variant="green">Sent</Pill> : <Pill variant="grey">Not Sent</Pill>}
              </div>
              <div className="bg-ground rounded-[6px] p-2.5">
                <div className="text-[10.5px] text-muted mb-1">Dashboard Login</div>
                {status.loggedIn ? <Pill variant="green">Logged In</Pill> : <Pill variant="amber">Not Yet</Pill>}
              </div>
              <div className="bg-ground rounded-[6px] p-2.5">
                <div className="text-[10.5px] text-muted mb-1">Materials</div>
                <span className="text-[13px] font-bold text-navy">{status.materialsComplete}/{status.materialsTotal}</span>
                <span className="text-[11px] text-muted"> ({status.materialsPercent}%)</span>
              </div>
              <div className="bg-ground rounded-[6px] p-2.5">
                <div className="text-[10.5px] text-muted mb-1">Doubts</div>
                {status.totalDoubts === 0 ? (
                  <Pill variant="grey">None Raised</Pill>
                ) : status.openDoubts > 0 ? (
                  <Pill variant="amber">{status.openDoubts} Open</Pill>
                ) : (
                  <Pill variant="green">All Resolved</Pill>
                )}
              </div>
              <div className="col-span-2 bg-ground rounded-[6px] p-2.5 flex items-center justify-between">
                <span className="text-[12px] text-muted">Overall Induction</span>
                {status.inductionComplete ? <Pill variant="green">🎉 Complete</Pill> : <Pill variant="blue">In Progress</Pill>}
              </div>
            </div>
          ) : (
            <div className="text-[12px] text-muted mb-5">Loading status…</div>
          )}

          <div className="text-[10.5px] font-bold tracking-[0.6px] uppercase text-faint mb-1.5">Profile (from PMS)</div>
          <div>
            <Field label="Designation" value={joiner.designation} />
            <Field label="Department" value={joiner.dept} />
            <Field label="Date of Joining" value={new Date(joiner.doj).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <Field label="Reporting Manager" value={joiner.reportingManager} />
            <Field label="Base Location" value={joiner.baseLocation} />
            <Field label="Office Email" value={joiner.officeEmail} />
            <Field label="Personal Email" value={joiner.personalEmail} />
            <Field label="Phone" value={joiner.phone} />
            <Field
              label="LinkedIn"
              value={joiner.linkedIn ? <a href={`https://${joiner.linkedIn.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-sky hover:underline">View Profile ↗</a> : null}
            />
            {joiner.pipStatus && <Field label="PIP Status" value={joiner.pipStatus} />}
          </div>
        </div>
      </div>
    </div>
  )
}
