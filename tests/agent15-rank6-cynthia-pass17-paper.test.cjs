'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const source=require('../results/aichi-2026/full-decklists.json').decks
  .find(x=>x.rank===6);
const printed=require('../resources/cards/en/sm12.json');
const {SOURCE_ROOT,VERSION,certify,energyHitLowerBound}=
  require('../simulation/evaluation/agent15-rank6-cynthia-pass17-paper.cjs');

test('SFT original rank6 printed 60 and CEC189 text, actual root17 owner hand',()=>{
  const x=certify(source,printed);
  assert.equal(x.version,VERSION);
  assert.equal(x.sourceRoot,'6:101:B:champion-reference');
  assert.equal(x.sourcePhysicalSeat,0);
  assert.equal(x.sourceTurn,2);
  assert.equal(x.sourceObservedHandCount,6);
  assert.equal(x.sourceObservedBoardPokemon,2);
  assert.equal(x.possibleAnotherCardToDiscard,'Tool Jammer BST');
  assert.equal(x.nativeStoreCynthiaPlayObserved,false);
  assert.equal(x.nativeDrawResolutionObserved,false);
  assert.equal(x.competitiveGamesQualified,0);
});

test('SFT conservative printed energy population cannot all fit six prizes',()=>{
  const x=certify(source,printed);
  assert.equal(x.originalSourceEnergyCount,8);
  assert.equal(x.guaranteedMinimumEnergyInDeckIfNoPriorCardZoneLoss,2);
  assert.equal(x.deckCardsByPublicConservationIfNoPriorCardZoneLoss,46);
  assert.ok(Math.abs(x.conditionalThreeCardEnergyHitLowerBound-
    0.12753623188405794)<1e-12);
});

test('SFT official print has an independently payable discard-one-draw-three mode',()=>{
  const x=printed.find(c=>c.id==='sm12-189');
  assert.ok(x.rules[0].includes('Put a Supporter card'));
  assert.ok(x.rules[1].includes('When you play this card, you may discard'));
  assert.ok(x.rules[1].includes('draw 3 cards'));
  assert.equal(SOURCE_ROOT.ownerNonPromptRootsBeforePass.length,0);
  assert.equal(SOURCE_ROOT.opponentNonPromptRootsBeforePass[0].card,'Psychic Energy');
  assert.equal(SOURCE_ROOT.actualFirstPlayer,1);
});

test('SFT full 60 and exact printed CEC189 are required, fail closed',()=>{
  const wrong=structuredClone(source);
  wrong.cards.find(c=>c.name==='Cynthia & Caitlin').printing.number='228';
  assert.throws(()=>certify(wrong,printed));
  const shortened=structuredClone(source);
  shortened.cards.find(c=>c.name==='Speed Lightning Energy').count--;
  assert.throws(()=>certify(shortened,printed));
  assert.throws(()=>certify({...source,rank:11},printed));
  assert.throws(()=>certify(source,printed.filter(x=>x.id!=='sm12-189')));
});

test('SFT no replacement across a nonexistent Energy pool',()=>{
  assert.equal(energyHitLowerBound(46,0,3),0);
  assert.equal(energyHitLowerBound(46,46,3),1);
  assert.equal(energyHitLowerBound(46,2,0),0);
  assert.throws(()=>energyHitLowerBound(4,5,3));
  assert.throws(()=>energyHitLowerBound(4,1,5));
});

test('SFT expose source claim as conditional, never a native response or qualified win',()=>{
  const result=certify(source,printed);
  assert.match(result.paperLegalityVerdict,/CONDITIONAL-YES/);
  assert.match(result.limits,/independent audit/);
  assert.equal(result.competitiveGamesQualified,0);
  console.log('RANK6_CYNTHIA_PAPER_SFT',JSON.stringify({
    sourceRoot:result.sourceRoot,sourceTurn:result.sourceTurn,
    energyMinimum:result.guaranteedMinimumEnergyInDeckIfNoPriorCardZoneLoss,
    threeDrawHitLowerBound:result.conditionalThreeCardEnergyHitLowerBound,
    sourceHandSha256:result.sourceHandSha256,
    nativePromptResolved:false,qualifiedGames:0
  }));
});
