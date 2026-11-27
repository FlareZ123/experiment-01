'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const projection=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

class EnergyCard {
  constructor(fullName,energyType='BASIC'){
    Object.assign(this,{fullName,name:fullName.split(' ').slice(0,-1).join(' '),
      superType:'ENERGY',energyType,id:EnergyCard.next++});
  }
}
EnergyCard.next=0;

const native={
  EnergyCard,
  EnergyType:{BASIC:'BASIC',SPECIAL:'SPECIAL'},
  SuperType:{ENERGY:'ENERGY'},
  PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
  SlotType:{ACTIVE:0,BENCH:1},
  ResolvePromptAction:class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
};
const target=(slot,index)=>({player:0,slot,index});
const sourceCard={fullName:'Electrode-GX CES',name:'Electrode-GX'};

function slot(cardName,card=undefined){
  if(!cardName)return {cards:[],energies:{cards:[]},getPokemonCard(){return null}};
  const poke=card??{fullName:cardName,name:cardName.split(' ').slice(0,-1).join(' ')};
  return {cards:[poke],energies:{cards:[]},getPokemonCard(){return poke}};
}
function player(id,owner){
  return {
    id,active:owner?slot(sourceCard.fullName,sourceCard):slot('Shadow Rider Calyrex V CRE'),
    bench:owner?[
      slot('Mega Absol ex M1L'),
      slot('Unown AOR'),
      slot('Dedenne-GX UNB'),
      slot(null),slot(null)
    ]:Array(5).fill(null).map(()=>slot(null)),
    hand:{cards:[]},deck:{cards:[]},discard:{cards:owner?[
      new EnergyCard('Basic Darkness Energy SVE'),
      new EnergyCard('Basic Darkness Energy SVE'),
      new EnergyCard('Double Colorless Energy EVO','SPECIAL'),
      {fullName:'VS Seeker PHF',superType:'TRAINER'}
    ]:[]},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},prizes:[]
  };
}
function fixture(actorSeat){
  const owner=player(actorSeat===0?11:22,true),other=player(actorSeat===0?22:11,false);
  const state={players:actorSeat===0?[owner,other]:[other,owner],
    activePlayer:actorSeat,phase:2,turn:7,prompts:[]};
  class AttachEnergyPrompt{
    constructor(){
      this.id=1;this.playerId=owner.id;this.message='ATTACH_ENERGY_CARDS';
      this.cardList=owner.discard;this.playerType=native.PlayerType.BOTTOM_PLAYER;
      this.slots=[native.SlotType.BENCH,native.SlotType.ACTIVE];
      this.filter={superType:native.SuperType.ENERGY};
      this.options={allowCancel:false,min:0,max:5,blocked:[],
        blockedTo:[target(0,0),target(1,2)],differentTypes:false,
        sameTarget:false,differentTargets:false};
      this.result=undefined;
    }
    getPerspectivePlayerId(){return owner.id}
    decode(raw){
      return raw.map(x=>({to:x.to,card:this.cardList.cards[x.index]}));
    }
    validate(decoded){
      return decoded.length<=5&&decoded.every(x=>x.card?.superType==='ENERGY');
    }
  }
  const prompt=new AttachEnergyPrompt();
  state.prompts.push(prompt);
  const provenance={sourceKind:'card-effect',sourceCard,effectName:'Extra Energy Bomb'};
  const store={state,dispatch(){throw Error('Test must not mutate live Store')}};
  const result=projection.projectPrompt({prompt,state,actorSeat,native,store,
    provenanceHook:{getPromptProvenance:p=>p===prompt?provenance:null}});
  return {state,owner,prompt,provenance,result,store,actorSeat};
}
function pairs(view){return view.result.promptProjection.choices}
function selected(view,by){
  return pairs(view).filter(by).map(x=>x.token);
}
function dispatch(view,tokens){
  return projection.dispatchPromptChoice({
    store:view.store,prompt:view.prompt,state:view.state,actorSeat:view.actorSeat,
    projection:view.result,decision:{kind:'select-choices',tokens},native,dispatch:false});
}

test('Electrode CES multi-transfer exposed as bounded actor-only physical assignments in both seats',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const p=f.result.promptProjection;
    assert.equal(p.source.sourcePrinting,'Electrode-GX CES');
    assert.equal(p.publicMetadata.selectionType,'energy-transfers');
    assert.equal(p.publicMetadata.minimumCount,3);
    assert.equal(p.publicMetadata.maximumCount,3);
    assert.equal(p.choices.length,6); // three physical Energy x two eligible targets
    assert.ok(p.choices.every(c=>c.kind==='energy'&&
      c.publicMetadata.ownerSeat==='actor'&&
      c.publicMetadata.sourceZone==='discard'&&
      c.publicMetadata.isOwnerVisible===true));
    assert.ok(p.choices.every(c=>c.label.includes('Mega Absol')||c.label.includes('Unown')));
    assert.doesNotThrow(()=>protocol.validatePrompt(p,seat));
    const tokens=[0,1,2].map(index=>selected(f,c=>
      c.publicMetadata.selectionIndex===index&&c.publicMetadata.slotIndex===0)[0]);
    const out=dispatch(f,tokens);
    assert.equal(out.rawResult.length,3);
    assert.deepEqual(out.rawResult.map(x=>x.index),[0,1,2]);
    assert.ok(out.rawResult.every(x=>x.to.slot===native.SlotType.BENCH&&x.to.index===0));
    assert.equal(out.validationReceipt,null);
    assert.equal(out.action.result.length,3);
  }
});
test('duplicate physical Energy is rejected even though native validator accepts it',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const sameCard=selected(f,c=>c.publicMetadata.selectionIndex===0);
    assert.equal(sameCard.length,2);
    const third=selected(f,c=>c.publicMetadata.selectionIndex===1)[0];
    assert.equal(f.prompt.validate(f.prompt.decode([
      {index:0,to:target(1,0)},{index:0,to:target(1,1)},{index:1,to:target(1,0)}])),true);
    assert.throws(()=>dispatch(f,[...sameCard,third]),/Extra Energy Bomb cannot reuse the same Energy/);
  }
});
test('blocked EX/GX recipient cannot be smuggled through a token or native validator',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat),choices=pairs(f);
    const tokens=[0,1,2].map(index=>selected(f,c=>
      c.publicMetadata.selectionIndex===index&&c.publicMetadata.slotIndex===0)[0]);
    const first=tokens[0],raw=f.result.choiceByToken.get(first);
    f.result.choiceByToken.set(first,{index:raw.index,to:target(1,2)});
    assert.equal(f.prompt.validate(f.prompt.decode(
      tokens.map(t=>f.result.choiceByToken.get(t)))),true);
    assert.throws(()=>dispatch(f,tokens),/Extra Energy Bomb target cannot be EX\/GX/);
  }
});
test('rejects partial mandatory transfer, untrusted source, and truncated source shape',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const two=selected(f,c=>c.publicMetadata.slotIndex===0).slice(0,2);
    assert.throws(()=>dispatch(f,two),/BAD_MULTI_SELECT_COUNT/);
    f.prompt.options.max=4;
    assert.throws(()=>projection.projectPrompt({prompt:f.prompt,state:f.state,actorSeat:seat,
      native,store:f.store,provenanceHook:{getPromptProvenance:()=>f.provenance}}),
      /Unsupported pinned Electrode-GX Extra Energy Bomb prompt shape/);
    f.prompt.options.max=5;
    assert.throws(()=>projection.projectPrompt({prompt:f.prompt,state:f.state,actorSeat:seat,
      native,store:f.store,provenanceHook:{getPromptProvenance:()=>({
        sourceKind:'card-effect',sourceCard,effectName:'Other Ability'})}}),
      /AttachEnergyPrompt is not from the pinned Underworld Door source/);
  }
});
