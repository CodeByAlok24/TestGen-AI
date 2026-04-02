import { useState } from 'react'
import Card from './Card'
import Button from './Button'

const DEFAULT_FAILING_TEST =
  'def test_divide_by_zero():\n    assert divide(10, 0) == 0\n'
const DEFAULT_ERROR_MSG = 'ValueError: Cannot divide by zero'

export default function HealPanel({ onHeal, result }) {
  const [failingTest, setFailingTest] = useState(DEFAULT_FAILING_TEST)
  const [errorMsg, setErrorMsg] = useState(DEFAULT_ERROR_MSG)
  const [loading, setLoading] = useState(false)

  function handleFailingTestChange(value) {
    setFailingTest(value)
    if (errorMsg === DEFAULT_ERROR_MSG) {
      setErrorMsg('')
    }
  }

  async function submit() {
    setLoading(true)
    try {
      await onHeal(failingTest, errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Self-heal" subtitle="Repair a failing test from one focused screen.">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
        <div className="space-y-3">
          <textarea
            className="panel-textarea"
            value={failingTest}
            onChange={(e) => handleFailingTestChange(e.target.value)}
            placeholder="Failing test code…"
          />
          <textarea
            className="panel-textarea panel-textarea--short"
            value={errorMsg}
            onChange={(e) => setErrorMsg(e.target.value)}
            placeholder="Error message…"
          />
          <Button variant="soft" type="button" onClick={submit} disabled={loading}>
            {loading ? 'Healing…' : 'Heal test'}
          </Button>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[var(--text-strong)]">Healed result</div>
            <button
              type="button"
              className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
              onClick={() => navigator.clipboard.writeText(result || '')}
              disabled={!result}
            >
              Copy
            </button>
          </div>
          <pre className="m-0 max-h-[280px] overflow-auto rounded-2xl border border-[var(--border)] bg-white p-3 text-xs leading-6 text-[var(--text)]">
            <code>{result || 'Healed output will appear here.'}</code>
          </pre>
        </div>
      </div>
    </Card>
  )
}
