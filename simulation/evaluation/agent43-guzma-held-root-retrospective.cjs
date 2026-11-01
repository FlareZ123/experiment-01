'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {preflight}=require('./agent43-guzma-nominal-fresh-rank11-pair.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const VERSION='agent43-observe-held-guzma-on-frozen-rank11-16arm-replay-v1';
const PREVIOUS_BASELINE_DIGEST=
  '4c2981a904eb939ba32301038514ef269d7c8a07d883b5c90bae903dfbc82216';

/** Original frozen baseline physical deal and accepted-action receipt. */
function replayFingerprint(rows){
  return createHash('sha256').update(JSON.stringify(rows.map(r=>({
    id:r.trial.id,seed:r.trial.seed,
    sourceDeal:r.sourceDealFingerprint??null,
    fullPhysicalDeal:r.fullPhysicalDealFingerprint??null,
    first:r.actualStarterSeat??null,
    ledger:r.rootActionLedgerSha256??null,
    status:r.status??(r.finished===true?'terminal':'unfinished'),
    winner:r.winner??null
  })))).digest('hex');
}

/** @param {object} event Actual owner-root supporter snapshot. */
function heldGuzma(event){
  return Array.isArray(event?.supporters)&&event.supporters.some(card=>
    /^Guzma(?: |$)/.test(card.printing??''));
}

/** Single retrospective forensic replay of PREVIOUSLY USED seeds. */
function run(){
  const p=preflight();
  const options={...p.registration.setupAndPolicyFixed,
    registeredTrials:p.registration.trials,
    registeredFrameName:p.registration.schema,
    nativeOwnerSupporterOpportunity:true,actorGuzmaNominalGust:false};
  const previous=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  let replay;
  try{replay=runDevelopment(options);}
  finally{
    if(previous===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
  }
  assert.equal(replay.rows.length,16);
  const replayDigest=replayFingerprint(replay.rows);
  const unchanged=replayDigest===PREVIOUS_BASELINE_DIGEST;
  const counts={
    nativeFirstOwnerTurns:0,
    ownerTurnsFirstWithAnySupporter:0,
    ownerTurnsFirstHeldGuzma:0,
    ownerTurnsFirstHeldGuzmaQuotaOpen:0,
    ownerTurnsFirstHeldGuzmaNullCanPlayPositive:0,
    ownerTurnPasses:0,passesHeldGuzma:0,
    passesHeldGuzmaQuotaOpen:0,
    passesHeldGuzmaNullCanPlayPositive:0,
    nativeAcceptedSupporterRoots:0,
    nativeAcceptedGuzmaRoots:0,
    sampleTruncations:0
  };
  const lines=[];
  for(const row of replay.rows){
    const audit=row.ownerSupporterOpportunityAudit;
    assert.ok(audit,'Missing real owner-hand passive observer');
    assert.equal(audit.ownerOnly,true);
    const first=audit.firstRoots??[],passes=audit.passes??[];
    counts.sampleTruncations+=(audit.firstRootsTruncated??0)+
      (audit.passesTruncated??0);
    counts.nativeFirstOwnerTurns+=first.length;
    counts.ownerTurnsFirstWithAnySupporter+=first.filter(e=>e.heldCount>0).length;
    counts.ownerTurnsFirstHeldGuzma+=first.filter(heldGuzma).length;
    counts.ownerTurnsFirstHeldGuzmaQuotaOpen+=first.filter(e=>
      heldGuzma(e)&&e.supporterQuota===0&&!e.ownerSupporterLock).length;
    counts.ownerTurnsFirstHeldGuzmaNullCanPlayPositive+=first.filter(e=>
      heldGuzma(e)&&e.supporters.some(card=>
        /^Guzma(?: |$)/.test(card.printing??'')&&
        card.nativeNullCanPlay==='true')).length;
    counts.ownerTurnPasses+=passes.length;
    counts.passesHeldGuzma+=passes.filter(heldGuzma).length;
    counts.passesHeldGuzmaQuotaOpen+=passes.filter(e=>
      heldGuzma(e)&&e.supporterQuota===0&&!e.ownerSupporterLock).length;
    counts.passesHeldGuzmaNullCanPlayPositive+=passes.filter(e=>
      heldGuzma(e)&&e.supporters.some(card=>
        /^Guzma(?: |$)/.test(card.printing??'')&&
        card.nativeNullCanPlay==='true')).length;
    counts.nativeAcceptedSupporterRoots+=audit.supporterRoots?.length??0;
    counts.nativeAcceptedGuzmaRoots+=(audit.supporterRoots??[])
      .filter(e=>/^Guzma(?: |$)/.test(e.printing??'')).length;
    lines.push({
      id:row.trial.id,seed:row.trial.seed,
      sourceSeat:row.sourceSeat,
      firstWithGuzma:first.filter(heldGuzma).map(e=>({
        seat:e.ownerSeat,turn:e.turn,quota:e.supporterQuota,
        lock:e.ownerSupporterLock,
        nativeNullCanPlay:e.supporters.find(c=>
          /^Guzma(?: |$)/.test(c.printing??''))?.nativeNullCanPlay??null
      })),
      passesWithGuzma:passes.filter(heldGuzma).map(e=>({
        seat:e.ownerSeat,turn:e.turn,quota:e.supporterQuota,
        lock:e.ownerSupporterLock,
        nativeNullCanPlay:e.supporters.find(c=>
          /^Guzma(?: |$)/.test(c.printing??''))?.nativeNullCanPlay??null
      })),
      acceptedSupporters:(audit.supporterRoots??[])
        .map(e=>({seat:e.seat,turn:e.turn,printing:e.printing})),
      originalRootActionsUnchanged:null
    });
  }
  const summary={
    version:VERSION,
    registrationBlob:p.registrationBlob,enginePin:p.native,
    replayDigest,baselineDigest:PREVIOUS_BASELINE_DIGEST,
    exactNativePolicyReplayUnchanged:unchanged,
    retrospectiveObserverOnPreviouslyUsedSeeds:true,
    originalRank11RegisteredSixtyUnchanged:true,
    nativeAttempts:16,
    counts,lines,
    competitiveQualifiedGames:0,
    caveats:[
      'Replays eight previously used source seeds after seeing zero Guzma native root exposure; not fresh prospective evidence',
      'CanPlay(null) is only native target-free affordance and can be false for target-dependent legal cards',
      'Held printings recorded solely from the acting owner private hand, not revealed to opponent policy',
      'Do not use any exposure metrics if the complete root ledger and setup digest changes under the read-only observer',
      'Six original baseline arms were unfinished after 260 roots; game win rates remain unqualified'
    ]
  };
  return {summary,replay};
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const p=preflight();
    process.stdout.write(JSON.stringify({
      version:VERSION,sourceRank:p.registration.sourceRank,
      originalSeedGroups:8,replayArms:16,
      baselineDigest:PREVIOUS_BASELINE_DIGEST,
      prospectiveFresh:false
    })+'\n');
  }else{
    const x=run();
    if(process.env.AGENT43_GUZMA_HELD_AUDIT_OUTPUT)
      save(process.env.AGENT43_GUZMA_HELD_AUDIT_OUTPUT,x);
    process.stdout.write('AGENT43_GUZMA_HELD_RETROSPECTIVE '+
      JSON.stringify({digestUnchanged:
        x.summary.exactNativePolicyReplayUnchanged,
        counts:x.summary.counts,replayDigest:x.summary.replayDigest,
        baselineDigest:x.summary.baselineDigest,
        competitivelyQualifiedGames:0})+'\n');
    assert.equal(x.summary.exactNativePolicyReplayUnchanged,true,
      'Read-only owner supporter observer changed frozen accepted native policy');
  }
}
module.exports={VERSION,replayFingerprint,heldGuzma,run};
