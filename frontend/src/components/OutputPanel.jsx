import { useMemo, useState } from 'react'

const tabs = [
  { id: 'pytest', label: 'Pytest', ext: 'py' },
  { id: 'junit', label: 'JUnit', ext: 'java' },
  { id: 'jest', label: 'Jest', ext: 'test.js' },
]

function downloadText(filename, text) {
  const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function OutputPanel({ tests }) {
  const [tab, setTab] = useState('pytest')
  const [copied, setCopied] = useState(false)
  const code = useMemo(() => (tests && tests[tab]) || '', [tests, tab])

  function handleCopy() {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const activeTab = tabs.find((t) => t.id === tab)

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(18,24,46,0.84), rgba(9,13,28,0.92))',
        border: '1px solid rgba(138,180,255,0.18)',
        borderRadius: 22,
        padding: 20,
        backdropFilter: 'blur(18px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,143,216,0.12)' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6ddcff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Generated Tests
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(231,239,255,0.74)', marginTop: 3 }}>Switch frameworks below to view your generated tests.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCopy}
            disabled={!code}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid rgba(138,180,255,0.28)',
              background: copied ? 'rgba(109,220,255,0.18)' : 'rgba(255,255,255,0.04)',
              color: '#eef4ff',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: code ? 'pointer' : 'not-allowed',
              opacity: code ? 1 : 0.4,
              transition: 'all 0.2s',
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => downloadText(`test_generated.${activeTab?.ext}`, code)}
            disabled={!code}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid rgba(138,180,255,0.24)',
              background: 'rgba(255,255,255,0.04)',
              color: '#eef4ff',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: code ? 'pointer' : 'not-allowed',
              opacity: code ? 1 : 0.4,
              transition: 'all 0.2s',
            }}
          >
            Download
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: `1px solid ${tab === t.id ? 'rgba(109,220,255,0.55)' : 'rgba(138,180,255,0.16)'}`,
              background: tab === t.id ? 'rgba(127,140,255,0.18)' : 'rgba(255,255,255,0.03)',
              color: tab === t.id ? '#eef4ff' : 'rgba(231,239,255,0.74)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.04em',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          background: 'rgba(6,10,22,0.94)',
          border: '1px solid rgba(109,220,255,0.16)',
          borderRadius: 16,
          minHeight: 320,
          maxHeight: 420,
          overflow: 'auto',
          padding: '14px 16px',
          fontFamily: 'Fira Code, Cascadia Code, JetBrains Mono, Consolas, monospace',
          fontSize: '0.76rem',
          lineHeight: 1.75,
          color: '#d9f6ff',
        }}
      >
        {code ? (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</pre>
        ) : (
          <div style={{ color: 'rgba(194,208,243,0.56)', fontFamily: 'monospace' }}>
            <div style={{ color: '#6ddcff', marginBottom: 6 }}>Run Generate Tests to see output</div>
            <div>def test_fibonacci_happy_path():</div>
            <div style={{ paddingLeft: 20 }}>assert fibonacci(5) == 5</div>
            <div>def test_fibonacci_boundary():</div>
            <div style={{ paddingLeft: 20 }}>assert fibonacci(0) == 0</div>
          </div>
        )}
      </div>

      {code && (
        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(109,220,255,0.08)',
              border: '1px solid rgba(109,220,255,0.2)',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: '0.67rem',
              fontWeight: 700,
              color: '#6ddcff',
            }}
          >
            {code.split('\n').length} lines
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(110,255,193,0.08)',
              border: '1px solid rgba(110,255,193,0.2)',
              borderRadius: 8,
              padding: '4px 8px',
              fontSize: '0.67rem',
              fontWeight: 700,
              color: '#6effc1',
            }}
          >
            {(code.match(/def test_|it\(|@Test/g) || []).length} tests found
          </div>
        </div>
      )}
    </div>
  )
}
