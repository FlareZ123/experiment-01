'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const proto=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const MIM='Mimikyu GRI 58',MAX='Shadow Rider Calyrex VMAX CRE 75',
  REG='Regidrago VSTAR SIT 136',DIAL='Dialga-GX UPR 100',
  CLE="Lillie's Clefairy ex JTG 56",PSY='Psychic Energy MEE 13';
const mon=(printing,n=0,attacks=[],tools=[],abilities=[])=>({
  name:printing===MIM?'Mimikyu':printing,printing,
  hp:printing===MAX?320:printing===REG?280:70,damage:0,
  printed:{stage:'BASIC',subtypes:['Basic'],
    types:[printing===REG?'Dragon':'Psychic'],weakness:[],
    resistance:[],retreatCost:['Colorless']},
  energies:Array(n).fill(PSY),attacks,tools,abilities,
  abilitySuppressions:abilities.map(abilityName=>({
    abilityName,suppressed:false}))
});
const m=()=>mon(MIM,2,[{name:'Copycat',
  cost:['Psychic','Colorless'],damage:''}]);
const v=()=>mon(MAX,4,[{name:'Max Geist',
  cost:['Colorless','Colorless','Colorless'],damage:'10+'}],
  ['Float Stone BKT 137']);
const c=()=>mon(CLE,0,[],[],['Fairy Zone']);
const r=()=>mon(REG,0,[{name:'Apex Dragon',
  cost:['Grass','Grass','Fire'],damage:''}]);
const side=(active,bench,gxUsed=false,discard=[])=>({
  active,bench,discard,stadium:[],lostZone:[],resolvingSupporter:[],
  deckCount:30,handCount:0,publicTurnRestrictions:{gxUsed,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
const evt={turn:7,sourcePrinting:REG,attackName:'Apex Dragon',
  gxAttack:false,copycatAttack:false};
function packet(seat,{activeMim=false,fairy=true,gx=false,
  apex=true,dialga=true}={}){
 const own=activeMim
  ?side(m(),[v(),...(fairy?[c()]:[])],gx,dialga?[DIAL]:[])
  :side(v(),[m(),...(fairy?[c()]:[])],gx,dialga?[DIAL]:[]);
 const view={actorSeat:seat,globalTurn:8,decisionKind:'owner-root',
   ownHand:[],ownTurnResources:{supporterPlayedTurn:0},
   ownPublic:own,opponentPublic:side(r(),[])};
 const history=apex?[{...evt}]:[];
 const receipt={version:proto.EVENT_RECEIPT_VERSION,actorSeat:seat,turn:8,
   ownerActive:{printing:own.active.printing,
     movedFromBenchToActiveThisTurn:false,knownAbilityUse:[]},
   ownerBench:own.bench.map(slot=>({printing:slot.printing,
     movedFromBenchToActiveThisTurn:false,knownAbilityUse:[]})),
   priorOpponentTurnKO:{any:false,byAttack:false},
   opponentLastTurnAttack:null,opponentLastTurnTurn:7,
   opponentLastTurnAttacks:history,opponentCopycatChoices:history,
   mimikyuCopycatCompatible:activeMim&&history.length>0};
 return {view,receipt};
}
function root(seat,kind,opt={}){
 const {view,receipt}=packet(seat,{...opt,activeMim:kind==='attack'});
 return {role:'candidate',seat,observation:view,publicEventReceipt:receipt,
  prompt:null,actionFrontier:{items:kind==='retreat'?[
    {token:'retreat',kind:'retreat',targetPrinting:MIM,
      publicMetadata:{benchIndex:0}},
    {token:'max',kind:'attack',attackName:'Max Geist'},
    {token:'pass',kind:'pass'}]:[
    {token:'copycat',kind:'attack',attackName:'Copycat'},
    {token:'pass',kind:'pass'}]}};
}
function attackPrompt(seat,kind,opt={}){
 const {view,receipt}=packet(seat,{...opt,activeMim:true});
 view.decisionKind='owner-prompt';
 const choices=(kind==='copycat'?[
   ['apex','Apex Dragon'],['other','Power Beam']
 ]:[['other','Power Beam'],['timeless','Timeless-GX']])
   .map(([token,sourceAttack])=>({token,kind:'attack',
     label:sourceAttack,publicMetadata:{sourceAttack}}));
 return {role:'candidate',seat,observation:view,publicEventReceipt:receipt,
   actionFrontier:{schema:proto.FRONTIER_SCHEMA,items:[]},
   prompt:{schema:proto.PROMPT_SCHEMA,actingSeat:seat,
     promptType:'ChooseAttackPrompt',description:'CHOOSE_ATTACK',
     source:{classification:'actor-choice',sourceKind:'card-effect',
       sourcePrinting:MIM,
       effectName:kind==='copycat'?'Copycat':'Apex Dragon',
       copiedSourcePrinting:REG,copiedAttackName:'Apex Dragon'},
     choices,publicMetadata:{selectionType:'attack'}}};
}
function check(input,expected){
 proto.validatePublicEventReceipt(input.publicEventReceipt,input.observation);
 if(input.prompt)proto.validatePrompt(input.prompt,input.seat);
 const got=policy.createPolicy({role:'candidate',seat:input.seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
 assert.deepEqual(got.decision,expected);
 proto.validateDecision(got.decision,input.prompt,
   new Set(input.actionFrontier.items.map(x=>x.token)));
 proto.validatePolicyAudit(got.policyAudit,input,got.decision,
   policy.POLICY_VERSION);
}
for(const seat of [0,1]){
 test('Full four-stage counter-ALS with refreshed post-retreat receipt '+seat,()=>{
   check(root(seat,'retreat'),{kind:'select-action',token:'retreat'});
   check(root(seat,'attack'),{kind:'select-action',token:'copycat'});
   check(attackPrompt(seat,'copycat'),{kind:'select-choice',token:'apex'});
   check(attackPrompt(seat,'apex'),{kind:'select-choice',token:'timeless'});
 });
 test('Non-Fairy Timeless extra turn still beats ordinary copied attack '+seat,
 ()=>check(attackPrompt(seat,'apex',{fairy:false}),
   {kind:'select-choice',token:'timeless'}));
 test('Spent GX blocks Timeless from nested Apex '+seat,
 ()=>check(attackPrompt(seat,'apex',{gx:true}),
   {kind:'select-choice',token:'other'}));
 test('Without last Apex record no Copycat root '+seat,
 ()=>check(root(seat,'attack',{apex:false}),
   {kind:'select-action',token:'pass'}));
 test('Without discarded Dialga no Copycat root '+seat,
 ()=>check(root(seat,'attack',{dialga:false}),
   {kind:'select-action',token:'pass'}));
}
