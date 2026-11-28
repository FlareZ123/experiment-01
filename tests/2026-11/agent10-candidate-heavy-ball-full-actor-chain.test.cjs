'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const projector=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const BALL='Hisuian Heavy Ball ASR 146',M='Mimikyu GRI 58',D='Dialga-GX UPR 100';
const NATIVE={SuperType:{POKEMON:1,ENERGY:2,TRAINER:3},Stage:{BASIC:0},
 PlayerType:{BOTTOM_PLAYER:1,TOP_PLAYER:2},SlotType:{BENCH:1,ACTIVE:0}};
function mon(printing){return {printing,hp:200,damage:0,
 printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
 weakness:[],resistance:[],retreatCost:[]},
 energies:[],attacks:[],abilities:[],abilitySuppressions:[],tools:[]};}
function player(active,bench=[]){return {active,bench,discard:[],stadium:[],
 lostZone:[],resolvingSupporter:[],handCount:1,deckCount:25,prizeCount:6,
 publicTurnRestrictions:{vstarUsed:false,gxUsed:false,
 stadiumAndToolHaveNoEffectTurnsRemaining:0}};}
function observation(seat,opponent='Regidrago VSTAR SIT 136'){
 return {actorSeat:seat,decisionKind:'owner-root',
 ownHand:[BALL],ownPublic:player(mon('Shadow Rider Calyrex V CRE 74')),
 opponentPublic:player(mon(opponent)),
 ownTurnResources:{supporterPlayedTurn:0,vstarUsed:false}};
}
function root(seat,opponent){
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
 observation:observation(seat,opponent),actionFrontier:{
 schema:protocol.FRONTIER_SCHEMA,items:[
 {token:'ball',kind:'play-card',actorPrinting:BALL,
   publicMetadata:{cardType:'trainer',handIndex:0}},
 {token:'pass',kind:'pass'}]}};
}
function nativePrizePrompt(seat,possible=[M,D,'Field Blower GRI 125']){
 const source={fullName:BALL,name:'Hisuian Heavy Ball'};
 const cards=possible.map(printing=>({
 fullName:printing,name:printing,superType:printing.includes('Field Blower')?3:1,stage:0
 }));
 const actor={id:11,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
 supporter:{cards:[source]},stadium:{cards:[]},lostzone:{cards:[]},
 active:{cards:[]},bench:[],prizes:cards.map(c=>({
 cards:[c],isSecret:false,faceUpPrize:false}))};
 const rival={id:22,hand:{cards:[]},deck:{cards:[]},discard:{cards:[]},
 supporter:{cards:[]},stadium:{cards:[]},lostzone:{cards:[]},
 active:{cards:[]},bench:[],prizes:[]};
 const prompt={constructor:{name:'ChooseCardsPrompt'},id:93,result:undefined,
 playerId:11,getPerspectivePlayerId(){return 11},
 message:'CHOOSE_CARD_TO_HAND',cards:{cards},
 filter:{superType:NATIVE.SuperType.POKEMON,stage:NATIVE.Stage.BASIC},
 options:{min:0,max:1,allowCancel:false,blocked:[],isSecret:false},
 decode(indices){return indices.map(i=>this.cards.cards[i])},
 validate(items){return Array.isArray(items)&&items.length<=1&&items.every(c=>
  c.superType===NATIVE.SuperType.POKEMON&&c.stage===NATIVE.Stage.BASIC)}};
 const provenanceHook={getPromptProvenance(){return {
  sourceKind:'card-effect',sourceCard:source,effectName:'Hisuian Heavy Ball'}}};
 const projected=projector.projectPrompt({prompt,native:NATIVE,
  provenanceHook,actorSeat:seat,state:{phase:3,players:seat===0?
   [actor,rival]:[rival,actor]}});
 return projected;
}
for(const seat of [0,1]){
 const worker=policy.createPolicy({role:'candidate',seat,
 policyVersion:policy.POLICY_VERSION,config:{}});
 test('Heavy Ball root → source-preserved temporary Prizes → Mimikyu vs Regidrago seat '+seat,()=>{
  const r=root(seat);
  const d=worker.decideWithAudit(r);
  assert.deepEqual(d.decision,{kind:'select-action',token:'ball'});
  protocol.validatePolicyAudit(d.policyAudit,r,d.decision,policy.POLICY_VERSION);
  const projected=nativePrizePrompt(seat);
  const p=projected.promptProjection;protocol.validatePrompt(p,seat);
  const req={role:'candidate',seat,prompt:p,observation:{
   ...observation(seat),decisionKind:'owner-prompt',
   pendingPromptType:'ChooseCardsPrompt'},
   publicEventReceipt:null,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
  const choice=worker.decideWithAudit(req);
  const token=p.choices.find(c=>c.printing===M)?.token;
  assert.deepEqual(choice.decision,{kind:'select-choices',tokens:[token]});
  protocol.validateDecision(choice.decision,p,new Set());
  protocol.validatePolicyAudit(choice.policyAudit,req,choice.decision,policy.POLICY_VERSION);
 });
 test('Heavy Ball legally chooses none when original Prizes contain no Basic seat '+seat,()=>{
  const projected=nativePrizePrompt(seat,['Field Blower GRI 125']);
  const p=projected.promptProjection;
  const req={role:'candidate',seat,prompt:p,observation:{
   ...observation(seat),decisionKind:'owner-prompt',
   pendingPromptType:'ChooseCardsPrompt'},
   publicEventReceipt:null,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
  const got=worker.decideWithAudit(req);
  const empty=p.choices.find(c=>c.kind==='empty-selection')?.token;
  assert.deepEqual(got.decision,{kind:'select-choice',token:empty});
  protocol.validateDecision(got.decision,p,new Set());
  protocol.validatePolicyAudit(got.policyAudit,req,got.decision,policy.POLICY_VERSION);
 });
 test('Heavy Ball conserves singleton absent Regidrago seat '+seat,()=>{
  const r=root(seat,'Iron Thorns ex TWM 77');
  const got=worker.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-action',token:'pass'});
  protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
}
