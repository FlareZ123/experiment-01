'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceRemovalOpportunity,withRank6HoodRemoval}=
  require('../simulation/twinleaf/rank6-hood-removal-policy.cjs');

/** @param {string} name @param {string[]} tools */
function zone(name,tools=[]){
  return {getPokemonCard:()=>name?{name,fullName:name+' PRINT'}:null,
    tools:tools.map(name=>({name,fullName:name+' PRINT'}))};
}
function fixture(){
  return {
    state:{activePlayer:0,phase:2,prompts:[]},
    source:{active:zone('Iron Thorns ex'),
      hand:{cards:[{name:'Faba'},{name:'Megaton Blower'}]}},
    opponent:{active:zone('Lillie\'s Clefairy ex'),
      bench:[zone('Shadow Rider Calyrex V',['Stealthy Hood']),
        zone('Shadow Rider Calyrex VMAX',['Float Stone']),
        zone('Shadow Rider Calyrex VMAX',['Stealthy Hood']),
        zone('Radiant Eternatus',['Stealthy Hood'])]}
  };
}
test('source held ACE SPEC preferred to Supporter against visibly Benched Hood',()=>{
  const x=fixture(),p=sourceRemovalOpportunity(x.state,x.source,x.opponent,0,2);
  assert.equal(p.card,'Megaton Blower');
  assert.deepEqual(p.targets,[{index:0,pokemon:'Shadow Rider Calyrex V PRINT',
    tool:'Stealthy Hood PRINT'},
    {index:2,pokemon:'Shadow Rider Calyrex VMAX PRINT',
      tool:'Stealthy Hood PRINT'}]);
});
test('held Faba is a separately available Supporter-only fallback',()=>{
  const x=fixture();
  x.source.hand.cards=[{name:'Faba'}];
  assert.equal(sourceRemovalOpportunity(x.state,x.source,x.opponent,0,2).card,
    'Faba');
  x.source.hand.cards=[];
  assert.equal(sourceRemovalOpportunity(x.state,x.source,x.opponent,0,2),null);
});
test('source opportunity uses Active Thorns and own turn with no pending prompt',()=>{
  const x=fixture();
  x.source.active=zone('Garbodor');
  assert.equal(sourceRemovalOpportunity(x.state,x.source,x.opponent,0,2),null);
  x.source.active=zone('Iron Thorns ex');
  x.state.activePlayer=1;
  assert.equal(sourceRemovalOpportunity(x.state,x.source,x.opponent,0,2),null);
  x.state.activePlayer=0;
  x.state.phase=3;
  assert.equal(sourceRemovalOpportunity(x.state,x.source,x.opponent,0,2),null);
  x.state.phase=2;x.state.prompts=[{result:undefined}];
  assert.equal(sourceRemovalOpportunity(x.state,x.source,x.opponent,0,2),null);
});
test('unprotected or Active-only opposing Hood is not a removal opportunity',()=>{
  const x=fixture();
  x.opponent.active=zone('Shadow Rider Calyrex VMAX',['Stealthy Hood']);
  x.opponent.bench=[zone('Shadow Rider Calyrex V'),
    zone('Shadow Rider Calyrex VMAX',['Float Stone'])];
  assert.equal(sourceRemovalOpportunity(x.state,x.source,x.opponent,0,2),null);
});
test('invalid source physical seat fails before compiled engine is loaded',()=>{
  assert.throws(()=>withRank6HoodRemoval(3,()=>{}),/Require source physical seat/);
});
