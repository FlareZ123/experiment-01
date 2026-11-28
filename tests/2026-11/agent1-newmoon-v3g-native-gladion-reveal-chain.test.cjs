'use strict';
const assert=require('node:assert/strict');
const P=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const G=require('../../simulation/evaluation/2026-11/agent1-newmoon-v3g-gladion-policy.cjs');
const H=require('../../simulation/twinleaf/agent1-gladion-owner-prize-projection.cjs');
const list=require('../../results/als/new-moon-dusknoir-gladion-prize-rescue-v3g-60.json');
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


const init={schema:P.INIT_SCHEMA,type:'init',role:'candidate',seat:0,
 policyVersion:G.POLICY_VERSION,bundleSha256:'d'.repeat(64),config:{}};
P.validateInit(init);
const policy=G.createPolicy({role:'candidate',seat:0,policyVersion:G.POLICY_VERSION,config:{}});
const expanded=list.entries.flatMap(e=>Array(e.count).fill(
 e.id==='sv6pt5-20'?'Dusknoir SFA 020':
 e.id==='sv6pt5-19'?'Dusclops SFA 019':
 e.id==='sm11-71'?'Mewtwo & Mew-GX UNM 071':
 e.id==='sm4-95'?'Gladion CIN 95':e.name+' '+e.id));
function take(q){const i=expanded.findIndex(x=>x.includes(q));
 assert.ok(i>=0,'cannot find '+q);return expanded.splice(i,1)[0];}
const prizes=[take('Sky Field'),take('Field Blower'),take('Dusknoir SFA 020'),
 take('Unown'),take('Basic Psychic'),take('Telepathic Psychic')];
const active=take('Mewtwo & Mew-GX'),stage1=take('Dusclops');
const stage0=take('Duskull');
const hand=[take('Gladion'),...Array.from({length:6},()=>expanded.shift())];
const deck=expanded.slice();
const knownPrintings=Object.entries(deck.reduce((acc,p)=>{
 acc[p]=(acc[p]??0)+1;return acc;},{}))
 .map(([printing,copies])=>({printing,copies}));
const a=slot(active,'Mewtwo & Mew-GX',['Perfection']);
a.evolutionPrintings=[active];
const b=slot(stage1,'Dusclops',['Cursed Blast']);b.evolutionPrintings=[stage0,stage1];
const obs=view({active:a,bench:[b],bus:bus(),oppBench:[],
 ownPrize:6,oppPrize:3,ownHandCount:hand.length,hand});
obs.globalTurn=4;obs.ownerK1={epoch:5,exactMembershipKnown:true,
 knownPrintings,invalidationReason:null};
obs.ownPublic.deckCount=deck.length;obs.ownPublic.handCount=hand.length;
assert.equal(G.fullyPrizedDusknoir(obs),true);
const action=play('gladion','Gladion CIN 95');
let sequence=0;
function request(prompt,items=[]){
 const obj={schema:P.REQUEST_SCHEMA,type:'decision',
  requestId:'v3g-native-gladion-'+sequence,sequence,role:'candidate',seat:0,
  observationSchema:P.OBSERVATION_SCHEMA,observation:obs,
  prompt,publicEventReceipt:null,
  actionFrontier:{schema:P.FRONTIER_SCHEMA,items}};
 const valid=P.validateRequest(obj,init,sequence++,new Set());
 const out=policy.decideWithAudit(obj);
 const decision=P.validateDecision(out.decision,valid.prompt,valid.actionTokens);
 P.validatePolicyAudit(out.policyAudit,obj,decision,G.POLICY_VERSION);
 return decision;
}
const root=request(null,[action,pass()]);
assert.deepEqual(root,{kind:'select-action',token:'gladion'});
// Only after this actor's chosen Gladion is in their public Supporter zone
// may the projector legally inspect that actor's own face-down Prize cards.
const source={fullName:'Gladion CIN 95'};
const faceDown=prizes.map(p=>({cards:[{fullName:p}],faceUpPrize:false}));
const blank={cards:[]};
const owner={id:'owner',hand:blank,deck:blank,discard:blank,lostzone:blank,
 stadium:blank,supporter:{cards:[source]},active:blank,bench:[],prizes:faceDown};
const opposite={id:'other',hand:blank,deck:blank,discard:blank,lostzone:blank,
 stadium:blank,supporter:blank,active:blank,bench:[],
 prizes:[{cards:[{fullName:'Opponent Hidden Prized Mega'}],faceUpPrize:false}]};
const state={phase:3,players:[owner,opposite]};
class ChoosePrizePrompt {
 constructor(){this.playerId='owner';this.id=701;this.result=undefined;
 this.message='CHOOSE_PRIZE_CARD';this.options={useOpponentPrizes:false,
 count:1,blocked:[],allowCancel:false,isSecret:true};}
 getPerspectivePlayerId(){return 'owner'}
}
const nativePrompt=new ChoosePrizePrompt();
const provenanceHook={getPromptProvenance:()=>({
 sourceKind:'card-effect',effectName:'Gladion',sourceCard:source})};
const projection=H.projectPromptWithGladionOwnerPrize({
 prompt:nativePrompt,state,actorSeat:0,provenanceHook});
assert.equal(projection.hostOnly,false);
assert.equal(projection.promptProjection.choices.some(x=>
 x.printing==='Opponent Hidden Prized Mega'),false);
assert.equal(projection.promptProjection.choices[2].printing,'Dusknoir SFA 020');
obs.decisionKind='owner-prompt';
obs.pendingPromptType='ChoosePrizePrompt';
obs.pendingOwnerDeckSearch=false;
const choice=request(projection.promptProjection);
assert.equal(choice.kind,'select-choices');
assert.equal(choice.tokens.length,1);
assert.equal(projection.choiceByToken.get(choice.tokens[0]),2,
 'actor-selected Dusknoir must decode to actual own physical Prize index 2');
assert.equal(state.players[0].prizes[2].cards[0].fullName,'Dusknoir SFA 020');
console.log('v3g end-to-end Gladion: native-shaped owner attestation -> worker Prize action index 2 accepted');
