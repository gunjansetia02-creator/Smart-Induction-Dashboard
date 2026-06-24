export function ProgressRing({
  value,
  color,
  size = 70,
  strokeWidth = 5,
}: {
  value: number
  color: string
  size?: number
  strokeWidth?: number
}) {
  const r = (size / 2) - strokeWidth
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(100, Math.max(0, value)) / 100)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          fill="none"
          stroke="#EDF1F7"
          strokeWidth={strokeWidth}
          cx={size / 2}
          cy={size / 2}
          r={r}
        />
        <circle
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-sm font-extrabold tabular"
        style={{ color }}
      >
        {value}%
      </div>
    </div>
  )
}
