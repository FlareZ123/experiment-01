'use strict';
// Developmental no-game host/actor test. Exact prompt-projection module is used;
// a strict mock Store deliberately reproduces the pinned Store's playability
// array replacement on reduceEffect. Only the isolated validation State may
// change; original native prompt, hand, board and playability are immutable.
const test=require('node:test');
const assert=require('node:assert/strict');
const host=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

class PsychicEnergy {
  constructor() {
    this.fullName='Psychic Energy MEE 13';
    this.name='Psychic Energy';
    this.energyType='BASIC';
    this.provides=['Psychic'];
  }
}
class FakeTypeEffect {
  constructor(slot) {this.slot=slot;this.cardTypes=[];}
}
let isolatedCheckCount=0;
class NativeScratchStore {
  constructor() {this.state=null;}
  reduceEffect(state,effect) {
    assert.notEqual(state,globalControl.liveState);
    assert.equal(this.state,state);
    isolatedCheckCount++;
    // Deliberately model the known pinned Store side effect: every
    // reduceEffect recalculates and replaces both players' playability.
    for(const player of state.players){
      player.playableCardIds=[];
      player.playableHandAbilityCardIds=[];
    }
    const pokemon=effect.slot.getPokemonCard();
    effect.cardTypes=pokemon?.dynamicPsychic?['Psychic']:['Colorless'];
  }
}
const native={
  Store:NativeScratchStore,
  CheckPokemonTypeEffect:FakeTypeEffect,
  EnergyCard:PsychicEnergy,
  EnergyType:{BASIC:'BASIC'},
  CardType:{PSYCHIC:'Psychic'},
  SuperType:{ENERGY:'ENERGY'},
  PlayerType:{BOTTOM_PLAYER:'BOTTOM_PLAYER'},
  SlotType:{BENCH:'BENCH'}
};
function boardSlot(pokemon){
  return {cards:pokemon?[pokemon]:[],tools:[],energies:{cards:[]},
    getPokemonCard(){return this.cards[0];}};
}
function player(id,source,energy){
  return {
    id,hand:{cards:energy?[energy]:[]},deck:{cards:[]},
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},prizes:[],active:boardSlot(source),
    bench:[boardSlot({fullName:'Shadow Rider Calyrex V CRE 74',
      dynamicPsychic:true}),
      boardSlot({fullName:'Pidgey MEW 16',dynamicPsychic:false})],
    playableCardIds:['old-play-id-'+id],
    playableHandAbilityCardIds:['old-hand-ability-id-'+id]
  };
}
const globalControl={liveState:null};
function scenario(seat,emptyPsychic=false){
  isolatedCheckCount=0;
  const source={fullName:'Shadow Rider Calyrex VMAX CRE 75',
    name:'Shadow Rider Calyrex VMAX'};
  const energy=new PsychicEnergy();
  const actor=player(51,source,energy),opponent=player(61,null,null);
  if(emptyPsychic)actor.bench[0].cards[0].dynamicPsychic=false;
  const state={phase:3,turn:4,activePlayer:seat,
    players:seat===0?[actor,opponent]:[opponent,actor],
    prompts:[]};
  globalControl.liveState=state;
  const fakeLiveStore={state,reduceEffect(){
    throw Error('MUTATING_LIVE_STORE_CALLED');
  }};
  const prompt=Object.assign({
    id:7,playerId:actor.id,result:undefined,
    message:'ATTACH_ENERGY_TO_BENCH',cardList:actor.hand,
    playerType:native.PlayerType.BOTTOM_PLAYER,
    slots:[native.SlotType.BENCH],
    filter:{superType:native.SuperType.ENERGY,
      energyType:native.EnergyType.BASIC,name:'Psychic Energy'},
    options:{min:1,max:1,allowCancel:false},
    getPerspectivePlayerId(){return actor.id;},
    decode(result){return result;},
    validate(result){return Array.isArray(result)&&result.length===1;}
  },{constructor:{name:'AttachEnergyPrompt'}});
  state.prompts.push(prompt);
  const provenanceHook={getPromptProvenance(p) {
    assert.strictEqual(p,prompt);
    return {sourceKind:'card-effect',effectName:'Underworld Door',
      sourceCard:source};
  }};
  return {seat,source,energy,actor,opponent,state,prompt,
    fakeLiveStore,provenanceHook};
}
for(const seat of [0,1]){
  test('seat '+seat+' physical prompt dynamic Psychic selection is detached',()=>{
    const s=scenario(seat);
    const before=s.state.players.map(p=>({
      play:p.playableCardIds,
      ability:p.playableHandAbilityCardIds,
      hand:p.hand.cards,
      bench:p.bench
    }));
    const projection=host.projectPrompt({
      prompt:s.prompt,state:s.state,actorSeat:seat,
      native,store:s.fakeLiveStore,provenanceHook:s.provenanceHook});
    assert.equal(projection.hostOnly,false);
    assert.equal(projection.promptProjection.source.sourcePrinting,
      'Shadow Rider Calyrex VMAX CRE 75');
    assert.equal(projection.promptProjection.publicMetadata.selectionType,
      'energy-attachment');
    assert.equal(projection.promptProjection.choices.length,1);
    assert.equal(projection.promptProjection.choices[0].kind,'energy');
    assert.equal(projection.promptProjection.choices[0].publicMetadata.benchIndex,0);
    assert.equal(projection.promptProjection.choices[0].printing,energyPrinting());
    protocol.validatePrompt(projection.promptProjection,seat);
    assert.equal(isolatedCheckCount,2);
    assert.strictEqual(s.state.prompts[0],s.prompt);
    for(const [i,p] of s.state.players.entries()){
      assert.strictEqual(p.playableCardIds,before[i].play);
      assert.strictEqual(p.playableHandAbilityCardIds,before[i].ability);
      assert.strictEqual(p.hand.cards,before[i].hand);
      assert.strictEqual(p.bench,before[i].bench);
    }
  });
  test('seat '+seat+' source-board dynamic type veto fails closed without mutating live',()=>{
    const s=scenario(seat,true);
    const before=s.state.players.map(p=>[p.playableCardIds,p.playableHandAbilityCardIds]);
    assert.throws(()=>host.projectPrompt({
      prompt:s.prompt,state:s.state,actorSeat:seat,
      native,store:s.fakeLiveStore,provenanceHook:s.provenanceHook}),
      e=>e.code==='NO_ELIGIBLE_ATTACH_ENERGY_CHOICES');
    assert.equal(isolatedCheckCount,2);
    s.state.players.forEach((p,i)=>{
      assert.strictEqual(p.playableCardIds,before[i][0]);
      assert.strictEqual(p.playableHandAbilityCardIds,before[i][1]);
    });
  });
}
function energyPrinting(){return 'Psychic Energy MEE 13';}
