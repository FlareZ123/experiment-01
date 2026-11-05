'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const original=require('../results/aichi-2026/full-decklists.json')
  .decks.find(x=>x.rank===11);
const fst=require('../resources/cards/en/swsh8.json');
const asr=require('../resources/cards/en/swsh10.json');
const {ROOT,VERSION,certify}=require(
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
