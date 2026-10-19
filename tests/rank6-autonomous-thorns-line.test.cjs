'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseDiscardPair,hasOpeningLine,chooseOpeningRoute} =
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


test('expanded source opener uses actual held Tag Call without reading deck',()=>{
  const hand=cards(['Tag Call','Tropical Beach',"Trainers' Mail"]);
  assert.equal(hasOpeningLine(hand),false);
  assert.equal(chooseOpeningRoute(hand),null);
  assert.equal(chooseOpeningRoute(hand,{allowTagCall:true}),null,
    'Needs either a held Stadium or authorization to search it');
  assert.equal(chooseOpeningRoute(hand,{allowTagCall:true,allowStadiumSearch:true}),
    'tag-call');
  assert.equal(chooseOpeningRoute(cards([...hand.map(c=>c.name),
    'Thunder Mountain Prism Star']),{allowTagCall:true}),'tag-call');
});

test('expanded opponent refuses to spend protected discards or held DCE',()=>{
  const options={allowTagCall:true,allowStadiumSearch:true};
  const few=cards(['Tag Call','Trainers\' Mail','Guzma',
    'Cynthia & Caitlin','Thunder Mountain Prism Star']);
  assert.equal(chooseOpeningRoute(few,options),null);
  const dce=cards(['Tag Call','Tropical Beach',"Trainers' Mail",
    'Double Colorless Energy']);
  assert.equal(chooseOpeningRoute(dce,options),null);
});

test('expanded G&H can source a missing Stadium without Tag Call',()=>{
  const hand=cards(['Guzma & Hala','Tropical Beach',"Trainers' Mail"]);
  assert.equal(chooseOpeningRoute(hand,{allowStadiumSearch:true}),'direct');
  assert.equal(chooseOpeningRoute(hand,{allowTagCall:true}),null);
  assert.equal(chooseOpeningRoute(cards([...hand.map(c=>c.name),
    'Thunder Mountain Prism Star'])), 'direct',
    'Baseline hand-only exact-gate behavior is preserved');
});
