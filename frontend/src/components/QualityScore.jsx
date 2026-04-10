import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'

export default function QualityScore({ scores }) {
  const data = [
    { metric: 'Coverage',    value: scores?.coverage    ?? 0 },
    { metric: 'Edge Cases',  value: scores?.edge_cases  ?? 0 },
    { metric: 'Security',    value: scores?.security    ?? 0 },
    { metric: 'Readability', value: scores?.readability ?? 0 },
  ]
  const overall = scores?.overall ?? null

  const metricColors = {
    Coverage:    '#00d9ff',
    'Edge Cases': '#a855f7',
    Security:    '#f59e0b',
    Readability: '#00ff96',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#444', marginBottom: 4 }}>Quest Log</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: '1.4rem', color: '#00d9ff' }}>📊</span>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Stats</h2>
          {overall !== null && (
            <div style={{
              marginLeft: 'auto',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.3)',
              borderRadius: 8, padding: '6px 14px',
              fontSize: '0.85rem', fontWeight: 800, color: '#00d9ff',
            }}>
              Overall: {overall}
            </div>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#555' }}>Inspect your test suite power levels and quality metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Radar chart */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(10,14,39,0.8), rgba(0,0,0,0.85))',
          border: '1px solid rgba(0,217,255,0.2)', borderRadius: 14, padding: 20,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            ⚡ Power Radar
          </div>
          {overall === null ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>📊</div>
                <div style={{ color: '#444', fontSize: '0.82rem' }}>Generate tests to see<br />quality analysis</div>
              </div>
            </div>
          ) : (
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data}>
                  <PolarGrid stroke="rgba(0,217,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#666', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="#00d9ff" fill="rgba(0,217,255,0.15)" strokeWidth={2} dot={{ fill: '#00d9ff', r: 3 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Metric bars + suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Individual metric bars */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(10,14,39,0.8), rgba(0,0,0,0.85))',
            border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: 20,
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              📈 Metrics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.map(d => (
                <div key={d.metric}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888' }}>{d.metric}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: metricColors[d.metric] }}>{d.value}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${metricColors[d.metric]}, ${metricColors[d.metric]}88)`,
                      width: `${d.value}%`, transition: 'width 0.8s ease',
                      boxShadow: `0 0 8px ${metricColors[d.metric]}66`,
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(10,14,39,0.8), rgba(0,0,0,0.85))',
            border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: 20,
            backdropFilter: 'blur(12px)', flex: 1,
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
              💡 AI Suggestions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(scores?.suggestions || ['Generate tests to unlock suggestions.']).slice(0, 4).map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(245,158,11,0.15)',
                  borderRadius: 8, padding: '8px 12px',
                  fontSize: '0.78rem', color: '#888', lineHeight: 1.5,
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
