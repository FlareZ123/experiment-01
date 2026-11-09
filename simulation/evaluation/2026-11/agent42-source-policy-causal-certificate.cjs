'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent42-source-policy-causal-integrity-certificate-v2';
const PHASES = Object.freeze(['P0S0', 'P1S0', 'P0S1', 'P1S1']);

/**
 * @typedef {{id:string,rank:number,seed:number,candidateSlot:'A'|'B',candidateId:string}} Trial
 * @typedef {{trial:Trial,rootActionLedger?:object[],sourceDealFingerprint?:string,
 *  fullPhysicalDealFingerprint?:string,actualStarterSeat?:number,
 *  status?:string,finished?:boolean,winner?:number,sourceAttackSettlement?:object,
 *  nativeAcceptedTargetSidecar?:object}} NativeRow
 */

/** @param {NativeRow} row @param {Trial} trial */
function sameRegisteredTrial(row, trial) {
  const actual = row?.trial;
  return Boolean(actual && actual.id === trial.id &&
    actual.rank === trial.rank && actual.seed === trial.seed &&
    actual.candidateSlot === trial.candidateSlot &&
    actual.candidateId === trial.candidateId);
}

/** @param {NativeRow[]} rows @param {Trial} trial */
function physicalGate(rows, trial) {
  const allRegistered = rows.every(row => sameRegisteredTrial(row, trial));
  const allFingerprint = rows.every(row =>
    typeof row?.sourceDealFingerprint === 'string' &&
    row.sourceDealFingerprint.length > 0 &&
    typeof row?.fullPhysicalDealFingerprint === 'string' &&
    row.fullPhysicalDealFingerprint.length > 0 &&
    (row.actualStarterSeat === 0 || row.actualStarterSeat === 1));
  const first = rows[0];
  const physicalEqual = allFingerprint && rows.every(row =>
    row.sourceDealFingerprint === first.sourceDealFingerprint &&
    row.fullPhysicalDealFingerprint === first.fullPhysicalDealFingerprint &&
    row.actualStarterSeat === first.actualStarterSeat);
  return {allRegistered,allFingerprint,physicalEqual,
    admitted:allRegistered && physicalEqual};
}

/** @param {object[]} a @param {object[]} b */
function firstRootDifference(a, b) {
  assert.ok(Array.isArray(a) && Array.isArray(b));
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    const control = a[index] ?? null;
    const challenger = b[index] ?? null;
    if (JSON.stringify(control) !== JSON.stringify(challenger)) {
      return {index,control,challenger};
    }
  }
  return null;
}

/**
 * @param {NativeRow} control
 * @param {object} root Accepted native attack root in control.
 */
function attackSettlement(control, root) {
  if (root?.action !== 'AttackAction') return 'NOT_AN_ATTACK';
  const events = control.sourceAttackSettlement?.attacks;
  if (!Array.isArray(events)) return 'NO_SETTLEMENT_RECEIPT';
  const matching = events.find(event =>
    event.actionOrdinal === root.actionOrdinal &&
    event.attackName === root.attack);
  return matching?.settledPromptChain === true &&
    matching.settlementCrossesClockReset === false &&
    Number.isSafeInteger(matching.completionRootOrdinal) &&
    matching.completionRootOrdinal >= root.actionOrdinal ?
    'ATTACK_SETTLED' : 'NO_SETTLEMENT_RECEIPT';
}

/**
 * Store acceptance alone cannot establish printed payment or owner information.
 * This returns the narrower status actually supported by a real native sidecar.
 * @param {NativeRow} treatment
 * @param {object} root
 * @param {number} sourceSeat
 */
function sourceActionReceipt(treatment, root, sourceSeat) {
  const events = treatment.nativeAcceptedTargetSidecar?.events;
  if (!Array.isArray(events)) return 'NO_NATIVE_SIDECAR';
  // A receipt from another registered physical deal, turn, or card cannot
  // certify this action even if the Store ordinal and action type coincide.
  const event = events.find(e =>
    e.trialId === treatment.trial?.id &&
    e.sourceDealFingerprint === treatment.sourceDealFingerprint &&
    e.fullPhysicalDealFingerprint === treatment.fullPhysicalDealFingerprint &&
    e.rootActionOrdinal === root.actionOrdinal &&
    e.turnBefore === root.turnBefore &&
    e.playerSlot === sourceSeat &&
    e.action === root.action &&
    (root.card === undefined || e.card === root.card) &&
    (root.attack === undefined || e.attack === root.attack) &&
    (root.ability === undefined || e.ability === root.ability));
  if (!event) return 'NO_EXACT_NATIVE_RECEIPT';
  if (event.storeAccepted !== true) return 'NATIVE_STORE_REJECTED_OR_UNKNOWN';
  if (event.ownerInformationVerified === true &&
      event.paperPrintedPaymentVerified === true &&
      event.physicalZoneTransitionsVerified === true)
    return 'OWNER_PAYMENT_AND_CUSTODY_RECEIPTED';
  return 'STORE_ACCEPTED_PAPER_PAYMENT_UNVERIFIED';
}

/**
 * A source search Item may precede the same fully settled attack on the same
 * turn. Distinguish changing the first root from actually sacrificing the
 * attack. Prompt roots and other players' turns are excluded.
 * @param {NativeRow} challenger
 * @param {object} displaced Source baseline AttackAction.
 * @param {number} seat Physical original-source seat.
 */
function sameTurnAttackFollowthrough(challenger, displaced, seat) {
  const roots = challenger.rootActionLedger ?? [];
  const matching = roots.filter(root =>
    root.actionOrdinal > displaced.actionOrdinal &&
    root.playerSlot === seat &&
    root.turnBefore === displaced.turnBefore &&
    root.action === 'AttackAction' && root.attack === displaced.attack);
  const settled = matching.find(root =>
    attackSettlement(challenger,root) === 'ATTACK_SETTLED');
  return {sameTurnAttackRootCount:matching.length,
    sameTurnSameAttackSettled:Boolean(settled),
    firstSameAttackOrdinal:matching[0]?.actionOrdinal ?? null,
    settledAttackOrdinal:settled?.actionOrdinal ?? null};
}

/**
 * One factor comparison with fixed pivot: 2x2 is analyzed as P0S0 vs P0S1,
 * P1S0 vs P1S1. Distinguishes actual owner-root divergence from option flags.
 * @param {NativeRow} control
 * @param {NativeRow} challenger
 * @param {number} sourceSeat
 * @param {boolean} admitted
 */
function compareSourceFactor(control, challenger, sourceSeat, admitted) {
  if (!admitted) return {status:'INVALID_PHYSICAL_OR_REGISTRATION',
    firstDifference:null,actionReceipt:null,displacedAttack:null};
  if (!Array.isArray(control.rootActionLedger) ||
      !Array.isArray(challenger.rootActionLedger))
    return {status:'MISSING_ROOT_LEDGER',firstDifference:null,
      actionReceipt:null,displacedAttack:null};
  const delta = firstRootDifference(control.rootActionLedger,
    challenger.rootActionLedger);
  if (!delta) return {status:'INACTIVE_SOURCE_TREATMENT',
    firstDifference:null,actionReceipt:null,displacedAttack:null};
  const a = delta.control, b = delta.challenger;
  const firstDifference = {index:delta.index,
    control:a,challenger:b};
  const invalid = status => ({status,firstDifference,
    actionReceipt:null,displacedAttack:null});
  if (!a || !b) return invalid('INCOMPLETE_DIFFERENT_LENGTH_PREFIX');
  if (!Number.isSafeInteger(a.actionOrdinal) ||
      a.actionOrdinal !== b.actionOrdinal ||
      !Number.isSafeInteger(a.turnBefore) ||
      a.turnBefore !== b.turnBefore ||
      ![0,1].includes(a.playerSlot) ||
      ![0,1].includes(b.playerSlot))
    return invalid('UNALIGNED_ACCEPTED_ROOTS');
  if (a.playerSlot !== sourceSeat || b.playerSlot !== sourceSeat)
    return invalid('CANDIDATE_OR_CROSS_SEAT_FIRST_DIVERGENCE');
  if (a.action === 'ResolvePromptAction' ||
      b.action === 'ResolvePromptAction')
    return invalid('PROMPT_ONLY_FIRST_DIVERGENCE');
  // Identical declared actions with different diagnostic annotations, targets,
  // or unjoined effect metadata are not evidence of a changed choice. They
  // require a separately joined parameter/settlement receipt before promotion.
  if (a.action === b.action &&
      a.card === b.card &&
      a.attack === b.attack &&
      a.ability === b.ability)
    return invalid('SAME_ACTION_UNVERIFIED_VARIATION');
  const receipt = sourceActionReceipt(challenger,b,sourceSeat);
  const displacedAttack = a.action === 'AttackAction' ?
    {actionOrdinal:a.actionOrdinal,attack:a.attack ?? null,
      settlement:attackSettlement(control,a)} : null;
  const followthrough = displacedAttack ?
    sameTurnAttackFollowthrough(challenger,a,sourceSeat) : null;
  const recovered = followthrough?.sameTurnSameAttackSettled === true;
  return {status:displacedAttack ?
    (recovered ? 'SOURCE_ATTACK_DEFERRED_SAME_TURN' :
      'SOURCE_ATTACK_NOT_SETTLED_SAME_TURN') : 'SOURCE_ACTION_CHANGED',
    firstDifference,actionReceipt:receipt,displacedAttack,
    followthrough,decisionQuality:displacedAttack ?
      (recovered ? 'SOURCE_ATTACK_PRESERVED_AFTER_SEARCH' :
        'SOURCE_ATTACK_PAYOFF_UNPROVEN_AFTER_CHANGE') :
      a.action === 'PassTurnAction' ? 'ACTION_REPLACED_PASS' :
        'COMPETING_ACTION_REQUIRES_REVIEW'};
}

/**
 * Original native runners may omit status on successful matches. Classify a
 * native terminal only when the terminal flag, winner and both Prize counts
 * agree. Explicit failure/censor dispositions remain authoritative.
 * @param {NativeRow} row
 */
function nativeDisposition(row) {
  if (typeof row.status === 'string') return row.status;
  if (row.error != null) return 'engine-error';
  if (row.finished === true && (row.winner === 0 || row.winner === 1) &&
      Array.isArray(row.finalPrizes) && row.finalPrizes.length === 2 &&
      row.finalPrizes.every(p => Number.isSafeInteger(p) && p >= 0 && p <= 6))
    return 'native-terminal';
  return 'unfinished-censored';
}

/**
 * @param {Record<'P0S0'|'P1S0'|'P0S1'|'P1S1',NativeRow>} rows
 * @param {Trial} trial
 */
function certifyGroup(rows,trial) {
  assert.ok(['A','B'].includes(trial.candidateSlot));
  const all = PHASES.map(p => rows[p]);
  assert.ok(all.every(row => row && typeof row === 'object'),
    'All four original native attempts are required');
  const sourceSeat = trial.candidateSlot === 'A' ? 1 : 0;
  const gate = physicalGate(all,trial);
  const withoutPivot = compareSourceFactor(rows.P0S0,rows.P0S1,
    sourceSeat,gate.admitted);
  const withPivot = compareSourceFactor(rows.P1S0,rows.P1S1,
    sourceSeat,gate.admitted);
  const statuses = Object.fromEntries(PHASES.map(phase => [phase,{
    status:nativeDisposition(rows[phase]),
    winner:nativeDisposition(rows[phase]) === 'native-terminal' ?
      rows[phase].winner ?? null : null,
    finished:rows[phase].finished === true
  }]));
  const fourTerminals = all.every(row =>
    nativeDisposition(row) === 'native-terminal' && row.finished === true &&
    (row.winner === 0 || row.winner === 1));
  const sourceWinnerEffects = fourTerminals && gate.admitted ? {
    withoutPivot:rows.P0S0.winner !== rows.P0S1.winner,
    withPivot:rows.P1S0.winner !== rows.P1S1.winner
  } : null;
  return {schema:VERSION,trialId:trial.id,sourceSeat,
    candidateSeat:1-sourceSeat,physicalGate:gate,
    withoutPivot,withPivot,statuses,fourTerminals,
    sourceWinnerEffects,
    ownerPaymentCertified:gate.admitted &&
      [withoutPivot,withPivot].some(x=>
        x.actionReceipt === 'OWNER_PAYMENT_AND_CUSTODY_RECEIPTED'),
    effectiveInnermostChooserSeatIsolation:'NOT_PROVEN_BY_LEDGER_ONLY',
    competitivePaperQualifiedGames:0};
}

/**
 * @param {Record<string,NativeRow[]>} phaseRows
 * @param {Trial[]} trials All preregistered physical groups (one per row).
 */
function certifyCohort(phaseRows,trials) {
  assert.ok(Array.isArray(trials) && trials.length>0);
  assert.equal(new Set(trials.map(t=>t.id)).size,trials.length,
    'Duplicate registered trial IDs');
  const maps = {};
  for (const phase of PHASES) {
    const rows = phaseRows[phase];
    assert.ok(Array.isArray(rows) && rows.length === trials.length,
      'All original attempts must be retained, including errors and caps');
    maps[phase] = new Map(rows.map(row => [row.trial?.id,row]));
    assert.equal(maps[phase].size,trials.length,
      'Duplicate or missing trial IDs in '+phase);
  }
  const groups = trials.map(trial => certifyGroup(Object.fromEntries(
    PHASES.map(phase => [phase,maps[phase].get(trial.id)])),trial));
  return {schema:VERSION,groups,
    totals:{registeredGroups:trials.length,nativeAttempts:4*trials.length,
      physicallyMatched:groups.filter(g=>g.physicalGate.admitted).length,
      activeSourceWithoutPivot:groups.filter(g=>
        (g.withoutPivot.status === 'SOURCE_ACTION_CHANGED' ||
          g.withoutPivot.status.startsWith('SOURCE_ATTACK_'))).length,
      activeSourceWithPivot:groups.filter(g=>
        (g.withPivot.status === 'SOURCE_ACTION_CHANGED' ||
          g.withPivot.status.startsWith('SOURCE_ATTACK_'))).length,
      sourceAttackDisplacements:groups.reduce((n,g)=>n+
        Number(g.withoutPivot.status.startsWith('SOURCE_ATTACK_'))+
        Number(g.withPivot.status.startsWith('SOURCE_ATTACK_')),0),
      qualifiedPaperGames:0}};
}

module.exports={VERSION,PHASES,nativeDisposition,
  sameTurnAttackFollowthrough,firstRootDifference,physicalGate,
  sourceActionReceipt,attackSettlement,compareSourceFactor,
  certifyGroup,certifyCohort};
