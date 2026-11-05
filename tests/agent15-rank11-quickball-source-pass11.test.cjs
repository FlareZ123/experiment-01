'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const original=require('../results/aichi-2026/full-decklists.json')
  .decks.find(x=>x.rank===11);
const fst=require('../resources/cards/en/swsh8.json');
const asr=require('../resources/cards/en/swsh10.json');
const {ROOT,VERSION,allInPrizes,certify}=require(
  '../simulation/evaluation/agent15-rank11-quickball-source-pass11.cjs');

test('SFT source rank11 original-60, exact printed Quick Ball and Dark Patch',()=>{
  const v=certify(original,fst,asr);
  assert.equal(v.version,VERSION);
  assert.equal(v.sourceRegistration,'11:103:B:champion-reference');
  assert.equal(v.sourceSeat,0);
  assert.equal(v.sourceGlobalTurn,2);
  assert.equal(v.sourcePassOrdinal,11);
  assert.equal(v.totalBasicPokemonInOriginal60,11);
});

test('SFT authenticated source owner hand and Basic/Prize conservation',()=>{
  const v=certify(original,fst,asr);
  assert.equal(ROOT.hand.length,4);
  assert.equal(v.exactHandSha256,
    'e5ff17ac1ba229710697a221a9db46aaf182468a9845ed5dc6407475d974f910');
  assert.equal(v.totalDeckCardsGivenCompletePrefix,46);
  assert.equal(v.guaranteedBasicPokemonInDeckGivenCompletePrefix,2);
  assert.equal(v.spareBenchSlots,3);
  assert.equal(v.handDiscardPayment,'Dark Patch ASR');
  assert.equal(v.k0UnseenPoolOfDeckAndPrizes,52);
  assert.ok(Math.abs(v.k0ProbabilitySecondMegaAbsolAvailable-
    0.9886877828054299)<1e-12);
  assert.ok(Math.abs(v.k0ProbabilityTrubbishAvailable-
    0.9886877828054299)<1e-12);
  assert.ok(Math.abs(v.k0ProbabilityMegaOrTrubbishAvailable-
    0.9999445932219041)<1e-12);
  assert.ok(Math.abs(v.k0ProbabilityMegaAndTrubbishBothAvailable-
    0.9774309723889556)<1e-12);
  assert.equal(v.printedGarbotoxinToolEnablers,6);
  assert.ok(Math.abs(v.nextOwnerNaturalDrawToolChanceAfterSearchForTrubbish-
    56/475)<1e-12);
  assert.ok(Math.abs(v.unconditionalTrubbishSearchAndNextNaturalToolDraw-
    644/5525)<1e-12);
});

test('SFT no previous source discard action and unusable held Dark Patch',()=>{
  assert.equal(ROOT.priorOwnerNonPrompt.length,1);
  assert.equal(ROOT.priorOwnerNonPrompt[0].action,'PlayCardAction');
  assert.equal(ROOT.priorOwnerNonPrompt[0].card,'Darkness Energy');
  assert.equal(ROOT.priorOpponentNonPrompt[0].action,'PassTurnAction');
  const v=certify(original,fst,asr);
  assert.equal(v.darkPatchHasNoImmediateEnergyInDiscard,true);
  assert.equal(v.qualifiedCompetitiveGames,0);
});

test('SFT printing and complete 60 are mandatory',()=>{
  const badPrint=structuredClone(original);
  badPrint.cards.find(x=>x.name==='Quick Ball').printing.number='236';
  assert.throws(()=>certify(badPrint,fst,asr));
  const shortened=structuredClone(original);
  shortened.cards.find(x=>x.name==='Quick Ball').count--;
  assert.throws(()=>certify(shortened,fst,asr));
  assert.throws(()=>certify({...original,rank:6},fst,asr));
  assert.throws(()=>certify(original,fst.filter(x=>x.id!=='swsh8-237'),asr));
  assert.throws(()=>certify(original,fst,asr.filter(x=>x.id!=='swsh10-139')));
});

test('SFT hypergeometric Prize-group absence at K0',()=>{
  assert.equal(allInPrizes(52,6,7),0);
  assert.equal(allInPrizes(52,6,0),1);
  assert.equal(allInPrizes(52,6,1),6/52);
  assert.ok(Math.abs(allInPrizes(52,6,2)-15/1326)<1e-12);
  assert.ok(Math.abs(allInPrizes(52,6,4)-
    5.5406778095853724e-05)<1e-12);
  assert.throws(()=>allInPrizes(52,53,2));
  assert.throws(()=>allInPrizes(52,6,-1));
});

test('SFT native execution remains unobserved and no wins admitted',()=>{
  const v=certify(original,fst,asr);
  assert.equal(v.itemPlayObserved,false);
  assert.equal(v.searchPromptSettled,false);
  assert.equal(v.qualifiedCompetitiveGames,0);
  assert.match(v.limitations,/Native Store payment/);
  console.log('RANK11_QUICKBALL_PAPER_SFT',JSON.stringify({
    rank:v.sourceRegistration,minimumBasic:v.guaranteedBasicPokemonInDeckGivenCompletePrefix,
    liveBench:v.spareBenchSlots,deal:v.originalSourceDealSha256,
    qualifiedGames:0,nativePlays:0
  }));
});
