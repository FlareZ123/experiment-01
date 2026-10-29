'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,choosePassSupporter}=require(
  '../simulation/twinleaf/agent41-rank11-source-pass-supporter.cjs');

const TURN_PHASE=321;

/**
 * Fake only owner-observable physical resources and native card legality.
 * @param {number} globalTurn
 * @param {string[]} hand
 * @param {object} [options]
 */
function fixture(globalTurn,hand,options={}){
  const state={turn:globalTurn,activePlayer:options.activePlayer??1,
    phase:options.phase??TURN_PHASE,prompts:options.pending?[{result:undefined}]:[]};
  const source={supporterTurn:options.supporterTurn??0,
    cannotPlaySupporterCards:options.locked??false,
    deck:{cards:options.deckEmpty?[]:['unknown-card-identity-not-used']},
    hand:{cards:hand.map(name=>({
      name,fullName:name==='Marnie'?'Marnie SSH':
        name==='Carmine'?'Carmine TWM':name+' UNKNOWN',
      canPlay:()=>options.canPlay??true
    }))}};
  return {state,source};
}

test('rank11 fallback chooses actor-owned Marnie only when opening-turn legal',()=>{
  assert.equal(VERSION,'agent41-rank11-owner-pass-supporter-rescue-v1');
  const f=fixture(3,['Marnie','Darkness Energy','Mega Absol ex']);
  assert.deepEqual(choosePassSupporter(f.state,f.source,1,TURN_PHASE),
    {handIndex:0,card:'Marnie',reason:'owner-low-hand-pass'});
  assert.equal(choosePassSupporter(fixture(1,['Marnie']).state,
    fixture(1,['Marnie']).source,1,TURN_PHASE),null);
  const g=fixture(2,['Marnie','Darkness Energy','Mega Absol ex','Trubbish','Oranguru V']);
  assert.equal(choosePassSupporter(g.state,g.source,1,TURN_PHASE),null,
    'Five-card owner hand should be preserved rather than blindly shuffled');
});

test('Carmine first-turn exception is deliberately low-hand and resource aware',()=>{
  const f=fixture(1,['Carmine','Darkness Energy']);
  assert.deepEqual(choosePassSupporter(f.state,f.source,1,TURN_PHASE),
    {handIndex:0,card:'Carmine',
      reason:'owner-low-hand-no-protected-companion-pass'});
  const g=fixture(1,['Carmine','Boost Shake']);
  assert.equal(choosePassSupporter(g.state,g.source,1,TURN_PHASE),null);
  const h=fixture(1,['Carmine','Garbodor']);
  assert.equal(choosePassSupporter(h.state,h.source,1,TURN_PHASE),null);
  const i=fixture(1,['Carmine','Darkness Energy','Darkness Energy']);
  assert.equal(choosePassSupporter(i.state,i.source,1,TURN_PHASE),null);
});

test('rejects locked, pending, already-used, illegal or wrong-seat source actions',()=>{
  for(const options of [
    {locked:true},{pending:true},{supporterTurn:1},
    {deckEmpty:true},{phase:-100},{activePlayer:0},{canPlay:false}
  ]){
    const f=fixture(4,['Marnie'],options);
    assert.equal(choosePassSupporter(f.state,f.source,1,TURN_PHASE),null,
      JSON.stringify(options));
  }
});

test('does not inspect opponent cards or modify source hand or native state',()=>{
  const f=fixture(5,['Marnie','Float Stone','Trubbish']);
  Object.defineProperty(f.state,'players',{get(){throw Error('opponent read')}});
  Object.freeze(f.state);
  Object.freeze(f.source.hand.cards);
  const before=JSON.stringify(f.source.hand.cards);
  assert.equal(choosePassSupporter(f.state,f.source,1,TURN_PHASE)?.card,'Marnie');
  assert.equal(JSON.stringify(f.source.hand.cards),before);
  assert.throws(()=>choosePassSupporter(f.state,f.source,2,TURN_PHASE),
    {name:'AssertionError'});
});
