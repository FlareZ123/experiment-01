'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const V='Shadow Rider Calyrex V CRE 74';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const STONE='Forest Seal Stone SIT 156';
const P='Psychic Energy MEE 13';
function pokemon(printing,tools=[]){return {
  printing,hp:210,damage:0,tools,energies:[],
  attacks:[],abilities:[],abilitySuppressions:[],
  printed:{stage:printing.includes('VMAX')?'VMAX':'BASIC',
    types:['Psychic'],subtypes:printing.includes('VMAX')?['VMAX']:['V'],
    weakness:[],resistance:[],retreatCost:[]}
};}
function player(active,bench=[]){return {
  active,bench,discard:[],stadium:[],lostZone:[],resolvingSupporter:[],
  deckCount:20,prizeCount:6,handCount:1,
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0}
};}
function request(seat,{state='tool',vstarUsed=false,wrongTarget=false,wrongOwner=false}={}){
  const own=player(pokemon(V,state==='tool'?[]:[STONE]),[pokemon('Latias ex SSP 76')]);
  const opp=player(pokemon('Iron Thorns ex TWM 77'));
  own.publicTurnRestrictions.vstarUsed=vstarUsed;
  const observation={actorSeat:seat,decisionKind:'owner-root',
    ownHand:state==='tool'?[STONE]:[],ownPublic:own,opponentPublic:opp,
    ownTurnResources:{supporterPlayedTurn:0,vstarUsed}};
  const tool={token:'stone',kind:'play-card',actorPrinting:STONE,
    targetPrinting:wrongTarget?'Latias ex SSP 76':V,publicMetadata:{
      cardType:'trainer',handIndex:0,targetSeat:wrongOwner?'opponent':'actor',
      targetZone:'active',targetIndex:0,isOwnerVisible:true}};
  const ability={token:'star',kind:'use-ability',actorPrinting:V,
    publicMetadata:{abilityName:'Star Alchemy',sourceSeat:'actor',
      sourceZone:'active',sourceIndex:0}};
  return {role:'candidate',seat,prompt:null,
    observation,publicEventReceipt:null,actionFrontier:{
      schema:protocol.FRONTIER_SCHEMA,items:[
        state==='tool'?tool:ability,
        {token:'pass',kind:'pass'}]}};
}
function promptRequest(seat,{sourcePrinting=STONE}={}){
  const own=player(pokemon(V,[STONE]));
  const opponent=player(pokemon('Iron Thorns ex TWM 77'));
  const choices=[
    {token:'energy',kind:'card',printing:P,label:P,publicMetadata:{
      sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,
      selectionIndex:0,selectedCount:1}},
    {token:'evolution',kind:'card',printing:VMAX,label:VMAX,
      publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
        isOwnerVisible:true,selectionIndex:1,selectedCount:1}},
    {token:'empty',kind:'empty-selection',label:'Choose no items'}
  ];
  const prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting,effectName:'Star Alchemy'},
    choices,publicMetadata:{selectionType:'card-combination',
      minimumCount:0,maximumCount:1,allowCancel:false,isSecret:false,
      sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}};
  const observation={actorSeat:seat,decisionKind:'owner-prompt',
    pendingPromptType:'ChooseCardsPrompt',ownHand:[],
    ownPublic:own,opponentPublic:opponent,
    ownTurnResources:{supporterPlayedTurn:0,vstarUsed:false}};
  return {role:'candidate',seat,prompt,observation,publicEventReceipt:null,
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
for(const seat of [0,1]){
  const actor=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}});
  test('Forest Seal Stone attaches to actual Pokemon V, seat '+seat,()=>{
    const req=request(seat); const got=actor.decideWithAudit(req);
    assert.deepEqual(got.decision,{kind:'select-action',token:'stone'});
    protocol.validateDecision(got.decision,null,
      new Set(req.actionFrontier.items.map(i=>i.token)));
    protocol.validatePolicyAudit(got.policyAudit,req,got.decision,policy.POLICY_VERSION);
  });
  test('Star Alchemy root leads to source-bound VMAX deck search, seat '+seat,()=>{
    const root=request(seat,{state:'ability'});
    const first=actor.decideWithAudit(root);
    assert.deepEqual(first.decision,{kind:'select-action',token:'star'});
    protocol.validatePolicyAudit(first.policyAudit,root,first.decision,policy.POLICY_VERSION);
    const promptReq=promptRequest(seat);
    protocol.validatePrompt(promptReq.prompt,seat);
    const next=actor.decideWithAudit(promptReq);
    assert.deepEqual(next.decision,{kind:'select-choices',tokens:['evolution']});
    protocol.validateDecision(next.decision,promptReq.prompt,new Set());
    protocol.validatePolicyAudit(next.policyAudit,promptReq,next.decision,policy.POLICY_VERSION);
  });
  for(const [label,opts] of [
    ['non-V or mismatched Tool root',{wrongTarget:true}],
    ['opponent-owned Tool target',{wrongOwner:true}],
    ['already used VSTAR power',{vstarUsed:true}],
    ['already used VSTAR ability root',{state:'ability',vstarUsed:true}]
  ])test('Stone rejects '+label+' seat '+seat,()=>{
    const req=request(seat,opts);const got=actor.decideWithAudit(req);
    assert.deepEqual(got.decision,{kind:'select-action',token:'pass'});
    protocol.validatePolicyAudit(got.policyAudit,req,got.decision,policy.POLICY_VERSION);
  });
  test('Star Alchemy exact Tool source required, seat '+seat,()=>{
    const req=promptRequest(seat,{sourcePrinting:VMAX});
    protocol.validatePrompt(req.prompt,seat);
    const got=actor.decideWithAudit(req);
    assert.deepEqual(got.decision.kind,'abstain');
    protocol.validatePolicyAudit(got.policyAudit,req,got.decision,policy.POLICY_VERSION);
  });
}
