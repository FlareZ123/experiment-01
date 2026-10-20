'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {shouldPivotWithRope}=
  require('../simulation/twinleaf/rank4-raichu-rope-pivot-policy.cjs');
const card=fullName=>({fullName});
const slot=fullName=>({getPokemonCard:()=>({fullName})});
function fixture(){
  const player={id:101,active:slot('Electrode-GX CES'),
    bench:[slot('Alolan Raichu UNM'),slot('Electrode-GX CES')],
    hand:{cards:[card('Escape Rope BST')]},
    discard:{cards:[
      card('Counter Energy CIN'),card('Reversal Energy PAL'),
      card('Unit Energy LPM UPR')]},
    getPrizeLeft:()=>6,cannotPlayItemCards:false,supporter:{cards:[]}};
  const opponent={id:202,getPrizeLeft:()=>6};
  return {state:{phase:4,turn:32,prompts:[],players:[player,opponent]},
    player,opponent};
}
test('source Rope proposal needs live owned Bench, discard, hand and public Prize window',()=>{
  const {state,player,opponent}=fixture();
  assert.equal(shouldPivotWithRope(state,player,4),true);
  state.phase=6;assert.equal(shouldPivotWithRope(state,player,4),false);state.phase=4;
  state.prompts=[{}];assert.equal(shouldPivotWithRope(state,player,4),false);state.prompts=[];
  player.hand.cards=[];assert.equal(shouldPivotWithRope(state,player,4),false);
  player.hand.cards=[card('Escape Rope BST')];
  player.bench=[slot('Alolan Raichu UNM')];
  assert.equal(shouldPivotWithRope(state,player,4),false);
  player.bench.push(slot('Electrode-GX CES'));
  player.discard.cards.pop();
  assert.equal(shouldPivotWithRope(state,player,4),false);
  player.discard.cards.push(card('Unit Energy LPM UPR'));
  opponent.getPrizeLeft=()=>2;
  assert.equal(shouldPivotWithRope(state,player,4),false);
  opponent.getPrizeLeft=()=>6;
  player.cannotPlayItemCards=true;
  assert.equal(shouldPivotWithRope(state,player,4),false);
  player.cannotPlayItemCards=false;
  player.active=slot('Alolan Raichu UNM');
  assert.equal(shouldPivotWithRope(state,player,4),false);
});
test('source Rope predicate cannot consult opponent private zones',()=>{
  const {state,player,opponent}=fixture();
  for(const zone of ['hand','deck','prizes']){
    Object.defineProperty(opponent,zone,{get(){throw Error('private opponent zone accessed')}});
  }
  assert.equal(shouldPivotWithRope(state,player,4),true);
});
