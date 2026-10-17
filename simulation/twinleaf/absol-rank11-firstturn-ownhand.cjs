'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const SOURCE_SEED=1244180408;

/** Verify observer perspective cannot perturb the original source deal. */
function inspect(){
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const opp=plan.opponents.find(x=>x.rank===11);
  assert.equal(opp?.status,'ready');
  const base={
    deckA:opp.cards,deckB:plan.candidate.cards,
    seed:SOURCE_SEED,maxActions:450,strictPromptValidation:true,
    forestSealSearchCorrection:true,battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'rank11-firstturn-source-audit'
  };
  const original=runMatch({...base,captureCopycatTurnStartSeat:1});
  const acting=runMatch({...base,captureCopycatTurnStartSeat:0});
  for(const key of ['winner','finished','turns','actions','prizesRemaining','deckHashes',
    'attackTrace','abilityTrace','cardsPlayedBySeat','decisionTrace']){
    assert.deepEqual(acting[key],original[key],'Perspective observer changed '+key);
  }
  assert.equal(acting.firstTurnSlot,0);
  assert.equal(acting.verifiedByDrawLog,true);
  const ownTurnOne=acting.copycatTurnStartEvidence.find(x=>x.turn===1);
  assert(ownTurnOne,'Source opponent first own turn missing');
  const firstDecisions=acting.decisionTrace.filter(x=>x.playerSlot===0&&x.turnBefore===1);
  assert(firstDecisions.some(x=>x.ability==='Back Order'),'Observed Back Order missing');
  assert(firstDecisions.some(x=>x.card==='Secret Box'),'Observed Secret Box missing');
  assert(!firstDecisions.some(x=>x.card==='Boost Shake'),'Unexpected Shake appeared');
  return {
    source:'rank11 published Wataru Yano 60 versus published rank1 Shadow Rider 60',
    seed:SOURCE_SEED,engine:plan.engineRevision,
    sourceFirstSlot:acting.firstTurnSlot,drawLogVerified:acting.verifiedByDrawLog,
    sameActualGameUnderObserverChange:true,deckHashes:acting.deckHashes,
    firstTurnOwnHand:ownTurnOne.candidateHand,
    firstTurnOwnBoard:ownTurnOne.board[0],
    firstTurnPublicOpponentBoard:ownTurnOne.board[1],
    firstTurnOwnDiscard:ownTurnOne.candidateDiscard,
    initialPrizeCounts:ownTurnOne.prizeCounts,
    firstTurnActions:firstDecisions.map(d=>({
      ordinal:d.actionOrdinal,action:d.action,card:d.card||null,
      ability:d.ability||null,attack:d.attack||null,
      selection:d.cardSelection?{zone:d.cardSelection.sourceZone,
        cards:d.cardSelection.selectedCards}:null,
      option:d.optionSelection?d.optionSelection.selectedText:null
    })),
    ended:acting.finished,winner:acting.winner,prizesRemaining:acting.prizesRemaining,
    caveat:'Read-only source-own first-turn information and recorded choices. Complete search catalogs, live legality branches, hidden prize map and strategic optimality are not verified. Not a qualified game.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
module.exports={inspect,SOURCE_SEED};
