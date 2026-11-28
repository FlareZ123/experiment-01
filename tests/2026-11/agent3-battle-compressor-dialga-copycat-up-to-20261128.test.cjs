'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const BC='Battle Compressor PHF 92',D='Dialga-GX UPR 100';
const M='Mimikyu GRI 58',V='Shadow Rider Calyrex V CRE 74';
const MAX='Shadow Rider Calyrex VMAX CRE 75';
const DRAGO='Regidrago VSTAR SIT 136';
const P='Psychic Energy MEE 13';
function mon(printing){
 return {printing,hp:210,damage:0,energies:[],tools:[],attacks:[],
   abilities:[],abilitySuppressions:[],
   printed:{stage:'BASIC',types:['Psychic'],subtypes:['Basic'],
    weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench=[],discard=[],deckCount=30){
 return {active,bench,discard,deckCount,stadium:[],lostZone:[],
   resolvingSupporter:[],handCount:2,prizeCount:6,
   publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function root(seat,opt={}){
 const view={actorSeat:seat,decisionKind:'owner-root',
  ownHand:[BC,...(opt.mimikyuHand?[M]:[]),...(opt.dialgaHand?[D]:[])],
  ownTurnResources:{supporterPlayedTurn:0},
  ownPublic:side(mon(V),opt.noMimikyu?[]:opt.mimikyuHand?[]:[mon(M)],
    opt.dialgaDiscard?[D]:[],opt.deckCount??30),
  opponentPublic:side(mon(opt.regidrago===false?
    'Iron Thorns ex TWM 77':DRAGO))};
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
   observation:view,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,
    items:[{kind:'play-card',token:'compressor',actorPrinting:BC,
      publicMetadata:{cardType:'item'}},{kind:'pass',token:'pass'}]}};
}
function prompt(seat,opt={}){
 const req=root(seat,opt),view=req.observation;
 view.decisionKind='owner-prompt';
 const cards=opt.withoutDonor?[P,MAX,V]:[P,MAX,D,V,'Guzma BUS 115'];
 req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
  promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD',
  source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:opt.wrongSource?'Mysterious Treasure FLI 113':BC,
    effectName:'Battle Compressor'},
  choices:[...cards.map((printing,i)=>({
   token:'card-'+i,kind:'card',printing,
   publicMetadata:{ownerSeat:'actor',
    isOwnerVisible:!opt.hidden,sourceZone:'deck',selectionIndex:i}
  })),...(opt.minimum===1?[]:[{kind:'empty-selection',token:'none'}])],
  publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
   ownerSeat:'actor',isOwnerVisible:true,
   minimumCount:opt.minimum??0,maximumCount:3,
   allowCancel:false,isSecret:false}};
 req.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
 return req;
}
const cases=[
 ['Play BC with visible Mimikyu and Regidrago; Dialga missing',root,{},
  {kind:'select-action',token:'compressor'}],
 ['Play BC with Mimikyu in hand before bench',root,{mimikyuHand:true},
  {kind:'select-action',token:'compressor'}],
 ['No Regidrago: do not spend singleton BC on dead payload',root,{regidrago:false},
  {kind:'select-action',token:'pass'}],
 ['Dialga already in discard: do not spend extra BC',root,{dialgaDiscard:true},
  {kind:'select-action',token:'pass'}],
 ['Dialga in hand: preserve BC for a different turn',root,{dialgaHand:true},
  {kind:'select-action',token:'pass'}],
 ['Neither Mimikyu present nor in hand: defer BC',root,{noMimikyu:true},
  {kind:'select-action',token:'pass'}],
 ['Deck search optional 0 to 3 picks exactly lone Dialga',prompt,{},
  {kind:'select-choices',tokens:['card-2']}],
 ['Deck search minimum 1 picks exactly Dialga',prompt,{minimum:1},
  {kind:'select-choices',tokens:['card-2']}],
 ['No donor in optional prompt selects only native empty',prompt,{withoutDonor:true},
  {kind:'select-choice',token:'none'}],
 ['No donor when minimum 1 fails closed',prompt,{withoutDonor:true,minimum:1},
  {kind:'abstain',reasonCode:'NO_LEGAL_CARD_SET'}],
 ['Once Dialga public discard contains donor do not discard a second',prompt,{dialgaDiscard:true},
  {kind:'select-choice',token:'none'}],
 ['Wrong Battle Compressor card source abstains',prompt,{wrongSource:true},
  {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'}]
];
for(const seat of [0,1])for(const [label,factory,opts,expected]of cases)
 test(label+' seat '+seat,()=>{
  const req=factory(seat,opts);
  if(req.prompt)protocol.validatePrompt(req.prompt,seat);
  const out=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
  assert.deepEqual(out.decision,expected);
  protocol.validateDecision(out.decision,req.prompt,
   new Set(req.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(out.policyAudit,req,out.decision,
   policy.POLICY_VERSION);
 });
