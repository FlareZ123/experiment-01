'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {shouldTryThreeDonorQuickBall,VERSION}=
  require('../simulation/twinleaf/agent25-quickball-three-donor-root-v4.cjs');

function state(){
  const pokemon=()=>({fullName:'Dhelmise M5'});
  return {
    active:{getPokemonCard:pokemon},bench:[],
    hand:{cards:[
      {fullName:'Quick Ball SSH'},
      {fullName:'Shuppet M5'},
      {fullName:'Grass Energy MEE'}
    ]},
    discard:{cards:[
      {fullName:'Banette M5'},
      {fullName:'Banette M5'},
      {fullName:'Sinistcha M5'}
    ]},
    deck:{cards:[{fullName:'Unobserved owner-deck contents'}]}
  };
}

test('v4 only proposes a possible Quick Ball root at exact three visible HNS donors',()=>{
  assert.match(VERSION,/three-donor-root/);
  assert.equal(shouldTryThreeDonorQuickBall(state()),true);
  const missingBall=state();
  missingBall.hand.cards.shift();
  assert.equal(shouldTryThreeDonorQuickBall(missingBall),false);
  const missingDonor=state();
  missingDonor.hand.cards.splice(1,1);
  assert.equal(shouldTryThreeDonorQuickBall(missingDonor),false);
  const belowThreshold=state();
  belowThreshold.discard.cards.pop();
  assert.equal(shouldTryThreeDonorQuickBall(belowThreshold),false);
  const aboveThreshold=state();
  aboveThreshold.discard.cards.push({fullName:'Shuppet M5'});
  assert.equal(shouldTryThreeDonorQuickBall(aboveThreshold),false);
  const noDhelmise=state();
  noDhelmise.active.getPokemonCard=()=>({fullName:'Unown AOR'});
  assert.equal(shouldTryThreeDonorQuickBall(noDhelmise),false);
  const emptyDeck=state();
  emptyDeck.deck.cards=[];
  assert.equal(shouldTryThreeDonorQuickBall(emptyDeck),false);
});

test('v4 pure trigger never reads opponent private information',()=>{
  const x=state();
  const boobytrap=new Proxy({},{
    get(){throw new Error('Opponent private zones must never be accessed');}
  });
  x.opponent=boobytrap;
  assert.equal(shouldTryThreeDonorQuickBall(x),true);
});
