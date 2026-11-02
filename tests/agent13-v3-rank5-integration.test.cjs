'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const {chooseActorCopiedAttack}=
  require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

/** @param {string} name @param {Array<object>} selected */
function mock(name,selected){
  return (run,options)=>{
    selected.push({name,options:options??null});
    return {result:run(),audit:{version:name,accepted:1}};
  };
}

function compose(enabled){
  const selected=[];
  const handlers=Object.fromEntries(['root','fog','select','option','attack']
    .map(name=>[name,mock(name,selected)]));
  const actual=withCanonicalActorOnlyPolicy(()=>({native:'preserved'}),
    handlers,{preferMewGenesectTechnoBlast:enabled});
  return {selected,actual};
}

test('existing policy remains default-off; same output and no attack option',()=>{
  const out=compose(false);
  assert.deepEqual(out.actual.result,{native:'preserved'});
  assert.equal(out.selected.find(x=>x.name==='attack').options,null);
  assert.equal(out.actual.audit.qualification.competitiveGames,0);
});

test('rank5 candidate v3 passes the explicit copy preference to the same both-seat handler',()=>{
  const out=compose(true);
  assert.deepEqual(out.actual.result,{native:'preserved'});
  assert.deepEqual(out.selected.find(x=>x.name==='attack').options,
    {preferMewGenesectTechnoBlast:true});
  assert.equal(out.selected.filter(x=>x.name==='attack').length,1);
  assert.equal(out.actual.audit.qualification.competitiveGames,0);
});

test('Mew VMAX donor choice ignores menu order and opposing concealed data',()=>{
  const choose=(offered,other)=>chooseActorCopiedAttack({
    actor:{decisionKind:'owner-prompt',ownPublic:{
      active:{printing:'Mew VMAX FST'},
      publicTurnRestrictions:{gxUsed:false}},
      opponentPublic:{handCount:4}},
    prompt:{kind:'ChooseAttackPrompt',allowCancel:false,offered},
    opponentPrivateHand:other
  },{preferMewGenesectTechnoBlast:true});
  const mew={index:0,printing:'Mew V FST',attacks:[
    {index:0,name:'Energy Mix',damage:0,blocked:false}]};
  const gene={index:1,printing:'Genesect V FST',attacks:[
    {index:0,name:'Techno Blast',damage:210,blocked:false}]};
  assert.deepEqual(choose([mew,gene],['SECRET_1']),
    {sourceIndex:1,attackIndex:0});
  assert.deepEqual(choose([{...gene,index:0},{...mew,index:1}],['SECRET_2']),
    {sourceIndex:0,attackIndex:0});
  gene.attacks[0].blocked=true;
  assert.deepEqual(choose([mew,gene],['SECRET_3']),
    {sourceIndex:0,attackIndex:0});
});
