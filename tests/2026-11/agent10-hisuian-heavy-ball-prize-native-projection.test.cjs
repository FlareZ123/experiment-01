'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const projector=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const BALL='Hisuian Heavy Ball ASR 146';
const NATIVE={SuperType:{POKEMON:1,ENERGY:2,TRAINER:3},
 Stage:{BASIC:0,STAGE_1:1},PlayerType:{BOTTOM_PLAYER:1,TOP_PLAYER:2},
 SlotType:{BENCH:1,ACTIVE:0}};
const basic={fullName:'Mimikyu GRI 58',name:'Mimikyu',superType:1,stage:0};
const trainer={fullName:'Field Blower GRI 125',name:'Field Blower',superType:3};
function scenario(seat,{sourceName=BALL,sourceEffect='Hisuian Heavy Ball',
  reveal=true,filterBasic=true,extraFaceUp=false,forgedCard=false,
  opponentPrizeSource=false}={}){
 const src={fullName:sourceName,name:'Hisuian Heavy Ball'};
 const firstPrize={cards:[basic],isSecret:!reveal,faceUpPrize:false};
 const otherPrize={cards:[trainer],isSecret:!reveal,faceUpPrize:extraFaceUp};
 const actor={id:11,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
 supporter:{cards:[src]},stadium:{cards:[]},lostzone:{cards:[]},
 active:{cards:[]},bench:[],prizes:opponentPrizeSource?[]:[firstPrize,otherPrize]};
 const rival={id:22,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
 supporter:{cards:[]},stadium:{cards:[]},lostzone:{cards:[]},
 active:{cards:[]},bench:[],prizes:opponentPrizeSource?[firstPrize,otherPrize]:[]};
 const players=seat===0?[actor,rival]:[rival,actor],state={players,phase:3};
 const prompt={constructor:{name:'ChooseCardsPrompt'},result:undefined,
  id:44,playerId:11,getPerspectivePlayerId(){return 11},
  message:'CHOOSE_CARD_TO_HAND',
  cards:{cards:[forgedCard?{...basic}:basic,trainer]},
  filter:{superType:filterBasic?NATIVE.SuperType.POKEMON:NATIVE.SuperType.ENERGY,
          stage:NATIVE.Stage.BASIC},
  options:{min:0,max:1,allowCancel:false,isSecret:false,blocked:[]},
  decode(indices){return indices.map(i=>this.cards.cards[i])},
  validate(items){return Array.isArray(items)&&items.length<=1&&items.every(c=>
    c.superType===NATIVE.SuperType.POKEMON && c.stage===NATIVE.Stage.BASIC)}};
 const provenanceHook={getPromptProvenance(){
  return {sourceKind:'card-effect',sourceCard:src,effectName:sourceEffect}}};
 return {prompt,state,actorSeat:seat,native:NATIVE,provenanceHook};
}
for(const seat of [0,1]){
 test('Heavy Ball projects only eligible Basic from live own Prizes, seat '+seat,()=>{
  const projected=projector.projectPrompt(scenario(seat));
  assert.equal(projected.hostOnly,false);
  const p=projected.promptProjection;protocol.validatePrompt(p,seat);
  assert.equal(p.source.sourcePrinting,BALL);
  assert.equal(p.publicMetadata.sourceZone,'prizes');
  assert.equal(p.publicMetadata.isOwnerVisible,true);
  assert.deepEqual(p.choices.filter(c=>c.kind==='card').map(c=>c.printing),
    ['Mimikyu GRI 58']);
  const chosen=p.choices.find(c=>c.kind==='card');
  assert.equal(projected.choiceByToken.get(chosen.token),0);
  const none=p.choices.find(c=>c.kind==='empty-selection');
  assert.ok(none);
  assert.deepEqual(projected.choiceByToken.get(none.token),[]);
 });
 for(const [label,options] of [
   ['native secrecy not lifted',{reveal:false}],
   ['raw source printing',{sourceName:'Hisuian Heavy Ball ASR'}],
   ['wrong source effect',{sourceEffect:'Boss Orders'}],
   ['forged card',{forgedCard:true}],
   ['wrong filter',{filterBasic:false}],
   ['originally face-up Prize',{extraFaceUp:true}],
   ['opponent Prize custody',{opponentPrizeSource:true}]
 ])test('Heavy Ball blocks '+label+' seat '+seat,()=>{
   assert.throws(()=>projector.projectPrompt(scenario(seat,options)));
 });
}
