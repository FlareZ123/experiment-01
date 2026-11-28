'use strict';
/* Source-typed pinned Twinleaf Dark Patch native-shaped projection witness.
 * In-memory native ABI stub, not a compiled Store or whole-game experiment. */
const test=require('node:test');
const assert=require('node:assert/strict');
const {projectPrompt,dispatchPromptChoice}=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const CardType={DARK:6,PSYCHIC:5,FIGHTING:7};
const EnergyType={BASIC:1,SPECIAL:2};
const PlayerType={BOTTOM_PLAYER:1,TOP_PLAYER:2};
const SlotType={BENCH:2};
const SuperType={ENERGY:9};
class EnergyCard {
  constructor(name,type,provides){
    this.name=name;this.fullName=name+' SVE';this.energyType=type;this.provides=provides;
  }
}
class CheckPokemonTypeEffect {
  constructor(slot){this.slot=slot;this.cardTypes=[];}
}
class ResolvePromptAction {
  constructor(promptId,result){this.promptId=promptId;this.result=result;}
}
function pokemon(fullName,dynamicTypes){
  return {name:fullName,fullName,dynamicTypes,cardTypes:dynamicTypes,
    stage:'BASIC',subtypes:['Basic']};
}
function slot(card){return {cards:card?[card]:[],getPokemonCard(){return card;}};}
function fixture(seat=0){
  const players=[0,1].map(i=>({
    id:'p'+i,active:slot(pokemon('Budew ASC 16',[CardType.PSYCHIC])),
    bench:[slot(pokemon('Mega Absol ex MEG 86',[CardType.DARK])),
      slot(pokemon('Psychic support',[CardType.PSYCHIC])),slot(null)],
    hand:{cards:[]},discard:{cards:[]},deck:{cards:[]},lostZone:{cards:[]},
    stadium:{cards:[]},supporter:{cards:[]},prizes:[]
  }));
  const actor=players[seat];
  const sourceCard={name:'Dark Patch',fullName:'Dark Patch ASR',set:'ASR',setNumber:'139'};
  const darkEnergy=new EnergyCard('Darkness Energy',EnergyType.BASIC,[CardType.DARK]);
  const psychicEnergy=new EnergyCard('Psychic Energy',EnergyType.BASIC,[CardType.PSYCHIC]);
  const specialEnergy=new EnergyCard('Darkness Energy',EnergyType.SPECIAL,[CardType.DARK]);
  // A played Item is in actor's visible discard pile while its prompt resolves.
  actor.discard.cards=[psychicEnergy,darkEnergy,specialEnergy,sourceCard];
  const state={players,prompts:[],phase:2,turn:4,activePlayer:seat};
  const prompt={
    constructor:{name:'AttachEnergyPrompt'},id:17,playerId:actor.id,
    message:'ATTACH_ENERGY_TO_BENCH',cardList:actor.discard,
    playerType:PlayerType.BOTTOM_PLAYER,slots:[SlotType.BENCH],
    filter:{superType:SuperType.ENERGY,energyType:EnergyType.BASIC,name:'Darkness Energy'},
    options:{min:1,max:1,allowCancel:false},
    getPerspectivePlayerId(){return actor.id;},
    decode(raw){return raw.map(({to,index})=>({to,card:this.cardList.cards[index]}));},
    validate(decoded){return Array.isArray(decoded)&&decoded.length===1&&
      decoded[0].card===darkEnergy&&decoded[0].to?.slot===SlotType.BENCH;}
  };
  state.prompts=[prompt];
  let dispatched=null;
  const store={state,reduceEffect(_state,effect){
    effect.cardTypes=effect.slot.getPokemonCard().dynamicTypes;
  },dispatch(action){dispatched=action;return {ok:true};}};
  const native={CardType,EnergyType,PlayerType,SlotType,SuperType,EnergyCard,
    CheckPokemonTypeEffect,ResolvePromptAction};
  const provenanceHook={getPromptProvenance(){return{
    sourceKind:'card-effect',sourceCard,effectName:'Dark Patch'
  };}};
  return {state,prompt,store,native,actorSeat:seat,provenanceHook,
    darkEnergy,get dispatched(){return dispatched;}};
}
for(const seat of [0,1]){
  test('pinned Dark Patch discard->Darkness Bench source and native assignment seat '+seat,()=>{
    const f=fixture(seat);
    const projection=projectPrompt(f);
    const prompt=projection.promptProjection;
    assert.equal(prompt.source.sourcePrinting,'Dark Patch ASR');
    assert.equal(prompt.source.effectName,'Dark Patch');
    assert.equal(prompt.publicMetadata.sourceZone,'discard');
    assert.equal(prompt.publicMetadata.selectionType,'energy-attachment');
    assert.deepEqual(prompt.choices.map(c=>c.publicMetadata.benchIndex),[0]);
    const decision={kind:'select-choice',token:prompt.choices[0].token};
    const prepared=dispatchPromptChoice({...f,projection,decision,dispatch:false});
    assert.deepEqual(prepared.rawResult,[{to:{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0},index:1}]);
    assert.deepEqual(prepared.decoded,[{to:{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0},card:f.darkEnergy}]);
    assert.equal(f.dispatched,null);
    const completed=dispatchPromptChoice({...f,projection,decision,dispatch:true});
    assert.equal(completed.result.ok,true);
    assert.deepEqual(f.dispatched.result,completed.action.result);
  });
  test('pinned Dark Patch rejects hand-origin fake seat '+seat,()=>{
    const f=fixture(seat);
    f.prompt.cardList=f.state.players[seat].hand;
    assert.throws(()=>projectPrompt(f),e=>e.code==='UNSUPPORTED_ATTACH_ENERGY_PROMPT_SHAPE');
  });
  test('pinned Dark Patch rejects non-Dark target even if printed as such seat '+seat,()=>{
    const f=fixture(seat);
    f.state.players[seat].bench[0].getPokemonCard().dynamicTypes=[CardType.FIGHTING];
    assert.throws(()=>projectPrompt(f),e=>e.code==='NO_ELIGIBLE_ATTACH_ENERGY_CHOICES');
  });
  test('pinned Dark Patch rejects different source effect name seat '+seat,()=>{
    const f=fixture(seat);
    const old=f.provenanceHook.getPromptProvenance;
    f.provenanceHook.getPromptProvenance=()=>({...old(),effectName:'Other'});
    assert.throws(()=>projectPrompt(f),e=>e.code==='UNSUPPORTED_ATTACH_ENERGY_PROMPT_SOURCE');
  });
}
