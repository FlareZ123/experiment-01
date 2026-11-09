'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseMewGenesectQuickBallSearch}=
  require('../simulation/twinleaf/agent37/mew-genesect-quickball-search.cjs');

const offered=Object.freeze([
  {index:0,printing:'Crobat V DAA',selectableAlone:true},
  {index:1,printing:'Genesect V FST',selectableAlone:true},
  {index:2,printing:'Mew V FST',selectableAlone:true}
]);

/** @param {object[]} board Face-up physical Pokémon fixtures. */
function input(board,{
  actorSeat=1,item='Quick Ball FST',source='own-deck',
  message='CHOOSE_CARD_TO_HAND'
}={}){
  return {
    actor:{actorSeat,decisionKind:'owner-prompt',
      ownPublic:{active:board[0]??null,bench:board.slice(1),
        resolvingSupporter:[item]}},
    prompt:{source,message,offered,canSkip:true,canCancel:false}
  };
}

test('owner Quick Ball seeks Mew V as first missing attack body',()=>{
  assert.deepEqual(
    chooseMewGenesectQuickBallSearch(input([
      {printing:'Dedenne GX UNB'},null,null
    ]),1),{indices:[2]});
});

test('after Mew is in play, Quick Ball seeks an unestablished Genesect',()=>{
  assert.deepEqual(
    chooseMewGenesectQuickBallSearch(input([
      {printing:'Mew V FST'},null,null
    ]),1),{indices:[1]});
});

test('after both engine targets are established, preserve original owner search policy',()=>{
  assert.deepEqual(
    chooseMewGenesectQuickBallSearch(input([
      {printing:'Mew VMAX FST'},{printing:'Genesect V FST'}
    ]),1),{indices:[0]});
});

test('never specialize opponent, unrelated Item, or unrelated source search',()=>{
  const view=input([{printing:'Crobat V DAA'}]);
  assert.deepEqual(chooseMewGenesectQuickBallSearch(view,0),{indices:[0]});
  assert.deepEqual(chooseMewGenesectQuickBallSearch(
    input([{printing:'Crobat V DAA'}],{item:'Ultra Ball MEG'}),1),{indices:[0]});
  assert.deepEqual(chooseMewGenesectQuickBallSearch(
    input([{printing:'Crobat V DAA'}],{source:'own-discard'}),1),{indices:[0]});
  assert.deepEqual(chooseMewGenesectQuickBallSearch(
    input([{printing:'Crobat V DAA'}],{message:'CHOOSE_CARD_TO_DISCARD'}),1),
  {indices:[0]});
});
