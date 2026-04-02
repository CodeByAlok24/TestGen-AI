const fencePattern = /^```[a-zA-Z0-9_-]*\n([\s\S]*)\n```$/

function stripCodeFence(text = '') {
  const trimmed = text.trim()
  const match = trimmed.match(fencePattern)
  return match ? match[1].trim() : trimmed
}

export function parseOutput(raw = '') {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { pytest: '', junit: '', jest: '' }
  }

  const sectionPattern = /^===([A-Z_]+)===$/gm
  const matches = [...trimmed.matchAll(sectionPattern)]

  if (matches.length === 0) {
    return { pytest: stripCodeFence(trimmed), junit: '', jest: '' }
  }

  const parts = {}
  matches.forEach((match, index) => {
    const key = match[1].toLowerCase()
    const start = match.index + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index : trimmed.length
    parts[key] = stripCodeFence(trimmed.slice(start, end))
  })

  return {
    pytest: parts.pytest || '',
    junit: parts.junit || '',
    jest: parts.jest || '',
  }
}
