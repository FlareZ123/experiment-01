'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const native=require('./agent37-rank5-fusion-mobility-prospective.cjs');
const {witness}=require('./agent9-rank5-quickball-payment-pair.cjs');

const VERSION='agent9-rank5-crobat-dce-mew-paid-retreat-pair-v1';
const REGISTRATION='results/aichi-2026/registrations/agent9-rank5-crobat-dce-mew-retreat-pair-20261102.json';
const ROOT=path.resolve(__dirname,'../..');

/** @param {object} entry Actual native attempt with genuine Store action ledger. */
function nativeRetreatAudit(entry){
  const row=entry.rawNativeRow,seat=entry.trial.candidateSlot==='A'?1:0;
  if(!row)return {sourceAcceptedRetreat:null,candidateAcceptedRetreat:null,
    sourceAttackDeclared:null,sourceAttacks:null,
    sourceRetreatRootEvents:null};
  const roots=row.rootActionLedger??[];
  const sourceRetreat=roots.filter(x=>x.playerSlot===seat&&
    x.action==='RetreatAction');
  const candidateRetreat=roots.filter(x=>x.playerSlot===1-seat&&
    x.action==='RetreatAction');
  const sourceAttacks=roots.filter(x=>x.playerSlot===seat&&
    x.action==='AttackAction');
  const settlements=row.candidateAttackSettlement?.attacks??[];
  return {sourceAcceptedRetreat:sourceRetreat.length,
    candidateAcceptedRetreat:candidateRetreat.length,
    sourceRetreatRootEvents:sourceRetreat.map(x=>({
      actionOrdinal:x.actionOrdinal,globalTurn:x.turnBefore,
      card:x.card??null,sourceSeat:seat})),
    sourceAttacks:sourceAttacks.map(x=>({
      globalTurn:x.turnBefore,attack:x.attack??null})),
    sourceAttackDeclared:sourceAttacks.length,
    terminal:entry.summary.nativeDisposition,
    sourceSettledAttackTransitions:settlements.filter(x=>
      x.attackerSeat===seat).length};
}

/** Execute 16 controlled native Store attempts with paired source physical deals. */
function run(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION)),reg=JSON.parse(bytes);
  assert.equal(reg.nativeAttempts,16);
  assert.equal(reg.zeroPostOutcomeExclusions,true);
  const before=process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
  let control,treatment;
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    control=native.run({quickBallScope:'source',actorHandDiscard:true});
    treatment=native.run({quickBallScope:'source',actorHandDiscard:true,
      sourceCrobatDceMewRetreat:true});
  }finally{
    if(before===undefined)delete process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
    else process.env.AGENT8_ACTOR_QUICK_BALL_DEV=before;
  }
  assert.equal(control.requestedNativeAttempts,8);
  assert.equal(treatment.requestedNativeAttempts,8);
  assert.equal(control.originalSourcePrinted60Sha256,reg.sourcePrinted60Sha256);
  assert.equal(treatment.originalSourcePrinted60Sha256,reg.sourcePrinted60Sha256);
  const blocks=[];
  for(const mode of reg.modes)for(let i=0;i<4;i++){
    const c=control.modes[mode]?.attempts?.[i];
    const t=treatment.modes[mode]?.attempts?.[i];
    assert.ok(c&&t,'All original 16 attempts retained');
    assert.equal(c.trial.id,t.trial.id);
    const a=witness(c),b=witness(t);
    const pair=(x,y)=>x!==null&&y!==null&&x===y?'EXACT_MATCH':
      x===null||y===null?'UNVERIFIED':'MISMATCH';
    blocks.push({mode,trialId:c.trial.id,
      fullPhysicalDealPair:pair(a.fullPhysicalDealFingerprint,
        b.fullPhysicalDealFingerprint),
      sourceDealPair:pair(a.sourceDealFingerprint,b.sourceDealFingerprint),
      control:{...a,...nativeRetreatAudit(c)},
      sourceCrobatRetreat:{...b,...nativeRetreatAudit(t)},
      competitivelyQualified:false});
  }
  assert.equal(blocks.length,8);
  return {schema:VERSION,registrationSha256:createHash('sha256')
    .update(bytes).digest('hex'),
    nativeAttemptCount:16,matchedPhysicalPairs:blocks.filter(x=>
      x.fullPhysicalDealPair==='EXACT_MATCH').length,
    competitiveQualifiedGames:0,certifiedWinRate:null,
    blocks,raw:{control,treatment}};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,REGISTRATION,nativeRetreatAudit,run};
