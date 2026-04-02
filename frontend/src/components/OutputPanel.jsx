import { useMemo, useState } from 'react'
import Card from './Card'
import Button from './Button'

const tabs = [
  { id: 'pytest', label: 'Pytest' },
  { id: 'junit', label: 'JUnit' },
  { id: 'jest', label: 'Jest' },
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
  const code = useMemo(() => (tests && tests[tab]) || '', [tests, tab])

  return (
    <Card
      title="Generated tests"
      subtitle="Switch frameworks from the menu below."
      right={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigator.clipboard.writeText(code)}
            disabled={!code}
          >
            Copy
          </Button>
          <Button
            variant="soft"
            type="button"
            onClick={() =>
              downloadText(
                `test_generated.${tab === 'pytest' ? 'py' : tab === 'jest' ? 'test.js' : 'java'}`,
                code,
              )
            }
            disabled={!code}
          >
            Download
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`menu-choice menu-choice--compact ${tab === t.id ? 'menu-choice--active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
        <pre className="m-0 max-h-[520px] overflow-auto p-4 text-xs leading-6 text-[var(--text)]">
          <code>{code || 'Generate tests to see output here.'}</code>
        </pre>
      </div>
    </Card>
  )
}
