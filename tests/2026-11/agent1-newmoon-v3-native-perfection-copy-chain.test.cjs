'use strict';
const assert=require('node:assert/strict');
const P=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const nativeProject=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent1-newmoon-v3-finisher-slice.cjs');
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


const mkCard=(fullName,names=[])=>({fullName,
 attacks:names.map(name=>({name,damage:150}))});
const mew=mkCard('Mewtwo & Mew-GX UNM 071',['Miraculous Duo-GX']);
const trev=mkCard('Trevenant & Dusknoir-GX PR-SM217',
 ['Night Watch','Pale Moon-GX']);
const gengar=mkCard('Gengar & Mimikyu-GX TEU 53',
 ['Poltergeist','Horror House-GX']);
const nativePlayer=(id,active,bench=[],discard=[])=>({
 id,hand:{cards:[]},deck:{cards:[]},discard:{cards:discard},
 lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},
 prizes:Array.from({length:6},()=>({cards:[],faceUpPrize:false})),
 active:{cards:[active],energies:{cards:[]},tools:[]},
 bench:bench.map(c=>({cards:[c],energies:{cards:[]},tools:[]}))
});
class ChooseAttackPrompt {
 constructor(cards,playerId){
  this.cards=cards;this.playerId=playerId;this.id=992;
  this.result=undefined;this.message='CHOOSE_ATTACK';
  this.options={blocked:[],allowCancel:false};
 }
 getPerspectivePlayerId(){return this.playerId}
 decode(raw){return raw}
 validate(raw){return raw!==null&&Number.isInteger(raw.index)&&
   typeof raw.attack==='string'}
}
const state={phase:3,players:[
 nativePlayer('actor',mew,[trev],[gengar]),
 nativePlayer('opponent',mkCard('Opposing Basic EX'))]};
const prompt=new ChooseAttackPrompt([trev,gengar],'actor');
const proj=()=>nativeProject.projectPrompt({
 prompt,state,actorSeat:0,native:{},
 provenanceHook:{getPromptProvenance:()=>({
 sourceKind:'card-effect',sourceCard:mew,effectName:'Perfection'})}
});
const p=proj();
assert.equal(p.hostOnly,false);
assert.equal(p.promptProjection.publicMetadata.selectionType,'attack');
assert.equal(p.promptProjection.choices.length,4);
assert.equal(p.promptProjection.choices.every(c=>
 c.publicMetadata.sourceZone==='mixed'),true);
let mewSlot=slot(mew.fullName,'Mewtwo & Mew-GX',['Perfection'],[],3);
mewSlot.hp=270;
const trevSlot=slot(trev.fullName,'Trevenant & Dusknoir-GX');
const reg=slot('Regidrago VSTAR SIT 136','Regidrago VSTAR');
reg.hp=280;reg.damage=160;
const obs=view({active:mewSlot,bench:[trevSlot],bus:reg,oppBench:[],
 ownPrize:5,oppPrize:4,hand:['Basic Psychic Energy']});
obs.globalTurn=8;obs.decisionKind='owner-prompt';
obs.pendingPromptType='ChooseAttackPrompt';
obs.ownPublic.discard=[gengar.fullName];
const policy=createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,config:{}});
const init={schema:P.INIT_SCHEMA,type:'init',role:'candidate',seat:0,
 policyVersion:POLICY_VERSION,bundleSha256:'e'.repeat(64),config:{}};
P.validateInit(init);
let sequence=0;
const decide=projection=>{
 const request={schema:P.REQUEST_SCHEMA,type:'decision',
  requestId:'copy-'+sequence,sequence:sequence++,role:'candidate',seat:0,
  observationSchema:P.OBSERVATION_SCHEMA,observation:obs,
  prompt:projection.promptProjection,publicEventReceipt:null,
  actionFrontier:{schema:P.FRONTIER_SCHEMA,items:[]}};
 const validated=P.validateRequest(request,init,request.sequence,new Set());
 const output=policy.decideWithAudit(request);
 const d=P.validateDecision(output.decision,validated.prompt,validated.actionTokens);
 P.validatePolicyAudit(output.policyAudit,request,d,POLICY_VERSION);
 return d;
};
const decision=decide(p);
assert.equal(decision.kind,'select-choice');
assert.equal(p.choiceByToken.get(decision.token).attack,'Night Watch');
assert.equal(p.choiceByToken.get(decision.token).index,0);
prompt.cards=[trev];obs.ownPublic.discard=[];
const b=proj();
assert.equal(b.promptProjection.choices.every(x=>
 x.publicMetadata.sourceZone==='board'),true);
assert.equal(b.choiceByToken.get(decide(b).token).attack,'Night Watch');
const hidden=mkCard('Opponent Hidden-GX',['Secret']);
state.players[1].discard.cards.push(hidden);prompt.cards=[hidden];
const exposed=proj();
assert.equal(exposed.promptProjection.choices[0].publicMetadata.ownerSeat,
 'opponent');
assert.equal(decide(exposed).kind,'abstain');
console.log('v3 native ChooseAttackPrompt owner donor: mixed, board and opponent rejection passed through production protocol');
