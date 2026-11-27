'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('./agent49-policy-protocol.cjs');
const {projectRank30Prompt,sourceIsExact}=require('./agent8-rank30-patch-prompt-projection.cjs');
const canonical={name:'Wondrous Patch',set:'PFL',setNumber:'94',fullName:'Wonder Patch MBD'};
function fixture(seat) {
  class EnergyCard {
    constructor(fullName='Psychic Energy MEE 13') {
      this.name='Psychic Energy';this.fullName=fullName;this.energyType='BASIC';this.provides=['PSYCHIC'];
    }
  }
  class CheckPokemonTypeEffect { constructor(){this.cardTypes=[];} }
  class AttachEnergyPrompt {
    constructor() {
      this.message='ATTACH_ENERGY_TO_BENCH';this.playerId=seat+91;
      this.playerType='BOTTOM';this.slots=['BENCH'];
      this.filter={superType:'ENERGY',energyType:'BASIC',name:'Psychic Energy'};
      this.options={min:1,max:1,allowCancel:false};
      this.result=undefined;
    }
    getPerspectivePlayerId(){return this.playerId;}
  }
  const owner={id:seat+91,discard:{cards:[new EnergyCard()]},
    bench:[{getPokemonCard(){return {name:"Lillie's Clefairy ex",fullName:"Lillie's Clefairy ex JTG 56"};}}]};
  const state={players:[null,null],prompts:[]};state.players[seat]=owner;
  state.players[1-seat]={id:12345,discard:{cards:[new EnergyCard()]},bench:[]};
  const prompt=new AttachEnergyPrompt();prompt.cardList=owner.discard;state.prompts=[prompt];
  const native={EnergyCard,CheckPokemonTypeEffect,PlayerType:{BOTTOM_PLAYER:'BOTTOM'},
    SlotType:{BENCH:'BENCH'},SuperType:{ENERGY:'ENERGY'},
    EnergyType:{BASIC:'BASIC'},CardType:{PSYCHIC:'PSYCHIC'}};
  const store={reduceEffect(_state,effect){effect.cardTypes=['PSYCHIC'];}};
  const source={classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:'Wonder Patch MBD',effectName:'Wondrous Patch'};
  const testProjectionApi={
    makeSource(){return source;},
    validateRawPromptResult(_p,raw){return {valid:Array.isArray(raw)&&raw.length===1,decoded:raw};},
    projectPrompt(){throw Error('fallback unexpectedly used');}
  };
  const provenanceHook={getPromptProvenance(){return {
    sourceKind:'card-effect',effectName:'Wondrous Patch',sourceCard:canonical};}};
  return {prompt,state,actorSeat:seat,native,store,provenanceHook,testProjectionApi};
}
for(const seat of [0,1]) {
  test('seat '+seat+': exact-source Patch projects owner-discard Basic Psychic to owner Bench only',()=>{
    const arg=fixture(seat);
    const projected=projectRank30Prompt(arg);
    assert.equal(projected.hostOnly,false);
    assert.equal(projected.promptProjection.source.sourcePrinting,'Wonder Patch MBD');
    assert.equal(projected.promptProjection.publicMetadata.sourceZone,'discard');
    assert.equal(projected.promptProjection.choices.length,1);
    protocol.validatePrompt(projected.promptProjection,seat);
    const choice=projected.promptProjection.choices[0];
    const decision={kind:'select-choice',token:choice.token};
    protocol.validateDecision(decision,projected.promptProjection,new Set());
    assert.deepEqual(projected.choiceByToken.get(choice.token),
      [{to:{player:'BOTTOM',slot:'BENCH',index:0},index:0}]);
    assert.equal(arg.state.players[seat].discard.cards.length,1);
    assert.equal(arg.state.players[1-seat].discard.cards.length,1);
  });
}
test('Patch adapter rejects incorrect source printing or cross-seat prompt',()=>{
  const r=fixture(0);
  r.provenanceHook.getPromptProvenance=()=>({sourceKind:'card-effect',
    effectName:'Wondrous Patch',sourceCard:{...canonical,set:'ABC'}});
  assert.throws(()=>projectRank30Prompt(r),/source provenance/);
  const x=fixture(0);x.prompt.playerId=333;
  assert.throws(()=>projectRank30Prompt(x),/actor mismatch/);
});
test('Patch adapter refuses not-from-actor-discard and non-Psychic shape before choices',()=>{
  const r=fixture(1);
  r.prompt.cardList=r.state.players[0].discard;
  assert.throws(()=>projectRank30Prompt(r),/contract mismatch/);
  const p=fixture(1);p.prompt.filter.name='Water Energy';
  assert.throws(()=>projectRank30Prompt(p),/contract mismatch/);
});
