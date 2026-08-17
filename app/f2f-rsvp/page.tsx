import RsvpForm from './RsvpForm'

export default async function F2FRsvpPage({
  searchParams,
}: {
  searchParams: Promise<{ response?: string }>
}) {
  const { response: responseParam } = await searchParams
  const response: 'confirmed' | 'change' = responseParam === 'change' ? 'change' : 'confirmed'
  const isConfirmed = response === 'confirmed'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <p
          className={`mb-1 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${
            isConfirmed ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {isConfirmed ? "Confirmed, I'll Attend" : 'Change of Plan'}
        </p>
        <h1 className="mb-1 mt-3 text-lg font-semibold text-gray-900">F2F &mdash; 21st August 2026</h1>
        <p className="mb-6 text-sm text-gray-600">
          Please confirm your name and email so we can match your response for logistics planning.
        </p>

        <RsvpForm response={response} />
      </div>
    </main>
  )
}
