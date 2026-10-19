'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseDiscardPair,hasOpeningLine} =
  require('../simulation/twinleaf/rank6-autonomous-thorns-line.cjs');

/** @param {string[]} names */
const cards=names=>names.map(name=>({name}));

test('selects only hand-present expendables in stable order',()=>{
  const hand=cards(['Guzma & Hala','Palace Belt','Tropical Beach',
    'Thunder Mountain Prism Star',"Trainers' Mail",'Guzma']);
  assert.deepEqual(chooseDiscardPair(hand).map(c=>c.name),
    ['Tropical Beach',"Trainers' Mail"]);
  assert.equal(hasOpeningLine(hand),true);
  assert.ok(chooseDiscardPair(hand).every(c=>hand.includes(c)));
});

test('does not spend mandatory access pieces or protected singleton support',()=>{
  const hand=cards(['Guzma & Hala','Thunder Mountain Prism Star',
    'Guzma','Cynthia & Caitlin','Palace Belt']);
  assert.deepEqual(chooseDiscardPair(hand),[]);
  assert.equal(hasOpeningLine(hand),false);
});

test('two distinct physical copies can pay both discard slots',()=>{
  const hand=cards(['Guzma & Hala','Thunder Mountain Prism Star',
    "Trainers' Mail","Trainers' Mail"]);
  const pair=chooseDiscardPair(hand);
  assert.equal(pair.length,2);
  assert.notEqual(pair[0],pair[1]);
  assert.equal(hasOpeningLine(hand),true);
});

test('held DCE selects a separate line rather than wasting G&H',()=>{
  const hand=cards(['Guzma & Hala','Thunder Mountain Prism Star',
    'Double Colorless Energy','Tropical Beach',"Trainers' Mail"]);
  assert.equal(hasOpeningLine(hand),false);
});

test('missing access cards or missing payment veto the branch',()=>{
  const full=['Guzma & Hala','Thunder Mountain Prism Star',
    'Tropical Beach',"Trainers' Mail"];
  for(const absent of full) {
    assert.equal(hasOpeningLine(cards(full.filter(x=>x!==absent))),false);
  }
});
