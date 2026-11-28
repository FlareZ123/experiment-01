'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseRank13CrispinContinuation:choose}=
  require('../../simulation/evaluation/2026-11/agent47-rank13-crispin-prompt-continuation.cjs');
const {projectRank13CrispinPrompt:project}=
  require('../../simulation/evaluation/2026-11/agent47-rank13-crispin-attach-projection.cjs');

function request(seat=0) {
  return {role:'opponent',seat,
    observation:{actorSeat:seat,decisionKind:'owner-prompt',
      ownPublic:{active:{printing:'Regidrago VSTAR SIT 136'}}},
    prompt:{
      promptType:'ChooseCardsPrompt',
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:'Crispin SCR',effectName:'Crispin'},
      publicMetadata:{selectionType:'card-combination',ownerSeat:'actor',
        sourceZone:'deck',isOwnerVisible:true,minimumCount:0,maximumCount:2},
      choices:[
        {token:'grass1',kind:'card',printing:'Grass Energy MEE',publicMetadata:{sourceZone:'deck'}},
        {token:'grass2',kind:'card',printing:'Grass Energy MEE 9'},
        {token:'fire1',kind:'card',printing:'Fire Energy MEE 10'},
        {token:'fire2',kind:'card',printing:'Fire Energy MEE 10'}]
    }};
}
function attachmentRequest(seat=0) {
  const r=request(seat);
  r.prompt={
    promptType:'AttachEnergyPrompt',source:r.prompt.source,
    publicMetadata:{selectionType:'energy-attachment',ownerSeat:'actor',
      sourceZone:'effect-revealed',isOwnerVisible:true,minimumCount:1,maximumCount:1},
    choices:[
      {token:'fire-active',kind:'energy',printing:'Fire Energy MEE',
        publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
          zone:'active',sourceZone:'effect-revealed'}},
      {token:'grass-bench',kind:'energy',printing:'Grass Energy MEE',
        publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
          zone:'bench',sourceZone:'effect-revealed'}},
      {token:'grass-active',kind:'energy',printing:'Grass Energy MEE',
        publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
          zone:'active',sourceZone:'effect-revealed'}}]
  };
  return r;
}
for(const seat of [0,1]) {
  test('seat '+seat+': Crispin chooses one Grass and one Fire, not two Grass',()=>{
    const r=request(seat);
    assert.deepEqual(choose(r),{kind:'select-choices',tokens:['grass1','fire1']});
  });
  test('seat '+seat+': Crispin attaches selected Grass to active Regidrago',()=>{
    const r=attachmentRequest(seat);
    assert.deepEqual(choose(r),{kind:'select-choice',token:'grass-active'});
  });
}
test('Crispin search explicitly abstains when no different-type pair exists',()=>{
  const r=request();r.prompt.choices=r.prompt.choices.filter(c=>!c.token.startsWith('fire'));
  assert.equal(choose(r),null);
});
test('Crispin attach refuses non-Active or ambiguous Grass assignment',()=>{
  const r=attachmentRequest();
  r.prompt.choices=r.prompt.choices.filter(c=>c.token!=='grass-active');
  assert.equal(choose(r),null);
  r.prompt.choices.push({token:'grass2',kind:'energy',printing:'Grass Energy MEE 9',
    publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,zone:'active',
      sourceZone:'effect-revealed'}});
  assert.deepEqual(choose(r),{kind:'select-choice',token:'grass2'});
  r.prompt.choices.push({...r.prompt.choices[r.prompt.choices.length-1],token:'duplicate'});
  assert.equal(choose(r),null);
});
test('Crispin search rejects source/protocol/owner/scope mismatches',()=>{
  const mutators=[
    r=>{r.seat=1;},r=>{r.prompt.source.effectName='Other';},
    r=>{r.prompt.source.sourcePrinting='Crispin OTHER';},
    r=>{r.prompt.publicMetadata.maximumCount=3;},
    r=>{r.prompt.publicMetadata.isOwnerVisible=false;},
    r=>{r.prompt.publicMetadata.sourceZone='opponent-deck';},
    r=>{r.observation.decisionKind='owner-root';}];
  for(const mutate of mutators){const r=request();mutate(r);assert.equal(choose(r),null);}
});

class EnergyCard {
  constructor(name,fullName,energyType='BASIC') {
    this.name=name;this.fullName=fullName;this.energyType=energyType;
  }
}
const native={
  EnergyCard,PlayerType:{BOTTOM_PLAYER:'BOTTOM_PLAYER'},
  SlotType:{ACTIVE:'ACTIVE',BENCH:'BENCH'},
  SuperType:{ENERGY:'ENERGY'},EnergyType:{BASIC:'BASIC'}
};
function attached(seat=0) {
  const crispin={name:'Crispin',set:'SCR',setNumber:'133',fullName:'Crispin SCR'};
  const actor={
    id:11+seat,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
    supporter:{cards:[crispin]},
    active:{getPokemonCard:()=>({name:'Regidrago VSTAR',fullName:'Regidrago VSTAR SIT'})},
    bench:[{getPokemonCard:()=>({name:'Budew',fullName:'Budew ASC'})}]
  };
  const state={players:seat===0?[actor,{id:99}]:[{id:99},actor],
    phase:2,prompts:[]};
  const prompt={
    constructor:{name:'AttachEnergyPrompt'},playerId:actor.id,
    getPerspectivePlayerId:()=>actor.id,
    message:'ATTACH_ENERGY_CARDS',result:undefined,
    cardList:{cards:[
      new EnergyCard('Grass Energy','Grass Energy MEE'),
      new EnergyCard('Fire Energy','Fire Energy MEE')]},
    playerType:'BOTTOM_PLAYER',slots:['BENCH','ACTIVE'],
    filter:{superType:'ENERGY',energyType:'BASIC'},
    options:{allowCancel:false,min:1,max:1},
    decode:answer=>answer,validate:answer=>
      Array.isArray(answer)&&answer.length===1&&
      [0,1].includes(answer[0].index)&&
      ['ACTIVE','BENCH'].includes(answer[0].to?.slot)&&
      answer[0].to?.player==='BOTTOM_PLAYER'
  };
  state.prompts.push(prompt);
  const provenance={sourceKind:'card-effect',sourceCard:crispin,effectName:'Crispin'};
  const testProjectionApi={
    projectPrompt:()=>({delegated:true}),
    makeSource:()=>({classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:crispin.fullName,effectName:provenance.effectName}),
    validateRawPromptResult:(prompt,raw,state)=>({
      valid:prompt.validate(prompt.decode(raw,state),state),decoded:raw})};
  const provenanceHook={getPromptProvenance:()=>provenance};
  return {prompt,state,actorSeat:seat,native,provenanceHook,testProjectionApi};
}
for(const seat of [0,1]) {
  test('seat '+seat+': projected native-shaped Crispin frontier includes both Energy Active and Bench alternative',()=>{
    const x=attached(seat),p=project(x);
    assert.equal(p.hostOnly,false);
    assert.equal(p.promptProjection.source.sourcePrinting,'Crispin SCR');
    assert.equal(p.promptProjection.publicMetadata.sourceZone,'effect-revealed');
    assert.equal(p.promptProjection.choices.length,4);
    const r={role:'opponent',seat,observation:{actorSeat:seat,
      decisionKind:'owner-prompt',ownPublic:{active:{printing:'Regidrago VSTAR SIT 136'}}},
      prompt:p.promptProjection};
    const chosen=choose(r);
    assert.equal(chosen.kind,'select-choice');
    const raw=p.choiceByToken.get(chosen.token);
    assert.equal(raw.length,1);
    assert.equal(raw[0].index,0);
    assert.equal(raw[0].to.slot,'ACTIVE');
    assert.equal(x.prompt.validate(raw,x.state),true);
  });
}
test('projection refuses wrong player, untrusted source, same-type energy and stale prompt',()=>{
  const cases=[
    x=>{x.actorSeat=1;},
    x=>{x.provenanceHook.getPromptProvenance=()=>({...x.provenanceHook.getPromptProvenance(),
      sourceCard:{name:'Crispin',set:'SCR',setNumber:'999',fullName:'Crispin SCR'}});},
    x=>{x.prompt.cardList.cards[1]=new EnergyCard('Grass Energy','Grass Energy MEE');},
    x=>{x.prompt.result=[];},
    x=>{x.prompt.options.max=2;}
  ];
  for(const mutate of cases){
    const x=attached();mutate(x);assert.throws(()=>project(x));
  }
});
test('unrelated AttachEnergyPrompt leaves original projector in control',()=>{
  const x=attached();
  x.provenanceHook.getPromptProvenance=()=>({
    sourceKind:'card-effect',
    sourceCard:{name:'Shadow Rider Calyrex VMAX'},
    effectName:'Underworld Door'
  });
  assert.deepEqual(project(x),{delegated:true});
});
