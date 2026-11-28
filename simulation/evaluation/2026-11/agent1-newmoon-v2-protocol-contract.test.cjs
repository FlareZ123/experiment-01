'use strict';
/* Synthetic actor-visible requests, validated by the actual production worker
 * protocol. No simulator, Store, native game, CI dispatch, or hidden-zone input.
 * node simulation/evaluation/2026-11/agent1-newmoon-v2-protocol-contract.test.cjs
 */
const protocol=require('./agent49-policy-protocol.cjs');
const {POLICY_VERSION,DECK_SHA,createPolicy}=require('./agent1-newmoon-v2-jammer-decision.cjs');
const P=protocol;
const must=(b,reason)=>{if(!b)throw Error('ASSERTION_FAILED: '+reason)};
const same=(a,b,reason)=>must(JSON.stringify(a)===JSON.stringify(b),reason+
  ' expected '+JSON.stringify(b)+' actual '+JSON.stringify(a));
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
let seq=0;
// Production init forbids policy-specific config: deck identity is source/role bound.
const init={schema:P.INIT_SCHEMA,type:'init',role:'candidate',seat:0,
 policyVersion:POLICY_VERSION,bundleSha256:'a'.repeat(64),config:{}};
P.validateInit(init);
must(DECK_SHA==='aebe9a142e8492be929316bff4b871375e3e478945e01f8c5844037332634fe6',
 'fixed New Moon Tool Jammer v2 module identity drift');
const policy=createPolicy({role:init.role,seat:init.seat,
 policyVersion:init.policyVersion,config:init.config});
const receipts=[];
function run(v,items,prompt=null) {
 const observation={...v,decisionKind:prompt?'owner-prompt':'owner-root',
   pendingPromptType:prompt?.promptType??null,
   pendingOwnerDeckSearch:prompt?.publicMetadata.sourceZone==='deck'};
 const request={schema:P.REQUEST_SCHEMA,type:'decision',requestId:'case-'+seq,
  sequence:seq++,role:'candidate',seat:0,observationSchema:P.OBSERVATION_SCHEMA,
  observation,prompt,publicEventReceipt:null,
  actionFrontier:{schema:P.FRONTIER_SCHEMA,items}};
 const validated=P.validateRequest(request,init,
  request.sequence,new Set());
 const response=policy.decideWithAudit(request);
 const decision=P.validateDecision(response.decision,validated.prompt,
  validated.actionTokens);
 P.validatePolicyAudit(response.policyAudit,request,decision,POLICY_VERSION);
 receipts.push({requestId:request.requestId,decision:decision.kind,
  chosen:decision.token??decision.tokens??null,
  selectionRule:response.policyAudit.selectionRuleCode});
 return decision;
}
function test() {
 const v=view();
 same(run(v,[play('wrong-target','Tool Jammer BST 136','bench'),
  play('jam','Tool Jammer BST 136','active'),pass()]),
  {kind:'select-action',token:'jam'},'native target must be own Active');
 same(run(v,[play('wrong-only','Tool Jammer BST 136','bench'),pass()]),
  {kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'},'reject Bench-only Tool target');
 same(run(v,[],pokemonPrompt('Tool Jammer','Tool Jammer BST 136',[
  {token:'bench',ownerSeat:'actor',zone:'bench',index:0,printing:'Dusclops SFA 019'},
  {token:'active',ownerSeat:'actor',zone:'active',printing:'Dusclops SFA 019'}
 ])),{kind:'select-choices',tokens:['active']},'Tool target prompt chooses own Active');
 const v2=view({active:dus(['Tool Jammer BST 136']),oppBench:[aor(),slot('Garbodor BKP 057','Garbodor')]});
 same(run(v2,[use('blast','Cursed Blast','bench',0),willow(),pass()]),
  {kind:'select-action',token:'blast'},'bench Curse root');
 same(run(v2,[],pokemonPrompt('Cursed Blast','Dusclops SFA 019',[
   {token:'garb',ownerSeat:'opponent',zone:'bench',index:1,
    printing:'Garbodor BKP 057'},
   {token:'bus',ownerSeat:'opponent',zone:'active',printing:'Vileplume BUS 006'}
 ])),{kind:'select-choices',tokens:['bus']},'target opponent Active BUS');
 const v3=view({active:dus(['Tool Jammer BST 136']),bench:[],
  bus:bus(50),oppPrize:2,ownPrize:3,oppHandCount:7});
 same(run(v3,[play('ace','Ace Trainer AOR 069'),willow(),pass()]),
  {kind:'select-action',token:'ace'},'Ace compresses after self-KO');
 v3.ownTurnResources.supporterPlayedTurn=3;
 same(run(v3,[play('ace','Ace Trainer AOR 069'),willow(),pass()]),
  {kind:'select-action',token:'willow'},'Willow after Ace');
 const v4=view({active:dus(['Tool Jammer BST 136']),
   bench:[slot('Mewtwo & Mew-GX UNM 071','Mewtwo & Mew-GX')],
   bus:bus(100),ownPrize:1,oppPrize:2});
 same(run(v4,[use('active-curse','Cursed Blast','active'),willow(),pass()]),
  {kind:'select-action',token:'willow'},'lethal attack avoids self-KO');
 v4.ownPublic.active.specialConditions=['CONFUSED'];
 same(run(v4,[use('active-curse','Cursed Blast','active'),willow(),pass()]),
  {kind:'select-action',token:'active-curse'},'confused attack favors Ability');
 const vn=view({active:dus(['Tool Jammer BST 136']),
  bench:[slot('Mewtwo & Mew-GX UNM 071','Mewtwo & Mew-GX')],
  bus:bus(100),ownPrize:1,oppPrize:2});
 vn.ownPublic.active.specialConditions=[2];
 same(run(vn,[use('active-curse','Cursed Blast','active'),willow(),pass()]),
  {kind:'select-action',token:'active-curse'},'unknown numeric condition uses deterministic Ability');
 const v5=view({active:dus(['Tool Jammer BST 136']),bench:[],
  bus:bus(100),oppPrize:2});
 same(run(v5,[use('active-curse','Cursed Blast','active'),pass()]),
  {kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'},'no Bench self-KO');
 const v6=view({active:dus(['Tool Jammer BST 136']),
  bench:[slot('Mewtwo & Mew-GX UNM 071','Mewtwo & Mew-GX')],
  bus:bus(100),oppPrize:1});
 same(run(v6,[use('active-curse','Cursed Blast','active'),pass()]),
  {kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'},'last opponent Prize');
 const v7=view({active:dus(['Tool Jammer BST 136']),oppStadium:['Jamming Tower TWM 153']});
 same(run(v7,[use('blast','Cursed Blast','bench',0),pass()]),
  {kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'},'blank Tool Jammer');
 const escaped=view({active:dus(['Tool Jammer BST 136']),
  oppBench:[aor(),bus()],bus:slot('Bunnelby PRC 121','Bunnelby',[],[],0,10)});
 escaped.opponentPublic.active.hp=60;
 escaped.opponentPublic.active.printed.stage='Basic';
 escaped.opponentPublic.active.printed.subtypes=['Basic'];
 same(run(escaped,[willow(),pass()]),
  {kind:'select-action',token:'willow'},'non-BUS active within Willow KO range after BUS benches');
 escaped.opponentPublic.active.damage=0;
 same(run(escaped,[willow(),pass()]),
  {kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'},'non-BUS Active unqualified 2HKO not forced');
 const v8=view({hand:[],bench:[dus(),art()]});
 same(run(v8,[use('star','Star Alchemy','bench',1),pass()]),
  {kind:'select-action',token:'star'},'forest seal V route');
 same(run(v8,[],cardPrompt('Star Alchemy','Forest Seal Stone SIT 156',[
  {token:'other',printing:'Path to the Peak CRE 148'},
  {token:'jam',printing:'Tool Jammer BST 136'}
 ])),{kind:'select-choices',tokens:['jam']},'Tool Jammer via Star Alchemy');
 return {suite:'agent1-newmoon-v2-production-protocol-contract',
  checks:receipts.length,productionRequestSchema:P.REQUEST_SCHEMA,
  productionObservationSchema:P.OBSERVATION_SCHEMA,
  qualifiedGames:0,receipts};
}
const result=test();
if (typeof console!=='undefined'&&console.log)console.log(JSON.stringify(result));
module.exports=result;
