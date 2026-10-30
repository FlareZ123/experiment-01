'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {censusPlumeria32}=
  require('../scripts/agent38-plumeria-preregistered-32-pair.cjs');

function fixture(){
  const trials=[];
  for(const rank of [6,11])for(const candidateSlot of ['A','B'])
    for(let repeat=0;repeat<4;repeat++)
      for(const candidateId of ['champion-reference','new-moon-lockbreaker-v1']){
        trials.push({rank,candidateSlot,repeat,candidateId,
          seed:repeat+1000+rank*100+(candidateSlot==='A'?0:50),
          id:[rank,candidateSlot,repeat,candidateId].join(':')});
      }
  const rows=trials.map((trial,i)=>({
    trial,fullPhysicalDealFingerprint:'full-'+i,
    sourceDealFingerprint:'source-'+i,actualStarterSeat:i%2,
    sourceActuallyFirst:i%2===0,
    qualifiesForCompetitiveInference:false,
    rootActionLedgerSha256:'root-'+i,
    nativePromptChoices:{sha256:'prompt-'+i},
    endReason:'action-limit',finished:false
  }));
  const base={schema:'agent38-postframe-plumeria-32-precommitted-contrast-v1',
    intervention:'unchanged-canonical-control',
    registrationPath:'frozen',registrationBlob:'stable',
    precommittedBeforeIntervention:true,registeredAttempts:32,
    competitiveQualifiedGames:0,
    result:{actorPlumeriaAfterPassOptIn:false,rows}};
  const treated=structuredClone(base);
  treated.intervention='plumeria-actor-after-pass';
  treated.result.actorPlumeriaAfterPassOptIn=true;
  for(const row of treated.result.rows)
    row.actorOnlyDecisionCoverage={ownerPlumeriaAfterPassAudit:{
      acceptedPlumeria:0,proposedPlumeria:0,settledEnergyDiscards:0,
      genericPromptFallbacks:0,acceptedPrompts:0,
      anyGameCompetitivelyQualified:false,
      policyStrategicallyValidated:false}};
  return {base,treated};
}

test('every original 32 arm is counted and full physical comparisons match',()=>{
  const {base,treated}=fixture(),r=censusPlumeria32(base,treated);
  assert.equal(r.totals.attempted,32);
  assert.equal(r.totals.actualFullPhysicalMatches,32);
  assert.equal(r.totals.controlledCaps,32);
  assert.equal(r.totals.treatmentCaps,32);
  assert.equal(r.totals.plumeriaAccepted,0);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('actual prompt payload difference is recorded when root ledger matches',()=>{
  const {base,treated}=fixture();
  const row=treated.result.rows[1];
  row.actorOnlyDecisionCoverage.ownerPlumeriaAfterPassAudit
    .acceptedPlumeria=1;
  row.actorOnlyDecisionCoverage.ownerPlumeriaAfterPassAudit
    .settledEnergyDiscards=1;
  row.nativePromptChoices.sha256='new-prompt';
  const r=censusPlumeria32(base,treated);
  assert.equal(r.totals.plumeriaAccepted,1);
  assert.equal(r.totals.plumeriaSettled,1);
  assert.equal(r.totals.rootHashDifferent,0);
  assert.equal(r.totals.nativePromptHashDifferent,1);
  assert.equal(r.totals.sameRootButDifferentPrompt,1);
  assert.equal(r.affectedPairs.length,1);
});

test('engine errors and unverifiable physical starts stay in registered denominator',()=>{
  const {base,treated}=fixture();
  treated.result.rows[0].status='engine-error';
  treated.result.rows[0].actorOnlyDecisionCoverage=null;
  treated.result.rows[1].fullPhysicalDealFingerprint=null;
  treated.result.rows[2].sourceDealFingerprint='different';
  const r=censusPlumeria32(base,treated);
  assert.equal(r.totals.treatedWithoutAudit,1);
  assert.equal(r.totals.treatmentNativeSuccess,31);
  assert.equal(r.totals.unverifiablePhysicalStarts,1);
  assert.equal(r.totals.physicalMismatches,1);
  assert.equal(r.totals.actualFullPhysicalMatches,30);
});

test('detects false game qualification, trial mismatch or invalid run mode',()=>{
  for(const change of [
    f=>{f.treated.result.rows[0].qualifiesForCompetitiveInference=true;},
    f=>{f.treated.result.rows[0].trial.seed+=100;},
    f=>{f.treated.result.rows.pop();},
    f=>{f.treated.result.actorPlumeriaAfterPassOptIn=false;}
  ]){
    const f=fixture();change(f);
    assert.throws(()=>censusPlumeria32(f.base,f.treated),
      {name:'AssertionError'});
  }
});
