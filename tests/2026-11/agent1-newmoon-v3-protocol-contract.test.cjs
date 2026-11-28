'use strict';
const P=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {POLICY_VERSION,createPolicy,DECK_SHA}=require('../../simulation/evaluation/2026-11/agent1-newmoon-v3-finisher-slice.cjs');
const assert=require('node:assert/strict');
const special=()=>Object.fromEntries(P.PUBLIC_RESTRICTION_KEYS.map(k=>[
 k,k==='cannotUseAttacksNextTurn'?[]:
 k.includes('Name')?null:
 k.startsWith('attackCost')?0:false
]));
const turnLocks=()=>Object.fromEntries(P.PLAYER_RESTRICTION_KEYS.map(k=>[
 k,k==='attackMaxEnergy'?null:k==='ignoreAttackCostCardTypes'?[]:
 ['attackLockTurnsRemaining','attackMaxEnergyTurnsRemaining',
  'ignoreAttackCostTurnsRemaining','stadiumAndToolHaveNoEffectTurnsRemaining'].includes(k)?0:false
]));
function slot(printing,name,abilities=[],tools=[],energyCount=0,damage=0) {
 const basic=name==='Galarian Articuno V';
 return {printing,name,hp:basic?210:140,damage,lastPlayedOrEvolvedTurn:1,
  printed:{stage:basic?'Basic':'Stage 1',subtypes:basic?['Basic','V']:['Stage 1'],
   types:['Psychic'],retreatCost:['Colorless'],weakness:[],resistance:[]},
  specialConditions:[],publicRestrictions:special(),evolutionPrintings:[],
  energies:Array.from({length:energyCount},()=> 'Basic Psychic Energy'),
  tools,attacks:[{name:'Will-O-Wisp',cost:['Psychic','Psychic'],
   damage:'50',damageCalculation:null,text:null,gxAttack:false,barrage:false}],
  abilities,abilityDetails:abilities.map(name=>({name,powerType:'ABILITY',text:null})),
  abilitySuppressions:abilities.map(abilityName=>({
   abilityName,suppressed:false,reasonCode:null,sourcePrinting:null
  }))};
}
const dus=(tools=[],energyCount=2,damage=0)=>slot('Dusclops SFA 019','Dusclops',
 ['Cursed Blast'],tools,energyCount,damage);
const bus=(damage=0)=>slot('Vileplume BUS 006','Vileplume',
 ['Disgusting Pollen'],['Stealthy Hood UNB 186'],0,damage);
const aor=()=>slot('Vileplume AOR 003','Vileplume',['Irritating Pollen']);
const art=()=>slot('Galarian Articuno V CRE 058','Galarian Articuno V',[],
 ['Forest Seal Stone SIT 156']);
function player(active,bench,prizeCount,handCount,stadium=[]) {
 return {active,bench,stadium,discard:[],lostZone:[],resolvingSupporter:[],
  publicHand:null,prizeSlots:Array.from({length:prizeCount},(_,index)=>({index})),
  publicTurnRestrictions:turnLocks(),handCount,deckCount:35,prizeCount};
}
const turnResources=()=>Object.fromEntries(P.TURN_RESOURCE_KEYS.map(k=>[k,
 k==='vstarUsed'||k.endsWith('Locked')?false:0]));
function view(opts={}) {
 const own=player(opts.active??dus(),opts.bench??[dus()],opts.ownPrize??3,
  opts.ownHandCount??5,opts.ownStadium??[]);
 const opp=player(opts.bus??bus(),opts.oppBench??[aor()],opts.oppPrize??3,
  opts.oppHandCount??7,opts.oppStadium??[]);
 const ownTurnResources=turnResources();
 ownTurnResources.supporterPlayedTurn=opts.supporterPlayedTurn??0;
 return {actorSeat:0,globalTurn:3,phase:4,decisionKind:'owner-root',
  pendingPromptType:null,pendingOwnerDeckSearch:false,
  ownHand:opts.hand??['Tool Jammer BST 136'],ownPublic:own,opponentPublic:opp,
  ownTurnResources,ownerK1:null};
}
const use=(token,abilityName,zone='bench',index=0)=>({
 token,kind:'use-ability',publicMetadata:{
  abilityName,sourceSeat:'actor',sourceZone:zone,
  ...(zone==='bench'?{sourceIndex:index}:{})
 }
});
const play=(token,printing,zone=null)=>({
 token,kind:'play-card',actorPrinting:printing,
 publicMetadata:{
  cardType:'trainer',handIndex:0,
  ...(zone?{targetSeat:'actor',targetZone:zone,targetIndex:zone==='bench'?0:0,
   isOwnerVisible:true}:{})
 }
});
const willow=()=>({token:'willow',kind:'attack',attackName:'Will-O-Wisp',
 actorPrinting:'Dusclops SFA 019',publicMetadata:{attackCostPayable:true}});
const pass=()=>({token:'pass',kind:'pass'});
const copiedGengarHorror=(token,index)=>({token,kind:'attack',
 actorPrinting:'Gengar & Mimikyu-GX TEU 053',attackName:'Horror House-GX',
 publicMetadata:{attackCostPayable:true,attackSource:{
   sourceKind:'bench-pokemon',sourceSlot:'BENCH',sourceIndex:index,
   sourceCardName:'Gengar & Mimikyu-GX',
   sourceCardFullName:'Gengar & Mimikyu-GX TEU 053',attackName:'Horror House-GX'
 }}});

function pokemonPrompt(effectName,sourcePrinting,choices) {
 return {schema:P.PROMPT_SCHEMA,actingSeat:0,promptType:'ChoosePokemonPrompt',
  description:'Choose a target',
  source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting,effectName},
  choices:choices.map((x,i)=>({
   token:x.token,kind:'pokemon',printing:x.printing,label:x.printing,
   publicMetadata:{selectionType:'pokemon',selectionIndex:i,selectedCount:1,
    ownerSeat:x.ownerSeat,targetZone:x.zone,
    ...(x.zone==='bench'?{benchIndex:x.index??0}:{slotIndex:0}),
    isOwnerVisible:true}
  })),
  publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
   allowCancel:false,isSecret:false,targetZone:'active,bench'}};
}
function cardPrompt(effectName,sourcePrinting,choices){
 return {schema:P.PROMPT_SCHEMA,actingSeat:0,promptType:'ChooseCardsPrompt',
  description:'Search deck',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting,effectName},
  choices:choices.map((x,i)=>({token:x.token,kind:'card',printing:x.printing,
   publicMetadata:{selectionType:'card-combination',selectionIndex:i,
     ownerSeat:'actor',sourceZone:'deck',isOwnerVisible:true}})),
  publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
   ownerSeat:'actor',isOwnerVisible:true,minimumCount:1,maximumCount:1,
   allowCancel:false,isSecret:false}};
}

let seq=0,passed=0;
const init={schema:P.INIT_SCHEMA,type:'init',role:'candidate',seat:0,
 policyVersion:POLICY_VERSION,bundleSha256:'b'.repeat(64),config:{}};
P.validateInit(init);
assert.equal(DECK_SHA,'0db19a75d0d1ce43128b9a9fdc4fe3013833eaaba4641972af7af30f4b41e7dd');
const worker=createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,config:{}});
function run(v,items,prompt=null){
 const obs={...v,decisionKind:prompt?'owner-prompt':'owner-root',
 pendingPromptType:prompt?.promptType??null,
 pendingOwnerDeckSearch:prompt?.publicMetadata?.sourceZone==='deck'};
 const request={schema:P.REQUEST_SCHEMA,type:'decision',requestId:'v3-'+seq,
 sequence:seq++,role:'candidate',seat:0,
 observationSchema:P.OBSERVATION_SCHEMA,
 observation:obs,prompt,publicEventReceipt:null,
 actionFrontier:{schema:P.FRONTIER_SCHEMA,items}};
 const validated=P.validateRequest(request,init,request.sequence,new Set());
 const out=worker.decideWithAudit(request);
 const decision=P.validateDecision(out.decision,validated.prompt,validated.actionTokens);
 P.validatePolicyAudit(out.policyAudit,request,decision,POLICY_VERSION);
 passed++;
 return decision;
}
const mew=slot('Mewtwo & Mew-GX UNM 071','Mewtwo & Mew-GX',['Perfection'],[],3);
mew.hp=270;mew.printed.stage='Basic';mew.printed.subtypes=['Basic','TAG TEAM','GX'];
const noir=slot('Dusknoir SFA 020','Dusknoir',['Cursed Blast']);noir.hp=160;
noir.printed.stage='Stage 2';noir.printed.subtypes=['Stage 2'];
const trev=slot('Trevenant & Dusknoir-GX PR-SM217','Trevenant & Dusknoir-GX');
trev.hp=270;trev.printed.stage='Basic';trev.printed.subtypes=['Basic','TAG TEAM','GX'];
const reg=slot('Regidrago VSTAR SIT 136','Regidrago VSTAR');reg.hp=280;
reg.printed.stage='VSTAR';reg.printed.subtypes=['VSTAR'];
const v=view({active:mew,bench:[noir,trev],bus:reg,oppBench:[],ownPrize:6,
 oppPrize:6,ownHandCount:5,oppHandCount:5,hand:['Ace Trainer ROS 69']});
v.globalTurn=5;
const n={token:'night',kind:'attack',
 attackName:'Night Watch',actorPrinting:trev.printing,
 publicMetadata:{attackCostPayable:true,attackSource:{
  sourceKind:'bench-pokemon',sourceSlot:'BENCH',sourceIndex:1,
  sourceCardName:trev.name,sourceCardFullName:trev.printing,attackName:'Night Watch'}}};
let got=run(v,[use('blast','Cursed Blast','bench',0),n,pass()]);
assert.deepEqual(got,{kind:'select-action',token:'blast'});
got=run(v,[],pokemonPrompt('Cursed Blast',noir.printing,[
 {token:'our-dusk',ownerSeat:'actor',zone:'bench',index:0,printing:noir.printing},
 {token:'opponent-reg',ownerSeat:'opponent',zone:'active',printing:reg.printing}
]));
assert.deepEqual(got,{kind:'select-choices',tokens:['opponent-reg']});
v.ownPublic.bench[0]=null;
v.opponentPublic.active.damage=130;v.opponentPublic.prizeCount=5;
v.opponentPublic.prizeSlots.pop();
got=run(v,[play('ace','Ace Trainer ROS 69'),n,pass()]);
assert.deepEqual(got,{kind:'select-action',token:'ace'});
v.ownTurnResources.supporterPlayedTurn=1;v.opponentPublic.handCount=3;
got=run(v,[n,pass()]);assert.deepEqual(got,{kind:'select-action',token:'night'});
// Stage2 direct Shadow Bind is a genuinely offered paid Stage2 attack,
 // not a self-KO or a copied Basic Mewtwo attack.
const stage2=slot('Dusknoir SFA 020','Dusknoir',['Cursed Blast'],[],3);
stage2.hp=160;stage2.printed.stage='Stage 2';stage2.printed.subtypes=['Stage 2'];
const locked=bus();
locked.hp=140;
const w=view({active:stage2,bench:[],bus:locked,oppBench:[],ownPrize:3,
 oppPrize:1,hand:['Basic Psychic Energy']});
w.globalTurn=7;
got=run(w,[{kind:'attack',token:'shadow',actorPrinting:stage2.printing,
 attackName:'Shadow Bind',publicMetadata:{attackCostPayable:true,
 attackSource:{sourceKind:'active-pokemon',sourceSlot:'ACTIVE',sourceIndex:0,
 sourceCardName:stage2.name,sourceCardFullName:stage2.printing,attackName:'Shadow Bind'}}},pass()]);
assert.deepEqual(got,{kind:'select-action',token:'shadow'});
console.log('v3 production protocol validator accepted '+passed+' synthetic request/decision/audit phases');
