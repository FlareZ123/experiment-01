'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const projector=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const R='Raihan EVS 152',E='Psychic Energy MEE 13';
const NATIVE_R='Raihan EVS';
class EnergyCard{constructor(){this.fullName=E;this.name='Psychic Energy';
 this.superType=2;this.energyType=0;this.provides=['Psychic'];}}
const native={EnergyCard,SuperType:{ENERGY:2},EnergyType:{BASIC:0},
 PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},SlotType:{ACTIVE:0,BENCH:1}};
function actor(id=11,includeEnergy=true){
 const rider={fullName:'Shadow Rider Calyrex VMAX CRE 75',name:'Shadow Rider Calyrex VMAX'};
 const mimikyu={fullName:'Mimikyu GRI 58',name:'Mimikyu'};
 const list=(card)=>({cards:[card],getPokemonCard:()=>card});
 return {id,hand:{cards:[]},discard:{cards:includeEnergy?[new EnergyCard()]:[]},
 deck:{cards:[]},supporter:{cards:[{fullName:R,name:'Raihan'}]},
 stadium:{cards:[]},lostzone:{cards:[]},prizes:[],
 active:list(rider),bench:[list(mimikyu)]};
}
function scenario(seat,{sourcePrinting=NATIVE_R,wrongZone=false,
   wrongFilter=false,badBounds=false,noEnergy=false,opponentCard=false}={}){
 const own=actor(11,!noEnergy),opp=actor(22,opponentCard);
 const state={players:seat===0?[own,opp]:[opp,own],phase:3};
 const prompt={constructor:{name:'AttachEnergyPrompt'},
  id:99,playerId:11,getPerspectivePlayerId(){return 11},
  result:undefined,message:'ATTACH_ENERGY_CARDS',
  cardList:wrongZone?own.hand:own.discard,
  playerType:native.PlayerType.BOTTOM_PLAYER,
  slots:[native.SlotType.BENCH,native.SlotType.ACTIVE],
  filter:{superType:wrongFilter?99:native.SuperType.ENERGY,
    energyType:native.EnergyType.BASIC},
  options:{min:1,max:badBounds?2:1,allowCancel:false},
  decode(result){return result},
  validate(result){return Array.isArray(result)&&result.length===1&&
    result.every(x=>Number.isSafeInteger(x.index)&&
      this.cardList.cards[x.index] instanceof EnergyCard&&
      x.to.player===native.PlayerType.BOTTOM_PLAYER&&
      [native.SlotType.ACTIVE,native.SlotType.BENCH].includes(x.to.slot)&&
      x.to.index===0)}};
 const provenanceHook={getPromptProvenance(){return {
   sourceKind:'card-effect',sourceCard:own.supporter.cards[0],
   effectName:'Raihan'}}};
 own.supporter.cards[0].fullName=sourcePrinting;
 return {state,prompt,actorSeat:seat,native,provenanceHook};
}
for(const seat of [0,1]){
 test('Raihan legal native discard Basic assignment exposes both own Active/Bench seat '+seat,()=>{
  const projected=projector.projectPrompt(scenario(seat));
  const p=projected.promptProjection;protocol.validatePrompt(p,seat);
  assert.equal(p.publicMetadata.sourceZone,'discard');
  assert.equal(p.publicMetadata.ownerSeat,'actor');
  assert.equal(p.publicMetadata.energyType,'BASIC');
  assert.equal(p.choices.length,2);
  assert.deepEqual(p.choices.map(c=>c.publicMetadata.zone),['active','bench']);
  assert.ok(p.choices.every(c=>c.printing===E));
  assert.deepEqual([...projected.choiceByToken.values()].map(v=>v[0].to.slot),
    [native.SlotType.ACTIVE,native.SlotType.BENCH]);
 });
 for(const [label,opts] of [
  ['unknown printing',{sourcePrinting:'Raihan UNKNOWN'}],
  ['hand instead of discard',{wrongZone:true}],
  ['non-Basic filter',{wrongFilter:true}],
  ['max2 instead of max1',{badBounds:true}],
  ['empty own discard',{noEnergy:true}]
 ])test('Raihan projector rejects '+label+' seat '+seat,()=>{
  assert.throws(()=>projector.projectPrompt(scenario(seat,opts)));
 });
}
