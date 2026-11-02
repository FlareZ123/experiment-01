'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {isPublicBasicAbilityLocked}=require(
  '../simulation/twinleaf/agent14-owner-farewell-letter.cjs');

const view=()=>({
  ownPublic:{active:{printing:'Unown AOR',abilities:['Farewell Letter']},
    bench:[],stadium:[]},
  opponentPublic:{active:null,bench:[],stadium:[]}
});

test('either Active Klefki blocks basic Abilities',()=>{
  for(const side of ['ownPublic','opponentPublic']){
    const v=view();
    v[side].active={printing:'Klefki SVI',abilities:['Mischievous Lock']};
    assert.equal(isPublicBasicAbilityLocked(v),true);
  }
});
test('either Bench Power of Alchemy suppresses Unown',()=>{
  for(const side of ['ownPublic','opponentPublic']){
    const v=view();
    v[side].bench=[{printing:'Alolan Muk SUM',abilities:['Power of Alchemy']}];
    assert.equal(isPublicBasicAbilityLocked(v),true);
  }
});
test('Garbotoxin requires a visible Tool',()=>{
  const v=view();
  const p={printing:'Garbodor BKP',abilities:['Garbotoxin'],tools:[]};
  v.opponentPublic.bench=[p];
  assert.equal(isPublicBasicAbilityLocked(v),false);
  p.tools=['Float Stone BKT'];
  assert.equal(isPublicBasicAbilityLocked(v),true);
});
test('opposing Neutralizing Gas blocks Unown, own does not',()=>{
  const v=view();
  const p={printing:'Galarian Weezing RCL',abilities:['Neutralizing Gas']};
  v.opponentPublic.active=p;
  assert.equal(isPublicBasicAbilityLocked(v),true);
  v.opponentPublic.active=null;
  v.ownPublic.active=p;
  assert.equal(isPublicBasicAbilityLocked(v),false);
});
test('Iron Thorns Rule Box lock does not block non-Rule Box Unown',()=>{
  const v=view();
  v.opponentPublic.active={
    printing:'Iron Thorns ex TWM',abilities:['Initialization']};
  assert.equal(isPublicBasicAbilityLocked(v),false);
});
