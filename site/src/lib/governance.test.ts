import { describe, expect, it } from 'vitest'
import {
  SCENARIOS,
  appendEvidence,
  approveRequest,
  changeParameters,
  createActionRequest,
  evaluateRequest,
  executeRequest,
  markApprovalUsed,
  validateApproval,
  verifyEvidenceChain,
  type ActionRequest,
} from './governance'

const NOW = 1_800_000_000_000
const reviewRequest = () => createActionRequest(SCENARIOS.exportInternal, NOW)

describe('AI Execution Governance reference controls', () => {
  it('T01 Public information read returns PERMIT', () => {
    const request = createActionRequest(SCENARIOS.publicRead, NOW)
    expect(executeRequest(request, undefined, NOW).decision).toBe('PERMIT')
  })

  it('T02 Internal data export returns HUMAN REVIEW', () => {
    expect(evaluateRequest(reviewRequest()).decision).toBe('HUMAN REVIEW')
  })

  it('T03 Production deletion returns BLOCK', () => {
    const request = createActionRequest(SCENARIOS.deleteProduction, NOW)
    expect(executeRequest(request, undefined, NOW).decision).toBe('BLOCK')
  })

  it('T04 Missing parameters return BLOCK', () => {
    const request: ActionRequest = { ...reviewRequest(), parameters: { destination: '', recordCount: '' } }
    expect(evaluateRequest(request)).toEqual({ decision: 'BLOCK', reason: 'Required action parameters are missing' })
  })

  it('T05 Supervisor approval does not bypass human review', () => {
    const request = { ...reviewRequest(), supervisorRecommendation: 'APPROVE' }
    expect(executeRequest(request, undefined, NOW).decision).toBe('BLOCK')
  })

  it('T06 Self approval is rejected', () => {
    const request = reviewRequest()
    const approval = approveRequest(request, 'self', NOW)
    expect(executeRequest(request, approval, NOW + 1).reason).toBe('Self approval is not permitted')
  })

  it('T07 Authorized independent approval is accepted', () => {
    const request = reviewRequest()
    const approval = approveRequest(request, 'independent', NOW)
    expect(validateApproval(request, approval, NOW + 1).decision).toBe('PERMIT')
  })

  it('T08 Valid approval permits one simulated execution', () => {
    const request = reviewRequest()
    const approval = approveRequest(request, 'independent', NOW)
    expect(executeRequest(request, approval, NOW + 1).decision).toBe('PERMIT')
  })

  it('T09 Reused approval is blocked', () => {
    const request = reviewRequest()
    const approval = markApprovalUsed(approveRequest(request, 'independent', NOW))
    expect(executeRequest(request, approval, NOW + 1).reason).toBe('Approval has already been used')
  })

  it('T10 Expired approval is blocked', () => {
    const request = reviewRequest()
    const approval = approveRequest(request, 'independent', NOW, 1_000)
    expect(executeRequest(request, approval, NOW + 1_001).reason).toBe('Approval has expired')
  })

  it('T11 Changed parameters invalidate approval', () => {
    const original = reviewRequest()
    const approval = approveRequest(original, 'independent', NOW)
    const changed = changeParameters(original, 'recordCount', '26')
    expect(executeRequest(changed, approval, NOW + 1).reason).toBe('Changed parameters invalidate approval')
  })

  it('T12 Agent policy modification is blocked', () => {
    const request = createActionRequest(SCENARIOS.modifyPolicy, NOW)
    expect(executeRequest(request, undefined, NOW).decision).toBe('BLOCK')
  })

  it('T13 Direct tool access without the gateway is rejected', () => {
    const request = createActionRequest(SCENARIOS.directAccess, NOW)
    expect(executeRequest(request, undefined, NOW).decision).toBe('BLOCK')
  })

  it('T14 Evidence modification is detected', () => {
    const request = reviewRequest()
    let chain = appendEvidence([], { timestamp: NOW, request, event: 'DECISION', outcome: 'HUMAN REVIEW', reason: 'Review required' })
    chain = appendEvidence(chain, { timestamp: NOW + 1, request, event: 'EXECUTION', outcome: 'BLOCK', reason: 'Approval required' })
    expect(verifyEvidenceChain(chain)).toBe(true)
    chain[0] = { ...chain[0], reason: 'Altered evidence' }
    expect(verifyEvidenceChain(chain)).toBe(false)
  })

  it('T15 Evidence store unavailability fails closed', () => {
    const request = reviewRequest()
    const approval = approveRequest(request, 'independent', NOW)
    expect(executeRequest(request, approval, NOW + 1, false)).toEqual({
      decision: 'BLOCK',
      reason: 'Evidence store unavailable. Execution fails closed.',
    })
  })
})
