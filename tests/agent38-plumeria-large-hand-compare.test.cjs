'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {compareLargeHandPlumeria}=
  require('../scripts/agent38-plumeria-large-hand-compare.cjs');

function fixture(){
  const rows=Array.from({length:4},(_,i)=>({
    trial:{id:'historical:'+i,seed:900+i,candidateSlot:'B',rank:i<2?6:11},
    fullPhysicalDealFingerprint:'full-deal-'+i,
    sourceDealFingerprint:'source-deal-'+i,
    actualStarterSeat:0,qualifiesForCompetitiveInference:false,
    rootActionLedgerSha256:'root-'+i,
    nativePromptChoices:{sha256:'prompt-'+i},
    actorOnlyDecisionCoverage:{ownerPlumeriaAfterPassAudit:{
      largeHandOptIn:false,largeHandNativeSelections:0,
      genericPromptFallbacks:1,acceptedPlumeria:0,
      settledEnergyDiscards:0,log:[]}}
  }));
  const baseline={attempted:4,competitiveQualifiedGames:0,
    actorPlumeriaAfterPassOptIn:true,rows};
  const candidate=structuredClone(baseline);
  for(const row of candidate.rows)
    row.actorOnlyDecisionCoverage.ownerPlumeriaAfterPassAudit.largeHandOptIn=true;
  candidate.rows[1].actorOnlyDecisionCoverage.ownerPlumeriaAfterPassAudit
    .largeHandNativeSelections=1;
  candidate.rows[1].nativePromptChoices.sha256='different-prompt';
  return {baseline,candidate};
}

test('four historical physical deal hashes checked independently, no inferred wins',()=>{
  const {baseline,candidate}=fixture();
  const r=compareLargeHandPlumeria(baseline,candidate);
  assert.equal(r.registeredAttempts,4);
  assert.equal(r.matchedFullPhysicalStarts,4);
  assert.equal(r.auditedPairs,4);
  assert.equal(r.largeHandNativeSelections,1);
  assert.equal(r.pairs[1].rootChanged,false);
  assert.equal(r.pairs[1].promptChanged,true);
  assert.equal(r.pairs[1].sameRootWithChangedPrompt,true);
  assert.equal(r.sameRootWithChangedPrompt,1);
  assert.equal(r.pairs[1].combinedObservedDecisionChange,true);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('counterfactual branch with a mismatched complete deal never counts matched',()=>{
  const {baseline,candidate}=fixture();
  candidate.rows[1].fullPhysicalDealFingerprint='different';
  const r=compareLargeHandPlumeria(baseline,candidate);
  assert.equal(r.matchedFullPhysicalStarts,3);
  assert.equal(r.pairs[1].sameFullPhysicalStart,false);
});

test('source engine error retained, row remains and audit coverage is explicit',()=>{
  const {baseline,candidate}=fixture();
  candidate.rows[0].status='engine-error';
  candidate.rows[0].actorOnlyDecisionCoverage=null;
  const r=compareLargeHandPlumeria(baseline,candidate);
  assert.equal(r.registeredAttempts,4);
  assert.equal(r.auditedPairs,3);
  assert.equal(r.pairs[0].newStatus,'engine-error');
});

test('wrong opt-in, trial ID, seed or qualified flag fails closed',()=>{
  const cases=[
    x=>{x.candidate.actorPlumeriaAfterPassOptIn=false;},
    x=>{x.candidate.rows[1].trial.id='different';},
    x=>{x.candidate.rows[1].trial.seed=100000;},
    x=>{x.candidate.rows[1].qualifiesForCompetitiveInference=true;}
  ];
  for(const change of cases){
    const f=fixture();change(f);
    assert.throws(()=>compareLargeHandPlumeria(f.baseline,f.candidate),
      {name:'AssertionError'});
  }
});
