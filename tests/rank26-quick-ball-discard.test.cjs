'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preferredQuickBallIonoCost}=
  require('../simulation/twinleaf/rank26-quick-ball-discard.cjs');
function fixture(){
  const iono={name:'Iono',fullName:'Iono PAL'};
  const ace={name:'Dowsing Machine',fullName:'Dowsing Machine PLS'};
  const own={id:101,hand:{cards:[iono,ace]},deck:{cards:[]}};
  const state={turn:1,activePlayer:0,phase:12,players:[own,{id:202}]};
  const prompt={id:42,playerId:101,cards:{cards:[iono,ace]},
    validate:cards=>cards.length===1&&cards[0]===iono};
  Object.defineProperty(prompt,'constructor',{value:{name:'ChooseCardsPrompt'}});
  return {iono,ace,own,state,prompt};
}
test('choose Iono only from genuine legal owner-hand cost prompt',()=>{
  const {iono,own,state,prompt}=fixture();
  assert.equal(preferredQuickBallIonoCost(state,own,0,prompt,12),iono);
});
test('restrict by physical seat, player turn, phase, and owner deck',()=>{
  const {own,state,prompt}=fixture();
  assert.equal(preferredQuickBallIonoCost(state,own,1,prompt,12),null);
  state.turn=2;
  assert.equal(preferredQuickBallIonoCost(state,own,0,prompt,12),null);
  state.turn=1;state.phase=13;
  assert.equal(preferredQuickBallIonoCost(state,own,0,prompt,12),null);
  state.phase=12;prompt.cards=own.deck;
  assert.equal(preferredQuickBallIonoCost(state,own,0,prompt,12),null);
});
test('protect ACE SPEC only when both real cards and valid Iono are present',()=>{
  const {iono,ace,own,state,prompt}=fixture();
  own.hand.cards.pop();
  assert.equal(preferredQuickBallIonoCost(state,own,0,prompt,12),null);
  own.hand.cards.push(ace);
  prompt.validate=()=>false;
  assert.equal(preferredQuickBallIonoCost(state,own,0,prompt,12),null);
  prompt.validate=()=>true;
  prompt.cards.cards=[ace];
  assert.equal(preferredQuickBallIonoCost(state,own,0,prompt,12),null);
  prompt.cards.cards=[iono,ace];
  prompt.playerId=202;
  assert.equal(preferredQuickBallIonoCost(state,own,0,prompt,12),null);
});
test('refuse prompts containing references outside the actual hand',()=>{
  const {own,state,prompt}=fixture();
  prompt.cards.cards.push({name:'Quick Ball',fullName:'Quick Ball FST'});
  assert.equal(preferredQuickBallIonoCost(state,own,0,prompt,12),null);
});
