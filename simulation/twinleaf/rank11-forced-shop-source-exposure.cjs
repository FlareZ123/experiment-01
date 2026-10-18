'use strict';
const assert=require('node:assert/strict');
const {runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {observeShop}=require('./rank11-shopping-center-source-observer.cjs');
const {withRank11FirstTurnBoostShake}=
  require('./rank11-firstturn-boostshake-fork.cjs');

/** Source-dealt forced Garbotoxin with read-only own-hand Shopping Center observer. */
function run(){
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const rank11=plan.opponents.find(x=>x.rank===11);
  assert.equal(rank11?.status,'ready');
  const req={deckA:rank11.cards,deckB:plan.candidate.cards,
    seed:1244180408,maxActions:450,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true};
  const baseline=withRank11FirstTurnBoostShake(()=>runMatch(req));
  const observed=withRank11FirstTurnBoostShake(()=>
    observeShop(101,()=>runMatch(req)));
  assert.equal(observed.stage,11);
  const actual=observed.result.result;
  for(const key of ['finished','winner','actions','turns','firstTurnSlot',
    'prizesRemaining','deckHashes','abilityTrace','attackTrace',
    'cardsPlayedBySeat','decisionTrace'])
    assert.deepEqual(actual[key],baseline.result[key],
      'Read-only Shop observer changed forced source game '+key);
  const samples=observed.result.samples;
  return {
    study:'natural Shopping Center opportunities after *forced* genuine rank11 Garbotoxin opener',
    seed:req.seed,engine:plan.engineRevision,sourceSeat:0,sourceActuallyFirst:true,
    observedDecisionBoundaries:observed.result.observedDecisionBoundaries,
    witnessedSignatures:samples.length,
    equippedGarbodorSignatures:samples.filter(x=>x.equippedGarbodor>0).length,
    equippedWithShoppingCenter:samples.filter(x=>x.equippedGarbodor>0&&
      x.shoppingCenterInPlay).length,
    qualifiedShopCrobatPrerequisites:samples.filter(x=>x.ownsCrobatWindow).length,
    firstShopEquipped:samples.filter(x=>
      x.equippedGarbodor>0&&x.shoppingCenterInPlay).slice(0,6),
    crobatInOwnHandWhileEquipped:samples.filter(x=>
      x.equippedGarbodor>0&&x.crobatVInOwnHand).slice(0,6),
    readOnlyReplayEqual:true,originalWinner:baseline.result.winner,
    remainingPrizes:baseline.result.prizesRemaining,
    qualifiedForCompetitiveInference:false,
    caveat:'One seed, staged initial alternative followed by weak policy; signatures are not independent turns or game trials'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
