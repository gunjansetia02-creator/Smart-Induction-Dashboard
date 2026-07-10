export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-40 bg-ground rounded mb-2" />
      <div className="h-3 w-64 bg-ground rounded mb-6" />
      <div className="grid grid-cols-4 gap-[14px] mb-5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-[92px] bg-ground rounded-[5px]" />
        ))}
      </div>
      <div className="h-[220px] bg-ground rounded-[5px]" />
    </div>
  )
}
