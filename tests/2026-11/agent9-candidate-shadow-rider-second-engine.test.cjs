'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const worker=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const V='Shadow Rider Calyrex V CRE 74';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const E='Psychic Energy MEE 13';
const FOG='Fog Crystal CRE 140';
const ULTRA='Ultra Ball BRS 150';
function mon(printing=VMAX,energies=[],stage='VMAX'){
 return {printing,hp:320,damage:0,printed:{stage,subtypes:[stage],
   types:['Psychic'],weakness:[],resistance:[],retreatCost:[]},
   energies,tools:[],attacks:[],abilities:[],abilitySuppressions:[]};
}
function player(active,bench,deck=30){
 return {active,bench,deckCount:deck,prizeCount:6,handCount:4,
   stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
   publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function make(seat,{active=mon(VMAX,[E,E,E]),bench=[],hand=[],
  actions=[],prompt=null}={}){
 const opponent=mon('Mimikyu GRI 58',[],'Basic');
 return {role:'candidate',seat,prompt,publicEventReceipt:null,
   observation:{actorSeat:seat,decisionKind:prompt?'owner-prompt':'owner-root',
     ...(prompt?{pendingPromptType:prompt.promptType}:{}),
     ownHand:hand,ownPublic:player(active,bench),
     opponentPublic:player(opponent,[]),
     ownTurnResources:{supporterPlayedTurn:0}},
   actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:actions}};
}
function play(printing,kind='bench'){
 return {token:'play',kind:'play-card',actorPrinting:printing,
   ...(kind==='bench'?{targetPrinting:printing}:{ }),
   publicMetadata:kind==='bench'?
     {targetSeat:'actor',targetZone:'bench',targetIndex:0}:
     {cardType:'item'}};
}
function decision(req){
 return worker.createPolicy({role:'candidate',seat:req.seat,
   policyVersion:worker.POLICY_VERSION,config:{}}).decideWithAudit(req);
}
function promptFor(seat,effect,items){
 return {schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
   promptType:'ChooseCardsPrompt',description:null,
   source:{classification:'actor-choice',sourceKind:'card-effect',
     sourcePrinting:effect==='Fog Crystal'?FOG:ULTRA,effectName:effect},
   choices:items.map((name,index)=>({
     token:'card'+index,kind:'card',printing:name,label:name,
     publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
       isOwnerVisible:true,choiceIndex:index}
   })).concat([{token:'empty',kind:'empty-selection',
     label:'Select no card'}]),
   publicMetadata:{selectionType:'card-combination',minimumCount:0,
     maximumCount:1,count:items.length,allowCancel:false,
     sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}};
}
for(const seat of [0,1]){
 for(const [label,bench,printing,want] of [
   ['active VMAX and no Basic V, bench second source CRE74',[],V,'play'],
   ['active Basic V without VMAX, bench second CRE74',
     [],V,'play'],
   ['two VMAX already on board, conserve extra Basic V',
     [mon(VMAX,[],'VMAX')],V,'pass'],
   ['one VMAX plus one Basic V, conserve third Basic V',
     [mon(V,[],'Basic')],V,'pass'],
   ['four occupied Bench slots, reserve last open slot for counters',
     [mon('Mimikyu GRI 58',[],'Basic'),mon('Latias ex SSP 76',[],'Basic'),
      mon('Girafarig LOT 94',[],'Basic'),mon('Marshadow UNB 81',[],'Basic')],V,'pass'],
   ['no engine in play: first Basic V still high priority',
     [],V,'play']
 ]){
   test('source Basic stage root '+label+' seat '+seat,()=>{
     const active=label.startsWith('active Basic')?
       mon(V,[E,E,E],'Basic'):
       label.startsWith('no engine')?
       mon('Mimikyu GRI 58',[],'Basic'):
       mon(VMAX,[E,E,E]);
     const req=make(seat,{active,bench,hand:[V],actions:[play(printing),
       {token:'pass',kind:'pass'}]});
     const got=decision(req);
     assert.deepEqual(got.decision,{kind:'select-action',token:want});
     assert.deepEqual(got.policyAudit.selectedTokens,[want]);
   });
 }
 for(const [label,bench,item,want] of [
   ['existing VMAX seeks second Basic through Fog Crystal',[],FOG,'play'],
   ['existing VMAX and Basic seeks second VMAX through Ultra Ball',
     [mon(V,[],'Basic')],ULTRA,'play']
 ]){
   test('engine Item root '+label+' seat '+seat,()=>{
     const req=make(seat,{bench,hand:[item,E,'VS Seeker PHF 109',
       'VS Seeker PHF 109'],actions:[play(item,'item'),
         {token:'pass',kind:'pass'}]});
     const got=decision(req);
     assert.deepEqual(got.decision,{kind:'select-action',token:want});
   });
 }
 for(const [label,bench,effect,items,want] of [
   ['Fog finds second V while VMAX already established',[],
      'Fog Crystal',[V,E],'card0'],
   ['Ultra finds second VMAX when first VMAX exists',
      [mon(V,[],'Basic')],'Ultra Ball',[VMAX,E],'card0'],
   ['No third VMAX needed, prefer energy',
      [mon(VMAX,[],'VMAX')],'Ultra Ball',[VMAX,E],'card1']
 ]){
   test('source-bound deck search '+label+' seat '+seat,()=>{
     const prompt=promptFor(seat,effect,items);
     protocol.validatePrompt(prompt,seat);
     const req=make(seat,{bench,prompt});
     const got=decision(req);
     assert.deepEqual(got.decision,{kind:'select-choices',tokens:[want]});
     protocol.validateDecision(got.decision,prompt,new Set());
     protocol.validatePolicyAudit(got.policyAudit,req,got.decision,
       worker.POLICY_VERSION);
   });
 }
 test('two-stage CRE74 bench then CRE75 evolve and second Door seat '+seat,()=>{
   const root=make(seat,{hand:[V],actions:[play(V),
     {token:'pass',kind:'pass'}]});
   assert.equal(decision(root).decision.token,'play');
   // Constructed board progression; no native Store settlement claimed.
   const newBasic=mon(V,[],'Basic');
   const evolve=make(seat,{bench:[newBasic],hand:[VMAX],
     actions:[{token:'evolve',kind:'play-card',actorPrinting:VMAX,
       targetPrinting:V,publicMetadata:{targetSeat:'actor',
         targetZone:'bench',targetIndex:0}},
       {token:'pass',kind:'pass'}]});
   assert.equal(decision(evolve).decision.token,'evolve');
   const evolved=mon(VMAX,[],'VMAX');
   const secondDoor=make(seat,{bench:[evolved],hand:[E],
     actions:[{token:'second-door',kind:'use-ability',actorPrinting:VMAX,
       publicMetadata:{abilityName:'Underworld Door'}},
       {token:'pass',kind:'pass'}]});
   assert.equal(decision(secondDoor).decision.token,'second-door');
 });
}
