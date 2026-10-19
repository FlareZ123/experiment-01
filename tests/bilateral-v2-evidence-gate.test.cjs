'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditBilateralV2}=
  require('../simulation/evaluation/bilateral-v2-evidence-gate.cjs');

const hex=c=>c.repeat(64);
function fixture(){
  const plan={
    schema:'aichi-bilateral-common-policy-plan-v2',
    status:'precommitted',id:hex('a'),
    enginePin:'f'.repeat(40),researchRevision:hex('b'),
    seedProtocol:'decorrelated-slots-v3',
    candidatePolicySha256:hex('c'),
    sourcePolicySha256:hex('d'),
    maxRootActions:280,
    candidates:[
      {id:'reference',deckSha256:hex('1')},
      {id:'newmoon',deckSha256:hex('2')}
    ],
    opponents:[
      {rank:6,deckSha256:hex('3')},
      {rank:11,deckSha256:hex('4')}
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
  for(const rank of [6,11]){
    for(const seat of [0,1]) {
      const pairId=rank+':0:'+seat, seed=rank*1000+seat;
      for(const candidate of plan.candidates){
        const arm={id:pairId+':'+candidate.id,pairId,
          candidateId:candidate.id,rank,candidateSeat:seat,seed};
        plan.arms.push(arm);
        archive.rows.push({
          ...arm,
          candidateDeckSha256:candidate.deckSha256,
          sourceDeckSha256:plan.opponents.find(row=>row.rank===rank)
            .deckSha256,
          candidatePolicySha256:plan.candidatePolicySha256,
          sourcePolicySha256:plan.sourcePolicySha256,
          status:'engine-terminal',engineFinished:true,engineWinner:seat,
          rootActionCount:125,actualStarterSeat:0,
          verifiedFirstTurn:true,
          firstTurnPlayerId:101,firstTurnPlayerName:'research-A',
          firstDrawLogName:'research-A',
          sourceDealFingerprint:hex(rank===6?'5':'6'),
          sourcePressure:{accepted:true,effectVerified:true,
            traceAuthenticated:true,actorSeat:1-seat,
            rootActionOrdinal:10,completionOrdinal:12},
          candidateReply:{observed:true,legal:true,
            ownerInformationSafe:true,traceAuthenticated:true,
            actorSeat:seat,rootActionOrdinal:16},
          sourceContinuation:{observed:true,legal:true,
            ownerInformationSafe:true,traceAuthenticated:true,
            actorSeat:1-seat,rootActionOrdinal:20},
          terminalTransitionVerified:true,
          paperRuleAuditPassed:false,tournamentClockAuditPassed:false,
          fullPolicyInformationSetAuditPassed:false
        });
      }
    }
  }
  return {plan,archive};
}
test('full dual-start archive is mechanically reviewable, never competitive',()=>{
  const {plan,archive}=fixture(),r=auditBilateralV2(plan,archive);
  assert.equal(r.registeredArms,8);
  assert.equal(r.observedArms,8);
  assert.equal(r.completeAttemptCensus,true);
  assert.equal(r.twoRealStartsPerRankObserved,true);
  assert.equal(r.mechanicalBilateralWitnesses,8);
  assert.equal(r.alignedPhysicalSourcePairs,4);
  assert.equal(r.opportunityAndPolicyVerdict,'MECHANICAL-PILOT-REVIEWABLE');
  assert.equal(r.competitiveStrengthClaimPermitted,false);
  assert.equal(r.gameWinRateCertified,false);
  assert.deepEqual(r.byRank[6],{registered:4,observed:4,terminal:4,
    censored:0,errors:0,missing:0,sourceFirst:2,candidateFirst:2,
    bilateralMechanics:4});
  assert.ok(r.arms.every(row=>row.vetoes.includes('paper-fidelity-unverified')));
});

test('omitted arms remain explicit in registered denominator',()=>{
  const {plan,archive}=fixture();
  archive.rows.pop();
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.registeredArms,8);
  assert.equal(r.observedArms,7);
  assert.equal(r.completeAttemptCensus,false);
  assert.equal(r.noPolicyProtocolDrift,false);
  assert.equal(r.byRank[11].missing,1);
  assert.equal(r.arms.find(row=>row.status==='missing').vetoes[0],
    'missing-attempt-evidence');
});

test('duplicate, unregistered and drifted arms reject before summary',()=>{
  const {plan,archive}=fixture();
  archive.rows.push({...archive.rows[0]});
  assert.throws(()=>auditBilateralV2(plan,archive),/Repeated archive arm/);
  archive.rows.pop();
  archive.rows[0].id='unregistered';
  assert.throws(()=>auditBilateralV2(plan,archive),/Unregistered arm/);
});

test('candidate print digest, common policy and registered seed fail closed',()=>{
  for(const [field,value,pattern] of [
    ['candidateDeckSha256',hex('7'),/candidateDeckSha256/],
    ['candidatePolicySha256',hex('8'),/Per-arm candidate decision policy/],
    ['sourcePolicySha256',hex('8'),/Per-arm source decision policy/],
    ['seed',123456,/seed/]]) {
    const {plan,archive}=fixture();
    archive.rows[0][field]=value;
    assert.throws(()=>auditBilateralV2(plan,archive),pattern);
  }
});

test('shared seed is insufficient to assert the same source physical deal',()=>{
  const {plan,archive}=fixture();
  archive.rows[1].sourceDealFingerprint=hex('0');
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.alignedPhysicalSourcePairs,3);
  assert.equal(r.pairs[0].sourcePhysicalDealAligned,false);
  assert.equal(r.pairs[0].firstObservationComparable,false);
  assert.equal(r.pairs[0].isolatedInventoryEffectCertified,false);
});

test('changed actual first player also disqualifies pair comparability',()=>{
  const {plan,archive}=fixture();
  archive.rows[1].actualStarterSeat=1;
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.alignedPhysicalSourcePairs,3);
  assert.equal(r.pairs[0].sourcePhysicalDealAligned,true);
  assert.equal(r.pairs[0].actualStartAligned,false);
  assert.equal(r.pairs[0].firstObservationComparable,false);
});

test('source attack announcement alone is insufficient for bilateral witness',()=>{
  const {plan,archive}=fixture();
  archive.rows[0].sourcePressure.effectVerified=false;
  archive.rows[1].candidateReply.ownerInformationSafe=false;
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.mechanicalBilateralWitnesses,6);
  assert.ok(r.arms[0].vetoes.includes('source-pressure-unverified'));
  assert.ok(r.arms[1].vetoes.includes('candidate-legal-reply-unverified'));
});

test('action caps and errors stay in the denominator without phantom winners',()=>{
  const {plan,archive}=fixture();
  archive.rows[0].status='action-cap';
  archive.rows[0].engineFinished=false;
  archive.rows[0].engineWinner=null;
  archive.rows[0].rootActionCount=280;
  archive.rows[1].status='engine-error';
  archive.rows[1].engineFinished=false;
  archive.rows[1].engineWinner=null;
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.byRank[6].censored,1);
  assert.equal(r.byRank[6].errors,1);
  assert.equal(r.byRank[6].terminal,2);
  assert.ok(r.arms[0].vetoes.includes('action-capped'));
  assert.ok(r.arms[1].vetoes.includes('engine-error'));
  archive.rows[0].engineWinner=0;
  assert.throws(()=>auditBilateralV2(plan,archive),/cannot be assigned a winner/);
});

test('must register both candidate arms for each intended source pair',()=>{
  const {plan,archive}=fixture();
  plan.arms.pop();
  assert.throws(()=>auditBilateralV2(plan,archive),/Each pair needs both candidates/);
});

test('paper-policy-clock flags remain externally unauthenticated even if true',()=>{
  const {plan,archive}=fixture();
  for(const row of archive.rows) {
    row.paperRuleAuditPassed=true;
    row.tournamentClockAuditPassed=true;
    row.fullPolicyInformationSetAuditPassed=true;
  }
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.competitiveStrengthClaimPermitted,false);
  assert.equal(r.gameWinRateCertified,false);
});

test('booleans cannot fake a chronological prompt-closed bilateral reply',()=>{
  const {plan,archive}=fixture();
  archive.rows[0].candidateReply.rootActionOrdinal=11;
  archive.rows[1].sourceContinuation.actorSeat=0;
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.mechanicalBilateralWitnesses,6);
  assert.ok(r.arms[0].vetoes.includes('pressure-reply-followup-order-unverified'));
  assert.ok(r.arms[1].vetoes.includes('source-legal-continuation-unverified'));
});


test('claimed actual start requires matching Store player ID and first draw',()=>{
  for(const field of ['firstTurnPlayerId','firstTurnPlayerName',
    'firstDrawLogName','verifiedFirstTurn']) {
    const {plan,archive}=fixture();
    archive.rows[0][field]=field==='firstTurnPlayerId'?202:
      field==='verifiedFirstTurn'?false:'research-B';
    const result=auditBilateralV2(plan,archive);
    const affected=result.arms.find(row=>row.id===archive.rows[0].id);
    assert.equal(affected.validStart,false,field);
    assert.equal(affected.actualStarter,null,field);
    assert.equal(affected.mechanicalBilateralWitness,false,field);
    assert.ok(affected.vetoes.includes('actual-first-player-unverified'),field);
    assert.equal(result.pairs[0].firstObservationComparable,false,field);
    assert.equal(result.mechanicalBilateralWitnesses,7,field);
  }
});

test('missing first-draw evidence cannot manufacture both real-start coverage',()=>{
  const {plan,archive}=fixture();
  archive.rows.filter(row=>row.rank===11&&row.candidateSeat===1)
    .forEach(row=>{delete row.firstDrawLogName;});
  const result=auditBilateralV2(plan,archive);
  assert.equal(result.byRank[11].sourceFirst,0);
  assert.equal(result.byRank[11].candidateFirst,2);
  assert.equal(result.twoRealStartsPerRankObserved,false);
  assert.equal(result.mechanicalBilateralWitnesses,6);
});

test('only a real rank6 and rank11 source adversary covers the hard-field pilot',()=>{
  const {plan,archive}=fixture();
  plan.opponents[1].rank=10;
  assert.throws(()=>auditBilateralV2(plan,archive),
    /must include hard Aichi rank 11/);
});
test('source pressure only on rank6 leaves rank11 pilot unqualified',()=>{
  const {plan,archive}=fixture();
  for(const row of archive.rows.filter(row=>row.rank===11)){
    row.sourcePressure.effectVerified=false;
  }
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.mechanicalBilateralWitnesses,4);
  assert.equal(r.bothHardRanksHaveBilateralWitnesses,false);
  assert.equal(r.opportunityAndPolicyVerdict,'HOLD-OR-INCOMPLETE');
});
