'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  PINNED_TWINLEAF_COMMIT,
  wrapMimikyuApexReducer
}=require('../../simulation/twinleaf/mimikyu-apex-copycat-hook.cjs');

class FakeAttackEffect{
  constructor(player,opponent,attack,sourceCard){
    this.player=player;this.opponent=opponent;this.attack=attack;
    this.source={getPokemonCard:()=>sourceCard};
  }
}
function fixture(seat=0,{
  card='Mimikyu GRI',
  attackName='Copycat',
  lastSource='Regidrago VSTAR SIT',
  lastName='Apex Dragon',
  lastCopycatFlag=true,
  lastGXFlag=false
}={}){
  const actor={id:21+seat,fullName:card};
  const opponent={id:93+seat};
  const lastAttack={
    name:lastName,copycatAttack:lastCopycatFlag,gxAttack:lastGXFlag
  };
  const sourceCard={fullName:lastSource,attacks:[lastAttack]};
  const state={playerLastAttack:{[opponent.id]:{sourceCard,attack:lastAttack}}};
  const effect=new FakeAttackEffect(actor,opponent,{name:attackName,gxAttack:false},actor);
  const observations=[];
  function original(store,seenState,seenEffect){
    const a=seenState.playerLastAttack?.[seenEffect?.opponent?.id]?.attack;
    observations.push(a?.copycatAttack);
    return {copied:!!a&&a.copycatAttack!==true&&a.gxAttack!==true,
      sourceCard:this.fullName,attackFlagDuringReducer:a?.copycatAttack};
  }
  return {actor,opponent,lastAttack,sourceCard,state,effect,original,observations};
}
test('pinned marker and exact Mimikyu to Regidrago Apex reduction for both seats',()=>{
  assert.equal(PINNED_TWINLEAF_COMMIT,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  for(const seat of [0,1]){
    const f=fixture(seat);
    const wrapped=wrapMimikyuApexReducer(f.original,FakeAttackEffect);
    const out=wrapped.call(f.actor,{},f.state,f.effect);
    assert.equal(out.copied,true);
    assert.equal(out.attackFlagDuringReducer,false);
    assert.equal(out.sourceCard,'Mimikyu GRI');
    assert.equal(f.lastAttack.copycatAttack,true);
    assert.deepEqual(f.observations,[false]);
    assert.equal(f.sourceCard.attacks[0],f.lastAttack);
    assert.equal(f.sourceCard.attacks[0].copycatAttack,true);
    // The same original reducer must still reject unmodified copycat marker.
    const unpatched=f.original.call(f.actor,{},f.state,f.effect);
    assert.equal(unpatched.copied,false);
  }
});
test('other copied attacks, GX attacks, and wrong source printings stay blocked',()=>{
  const cases=[
    {lastSource:'Zoroark BKT',lastName:'Foul Play'},
    {lastSource:'Regidrago V SIT',lastName:'Apex Dragon'},
    {lastSource:'Regidrago VSTAR SIT',lastName:'Timeless-GX'},
    {lastSource:'Regidrago VSTAR SIT',lastName:'Apex Dragon',lastGXFlag:true}
  ];
  for(const args of cases){
    const f=fixture(0,args);
    const out=wrapMimikyuApexReducer(f.original,FakeAttackEffect)
      .call(f.actor,{},f.state,f.effect);
    assert.equal(out.copied,false);
    assert.equal(out.attackFlagDuringReducer,true);
    assert.equal(f.lastAttack.copycatAttack,true);
    assert.deepEqual(f.observations,[true]);
  }
});
test('only a real Mimikyu GRI Copycat AttackEffect with matching active source is patched',()=>{
  for(const args of [
    {card:'Mimikyu TEU'},
    {attackName:'Filch'},
    {}
  ]){
    const f=fixture(0,args);
    const wrong=(Object.keys(args).length===0)?{}:f.effect;
    const out=wrapMimikyuApexReducer(f.original,FakeAttackEffect)
      .call(f.actor,{},f.state,wrong);
    assert.equal(out.copied,false);
    assert.equal(f.lastAttack.copycatAttack,true);
  }
});
test('the engine-owned last-attack marker is restored even if original reducer throws',()=>{
  const f=fixture(1);
  let seen=false;
  const failure=wrapMimikyuApexReducer(function(store,state,effect){
    seen=true;
    assert.equal(state.playerLastAttack[effect.opponent.id].attack.copycatAttack,false);
    throw Error('native reducer failure');
  },FakeAttackEffect);
  assert.throws(()=>failure.call(f.actor,{},f.state,f.effect),/native reducer failure/);
  assert.equal(seen,true);
  assert.equal(f.lastAttack.copycatAttack,true);
  assert.equal(f.sourceCard.attacks[0].copycatAttack,true);
});
test('the adapter fails closed when native constructors or original reducer are unavailable',()=>{
  assert.throws(()=>wrapMimikyuApexReducer(null,FakeAttackEffect),/Native reducer/);
  assert.throws(()=>wrapMimikyuApexReducer(()=>{},null),/Native reducer/);
});
