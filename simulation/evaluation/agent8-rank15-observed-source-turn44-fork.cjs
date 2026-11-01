'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {preflight,writeJsonAtomically}=
  require('./agent8-rank15-movement-root-paired-development.cjs');

const VERSION='agent8-rank15-postobserved-source-turn44-causal-trace-v1';
const PROFILE='results/aichi-2026/registrations/agent8-rank15-movement-root-paired-native-20261101.json';

/** @param {object} row Real native post-Store root; public metadata only. */
function publicAction(row){
  if(!row)return null;
  return {actionOrdinal:row.actionOrdinal??null,
    turnBefore:row.turnBefore??null,
    playerSlot:row.playerSlot??null,
    action:row.action??null,
    attack:row.attack??null,
    card:row.card??null,
    from:row.from??null,
    to:row.to??null
  };
}

/** @param {object} nativeRow */
function sourceTurn44(nativeRow){
  assert.equal(nativeRow.trial?.rank,15);
  assert.equal(nativeRow.trial?.candidateSlot,'B');
  assert.equal(nativeRow.sourceSeat,0);
  const ledger=nativeRow.rootActionLedger;
  assert.ok(Array.isArray(ledger),'Real Store root ledger must be retained');
  return ledger.map((a,index)=>({...publicAction(a),index}))
    .filter(a=>a.playerSlot===0&&a.turnBefore===44);
}

/** @param {object} a @param {object} b */
function compare(a,b){
  assert.equal(a.trial?.id,b.trial?.id);
  assert.equal(a.trial?.seed,b.trial?.seed);
  assert.equal(a.actualStarterSeat,b.actualStarterSeat);
  assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
  assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
  const left=a.rootActionLedger.map(publicAction);
  const right=b.rootActionLedger.map(publicAction);
  const len=Math.min(left.length,right.length);
  let index=0;
  while(index<len&&JSON.stringify(left[index])===JSON.stringify(right[index]))
    index++;
  const earlier=left[index]??null;
  const later=right[index]??null;
  const summary={
    id:a.trial.id,seed:a.trial.seed,sourceSeat:a.sourceSeat,
    sameOriginalSourceDeal:true,sameFullPhysicalDeal:true,
    sameInitialStarter:true,
    control:{finished:a.finished,winner:a.winner,
      endReason:a.endReason,turns:a.turns,
      actions:a.actionCount,rootActions:left.length,
      rank15Turn44:sourceTurn44(a)},
    treatment:{finished:b.finished,winner:b.winner,
      endReason:b.endReason,turns:b.turns,
      actions:b.actionCount,rootActions:right.length,
      rank15Turn44:sourceTurn44(b)},
    sameWinner:a.winner===b.winner,
    firstPublicActionDifference:{
      index,
      control:earlier,
      treatment:later,
      controlFollowing:left.slice(index,index+4),
      treatmentFollowing:right.slice(index,index+4),
      prefixSame:index>0&&index<=len
    },
    nativeAttackDeclarations:{
      control:a.attackDeclarations,
      treatment:b.attackDeclarations
    },
    controlRootLedgerSha256:a.rootActionLedgerSha256,
    treatmentRootLedgerSha256:b.rootActionLedgerSha256,
    inputCodeVersion:VERSION,
    originalRegisteredFrame:PROFILE,
    retrospectiveSelection:
      'Previously observed rank15:1:B:new-moon pair at turn44; validation of one physical choice, not an unbiased treatment estimate',
    competitiveQualifiedGames:0
  };
  return summary;
}
function run(){
  const pre=preflight();
  const selected=pre.registration.trials.filter(t=>
    t.rank===15&&t.candidateSlot==='B'&&t.repeat===1);
  assert.equal(selected.length,2);
  assert.deepEqual(selected.map(x=>x.candidateId).sort(),
    ['champion-reference','new-moon-lockbreaker-v1']);
  const fixed={...pre.registration.fixedBothArmOptions,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:selected,registeredFrameName:VERSION,
    sameRootPublicEventReceipt:false};
  const controls=runDevelopment(fixed);
  const treatments=runDevelopment({...fixed,sameRootPublicEventReceipt:true});
  assert.equal(controls.rows.length,2);
  assert.equal(treatments.rows.length,2);
  const responses=[];
  for(const control of controls.rows){
    const treated=treatments.rows.find(t=>t.trial.id===control.trial.id);
    assert.ok(treated);
    if(control.status==='engine-error'||treated.status==='engine-error'){
      responses.push({id:control.trial.id,error:{
        control:control.error,treatment:treated.error},
        competitiveQualifiedGames:0});continue;
    }
    responses.push(compare(control,treated));
  }
  return {
    version:VERSION,selection:'postobserved native rank15 turn44 same-root difference',
    enginePin:pre.enginePin,
    sourceRegistrationBlob:pre.registrationBlob,
    attempts:4,expectedAttempts:4,
    observations:responses,
    simulatedNativeMatches:4,
    competitiveQualifiedGames:0,
    verdict:'Retrospective physical mechanics and root-history comparison only; game outcomes remain unqualified'
  };
}
if(require.main===module){
  const result=run();
  writeJsonAtomically('agent8-rank15-observed-turn44-root-fork.json',result);
  const targeted=result.observations.find(row=>
    row.id==='15:1:B:new-moon-lockbreaker-v1');
  assert.ok(targeted);
  process.stdout.write('RANK15_OBSERVED_TURN44_CAUSAL_TRACE '+
    JSON.stringify({version:result.version,
      attempts:result.attempts,
      verifiedEqualSourcePhysicalDeal:targeted.sameOriginalSourceDeal,
      verifiedEqualFullPhysicalDeal:targeted.sameFullPhysicalDeal,
      control:targeted.control,
      treatment:targeted.treatment,
      sameWinner:targeted.sameWinner,
      firstPublicActionDifference:targeted.firstPublicActionDifference,
      nativeAttackDeclarations:targeted.nativeAttackDeclarations,
      competitiveQualifiedGames:0})+'\n');
}
module.exports={VERSION,publicAction,sourceTurn44,compare,run};
