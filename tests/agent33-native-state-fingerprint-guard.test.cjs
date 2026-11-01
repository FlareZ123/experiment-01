'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createNativeStateFingerprintGuard}=
  require('../simulation/twinleaf/agent33-native-state-fingerprint-guard.cjs');

function state(){
  const hiddenCard={name:'Hidden Psychic',damage:0};
  const active={name:'Dratini',energy:[],damage:0};
  const source={
    hand:{cards:[{name:'Plumeria BUS'}, {name:'Team Flare Grunt XY'}]},
    deck:{cards:[hiddenCard,{name:'Second Hidden'}]},
    prizes:[{cards:[{name:'Secret prize'}]}],
    active,bench:[],supporterTurn:0
  };
  const rival={hand:{cards:[]},deck:{cards:[]},
    prizes:[],active:{name:'Rival',energy:[]}};
  const result={players:[source,rival],turn:2,activePlayer:0,
    prompts:[],previous:null};
  result.previous=result;
  return result;
}

test('same cyclic native graph with equal own data hashes identically',()=>{
  const fixture=state(),guard=createNativeStateFingerprintGuard();
  const first=guard.digest(fixture);
  assert.match(first,/^[0-9a-f]{64}$/);
  assert.equal(guard.digest(fixture),first);
});

test('a native canPlay private deck or prize mutation changes full-state proof',()=>{
  const fixture=state(),guard=createNativeStateFingerprintGuard();
  const first=guard.digest(fixture);
  fixture.players[0].deck.cards[0].name='Changed concealed card';
  assert.notEqual(guard.digest(fixture),first);
  fixture.players[0].deck.cards[0].name='Hidden Psychic';
  assert.equal(guard.digest(fixture),first);
  fixture.players[0].prizes[0].cards[0].name='Changed prize';
  assert.notEqual(guard.digest(fixture),first);
});

test('a card clone with identical properties changes physical reference proof',()=>{
  const fixture=state(),guard=createNativeStateFingerprintGuard();
  const before=guard.digest(fixture);
  fixture.players[0].deck.cards[0]=
    {...fixture.players[0].deck.cards[0]};
  assert.notEqual(guard.digest(fixture),before);
});

test('native energy attachment, prompt and supporter changes are captured',()=>{
  const fixture=state(),guard=createNativeStateFingerprintGuard();
  const original=guard.digest(fixture);
  fixture.players[0].active.energy.push({name:'Psychic Energy'});
  assert.notEqual(guard.digest(fixture),original);
  fixture.players[0].active.energy.length=0;
  assert.equal(guard.digest(fixture),original);
  fixture.players[0].supporterTurn=2;
  assert.notEqual(guard.digest(fixture),original);
});

test('accessor is observed by its presence without invoking a getter',()=>{
  const fixture=state(),guard=createNativeStateFingerprintGuard();
  let reads=0;
  Object.defineProperty(fixture.players[0],'unsafe',{
    enumerable:true,get(){reads++;throw Error('must not call getter');}
  });
  assert.match(guard.digest(fixture),/^[0-9a-f]{64}$/);
  assert.equal(reads,0);
});

test('cyclic Maps and Sets are deterministic, mutable contents detected',()=>{
  const fixture=state(),guard=createNativeStateFingerprintGuard();
  fixture.controlMap=new Map([['one',new Set(['A','B'])]]);
  const old=guard.digest(fixture);
  assert.equal(guard.digest(fixture),old);
  fixture.controlMap.get('one').add('C');
  assert.notEqual(guard.digest(fixture),old);
});
