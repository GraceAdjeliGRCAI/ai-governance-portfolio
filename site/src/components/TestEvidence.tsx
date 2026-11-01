import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

interface TestResult {
  id: string
  name: string
  status: string
}

interface EvidenceFile {
  generatedAt: string
  framework: string
  summary: { total: number; passed: number; failed: number }
  tests: TestResult[]
}

const EVIDENCE_URL = `${import.meta.env.BASE_URL}evidence/governance-tests.json`

export default function TestEvidence() {
  const [evidence, setEvidence] = useState<EvidenceFile | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch(EVIDENCE_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Evidence unavailable')
        return response.json()
      })
      .then((data: EvidenceFile) => { if (active) setEvidence(data) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  return (
    <div className="test-evidence">
      <p className="section-lead">These controls become public evidence only after automated execution and recorded results.</p>
      {error && <div className="notice warning">Test evidence is unavailable in this preview.</div>}
      {!error && !evidence && <p className="muted">Loading executed test evidence.</p>}
      {evidence && (
        <>
          <div className="evidence-summary">
            <div><strong>{evidence.summary.passed}</strong><span>Tests passed</span></div>
            <div><strong>{evidence.summary.failed}</strong><span>Tests failed</span></div>
            <div><strong>{evidence.framework}</strong><span>Automated runner</span></div>
          </div>
          <div className="test-grid">
            {evidence.tests.map((test) => (
              <div className="test-row" key={test.id}>
                <span className="test-id">{test.id}</span>
                <span>{test.name}</span>
                <span className={test.status === 'passed' ? 'test-status passed' : 'test-status failed'}>{test.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <a className="text-link evidence-link" href={EVIDENCE_URL} target="_blank" rel="noreferrer">
            View machine readable results <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </>
      )}
    </div>
  )
}
