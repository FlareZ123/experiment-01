'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const native=require('./agent37-rank5-fusion-mobility-prospective.cjs');
const {ownerAudit}=require('./agent9-rank5-quickball-four-scope.cjs');
const VERSION='agent9-rank5-source-qb-payment-pair-v1';
const REGISTRATION='results/aichi-2026/registrations/agent9-rank5-quickball-payment-pair-20261102.json';
const ROOT=path.resolve(__dirname,'../..');

/** Source and candidate real Store action counts, with actor47 audit explicitly separate. */
function witness(entry){
  const row=entry.rawNativeRow;
  const seat=entry.trial.candidateSlot==='A'?1:0;
  if(!row)return {nativeStatus:'NATIVE_MISSING',sourceSeat:seat,
    sourceQuickBall:null,sourceAttacks:null,sourceDceAttachments:null,
    handDiscardAudit:null};
  const base=ownerAudit(row,seat);
  const dce=row.rootActionLedger.filter(x=>x.playerSlot===seat&&
    x.action==='PlayCardAction'&&
    x.card==='Double Colorless Energy').length;
  const discard=row.actorOnlyDecisionCoverage?.detailedComponentAudits
    ?.handDiscard??null;
  return {nativeStatus:entry.summary.nativeDisposition,sourceSeat:seat,
    sourceQuickBall:base.sourceQuickBall,candidateQuickBall:base.candidateQuickBall,
    sourceQuickBallChains:base.selectedQuickBallChains?.filter(x=>x.seat===seat)??null,
    sourceAttacks:base.sourceAttacks,sourceMewEvolutions:base.sourceMewEvolutions,
    sourceDceAttachments:dce,
    nativeHandDiscardSelected:discard?.selected??0,
    nativeHandDiscardAccepted:discard?.accepted??0,
    nativeHandDiscardBySeat:discard?.bySeat??null,
    nativeHandDiscardSelections:discard?.selections??null,
    handDiscardFallbacks:discard?.nativeFallbacks??null,
    winner:row.winner,terminal:row.endReason,
    terminalGlobalTurn:row.turns,finalPrizes:row.finalPrizes,
    sourceDealFingerprint:entry.summary.sourceDealFingerprint,
    fullPhysicalDealFingerprint:entry.summary.fullPhysicalDealFingerprint,
    competitivelyQualified:false};
}
/** Frozen treatment only differs by actor-owned mandatory hand payment policy. */
function run(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION)),reg=JSON.parse(bytes);
  assert.equal(reg.nativeAttemptCount,16);
  assert.equal(reg.noPostOutcomeExclusions,true);
  const old=process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
  let control,treatment;
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    control=native.run({quickBallScope:'source',actorHandDiscard:false});
    treatment=native.run({quickBallScope:'source',actorHandDiscard:true});
  }finally{
    if(old===undefined)delete process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
    else process.env.AGENT8_ACTOR_QUICK_BALL_DEV=old;
  }
  assert.equal(control.requestedNativeAttempts,8);
  assert.equal(treatment.requestedNativeAttempts,8);
  assert.equal(control.originalSourcePrinted60Sha256,reg.sourcePrinted60Sha256);
  assert.equal(treatment.originalSourcePrinted60Sha256,reg.sourcePrinted60Sha256);
  const blocks=[];
  for(const mode of reg.gamePolicyModes)for(let i=0;i<4;i++){
    const a=control.modes[mode].attempts[i];
    const b=treatment.modes[mode].attempts[i];
    assert.equal(a.trial.id,b.trial.id);
    const first=witness(a),second=witness(b);
    const pairFingerprint=(x,y)=>x!==null&&y!==null&&x===y?'EXACT_MATCH':
      x===null||y===null?'UNVERIFIED':'MISMATCH';
    blocks.push({mode,trialId:a.trial.id,
      fullPhysicalPair:pairFingerprint(first.fullPhysicalDealFingerprint,
        second.fullPhysicalDealFingerprint),
      sourcePhysicalPair:pairFingerprint(first.sourceDealFingerprint,
        second.sourceDealFingerprint),
      control:first,actorHandDiscard:second,
      competitiveQualified:false});
  }
  assert.equal(blocks.length,8);
  return {schema:VERSION,registrationSha256:createHash('sha256')
    .update(bytes).digest('hex'),
    sourcePrinted60Sha256:reg.sourcePrinted60Sha256,
    nativeAttemptCount:16,pairedBlocks:8,
    matchedPhysicalPairs:blocks.filter(x=>x.fullPhysicalPair==='EXACT_MATCH').length,
    actor47PayableOwnerPromptIsOnlyNewPolicy:true,
    competitiveQualifiedGames:0,certifiedWinRate:null,
    blocks,raw:{control,treatment}};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,REGISTRATION,witness,run};
