'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const R='Raihan EVS 152',P='Psychic Energy MEE 13',V='Shadow Rider Calyrex V CRE 74',
  MAX='Shadow Rider Calyrex VMAX CRE 75',M='Mimikyu GRI 58';
function mon(printing,energies=[]){return {printing,hp:250,damage:0,
 energies,tools:[],attacks:[],abilities:[],abilitySuppressions:[],
 printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
 weakness:[],resistance:[],retreatCost:[]}};}
function player(active,bench=[],discard=[]){return {active,bench,discard,
 stadium:[],lostZone:[],resolvingSupporter:[],deckCount:25,prizeCount:5,
 handCount:1,publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
 stadiumAndToolHaveNoEffectTurnsRemaining:0}};}
function observation(seat,options={}){
 const own=player(mon(V),[mon(MAX,[P]),mon(M)],options.noEnergy?[]:[P]);
 if(options.noDeck)own.deckCount=0;
 const opp=player(mon('Regidrago VSTAR SIT 136'));
 return {actorSeat:seat,decisionKind:'owner-root',ownHand:[R],
 ownPublic:own,opponentPublic:opp,ownTurnResources:{
 supporterPlayedTurn:options.usedSupporter?1:0,energyPlayedTurn:true}};
}
function root(seat,options={}){
 return {role:'candidate',seat,prompt:null,
 observation:observation(seat,options),
 publicEventReceipt:{priorOpponentTurnKO:{any:options.noKO?false:true}},
 actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
 {token:'raihan',kind:'play-card',actorPrinting:R,
 publicMetadata:{cardType:'supporter',handIndex:0}},
 {token:'pass',kind:'pass'}]}};
}
function choice(token,zone,index){return {
 token,kind:'energy',printing:P,label:'Attach '+P+' to '+zone,
 publicMetadata:{sourceZone:'discard',ownerSeat:'actor',
 isOwnerVisible:true,energyType:'BASIC',zone,
 ...(zone==='bench'?{benchIndex:index}:{}),
 choiceIndex:index,selectedCount:1}};
}
function attachment(seat,source=R){
 const request=root(seat);
 const ob={...request.observation,decisionKind:'owner-prompt',
 pendingPromptType:'AttachEnergyPrompt'};
 const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
 promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY_CARDS',
 source:{classification:'actor-choice',sourceKind:'card-effect',
  sourcePrinting:source,effectName:'Raihan'},
 choices:[choice('active','active',0),choice('vm','bench',0),
   choice('mimikyu','bench',1)],
 publicMetadata:{selectionType:'energy-attachment',sourceZone:'discard',
 ownerSeat:'actor',isOwnerVisible:true,energyType:'BASIC',
 minimumCount:1,maximumCount:1,allowCancel:false,count:3}};
 return {...request,observation:ob,prompt,
 publicEventReceipt:null,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function search(seat,source=R){
 const req=attachment(seat);
 const print=[MAX,P,V];
 const choices=print.map((printing,i)=>({token:'card-'+i,kind:'card',
 printing,label:printing,publicMetadata:{selectionIndex:i,selectedCount:1,
 sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}}));
 const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
 promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
 source:{classification:'actor-choice',sourceKind:'card-effect',
  sourcePrinting:source,effectName:'Raihan'},choices,
 publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
 ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,
 maximumCount:1,allowCancel:false,isSecret:false}};
 return {...req,prompt,observation:{...req.observation,
  pendingPromptType:'ChooseCardsPrompt'}};
}
for(const seat of [0,1]){
 const agent=policy.createPolicy({role:'candidate',seat,
 policyVersion:policy.POLICY_VERSION,config:{}});
 test('Raihan KO root, discard-to-Mimikyu, source-bound deck search seat '+seat,()=>{
  const req=root(seat),start=agent.decideWithAudit(req);
  assert.deepEqual(start.decision,{kind:'select-action',token:'raihan'});
  protocol.validatePolicyAudit(start.policyAudit,req,start.decision,policy.POLICY_VERSION);
  const middle=attachment(seat);protocol.validatePrompt(middle.prompt,seat);
  const attach=agent.decideWithAudit(middle);
  assert.deepEqual(attach.decision,{kind:'select-choice',token:'mimikyu'});
  protocol.validateDecision(attach.decision,middle.prompt,new Set());
  protocol.validatePolicyAudit(attach.policyAudit,middle,attach.decision,policy.POLICY_VERSION);
  const last=search(seat);protocol.validatePrompt(last.prompt,seat);
  const find=agent.decideWithAudit(last);
  assert.deepEqual(find.decision,{kind:'select-choices',tokens:['card-0']});
  protocol.validateDecision(find.decision,last.prompt,new Set());
  protocol.validatePolicyAudit(find.policyAudit,last,find.decision,policy.POLICY_VERSION);
 });
 for(const [name,opts] of [['no opponent last-turn KO',{noKO:true}],
 ['already used Supporter',{usedSupporter:true}],
 ['no Basic Energy in discard',{noEnergy:true}],
 ['no cards in deck',{noDeck:true}]])
 test('Raihan root conserves if '+name+' seat '+seat,()=>{
  const req=root(seat,opts),got=agent.decideWithAudit(req);
  assert.deepEqual(got.decision,{kind:'select-action',token:'pass'});
  protocol.validatePolicyAudit(got.policyAudit,req,got.decision,policy.POLICY_VERSION);
 });
 test('Raihan wrong exact source is rejected during both prompts seat '+seat,()=>{
  for(const req of [attachment(seat,'Raihan EVS'),search(seat,'Raihan EVS')]){
    protocol.validatePrompt(req.prompt,seat);
    const got=agent.decideWithAudit(req);
    assert.equal(got.decision.kind,'abstain');
    protocol.validatePolicyAudit(got.policyAudit,req,got.decision,policy.POLICY_VERSION);
  }
 });
}