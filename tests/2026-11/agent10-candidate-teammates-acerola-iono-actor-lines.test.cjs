'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const T='Teammates PRC 141',A='Acerola BUS 112',I='Iono PAL 185',
 V='Shadow Rider Calyrex V CRE 74',MAX='Shadow Rider Calyrex VMAX CRE 75',
 P='Psychic Energy MEE 13';
function mon(printing,hp=320,damage=0,energies=[]){return {
 printing,hp,damage,energies,tools:[],attacks:[],abilities:[],
 abilitySuppressions:[],printed:{stage:'Basic',
 subtypes:printing===MAX?['VMAX']:['Basic'],types:['Psychic'],
 weakness:[],resistance:[],retreatCost:[]}};}
function player(active,bench=[]){return {active,bench,discard:[],
 stadium:[],lostZone:[],resolvingSupporter:[],deckCount:25,
 handCount:2,prizeCount:5,publicTurnRestrictions:{gxUsed:false,
 vstarUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}};}
function req(seat,card,opts={}){
 const own=player(opts.active??mon(V),opts.bench??[]);
 const opp=player(mon('Iron Thorns ex TWM 77'));
 own.handCount=opts.ownHand??2;opp.handCount=opts.oppHand??7;
 if(opts.noDeck)own.deckCount=0;
 return {role:'candidate',seat,prompt:null,observation:{
 actorSeat:seat,decisionKind:'owner-root',ownHand:[card],
 ownPublic:own,opponentPublic:opp,
 ownTurnResources:{supporterPlayedTurn:opts.supporterUsed?1:0}},
 publicEventReceipt:{priorOpponentTurnKO:{any:!opts.noKO}},
 actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
 {token:'supporter',kind:'play-card',actorPrinting:card,
 publicMetadata:{cardType:'supporter',handIndex:0}},
 {token:'pass',kind:'pass'}]}};
}
function chooseCard(seat,source=T){
 const r=req(seat,T),cards=[MAX,P,V].map((printing,i)=>({
 token:'card-'+i,kind:'card',printing,label:printing,
 publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
 isOwnerVisible:true,selectionIndex:i,selectedCount:1}}));
 const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
 promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
 source:{classification:'actor-choice',sourceKind:'card-effect',
 sourcePrinting:source,effectName:'Teammates'},choices:cards,
 publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
 ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,
 maximumCount:2,allowCancel:false,isSecret:false}};
 return {...r,prompt,publicEventReceipt:null,
 observation:{...r.observation,decisionKind:'owner-prompt',
 pendingPromptType:'ChooseCardsPrompt'},
 actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function pkmChoice(token,zone,i,printing=MAX,labelOverride=null){
 return {token,kind:'pokemon',printing,
 label:labelOverride??(zone==='active'?'Your active: '+printing:
   'Your bench '+(i+1)+': '+printing),
 publicMetadata:{ownerSeat:'actor',targetZone:zone,
 ...(zone==='active'?{slotIndex:0}:{benchIndex:i}),
 isOwnerVisible:true,selectionIndex:i,selectedCount:1}};
}
function acerola(seat,opts={}){
 const r=req(seat,A,{active:opts.active??mon(V,210,0),
 bench:opts.bench??[mon(MAX,320,20,[P]),mon(MAX,320,275,[P,P,P])]});
 const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
 promptType:'ChoosePokemonPrompt',description:'CHOOSE_POKEMON_TO_PICK_UP',
 source:{classification:'actor-choice',sourceKind:'card-effect',
 sourcePrinting:opts.source??A,effectName:'Acerola'},
 choices:opts.choices??[
 pkmChoice('healthy','bench',0),pkmChoice('critical','bench',1)],
 publicMetadata:{selectionType:'pokemon',minimumCount:1,
 maximumCount:1,allowCancel:false,isSecret:false}};
 return {...r,prompt,publicEventReceipt:null,
 observation:{...r.observation,decisionKind:'owner-prompt',
 pendingPromptType:'ChoosePokemonPrompt'},
 actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
for(const seat of [0,1]){
 const worker=policy.createPolicy({role:'candidate',seat,
 policyVersion:policy.POLICY_VERSION,config:{}});
 test('Teammates after-KO root and source-bound 2-card access seat '+seat,()=>{
  const root=req(seat,T),r=worker.decideWithAudit(root);
  assert.deepEqual(r.decision,{kind:'select-action',token:'supporter'});
  protocol.validatePolicyAudit(r.policyAudit,root,r.decision,policy.POLICY_VERSION);
  const follow=chooseCard(seat);protocol.validatePrompt(follow.prompt,seat);
  const result=worker.decideWithAudit(follow);
  assert.deepEqual(result.decision,{kind:'select-choices',tokens:['card-0','card-2']});
  protocol.validatePolicyAudit(result.policyAudit,follow,result.decision,policy.POLICY_VERSION);
  protocol.validateDecision(result.decision,follow.prompt,new Set());
 });
 test('Teammates KO, deck, Supporter and exact-source negatives seat '+seat,()=>{
  for(const opts of [{noKO:true},{noDeck:true},{supporterUsed:true}])
   assert.deepEqual(worker.decideWithAudit(req(seat,T,opts)).decision,
    {kind:'select-action',token:'pass'});
  const bad=worker.decideWithAudit(chooseCard(seat,'Teammates PRC'));
  assert.equal(bad.decision.kind,'abstain');
 });
 test('Acerola physically picks critical VMAX instead of same-print Bench twin seat '+seat,()=>{
  const r=acerola(seat);protocol.validatePrompt(r.prompt,seat);
  const d=worker.decideWithAudit(r);
  assert.deepEqual(d.decision,{kind:'select-choices',tokens:['critical']});
  protocol.validatePolicyAudit(d.policyAudit,r,d.decision,policy.POLICY_VERSION);
 });
 test('Acerola can return damaged Active VMAX, not merely Bench seat '+seat,()=>{
  const r=acerola(seat,{active:mon(MAX,320,280,[P,P,P]),
   bench:[mon(MAX,320,20,[P])],choices:[
   pkmChoice('active','active',0),pkmChoice('bench','bench',0)]});
  const got=worker.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-choices',tokens:['active']});
  protocol.validateDecision(got.decision,r.prompt,new Set());
 });
 test('Acerola source, physical metadata and damage root gates seat '+seat,()=>{
  const live=req(seat,A,{bench:[mon(MAX,320,280)]});
  assert.deepEqual(worker.decideWithAudit(live).decision,
    {kind:'select-action',token:'supporter'});
  const noDamage=req(seat,A,{bench:[mon(MAX,320,0)]});
  assert.deepEqual(worker.decideWithAudit(noDamage).decision,
    {kind:'select-action',token:'pass'});
  assert.equal(worker.decideWithAudit(acerola(seat,{source:'Acerola BUS'})).decision.kind,
    'abstain');
  const fake=acerola(seat,{choices:[pkmChoice('false','bench',7)]});
  assert.equal(worker.decideWithAudit(fake).decision.kind,'abstain');
 });
 test('Iono root correct hand-disadvantage and contention gates seat '+seat,()=>{
  assert.deepEqual(worker.decideWithAudit(req(seat,I)).decision,
    {kind:'select-action',token:'supporter'});
  for(const opts of [{supporterUsed:true},{ownHand:5},
    {oppHand:2},{noDeck:true}])
   assert.deepEqual(worker.decideWithAudit(req(seat,I,opts)).decision,
    {kind:'select-action',token:'pass'});
 });
}