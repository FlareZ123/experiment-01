'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const V='Shadow Rider Calyrex V CRE 74';
const R='Radiant Eternatus CRZ 105';
const T='Tapu Lele-GX GRI 60';
const G='Girafarig LOT 94';
const M='Mimikyu GRI 58';
const L='Latias ex SSP 76';
const D='Dialga-GX UPR 100';
function side(){
 return {active:null,bench:[],stadium:[],discard:[],lostZone:[],
  resolvingSupporter:[],deckCount:53,handCount:7,prizeCount:0,
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function prompt(seat,printings,opts={}){
 const minimum=opts.optional?0:1;
 const choices=printings.map((printing,i)=>({
   token:'basic-'+i,kind:'card',printing,label:printing,
   publicMetadata:{sourceZone:'hand',ownerSeat:'actor',
     isOwnerVisible:!opts.hidden,selectionIndex:i,selectedCount:1}
 }));
 if(opts.optional)choices.push({
   token:'none',kind:'empty-selection',label:'Choose no items'});
 const view={actorSeat:seat,phase:1,globalTurn:0,
  decisionKind:'owner-prompt',ownHand:printings,
  ownTurnResources:{supporterPlayedTurn:0},
  ownPublic:side(),opponentPublic:side()};
 return {role:'candidate',seat,observation:view,
  publicEventReceipt:null,actionFrontier:{
    schema:protocol.FRONTIER_SCHEMA,items:[]},
  prompt:{schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
   promptType:'ChooseCardsPrompt',description:'CHOOSE_STARTING_POKEMONS',
   source:{classification:'actor-choice',
     sourceKind:opts.wrong?'card-effect':'engine',
     sourcePrinting:null,effectName:'CHOOSE_STARTING_POKEMONS'},
   choices,publicMetadata:{selectionType:'card-combination',
     sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
     minimumCount:minimum,maximumCount:opts.max??6,
     allowCancel:false,isSecret:false}}};
}
const cases=[
 ['Select first engine V instead of earlier Radiant/Tapu in hand',
  [R,V,T,G],{},['basic-1']],
 ['Select at most two engine V copies, holding Tapu and Radiant',
  [R,V,T,V],{},['basic-1','basic-3']],
 ['Four physical engine Basics do not flood setup Bench',
  [V,V,V,V,T,R],{},['basic-0','basic-1']],
 ['If only Radiant is the Basic, must start it (mulligan avoided)',
  [R],{},['basic-0']],
 ['Between only on-play Basics choose Tapu Active, preserve Radiant',
  [R,T],{},['basic-1']],
 ['Girafarig low-Prize Active preserves in-hand Wonder Tag',
  [T,G],{},['basic-1']],
 ['Only Tapu Lele Basic still must establish Active',
  [T],{},['basic-0']],
 ['Latias Active outranks stranded Dialga GX payload',
  [D,L],{},['basic-1']],
 ['Optional setup preserves all on-play Bench entrants for turn',
  [R,T,M],{optional:true},'none'],
 ['Optional setup benches one engine Basic without wasting Tapu',
  [R,V,T],{optional:true},['basic-1']],
 ['Optional setup benches two engines but retains counter tech',
  [V,M,V],{optional:true},['basic-0','basic-2']],
 ['Optional setup conserves third V and all on-play abilities',
  [R,V,V,T,V],{optional:true},['basic-1','basic-2']],
 ['Optional setup with no Basic selects explicit legal empty token',
  [],{optional:true},'none'],
 ['Only one setup slot prioritizes engine V over earlier Tapu',
  [T,V],{max:1},['basic-1']],
 ['Forged setup source must abstain rather than consume Basics',
  [V,R],{wrong:true},{kind:'abstain',reasonCode:'UNTRUSTED_ENGINE_SETUP_PROMPT'}],
 ['Hidden starting Basic is never inferred from opponent-facing labels',
  [V],{hidden:true},{kind:'abstain',reasonCode:'UNTRUSTED_STARTING_POKEMON_CHOICE'}]
];
for(const seat of [0,1])for(const [label,cards,opts,expected]of cases)
 test(label+' seat '+seat,()=>{
  const req=prompt(seat,cards,opts);
  // Malformed engine-source negatives are expected to be rejected by
  // the strict protocol itself; do not claim they pass wire validation.
  if(!opts.wrong)protocol.validatePrompt(req.prompt,seat);
  const got=policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
  const want=typeof expected==='string'?
    {kind:'select-choice',token:expected}:
    Array.isArray(expected)?{kind:'select-choices',tokens:expected}:expected;
  assert.deepEqual(got.decision,want);
  protocol.validateDecision(got.decision,req.prompt,new Set());
  protocol.validatePolicyAudit(got.policyAudit,req,got.decision,
    policy.POLICY_VERSION);
 });
