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
  for(const rank of [6,11]){
    for(const seat of [0,1]) {
      const pairId=rank+':0:'+seat, seed=rank*1000+seat;
      const sourceTurn=seat===0?2:1;
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
          engineDeckHashes:seat===0?[
            candidate.engineDeckSha256,
            plan.opponents.find(row=>row.rank===rank).engineDeckSha256
          ]:[
            plan.opponents.find(row=>row.rank===rank).engineDeckSha256,
            candidate.engineDeckSha256
          ],
          status:'engine-terminal',engineFinished:true,engineWinner:seat,
          rootActionCount:125,actualStarterSeat:0,
          verifiedFirstTurn:true,
          firstTurnPlayerId:101,firstTurnPlayerName:'research-A',
          firstDrawLogName:'research-A',
          sourceDealFingerprint:hex(rank===6?'5':'6'),
          sourcePressure:{accepted:true,effectVerified:true,
            traceAuthenticated:true,actorSeat:1-seat,
            rootActionOrdinal:10,completionOrdinal:12,
            turnBefore:sourceTurn,completionTurnBefore:sourceTurn},
          candidateReply:{observed:true,legal:true,
            ownerInformationSafe:true,traceAuthenticated:true,
            actorSeat:seat,rootActionOrdinal:16,
            turnBefore:sourceTurn+1},
          sourceContinuation:{observed:true,legal:true,
            ownerInformationSafe:true,traceAuthenticated:true,
            actorSeat:1-seat,rootActionOrdinal:20,
            turnBefore:sourceTurn+2},
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
  assert.equal(r.twoRealStartsPerCandidateAndRankObserved,true);
  assert.equal(r.bothHardRanksHavePairedBilateralWitnesses,true);
  assert.equal(r.mechanicalBilateralWitnesses,8);
  assert.equal(r.alignedPhysicalSourcePairs,4);
  assert.equal(r.sourceFirstEarlyPressurePairs,2);
  assert.equal(r.bothHardRanksHaveBothStartPairedBilateralWitnesses,true);
  assert.equal(
    r.bothHardRanksHaveSourceFirstEarlyPressurePairedBilateralWitnesses,true);
  assert.equal(r.opportunityAndPolicyVerdict,'MECHANICAL-PILOT-REVIEWABLE');
  assert.equal(r.competitiveStrengthClaimPermitted,false);
  assert.equal(r.gameWinRateCertified,false);
  assert.equal(r.rootAttestedPilotVerdict,'HOLD-OR-UNAUTHENTICATED');
  assert.equal(r.nativeRootBoundPairs,0);
  assert.deepEqual(r.byRank[6],{registered:4,observed:4,terminal:4,
    censored:0,errors:0,missing:0,sourceFirst:2,candidateFirst:2,
    bilateralMechanics:4});
  assert.ok(r.arms.every(row=>row.vetoes.includes('paper-fidelity-unverified')));
});

test('optional native Store ledger independently binds an asserted bilateral root claim',()=>{
  const {plan,archive}=fixture();
  const row=archive.rows[0],sourceSeat=1-row.candidateSeat;
  const ledger=Array.from({length:row.rootActionCount},(_,i)=>({
    actionOrdinal:i,turnBefore:1,playerSlot:-1,action:'OtherRootAction'
  }));
  for(const [claim,seat,turn] of [
    [row.sourcePressure.rootActionOrdinal,sourceSeat,row.sourcePressure.turnBefore],
    [row.sourcePressure.completionOrdinal,sourceSeat,row.sourcePressure.completionTurnBefore],
    [row.candidateReply.rootActionOrdinal,row.candidateSeat,row.candidateReply.turnBefore],
    [row.sourceContinuation.rootActionOrdinal,sourceSeat,row.sourceContinuation.turnBefore]
  ]) Object.assign(ledger[claim],{playerSlot:seat,turnBefore:turn});
  row.rootActionLedger=ledger;
  row.rootActionLedgerProtocol='actual-store-root-action-ledger-v1';
  let result=auditBilateralV2(plan,archive);
  assert.equal(result.arms[0].nativeRootClaimsAuthenticated,true);
  assert.equal(result.independentlyRootBoundBilateralWitnesses,1);
  assert.ok(!result.arms[0].vetoes.includes('actual-store-root-claims-unverified'));
  ledger[row.candidateReply.rootActionOrdinal].playerSlot=sourceSeat;
  result=auditBilateralV2(plan,archive);
  assert.equal(result.arms[0].mechanicalBilateralWitness,true);
  assert.equal(result.arms[0].nativeRootClaimsAuthenticated,false);
  assert.ok(result.arms[0].vetoes.includes('actual-store-root-claims-unverified'));
  assert.equal(result.independentlyRootBoundBilateralWitnesses,0);
});

test('incomplete native Store transcript rejects even with positive producer flags',()=>{
  const {plan,archive}=fixture();
  archive.rows[0].rootActionLedgerProtocol='actual-store-root-action-ledger-v1';
  archive.rows[0].rootActionLedger=[];
  assert.throws(()=>auditBilateralV2(plan,archive),
    /every successful Store root/);
});

test('raw Store attestation elevates both real seats without licensing wins',()=>{
  const {plan,archive}=fixture();
  for(const row of archive.rows) {
    const ledger=Array.from({length:row.rootActionCount},(_,i)=>({
      actionOrdinal:i,turnBefore:1,playerSlot:-1,action:'OtherRootAction'
    }));
    for(const [claim,seat,turn] of [
      [row.sourcePressure.rootActionOrdinal,1-row.candidateSeat,
        row.sourcePressure.turnBefore],
      [row.sourcePressure.completionOrdinal,1-row.candidateSeat,
        row.sourcePressure.completionTurnBefore],
      [row.candidateReply.rootActionOrdinal,row.candidateSeat,
        row.candidateReply.turnBefore],
      [row.sourceContinuation.rootActionOrdinal,1-row.candidateSeat,
        row.sourceContinuation.turnBefore]
    ]) Object.assign(ledger[claim],{playerSlot:seat,turnBefore:turn});
    row.rootActionLedgerProtocol='actual-store-root-action-ledger-v1';
    row.rootActionLedger=ledger;
  }
  let r=auditBilateralV2(plan,archive);
  assert.equal(r.nativeRootBoundPairs,4);
  assert.equal(r.independentlyRootBoundBilateralWitnesses,8);
  assert.equal(r.nativeRootsInBothRealStarts,true);
  assert.equal(r.nativeSourceFirstEarlyPressure,true);
  assert.equal(r.rootAttestedPilotVerdict,'ROOT-ATTESTED-PILOT-REVIEWABLE');
  assert.equal(r.competitiveStrengthClaimPermitted,false);
  assert.equal(r.gameWinRateCertified,false);
  const altered=archive.rows[0];
  altered.rootActionLedger[altered.candidateReply.rootActionOrdinal].playerSlot=
    1-altered.candidateSeat;
  r=auditBilateralV2(plan,archive);
  assert.equal(r.opportunityAndPolicyVerdict,'MECHANICAL-PILOT-REVIEWABLE');
  assert.equal(r.nativeRootBoundPairs,3);
  assert.equal(r.rootAttestedPilotVerdict,'HOLD-OR-UNAUTHENTICATED');
});

test('real first-turn draw alone cannot cover a mechanically failed other seat',()=>{
  const {plan,archive}=fixture();
  for(const row of archive.rows.filter(row=>
    row.rank===11&&row.candidateSeat===0)) {
    row.sourcePressure.effectVerified=false;
  }
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.twoRealStartsPerCandidateAndRankObserved,true);
  assert.equal(r.bothHardRanksHavePairedBilateralWitnesses,true);
  assert.equal(r.bothHardRanksHaveSourceFirstEarlyPressurePairedBilateralWitnesses,true);
  assert.equal(r.bothHardRanksHaveBothStartPairedBilateralWitnesses,false);
  assert.equal(r.opportunityAndPolicyVerdict,'HOLD-OR-INCOMPLETE');
  const sourceFirst=r.pairs.find(row=>row.rank===11&&
    row.actualStarter==='source');
  assert.ok(sourceFirst);
  assert.equal(sourceFirst.bothBilateralWitnesses,true);
});

test('late source-first pressure stays a bilateral observation, not an early-lock pilot',()=>{
  const {plan,archive}=fixture();
  for(const row of archive.rows.filter(row=>row.candidateSeat===1)) {
    row.sourcePressure.turnBefore=3;
    row.sourcePressure.completionTurnBefore=3;
    row.candidateReply.turnBefore=4;
    row.sourceContinuation.turnBefore=5;
  }
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.mechanicalBilateralWitnesses,8);
  assert.equal(r.bothHardRanksHavePairedBilateralWitnesses,true);
  assert.equal(r.sourceFirstEarlyPressurePairs,0);
  assert.equal(r.bothHardRanksHaveSourceFirstEarlyPressurePairedBilateralWitnesses,false);
  assert.equal(r.opportunityAndPolicyVerdict,'HOLD-OR-INCOMPLETE');
  assert.ok(r.arms.filter(row=>row.candidateSeat===1).every(row=>
    row.sourceFirstEarlyPressureWitness===false));
});

test('candidate-first-only rank11 pressure cannot clear source-first early gate',()=>{
  const {plan,archive}=fixture();
  for(const row of archive.rows.filter(row=>
    row.rank===11&&row.candidateSeat===1)) {
    row.sourcePressure.effectVerified=false;
  }
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.bothHardRanksHavePairedBilateralWitnesses,true);
  assert.equal(r.bothHardRanksHaveSourceFirstEarlyPressurePairedBilateralWitnesses,false);
  assert.equal(r.sourceFirstEarlyPressurePairs,1);
  assert.equal(r.opportunityAndPolicyVerdict,'HOLD-OR-INCOMPLETE');
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

test('root ordinal order cannot disguise a candidate reply many turns later',()=>{
  const {plan,archive}=fixture();
  archive.rows[0].candidateReply.turnBefore=31;
  archive.rows[0].sourceContinuation.turnBefore=32;
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.arms[0].immediateTurnLineage,false);
  assert.equal(r.arms[0].mechanicalBilateralWitness,false);
  assert.ok(r.arms[0].vetoes.includes(
    'immediate-bilateral-turn-lineage-unverified'));
  assert.equal(r.mechanicalBilateralWitnesses,7);
  assert.equal(r.pairs[0].bothBilateralWitnesses,false);
});

test('pressure completion and response require contiguous global turns',()=>{
  for(const field of ['completionTurnBefore','turnBefore']) {
    const {plan,archive}=fixture();
    if(field==='completionTurnBefore'){
      archive.rows[0].sourcePressure.completionTurnBefore=4;
    }else{
      archive.rows[0].sourceContinuation.turnBefore=6;
    }
    const r=auditBilateralV2(plan,archive);
    assert.equal(r.arms[0].immediateTurnLineage,false,field);
    assert.equal(r.arms[0].mechanicalBilateralWitness,false,field);
  }
});

test('a prior bonus turn can shift source pressure to unexpected parity',()=>{
  const {plan,archive}=fixture();
  // The authenticated first player is A. An earlier extra turn can make
  // B own an odd-numbered turn while the three root actors still alternate.
  archive.rows[0].sourcePressure.turnBefore=5;
  archive.rows[0].sourcePressure.completionTurnBefore=5;
  archive.rows[0].candidateReply.turnBefore=6;
  archive.rows[0].sourceContinuation.turnBefore=7;
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.arms[0].validStart,true);
  assert.equal(r.arms[0].immediateTurnLineage,true);
  assert.equal(r.arms[0].mechanicalBilateralWitness,true);
  assert.equal(r.mechanicalBilateralWitnesses,8);
});

test('missing Store turn claims cannot earn a mechanical reply witness',()=>{
  const {plan,archive}=fixture();
  delete archive.rows[0].candidateReply.turnBefore;
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.arms[0].immediateTurnLineage,false);
  assert.equal(r.opportunityAndPolicyVerdict,'HOLD-OR-INCOMPLETE');
  assert.equal(r.mechanicalBilateralWitnesses,7);
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

test('physical-print echo cannot conceal changed actual resolved game decks',()=>{
  const {plan,archive}=fixture();
  archive.rows[0].engineDeckHashes[0]=hex('e');
  assert.throws(()=>auditBilateralV2(plan,archive),
    /Actual resolved engine inputs contradict/);
  archive.rows[0].engineDeckHashes[0]=hex('a');
  plan.candidates[0].engineDeckSha256=undefined;
  assert.throws(()=>auditBilateralV2(plan,archive),
    /Candidate resolved engine 60 digest required/);
});

test('another pair ID cannot re-count an identical physical source deal',()=>{
  const {plan,archive}=fixture();
  const existing=plan.arms.filter(row=>
    row.rank===6&&row.candidateSeat===0);
  assert.equal(existing.length,2);
  for(const original of existing) {
    const clone={...original,id:'clone:'+original.id,
      pairId:'cloned-source-6-0'};
    plan.arms.push(clone);
    const originalRow=archive.rows.find(row=>row.id===original.id);
    assert.ok(originalRow);
    archive.rows.push({...originalRow,id:clone.id,pairId:clone.pairId});
  }
  assert.throws(()=>auditBilateralV2(plan,archive),
    /Duplicate physical source stream/);
});

test('different real source seats may use the same numerical seed',()=>{
  const {plan,archive}=fixture();
  const rows=plan.arms.filter(row=>row.rank===6&&row.candidateSeat===1);
  for(const row of rows)row.seed=6000;
  for(const row of archive.rows.filter(row=>
    row.rank===6&&row.candidateSeat===1))row.seed=6000;
  const result=auditBilateralV2(plan,archive);
  assert.equal(result.registeredArms,8);
  assert.equal(result.completeAttemptCensus,true);
});

test('rank-pooled two starts cannot cover a candidate that never started first',()=>{
  const {plan,archive}=fixture();
  const newmoonSourceFirst=archive.rows.find(row=>
    row.rank===6&&row.candidateId==='newmoon'&&row.candidateSeat===0);
  assert.ok(newmoonSourceFirst);
  newmoonSourceFirst.actualStarterSeat=1;
  newmoonSourceFirst.firstTurnPlayerId=202;
  newmoonSourceFirst.firstTurnPlayerName='research-B';
  newmoonSourceFirst.firstDrawLogName='research-B';
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.twoRealStartsPerRankObserved,true);
  assert.equal(r.twoRealStartsPerCandidateAndRankObserved,false);
  assert.equal(r.opportunityAndPolicyVerdict,'HOLD-OR-INCOMPLETE');
});

test('separate valid source replies never certify unpaired bilateral comparison',()=>{
  const {plan,archive}=fixture();
  for(const row of archive.rows.filter(row=>
    row.rank===11&&row.candidateId==='newmoon')) {
    row.sourceDealFingerprint=hex('e');
  }
  const r=auditBilateralV2(plan,archive);
  assert.equal(r.completeAttemptCensus,true);
  assert.equal(r.twoRealStartsPerCandidateAndRankObserved,true);
  assert.equal(r.bothHardRanksHaveBilateralWitnesses,true);
  assert.equal(r.bothHardRanksHavePairedBilateralWitnesses,false);
  assert.equal(r.opportunityAndPolicyVerdict,'HOLD-OR-INCOMPLETE');
});
