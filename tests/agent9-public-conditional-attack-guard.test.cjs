'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {permitsNominalKoPriority}=require('../simulation/twinleaf/agent9-public-conditional-attack-guard.cjs');

const attack={text:'If there is no Stadium in play, this attack does nothing.'};
const board=(a=[],b=[])=>({ownPublic:{stadium:a},opponentPublic:{stadium:b}});

test('Stadium-required Fan Rotom attack is not a guaranteed KO without Stadium',()=>{
  assert.equal(permitsNominalKoPriority(board(),attack),false);
  assert.equal(permitsNominalKoPriority(board(['Tropical Beach']),attack),true);
  assert.equal(permitsNominalKoPriority(board([],['Temple of Sinnoh']),attack),true);
});

test('unknown conditional zero-damage attack is conservatively excluded',()=>{
  assert.equal(permitsNominalKoPriority(board(),
    {text:'If tails, this attack does nothing.'}),false);
  assert.equal(permitsNominalKoPriority(board(),{text:''}),true);
});

test('public-only decision does not inspect or mutate hidden state',()=>{
  const view=board();
  Object.defineProperty(view,'opponentSecret',{get(){
    throw Error('Concealed opponent hand was read');
  }});
  assert.equal(permitsNominalKoPriority(view,attack),false);
});
