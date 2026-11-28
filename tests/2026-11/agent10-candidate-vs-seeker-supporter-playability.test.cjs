'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const VS='VS Seeker PHF 109',T='Teammates PRC 141',
 AC='Acerola BUS 112',I='Iono PAL 185';
function mon(printing,damage=0){return {printing,hp:320,damage,
 energies:[],tools:[],attacks:[],abilities:[],abilitySuppressions:[],
 printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
 weakness:[],resistance:[],retreatCost:[]}};}
function player(active,discard=[]){return {active,bench:[],discard,
 stadium:[],lostZone:[],resolvingSupporter:[],deckCount:25,
 handCount:2,prizeCount:4,publicTurnRestrictions:{
 gxUsed:false,vstarUsed:false,itemPlayLocked:false,
 stadiumAndToolHaveNoEffectTurnsRemaining:0}};}
function req(seat,{discard=[T],KO=false,ownDamage=0,
 ownHand=[VS],oppHand=7,supporterUsed=false}={}){
 const own=player(mon('Shadow Rider Calyrex VMAX CRE 75',ownDamage),discard),
 opp=player(mon('Iron Thorns ex TWM 77'));
 own.handCount=ownHand.length;opp.handCount=oppHand;
 return {role:'candidate',seat,prompt:null,
 observation:{actorSeat:seat,decisionKind:'owner-root',ownHand,
 ownPublic:own,opponentPublic:opp,
 ownTurnResources:{supporterPlayedTurn:supporterUsed?1:0}},
 publicEventReceipt:{priorOpponentTurnKO:{any:KO}},
 actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
 {token:'vs',kind:'play-card',actorPrinting:VS,
 publicMetadata:{cardType:'item',handIndex:0}},
 {token:'pass',kind:'pass'}]}};
}
function prompt(seat,opts={}){
 const r=req(seat,opts);
 const cards=(opts.discard??[T]).map((printing,i)=>({
  kind:'card',token:'supporter-'+i,printing,label:printing,
  publicMetadata:{sourceZone:'discard',ownerSeat:'actor',
   isOwnerVisible:true,selectionIndex:i,selectedCount:1}}));
 const p={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
 promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
 source:{classification:'actor-choice',sourceKind:'card-effect',
  sourcePrinting:opts.forged?'VS Seeker PHF':'VS Seeker PHF 109',
  effectName:'VS Seeker'},
 choices:cards,publicMetadata:{selectionType:'card-combination',
 sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,
 minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false}};
 return {...r,prompt:p,observation:{...r.observation,
  decisionKind:'owner-prompt',pendingPromptType:'ChooseCardsPrompt'},
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
for(const seat of [0,1]){
 const bot=policy.createPolicy({role:'candidate',seat,
  policyVersion:policy.POLICY_VERSION,config:{}});
 test('VS Seeker preserves itself when only Teammates without prior KO seat '+seat,()=>{
  const r=req(seat,{discard:[T],KO:false});
  const got=bot.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-action',token:'pass'});
  protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
 test('VS Seeker now recovers actually playable Teammates after KO seat '+seat,()=>{
  const r=req(seat,{discard:[T],KO:true});
  const first=bot.decideWithAudit(r);
  assert.deepEqual(first.decision,{kind:'select-action',token:'vs'});
  const later=prompt(seat,{discard:[T],KO:true});
  protocol.validatePrompt(later.prompt,seat);
  const second=bot.decideWithAudit(later);
  assert.deepEqual(second.decision,{kind:'select-choices',tokens:['supporter-0']});
  protocol.validateDecision(second.decision,later.prompt,new Set());
  protocol.validatePolicyAudit(second.policyAudit,later,second.decision,policy.POLICY_VERSION);
 });
 test('VS Seeker rejects undamaged Acerola and retrieves it when damaged seat '+seat,()=>{
  assert.deepEqual(bot.decideWithAudit(req(seat,{discard:[AC]})).decision,
    {kind:'select-action',token:'pass'});
  const live=req(seat,{discard:[AC],ownDamage:110});
  assert.deepEqual(bot.decideWithAudit(live).decision,
    {kind:'select-action',token:'vs'});
 });
 test('VS Seeker resolves legal Iono and saves Item if Supporter already in hand seat '+seat,()=>{
  const r=req(seat,{discard:[I],oppHand:7});
  assert.deepEqual(bot.decideWithAudit(r).decision,
    {kind:'select-action',token:'vs'});
  assert.deepEqual(bot.decideWithAudit(req(seat,{discard:[I],
    ownHand:[VS,'Guzma BUS 115']})).decision,
    {kind:'select-action',token:'pass'});
 });
 test('VS Seeker card prompt never trusts raw source alias seat '+seat,()=>{
  const r=prompt(seat,{discard:[T],KO:true,forged:true});
  const result=bot.decideWithAudit(r);
  assert.equal(result.decision.kind,'abstain');
  protocol.validatePolicyAudit(result.policyAudit,r,result.decision,policy.POLICY_VERSION);
 });
}