'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withRank11DirectBoostShake}=require('./rank11-direct-boostshake.cjs');
const SEED=207674218;

/** @returns {object} Frozen source-dealt K1 early-abort counterfactual. */
function run(){
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(x=>x.rank===11);
  assert.equal(opponent?.status,'ready');
  const request={
    deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:48,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true
  };
  const legacy=withRank11DirectBoostShake(0,()=>runMatch(request));
  const corrected=withRank11DirectBoostShake(0,()=>runMatch(request),
    {k1AvoidMissingGarbodor:true});
  assert.equal(legacy.result.firstTurnSlot,0);
  assert.equal(corrected.result.firstTurnSlot,0);
  assert.deepEqual(legacy.result.deckHashes,corrected.result.deckHashes);
  assert.equal(legacy.policyAudit.aborted?.step,'garbodor-search');
  assert.equal(legacy.policyAudit.aborted?.garbodorInOwnerSearch,0);
  assert.equal(legacy.policyAudit.aborted?.garbodorInOwnHand,1);
  assert.equal(corrected.policyAudit.aborted?.step,'trubbish-search');
  assert.equal(corrected.policyAudit.aborted?.ownerDeckSearch,true);
  assert.equal(corrected.policyAudit.aborted?.garbodorInOwnerSearch,0);
  assert.equal(corrected.policyAudit.aborted?.reason,
    'own-deck-search-established-no-Garbodor');
  assert.deepEqual(
    corrected.policyAudit.actions.map(row=>row.step),
    ['vip','trubbish-search'],
    'K1 safety guard must stop before Tool and Boost Shake');
  return{
    study:'rank11 held-BoostShake K1 missing-Garbodor conservation source contrast',
    sourceRank:11,candidateReferenceRank:1,
    actualFirstTurn:0,seed:SEED,sourceManifest:plan.manifestDigest,
    engine:plan.engineRevision,
    legacy:{policy:legacy.policyAudit,cardsPlayed:legacy.result.cardsPlayedBySeat?.[0],
      actions:legacy.result.actions,finished:legacy.result.finished,
      openingDecisions:legacy.result.decisionTrace?.filter(x=>
        x.playerSlot===0 && x.turnBefore===1).slice(0,25)},
    k1Guard:{policy:corrected.policyAudit,
      cardsPlayed:corrected.result.cardsPlayedBySeat?.[0],
      actions:corrected.result.actions,finished:corrected.result.finished,
      openingDecisions:corrected.result.decisionTrace?.filter(x=>
        x.playerSlot===0 && x.turnBefore===1).slice(0,25)},
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,SEED};
