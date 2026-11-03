'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {exeggcutePumpMoves,opponentHasLiveBench}=
  require('../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs');

/** @param {string|null} name @param {number} damage */
function slot(name,damage){
  return {damage,getPokemonCard(){return name?{name}:null;}};
}

/** Only public source card placement is observed. */
function board(){
  const p={bench:[
    slot('Meloetta ex',0),
    slot('Tapu Koko Prism Star',0),
    slot('Exeggcute',20),
    slot('Exeggcute',20),
    slot(null,0)
  ]};
  for(const key of ['deck','prizes','hand']){
    Object.defineProperty(p,key,{get(){throw new Error(
      'Egg-to-Egg policy must not consult '+key);}});
  }
  return p;
}

test('fifth self-KO has one precise EggB to EggA transfer only when opted in',()=>{
  const x=board();
  assert.equal(exeggcutePumpMoves(x,2,2,2),null,
    'existing profile must remain conservative');
  assert.deepEqual(exeggcutePumpMoves(x,2,2,2,true),[{
    from:{player:2,slot:2,index:3},
    to:{player:2,slot:2,index:2}
  }]);
});

test('one Prize remains: never donate a sixth self-KO',()=>{
  assert.equal(exeggcutePumpMoves(board(),2,2,1,true),null);
  assert.equal(exeggcutePumpMoves(board(),2,2,0,true),null);
});

test('earlier Prize counts and missing/partially damaged Eggs fail closed',()=>{
  const x=board();
  assert.equal(exeggcutePumpMoves(x,2,2,3,true),null);
  x.bench[3].damage=10;
  assert.equal(exeggcutePumpMoves(x,2,2,2,true),null);
  x.bench[3]=slot(null,0);
  assert.equal(exeggcutePumpMoves(x,2,2,2,true),null);
});

test('available non-Egg donor takes priority over opt-in Egg donor',()=>{
  const x=board();
  x.bench[0].damage=10;
  assert.deepEqual(exeggcutePumpMoves(x,2,2,2,true),[{
    from:{player:2,slot:2,index:0},
    to:{player:2,slot:2,index:2}
  }]);
});

test('opponent Bench publicly vetoes the dangerous singleton terminal theory',()=>{
  const source=board();
  const state={players:[source,{bench:[slot(null,0),slot(null,0)]}]};
  assert.equal(opponentHasLiveBench(state,0),false);
  state.players[1].bench[1]=slot('Duskull',0);
  assert.equal(opponentHasLiveBench(state,0),true);
});
