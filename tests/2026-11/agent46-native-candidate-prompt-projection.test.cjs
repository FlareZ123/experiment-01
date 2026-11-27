'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {projectPrompt}=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
class ChooseCardsPrompt {
  decode(result){return result===null?null:result.map(i=>this.cards.cards[i]);}
  validate(result){return result!==null&&result.length>=this.options.min&&result.length<=this.options.max&&
    result.every(card=>!this.filter.stage||card.stage===this.filter.stage);}
}
class ChooseEnergyPrompt {
  decode(result){return result===null?null:result.map(i=>this.energy[i]);}
  validate(result){return result!==null&&result.length===this.cost.length;}
}
const makeCard=(fullName,stage)=>({fullName,stage});
const R=makeCard('Radiant Eternatus CRZ','Basic'),M=makeCard('Shadow Rider Calyrex VMAX CRE','VMAX'),P=makeCard('Psychic Energy SVE',null);
const makePlayer=id=>({id,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
  stadium:{cards:[]},supporter:{cards:[]},active:{cards:[],energies:{cards:[]},tools:[]},bench:[],prizes:[]});
function fixture(seat,sourceName,Class) {
  const actor=makePlayer('actor'),opponent=makePlayer('opponent');
  const source={fullName:sourceName};actor.supporter.cards.push(source);
  const state={phase:2,turn:3,players:seat===0?[actor,opponent]:[opponent,actor],prompts:[]};
  const prompt=new Class();
  Object.assign(prompt,{id:1,player:actor,playerId:actor.id,getPerspectivePlayerId:()=>actor.id,
    message:'CHOOSE_CARD_TO_HAND',filter:{stage:'Basic'},options:{min:0,max:1,allowCancel:false,blocked:[]}});
  state.prompts=[prompt];
  const native={candidateSuccessorSeat:seat,matchesPromptFilter:(card,filter)=>!filter.stage||card.stage===filter.stage};
  const provenanceHook={getPromptProvenance:()=>({sourceKind:'card-effect',sourceCard:source,effectName:sourceName.split(' ASR')[0]})};
  return {actor,opponent,prompt,state,native,project:(overrides={})=>projectPrompt({prompt,state,actorSeat:seat,native,provenanceHook,...overrides}).promptProjection};
}
test('exact Heavy Ball source projects only revealed own Basic Prize choices, both seats',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat,'Hisuian Heavy Ball ASR',ChooseCardsPrompt);
    f.actor.prizes=[{cards:[R],isSecret:false},{cards:[M],isSecret:false},{cards:[P],isSecret:false}];
    f.prompt.cards={cards:[R,M,P]};
    let projection=f.project();
    assert.deepEqual(projection.choices.filter(c=>c.kind==='card').map(c=>c.printing),[R.fullName]);
    assert.equal(projection.publicMetadata.sourceZone,'prizes');
    assert.equal(projection.publicMetadata.isOwnerVisible,true);
    assert.throws(()=>f.project({native:{}}));
    f.actor.prizes[0].isSecret=true;
    assert.throws(()=>f.project());
    f.actor.prizes[0].isSecret=false;
    f.prompt.cards.cards=[R,M,makeCard('Opponent Secret', 'Basic')];
    assert.throws(()=>f.project());
  }
});
test('owner deck prompt respects native filter and optional empty choice',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat,'Quick Ball FST',ChooseCardsPrompt);
    f.actor.deck.cards=[R,M,P];f.prompt.cards=f.actor.deck;
    assert.deepEqual(f.project().choices.filter(c=>c.kind==='card').map(c=>c.printing),[R.fullName]);
    f.actor.deck.cards=[];
    const v=f.project();
    assert.equal(v.publicMetadata.sourceZone,'deck');
    assert.equal(v.publicMetadata.maximumCount,0);
    assert.equal(v.choices.length,1);
    assert.equal(v.choices[0].kind,'empty-selection');
  }
});
test('retreat cost counts required units rather than all offered energies',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat,'Shadow Rider Calyrex V CRE',ChooseEnergyPrompt);
    const energy=[1,2,3].map(i=>makeCard('Psychic Energy SVE '+i,null));
    f.actor.active.energies.cards=energy;
    f.prompt.energy=energy.map(card=>({card,provides:['Psychic']}));
    f.prompt.cost=['Colorless'];
    const projected=f.project();
    assert.equal(projected.publicMetadata.count,3);
    assert.equal(projected.publicMetadata.energyCount,3);
    assert.equal(projected.publicMetadata.energyType,'Colorless');
    assert.equal(f.prompt.validate([0]),true);
    assert.equal(f.prompt.validate([0,1,2]),false);
    assert.equal(f.project().choices.filter(c=>c.kind==='energy').length,3);
  }
});

class AttachEnergyPrompt {
  decode(result){return result;}
  validate(result){return Array.isArray(result)&&result.length===1&&result[0].to.player===0&&[0,1].includes(result[0].to.slot)&&Number.isSafeInteger(result[0].index);}
}
class EnergyCard {
  constructor(fullName,name,energyType){Object.assign(this,{fullName,name,superType:2,energyType});}
}
test('Raihan EVS projects only owner-discard Basic Psychic Energy to occupied own Active/Bench targets',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat,'Raihan EVS',AttachEnergyPrompt);
    Object.assign(f.native,{EnergyCard,EnergyType:{BASIC:0},SuperType:{ENERGY:2},PlayerType:{BOTTOM_PLAYER:0},SlotType:{ACTIVE:0,BENCH:1}});
    f.actor.active.getPokemonCard=()=>M;
    f.actor.bench=[{getPokemonCard:()=>R},{getPokemonCard:()=>null}];
    f.actor.discard.cards=[new EnergyCard(P.fullName,'Psychic Energy',0),new EnergyCard('Double Dragon Energy ROS','Double Dragon Energy',1)];
    Object.assign(f.prompt,{message:'ATTACH_ENERGY_CARDS',cardList:f.actor.discard,playerType:0,slots:[1,0],
      filter:{superType:2,energyType:0},options:{min:1,max:1,allowCancel:false,blocked:[]}});
    const hook={getPromptProvenance:()=>({sourceKind:'card-effect',sourceCard:f.actor.supporter.cards[0],effectName:'Raihan'})};
    const projected=f.project({provenanceHook:hook});
    assert.deepEqual(projected.choices.map(c=>[c.printing,c.publicMetadata.zone]),[[P.fullName,'active'],[P.fullName,'bench']]);
    assert.equal(projected.publicMetadata.sourceZone,'discard');
    assert.equal(projected.publicMetadata.allowCancel,false);
    f.prompt.cardList=f.opponent.discard;
    assert.throws(()=>f.project({provenanceHook:hook}));
  }
});
