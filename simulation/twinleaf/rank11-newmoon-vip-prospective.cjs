'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {runMatch}=require('./headless.cjs');
const {withRank11DirectBoostShake}=require('./rank11-direct-boostshake.cjs');
const {withVIP}=require('./rank11-newmoon-first-vip-counterfactual.cjs');
/** @param {object} deck @returns {string} */
const digest=deck=>createHash('sha256').update(JSON.stringify(deck)).digest('hex');

/**
 * Predeclare entire physical seed frame before viewing any opening deals.
 * Retain errors and no-opportunities in each arm; no win-rate claims.
 * @param {number} [count] Fixed source seeds, 1 to 16.
 * @returns {object} Reproducible actual Store policy exposure diagnostics.
 */
function run(count=12) {
 assert.ok(Number.isInteger(count)&&count>=1&&count<=16);
 const seeds=Array.from({length:count},(_,i)=>
  deriveSlotSeeds(20261018,'published-field',11,i).B);
 assert.equal(new Set(seeds).size,count);
 const candidate=loadNewMoonCandidate();
 const plan=planAichi({label:candidate.id,cards:candidate.cards},{
  allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true});
 const source=plan.opponents.find(x=>x.rank===11);
 assert.equal(source?.status,'ready');
 const hashes=[digest(source.cards),digest(plan.candidate.cards)];
 const trials=[];
 for(const seed of seeds) {
  const common={deckA:source.cards,deckB:plan.candidate.cards,seed,
   maxActions:48,strictPromptValidation:true,
   forestSealSearchCorrection:true,
   battleCompressorPositiveSelectionCorrection:true,
   isolatePolicyRandomness:true,captureDecisionTrace:true};
  try {
   /** @param {boolean} enabled */
   const play=enabled=>withRank11DirectBoostShake(0,()=>withVIP(
    ()=>runMatch({...common,label:'rank11-newmoon-vip-frame:'+enabled}),enabled));
   const control=play(false),variant=play(true);
   const first=control.result.game,second=variant.result.game;
   for(const g of [first,second]) {
    assert.deepEqual(g.deckHashes,hashes);
    assert.equal(g.engine,'twinleafgg/'+plan.engineRevision);
    assert.equal(g.verifiedByDrawLog,true);
   }
   assert.equal(first.firstTurnSlot,second.firstTurnSlot);
   assert.deepEqual(control.result.audit.opening,variant.result.audit.opening,
    'Physical first own-information state must remain identical');
   const seen=variant.result.audit.events;
   const accepted=seen.find(x=>x.kind==='source-first-turn-VIP-check');
   const selected=seen.find(x=>x.kind==='owner-prompt');
   const board=seen.find(x=>x.kind==='bench-after-selection');
   const pass=first.decisionTrace.find(x=>
    x.playerSlot===1&&x.action==='PassTurnAction');
   trials.push({seed,status:'engine-observed',
    firstTurnSlot:first.firstTurnSlot,actualSourceFirst:first.firstTurnSlot===0,
    firstOwnerHand:control.result.audit.opening?.hand||null,
    firstOwnActive:control.result.audit.opening?.active||null,
    baselineFirstPassHand:pass?.decisionHandBefore?.ownHandPrintings||null,
    attemptedVIP:Boolean(accepted),engineLegalVIP:accepted?.valid??null,
    searchedBasics:selected?.selected||[],postSearchBench:board?.bench||null,
    interventionStatus:variant.result.audit.phase,
    sourceLockControl:control.policyAudit.completed,
    sourceLockIntervention:variant.policyAudit.completed,
    candidateDeclarationsBaseline:first.attackDeclarationTrace.filter(x=>x.playerSlot===1).length,
    candidateDeclarationsIntervention:second.attackDeclarationTrace.filter(x=>x.playerSlot===1).length,
    qualifiedForCompetitiveInference:false});
  }catch(error){
   trials.push({seed,status:'engine-exception',error:String(error?.stack||error),
    qualifiedForCompetitiveInference:false});
  }
 }
 return {schema:'rank11-newmoon-vip-fixed-frame-v1',
  seedProtocol:'aichi-decorrelated-slots-v3',seedBase:20261018,
  phase:'published-field',rank:11,seedSlot:'B',
  repeatIndexes:Array.from({length:count},(_,i)=>i),seedFrame:seeds,
  engine:'twinleafgg/'+plan.engineRevision,sourceDigest:hashes[0],
  candidateDigest:hashes[1],rank11Seat:0,candidateSeat:1,
  trialCount:trials.length,
  sourceFirst:trials.filter(x=>x.actualSourceFirst===true).length,
  candidateFirst:trials.filter(x=>x.actualSourceFirst===false).length,
  legallyAcceptedVIP:trials.filter(x=>x.engineLegalVIP===true).length,
  visibleSearchBench:trials.filter(x=>x.postSearchBench).length,
  errors:trials.filter(x=>x.status==='engine-exception').length,
  trials,qualifiedCompetitiveGames:0,
  warning:'Predeclared 48-action genuine source-dealt diagnostics, not independent competitive gameplay.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(
 Number(process.env.VIP_TRIALS||12)),null,2)+'\n');
module.exports={run};
