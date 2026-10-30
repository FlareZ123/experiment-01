'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  firstTurnRank6DceStageOpportunity,
  firstTurnRank6SpeedStageOpportunity,
  planOpeningHand,chooseOpeningDiscards,
  missingTagCallK1Requirements
}=require('../simulation/twinleaf/rank6-broad-thorns-policy.cjs');

function owner(){
  return {
    active:{getPokemonCard:()=>({name:'Iron Thorns ex'})},
    hand:{cards:[
      {name:'Tag Call'},{name:'Double Colorless Energy'},
      {name:'Plumeria'},{name:'Plumeria'},
      {name:'Lusamine'},{name:'Capture Energy'}
    ]},
    energyPlayedTurn:0,
    cannotPlayEnergyCards:false,cannotPlaySpecialEnergyCards:false
  };
}
test('T1 source first-player DCE staging only reads public phase and own hand',()=>{
  const p=owner(),s={turn:1,activePlayer:0,phase:7};
  assert.equal(firstTurnRank6DceStageOpportunity(s,p,0,7),true);
  assert.equal(firstTurnRank6DceStageOpportunity(s,p,1,7),false);
  assert.equal(firstTurnRank6DceStageOpportunity({...s,turn:3},p,0,7),false);
  assert.equal(firstTurnRank6DceStageOpportunity(s,p,0,8),false);
  p.energyPlayedTurn=1;
  assert.equal(firstTurnRank6DceStageOpportunity(s,p,0,7),false);
  p.energyPlayedTurn=0;
  p.cannotPlaySpecialEnergyCards=true;
  assert.equal(firstTurnRank6DceStageOpportunity(s,p,0,7),false);
  p.cannotPlaySpecialEnergyCards=false;
  p.hand.cards=p.hand.cards.filter(c=>c.name!=='Double Colorless Energy');
  assert.equal(firstTurnRank6DceStageOpportunity(s,p,0,7),false);
  assert.equal(firstTurnRank6SpeedStageOpportunity(s,p,0,7),false);
});
test('T3 original hand with DCE already attached can fetch G&H and seek Stadium at K0',()=>{
  const p=owner();
  const hand=p.hand.cards.filter(c=>c.name!=='Double Colorless Energy');
  const intent=planOpeningHand(hand,false,undefined,false,{
    activeDceAttached:true,activeLiveLightningAttached:false,
    itemLocked:false,supporterLocked:false
  });
  assert.deepEqual(intent,{
    channel:'tag-call-to-guzma-hala',needDce:false,
    needThunder:true,discardCount:0
  });
});
test('K1 missing Thunder and held DCE are distinct from disposable payment cards',()=>{
  const p=owner();
  const plan={needThunder:true,needDce:false};
  const actualOwnDeck=[
    {name:'Speed Lightning Energy'},{name:'Guzma & Hala'},
    {name:'Crushing Hammer'}
  ];
  const missing=missingTagCallK1Requirements(
    plan,actualOwnDeck,p.hand.cards);
  assert.deepEqual(missing,['Thunder Mountain Prism Star']);
  const payments=chooseOpeningDiscards(p.hand.cards);
  assert.equal(payments.length,2);
  assert.equal(new Set(payments).size,2);
  assert.ok(payments.every(c=>c.name==='Plumeria'));
  assert.ok(actualOwnDeck.some(c=>c.name==='Speed Lightning Energy'));
});
