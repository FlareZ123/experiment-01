'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceFabaHoodPromptChoice:choose}=
  require('../simulation/twinleaf/rank6-faba-hood-target.cjs');

function zone(name,tools=[]){
  return {getPokemonCard:()=>({name,fullName:name+' TEST'}),
    tools:tools.map(name=>({name,fullName:name+' TEST'}))};
}
function fixture(){
  const source={id:101};
  const opponent={bench:[
    zone('Shadow Rider Calyrex V',['Stealthy Hood']),
    zone('Shadow Rider Calyrex VMAX',['Float Stone','Stealthy Hood']),
    zone('Radiant Eternatus',['Stealthy Hood'])
  ]};
  return {state:{players:[source,opponent]},source,opponent};
}
function prompt(name,message,source,extra={}){
  return {constructor:{name},playerId:source.id,message,result:undefined,
    validate:()=>true,...extra};
}
test('source-owned Faba selects Tool by menu value rather than assuming slot 0',()=>{
  const x=fixture();
  const p=prompt('SelectPrompt','DISCARD_STADIUM_OR_TOOL_OR_SPECIAL_ENERGY',
    x.source,{values:['CHOICE_STADIUM','CHOICE_SPECIAL_ENERGY','CHOICE_TOOL']});
  const d=choose({...x,prompt:p,stage:'choice'});
  assert.equal(d.result,2);
  assert.equal(d.nextStage,'pokemon');
});
test('source Faba targets a publicly tooled VMAX ahead of a V or unrelated Hood',()=>{
  const x=fixture();
  const p=prompt('ChoosePokemonPrompt','CHOOSE_POKEMON_TO_DISCARD_CARDS',
    x.source);
  const d=choose({...x,prompt:p,stage:'pokemon'});
  assert.deepEqual(d.result,[x.opponent.bench[1]]);
  assert.equal(d.nextStage,'tool');
});
test('Faba target obeys original pinned prompt validation and blocked zones',()=>{
  const x=fixture();
  const p=prompt('ChoosePokemonPrompt','CHOOSE_POKEMON_TO_DISCARD_CARDS',
    x.source,{validate:selected=>selected[0]!==x.opponent.bench[1]});
  const d=choose({...x,prompt:p,stage:'pokemon'});
  assert.deepEqual(d.result,[x.opponent.bench[0]]);
  p.validate=()=>false;
  assert.equal(choose({...x,prompt:p,stage:'pokemon'}),null);
});
test('multi-tool prompt chooses exact Stealthy Hood and requires matching live zone',()=>{
  const x=fixture(),target=x.opponent.bench[1];
  const p=prompt('ChooseCardsPrompt','CHOOSE_CARD_TO_DISCARD',x.source,
    {cards:target,validate:cards=>cards[0].name==='Stealthy Hood'});
  const d=choose({...x,prompt:p,stage:'tool',targetZone:target});
  assert.equal(d.result[0],target.tools[1]);
  assert.equal(d.nextStage,'done');
  p.cards=x.opponent.bench[0];
  assert.equal(choose({...x,prompt:p,stage:'tool',targetZone:target}),null);
});
test('unrelated, opponent-owned, resolved, or unexpected prompts are never hijacked',()=>{
  const x=fixture(),p=prompt('SelectPrompt','DISCARD_STADIUM_OR_TOOL_OR_SPECIAL_ENERGY',
    x.source,{values:['CHOICE_TOOL']});
  p.playerId=202;
  assert.equal(choose({...x,prompt:p,stage:'choice'}),null);
  p.playerId=101;p.result=0;
  assert.equal(choose({...x,prompt:p,stage:'choice'}),null);
  p.result=undefined;p.message='CHOOSE_OPTION';
  assert.equal(choose({...x,prompt:p,stage:'choice'}),null);
  p.message='DISCARD_STADIUM_OR_TOOL_OR_SPECIAL_ENERGY';
  p.values=['CHOICE_STADIUM'];
  assert.equal(choose({...x,prompt:p,stage:'choice'}),null);
  assert.equal(choose({...x,prompt:p,stage:'done'}),null);
  assert.equal(choose({...x,prompt:null,stage:'choice'}),null);
});
