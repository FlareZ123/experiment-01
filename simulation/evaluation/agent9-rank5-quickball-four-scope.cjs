'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const native=require('./agent37-rank5-fusion-mobility-prospective.cjs');

const VERSION='agent9-rank5-quickball-four-scope-causal-native-v1';
const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent9-rank5-quickball-four-scope-20261102.json';
const SCOPES=Object.freeze(['off','source','candidate','both']);
const PRINTINGS=new Set(['Quick Ball SSH','Quick Ball FST']);

/**
 * Read real Store roots and accepted physical hand printing receipts.
 * Unavailable native rows remain missing evidence, never zero successes.
 * @param {object|null} row
 * @param {0|1} sourceSeat
 */
function ownerAudit(row,sourceSeat){
  if(row===null)return {status:'NATIVE_ROW_MISSING',
    sourceQuickBall:null,candidateQuickBall:null,sourceAttacks:null,
    candidateAttacks:null,sourceMewEvolutions:null,selectedQuickBallChains:null};
  const roots=row.rootActionLedger;
  const events=row.nativeAcceptedTargetSidecar?.events;
  const prompts=row.nativePromptChoices?.events;
  assert.ok(Array.isArray(roots)&&Array.isArray(events)&&Array.isArray(prompts));
  assert.equal(roots.length,row.rootActionCount);
  const accepted=events.filter(e=>e.storeAccepted===true&&
    e.action==='PlayCardAction'&&PRINTINGS.has(e.declared?.ownerHandPrinting));
  const count=(seat,type)=>roots.filter(r=>r.playerSlot===seat&&
    r.action===type).length;
  const evolution=roots.filter(r=>r.playerSlot===sourceSeat&&
    r.action==='PlayCardAction'&&
    typeof r.card==='string'&&r.card.startsWith('Mew VMAX')).length;
  const chains=accepted.map(e=>{
    const next=roots.find(r=>r.playerSlot===e.playerSlot&&
      r.actionOrdinal>e.rootActionOrdinal&&
      r.action!=='ResolvePromptAction')?.actionOrdinal??roots.length;
    const matching=prompts.filter(p=>p.actorSeat===e.playerSlot&&
      p.kind==='ChooseCardsPrompt'&&p.ordinal>e.rootActionOrdinal&&
      p.ordinal<next);
    return {seat:e.playerSlot,rootOrdinal:e.rootActionOrdinal,
      ownerHandPrinting:e.declared.ownerHandPrinting,
      paymentSelections:matching.filter(p=>p.sourceZone==='unclassified')
        .flatMap(p=>p.selectedCards),
      deckSearchSelections:matching.filter(p=>p.sourceZone==='deck')
        .flatMap(p=>p.selectedCards),
      promptCount:matching.length};
  });
  return {status:'ORIGINAL_STORE_ACCEPTED_ROOTS',
    sourceQuickBall:accepted.filter(e=>e.playerSlot===sourceSeat).length,
    candidateQuickBall:accepted.filter(e=>e.playerSlot===1-sourceSeat).length,
    sourceAttacks:count(sourceSeat,'AttackAction'),
    candidateAttacks:count(1-sourceSeat,'AttackAction'),
    sourceMewEvolutions:evolution,
    selectedQuickBallChains:chains};
}

/** @returns {object} Frozen original-source four-scope native diagnostic. */
function run(){
  const regBytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const reg=JSON.parse(regBytes);
  assert.deepEqual(reg.scopes,SCOPES);
  assert.equal(reg.nativeAttemptCount,32);
  assert.equal(reg.noPostOutcomeExclusions,true);
  const previous=process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
  const arms={};
  try{
    for(const scope of SCOPES){
      process.env.AGENT8_ACTOR_QUICK_BALL_DEV=scope==='both'?'true':'false';
      arms[scope]=native.run(scope==='source'||scope==='candidate'?
        {quickBallScope:scope}:{});
      assert.equal(arms[scope].requestedNativeAttempts,8);
      assert.equal(arms[scope].originalSourcePrinted60Sha256,
        reg.originalSourcePrinted60Sha256);
    }
  }finally{
    if(previous===undefined)delete process.env.AGENT8_ACTOR_QUICK_BALL_DEV;
    else process.env.AGENT8_ACTOR_QUICK_BALL_DEV=previous;
  }
  const blocks=[];
  for(const mode of reg.gamePolicyModes)for(let i=0;i<4;i++){
    const results={},identities=new Set(),fullDeals=new Set(),sourceDeals=new Set();
    for(const scope of SCOPES){
      const trial=arms[scope].modes[mode]?.attempts?.[i];
      assert.ok(trial,'All 32 original attempt slots must be preserved');
      identities.add(trial.trial.id);
      fullDeals.add(trial.summary.fullPhysicalDealFingerprint??null);
      sourceDeals.add(trial.summary.sourceDealFingerprint??null);
      const sourceSeat=trial.trial.candidateSlot==='A'?1:0;
      const row=trial.rawNativeRow;
      results[scope]={
        sourceSeat,disposition:trial.summary.nativeDisposition,
        sourceDealFingerprint:trial.summary.sourceDealFingerprint??null,
        fullPhysicalDealFingerprint:trial.summary.fullPhysicalDealFingerprint??null,
        ...ownerAudit(row,sourceSeat),
        finalGlobalTurn:row?.turns??null,
        winner:row?.winner??null,
        endReason:row?.endReason??null,
        finalPrizes:row?.finalPrizes??null,
        competitivelyQualified:false
      };
    }
    assert.equal(identities.size,1,'Paired trials must use same ID');
    const samePhysical=fullDeals.size===1&&!fullDeals.has(null);
    const sameSource=sourceDeals.size===1&&!sourceDeals.has(null);
    const baseAttacks=arms.off.modes[mode].attempts[i].rawNativeRow?.rootActionLedger
      ?.filter(x=>x.playerSlot===results.off.sourceSeat&&
        x.action==='AttackAction').map(x=>x.turnBefore)??null;
    const end=results.both.finalGlobalTurn;
    const terminal=results.both.endReason==='engine-game-end';
    blocks.push({mode,trialId:[...identities][0],
      fullPhysicalDealPairing:samePhysical?'EXACT_MATCH':
        fullDeals.has(null)?'UNVERIFIED':'MISMATCH',
      sourcePhysicalDealPairing:sameSource?'EXACT_MATCH':
        sourceDeals.has(null)?'UNVERIFIED':'MISMATCH',
      offSourceAttackTurns:baseAttacks,
      offAttacksLaterThanBothTerminal:
        terminal&&baseAttacks?baseAttacks.filter(x=>x>end).length:null,
      actual:results,competitivelyQualified:false});
  }
  assert.equal(blocks.length,8);
  return {schema:VERSION,registrationSha256:createHash('sha256')
    .update(regBytes).digest('hex'),
    sourcePrinted60Sha256:reg.originalSourcePrinted60Sha256,
    scopeOrder:SCOPES,modeOrder:reg.gamePolicyModes,
    nativeAttemptCount:32,pairedBlocks:8,
    physicalMatches:blocks.filter(x=>
      x.fullPhysicalDealPairing==='EXACT_MATCH').length,
    competitiveQualifiedGames:0,certifiedWinRate:null,
    blocks,rawArms:arms};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,SCOPES,REGISTRATION,ownerAudit,run};
