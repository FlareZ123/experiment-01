'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rank5LiteralFirstTurnWallyLine:calculate}=
  require('../scripts/agent26-rank5-first-turn-wally-literal-line.cjs');
const field=require('../results/aichi-2026/full-decklists.json');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-13);

test('exact fixed-rank5 rare literal four-piece first-turn access probability',()=>{
  const r=calculate(field);
  assert.equal(r.openingLine.numerator,'1826378549');
  assert.equal(r.openingLine.denominator,'314141781525');
  close(r.openingLine.probability,0.005813867038424029);
  assert.equal(r.assumesPlayerGoingSecond,true);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('conditional valid setup and ungated Prized-VMAX probabilities are distinct',()=>{
  const r=calculate(field);
  assert.equal(r.withoutVmaxInDeckGate.numerator,'14945908');
  assert.equal(r.withoutVmaxInDeckGate.denominator,'2558620845');
  assert.equal(r.sourceValidInitialHand.numerator,'1137524');
  assert.equal(r.sourceValidInitialHand.denominator,'1462905');
  assert.equal(r.conditionalOnValidInitialHand.numerator,'5479135647');
  assert.equal(r.conditionalOnValidInitialHand.denominator,'732810023660');
  assert.ok(r.openingLine.probability<
    r.withoutVmaxInDeckGate.probability);
  assert.ok(r.conditionalOnValidInitialHand.probability>
    r.openingLine.probability);
});

test('printed Wally and four-piece source inventory must remain exact',()=>{
  const altered=structuredClone(field);
  const deck=altered.decks.find(d=>d.rank===5);
  deck.cards.find(c=>c.name==='Wally').count=2;
  assert.throws(()=>calculate(altered),assert.AssertionError);
  const alteredEnergy=structuredClone(field);
  alteredEnergy.decks.find(d=>d.rank===5).cards
    .find(c=>c.name==='Double Colorless Energy').name='Psychic Energy';
  assert.throws(()=>calculate(alteredEnergy),assert.AssertionError);
});

test('event assumptions exclude extra card access and independent opponents',()=>{
  const r=calculate(field);
  assert.deepEqual(r.categoryLabels.slice(0,5),[
    'Mew V','Genesect V','Double Colorless Energy','Wally','Mew VMAX'
  ]);
  assert.deepEqual(r.cardCounts,[4,4,4,1,3,44]);
  assert.equal(r.initialHandCount,7);
  assert.equal(r.firstTurnDrawCount,1);
  assert.equal(r.prizeCount,6);
  assert.equal(r.opponentMulliganBonusesExcluded,true);
  assert.equal(r.alternateAccessAndDrawEffectsExcluded,true);
  assert.equal(r.noOpponentActionsOrLocksModeled,true);
});

test('broader Mew DCE Genesect first-eight future route is over ten times likelier',()=>{
  const r=calculate(field);
  const future=r.futureMewPreparationWithoutWally;
  assert.equal(future.numerator,'174932053418');
  assert.equal(future.denominator,'2827276033725');
  close(future.probability,0.061873001196675895);
  assert.ok(future.probability/r.openingLine.probability>10);
});
