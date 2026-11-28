'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const bridge=require('../../simulation/evaluation/2026-11/agent32-source-printing-bridge.cjs');
const projector=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const E='Psychic Energy MEE 13',B='Hisuian Heavy Ball ASR',R='Raihan EVS',
 P='Mimikyu GRI 58',V='Shadow Rider Calyrex V CRE 74';
class EnergyCard {constructor(){this.fullName=E;this.name='Psychic Energy';
 this.superType=2;this.energyType=0;}}
const native={SuperType:{POKEMON:1,ENERGY:2,TRAINER:3},
 Stage:{BASIC:0},EnergyType:{BASIC:0},EnergyCard,
 PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},
 SlotType:{ACTIVE:0,BENCH:1}};
const source60={cards:[
 {name:'Raihan',printing:{set:'EVS',number:'152'},count:1},
 {name:'Hisuian Heavy Ball',printing:{set:'ASR',number:'146'},count:1},
 {name:'Psychic Energy',printing:{set:'CRE',number:'232'},count:58}]};
const native60=[R,B,...Array(58).fill(E)];
const maps=[bridge.buildSourcePrintingMap(source60,native60),
 bridge.buildSourcePrintingMap(source60,native60)];
function pokemon(printing){return {printing,hp:210,damage:0,tools:[],
 energies:[],attacks:[],abilities:[],abilitySuppressions:[],
 printed:{stage:'BASIC',types:['Psychic'],subtypes:['Basic'],
 weakness:[],resistance:[],retreatCost:[]}};}
function publicSide(active,bench=[]){return {active,bench,discard:[],
 stadium:[],lostZone:[],resolvingSupporter:[],
 handCount:1,deckCount:35,prizeCount:6,
 publicTurnRestrictions:{vstarUsed:false,gxUsed:false,
 stadiumAndToolHaveNoEffectTurnsRemaining:0}};}
function make(seat,kind){
 const trainer={fullName:kind==='heavy'?B:R,
   name:kind==='heavy'?'Hisuian Heavy Ball':'Raihan'};
 const nativeMon={fullName:V,name:'Shadow Rider Calyrex V'};
 const nativeMim={fullName:P,name:'Mimikyu'};
 const slot=c=>({cards:[c],getPokemonCard:()=>c});
 const owner={id:11,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
  supporter:{cards:[trainer]},stadium:{cards:[]},lostzone:{cards:[]},
  active:slot(nativeMon),bench:kind==='heavy'?[]:[slot(nativeMim)],
  prizes:[]};
 const opponent={id:22,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
  supporter:{cards:[]},stadium:{cards:[]},lostzone:{cards:[]},
  active:{cards:[]},bench:[],prizes:[]};
 const state={phase:3,players:seat===0?[owner,opponent]:[opponent,owner]};
 const provenanceHook={getPromptProvenance(){return {
   sourceKind:'card-effect',sourceCard:trainer,
   effectName:kind==='heavy'?'Hisuian Heavy Ball':'Raihan'}}};
 let prompt;
 if(kind==='heavy'){
  const card={fullName:P,name:'Mimikyu',superType:1,stage:0};
  const item={fullName:'Fog Crystal CRE 140',name:'Fog Crystal',superType:3};
  const cards=[card,item];
  owner.prizes=cards.map(c=>({cards:[c],isSecret:false,faceUpPrize:false}));
  prompt={constructor:{name:'ChooseCardsPrompt'},id:44,playerId:11,
   getPerspectivePlayerId(){return 11},message:'CHOOSE_CARD_TO_HAND',
   cards:{cards},filter:{superType:1,stage:0},
   options:{min:0,max:1,allowCancel:false,isSecret:false,blocked:[]},
   decode(indices){return indices.map(i=>cards[i])},
   validate(arr){return Array.isArray(arr)&&arr.length<=1&&
     arr.every(c=>c.superType===1&&c.stage===0)}};
 } else {
  owner.discard.cards=[new EnergyCard()];
  prompt={constructor:{name:'AttachEnergyPrompt'},id:55,playerId:11,
   getPerspectivePlayerId(){return 11},message:'ATTACH_ENERGY_CARDS',
   cardList:owner.discard,playerType:0,slots:[0,1],
   filter:{superType:2,energyType:0},
   options:{min:1,max:1,allowCancel:false},
   decode(x){return x},
   validate(rows){return Array.isArray(rows)&&rows.length===1&&
    rows.every(x=>x.index===0&&x.to.player===0&&
     [0,1].includes(x.to.slot)&&x.to.index===0)}};
 }
 const projected=projector.projectPrompt({prompt,state,actorSeat:seat,
  provenanceHook,native});
 const observation={actorSeat:seat,decisionKind:'owner-prompt',
  ownHand:[],ownPublic:publicSide(pokemon(V),
   kind==='heavy'?[]:[pokemon(P)]),
  opponentPublic:publicSide(pokemon('Regidrago VSTAR SIT 136')),
  ownerK1:null,ownTurnResources:{supporterPlayedTurn:1},
  pendingPromptType:prompt.constructor.name};
 const certified=bridge.projectSourcePrintings(
  observation,null,maps,{prompt:projected.promptProjection});
 const request={role:'candidate',seat,prompt:certified.prompt,
  observation:certified.observation,publicEventReceipt:null,
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
 return {projected,certified,request};
}
for(const seat of [0,1]){
 test('Heavy Ball pinned-native raw ID becomes certified and selects Prized Mimikyu seat '+seat,()=>{
  const {projected,certified,request}=make(seat,'heavy');
  assert.equal(projected.promptProjection.source.sourcePrinting,B);
  assert.equal(certified.prompt.source.sourcePrinting,'Hisuian Heavy Ball ASR 146');
  protocol.validatePrompt(request.prompt,seat);
  const decision=policy.createPolicy({role:'candidate',seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(request);
  const card=request.prompt.choices.find(c=>c.printing===P);
  assert.ok(card);
  assert.deepEqual(decision.decision,{kind:'select-choices',tokens:[card.token]});
  protocol.validateDecision(decision.decision,request.prompt,new Set());
 });
 test('Raihan pinned-native raw ID and Basic Energy become source-certified before worker seat '+seat,()=>{
  const {projected,certified,request}=make(seat,'raihan');
  assert.equal(projected.promptProjection.source.sourcePrinting,R);
  assert.equal(certified.prompt.source.sourcePrinting,'Raihan EVS 152');
  assert.ok(certified.prompt.choices.every(c=>c.printing==='Psychic Energy CRE 232'));
  protocol.validatePrompt(request.prompt,seat);
  const decision=policy.createPolicy({role:'candidate',seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(request);
  const goal=request.prompt.choices.find(c=>c.publicMetadata.zone==='bench');
  assert.ok(goal);
  assert.deepEqual(decision.decision,{kind:'select-choice',token:goal.token});
  protocol.validateDecision(decision.decision,request.prompt,new Set());
 });
}
test('bridge rejects copied and mutated source-mapping certifications',()=>{
 const observation={actorSeat:0,ownHand:[],ownPublic:publicSide(null),
  opponentPublic:publicSide(null),ownerK1:null};
 assert.throws(()=>bridge.projectSourcePrintings(
  observation,null,[new Map(maps[0]),maps[1]]));
 const changed=bridge.buildSourcePrintingMap(source60,native60);
 changed.set(R,'Raihan EVS 999');
 assert.throws(()=>bridge.projectSourcePrintings(
  observation,null,[changed,maps[1]]));
});