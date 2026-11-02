'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {cologneOpeningOpportunity}=
  require('../simulation/twinleaf/rank26-cologne-opener.cjs');
const slot=name=>({getPokemonCard:()=>({name})});
function state(lightningCount){
  const own={active:slot('Unown'),
    bench:[slot('Meloetta ex'),slot('Tapu Koko Prism Star')],
    hand:{cards:[{name:'Canceling Cologne'}]},
    discard:{cards:Array.from({length:lightningCount},
      ()=>({name:'Lightning Energy'}))}};
  return {turn:1,phase:2,activePlayer:0,
    players:[own,{active:slot('Iron Thorns ex')}]};
}
test('native owner-visible one Lightning opens Cologne only when explicitly opted in',()=>{
  const x=state(1);
  assert.equal(cologneOpeningOpportunity(x,x.players[0],0,2,
    {unlockBenchedKoko:true}),false);
  assert.equal(cologneOpeningOpportunity(x,x.players[0],0,2,
    {unlockBenchedKoko:true,minimumDiscardLightning:1}),true);
  x.players[0].discard.cards.length=0;
  assert.equal(cologneOpeningOpportunity(x,x.players[0],0,2,
    {unlockBenchedKoko:true,minimumDiscardLightning:1}),false);
});
test('legacy two Lightning threshold and Active Meloetta source path are unchanged',()=>{
  const x=state(2);
  assert.equal(cologneOpeningOpportunity(x,x.players[0],0,2,
    {unlockBenchedKoko:true}),true);
  x.players[0].discard.cards.length=0;
  x.players[0].active=slot('Meloetta ex');
  assert.equal(cologneOpeningOpportunity(x,x.players[0],0,2),true);
  x.players[1].active=slot('Iron Thorns ex');
  assert.throws(()=>cologneOpeningOpportunity(x,x.players[0],0,2,
    {minimumDiscardLightning:3}),/One or two/);
});
test('source-only Cologne refuses disabled Benched unlock, wrong owner, absent hand and wrong opponent',()=>{
  const x=state(1),own=x.players[0];
  assert.equal(cologneOpeningOpportunity(x,own,0,2),false);
  x.activePlayer=1;
  assert.equal(cologneOpeningOpportunity(x,own,0,2,
    {unlockBenchedKoko:true,minimumDiscardLightning:1}),false);
  x.activePlayer=0;
  own.hand.cards=[];
  assert.equal(cologneOpeningOpportunity(x,own,0,2,
    {unlockBenchedKoko:true,minimumDiscardLightning:1}),false);
  own.hand.cards=[{name:'Canceling Cologne'}];
  x.players[1].active=slot('Regidrago VSTAR');
  assert.equal(cologneOpeningOpportunity(x,own,0,2,
    {unlockBenchedKoko:true,minimumDiscardLightning:1}),false);
});
