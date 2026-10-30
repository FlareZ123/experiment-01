'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditNativePrintRelease}=require('../simulation/evaluation/agent33-native-print-release-gate.cjs');
const H='a'.repeat(64),J='b'.repeat(64),K='c'.repeat(64);

/** Synthetic full-60 source and candidate prints, not an Aichi decklist. */
function fixture(){
  const f={id:'rank15-two-seat-native',rank:15,candidateId:'fixed-60',
    sourceDeckSha256:H,candidateDeckSha256:J,
    sourcePrints:[{printing:'Buneary PFL',count:1},
      {printing:'Mega Lopunny ex PFL',count:1},
      {printing:'Source filler PFL',count:58}],
    candidatePrints:[{printing:'Candidate filler CRE',count:60}],
    requiredEffectIds:['rank15-attack-settled']};
  const row=seat=>({id:f.id,seat,sourceDeckSha256:H,candidateDeckSha256:J,
    ciSucceeded:true,testStatus:'executed',
    nativeRegistry:[...f.sourcePrints,...f.candidatePrints].map(x=>({
      printing:x.printing,status:'exact-registered'})),
    effects:[{id:'rank15-attack-settled',nativeStoreAccepted:true,
      nativeEffectSettled:true,rootOrdinal:5,completionOrdinal:6,
      opponentContinuationOrdinal:7,rootLedgerSha256:K,
      effectReceiptSha256:H}]});
  return {plan:{schema:'aichi-exact-native-print-release-plan-v1',
      registrationId:K,fixtures:[f]},
    archive:{schema:'aichi-exact-native-print-release-archive-v1',
      registrationId:K,rows:[row(0),row(1)]}};
}

test('both seats with full synthetic prints and settled Store lineage are preflight only',()=>{
  const {plan,archive}=fixture(),result=auditNativePrintRelease(plan,archive);
  assert.equal(result.nativeEffectWitnessPreflight,
    'PARTIAL-PANEL-NATIVE-WITNESS-REVIEWABLE');
  assert.equal(result.fullAichi32FixedCandidatePanel,false);
  assert.equal(result.competitiveGameQualified,false);
  assert.equal(result.hiddenPolicyInformationSafe,false);
  assert.equal(result.rows.filter(x=>x.nativeEffectReviewable).length,2);
});

test('green CI with both rank15 native tests skipped cannot count as effect settlement',()=>{
  const {plan,archive}=fixture();
  for(const row of archive.rows){
    row.testStatus='skipped-unsupported-print';
    for(const card of row.nativeRegistry){
      if(card.printing==='Buneary PFL'||
         card.printing==='Mega Lopunny ex PFL')card.status='unsupported';
    }
    row.effects=[];
  }
  const result=auditNativePrintRelease(plan,archive);
  assert.equal(result.observedPhysicalSeatAttempts,2);
  assert.equal(result.nativeEffectWitnessPreflight,'HOLD-UNSUPPORTED-OR-INCOMPLETE');
  assert.ok(result.rows.every(x=>x.vetoes.includes(
    'test-skipped-unsupported-print')));
  assert.ok(result.rows.every(x=>x.unsupportedPrintings.length===2));
  assert.equal(result.competitiveGameQualified,false);
});

test('native aliases/proxies do not impersonate the exact printed 60',()=>{
  const {plan,archive}=fixture();
  archive.rows[0].nativeRegistry[0].status='alias';
  const r=auditNativePrintRelease(plan,archive);
  assert.deepEqual(r.rows[0].proxiedPrintings,['Buneary PFL']);
  assert.ok(r.rows[0].vetoes.includes('native-print-proxy-unqualified'));
  assert.equal(r.nativeEffectWitnessPreflight,'HOLD-UNSUPPORTED-OR-INCOMPLETE');
});

test('one physical seat missing stays counted as incomplete',()=>{
  const {plan,archive}=fixture();
  archive.rows.pop();
  const r=auditNativePrintRelease(plan,archive);
  assert.equal(r.registeredPhysicalSeatAttempts,2);
  assert.equal(r.observedPhysicalSeatAttempts,1);
  assert.equal(r.allRegisteredAttemptsPreserved,false);
  assert.deepEqual(r.rows[1].vetoes,['missing-registered-attempt']);
});

test('unlinked effect and missing native registry fail closed',()=>{
  const {plan,archive}=fixture();
  archive.rows[0].effects[0].opponentContinuationOrdinal=6;
  archive.rows[0].nativeRegistry.pop();
  const r=auditNativePrintRelease(plan,archive);
  assert.ok(r.rows[0].vetoes.includes('native-effect-unsettled:rank15-attack-settled'));
  assert.ok(r.rows[0].vetoes.includes('unobserved-cardmanager-printing'));
});

test('fabricated extra row, duplicate seat and altered print SHA are rejected',()=>{
  for(const mutate of [
    archive=>{archive.rows.push({...archive.rows[0],id:'other'});},
    archive=>{archive.rows.push({...archive.rows[0]});},
    archive=>{archive.rows[0].sourceDeckSha256=K;}
  ]){
    const {plan,archive}=fixture();mutate(archive);
    assert.throws(()=>auditNativePrintRelease(plan,archive));
  }
});

test('an invalid full-60 printed inventory is not a precommitted source',()=>{
  const {plan,archive}=fixture();
  plan.fixtures[0].sourcePrints[2].count=57;
  assert.throws(()=>auditNativePrintRelease(plan,archive),
    /sixty cards/);
});

test('a failed native test and unverified physical print never inherit green CI',()=>{
  const {plan,archive}=fixture();
  archive.rows[1].ciSucceeded=false;
  archive.rows[1].testStatus='failed';
  archive.rows[1].nativeRegistry=[];
  const r=auditNativePrintRelease(plan,archive);
  assert.ok(r.rows[1].vetoes.includes('ci-failed'));
  assert.ok(r.rows[1].vetoes.includes('native-test-failed'));
  assert.equal(r.nativeEffectWitnessPreflight,'HOLD-UNSUPPORTED-OR-INCOMPLETE');
});
