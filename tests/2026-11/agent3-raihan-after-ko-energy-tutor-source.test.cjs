'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const R='Raihan EVS 152', TM='Teammates PRC 141';
const P='Psychic Energy MEE 13', V='Shadow Rider Calyrex V CRE 74';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const M='Mimikyu GRI 58', D='Regidrago VSTAR SIT 136';
const energy=n=>Array(n).fill(P);
function mon(printing,n=0,attacks=[]){
 return {printing,hp:320,damage:0,energies:energy(n),tools:[],attacks,
  abilities:[],abilitySuppressions:[],
  printed:{stage:'BASIC',subtypes:['V'],types:['Psychic'],
   weakness:[],resistance:[],retreatCost:['Colorless']}};
}
const maxAttack={name:'Max Geist',
 cost:['Colorless','Colorless','Colorless'],damage:'10+'};
const copycat={name:'Copycat',cost:['Psychic','Colorless'],damage:''};
function side(active,bench=[],discard=[]){
 return {active,bench,discard,deckCount:30,handCount:2,prizeCount:4,
  lostZone:[],stadium:[],resolvingSupporter:[],
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
   stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function receipt(view,ko){
 function seen(p){return p?{printing:p.printing,
   movedFromBenchToActiveThisTurn:false,knownAbilityUse:[]}:null}
 return {version:protocol.EVENT_RECEIPT_VERSION,
  actorSeat:view.actorSeat,turn:view.globalTurn,
  ownerActive:seen(view.ownPublic.active),
  ownerBench:view.ownPublic.bench.map(seen),
  priorOpponentTurnKO:{any:ko,byAttack:ko},
  opponentLastTurnAttack:null,opponentLastTurnTurn:7,
  opponentLastTurnAttacks:[],opponentCopycatChoices:[],
  mimikyuCopycatCompatible:false};
}
function request(seat,{ko=true,energyInDiscard=true,used=0,
   alreadyFunded=false,offerTeammates=false,dragon=false}={}){
 const active=mon(VMAX,alreadyFunded?3:2,[maxAttack]);
 const target=mon(dragon?D:'Iron Thorns ex TWM 77');
 if(dragon)target.printed.types=['Dragon'];
 const view={actorSeat:seat,globalTurn:8,decisionKind:'owner-root',
  ownHand:[R,...(offerTeammates?[TM]:[])],
  ownTurnResources:{supporterPlayedTurn:used},
  ownPublic:side(active,[],energyInDiscard?[P]:[]),
  opponentPublic:side(target)};
 const req={role:'candidate',seat,prompt:null,observation:view,
  publicEventReceipt:receipt(view,ko),
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
    {kind:'play-card',token:'raihan',actorPrinting:R,
     publicMetadata:{cardType:'supporter'}},
    ...(offerTeammates?[{kind:'play-card',token:'teammates',
      actorPrinting:TM,publicMetadata:{cardType:'supporter'}}]:[]),
    {kind:'pass',token:'pass'}]}};
 return req;
}
function energyPrompt(req,source=R,hidden=false){
 const view=req.observation;view.decisionKind='owner-prompt';
 view.ownPublic.bench=[mon(VMAX,1,[maxAttack])];
 req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:req.seat,
  promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY',
  source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:source,effectName:'Raihan'},
  choices:[
    {kind:'energy',token:'bench',printing:P,
      publicMetadata:{ownerSeat:'actor',isOwnerVisible:!hidden,
       sourceZone:'discard',energyType:'BASIC',zone:'bench',benchIndex:0}},
    {kind:'energy',token:'active',printing:P,
      publicMetadata:{ownerSeat:'actor',isOwnerVisible:!hidden,
       sourceZone:'discard',energyType:'BASIC',zone:'active'}}
  ],
  publicMetadata:{selectionType:'energy-attachment',
    sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,
    energyType:'BASIC',minimumCount:1,maximumCount:1,
    allowCancel:false,isSecret:false}};
 req.publicEventReceipt=receipt(view,true);
 req.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
 return req;
}
function recipientPrompt(req){
 const view=req.observation;view.decisionKind='owner-prompt';
 view.ownPublic.bench=[mon(VMAX,1,[maxAttack])];
 req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:req.seat,
  promptType:'ChoosePokemonPrompt',description:'CHOOSE_POKEMON',
  source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:R,effectName:'Raihan'},
  choices:[
    {kind:'pokemon',token:'bench',printing:VMAX,
     publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
       targetZone:'bench',benchIndex:0}},
    {kind:'pokemon',token:'active',printing:VMAX,
     publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
       targetZone:'active'}}
  ],
  publicMetadata:{selectionType:'pokemon',ownerSeat:'actor',
    isOwnerVisible:true,minimumCount:1,maximumCount:1,
    allowCancel:false,isSecret:false}};
 req.publicEventReceipt=receipt(view,true);
 req.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
 return req;
}
function cardPrompt(req,zone,choices,wrong=false) {
 const view=req.observation;view.decisionKind='owner-prompt';
 req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:req.seat,
  promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:wrong?'Arven SVI 166':R,effectName:'Raihan'},
  choices:choices.map((printing,index)=>({
   kind:'card',token:'card-'+index,printing,
   publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
     sourceZone:zone,selectionIndex:index}})),
  publicMetadata:{selectionType:'card-combination',
   sourceZone:zone,ownerSeat:'actor',isOwnerVisible:true,
   minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false}};
 req.publicEventReceipt=receipt(view,true);
 req.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
 return req;
}
const cases=[
 ['Raihan after source-confirmed KO funds otherwise unpayable Active',
  seat=>request(seat),{kind:'select-action',token:'raihan'}],
 ['Raihan excluded before opponent-turn KO',
  seat=>request(seat,{ko:false}),{kind:'select-action',token:'pass'}],
 ['Raihan excluded with no Basic Psychic Energy in discard',
  seat=>request(seat,{energyInDiscard:false}),{kind:'select-action',token:'pass'}],
 ['Raihan excluded after Supporter already played',
  seat=>request(seat,{used:1}),{kind:'select-action',token:'pass'}],
 ['Raihan multi-axis funding wins over Teammates when it opens attack',
  seat=>request(seat,{offerTeammates:true}),{kind:'select-action',token:'raihan'}],
 ['Already funded Active: Teammates two-card tutor prevails',
  seat=>request(seat,{offerTeammates:true,alreadyFunded:true}),
  {kind:'select-action',token:'teammates'}],
 ['Typed discard energy assignment prefers newly funded Active',
  seat=>energyPrompt(request(seat)),
  {kind:'select-choice',token:'active'}],
 ['Typed discard energy assignment rejects wrong source',
  seat=>energyPrompt(request(seat),'Arven SVI 166'),
  {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'}],
 ['Typed discard energy assignment refuses hidden energy identities',
  seat=>energyPrompt(request(seat),R,true),
  {kind:'abstain',reasonCode:'NO_VISIBLE_ENERGY_CHOICE'}],
 ['Two-step native Pokémon recipient selects Active to enable attack',
  seat=>recipientPrompt(request(seat)),
  {kind:'select-choices',tokens:['active']}],
 ['Card selection from discard only accepts Psychic Basic Energy',
  seat=>cardPrompt(request(seat),'discard',[M,P]),
  {kind:'select-choices',tokens:['card-1']}],
 ['After attach, Raihan searches missing second CRE74 from deck',
  seat=>cardPrompt(request(seat),'deck',['Latias ex SSP 76',V]),
  {kind:'select-choices',tokens:['card-1']}],
 ['Raihan tutor wrong source rejected',
  seat=>cardPrompt(request(seat),'deck',[V],true),
  {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'}]
];
for(const seat of [0,1])for(const [label,make,expected]of cases)
 test(label+' seat '+seat,()=>{
  const req=make(seat);
  protocol.validatePublicEventReceipt(req.publicEventReceipt,req.observation);
  if(req.prompt)protocol.validatePrompt(req.prompt,seat);
  const out=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
  assert.deepEqual(out.decision,expected);
  protocol.validateDecision(out.decision,req.prompt,
    new Set(req.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(out.policyAudit,req,out.decision,
    policy.POLICY_VERSION);
 });
