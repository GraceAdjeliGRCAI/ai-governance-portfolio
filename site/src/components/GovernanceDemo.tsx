import { useState } from 'react'
import { Check, Clock3, Play, RotateCcw, ShieldCheck, SlidersHorizontal, UserCheck, UserX } from 'lucide-react'
import {
  SCENARIOS,
  appendEvidence,
  approveRequest,
  changeParameters,
  createActionRequest,
  evaluateRequest,
  executeRequest,
  markApprovalUsed,
  verifyEvidenceChain,
  type ActionRequest,
  type Approval,
  type Approver,
  type EvidenceRecord,
  type ScenarioId,
} from '../lib/governance'
import { DecisionBadge } from './SiteChrome'

type Notice = { kind: 'info' | 'success' | 'error'; text: string }

const initialRequest = () => createActionRequest(SCENARIOS.exportInternal)

export default function GovernanceDemo() {
  const [request, setRequest] = useState<ActionRequest>(initialRequest)
  const [approval, setApproval] = useState<Approval>()
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([])
  const [notice, setNotice] = useState<Notice>({ kind: 'info', text: 'No execution attempted. Review the independent gateway decision.' })
  const [evidenceNotice, setEvidenceNotice] = useState('Evidence chain has not been altered.')

  const scenario = SCENARIOS[request.scenarioId]
  const evaluation = evaluateRequest(request)

  const addEvidence = (event: string, outcome: EvidenceRecord['outcome'], reason: string, actionRequest = request) => {
    setEvidence((current) => appendEvidence(current, { request: actionRequest, event, outcome, reason }))
  }

  const selectScenario = (id: ScenarioId) => {
    const next = createActionRequest(SCENARIOS[id])
    setRequest(next)
    setApproval(undefined)
    setNotice({ kind: 'info', text: 'New synthetic request created. No execution attempted.' })
    setEvidenceNotice('Evidence chain has not been altered.')
  }

  const handleApproval = (approver: Approver) => {
    const next = approveRequest(request, approver)
    setApproval(next)
    const independent = approver === 'independent'
    const reason = independent ? 'Independent approval created with a 60 second expiration' : 'Self approval recorded for demonstration and must be rejected'
    addEvidence('APPROVAL', independent ? 'HUMAN REVIEW' : 'BLOCK', reason)
    setNotice({ kind: independent ? 'info' : 'error', text: independent ? 'Independent approval is ready for one simulated execution.' : 'Self approval is not a valid execution authority.' })
  }

  const handleExecute = () => {
    const result = executeRequest(request, approval)
    addEvidence('EXECUTION', result.decision, result.reason)
    if (result.decision === 'PERMIT' && evaluation.decision === 'HUMAN REVIEW' && approval) {
      setApproval(markApprovalUsed(approval))
    }
    setNotice({ kind: result.decision === 'PERMIT' ? 'success' : 'error', text: result.reason })
  }

  const expireApproval = () => {
    if (!approval) return
    setApproval({ ...approval, expiresAt: Date.now() - 1 })
    setNotice({ kind: 'info', text: 'Approval expiration has been simulated. Attempt execution to verify the control.' })
  }

  const alterParameters = () => {
    const next = changeParameters(request, 'recordCount', String(Number(request.parameters.recordCount || 0) + 1))
    setRequest(next)
    setNotice({ kind: 'info', text: 'Parameters changed after approval. The action hash no longer matches.' })
  }

  const verifyEvidence = () => {
    const valid = verifyEvidenceChain(evidence)
    setEvidenceNotice(valid ? 'Evidence chain verification passed.' : 'Evidence chain verification failed. Alteration detected.')
  }

  const tamperEvidence = () => {
    if (!evidence.length) {
      setEvidenceNotice('Create an evidence record before using the tampering simulation.')
      return
    }
    const altered = evidence.map((entry, index) => index === 0 ? { ...entry, reason: `${entry.reason} [altered in simulation]` } : entry)
    setEvidence(altered)
    setEvidenceNotice('The first evidence record was deliberately altered. Run verification.')
  }

  return (
    <div className="demo-shell">
      <div className="demo-heading">
        <div><h2>Synthetic governance request</h2><p>Every action and record in this demonstration is synthetic.</p></div>
        <span className="eyebrow">Illustrative interface state</span>
      </div>
      <div className="demo-grid">
        <div className="scenario-column">
          <h3><span>1</span> Select a scenario</h3>
          <div className="scenario-list">
            {Object.values(SCENARIOS).map((item) => (
              <button key={item.id} type="button" className={item.id === request.scenarioId ? 'scenario-button active' : 'scenario-button'} aria-pressed={item.id === request.scenarioId} onClick={() => selectScenario(item.id)}>
                <span>{item.name}</span>{item.id === request.scenarioId && <Check size={17} aria-hidden="true" />}
              </button>
            ))}
          </div>
          <p className="muted small-copy">Each scenario changes the requested action and its governance outcome.</p>
          <button className="text-button" type="button" onClick={() => selectScenario(request.scenarioId)}><RotateCcw size={15} aria-hidden="true" /> Reset current request</button>
        </div>

        <div className="evaluation-panel">
          <h3><span>2</span> Review the independent evaluation</h3>
          <dl className="request-details">
            <div><dt>Requested action</dt><dd>{request.action}</dd></div>
            <div><dt>Data class</dt><dd>{scenario.dataClass}</dd></div>
            <div><dt>Supervisor</dt><dd>{request.supervisorRecommendation}</dd></div>
            <div><dt>Policy</dt><dd>{scenario.policy}</dd></div>
            <div><dt>Policy version</dt><dd>{request.policyVersion}</dd></div>
          </dl>
          <div className="hash-block"><span>Action hash</span><code>{request.actionHash}</code></div>
          <div className="evaluation-decision"><DecisionBadge decision={evaluation.decision} /><p>{evaluation.reason}</p></div>

          {evaluation.decision === 'HUMAN REVIEW' && (
            <div className="approval-controls">
              <h3><span>3</span> Test approval validity</h3>
              <div className="control-grid">
                <button className="button button-outline" type="button" onClick={() => handleApproval('independent')}><UserCheck size={16} aria-hidden="true" /> Approve independently</button>
                <button className="button button-outline" type="button" onClick={() => handleApproval('self')}><UserX size={16} aria-hidden="true" /> Attempt self approval</button>
                <button className="button button-outline" type="button" disabled={!approval} onClick={expireApproval}><Clock3 size={16} aria-hidden="true" /> Expire approval</button>
                <button className="button button-outline" type="button" disabled={!approval} onClick={alterParameters}><SlidersHorizontal size={16} aria-hidden="true" /> Change parameters</button>
              </div>
              {approval && (
                <div className="approval-status">
                  <span>Approver <strong>{approval.approver === 'independent' ? 'Independent reviewer' : 'Same requester'}</strong></span>
                  <span>Status <strong>{approval.used ? 'Used' : Date.now() >= approval.expiresAt ? 'Expired' : 'Unused'}</strong></span>
                </div>
              )}
            </div>
          )}

          <div className="execution-controls">
            <button className="button button-gold" type="button" onClick={handleExecute}><Play size={16} aria-hidden="true" /> Attempt simulated execution</button>
            <div className={`notice ${notice.kind}`} role="status" aria-live="polite">{notice.text}</div>
          </div>
        </div>
      </div>

      <div className="evidence-ledger">
        <div className="ledger-heading">
          <div><h3>Session evidence</h3><p>Hash chained records are tamper evident, not immutable. This session resets on reload.</p></div>
          <ShieldCheck size={25} aria-hidden="true" />
        </div>
        <div className="ledger-actions">
          <button className="text-button" type="button" onClick={verifyEvidence}>Verify evidence chain</button>
          <button className="text-button" type="button" onClick={tamperEvidence}>Simulate evidence tampering</button>
          <button className="text-button" type="button" onClick={() => { setEvidence([]); setEvidenceNotice('Session evidence cleared.') }}>Clear session evidence</button>
        </div>
        <p className="evidence-notice" role="status">{evidenceNotice}</p>
        {evidence.length === 0 ? (
          <p className="muted">No session records yet. Create an approval or attempt an execution.</p>
        ) : (
          <div className="ledger-records">
            {evidence.map((entry) => (
              <div className="ledger-row" key={`${entry.sequence}-${entry.entryHash}`}>
                <span className="ledger-sequence">{String(entry.sequence).padStart(2, '0')}</span>
                <div><strong>{entry.event}</strong><p>{entry.reason}</p><code>{entry.entryHash.slice(0, 20)}…</code></div>
                <DecisionBadge decision={entry.outcome} small />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
