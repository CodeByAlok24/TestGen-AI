import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts'
import Card from './Card'

export default function QualityScore({ scores }) {
  const data = [
    { metric: 'Coverage', value: scores?.coverage ?? 0 },
    { metric: 'Edge cases', value: scores?.edge_cases ?? 0 },
    { metric: 'Security', value: scores?.security ?? 0 },
    { metric: 'Readability', value: scores?.readability ?? 0 },
  ]

  return (
    <Card
      title="Quality score"
      subtitle="A simple view of the generated suite across four checks."
      right={
        <div className="rounded-2xl bg-[var(--panel-muted)] px-3 py-2 text-sm text-[var(--muted)]">
          Overall <span className="font-semibold text-[var(--text-strong)]">{scores?.overall ?? '—'}</span>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
        <div className="h-[260px] min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="rgba(15, 23, 42, 0.12)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(71, 85, 105, 0.95)', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="rgba(37, 99, 235, 0.95)"
                fill="rgba(37, 99, 235, 0.18)"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="text-sm font-semibold text-[var(--text-strong)]">Suggestions</div>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted)]">
            {(scores?.suggestions || ['Generate tests to see score suggestions.'])
              .slice(0, 4)
              .map((s, i) => (
                <li key={i} className="rounded-2xl bg-white px-3 py-3 shadow-sm">
                  {s}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
