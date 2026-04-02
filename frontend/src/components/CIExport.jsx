import { useState } from 'react'
import Card from './Card'
import Button from './Button'

export default function CIExport({ onExport, yaml }) {
  const [framework, setFramework] = useState('pytest')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    try {
      await onExport(framework)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="CI export" subtitle="Generate a workflow file from a single menu step.">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['pytest', 'junit', 'jest'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFramework(f)}
              className={`menu-choice menu-choice--compact ${framework === f ? 'menu-choice--active' : ''}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
          <div className="flex-1" />
          <Button variant="soft" type="button" onClick={submit} disabled={loading}>
            {loading ? 'Exporting…' : 'Export workflow'}
          </Button>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <pre className="m-0 max-h-[320px] overflow-auto text-xs leading-6 text-[var(--text)]">
            <code>{yaml || 'Workflow YAML will appear here.'}</code>
          </pre>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
            onClick={() => navigator.clipboard.writeText(yaml || '')}
            disabled={!yaml}
          >
            Copy YAML
          </button>
        </div>
      </div>
    </Card>
  )
}
