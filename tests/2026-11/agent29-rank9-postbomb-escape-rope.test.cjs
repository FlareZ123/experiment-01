'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePostBombRope,ELECTRODE,MEGA,ROPE}=
  require('../../simulation/twinleaf/2026-11/agent29-rank9-postbomb-escape-rope.cjs');

/** @param {string|null} name @param {number} attached */
function slot(name,attached=0){
  return {getPokemonCard:()=>name?{fullName:name}:null,
    energies:{cards:Array.from({length:attached},()=>({fullName:'Darkness Energy'}))}};
}
/** @param {0|1} [seat] */
function fixture(seat=0){
  const source={
    cannotPlayItemCards:false,
    hand:{cards:[{fullName:ROPE},{fullName:'Boss Orders'}]},
    active:slot('Gengar & Mimikyu-GX TEU',1),
    bench:[slot('Dedenne-GX UNB'),slot(MEGA,3),slot('Unown LOT')],
    discard:{cards:[{fullName:ELECTRODE}]},
    getPrizeLeft:()=>6
  };
  const opposing={
    bench:[slot('Trevenant & Dusknoir-GX SPM')],
    getPrizeLeft:()=>4
  };
  return {activePlayer:seat,players:seat===0?
      [source,opposing]:[opposing,source],prompts:[]};
}
test('authentic post-Bomb physical source hand, target and opponent Bench',()=>{
  assert.deepEqual(choosePostBombRope(fixture(),0),{
    handIndex:0,megaBenchIndex:1
  });
});
test('both physical source-seat orientations are equivalent',()=>{
  assert.deepEqual(choosePostBombRope(fixture(1),1),{
    handIndex:0,megaBenchIndex:1
  });
});
test('an Electrodes absence cannot be treated as an accomplished paid Bomb',()=>{
  const s=fixture();s.players[0].discard.cards=[];
  assert.equal(choosePostBombRope(s,0),null);
});
test('an unfunded Mega or absent original Mega cannot switch for a paid attack',()=>{
  const s=fixture();s.players[0].bench[1]=slot(MEGA,2);
  assert.equal(choosePostBombRope(s,0),null);
  s.players[0].bench[1]=slot('Voltorb ROS',3);
  assert.equal(choosePostBombRope(s,0),null);
});
test('opponent chooses a Bench replacement so no opponent Bench prohibits Rope',()=>{
  const s=fixture();s.players[1].bench=[];
  assert.equal(choosePostBombRope(s,0),null);
});
test('Rope only when held by the source owner and Items accessible',()=>{
  const s=fixture();s.players[0].hand.cards.shift();
  assert.equal(choosePostBombRope(s,0),null);
  s.players[0].hand.cards.unshift({fullName:ROPE});
  s.players[0].cannotPlayItemCards=true;
  assert.equal(choosePostBombRope(s,0),null);
});
test('rejects before the two-Prize Bomb payment and during a pending prompt',()=>{
  const s=fixture();s.players[1].getPrizeLeft=()=>6;
  assert.equal(choosePostBombRope(s,0),null);
  s.players[1].getPrizeLeft=()=>4;
  s.prompts=[{result:undefined}];
  assert.equal(choosePostBombRope(s,0),null);
  s.prompts=[];
  s.activePlayer=1;
  assert.equal(choosePostBombRope(s,0),null);
});
test('already active Mega or opponent with no remaining Prizes is not eligible',()=>{
  const s=fixture();s.players[0].active=slot(MEGA,3);
  assert.equal(choosePostBombRope(s,0),null);
  s.players[0].active=slot('Gengar & Mimikyu-GX TEU',1);
  s.players[1].getPrizeLeft=()=>0;
  assert.equal(choosePostBombRope(s,0),null);
});
