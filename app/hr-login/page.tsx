export const metadata = { title: 'HR Sign In · Koenig Induction Portal' }

export default async function HrLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <main className="min-h-screen bg-ground flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] bg-white border border-bdr rounded-[10px] shadow-[0_4px_16px_rgba(16,24,40,0.08)] overflow-hidden">
        <div className="bg-navy px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-sky flex items-center justify-center text-white font-extrabold">K</div>
          <div>
            <div className="text-white text-[14px] font-bold leading-tight">Koenig Solutions</div>
            <div className="text-white/50 text-[10px] tracking-[0.8px] uppercase">Induction Portal</div>
          </div>
        </div>

        <form action="/api/hr-login" method="POST" className="px-6 py-6">
          <h1 className="text-[16px] font-bold text-navy mb-1">HR Admin sign in</h1>
          <p className="text-[12px] text-muted mb-4">Enter the HR dashboard password to continue.</p>

          <input type="hidden" name="next" value={next ?? '/hr'} />
          <label htmlFor="password" className="block text-[11px] font-semibold text-muted uppercase tracking-[0.5px] mb-1.5">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="w-full px-3 py-2 text-[13px] border border-bdr rounded-[6px] outline-none focus:border-sky focus:ring-2 focus:ring-sky/20"
          />

          {error && (
            <p className="text-[12px] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mt-3">
              That password isn&rsquo;t right. Please try again.
            </p>
          )}

          <button type="submit" className="mt-4 w-full py-2 text-[13px] font-semibold bg-sky text-white rounded-[6px] cursor-pointer hover:opacity-90">
            Sign in
          </button>
        </form>
      </div>
    </main>
  )
}
