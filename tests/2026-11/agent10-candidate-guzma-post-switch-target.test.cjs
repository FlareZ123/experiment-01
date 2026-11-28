'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const E='Psychic Energy MEE 13';
function mon(name,hp,damage,energies=[],attacks=[],tags=['Basic']){
 return {printing:name,hp,damage,energies,tools:[],attacks,
   abilities:[],abilitySuppressions:[],
   printed:{stage:tags.includes('VMAX')?'VMAX':'BASIC',
   subtypes:tags,types:['Psychic'],weakness:[],resistance:[],retreatCost:[]}};
}
function player(active,bench=[]){return {active,bench,
 stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
 deckCount:30,handCount:1,prizeCount:6,
 publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}};}
function pokemonChoice(token,slot,i,owner='opponent'){
 return {token,kind:'pokemon',printing:slot.printing,
 label:(owner==='actor'?'Your':'Opponent')+' bench '+(i+1)+': '+slot.printing,
 publicMetadata:{ownerSeat:owner,isOwnerVisible:true,targetZone:'bench',
 benchIndex:i,selectionIndex:i,selectedCount:1}};
}
function scenario(seat,withBench=true){
 const latias=mon('Latias ex SSP 76',210,0,[E,E,E],
  [{name:'Eon Blade',cost:['Psychic','Psychic','Colorless'],damage:'200'}]);
 const rider=mon('Shadow Rider Calyrex VMAX CRE 75',320,0,[E,E,E],
  [{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}],['VMAX']);
 const vmax=mon('Shadow Rider Calyrex VMAX CRE 75',320,125,[],[],['VMAX']);
 const mimikyu=mon('Mimikyu GRI 58',70,0,[],[]);
 const own=player(latias,withBench?[rider]:[]);
 const enemy=player(mon('Iron Thorns ex TWM 77',230,0),[vmax,mimikyu]);
 const observation={actorSeat:seat,decisionKind:'owner-prompt',
  ownHand:['Guzma BUS 115'],ownPublic:own,
  opponentPublic:enemy,ownTurnResources:{supporterPlayedTurn:0}};
 const p={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
  promptType:'ChoosePokemonPrompt',description:'CHOOSE_POKEMON_TO_SWITCH',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
  choices:[pokemonChoice('high-prizes',vmax,0),
    pokemonChoice('payable-ko',mimikyu,1)],
  publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
   allowCancel:false,isSecret:false}};
 const promptRequest={role:'candidate',seat,prompt:p,
   observation:{...observation,pendingPromptType:'ChoosePokemonPrompt'},
   publicEventReceipt:null,
   actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
 const root={role:'candidate',seat,prompt:null,
  observation:{...observation,decisionKind:'owner-root'},
  publicEventReceipt:null,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,
  items:[{token:'guzma',kind:'play-card',actorPrinting:'Guzma BUS 115',
    publicMetadata:{cardType:'supporter'}},
    {token:'pass',kind:'pass'}]}};
 return {root,promptRequest,rider};
}
for(const seat of [0,1]){
 test('Guzma root and first gust use Bench successor, not departing Active, seat '+seat,()=>{
  const {root,promptRequest}=scenario(seat,true);
  const agent=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}});
  const rootDecision=agent.decideWithAudit(root);
  assert.deepEqual(rootDecision.decision,{kind:'select-action',token:'guzma'});
  const req=promptRequest;
  protocol.validatePrompt(req.prompt,seat);
  const got=agent.decideWithAudit(req);
  assert.deepEqual(got.decision,{kind:'select-choices',tokens:['payable-ko']});
  protocol.validateDecision(got.decision,req.prompt,new Set());
  protocol.validatePolicyAudit(got.policyAudit,req,got.decision,policy.POLICY_VERSION);
 });
 test('Guzma empty own Bench correctly uses current Active for gust target, seat '+seat,()=>{
  const {promptRequest}=scenario(seat,false);
  const agent=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}});
  protocol.validatePrompt(promptRequest.prompt,seat);
  const got=agent.decideWithAudit(promptRequest);
  assert.deepEqual(got.decision,{kind:'select-choices',tokens:['high-prizes']});
  protocol.validatePolicyAudit(got.policyAudit,promptRequest,got.decision,
    policy.POLICY_VERSION);
 });
}
