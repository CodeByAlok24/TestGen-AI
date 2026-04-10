import { useRef, useState } from 'react'
import Editor from '@monaco-editor/react'

const codeLanguages = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'java', label: 'Java' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
]

const testLevels = [
  { id: 'unit', label: 'Unit' },
  { id: 'integration', label: 'Integration' },
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'system', label: 'System' },
]

const DEMO_CODE = `def create_order(user_service, inventory_service, order_repo, user_id, item_id):
    user = user_service.get_user(user_id)
    item = inventory_service.get_item(item_id)

    if not user or not item:
        raise ValueError("invalid order")

    order = {"user": user["id"], "item": item["id"]}
    return order_repo.save(order)
`

const s = {
  card: {
    background: 'linear-gradient(180deg, rgba(18,24,46,0.84), rgba(9,13,28,0.92))',
    border: '1px solid rgba(138,180,255,0.18)',
    borderRadius: 22,
    padding: 20,
    backdropFilter: 'blur(18px)',
  },
  label: {
    fontSize: '0.65rem',
    fontWeight: 800,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(194,208,243,0.56)',
    display: 'block',
    marginBottom: 6,
  },
  chipRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  chip: (active) => ({
    padding: '6px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    border: `1px solid ${active ? 'rgba(109,220,255,0.45)' : 'rgba(138,180,255,0.18)'}`,
    background: active ? 'rgba(127,140,255,0.16)' : 'rgba(255,255,255,0.03)',
    color: active ? '#eef4ff' : 'rgba(231,239,255,0.74)',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    transition: 'all 0.2s',
  }),
  outlineBtn: {
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px solid rgba(138,180,255,0.28)',
    background: 'rgba(255,255,255,0.04)',
    color: '#eef4ff',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  generateBtn: (disabled) => ({
    padding: '11px 22px',
    borderRadius: 12,
    border: 'none',
    background: disabled ? 'rgba(127,140,255,0.16)' : 'linear-gradient(90deg, #7f8cff, #6ddcff)',
    color: disabled ? 'rgba(194,208,243,0.56)' : '#07101f',
    fontWeight: 800,
    fontSize: '0.85rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.05em',
    boxShadow: disabled ? 'none' : '0 10px 28px rgba(73,92,180,0.24)',
  }),
  select: {
    background: 'rgba(8,11,24,0.88)',
    border: '1px solid rgba(138,180,255,0.22)',
    borderRadius: 10,
    padding: '6px 10px',
    color: '#eef4ff',
    fontSize: '0.78rem',
    cursor: 'pointer',
    outline: 'none',
  },
}

export default function InputWorkspace({ onGenerate, loading }) {
  const [type, setType] = useState('code')
  const [mode, setMode] = useState('black_box')
  const [testLevel, setTestLevel] = useState('integration')
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState(DEMO_CODE)
  const fileInputRef = useRef(null)

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => setCode(evt.target?.result || '')
    reader.readAsText(file)
    e.target.value = ''
  }

  function buildRequestInput() {
    if (type !== 'code') return code
    const label = codeLanguages.find((l) => l.id === language)?.label || language
    return `Language: ${label}\n\n${code}`
  }

  const lineCount = code.length > 0 ? code.split('\n').length : 0

  return (
    <div style={s.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(138,180,255,0.12)' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6ddcff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Input Workspace
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(231,239,255,0.74)', marginTop: 3 }}>Choose the source, pick the test mode, then generate.</div>
        </div>
        <div style={{ display: 'flex', background: 'rgba(8,11,24,0.84)', border: '1px solid rgba(138,180,255,0.18)', borderRadius: 12, padding: 4, gap: 2 }}>
          {[{ id: 'black_box', label: 'Black Box' }, { id: 'white_box', label: 'White Box' }].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: mode === m.id ? 'linear-gradient(135deg, rgba(127,140,255,0.32), rgba(109,220,255,0.18))' : 'transparent',
                color: mode === m.id ? '#eef4ff' : 'rgba(194,208,243,0.56)',
                transition: 'all 0.2s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={s.label}>Source Type</span>
        <div style={s.chipRow}>
          {[{ id: 'code', label: 'Code' }, { id: 'api', label: 'API' }, { id: 'story', label: 'Story' }].map((t) => (
            <button key={t.id} type="button" onClick={() => { setType(t.id); setCode(t.id === 'code' ? DEMO_CODE : '') }} style={s.chip(type === t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={s.label}>Test Level</span>
        <div style={s.chipRow}>
          {testLevels.map((l) => (
            <button key={l.id} type="button" onClick={() => setTestLevel(l.id)} style={s.chip(testLevel === l.id)}>{l.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {type === 'code' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(231,239,255,0.74)', fontWeight: 700 }}>Lang</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={s.select}>
              {codeLanguages.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </label>
        )}
        <input ref={fileInputRef} type="file" className="hidden" accept=".py,.js,.ts,.jsx,.tsx,.java,.c,.cpp,.go,.rs,.txt,.json,.yaml,.yml,.md" onChange={handleFileUpload} />
        <button type="button" style={s.outlineBtn} onClick={() => fileInputRef.current?.click()}>
          Upload file
        </button>
        <button type="button" style={{ ...s.outlineBtn, borderColor: 'rgba(255,143,216,0.28)', color: '#ff8fd8', background: 'rgba(255,143,216,0.08)' }} onClick={() => setCode('')}>
          Clear
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'rgba(194,208,243,0.56)' }}>
          {lineCount > 0 ? `${lineCount} lines` : 'Editor empty'}
        </span>
      </div>

      <div style={{ overflow: 'hidden', borderRadius: 16, border: '1px solid rgba(109,220,255,0.15)', background: 'rgba(0,0,0,0.5)', marginBottom: 14 }}>
        <Editor
          height="320px"
          language={type === 'code' ? language : 'markdown'}
          value={code}
          onChange={(v) => setCode(v ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: 'Fira Code, Cascadia Code, JetBrains Mono, Consolas, monospace',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbersMinChars: 2,
            padding: { top: 12 },
            renderLineHighlight: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(109,220,255,0.1)' }}>
        <div style={{ fontSize: '0.72rem', color: 'rgba(194,208,243,0.56)' }}>
          Output: <span style={{ color: '#6ddcff' }}>Pytest</span> · <span style={{ color: '#f5c26b' }}>JUnit</span> · <span style={{ color: '#ff8fd8' }}>Jest</span>
        </div>
        <button type="button" style={s.generateBtn(loading || code.trim().length === 0)} disabled={loading || code.trim().length === 0} onClick={() => onGenerate(buildRequestInput(), type, mode, testLevel)}>
          {loading ? 'Generating...' : 'Generate Tests'}
        </button>
      </div>
    </div>
  )
}
