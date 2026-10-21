'use strict';

const {auditBilateralV2} = require('./bilateral-v2-evidence-gate.cjs');
const {APPLICABILITY_CELLS,rank6CandidateApplicability} =
  require('./agent2-rank6-applicability.cjs');
const {rank11CandidateApplicability} =
  require('./agent2-rank11-applicability.cjs');

const PRESSURE_CELLS=[
  'both-witnessed','first-only-witnessed','second-only-witnessed',
  'neither-witnessed','censored-or-missing','unaligned-start-or-deal'
];

/**
 * Cross-check source pressure's claimed ordinal and turn against a preserved
 * Store root transcript when one exists. The strict v2 audit separately
 * verifies the full ledger digest and consecutive turn lineage. Legacy rows
 * without a transcript remain descriptive producer claims only.
 *
 * @param {object} row
 * @param {object} pressure
 * @param {0|1} sourceSeat
 * @returns {boolean}
 */
function pressureLedgerAligned(row,pressure,sourceSeat){
  if(row.rootActionLedger===undefined)return true;
  const roots=row.rootActionLedger;
  if(!Array.isArray(roots)||roots.length!==row.rootActionCount)return false;
  const start=roots[pressure.rootActionOrdinal];
  const close=roots[pressure.completionOrdinal];
  if(start?.actionOrdinal!==pressure.rootActionOrdinal||
      start.playerSlot!==sourceSeat||
      start.turnBefore!==pressure.turnBefore||
      start.action==='ResolvePromptAction'||
      close?.actionOrdinal!==pressure.completionOrdinal||
      close.turnBefore!==pressure.completionTurnBefore)return false;
  if(close.playerSlot===sourceSeat)return true;
  const origin=close.initiatingRootActionOrdinal;
  return close.action==='ResolvePromptAction'&&
    Number.isSafeInteger(origin)&&
    origin>=pressure.rootActionOrdinal&&
    origin<pressure.completionOrdinal&&
    roots[origin]?.playerSlot===sourceSeat&&
    roots[origin]?.action!=='ResolvePromptAction';
}

/**
 * A qualified pressure witness is an authenticated Store effect, with the
 * physical source as actor. The absence of a witness is not evidence that
 * the human source would not create pressure. In particular, a capped or
 * crashed match is never coded as a negative opportunity.
 *
 * @param {object|undefined} row Registered source-game observation.
 * @param {0|1} sourceSeat Physical source seat.
 * @returns {'verified-effect'|'no-witness-in-terminal'|'censored'|'missing'}
 */
function pressureEvidence(row,sourceSeat){
  if(!row)return 'missing';
  const pressure=row.sourcePressure;
  // A producer's authentication flags alone do not prove that the claimed
  // Store event occurs within this game's accepted root-action ledger.
  // Keep genuine pre-cap effects even when the game subsequently fails.
  const bounded=Number.isSafeInteger(row.rootActionCount) &&
    Number.isSafeInteger(pressure?.rootActionOrdinal) &&
    Number.isSafeInteger(pressure?.completionOrdinal) &&
    Number.isSafeInteger(pressure?.turnBefore) &&
    Number.isSafeInteger(pressure?.completionTurnBefore) &&
    pressure.rootActionOrdinal>=0 &&
    pressure.rootActionOrdinal<=pressure.completionOrdinal &&
    pressure.completionOrdinal<row.rootActionCount &&
    pressure.turnBefore>=1 &&
    pressure.completionTurnBefore===pressure.turnBefore &&
    pressureLedgerAligned(row,pressure,sourceSeat);
  if(bounded && pressure.accepted===true &&
      pressure.effectVerified===true &&
      pressure.traceAuthenticated===true &&
      pressure.actorSeat===sourceSeat)return 'verified-effect';
  return row.status==='engine-terminal'?'no-witness-in-terminal':'censored';
}

/**
 * Inclusive paired-attempt census for an already validated preregistered
 * bilateral-v2 archive. This is a separate *unconditional* accounting gate.
 * The source-pressure witness is a post-deal outcome and MUST NOT determine
 * entry into the denominator. The original strict pressure/reply gate is
 * retained for a different question, mechanical action-fidelity witnesses.
 *
 * @param {object} plan Frozen registration with two candidate 60s.
 * @param {object} archive All attempted games, including failures and caps.
 * @returns {object}
 */
function auditUnconditionalBilateralCensus(plan,archive){
  // Fail closed on exact registered prints, policies, seeds, real Store draw
  // lineage, engine decks, duplicate source streams and fabricated terminals.
  const strict=auditBilateralV2(plan,archive);
  const byArm=new Map(plan.arms.map(arm=>[arm.id,arm]));
  const byResult=new Map(archive.rows.map(row=>[row.id,row]));
  const candidateIds=plan.candidates.map(candidate=>candidate.id);
  const pairs=strict.pairs.map(pair=>{
    const members=pair.armIds.map(id=>byArm.get(id));
    const sourceSeat=1-pair.candidateSeat;
    const perCandidate=candidateIds.map(candidateId=>{
      const scheduled=members.find(arm=>arm.candidateId===candidateId);
      const row=byResult.get(scheduled.id);
      return {
        candidateId,armId:scheduled.id,
        status:row?.status??'missing',
        sourcePressureEvidence:pressureEvidence(row,sourceSeat),
        rank6InPlayApplicability:pair.rank===6?
          rank6CandidateApplicability(row,sourceSeat):null,
        rank11InPlayApplicability:pair.rank===11?
          rank11CandidateApplicability(row,sourceSeat):null,
        // Engine terminal is retained as a state indicator, never as a
        // competitively qualified game win.
        engineTerminalObserved:row?.status==='engine-terminal',
        engineWinner:row?.status==='engine-terminal'?row.engineWinner:null
      };
    });
    const aligned=pair.firstObservationComparable===true;
    const fullTerminal=perCandidate.every(x=>x.engineTerminalObserved);
    const p0=perCandidate[0].sourcePressureEvidence==='verified-effect';
    const p1=perCandidate[1].sourcePressureEvidence==='verified-effect';
    // Preserve realized pressure separately for legitimate source-deal drift.
    // A different source bonus-draw outcome can be an inventory treatment
    // consequence, so the unaligned arm must remain in intent-to-test.
    const pressureRegardlessOfAlignment=!fullTerminal?null:
      p0&&p1?'both-witnessed':
      p0?'first-only-witnessed':
      p1?'second-only-witnessed':'neither-witnessed';
    const pressureCell=!aligned?'unaligned-start-or-deal':
      !fullTerminal?'censored-or-missing':
      p0&&p1?'both-witnessed':
      p0?'first-only-witnessed':
      p1?'second-only-witnessed':'neither-witnessed';
    return {
      pairId:pair.pairId,sourceRank:pair.rank,
      candidateSeat:pair.candidateSeat,
      actualSourceDealAligned:pair.sourcePhysicalDealAligned,
      actualStarterAligned:pair.actualStartAligned,
      candidateArms:perCandidate,
      bothEngineTerminal:fullTerminal,
      pressureCell,
      unalignedTerminalPressureCell:!aligned?pressureRegardlessOfAlignment:null,
      // A selected opportunity is a downstream variable. Keeping this
      // category in the census cannot turn it into causal comparison evidence.
      sourcePressureCausalityCertified:false,
      actualGameWinCertified:false
    };
  });
  const byRank=Object.fromEntries(plan.opponents.map(opponent=>{
    const subset=pairs.filter(pair=>pair.sourceRank===opponent.rank);
    const pressureCells=Object.fromEntries(PRESSURE_CELLS.map(cell=>
      [cell,subset.filter(pair=>pair.pressureCell===cell).length]));
    const unalignedTerminalPressureCells=Object.fromEntries(
      PRESSURE_CELLS.slice(0,4).map(cell=>[cell,subset.filter(pair=>
        pair.unalignedTerminalPressureCell===cell).length]));
    return [opponent.rank,{
      pairsRegistered:subset.length,
      pairsBothEngineTerminal:subset.filter(p=>p.bothEngineTerminal).length,
      pairsUnaligned:subset.filter(p=>
        p.pressureCell==='unaligned-start-or-deal').length,
      pairsCensoredOrMissing:subset.filter(p=>
        p.pressureCell==='censored-or-missing').length,
      pressureCells,
      // Per-arm public in-play susceptibility; never select the cohort on
      // these post-deal observations or promote them as independent effects.
      rank6InPlayApplicabilityCells:opponent.rank===6?
        Object.fromEntries(APPLICABILITY_CELLS.map(cell=>[cell,
          subset.flatMap(pair=>pair.candidateArms).filter(arm=>
            arm.rank6InPlayApplicability===cell).length])):null,
      rank11InPlayApplicabilityCells:opponent.rank===11?
        Object.fromEntries(APPLICABILITY_CELLS.map(cell=>[cell,
          subset.flatMap(pair=>pair.candidateArms).filter(arm=>
            arm.rank11InPlayApplicability===cell).length])):null,
      // Descriptive owner-observed pressure only. These are not matched
      // source-position counterfactual comparisons.
      unalignedTerminalPressureCells
    }];
  }));
  const allRegisteredAttemptsAccounted=strict.completeAttemptCensus;
  const actualStartsPerCandidateAndRankObserved=
    strict.twoRealStartsPerCandidateAndRankObserved;
  // Aggregate both-start coverage can hide a malformed extra arm whose
  // candidate/real-first pair was covered by another legitimate repeat.
  const allRegisteredArmsStartVerified=strict.arms.every(
    arm=>arm.validStart===true);
  // Retain genuine candidate-dependent source-deal drift, but never mistake
  // an absent or malformed physical source-start fingerprint for an
  // authenticated registered attempt.
  const allRegisteredSourceStartsFingerprinted=strict.arms.every(arm=>
    typeof arm.sourceDealFingerprint==='string' &&
    /^[0-9a-f]{64}$/.test(arm.sourceDealFingerprint));
  const unconditionalAttemptCensusReviewable=
    allRegisteredAttemptsAccounted&&
    actualStartsPerCandidateAndRankObserved&&
    allRegisteredArmsStartVerified&&
    allRegisteredSourceStartsFingerprinted;
  const alignedCompletePairedCensus=
    strict.completeAttemptCensus &&
    strict.twoRealStartsPerCandidateAndRankObserved &&
    pairs.every(pair=>pair.actualSourceDealAligned &&
      pair.actualStarterAligned);
  return {
    schema:'aichi-bilateral-unconditional-paired-attempt-census-v1',
    candidateOrder:candidateIds,
    registeredArms:strict.registeredArms,
    observedArms:strict.observedArms,
    registeredPairs:pairs.length,
    allRegisteredAttemptsAccounted,
    actualStartsPerCandidateAndRankObserved,
    // Descriptive paired physical-seat/actual-first coverage. This does not
    // alter unconditional attempt inclusion or competitive qualification.
    fourCellCoverage:strict.fourCellCoverage,
    allRegisteredArmsStartVerified,
    allRegisteredSourceStartsFingerprinted,
    // Unconditional accounting deliberately does not select on post-setup
    // source fingerprint or observed opponent lock pressure.
    unconditionalAttemptCensusReviewable,
    pairedAttemptCensusReviewable:alignedCompletePairedCensus,
    pairedAttemptCensusVerdict:alignedCompletePairedCensus?
      'ALIGNED-ATTEMPT-CENSUS-REVIEWABLE':'HOLD-UNALIGNED-OR-INCOMPLETE',
    originalStrictMechanicalVerdict:strict.opportunityAndPolicyVerdict,
    mechanicallyPairedWitnesses:strict.pairs.filter(p=>
      p.firstObservationComparable&&p.bothBilateralWitnesses).length,
    byRank,pairs,
    gameWinRateCertified:false,
    comparativeStrengthCertified:false,
    paperClockCertified:false,
    caveat:'Unconditional attempt accounting is separate from matched '+ 
      'physical source-deal reviewability. Unaligned terminal pressure '+ 
      'cells are descriptive, not paired causal effects. '+ 
      'Includes every registered arm regardless of pressure. Rank-6 and '+
      'rank-11 in-play applicability are descriptive and cannot authenticate '+
      'the source '+
      'lock, including when no eligible target exists. Missing, failed '+
      'and capped source games remain in the denominator. No witnessed effect '+
      'does not imply no possible pressure. An engine terminal is not a '+
      'qualified win. This census does not repair an unfair hidden-information '+
      'policy, prove paper rules, measure actual match time or recover the '+
      'three absent Top32 source lists.'
  };
}

module.exports={auditUnconditionalBilateralCensus,pressureEvidence,pressureLedgerAligned};
