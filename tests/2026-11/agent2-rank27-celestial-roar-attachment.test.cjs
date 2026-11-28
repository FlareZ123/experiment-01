'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {projectCelestialRoarPrompt}=require(
 '../../simulation/evaluation/2026-11/agent2-rank27-celestial-roar-attachment.cjs');
const {validateDecision,validatePrompt}=require(
 '../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const native={
 PlayerType:{BOTTOM_PLAYER:2,TOP_PLAYER:1},
 SlotType:{ACTIVE:1,BENCH:2},
 EnergyType:{BASIC:1,SPECIAL:2},
 SuperType:{ENERGY:4,POKEMON:1},
 EnergyCard:class EnergyCard{
  constructor(name,fullName){
   Object.assign(this,{name,fullName,superType:4,energyType:1});
  }
 }
};
class AttachEnergyPrompt{
 constructor(id,cardList,opts={}){
  this.playerId=id;
  this.message='ATTACH_ENERGY_CARDS';
  this.cardList=cardList;
  this.playerType=native.PlayerType.BOTTOM_PLAYER;
  this.slots=[native.SlotType.ACTIVE];
  this.filter={superType:native.SuperType.ENERGY,
   energyType:native.EnergyType.BASIC};
  this.options={min:cardList.cards.filter(x=>x instanceof native.EnergyCard).length,
   max:cardList.cards.filter(x=>x instanceof native.EnergyCard).length,
   allowCancel:false,blocked:[],blockedTo:[],
   differentTypes:false,sameTarget:false,differentTargets:false,...opts};
 }
 getPerspectivePlayerId(){return this.playerId}
 decode(raw){
  return raw.map(t=>({to:t.to,card:this.cardList.cards[t.index]}));
 }
 validate(decoded){
  return decoded.length>=this.options.min&&
    decoded.length<=this.options.max&&
    decoded.every(x=>x.card instanceof native.EnergyCard&&
      x.to.slot===native.SlotType.ACTIVE&&
      x.to.player===native.PlayerType.BOTTOM_PLAYER&&x.to.index===0);
 }
}
function fixture(seat,k,nonEnergy=0){
 const attacking={name:'Regidrago V',set:'SIT',setNumber:'135',
  fullName:'Regidrago V SIT'};
 const cards=[];
 for(let i=0;i<k;i++)cards.push(new native.EnergyCard(
  i%2===0?'Grass Energy':'Fire Energy',
  i%2===0?'Grass Energy MEE':'Fire Energy MEE'));
 for(let i=0;i<nonEnergy;i++)cards.push({
  name:'Secret nonenergy '+i,fullName:'SECRET_NONENERGY_'+i});
 const active={cards:[attacking],getPokemonCard(){return attacking},
   energies:{cards:[]},tools:[]};
 const player={id:5,active,bench:[],hand:{cards:[]},deck:{cards:[]},
   discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
   supporter:{cards:[]},prizes:[]};
 const opponent={id:6,active:{cards:[]},bench:[],hand:{cards:[]},
  deck:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
  stadium:{cards:[]},supporter:{cards:[]},prizes:[]};
 const prompt=new AttachEnergyPrompt(5,{cards});
 const state={phase:3,players:seat===0?[player,opponent]:[opponent,player],
  prompts:[prompt]};
 const provenanceHook={getPromptProvenance(){return {
  sourceKind:'card-effect',sourceCard:attacking,effectName:'Celestial Roar'}}};
 return {state,prompt,provenanceHook,actorSeat:seat,native};
}
test('all 1/2/3 real Basic Energy attachments are one indivisible typed choice',()=>{
 for(const seat of [0,1]){
  for(let k=1;k<=3;k++){
   const options=fixture(seat,k,3-k);
   const p=projectCelestialRoarPrompt(options);
   assert.equal(p.hostOnly,false);
   assert.equal(p.promptProjection.source.effectName,'Celestial Roar');
   assert.equal(p.promptProjection.source.sourcePrinting,'Regidrago V SIT');
   assert.equal(p.promptProjection.choices.length,1);
   const choice=p.promptProjection.choices[0];
   assert.equal(choice.publicMetadata.selectedCount,k);
   assert.equal(choice.publicMetadata.sourceZone,'effect-revealed');
   const raw=p.choiceByToken.get(choice.token);
   assert.equal(raw.length,k);
   assert.deepEqual(raw.map(x=>x.index),Array.from({length:k},(_,i)=>i));
   assert.ok(raw.every(x=>x.to.player===native.PlayerType.BOTTOM_PLAYER&&
     x.to.slot===native.SlotType.ACTIVE&&x.to.index===0));
   assert.ok(!JSON.stringify(p.promptProjection).includes('SECRET_NONENERGY'));
   const decision={kind:'select-choice',token:choice.token};
   assert.deepEqual(validateDecision(decision,
     validatePrompt(p.promptProjection,seat),new Set()),decision);
  }
 }
});
test('exact original SIT135 provenance/card instance is mandatory',()=>{
 const fixture0=fixture(0,2,1),orig=fixture0.provenanceHook;
 const invalid=[
  {...fixture0,provenanceHook:{getPromptProvenance(){return {
   sourceKind:'card-effect',sourceCard:fixture0.state.players[0].active.cards[0],
   effectName:'Dragon Laser'}}}},
  {...fixture0,provenanceHook:{getPromptProvenance(){return {
   sourceKind:'card-effect',sourceCard:{...fixture0.state.players[0].active.cards[0],
     setNumber:'137'},effectName:'Celestial Roar'}}}},
  {...fixture0,actorSeat:1},
  {...fixture0,state:{...fixture0.state,phase:1}},
  {...fixture0,prompt:{...fixture0.prompt,playerId:6}}
 ];
 for(const x of invalid)assert.throws(()=>projectCelestialRoarPrompt(x));
 assert.equal(projectCelestialRoarPrompt(fixture0).promptProjection.actingSeat,0);
});
test('native cardinality, filter and destination cannot drift',()=>{
 for(const mutate of [
  p=>p.options.min=0,p=>p.options.max=3,
  p=>p.options.allowCancel=true,
  p=>p.filter.energyType=native.EnergyType.SPECIAL,
  p=>p.slots=[native.SlotType.ACTIVE,native.SlotType.BENCH],
  p=>p.playerType=native.PlayerType.TOP_PLAYER,
  p=>p.options.blocked=[1],
  p=>p.options.differentTargets=true
 ]){
  const x=fixture(0,2,1);mutate(x.prompt);
  assert.throws(()=>projectCelestialRoarPrompt(x));
 }
});
test('top-three temporary list may include nonenergy but never reveal it',()=>{
 const x=fixture(1,1,2);
 x.prompt.cardList.cards.splice(0,0,x.prompt.cardList.cards.pop());
 const p=projectCelestialRoarPrompt(x);
 const raw=p.choiceByToken.get(p.promptProjection.choices[0].token);
 assert.equal(raw.length,1);
 assert.equal(raw[0].index,1);
 assert.ok(!JSON.stringify(p.promptProjection).includes('Secret nonenergy'));
});
test('unrecognized native source preserves original delegate behavior',()=>{
 const x=fixture(0,1,2);
 x.provenanceHook={getPromptProvenance(){return {
  sourceKind:'card-effect',sourceCard:{name:'Crispin'},effectName:'Crispin'}}};
 // Delegation may reject at the earlier actor-visible source gate; either
 // disposition is correct, and neither is a trusted Celestial Roar projection.
 assert.throws(()=>projectCelestialRoarPrompt(x));
});
