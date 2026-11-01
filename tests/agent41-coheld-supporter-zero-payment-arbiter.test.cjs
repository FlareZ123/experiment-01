'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {collectAndChooseOwnerRoot}=
  require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');

function root(){
  return {
    decisionKind:'owner-root',globalTurn:4,
    ownHand:['Team Flare Grunt XY','Plumeria BUS',
      'Crushing Hammer POR','Guzma BUS'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{active:{printing:'Iron Thorns ex TWM',energies:[],
      attacks:[],tools:[]},bench:[],
      publicTurnRestrictions:{},prizeCount:6},
    opponentPublic:{active:{printing:'Girafarig',
      energies:['Psychic Energy MEE','Psychic Energy MEE']},
      bench:[]}
  };
}

const options={sameRootChoiceApply:true,nativePlumeriaChoice:true,
  nativeZeroCostDenialChoice:true,teamFlareGruntDenialRoot:true};

test('coheld two-Energy native opportunity picks cost-free Flare over Plumeria',()=>{
  const out=collectAndChooseOwnerRoot(root(),{},{kind:'pass'},options);
  assert.equal(out.intent.kind,'play-team-flare-grunt-denial');
  assert.equal(out.intent.handIndex,0);
  assert.equal(out.receipt.selectedSource,'team-flare-grunt');
  const paid=out.receipt.offers.find(x=>
    x.source==='grouped-plumeria-payments');
  const free=out.receipt.offers.find(x=>x.source==='team-flare-grunt');
  assert.equal(paid?.score,3);
  assert.equal(free?.score,5);
  assert.equal(paid?.nativeDispatchImplemented,true);
});

test('default-off coheld zero-cost arbitration preserves earlier Plumeria score',()=>{
  const out=collectAndChooseOwnerRoot(root(),{},{kind:'pass'},{
    ...options,nativeZeroCostDenialChoice:false
  });
  assert.equal(out.intent.kind,'play-plumeria-payment-menu');
  assert.equal(out.receipt.selectedSource,'grouped-plumeria-payments');
});

test('only one opponent Active Energy prevents aggressive contested denial',()=>{
  const view=root();
  view.opponentPublic.active.energies.pop();
  const out=collectAndChooseOwnerRoot(view,{},{kind:'pass'},options);
  assert.equal(out.intent.kind,'pass');
});

test('spent native Supporter quota prevents both coheld alternatives',()=>{
  const view=root();
  view.ownTurnResources.supporterPlayedTurn=4;
  const out=collectAndChooseOwnerRoot(view,{},{kind:'pass'},options);
  assert.equal(out.intent.kind,'pass');
});

test('missing Team Flare leaves a physically payable Plumeria alone',()=>{
  const view=root();
  view.ownHand.shift();
  const out=collectAndChooseOwnerRoot(view,{},{kind:'pass'},options);
  assert.equal(out.intent.kind,'play-plumeria-payment-menu');
});
