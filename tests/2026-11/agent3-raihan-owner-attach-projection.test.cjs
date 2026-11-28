'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const projection=require('../../simulation/evaluation/2026-11/agent3-raihan-owner-attach-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const base=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');

class EnergyCard {
  constructor(fullName,energyType='BASIC'){
    this.fullName=fullName;this.name=fullName.split(' Energy')[0]+' Energy';
    this.energyType=energyType;
  }
}
class CardList {
  constructor(cards=[]){this.cards=cards;}
  filter(filter){return this.cards.filter(card=>
    card.energyType===filter.energyType);}
}
const native={
  EnergyCard,EnergyType:{BASIC:'BASIC',SPECIAL:'SPECIAL'},
  PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
  SlotType:{ACTIVE:0,BENCH:1,BOARD:2}
};
class AttachEnergyPrompt {
  constructor(actor,options={}){
    this.playerId=actor.id;
    this.message='ATTACH_ENERGY_TO_POKEMON';
    this.cardList=actor.discard;
    this.playerType=native.PlayerType.BOTTOM_PLAYER;
    this.slots=[native.SlotType.ACTIVE,native.SlotType.BENCH];
    this.filter={superType:'ENERGY',energyType:native.EnergyType.BASIC};
    this.options={min:1,max:1,allowCancel:false,...options};
    this.result=undefined;
    this.getPerspectivePlayerId=()=>this.playerId;
    this.validate=(entries,state)=>{
      if(!Array.isArray(entries)||entries.length!==1)return false;
      const item=entries[0];
      if(!(item.card instanceof EnergyCard)||
          !this.cardList.cards.includes(item.card)||
          item.card.energyType!==native.EnergyType.BASIC||
          item.to?.player!==native.PlayerType.BOTTOM_PLAYER)
        return false;
      return item.to.slot===native.SlotType.ACTIVE?
        Boolean(actor.active.getPokemonCard()):
        (item.to.slot===native.SlotType.BENCH&&
          Boolean(actor.bench[item.to.index]?.getPokemonCard?.()));
    };
    this.decode=(raw)=>raw;
  }
}
function slot(printing){const pokemon={name:printing.split(' ')[0],fullName:printing};
  return {getPokemonCard:()=>pokemon};}
function setup(seat=0){
  const raihan={name:'Raihan',set:'EVS',setNumber:'152',fullName:'Raihan EVS'};
  const grass=new EnergyCard('Grass Energy MEE 9'),fire=new EnergyCard('Fire Energy MEE 10');
  const special=new EnergyCard('Double Dragon Energy ROS 97','SPECIAL');
  const actor={id:100+seat,hand:new CardList(),deck:new CardList(),
    discard:new CardList([grass,fire,special]),supporter:new CardList([raihan]),
    lostzone:new CardList(),stadium:new CardList(),active:slot('Regidrago VSTAR SIT 136'),
    bench:[slot('Regidrago V SIT 135')],prizes:[]};
  const enemy={id:101-seat,hand:new CardList(),deck:new CardList(),
    discard:new CardList(),supporter:new CardList(),lostzone:new CardList(),
    stadium:new CardList(),active:slot('Shadow Rider Calyrex VMAX CRE 75'),
    bench:[],prizes:[]};
  const players=seat===0?[actor,enemy]:[enemy,actor];
  const prompt=new AttachEnergyPrompt(actor);
  const state={phase:2,players,prompts:[prompt]};
  const hook={getPromptProvenance:()=>({
    sourceKind:'card-effect',sourceCard:raihan,effectName:'Raihan'
  })};
  return {raihan,grass,fire,special,actor,enemy,prompt,state,hook,seat};
}
function project(x){
  return projection.projectRaihanOwnerAttachPrompt({
    prompt:x.prompt,state:x.state,actorSeat:x.seat,
    native,provenanceHook:x.hook
  });
}
for(const seat of [0,1]){
  test('actor '+seat+' Raihan yields only real native-basic-discard to own board attachments',()=>{
    const x=setup(seat);
    const got=project(x);
    assert.equal(got.hostOnly,false);
    assert.equal(got.promptProjection.actingSeat,seat);
    assert.equal(got.promptProjection.source.sourcePrinting,'Raihan EVS');
    assert.equal(got.promptProjection.publicMetadata.sourceZone,'discard');
    assert.equal(got.promptProjection.publicMetadata.ownerSeat,'actor');
    assert.equal(got.promptProjection.publicMetadata.selectionType,'energy-attachment');
    assert.equal(got.promptProjection.choices.length,4);
    assert.equal(got.choiceByToken.size,4);
    assert.equal(new Set(got.promptProjection.choices.map(c=>c.token)).size,4);
    const zones=new Set();
    for(const choice of got.promptProjection.choices){
      assert.equal(choice.kind,'energy');
      assert.equal(choice.publicMetadata.isOwnerVisible,true);
      assert.equal(choice.publicMetadata.ownerSeat,'actor');
      assert.equal(choice.publicMetadata.sourceZone,'discard');
      const result=got.choiceByToken.get(choice.token);
      assert.equal(result.length,1);
      assert.equal(x.actor.discard.cards.includes(result[0].card),true);
      assert.equal(result[0].to.player,native.PlayerType.BOTTOM_PLAYER);
      assert.equal(result[0].card.energyType,'BASIC');
      assert.equal(x.prompt.validate(result,x.state),true);
      assert.equal(protocol.validateDecision({kind:'select-choice',token:choice.token},
        got.promptProjection,new Set()).kind,'select-choice');
      zones.add(choice.publicMetadata.zone);
    }
    assert.deepEqual([...zones].sort(),['active','bench']);
    assert.equal(x.actor.discard.cards.length,3);
    assert.equal(x.special.energyType,'SPECIAL');
  });
  test('actor '+seat+' Raihan native transfer is dispatchable without exposing enemy discard',()=>{
    const x=setup(seat),got=project(x);
    const choice=got.promptProjection.choices.find(c=>c.printing==='Grass Energy MEE 9'&&
      c.publicMetadata.zone==='active');
    assert.ok(choice);
    const store={state:x.state,dispatch(){throw Error('dispatch disabled')}};
    class ResolvePromptAction {constructor(id,result){this.id=id;this.result=result;}}
    x.prompt.id=88;
    const out=base.dispatchPromptChoice({
      store,prompt:x.prompt,state:x.state,actorSeat:seat,projection:got,
      decision:{kind:'select-choice',token:choice.token},
      native:{ResolvePromptAction},dispatch:false
    });
    assert.equal(out.rawResult[0].card,x.grass);
    assert.equal(out.action.result[0].card,x.grass);
    assert.equal(out.action.result[0].to.player,native.PlayerType.BOTTOM_PLAYER);
    assert.equal(x.enemy.discard.cards.length,0);
  });
}
test('Raihan refuses impostor source, cross-seat prompt, stale prompt and alien discard',()=>{
  const x=setup(0);
  x.raihan.set='FST';assert.throws(()=>project(x),/Untrusted Raihan/);
  x.raihan.set='EVS';
  x.prompt.playerId=x.enemy.id;assert.throws(()=>project(x),/seat mismatch/);
  x.prompt.playerId=x.actor.id;
  x.prompt.result=[];assert.throws(()=>project(x),/stale/);
  x.prompt.result=undefined;x.prompt.cardList=x.enemy.discard;
  assert.throws(()=>project(x),/owner discard-attachment/);
  x.prompt.cardList=x.actor.discard;
  x.prompt.slots=[native.SlotType.ACTIVE,999];
  assert.throws(()=>project(x),/contract mismatch/);
  x.prompt.slots=[native.SlotType.ACTIVE,native.SlotType.BENCH];
  x.prompt.options.max=4;
  assert.throws(()=>project(x),/contract mismatch/);
});
test('Raihan rejects zero eligible Basic Energy rather than fabricating a token',()=>{
  const x=setup(1);
  x.actor.discard.cards=[x.special];
  assert.throws(()=>project(x),/No native-valid/);
});
test('Raihan native BOARD wildcard permits only real own slots after validation',()=>{
  const x=setup(1);
  x.prompt.slots=[native.SlotType.BOARD];
  const got=project(x);
  assert.equal(got.promptProjection.choices.length,4);
  const represented=new Set(got.promptProjection.choices.map(
    c=>c.publicMetadata.zone));
  assert.deepEqual([...represented].sort(),['active','bench']);
  x.prompt.slots=[999];
  assert.throws(()=>project(x),/contract mismatch/);
});

test('Raihan projection delegates unrelated prompt to shared projector',()=>{
  const x=setup(0);
  const other={sourceKind:'card-effect',sourceCard:{name:'Crispin',fullName:'Crispin SCR'}};
  let delegated=0;
  const output=projection.projectRaihanOwnerAttachPrompt({
    ...{prompt:x.prompt,state:x.state,actorSeat:0,native},
    provenanceHook:{getPromptProvenance:()=>other},
    testProjectionApi:{projectPrompt(){delegated++;return {hostOnly:true,reason:'delegated'}}}
  });
  assert.deepEqual(output,{hostOnly:true,reason:'delegated'});
  assert.equal(delegated,1);
});
