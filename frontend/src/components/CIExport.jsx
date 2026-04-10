import { useState } from 'react'

const FRAMEWORKS = [
  { id: 'pytest', label: '🐍 Pytest',  color: '#00d9ff' },
  { id: 'junit',  label: '☕ JUnit',  color: '#f59e0b' },
  { id: 'jest',   label: '🟨 Jest',   color: '#f0d060' },
]

const CI_PROVIDERS = [
  { id: 'github',   label: 'GitHub Actions', icon: '⚡' },
  { id: 'gitlab',   label: 'GitLab CI',      icon: '🦊' },
  { id: 'jenkins',  label: 'Jenkins',         icon: '⚙️' },
]

export default function CIExport({ onExport, yaml }) {
  const [framework, setFramework] = useState('pytest')
  const [provider, setProvider]   = useState('github')
  const [loading, setLoading]     = useState(false)
  const [copied, setCopied]       = useState(false)

  async function submit() {
    setLoading(true)
    try { await onExport(framework) }
    finally { setLoading(false) }
  }

  function handleCopy() {
    navigator.clipboard.writeText(yaml || '')
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  function handleDownload() {
    const blob = new Blob([yaml || ''], { type: 'text/yaml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `ci-workflow-${framework}.yml`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#444', marginBottom: 4 }}>Quest Log</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: '1.4rem', color: '#00d9ff' }}>⚙️</span>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>CI Forge</h2>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#555' }}>Forge a CI/CD workflow from your test arsenal.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        {/* Config panel */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(10,14,39,0.8), rgba(0,0,0,0.85))',
          border: '1px solid rgba(0,217,255,0.2)', borderRadius: 14, padding: 20,
          backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          {/* Framework */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ff00ff', marginBottom: 10 }}>
              Test Framework
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FRAMEWORKS.map(f => (
                <button key={f.id} type="button" onClick={() => setFramework(f.id)}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1px solid ${framework === f.id ? f.color + '66' : 'rgba(255,255,255,0.06)'}`,
                    background: framework === f.id ? `${f.color}18` : 'rgba(0,0,0,0.3)',
                    color: framework === f.id ? f.color : '#555',
                    fontSize: '0.8rem', fontWeight: 700, textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                  {f.label}
                  {framework === f.id && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: f.color + '22', border: `1px solid ${f.color}44`, borderRadius: 4, padding: '2px 6px', color: f.color }}>
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* CI Provider */}
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ff00ff', marginBottom: 10 }}>
              CI Provider
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {CI_PROVIDERS.map(p => (
                <button key={p.id} type="button" onClick={() => setProvider(p.id)}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    border: `1px solid ${provider === p.id ? 'rgba(0,217,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    background: provider === p.id ? 'rgba(0,217,255,0.1)' : 'rgba(0,0,0,0.3)',
                    color: provider === p.id ? '#00d9ff' : '#555',
                    fontSize: '0.8rem', fontWeight: 700, textAlign: 'left',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Forge button */}
          <button type="button" onClick={submit} disabled={loading}
            style={{
              marginTop: 'auto', padding: '13px 20px', borderRadius: 8, border: 'none',
              background: loading ? 'rgba(0,217,255,0.08)' : 'linear-gradient(90deg, #00d9ff, #a855f7)',
              color: loading ? '#444' : '#000', fontWeight: 800, fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(0,217,255,0.3)',
              transition: 'all 0.2s', letterSpacing: '0.05em',
            }}>
            {loading ? '⚙ Forging...' : '⚙️ Forge Workflow'}
          </button>
        </div>

        {/* YAML output */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(10,14,39,0.8), rgba(0,0,0,0.85))',
          border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: 20,
          backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              📄 Workflow YAML
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCopy} disabled={!yaml}
                style={{
                  padding: '5px 12px', borderRadius: 6,
                  border: `1px solid ${copied ? 'rgba(0,255,150,0.4)' : 'rgba(0,217,255,0.3)'}`,
                  background: copied ? 'rgba(0,255,150,0.1)' : 'rgba(0,217,255,0.06)',
                  color: copied ? '#00ff96' : '#00d9ff',
                  fontSize: '0.72rem', fontWeight: 700,
                  cursor: yaml ? 'pointer' : 'not-allowed', opacity: yaml ? 1 : 0.4,
                  transition: 'all 0.2s',
                }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button onClick={handleDownload} disabled={!yaml}
                style={{
                  padding: '5px 12px', borderRadius: 6,
                  border: '1px solid rgba(168,85,247,0.3)',
                  background: 'rgba(168,85,247,0.06)', color: '#a855f7',
                  fontSize: '0.72rem', fontWeight: 700,
                  cursor: yaml ? 'pointer' : 'not-allowed', opacity: yaml ? 1 : 0.4,
                  transition: 'all 0.2s',
                }}>
                ⬇ Download
              </button>
            </div>
          </div>

          <div style={{
            flex: 1, background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(168,85,247,0.1)',
            borderRadius: 10, padding: '14px 16px',
            fontFamily: 'Fira Code, Cascadia Code, monospace',
            fontSize: '0.76rem', lineHeight: 1.75, color: '#c0a0ff',
            minHeight: 360, maxHeight: 480, overflow: 'auto',
          }}>
            {yaml
              ? <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{yaml}</pre>
              : (
                <div style={{ color: '#2a2040' }}>
                  <div style={{ color: '#3a2060', marginBottom: 4 }}># GitHub Actions workflow will appear here</div>
                  <div style={{ color: '#2a2040' }}>name: CI Pipeline</div>
                  <div style={{ color: '#2a2040' }}>on: [push, pull_request]</div>
                  <div style={{ color: '#2a2040' }}>jobs:</div>
                  <div style={{ color: '#2a2040', paddingLeft: 16 }}>test:</div>
                  <div style={{ color: '#2a2040', paddingLeft: 32 }}>runs-on: ubuntu-latest</div>
                  <div style={{ color: '#2a2040', paddingLeft: 32 }}>steps:</div>
                  <div style={{ color: '#2a2040', paddingLeft: 48 }}>- uses: actions/checkout@v3</div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
