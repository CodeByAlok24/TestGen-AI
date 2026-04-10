import { useState } from 'react'

const DEFAULT_TEST = 'def test_divide_by_zero():\n    assert divide(10, 0) == 0\n'
const DEFAULT_ERR  = 'ValueError: Cannot divide by zero'

const darkTextarea = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(0,217,255,0.2)',
  borderRadius: 10, padding: '12px 14px',
  color: '#a0e0ff', fontSize: '0.8rem',
  fontFamily: 'Fira Code, Cascadia Code, monospace',
  lineHeight: 1.65, outline: 'none', resize: 'vertical',
  transition: 'border-color 0.2s',
}

export default function HealPanel({ onHeal, result }) {
  const [failingTest, setFailingTest] = useState(DEFAULT_TEST)
  const [errorMsg, setErrorMsg]       = useState(DEFAULT_ERR)
  const [loading, setLoading]         = useState(false)
  const [copied, setCopied]           = useState(false)

  async function submit() {
    setLoading(true)
    try { await onHeal(failingTest, errorMsg) }
    finally { setLoading(false) }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result || '')
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#444', marginBottom: 4 }}>Quest Log</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.4rem', color: '#00d9ff' }}>✨</span>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Self-Heal</h2>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#555' }}>Brew a potion to fix your failing tests using AI.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Input side */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(10,14,39,0.8), rgba(0,0,0,0.85))',
          border: '1px solid rgba(0,217,255,0.2)', borderRadius: 14, padding: 20,
          backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00d9ff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            🩺 Failing Test
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: 6 }}>
              Test Code
            </label>
            <textarea
              rows={7}
              style={darkTextarea}
              value={failingTest}
              onChange={e => setFailingTest(e.target.value)}
              placeholder="Paste your failing test here..."
              onFocus={e => e.target.style.borderColor = 'rgba(0,217,255,0.55)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,217,255,0.2)'}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: 6 }}>
              Error Message
            </label>
            <textarea
              rows={3}
              style={{ ...darkTextarea, borderColor: 'rgba(255,0,255,0.2)' }}
              value={errorMsg}
              onChange={e => setErrorMsg(e.target.value)}
              placeholder="Error / exception from the test run..."
              onFocus={e => e.target.style.borderColor = 'rgba(255,0,255,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,0,255,0.2)'}
            />
          </div>
          <button
            type="button" onClick={submit} disabled={loading}
            style={{
              padding: '12px 20px', borderRadius: 8, border: 'none',
              background: loading ? 'rgba(0,217,255,0.1)' : 'linear-gradient(90deg, #00d9ff, #a855f7)',
              color: loading ? '#444' : '#000', fontWeight: 800, fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(0,217,255,0.3)',
              transition: 'all 0.2s', letterSpacing: '0.05em',
            }}>
            {loading ? '⚗️ Brewing potion...' : '✨ Heal Test'}
          </button>
        </div>

        {/* Result side */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(10,14,39,0.8), rgba(0,0,0,0.85))',
          border: '1px solid rgba(168,85,247,0.25)', borderRadius: 14, padding: 20,
          backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              💊 Healed Result
            </div>
            {result && (
              <button onClick={handleCopy} style={{
                padding: '5px 12px', borderRadius: 6,
                border: `1px solid ${copied ? 'rgba(0,255,150,0.4)' : 'rgba(168,85,247,0.3)'}`,
                background: copied ? 'rgba(0,255,150,0.1)' : 'rgba(168,85,247,0.07)',
                color: copied ? '#00ff96' : '#a855f7',
                fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            )}
          </div>
          <div style={{
            flex: 1, background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(168,85,247,0.12)',
            borderRadius: 10, padding: '14px 16px',
            fontFamily: 'Fira Code, Cascadia Code, monospace',
            fontSize: '0.76rem', lineHeight: 1.75, color: '#c0a0ff',
            minHeight: 260, maxHeight: 380, overflow: 'auto',
          }}>
            {result
              ? <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>
              : <span style={{ color: '#333' }}>// Healed test will appear here after brew...</span>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
