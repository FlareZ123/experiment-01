'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,SOURCES,physicalSupporterSource,
  projectRank29RevealedHandPrompt
}=require('../../simulation/evaluation/2026-11/agent4-rank29-revealed-hand-projection.cjs');

class ChooseCardsPrompt {
  constructor({playerId,sourceCard,cards}){
    this.playerId=playerId;
    this.sourceCard=sourceCard;
    this.cards=cards;
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.result=undefined;
    this.options={min:0,max:2,allowCancel:false};
  }
  getPerspectivePlayerId(){return this.playerId;}
}

function makeFixture({seat=0,source='Eri TEF',opponentItems=[
  'Fog Crystal CRE 140','Unfair Stamp TWM 165',
  'Iono PAL 185']}={}){
  const players=[
    {id:10,hand:{cards:[]},supporter:{cards:[]}},
    {id:20,hand:{cards:[]},supporter:{cards:[]}}
  ];
  const card={fullName:source};
  players[seat].supporter.cards.push(card);
  players[1-seat].hand.cards.push(...opponentItems.map(fullName=>({fullName})));
  const state={phase:2,players};
  const prompt=new ChooseCardsPrompt({
    playerId:players[seat].id,sourceCard:card,
    cards:players[1-seat].hand
  });
  const provenanceHook={
    getPromptProvenance(p){
      if(p!==prompt)throw Error('UNKNOWN_PROMPT');
      return {sourceKind:'card-effect',sourceCard:card,effectName:source.split(' ')[0]};
    }
  };
  return {state,prompt,actorSeat:seat,provenanceHook};
}
function fakeProject(args){
  const hand=args.state.players[1-args.actorSeat].hand;
  if(hand.isPublic!==true)throw Error('PROMPT_CHOICE_NOT_ACTOR_VISIBLE');
  return {source:{classification:'actor-choice',sourceKind:'card-effect'},
    choices:hand.cards.map((card,i)=>({
      token:'opponent-'+i,kind:'card',printing:card.fullName,
      publicMetadata:{ownerSeat:'opponent',sourceZone:'hand',
        isOwnerVisible:true,selectionIndex:i,selectedCount:1}
    }))};
}
function stubReject(args){
  const h=args.state.players[1-args.actorSeat].hand;
  assert.notEqual(h.isPublic,true);
  return {status:'normal-private'};
}
test('only known source card owners can access reveal effect',()=>{
  assert.deepEqual([...SOURCES].sort(),
    ['Eri TEF','Sidney FST 241','Team Skull Grunt SUM'].sort());
  for(const source of SOURCES)for(const actorSeat of [0,1]){
    const args=makeFixture({seat:actorSeat,source});
    const witness=physicalSupporterSource(args);
    assert.ok(witness);
    assert.equal(witness.actorSeat,actorSeat);
    const before=JSON.parse(JSON.stringify(args.state));
    const result=projectRank29RevealedHandPrompt({
      ...args,baseProjectPrompt:fakeProject
    });
    assert.equal(result.choices.length,3);
    assert.equal(result.choices[0].publicMetadata.ownerSeat,'opponent');
    assert.equal(result.rank29RevealedHandEvidence.liveHandWasNotMutated,true);
    assert.deepEqual(args.state,before);
  }
});
test('private non-Eri opponent-hand reference cannot be projected',()=>{
  const fixture=makeFixture();
  fixture.prompt.message='LOOK_AT_OPPONENT_HAND';
  assert.equal(physicalSupporterSource(fixture),null);
  assert.deepEqual(projectRank29RevealedHandPrompt({
    ...fixture,baseProjectPrompt:stubReject
  }),{status:'normal-private'});
});
test('Eri source is rejected if not physically played into actor Supporter zone',()=>{
  const fixture=makeFixture();
  fixture.state.players[0].supporter.cards.length=0;
  assert.equal(physicalSupporterSource(fixture),null);
  assert.deepEqual(projectRank29RevealedHandPrompt({
    ...fixture,baseProjectPrompt:stubReject
  }),{status:'normal-private'});
});
test('wrong physical player, hand, prompt owner, source card and effect provenance each fail closed',()=>{
  const variants=[
    ({state,prompt})=>{prompt.playerId=99;},
    ({state,prompt})=>{prompt.cards=state.players[0].hand;},
    ({state,prompt})=>{prompt.sourceCard={fullName:'Eri TEF'};},
    ({state,prompt})=>{prompt.options.max=3;},
    ({state,prompt})=>{prompt.options.allowCancel=true;},
    ({state,prompt})=>{prompt.result=[];},
    ({state,prompt})=>{prompt.message='REVEAL_HAND';},
    (f)=>{f.provenanceHook={getPromptProvenance(){
      return {sourceKind:'card-effect',sourceCard:f.prompt.sourceCard,
        effectName:''};}};},
    (f)=>{f.provenanceHook={getPromptProvenance(){
      return {sourceKind:'engine',sourceCard:f.prompt.sourceCard,
        effectName:'Eri'};}};},
  ];
  for(const mutate of variants){
    const f=makeFixture();
    mutate(f);
    assert.equal(physicalSupporterSource(f),null);
    assert.deepEqual(projectRank29RevealedHandPrompt({
      ...f,baseProjectPrompt:stubReject
    }),{status:'normal-private'});
  }
});
test('source whitelist excludes unsupported card or non-Eri generic reveal',()=>{
  const fixture=makeFixture({source:'Iono PAL 185'});
  assert.equal(physicalSupporterSource(fixture),null);
  assert.deepEqual(projectRank29RevealedHandPrompt({
    ...fixture,baseProjectPrompt:stubReject
  }),{status:'normal-private'});
});
test('projection failure never leaves opponent hand public in real Store',()=>{
  const f=makeFixture();
  const initial=f.state.players[1].hand;
  assert.throws(()=>projectRank29RevealedHandPrompt({
    ...f,baseProjectPrompt:()=>{throw Error('INTERNAL_VALIDATOR_FAILED')}
  }),/INTERNAL_VALIDATOR_FAILED/);
  assert.equal(f.state.players[1].hand,initial);
  assert.equal(initial.isPublic,undefined);
});
test('wrapper has explicit version and preserves source witness without adding hidden content',()=>{
  const f=makeFixture({opponentItems:['VS Seeker PHF 109']});
  const v=projectRank29RevealedHandPrompt({
    ...f,baseProjectPrompt:fakeProject
  });
  assert.equal(v.rank29RevealedHandEvidence.version,VERSION);
  assert.equal(v.rank29RevealedHandEvidence.sourcePrinting,'Eri TEF');
  assert.equal(JSON.stringify(v.rank29RevealedHandEvidence).includes('VS Seeker'),false);
});
