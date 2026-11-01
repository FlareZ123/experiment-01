'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  sampleUniformPositions,nightWatchLikeShape,
  withUniformNightWatchOpponentSelection
}=require('../simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs');

class ChooseCardsPrompt{
  constructor(player,other){
    this.id=7;this.playerId=player.id;
    this.cards=other.hand;this.filter={};
    this.options={min:2,max:2,allowCancel:false,isSecret:true};
  }
  validate(cards){
    return cards.length===2&&cards.every(x=>this.cards.cards.includes(x));
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class Ai{
  resolvePrompt(player,state,prompt){
    return {kind:'original',playerId:player.id,promptId:prompt.id};
  }
}
const player={id:1},other={id:2,hand:{cards:[
  {id:10,name:'HIDDEN-A'}, {id:11,name:'HIDDEN-B'},
  {id:12,name:'HIDDEN-C'}, {id:13,name:'HIDDEN-D'}
]}};
const state={turn:11,players:[player,other]};

test('fixed seed yields reproducible without-replacement positions',()=>{
  const one=sampleUniformPositions(10,2,'precommitted-seed','7|0');
  assert.deepEqual(one,sampleUniformPositions(10,2,'precommitted-seed','7|0'));
  assert.equal(one.length,2);
  assert.equal(new Set(one).size,2);
  assert.ok(one.every(i=>Number.isInteger(i)&&i>=0&&i<10));
});

test('different fixed exogenous seeds do not collapse to one fixed pair',()=>{
  const positions=new Set();
  for(let i=0;i<50;i++)
    positions.add(sampleUniformPositions(7,2,
      'precommitted-'+i,'7|0').join(':'));
  assert.ok(positions.size>8);
});

test('zero-sized and complete-population physical draws work',()=>{
  assert.deepEqual(sampleUniformPositions(0,0,'seed','p'),[]);
  const all=sampleUniformPositions(3,3,'seed','p');
  assert.deepEqual([...all].sort((a,b)=>a-b),[0,1,2]);
  assert.throws(()=>sampleUniformPositions(1,2,'seed','p'));
});

test('inspects no hidden card identities before sampling positions',()=>{
  const secretCards=Array.from({length:5},(_,i)=>
    Object.defineProperty({id:i},'name',{get(){
      throw Error('hidden identity must not be evaluated');
    }}));
  const opponent={id:2,hand:{cards:secretCards}};
  const prompt=new ChooseCardsPrompt(player,opponent);
  const ai=new Ai(),before=Ai.prototype.resolvePrompt;
  const options={committedSeed:'fixed',deps:{
    SimpleTacticsAi:Ai,ResolvePromptAction
  }};
  const result=withUniformNightWatchOpponentSelection(
    ()=>ai.resolvePrompt(player,{turn:1,players:[player,opponent]},prompt),
    options);
  assert.ok(result.result instanceof ResolvePromptAction);
  assert.equal(result.result.result.length,2);
  assert.equal(result.audit.structuralCandidates,1);
  assert.equal(result.audit.selectedCount,2);
  assert.equal(Ai.prototype.resolvePrompt,before);
});

test('unrelated own-deck prompt passes unchanged',()=>{
  const prompt=new ChooseCardsPrompt(player,other);
  prompt.cards=player.deck??{cards:[]};
  const ai=new Ai(),before=Ai.prototype.resolvePrompt;
  const result=withUniformNightWatchOpponentSelection(
    ()=>ai.resolvePrompt(player,state,prompt),
    {committedSeed:'fixed',deps:{SimpleTacticsAi:Ai,ResolvePromptAction}});
  assert.equal(result.result.kind,'original');
  assert.equal(result.audit.structuralCandidates,0);
  assert.equal(Ai.prototype.resolvePrompt,before);
});

test('hook restores original method after real exception',()=>{
  const ai=new Ai(),before=Ai.prototype.resolvePrompt;
  let caught;
  try{
    withUniformNightWatchOpponentSelection(()=>{
      throw Error('native-error');
    },{committedSeed:'fixed',deps:{
      SimpleTacticsAi:Ai,ResolvePromptAction
    }});
  }catch(error){caught=error;}
  assert.match(caught.message,/native-error/);
  assert.equal(caught.agent12NightWatchRandomAudit.structuralCandidates,0);
  assert.equal(Ai.prototype.resolvePrompt,before);
});
