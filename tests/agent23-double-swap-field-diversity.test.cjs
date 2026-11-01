'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run,openingSplit}=
  require('../scripts/agent23-double-swap-field-diversity.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

test('all 29 published Aichi 60s reproduce frozen two-swap diversity',()=>{
  const result=run();
  assert.equal(result.originalPrintedSources,29);
  assert.equal(result.rows.length,29);
  assert.equal(result.oldDistinctTotal,439);
  assert.equal(result.newDistinctTotal,441);
  assert.equal(result.improved,2);
  assert.equal(result.tied,27);
  assert.equal(result.worsened,0);
  const gains=result.rows.filter(row=>
    row.newDistinctHands>row.oldDistinctHands);
  assert.deepEqual(gains.map(x=>[x.rank,x.oldDistinctHands,
    x.newDistinctHands]),[[24,15,16],[30,15,16]]);
  for(const row of result.rows){
    assert.ok(row.eligiblePhysicalPaths>=row.allEligibleDistinctHands);
    assert.ok(row.newDistinctHands<=16);
  }
  assert.equal(result.gameplayQualified,false);
});

test('each original physical opening split has 7+6+47 cards',()=>{
  for(const source of field.decks){
    const {hand,prizes,deck}=openingSplit(source);
    assert.equal(hand.length,7);
    assert.equal(prizes.length,6);
    assert.equal(deck.length,47);
    assert.ok([...hand,...prizes,...deck].every(card=>
      card.kind==='trainer'&&card.trainerType!==undefined||
      card.kind==='energy'&&card.energyType!==undefined||
      card.kind==='pokemon'&&card.stage!==undefined));
  }
});
