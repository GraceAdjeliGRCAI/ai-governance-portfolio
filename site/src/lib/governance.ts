import { sha256 } from 'js-sha256'

export type Decision = 'PERMIT' | 'HUMAN REVIEW' | 'BLOCK'
export type ScenarioId = 'publicRead' | 'exportInternal' | 'deleteProduction' | 'modifyPolicy' | 'directAccess'
export type Approver = 'independent' | 'self'

export interface Scenario {
  id: ScenarioId
  name: string
  action: string
  dataClass: string
  risk: 'Low' | 'High' | 'Critical'
  decision: Decision
  policy: string
  supervisorRecommendation: string
  parameters: Record<string, string>
}

export interface ActionRequest {
  requestId: string
  scenarioId: ScenarioId
  action: string
  parameters: Record<string, string>
  actionHash: string
  supervisorRecommendation: string
  policyVersion: string
}

export interface Approval {
  requestId: string
  actionHash: string
  approver: Approver
  expiresAt: number
  used: boolean
}

export interface GatewayResult {
  decision: Decision
  reason: string
}

export interface EvidenceRecord {
  sequence: number
  timestamp: number
  requestId: string
  actionHash: string
  event: string
  outcome: Decision
  reason: string
  previousHash: string
  entryHash: string
}

export const POLICY_VERSION = '1.0.0'

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  publicRead: {
    id: 'publicRead',
    name: 'Read public information',
    action: 'Read public information',
    dataClass: 'Public synthetic information',
    risk: 'Low',
    decision: 'PERMIT',
    policy: 'Public information may be read',
    supervisorRecommendation: 'Recommends execution',
    parameters: { source: 'Synthetic public catalogue', recordCount: '1' },
  },
  exportInternal: {
    id: 'exportInternal',
    name: 'Export synthetic internal data',
    action: 'Export data',
    dataClass: 'Synthetic internal',
    risk: 'High',
    decision: 'HUMAN REVIEW',
    policy: 'Independent review required',
    supervisorRecommendation: 'Recommends approval',
    parameters: { destination: 'Synthetic download', recordCount: '25' },
  },
  deleteProduction: {
    id: 'deleteProduction',
    name: 'Delete production data',
    action: 'Delete production data',
    dataClass: 'Synthetic production marker',
    risk: 'Critical',
    decision: 'BLOCK',
    policy: 'Destructive execution is prohibited',
    supervisorRecommendation: 'Recommends execution',
    parameters: { target: 'Synthetic production store', confirmation: 'Requested' },
  },
  modifyPolicy: {
    id: 'modifyPolicy',
    name: 'Modify governance policy',
    action: 'Modify governance policy',
    dataClass: 'Governance configuration',
    risk: 'Critical',
    decision: 'BLOCK',
    policy: 'Agents cannot modify governance policy',
    supervisorRecommendation: 'Recommends execution',
    parameters: { policy: POLICY_VERSION, operation: 'Replace' },
  },
  directAccess: {
    id: 'directAccess',
    name: 'Access the protected tool directly',
    action: 'Access protected tool directly',
    dataClass: 'Protected synthetic tool',
    risk: 'Critical',
    decision: 'BLOCK',
    policy: 'The gateway boundary cannot be bypassed',
    supervisorRecommendation: 'Recommends direct access',
    parameters: { tool: 'Synthetic protected tool', gateway: 'Absent' },
  },
}

export function canonicalAction(action: string, parameters: Record<string, string>) {
  const ordered = Object.fromEntries(Object.entries(parameters).sort(([a], [b]) => a.localeCompare(b)))
  return JSON.stringify({ action, parameters: ordered })
}

export function createActionRequest(scenario: Scenario, now = Date.now()): ActionRequest {
  const parameters = { ...scenario.parameters }
  return {
    requestId: `REQ-${scenario.id}-${now.toString(36).toUpperCase()}`,
    scenarioId: scenario.id,
    action: scenario.action,
    parameters,
    actionHash: sha256(canonicalAction(scenario.action, parameters)),
    supervisorRecommendation: scenario.supervisorRecommendation,
    policyVersion: POLICY_VERSION,
  }
}

export function evaluateRequest(request: ActionRequest): GatewayResult {
  const scenario = SCENARIOS[request.scenarioId]
  const requiredKeys = Object.keys(scenario.parameters)
  const complete = requiredKeys.every((key) => Boolean(request.parameters[key]?.trim()))
  if (!complete || !request.action.trim()) {
    return { decision: 'BLOCK', reason: 'Required action parameters are missing' }
  }
  return { decision: scenario.decision, reason: scenario.policy }
}

export function approveRequest(request: ActionRequest, approver: Approver, now = Date.now(), ttlMs = 60_000): Approval {
  return {
    requestId: request.requestId,
    actionHash: request.actionHash,
    approver,
    expiresAt: now + ttlMs,
    used: false,
  }
}

export function validateApproval(request: ActionRequest, approval: Approval | undefined, now = Date.now()): GatewayResult {
  if (!approval) return { decision: 'BLOCK', reason: 'Execution remains blocked pending valid independent approval' }
  if (approval.requestId !== request.requestId) return { decision: 'BLOCK', reason: 'Approval is bound to a different request' }
  if (approval.approver !== 'independent') return { decision: 'BLOCK', reason: 'Self approval is not permitted' }
  if (now >= approval.expiresAt) return { decision: 'BLOCK', reason: 'Approval has expired' }
  if (approval.actionHash !== request.actionHash) return { decision: 'BLOCK', reason: 'Changed parameters invalidate approval' }
  if (approval.used) return { decision: 'BLOCK', reason: 'Approval has already been used' }
  return { decision: 'PERMIT', reason: 'Valid independent approval permits one simulated execution' }
}

export function executeRequest(
  request: ActionRequest,
  approval: Approval | undefined,
  now = Date.now(),
  evidenceAvailable = true,
): GatewayResult {
  const evaluation = evaluateRequest(request)
  if (evaluation.decision === 'BLOCK') return evaluation
  if (evaluation.decision === 'PERMIT') {
    if (!evidenceAvailable) return { decision: 'BLOCK', reason: 'Evidence store unavailable. Execution fails closed.' }
    return { decision: 'PERMIT', reason: 'Policy permits one simulated execution' }
  }
  const validation = validateApproval(request, approval, now)
  if (validation.decision === 'BLOCK') return validation
  if (!evidenceAvailable) return { decision: 'BLOCK', reason: 'Evidence store unavailable. Execution fails closed.' }
  return validation
}

export function changeParameters(request: ActionRequest, key: string, value: string): ActionRequest {
  const parameters = { ...request.parameters, [key]: value }
  return { ...request, parameters, actionHash: sha256(canonicalAction(request.action, parameters)) }
}

export function markApprovalUsed(approval: Approval): Approval {
  return { ...approval, used: true }
}

function computeEntryHash(entry: Omit<EvidenceRecord, 'entryHash'>) {
  return sha256(JSON.stringify(entry))
}

export function appendEvidence(
  chain: EvidenceRecord[],
  input: {
    timestamp?: number
    request: ActionRequest
    event: string
    outcome: Decision
    reason: string
  },
): EvidenceRecord[] {
  const previousHash = chain.length ? chain[chain.length - 1].entryHash : 'GENESIS'
  const entry: Omit<EvidenceRecord, 'entryHash'> = {
    sequence: chain.length + 1,
    timestamp: input.timestamp ?? Date.now(),
    requestId: input.request.requestId,
    actionHash: input.request.actionHash,
    event: input.event,
    outcome: input.outcome,
    reason: input.reason,
    previousHash,
  }
  return [...chain, { ...entry, entryHash: computeEntryHash(entry) }]
}

export function verifyEvidenceChain(chain: EvidenceRecord[]) {
  let previousHash = 'GENESIS'
  for (let index = 0; index < chain.length; index += 1) {
    const entry = chain[index]
    if (entry.sequence !== index + 1 || entry.previousHash !== previousHash) return false
    const { entryHash, ...unsigned } = entry
    if (computeEntryHash(unsigned) !== entryHash) return false
    previousHash = entryHash
  }
  return true
}
