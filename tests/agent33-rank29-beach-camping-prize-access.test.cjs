'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {choose, completeGroups, evaluate} =
  require('../simulation/evaluation/agent33-rank29-beach-camping-prize-access.cjs');

const fixture = {decks:[{rank:29,cards:[
  {name:'Iron Thorns ex',category:'Pokémon',count:4},
  {name:'Camping Gear',category:'Trainer',count:2},
  {name:'Tropical Beach',category:'Trainer',count:2},
  {name:'Double Colorless Energy',category:'Energy',count:1},
  {name:'Thunder Mountain ♢',category:'Trainer',count:1},
  {name:'Other',category:'Trainer',count:50}
]}]};

test('exact choose and inclusion-exclusion match explicit tiny subset enumeration', () => {
  assert.equal(choose(60,7),386206920n);
  assert.equal(completeGroups(5,2,[1,1]),1n);
  assert.equal(completeGroups(5,3,[1,1]),3n);
  assert.equal(completeGroups(5,2,[1,2]),2n);
  assert.equal(completeGroups(5,2,[1,1,1]),0n);
});

test('rank29 original grouped counts and conditional rational figures', () => {
  const o=evaluate(fixture);
  assert.equal(o.basicCopies,4);
  assert.equal(o.firstTurnDraw,1);
  assert.equal(o.beachEffectDraws,1);
  assert.equal(o.beachDraws,2);
  assert.equal(o.deckAfterPrizes,47);
  assert.ok(Math.abs(o.bothHeldGivenLegalOpening-0.034190941808620576)<1e-14);
  assert.ok(Math.abs(o.dceInitiallyHeldGivenBoth-0.073260232999)<1e-9);
  assert.ok(Math.abs(o.campingDceByTurnEndGivenBoth-0.8950860641)<1e-10);
  assert.ok(Math.abs(o.beachDceByTurnEndGivenBoth-0.1082315449)<1e-10);
  assert.ok(Math.abs(o.campingMinusBeachAccessGap-0.7868545192)<1e-10);
  assert.ok(Math.abs(o.initiallyBothAttackPiecesGivenBothTerminal-0.004102891511)<1e-10);
  assert.ok(Math.abs(o.initiallyOneAttackPieceGivenBothTerminal-0.138314682907)<1e-10);
  assert.ok(Math.abs(o.initiallyNeitherAttackPieceGivenBothTerminal-0.857582425582)<1e-10);
  assert.ok(Math.abs(o.bothAttackPiecesByT2Gear-0.169700663556)<1e-10);
  assert.ok(Math.abs(o.bothAttackPiecesByT2Beach-0.013799039946)<1e-10);
  assert.ok(Math.abs(o.gearMinusBeachAttackPairGap-0.155901623610)<1e-10);
  assert.equal(o.competitiveQualifiedGames,0);
});

test('original source identity drift fails closed', () => {
  const copy=JSON.parse(JSON.stringify(fixture));
  copy.decks[0].cards[2].count=3;
  assert.throws(()=>evaluate(copy), /source identity changed/);
});
