'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditUnconditionalBilateralCensus,pressureEvidence}=
  require('../simulation/evaluation/agent2-bilateral-unconditional-census.cjs');

/** @param {string} c @returns {string} */
const hex=c=>c.repeat(64);

/** @returns {{plan:object,archive:object}} */
function fixture(){
  const plan={
    schema:'aichi-bilateral-common-policy-plan-v2',
    status:'precommitted',id:hex('a'),
    enginePin:'f'.repeat(40),researchRevision:hex('b'),
    seedProtocol:'independent-prospective-two-seat-v2',
    candidatePolicySha256:hex('c'),sourcePolicySha256:hex('d'),
    maxRootActions:280,
    candidates:[
      {id:'reference',deckSha256:hex('1'),engineDeckSha256:hex('a')},
      {id:'newmoon',deckSha256:hex('2'),engineDeckSha256:hex('b')}
    ],
    opponents:[
      {rank:6,deckSha256:hex('3'),engineDeckSha256:hex('c')},
      {rank:11,deckSha256:hex('4'),engineDeckSha256:hex('d')}
    ],
    arms:[]
  };
  const archive={
    schema:'aichi-bilateral-common-policy-observations-v2',
    registrationId:plan.id,enginePin:plan.enginePin,
    researchRevision:plan.researchRevision,seedProtocol:plan.seedProtocol,
    candidatePolicySha256:plan.candidatePolicySha256,
    sourcePolicySha256:plan.sourcePolicySha256,
    rows:[]
  };
  for(const opponent of plan.opponents){
    for(const seat of [0,1]){
      const sourceTurn=seat===0?2:1;
      const pairId=opponent.rank+':registered:'+seat;
      for(const candidate of plan.candidates){
        const arm={id:pairId+':'+candidate.id,pairId,
          rank:opponent.rank,candidateId:candidate.id,
          candidateSeat:seat,seed:opponent.rank*101+seat};
        plan.arms.push(arm);
        archive.rows.push({
          ...arm,candidateDeckSha256:candidate.deckSha256,
          sourceDeckSha256:opponent.deckSha256,
          candidatePolicySha256:plan.candidatePolicySha256,
          sourcePolicySha256:plan.sourcePolicySha256,
          engineDeckHashes:seat===0?
            [candidate.engineDeckSha256,opponent.engineDeckSha256]:
            [opponent.engineDeckSha256,candidate.engineDeckSha256],
          status:'engine-terminal',engineFinished:true,engineWinner:seat,
          rootActionCount:110,actualStarterSeat:0,
          verifiedFirstTurn:true,firstTurnPlayerId:101,
          firstTurnPlayerName:'research-A',firstDrawLogName:'research-A',
          sourceDealFingerprint:hex(opponent.rank===6?'5':'6'),
          sourcePressure:{
            accepted:true,effectVerified:true,traceAuthenticated:true,
            actorSeat:1-seat,rootActionOrdinal:10,completionOrdinal:12,
            turnBefore:sourceTurn,completionTurnBefore:sourceTurn
          },
          candidateReply:{observed:true,legal:true,ownerInformationSafe:true,
            traceAuthenticated:true,actorSeat:seat,rootActionOrdinal:15,
            turnBefore:sourceTurn+1},
          sourceContinuation:{observed:true,legal:true,
            ownerInformationSafe:true,traceAuthenticated:true,
            actorSeat:1-seat,rootActionOrdinal:20,
            turnBefore:sourceTurn+2},
          terminalTransitionVerified:true,paperRuleAuditPassed:false,
          tournamentClockAuditPassed:false,
          fullPolicyInformationSetAuditPassed:false
        });
      }
    }
  }
  return {plan,archive};
}

/** @param {object} archive @param {6|11} rank @param {0|1} seat @param {string} candidateId */
function rowFor(archive,rank,seat,candidateId){
  const row=archive.rows.find(row=>row.rank===rank &&
    row.candidateSeat===seat && row.candidateId===candidateId);
  assert.ok(row);
  return row;
}

test('all registered, aligned actual-first paired attempts are reviewable',()=>{
  const {plan,archive}=fixture();
  const census=auditUnconditionalBilateralCensus(plan,archive);
  assert.equal(census.registeredArms,8);
  assert.equal(census.observedArms,8);
  assert.equal(census.registeredPairs,4);
  assert.equal(census.pairedAttemptCensusReviewable,true);
  assert.equal(census.allRegisteredAttemptsAccounted,true);
  assert.equal(census.unconditionalAttemptCensusReviewable,true);
  assert.equal(census.actualStartsPerCandidateAndRankObserved,true);
  assert.equal(census.mechanicallyPairedWitnesses,4);
  assert.equal(census.byRank[6].pressureCells['both-witnessed'],2);
  assert.equal(census.byRank[11].pressureCells['both-witnessed'],2);
  assert.equal(census.gameWinRateCertified,false);
  assert.equal(census.comparativeStrengthCertified,false);
});

test('asymmetric pressure stays in unconditional pair denominator',()=>{
  const {plan,archive}=fixture();
  rowFor(archive,6,0,'newmoon').sourcePressure.effectVerified=false;
  const census=auditUnconditionalBilateralCensus(plan,archive);
  assert.equal(census.pairedAttemptCensusReviewable,true);
  assert.equal(census.byRank[6].pressureCells['first-only-witnessed'],1);
  assert.equal(census.byRank[6].pressureCells['both-witnessed'],1);
  assert.equal(census.mechanicallyPairedWitnesses,3);
  assert.equal(census.originalStrictMechanicalVerdict,'MECHANICAL-PILOT-REVIEWABLE',
    'Strict gate may still pass with one paired witness per hard rank');
  assert.equal(census.pairs[0].candidateArms[1].sourcePressureEvidence,
    'no-witness-in-terminal');
  assert.equal(census.pairs[0].sourcePressureCausalityCertified,false);
});

test('neither candidate need witness pressure for census inclusion',()=>{
  const {plan,archive}=fixture();
  for(const row of archive.rows.filter(row=>row.rank===11)){
    row.sourcePressure.accepted=false;
  }
  const census=auditUnconditionalBilateralCensus(plan,archive);
  assert.equal(census.pairedAttemptCensusReviewable,true);
  assert.equal(census.byRank[11].pressureCells['neither-witnessed'],2);
  assert.equal(census.originalStrictMechanicalVerdict,'HOLD-OR-INCOMPLETE');
});

test('capped/failed arms are retained without invented negative opportunities',()=>{
  const {plan,archive}=fixture();
  for(const [candidateId,status] of [
    ['reference','action-cap'],['newmoon','engine-error']
  ]){
    const row=rowFor(archive,6,0,candidateId);
    row.status=status;row.engineFinished=false;row.engineWinner=null;
    row.sourcePressure.effectVerified=false;
    if(status==='action-cap')row.rootActionCount=280;
  }
  const census=auditUnconditionalBilateralCensus(plan,archive);
  assert.equal(census.pairedAttemptCensusReviewable,true,
    'The attempted comparison is counted, with explicit censoring');
  assert.equal(census.byRank[6].pressureCells['censored-or-missing'],1);
  assert.equal(census.byRank[6].pairsCensoredOrMissing,1);
  const pair=census.pairs[0];
  assert.deepEqual(pair.candidateArms.map(x=>x.status),
    ['action-cap','engine-error']);
  assert.deepEqual(pair.candidateArms.map(x=>x.sourcePressureEvidence),
    ['censored','censored']);
  assert.equal(pair.candidateArms[0].engineWinner,null);
});

test('missing arm or different real source deal blocks aligned census',()=>{
  const x=fixture();
  x.archive.rows.pop();
  let census=auditUnconditionalBilateralCensus(x.plan,x.archive);
  assert.equal(census.registeredArms,8);
  assert.equal(census.observedArms,7);
  assert.equal(census.allRegisteredAttemptsAccounted,false);
  assert.equal(census.unconditionalAttemptCensusReviewable,false);
  assert.equal(census.pairedAttemptCensusReviewable,false);
  const y=fixture();
  rowFor(y.archive,11,1,'newmoon').sourceDealFingerprint=hex('e');
  census=auditUnconditionalBilateralCensus(y.plan,y.archive);
  assert.equal(census.pairedAttemptCensusReviewable,false);
  assert.equal(census.byRank[11].pressureCells['unaligned-start-or-deal'],1);
  assert.equal(census.allRegisteredAttemptsAccounted,true);
  assert.equal(census.unconditionalAttemptCensusReviewable,true,
    'Legitimate source-deal divergence cannot erase complete attempt review');
  assert.equal(census.pairs.find(p=>p.sourceRank===11&&p.candidateSeat===1)
    .unalignedTerminalPressureCell,'both-witnessed');
  assert.equal(census.byRank[11].unalignedTerminalPressureCells['both-witnessed'],1);
});

test('real first-turn draw mismatch and policy drift fail closed',()=>{
  const x=fixture();
  rowFor(x.archive,11,0,'reference').firstDrawLogName='research-B';
  assert.equal(auditUnconditionalBilateralCensus(x.plan,x.archive)
    .pairedAttemptCensusReviewable,false);
  const y=fixture();
  rowFor(y.archive,11,0,'reference').candidatePolicySha256=hex('e');
  assert.throws(()=>auditUnconditionalBilateralCensus(y.plan,y.archive),
    /Per-arm candidate decision policy changed/);
});

test('pressure witness helper never calls an incomplete game a negative',()=>{
  assert.equal(pressureEvidence(undefined,1),'missing');
  assert.equal(pressureEvidence({status:'engine-error'},1),'censored');
  assert.equal(pressureEvidence({status:'action-cap',
    sourcePressure:{accepted:true,effectVerified:false}},0),'censored');
  assert.equal(pressureEvidence({status:'engine-terminal',
    sourcePressure:{accepted:true,effectVerified:true,
      traceAuthenticated:true,actorSeat:1}},0),'no-witness-in-terminal');
  assert.equal(pressureEvidence({status:'action-cap',rootActionCount:30,
    sourcePressure:{accepted:true,effectVerified:true,
      traceAuthenticated:true,actorSeat:0,rootActionOrdinal:5,
      completionOrdinal:6,turnBefore:1,completionTurnBefore:1}},
  0),'verified-effect');
});


test('unaligned source-deal pressure is retained without claiming a matched counterfactual',()=>{
  const {plan,archive}=fixture();
  const row=rowFor(archive,11,1,'newmoon');
  row.sourceDealFingerprint=hex('e');
  row.sourcePressure.effectVerified=false;
  const census=auditUnconditionalBilateralCensus(plan,archive);
  assert.equal(census.unconditionalAttemptCensusReviewable,true);
  assert.equal(census.pairedAttemptCensusReviewable,false);
  assert.equal(census.byRank[11].pressureCells['unaligned-start-or-deal'],1);
  assert.equal(census.byRank[11].unalignedTerminalPressureCells['first-only-witnessed'],1);
  const pair=census.pairs.find(p=>p.sourceRank===11&&p.candidateSeat===1);
  assert.equal(pair.unalignedTerminalPressureCell,'first-only-witnessed');
  assert.equal(pair.candidateArms[0].sourcePressureEvidence,'verified-effect');
  assert.equal(pair.candidateArms[1].sourcePressureEvidence,'no-witness-in-terminal');
  assert.equal(pair.sourcePressureCausalityCertified,false);
  assert.equal(census.comparativeStrengthCertified,false);
});

test('unaligned censored arms never acquire fabricated negative pressure',()=>{
  const {plan,archive}=fixture();
  const row=rowFor(archive,11,1,'newmoon');
  row.sourceDealFingerprint=hex('e');
  row.status='action-cap';row.engineFinished=false;row.engineWinner=null;
  row.rootActionCount=280;
  const census=auditUnconditionalBilateralCensus(plan,archive);
  assert.equal(census.unconditionalAttemptCensusReviewable,true);
  assert.equal(census.byRank[11].pressureCells['unaligned-start-or-deal'],1);
  assert.equal(census.byRank[11].unalignedTerminalPressureCells['both-witnessed'],0);
  const pair=census.pairs.find(p=>p.sourceRank===11&&p.candidateSeat===1);
  assert.equal(pair.unalignedTerminalPressureCell,null);
  assert.equal(pair.candidateArms[1].status,'action-cap');
  assert.equal(pair.candidateArms[1].engineWinner,null);
});


test('every actual physical source start must have a fingerprint even when arms diverge',()=>{
  const x=fixture();
  rowFor(x.archive,11,1,'newmoon').sourceDealFingerprint='';
  let census=auditUnconditionalBilateralCensus(x.plan,x.archive);
  assert.equal(census.allRegisteredAttemptsAccounted,true);
  assert.equal(census.actualStartsPerCandidateAndRankObserved,true);
  assert.equal(census.allRegisteredArmsStartVerified,true);
  assert.equal(census.allRegisteredSourceStartsFingerprinted,false);
  assert.equal(census.unconditionalAttemptCensusReviewable,false,
    'Unknown physical origin is not an authenticated unconditional start');
  assert.equal(census.byRank[11].pressureCells['unaligned-start-or-deal'],1);

  const y=fixture();
  rowFor(y.archive,11,1,'newmoon').sourceDealFingerprint=hex('e');
  census=auditUnconditionalBilateralCensus(y.plan,y.archive);
  assert.equal(census.allRegisteredSourceStartsFingerprinted,true);
  assert.equal(census.unconditionalAttemptCensusReviewable,true,
    'Two different genuine source fingerprints remain an unconditional cohort');

  const z=fixture();
  rowFor(z.archive,6,0,'reference').sourceDealFingerprint=null;
  census=auditUnconditionalBilateralCensus(z.plan,z.archive);
  assert.equal(census.allRegisteredSourceStartsFingerprinted,false);
  assert.equal(census.unconditionalAttemptCensusReviewable,false);
});

test('accepted pressure requires a possible source root within the archived ledger',()=>{
  const {plan,archive}=fixture();
  const row=rowFor(archive,6,0,'reference');
  row.sourcePressure.completionOrdinal=row.rootActionCount;
  const census=auditUnconditionalBilateralCensus(plan,archive);
  assert.equal(census.byRank[6].pressureCells['second-only-witnessed'],1);
  assert.equal(census.byRank[6].pressureCells['both-witnessed'],1);
  assert.equal(census.pairs[0].candidateArms[0].sourcePressureEvidence,
    'no-witness-in-terminal');
  assert.equal(census.pairedAttemptCensusReviewable,true,
    'Attempt accounting is independent of rejected pressure witnesses');
});

test('malformed or cross-turn effects cannot fabricate pressure evidence',()=>{
  const {plan,archive}=fixture();
  const row=rowFor(archive,11,1,'newmoon');
  row.sourcePressure.completionTurnBefore++;
  let census=auditUnconditionalBilateralCensus(plan,archive);
  assert.equal(census.byRank[11].pressureCells['first-only-witnessed'],1);
  assert.equal(census.pairs.find(p=>p.sourceRank===11&&p.candidateSeat===1)
    .candidateArms[1].sourcePressureEvidence,'no-witness-in-terminal');
  row.sourcePressure.completionTurnBefore--;
  row.sourcePressure.rootActionOrdinal=-1;
  census=auditUnconditionalBilateralCensus(plan,archive);
  assert.equal(census.byRank[11].pressureCells['first-only-witnessed'],1);
});
