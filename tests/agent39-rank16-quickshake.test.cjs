'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {quickToShakeK0Offer,VERSION}=
  require('../simulation/twinleaf/agent39-rank16-quickshake.cjs');

/** @param {string} name @param {string|null} fullName */
function card(name,fullName=null){return {name,fullName:fullName??name+' PHF'};}
/** @param {string|null} name */
function slot(name){return {getPokemonCard:()=>name?{name}:null};}
/** @param {string[]} names */
function fixture(names){
  const cards=names.map(name=>card(name,name==='Quick Ball'?'Quick Ball FST':null));
  const player={hand:{cards},active:slot('Crobat V'),
    bench:[slot(null),slot(null),slot(null),slot(null),slot(null)],
    cannotPlayItemCards:false,cannotPlayToolCards:false};
  const state={turn:2,activePlayer:1,phase:7};
  return {player,state,cards};
}
const names=[
  'Quick Ball','Boost Shake','Float Stone',
  'Darkness Energy','Darkness Energy','Guzma'
];

test('one source-only real first-turn owner Quick Ball offer retains Shake and Tool',()=>{
  const {player,state,cards}=fixture(names);
  const offer=quickToShakeK0Offer(state,player,1,7);
  assert.ok(VERSION.includes('rank16'));
  assert.equal(offer.quickIndex,0);
  assert.equal(offer.tool,'Float Stone');
  assert.strictEqual(offer.discard,cards[3]);
  assert.notStrictEqual(offer.discard,cards[1]);
  assert.notStrictEqual(offer.discard,cards[2]);
});

test('no look into hidden owner deck or prizes or opponent private cards',()=>{
  const {player,state}=fixture(names);
  Object.defineProperty(player,'deck',{get(){throw Error('deck was secretly read');}});
  Object.defineProperty(player,'prizes',{get(){throw Error('prize was secretly read');}});
  Object.defineProperty(state,'opponent',{get(){throw Error('other player private read');}});
  assert.ok(quickToShakeK0Offer(state,player,1,7));
});

test('Quick Ball alone cannot replace held Shake+Tool+payment',()=>{
  const f=fixture(['Quick Ball','Boost Shake','Float Stone']);
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
  f.player.hand.cards.push(card('Darkness Energy'));
  assert.ok(quickToShakeK0Offer(f.state,f.player,1,7));
  f.player.hand.cards=f.player.hand.cards.filter(c=>c.name!=='Boost Shake');
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
});

test('existing in-play Trubbish routes defer to proven direct policy',()=>{
  for(const position of ['active','bench']){
    const f=fixture(names);
    if(position==='active')f.player.active=slot('Trubbish');
    else f.player.bench[0]=slot('Trubbish');
    assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
  }
  const f=fixture([...names,'Trubbish']);
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
});

test('held first-turn Battle VIP Pass route defers to direct native policy',()=>{
  const f=fixture([...names,'Battle VIP Pass']);
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
});

test('public first-own turn and Item/Tool plays are gating conditions',()=>{
  const f=fixture(names);
  f.state.turn=3;
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
  f.state.turn=2;f.state.activePlayer=0;
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
  f.state.activePlayer=1;f.state.phase=9;
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
  f.state.phase=7;f.player.cannotPlayItemCards=true;
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
  f.player.cannotPlayItemCards=false;f.player.cannotPlayToolCards=true;
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
});

test('source with full Bench cannot bridge Quick Ball into Trubbish',()=>{
  const f=fixture(names);
  f.player.bench=Array.from({length:5},()=>slot('Crobat V'));
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
});

test('protect all hand copies of a key singleton by identity where possible',()=>{
  const f=fixture([
    'Quick Ball','Boost Shake','Float Stone','Secret Box','Darkness Energy'
  ]);
  const offer=quickToShakeK0Offer(f.state,f.player,1,7);
  assert.equal(offer.discard.name,'Darkness Energy');
  assert.notEqual(offer.discard.name,'Secret Box');
});

test('source all Garbodor held cannot truthfully assume deck Garbodor exists',()=>{
  const f=fixture([...names,'Garbodor','Garbodor','Garbodor']);
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
});

test('K0 physical cost prefers extra Quick Ball and not held exact first',()=>{
  const f=fixture([
    'Quick Ball','Boost Shake','Muscle Band','Quick Ball','Darkness Energy'
  ]);
  const offer=quickToShakeK0Offer(f.state,f.player,1,7);
  assert.strictEqual(offer.discard,f.cards[3]);
  assert.equal(offer.tool,'Muscle Band');
  assert.equal(offer.quickIndex,0);
});

test('all registered paper source Quick Ball printings share K0 gate',()=>{
  const f=fixture(names);
  f.cards[0].fullName='Quick Ball SSH';
  assert.ok(quickToShakeK0Offer(f.state,f.player,1,7));
  f.cards[0].fullName='Quick Ball RPC';
  assert.equal(quickToShakeK0Offer(f.state,f.player,1,7),null);
});
