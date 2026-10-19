'use strict';

const assert=require('node:assert/strict');

const SHA256=/^[0-9a-f]{64}$/;
const STATUSES=new Set(['engine-terminal','action-cap','engine-error']);
/** @param {unknown} value @returns {boolean} */
const digest=value=>typeof value==='string'&&SHA256.test(value);

/**
 * Check one future, externally registered common-policy v2 observation set.
 * The caller is responsible for preserving an independently timestamped plan
 * before collecting the held-out data. This audit is deliberately independent
 * of any frozen historical v1 seed archive.
 *
 * This is an attempt-accounting and mechanical evidence gate. It cannot
 * certify human opponent policy, actual game clock, paper rules, or win rate.
 *
 * @param {object} plan Immutable prospective plan.
 * @param {object} archive Execution archive from that plan.
 * @returns {object} Deterministic auditable diagnostic, never a win estimate.
 */
function auditBilateralV2(plan,archive) {
  assert.equal(plan?.schema,'aichi-bilateral-common-policy-plan-v2');
  assert.equal(archive?.schema,'aichi-bilateral-common-policy-observations-v2');
  assert.equal(plan.status,'precommitted');
  assert.ok(digest(plan.id),'Registration ID must be a SHA-256');
  assert.equal(archive.registrationId,plan.id);
  for(const field of ['enginePin','researchRevision','seedProtocol',
    'candidatePolicySha256','sourcePolicySha256']) {
    assert.equal(archive[field],plan[field],
      'Frozen protocol drift: '+field);
  }
  assert.ok(digest(plan.candidatePolicySha256));
  assert.ok(digest(plan.sourcePolicySha256));
  assert.ok(digest(plan.researchRevision));
  assert.ok(typeof plan.enginePin==='string'&&/^[0-9a-f]{40}$/.test(plan.enginePin));
  assert.ok(Number.isInteger(plan.maxRootActions)&&plan.maxRootActions>0);
  assert.ok(Array.isArray(plan.candidates)&&plan.candidates.length===2);
  assert.ok(Array.isArray(plan.opponents)&&plan.opponents.length>=2);
  assert.ok(Array.isArray(plan.arms)&&plan.arms.length>0);
  assert.ok(Array.isArray(archive.rows));

  const candidateById=new Map();
  for(const candidate of plan.candidates) {
    assert.ok(typeof candidate.id==='string'&&candidate.id.length);
    assert.ok(digest(candidate.deckSha256),'Candidate physical print digest required');
    assert.ok(digest(candidate.engineDeckSha256),
      'Candidate resolved engine 60 digest required');
    assert.ok(!candidateById.has(candidate.id),'Duplicate candidate ID');
    candidateById.set(candidate.id,candidate);
  }
  const rankMap=new Map();
  for(const opponent of plan.opponents) {
    assert.ok(Number.isInteger(opponent.rank)&&opponent.rank>=1&&
      opponent.rank<=32);
    assert.ok(digest(opponent.deckSha256),'Exact source printed 60 required');
    assert.ok(digest(opponent.engineDeckSha256),
      'Source resolved engine 60 digest required');
    assert.ok(!rankMap.has(opponent.rank),'Duplicate source rank');
    rankMap.set(opponent.rank,opponent);
  }

  for(const hardRank of [6,11]) {
    assert.ok(rankMap.has(hardRank),
      'Bilateral v2 must include hard Aichi rank '+hardRank);
  }

  const arms=new Map();
  const pairs=new Map();
  for(const arm of plan.arms) {
    assert.ok(typeof arm.id==='string'&&arm.id.length);
    assert.ok(!arms.has(arm.id),'Duplicate scheduled arm '+arm.id);
    assert.ok(candidateById.has(arm.candidateId));
    assert.ok(rankMap.has(arm.rank));
    assert.ok([0,1].includes(arm.candidateSeat));
    assert.ok(Number.isSafeInteger(arm.seed)&&arm.seed>=0&&
      arm.seed<=0xffffffff);
    assert.ok(typeof arm.pairId==='string'&&arm.pairId.length);
    arms.set(arm.id,arm);
    if(!pairs.has(arm.pairId))pairs.set(arm.pairId,[]);
    pairs.get(arm.pairId).push(arm);
  }
  /** @type {Map<string,string>} */
  const physicalStreams=new Map();
  for(const [pairId,members] of pairs) {
    assert.equal(members.length,2,'Each pair needs both candidates: '+pairId);
    assert.deepEqual(new Set(members.map(a=>a.candidateId)),
      new Set(candidateById.keys()));
    assert.equal(members[0].rank,members[1].rank);
    assert.equal(members[0].candidateSeat,members[1].candidateSeat);
    assert.equal(members[0].seed,members[1].seed);
    // New pair IDs must not relabel the same source-rank, physical seat
    // and PRNG stream as independent candidate-comparison opportunities.
    const stream=JSON.stringify([
      members[0].rank,members[0].candidateSeat,members[0].seed
    ]);
    assert.ok(!physicalStreams.has(stream),
      'Duplicate physical source stream '+stream+' under both '+
      physicalStreams.get(stream)+' and '+pairId);
    physicalStreams.set(stream,pairId);
  }

  const rows=new Map();
  for(const row of archive.rows) {
    assert.ok(arms.has(row.id),'Unregistered arm '+row.id);
    assert.ok(!rows.has(row.id),'Repeated archive arm '+row.id);
    const arm=arms.get(row.id);
    assert.equal(row.rank,arm.rank);
    assert.equal(row.candidateId,arm.candidateId);
    assert.equal(row.candidateSeat,arm.candidateSeat);
    assert.equal(row.seed,arm.seed,'Registered seed mismatch');
    assert.equal(row.candidateDeckSha256,
      candidateById.get(arm.candidateId).deckSha256,
      'Candidate print digest differs from registered candidateDeckSha256');
    assert.equal(row.sourceDeckSha256,rankMap.get(arm.rank).deckSha256,
      'Source deck print digest differs from registered sourceDeckSha256');
    assert.equal(row.candidatePolicySha256,plan.candidatePolicySha256,
      'Per-arm candidate decision policy changed');
    assert.equal(row.sourcePolicySha256,plan.sourcePolicySha256,
      'Per-arm source decision policy changed');
    assert.ok(Array.isArray(row.engineDeckHashes) &&
      row.engineDeckHashes.length===2,
      'Actual Store engineDeckHashes required');
    const candidateHash=candidateById.get(arm.candidateId).engineDeckSha256;
    const sourceHash=rankMap.get(arm.rank).engineDeckSha256;
    assert.deepEqual(row.engineDeckHashes,arm.candidateSeat===0?
      [candidateHash,sourceHash]:[sourceHash,candidateHash],
      'Actual resolved engine inputs contradict registered physical print plan');
    assert.ok(STATUSES.has(row.status),'Unknown status in '+row.id);
    assert.ok(Number.isSafeInteger(row.rootActionCount)&&
      row.rootActionCount>=0&&row.rootActionCount<=plan.maxRootActions);
    if(row.status==='engine-terminal') {
      assert.equal(row.engineFinished,true);
      assert.ok([0,1,3].includes(row.engineWinner),
        'Engine terminal must bind real winner/draw');
    }else{
      assert.equal(row.engineFinished,false,
        'Unfinished attempts cannot supply a terminal');
      assert.equal(row.engineWinner,null,
        'Error and cap cannot be assigned a winner');
    }
    rows.set(row.id,row);
  }

  const diagnostics=[];
  for(const arm of plan.arms) {
    const row=rows.get(arm.id);
    if(!row) {
      diagnostics.push({...arm,status:'missing',actualStarter:null,
        validStart:false,mechanicalBilateralWitness:false,
        sourceDealFingerprint:null,
        vetoes:['missing-attempt-evidence']});
      continue;
    }
    const sourceSeat=1-arm.candidateSeat;
    const actualSeat=row.actualStarterSeat;
    // The boolean is a producer assertion. Require the Store-observed player
    // and first turn draw log to agree with the claimed physical seat.
    const validStart=row.verifiedFirstTurn===true &&
      (actualSeat===0 || actualSeat===1) &&
      row.firstTurnPlayerId===(actualSeat===0?101:202) &&
      row.firstTurnPlayerName===(actualSeat===0?'research-A':'research-B') &&
      row.firstDrawLogName===row.firstTurnPlayerName;
    const sourcePressure=row.sourcePressure?.accepted===true &&
      row.sourcePressure?.effectVerified===true &&
      row.sourcePressure?.traceAuthenticated===true &&
      row.sourcePressure?.actorSeat===sourceSeat;
    const firstCandidateReply=row.candidateReply?.observed===true &&
      row.candidateReply?.legal===true &&
      row.candidateReply?.ownerInformationSafe===true &&
      row.candidateReply?.traceAuthenticated===true &&
      row.candidateReply?.actorSeat===arm.candidateSeat;
    const sourceContinuation=row.sourceContinuation?.observed===true &&
      row.sourceContinuation?.legal===true &&
      row.sourceContinuation?.ownerInformationSafe===true &&
      row.sourceContinuation?.traceAuthenticated===true &&
      row.sourceContinuation?.actorSeat===sourceSeat;
    const chronological=Number.isSafeInteger(
      row.sourcePressure?.rootActionOrdinal)&&
      Number.isSafeInteger(row.sourcePressure?.completionOrdinal)&&
      Number.isSafeInteger(row.candidateReply?.rootActionOrdinal)&&
      Number.isSafeInteger(row.sourceContinuation?.rootActionOrdinal)&&
      0<=row.sourcePressure.rootActionOrdinal &&
      row.sourcePressure.rootActionOrdinal<=
        row.sourcePressure.completionOrdinal &&
      row.sourcePressure.completionOrdinal<
        row.candidateReply.rootActionOrdinal &&
      row.candidateReply.rootActionOrdinal<
        row.sourceContinuation.rootActionOrdinal &&
      row.sourceContinuation.rootActionOrdinal<row.rootActionCount;
    // Action ordinals alone allow an opponent move from many turns later
    // to masquerade as the immediate bilateral reply. The producer must
    // bind these global turn numbers to the same authenticated Store roots.
    // A pressure attack may advance the global turn on resolution, so use
    // the closing prompt root's turnBefore, rather than its turnAfter.
    const pressureTurn=row.sourcePressure?.turnBefore;
    const completionTurn=row.sourcePressure?.completionTurnBefore;
    const candidateTurn=row.candidateReply?.turnBefore;
    const nextSourceTurn=row.sourceContinuation?.turnBefore;
    // Printed extra-turn attacks such as Timeless-GX can change which
    // physical player owns odd/even global turns. Observed root actor seats
    // above, rather than inferred parity, establish the actual participants.
    const immediateFirstReply=validStart&&
      [pressureTurn,completionTurn,candidateTurn,nextSourceTurn]
        .every(n=>Number.isSafeInteger(n)&&n>=1) &&
      completionTurn===pressureTurn &&
      candidateTurn===pressureTurn+1;
    // A candidate can legally answer with Timeless-GX (including a copied
    // attack), receive its own next turn, and delay the source return from
    // t+2 to t+3. Never accept the gap on turn numbers alone. Require a
    // separately recorded, prompt-closed and Store-bound source of the
    // extra turn, plus an actual root owned by the candidate on that turn.
    // These producer assertions still require independent root-ledger audit.
    const bonus=row.candidateBonusTurn;
    const candidateBonusTurnLineage=immediateFirstReply&&
      nextSourceTurn===pressureTurn+3 &&
      bonus?.accepted===true &&
      bonus?.effectVerified===true &&
      bonus?.traceAuthenticated===true &&
      bonus?.actorSeat===arm.candidateSeat &&
      bonus?.chosenAttack==='Timeless-GX' &&
      bonus?.grantTurnBefore===candidateTurn &&
      bonus?.completionTurnBefore===candidateTurn &&
      bonus?.nextOwnTurnBefore===candidateTurn+1 &&
      [bonus?.grantRootActionOrdinal,bonus?.completionOrdinal,
        bonus?.nextOwnRootActionOrdinal].every(n=>
        Number.isSafeInteger(n)&&n>=0) &&
      row.candidateReply.rootActionOrdinal<=
        bonus.grantRootActionOrdinal &&
      bonus.grantRootActionOrdinal<=bonus.completionOrdinal &&
      bonus.completionOrdinal<bonus.nextOwnRootActionOrdinal &&
      bonus.nextOwnRootActionOrdinal<
        row.sourceContinuation.rootActionOrdinal;
    const immediateTurnLineage=immediateFirstReply&&
      (nextSourceTurn===pressureTurn+2||candidateBonusTurnLineage);
    const bilateralWitness=validStart&&sourcePressure&&firstCandidateReply&&
      sourceContinuation&&chronological&&immediateTurnLineage&&
      row.status!=='engine-error';
    const vetoes=[];
    if(!validStart)vetoes.push('actual-first-player-unverified');
    if(row.status==='engine-error')vetoes.push('engine-error');
    if(row.status==='action-cap')vetoes.push('action-capped');
    if(!sourcePressure)vetoes.push('source-pressure-unverified');
    if(!firstCandidateReply)vetoes.push('candidate-legal-reply-unverified');
    if(!sourceContinuation)vetoes.push('source-legal-continuation-unverified');
    if(!chronological)vetoes.push('pressure-reply-followup-order-unverified');
    if(!immediateTurnLineage)vetoes.push('immediate-bilateral-turn-lineage-unverified');
    if(row.status==='engine-terminal'&&
      row.terminalTransitionVerified!==true) {
      vetoes.push('engine-terminal-transition-unverified');
    }
    if(row.paperRuleAuditPassed!==true)vetoes.push('paper-fidelity-unverified');
    if(row.tournamentClockAuditPassed!==true)vetoes.push('match-clock-unverified');
    if(row.fullPolicyInformationSetAuditPassed!==true) {
      vetoes.push('full-policy-information-boundary-unverified');
    }
    diagnostics.push({...arm,status:row.status,
      actualStarter:validStart?(row.actualStarterSeat===arm.candidateSeat?
        'candidate':'source'):null,
      validStart,mechanicalBilateralWitness:bilateralWitness,
      immediateTurnLineage,candidateBonusTurnLineage,
      sourceDealFingerprint:digest(row.sourceDealFingerprint)?
        row.sourceDealFingerprint:null,
      vetoes});
  }
  const byId=new Map(diagnostics.map(d=>[d.id,d]));
  const pairRows=[];
  for(const [pairId,scheduled] of pairs) {
    const x=byId.get(scheduled[0].id);
    const y=byId.get(scheduled[1].id);
    const observed=rows.get(x.id)&&rows.get(y.id);
    const sourcePhysicalDealAligned=Boolean(observed &&
      x.sourceDealFingerprint&&
      x.sourceDealFingerprint===y.sourceDealFingerprint);
    const actualStartAligned=Boolean(observed&&x.validStart&&y.validStart&&
      x.actualStarter===y.actualStarter);
    pairRows.push({pairId,rank:x.rank,candidateSeat:x.candidateSeat,
      armIds:[x.id,y.id],
      sourcePhysicalDealAligned,actualStartAligned,
      firstObservationComparable:sourcePhysicalDealAligned&&actualStartAligned,
      bothBilateralWitnesses:x.mechanicalBilateralWitness&&
        y.mechanicalBilateralWitness,
      isolatedInventoryEffectCertified:false
    });
  }
  const byRank=Object.fromEntries([...rankMap.keys()].map(rank=>{
    const local=diagnostics.filter(row=>row.rank===rank);
    return [rank,{registered:local.length,
      observed:local.filter(row=>row.status!=='missing').length,
      terminal:local.filter(row=>row.status==='engine-terminal').length,
      censored:local.filter(row=>row.status==='action-cap').length,
      errors:local.filter(row=>row.status==='engine-error').length,
      missing:local.filter(row=>row.status==='missing').length,
      sourceFirst:local.filter(row=>row.actualStarter==='source').length,
      candidateFirst:local.filter(row=>row.actualStarter==='candidate').length,
      bilateralMechanics:local.filter(row=>row.mechanicalBilateralWitness).length
    }];
  }));
  const coverageComplete=diagnostics.every(d=>d.status!=='missing');
  const twoStartCoverage=[...rankMap.keys()].every(rank=>
    ['source','candidate'].every(first=>
      diagnostics.some(row=>row.rank===rank&&row.actualStarter===first)));
  // A pooled rank can misleadingly cover both starts when one of the
  // competing inventories was only observed under one actual turn order.
  const twoStartCoverageByCandidate=[...rankMap.keys()].every(rank=>
    [...candidateById.keys()].every(candidateId=>
      ['source','candidate'].every(first=>
        diagnostics.some(row=>row.rank===rank&&
          row.candidateId===candidateId&&row.actualStarter===first))));
  const noPolicyProtocolDrift=coverageComplete;
  const mechanicalWitnesses=diagnostics.filter(
    d=>d.mechanicalBilateralWitness).length;
  const bothHardRanksHaveBilateralWitnesses=[6,11].every(rank=>
    byRank[rank].bilateralMechanics>0);
  // Individually witnessed lines do not constitute candidate comparisons
  // when no pair shares the verified initial physical opponent deal.
  const bothHardRanksHavePairedBilateralWitnesses=[6,11].every(rank=>
    pairRows.some(pair=>pair.rank===rank&&pair.firstObservationComparable&&
      pair.bothBilateralWitnesses));
  return {
    schema:'aichi-bilateral-v2-intake-diagnostic-v1',
    registeredArms:arms.size,observedArms:rows.size,
    completeAttemptCensus:coverageComplete,
    twoRealStartsPerRankObserved:twoStartCoverage,
    twoRealStartsPerCandidateAndRankObserved:twoStartCoverageByCandidate,
    noPolicyProtocolDrift,
    bothHardRanksHaveBilateralWitnesses,
    bothHardRanksHavePairedBilateralWitnesses,
    mechanicalBilateralWitnesses:mechanicalWitnesses,
    alignedPhysicalSourcePairs:pairRows.filter(p=>
      p.firstObservationComparable).length,
    byRank,pairs:pairRows,arms:diagnostics,
    opportunityAndPolicyVerdict:coverageComplete&&twoStartCoverageByCandidate&&
      bothHardRanksHavePairedBilateralWitnesses?'MECHANICAL-PILOT-REVIEWABLE':
        'HOLD-OR-INCOMPLETE',
    competitiveStrengthClaimPermitted:false,
    gameWinRateCertified:false,
    caveat:'No game, including an engine terminal, becomes a qualified win '+
      'without external paper-rule, full policy, timing and full-32 field review.'
  };
}
module.exports={auditBilateralV2};
