'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {STONE,stoneHolder}=
  require('../simulation/twinleaf/candidate-stone-star-alchemy-policy.cjs');
const SELF=2,V=['V','VMAX','VSTAR','V-UNION'];
const pokemon=(name,tags=[],stone=false)=>({
  pokemon:{fullName:name,tags},
  slot:{tools:stone?[{fullName:STONE}]:[]}
});
const mock=(mons,usedVSTAR=false,deckLength=8)=>({
  usedVSTAR,deck:{cards:Array(deckLength).fill(null)},
  forEachPokemon(type,fn){
    assert.equal(type,SELF);
    mons.forEach((m,i)=>fn(m.slot,m.pokemon,{player:SELF,slot:i?2:1,index:i-1}));
  }
});

test('no Stone, non-V holder or exhausted deck yields no proposed ability',()=>{
  const ex=pokemon('Latias ex SSP',['ex'],true);
  const v=pokemon('Galarian Articuno V CRE',['V'],false);
  assert.equal(stoneHolder(mock([ex,v]),SELF,V),null);
  assert.equal(stoneHolder(mock([pokemon('Latias ex SSP',['ex'],true)]),SELF,V),null);
  assert.equal(stoneHolder(mock([pokemon('Articuno V',['V'],true)],false,0),SELF,V),null);
});
test('unspent Stone on eligible V creates precisely one owned target',()=>{
  const p=mock([pokemon('Latias ex SSP',['ex'],true),
    pokemon('Galarian Articuno V CRE',['V'],true)]);
  assert.deepEqual(stoneHolder(p,SELF,V),
    {player:SELF,slot:2,index:0});
});
test('already used VSTAR cannot propose again',()=>{
  const p=mock([pokemon('Galarian Articuno V CRE',['V'],true)],true);
  assert.equal(stoneHolder(p,SELF,V),null);
});
test('VMAX and VSTAR are legal V-family Tool Power holders',()=>{
  const p=mock([pokemon('VMAX',['VMAX'],true),pokemon('VSTAR',['VSTAR'],true)]);
  assert.deepEqual(stoneHolder(p,SELF,V),{player:SELF,slot:1,index:-1});
});
