'use strict';

const {auditBilateralV2} = require('./bilateral-v2-evidence-gate.cjs');

const PRESSURE_CELLS=[
  'both-witnessed','first-only-witnessed','second-only-witnessed',
  'neither-witnessed','censored-or-missing','unaligned-start-or-deal'
];

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
  if(pressure?.accepted===true &&
      pressure?.effectVerified===true &&
      pressure?.traceAuthenticated===true &&
      pressure?.actorSeat===sourceSeat)return 'verified-effect';
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
    return [opponent.rank,{
      pairsRegistered:subset.length,
      pairsBothEngineTerminal:subset.filter(p=>p.bothEngineTerminal).length,
      pairsUnaligned:subset.filter(p=>
        p.pressureCell==='unaligned-start-or-deal').length,
      pairsCensoredOrMissing:subset.filter(p=>
        p.pressureCell==='censored-or-missing').length,
      pressureCells
    }];
  }));
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
    caveat:'Includes every registered arm regardless of pressure. Missing, failed '+
      'and capped source games remain in the denominator. No witnessed effect '+
      'does not imply no possible pressure. An engine terminal is not a '+
      'qualified win. This census does not repair an unfair hidden-information '+
      'policy, prove paper rules, measure actual match time or recover the '+
      'three absent Top32 source lists.'
  };
}

module.exports={auditUnconditionalBilateralCensus,pressureEvidence};
