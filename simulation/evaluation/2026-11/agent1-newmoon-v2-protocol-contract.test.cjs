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
 const engineSetup=view({});
 engineSetup.phase=1;engineSetup.globalTurn=0;engineSetup.ownPublic.active=null;
 engineSetup.ownPublic.bench=[];engineSetup.opponentPublic.active=null;
 engineSetup.opponentPublic.bench=[];
 const enginePrompt=(effect,promptType,meta,choices)=>({
   schema:P.PROMPT_SCHEMA,actingSeat:0,promptType,description:effect,
   source:{classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,effectName:effect},
   choices,publicMetadata:meta
 });
 const chooseOrder=enginePrompt('GO_FIRST','ConfirmPrompt',
    {selectionType:'confirm'},[
     {kind:'confirm',token:'yes',label:'Yes'},
     {kind:'confirm',token:'no',label:'No'}]);
 same(run(engineSetup,[],chooseOrder),
   {kind:'select-choice',token:'no'},'engine coin turn order must choose second');
 const starter=(token,printing,index)=>({token,kind:'card',printing,label:printing,
   publicMetadata:{selectionType:'card-combination',selectionIndex:index,selectedCount:1,
   sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true}});
 const starters=enginePrompt('CHOOSE_STARTING_POKEMONS','ChooseCardsPrompt',
   {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true,isSecret:false,allowCancel:false,minimumCount:1,maximumCount:6},
   [starter('gengar','Gengar & Mimikyu-GX TEU 053',0),
    starter('mew','Mewtwo & Mew-GX UNM 071',1),
    starter('dusk','Duskull VIV 069',2),
    starter('sol','Solrock CES 062',3)]);
 engineSetup.ownHand=['Gengar & Mimikyu-GX TEU 053','Mewtwo & Mew-GX UNM 071',
   'Duskull VIV 069','Solrock CES 062','Basic Psychic Energy'];
 same(run(engineSetup,[],starters),
   {kind:'select-choices',tokens:['gengar','mew','dusk']},
   'opening Active Gengar + two restrained backups');
 const draw=enginePrompt('WANT_TO_DRAW_CARDS','SelectPrompt',
   {selectionType:'option',allowCancel:false,count:3},[
   {kind:'option',token:'two',label:'Draw 2 card(s)',publicMetadata:{choiceIndex:0}},
   {kind:'option',token:'one',label:'Draw 1 card(s)',publicMetadata:{choiceIndex:1}},
   {kind:'option',token:'zero',label:'Draw 0 card(s)',publicMetadata:{choiceIndex:2}}
 ]);
 same(run(engineSetup,[],draw),{kind:'select-choice',token:'two'},
    'mulligan compensation picks maximum allowable draws');
 const energyGengar=slot('Gengar & Mimikyu-GX TEU 053','Gengar & Mimikyu-GX',[],[],0);
 energyGengar.printed.stage='Basic';energyGengar.printed.subtypes=['Basic','TAG TEAM','GX'];
 const attachWindow=view({active:energyGengar,bench:[],
  bus:slot('Bunnelby PRC 121','Bunnelby'),oppBench:[],
  hand:['Telepathic Psychic Energy MEG 088','Basic Psychic Energy']});
 attachWindow.globalTurn=2;
 const attach=(token,printing)=>({token,kind:'play-card',actorPrinting:printing,
  targetPrinting:energyGengar.printing,
  publicMetadata:{cardType:'energy',handIndex:0,targetSeat:'actor',
   targetZone:'active',targetIndex:0,isOwnerVisible:true}});
 same(run(attachWindow,[attach('basic','Basic Psychic Energy'),
  attach('tpe','Telepathic Psychic Energy MEG 088'),pass()]),
  {kind:'select-action',token:'tpe'},'TPE attachment bridges one-Psychic opener');
 attachWindow.ownPublic.active.energies=['Telepathic Psychic Energy MEG 088'];
 attachWindow.ownHand=['Basic Psychic Energy'];
 const tpeSearch={schema:P.PROMPT_SCHEMA,actingSeat:0,
  promptType:'ChooseCardsPrompt',description:'Search up to two Psychic Basics',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:'Telepathic Psychic Energy MEG 088',
   effectName:'Telepathic Psychic Energy'},
  choices:[
   {token:'dusk',kind:'card',printing:'Duskull VIV 069',
    publicMetadata:{selectionType:'card-combination',selectionIndex:0,
     selectedCount:1,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}},
   {token:'mew',kind:'card',printing:'Mewtwo & Mew-GX UNM 071',
    publicMetadata:{selectionType:'card-combination',selectionIndex:1,
     selectedCount:1,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}},
   {token:'sol',kind:'card',printing:'Solrock CES 062',
    publicMetadata:{selectionType:'card-combination',selectionIndex:2,
     selectedCount:1,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}},
   {token:'empty',kind:'empty-selection',label:'Choose no items'}],
  publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
   ownerSeat:'actor',isOwnerVisible:true,isSecret:false,
   minimumCount:0,maximumCount:2,allowCancel:false}};
 same(run(attachWindow,[],tpeSearch),
  {kind:'select-choices',tokens:['dusk','mew']},
  'TPE owned search gets Duskull/Mewtwo and leaves Bench space');

 const vipReady=view({active:slot('Gengar & Mimikyu-GX TEU 053','Gengar & Mimikyu-GX',
  [],[],1),bench:[],bus:slot('Bunnelby PRC 121','Bunnelby'),oppBench:[]});
 vipReady.globalTurn=2;
 const vipRoot={kind:'play-card',token:'vip',actorPrinting:'Battle VIP Pass FST 225',
   publicMetadata:{cardType:'trainer',handIndex:0}};
 const beforeVip=view({active:slot('Gengar & Mimikyu-GX TEU 053',
  'Gengar & Mimikyu-GX',[],[],0),bench:[],
  bus:slot('Bunnelby PRC 121','Bunnelby'),oppBench:[]});
 beforeVip.globalTurn=2;
 const tpeFirst={token:'tpe',kind:'play-card',actorPrinting:'Telepathic Psychic Energy MEG 088',
  targetPrinting:beforeVip.ownPublic.active.printing,
  publicMetadata:{cardType:'energy',handIndex:0,targetSeat:'actor',
   targetZone:'active',targetIndex:0,isOwnerVisible:true}};
 same(run(beforeVip,[vipRoot,tpeFirst,pass()]),
   {kind:'select-action',token:'tpe'},
   'TPE before VIP preserves two Bench slots and funds earliest GX');
 same(run(vipReady,[vipRoot,
  {kind:'attack',token:'horror',attackName:'Horror House-GX'},pass()]),
  {kind:'select-action',token:'vip'},'VIP before funded opening Horror House');
 const sc=(token,printing,index)=>({token,kind:'card',printing,label:printing,
  publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
   ownerSeat:'actor',isOwnerVisible:true,selectionIndex:index,selectedCount:1}});
 const vipSearch={schema:P.PROMPT_SCHEMA,actingSeat:0,
  promptType:'ChooseCardsPrompt',description:'Search Basic Pokémon',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:'Battle VIP Pass FST 225',effectName:'Battle VIP Pass'},
  choices:[sc('sol','Solrock CES 062',0),sc('dusk','Duskull VIV 069',1),
   sc('gengar','Gengar & Mimikyu-GX TEU 053',2),
   {kind:'empty-selection',token:'empty',label:'Choose no items'}],
  publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
   ownerSeat:'actor',isOwnerVisible:true,isSecret:false,
   minimumCount:0,maximumCount:2,allowCancel:false}};
 const vipMew=view({active:slot('Mewtwo & Mew-GX UNM 071','Mewtwo & Mew-GX'),bench:[],
  bus:slot('Bunnelby PRC 121','Bunnelby'),oppBench:[]});
 same(run(vipMew,[],vipSearch),
  {kind:'select-choices',tokens:['gengar','dusk']},
  'VIP actor-owned deck search selects donor and future Dusclops base');
 const noEnergy=view({active:slot('Gengar & Mimikyu-GX TEU 053','Gengar & Mimikyu-GX'),
   bench:[],bus:slot('Bunnelby PRC 121','Bunnelby'),oppBench:[]});
 noEnergy.globalTurn=3;
 const fogRoot={kind:'play-card',token:'fog',actorPrinting:'Fog Crystal CRE 140',
  publicMetadata:{cardType:'trainer',handIndex:0}};
 same(run(noEnergy,[fogRoot,pass()]),
  {kind:'select-action',token:'fog'},'Fog crystal when no Psychic Energy is attached');
 const fogSearch={schema:P.PROMPT_SCHEMA,actingSeat:0,
  promptType:'ChooseCardsPrompt',description:'Choose Basic Psychic or Energy',
  source:{classification:'actor-choice',sourceKind:'card-effect',
   sourcePrinting:'Fog Crystal CRE 140',effectName:'Fog Crystal'},
  choices:[sc('donor','Gengar & Mimikyu-GX TEU 053',0),
   sc('basic','Basic Psychic Energy',1)],
  publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
   ownerSeat:'actor',isOwnerVisible:true,isSecret:false,
   minimumCount:1,maximumCount:1,allowCancel:false}};
 same(run(noEnergy,[],fogSearch),
  {kind:'select-choices',tokens:['basic']},
  'Fog search chooses Energy to make first attack viable');
 noEnergy.ownHand=["Lillie's Determination MEG 119"];
 const lillie={kind:'play-card',token:'lillie',
  actorPrinting:"Lillie's Determination MEG 119",
  publicMetadata:{cardType:'trainer',handIndex:0}};
 same(run(noEnergy,[lillie,pass()]),
  {kind:'select-action',token:'lillie'},
  'Lillie fallback reaches missing Psychic when no immediate Fog action');
 const nativeGengar=slot('Gengar & Mimikyu-GX TEU 053','Gengar & Mimikyu-GX',[],[],1);
 nativeGengar.printed.stage='Basic';nativeGengar.printed.subtypes=['Basic','TAG TEAM','GX'];
 const earlyNative=view({active:nativeGengar,bench:[],
   bus:slot('Bunnelby PRC 121','Bunnelby'),oppBench:[]});
 earlyNative.globalTurn=2;
 same(run(earlyNative,[{token:'poltergeist',kind:'attack',attackName:'Poltergeist'},
   {token:'horror-house',kind:'attack',attackName:'Horror House-GX'},pass()]),
   {kind:'select-action',token:'horror-house'},'native Gengar hand lock over raw damage');
 const mew=slot('Mewtwo & Mew-GX UNM 071','Mewtwo & Mew-GX',['Perfection'],[],1);
 mew.printed.stage='Basic';mew.printed.subtypes=['Basic','TAG TEAM','GX'];
 const earlyMew=view({active:mew,bench:[],
   bus:slot('Bunnelby PRC 121','Bunnelby'),oppBench:[]});
 earlyMew.globalTurn=2;earlyMew.ownPublic.discard=['Gengar & Mimikyu-GX TEU 053'];
 same(run(earlyMew,[use('perfection','Perfection','active'),pass()]),
  {kind:'select-action',token:'perfection'},'Perfection active donor route');
 const attackChoice=(token,printing,sourceAttack,index)=>({token,kind:'attack',
   printing,label:sourceAttack,
   publicMetadata:{selectionType:'attack',choiceIndex:index,sourceAttack,
     sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true}});
 const perfectionPrompt={schema:P.PROMPT_SCHEMA,actingSeat:0,
   promptType:'ChooseAttackPrompt',description:'Choose an attack',
   source:{classification:'actor-choice',sourceKind:'card-effect',
     sourcePrinting:'Mewtwo & Mew-GX UNM 071',effectName:'Perfection'},
   choices:[attackChoice('horror','Gengar & Mimikyu-GX TEU 053','Horror House-GX',0),
     attackChoice('poltergeist','Gengar & Mimikyu-GX TEU 053','Poltergeist',0)],
   publicMetadata:{selectionType:'attack',count:2,allowCancel:false}};
 same(run(earlyMew,[],perfectionPrompt),
  {kind:'select-choice',token:'horror'},'Perfection native prompt chooses correct GX attack');
 const extra=view({active:slot('Gengar & Mimikyu-GX TEU 053','Gengar & Mimikyu-GX',
     [],[],2),bench:[],bus:slot('Bunnelby PRC 121','Bunnelby'),oppBench:[]});
 extra.globalTurn=2;
 same(run(extra,[{token:'horror-house',kind:'attack',attackName:'Horror House-GX'},pass()]),
   {kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'},'2-Psychic bonus cannot be silently chosen');

 const sealHost=slot('Galarian Articuno V CRE 058','Galarian Articuno V');
 sealHost.printed.stage='Basic';sealHost.printed.subtypes=['Basic','V'];
 const underLock=view({active:dus(),bench:[dus(),sealHost],hand:[]});
 const attachSeal={kind:'play-card',token:'attach-seal',
  actorPrinting:'Forest Seal Stone SIT 156',targetPrinting:sealHost.printing,
  publicMetadata:{cardType:'tool',handIndex:0,targetSeat:'actor',
    targetZone:'bench',targetIndex:1,isOwnerVisible:true}};
 same(run(underLock,[attachSeal,pass()]),
  {kind:'select-action',token:'attach-seal'},
  'FSS attached to actual Benched Articuno V despite AOR Item lock');
 sealHost.tools=['Forest Seal Stone SIT 156'];
 same(run(underLock,[use('star','Star Alchemy','bench',1),pass()]),
  {kind:'select-action',token:'star'},
  'FSS host Star Alchemy chosen after installation');
 const starSearch={schema:P.PROMPT_SCHEMA,actingSeat:0,
   promptType:'ChooseCardsPrompt',description:'Find missing Tool Jammer',
   source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:'Forest Seal Stone SIT 156',effectName:'Star Alchemy'},
   choices:[
    {kind:'card',token:'jam',printing:'Tool Jammer BST 136',
      publicMetadata:{selectionType:'card-combination',selectionIndex:0,
       selectedCount:1,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}},
    {kind:'card',token:'basic',printing:'Basic Psychic Energy',
      publicMetadata:{selectionType:'card-combination',selectionIndex:1,
       selectedCount:1,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}}
   ],publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
    ownerSeat:'actor',isOwnerVisible:true,isSecret:false,
    minimumCount:1,maximumCount:1,allowCancel:false}};
 same(run(underLock,[],starSearch),{kind:'select-choices',tokens:['jam']},
   'Star Alchemy deck prompt resolves exact Tool Jammer resource');
 const shortEnergy=view({active:dus(['Tool Jammer BST 136'],1),
   bench:[dus(),sealHost],hand:[]});
 shortEnergy.ownTurnResources.energyPlayedTurn=1;
 same(run(shortEnergy,[use('star','Star Alchemy','bench',1),pass()]),
   {kind:'select-action',token:'star'},
   'Star Alchemy obtains second Psychic behind dual lock');
 const energyPrompt={...starSearch,choices:[
  {kind:'card',token:'tpe',printing:'Telepathic Psychic Energy MEG 088',
    publicMetadata:{selectionType:'card-combination',selectionIndex:0,
    selectedCount:1,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}},
  {kind:'card',token:'basic',printing:'Basic Psychic Energy',
    publicMetadata:{selectionType:'card-combination',selectionIndex:1,
    selectedCount:1,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}}]};
 same(run(shortEnergy,[],energyPrompt),{kind:'select-choices',tokens:['tpe']},
   'Star Alchemy chooses correctly providing second Psychic');


 const basicGengar=()=>{const g=slot('Gengar & Mimikyu-GX TEU 053','Gengar & Mimikyu-GX',[],[],1);
  g.printed.stage='Basic';g.printed.subtypes=['Basic','TAG TEAM','GX'];return g;};
 const lockedBasic=view({active:basicGengar(),bench:[],hand:['Duskull VIV 069']});
 const playBasic=(token,printing,handIndex)=>({kind:'play-card',token,actorPrinting:printing,
   publicMetadata:{cardType:'pokemon',handIndex}});
 same(run(lockedBasic,[playBasic('dusk','Duskull VIV 069',0),pass()]),
  {kind:'select-action',token:'dusk'},
  'under BUS plus AOR, Basic Active can still Bench Duskull from hand');
 const noBase=view({active:basicGengar(),bench:[],hand:['Telepathic Psychic Energy MEG 088']});
 noBase.ownTurnResources.energyPlayedTurn=0;
 const activeTPE={kind:'play-card',token:'basic-active-tpe',
  actorPrinting:'Telepathic Psychic Energy MEG 088',
  targetPrinting:noBase.ownPublic.active.printing,
  publicMetadata:{cardType:'energy',handIndex:0,targetSeat:'actor',
  targetZone:'active',targetIndex:0,isOwnerVisible:true}};
 same(run(noBase,[activeTPE,pass()]),
  {kind:'select-action',token:'basic-active-tpe'},
  'Item and Basic-attack lock do not prevent TPE attachment that can recruit Stage1 bases');
 const selection=(token,printing,index)=>({kind:'card',token,printing,label:printing,
   publicMetadata:{selectionType:'card-combination',selectionIndex:index,
    selectedCount:1,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}});
 const lockTpePrompt={schema:P.PROMPT_SCHEMA,actingSeat:0,promptType:'ChooseCardsPrompt',
   description:'Recruit Psychic Basics under Item lock',
   source:{classification:'actor-choice',sourceKind:'card-effect',
     sourcePrinting:'Telepathic Psychic Energy MEG 088',
     effectName:'Telepathic Psychic Energy'},
   choices:[selection('dusk1','Duskull VIV 069',0),
     selection('dusk2','Duskull VIV 069',1),
     selection('articuno','Galarian Articuno V CRE 058',2),
     {kind:'empty-selection',token:'empty',label:'Choose no items'}],
   publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
    ownerSeat:'actor',isOwnerVisible:true,isSecret:false,
    minimumCount:0,maximumCount:2,allowCancel:false}};
 same(run(noBase,[],lockTpePrompt),
  {kind:'select-choices',tokens:['dusk1','articuno']},
  'TPE recruits distinct Duskull base and future Forest Seal Stone V host');
 const unpaid=basicGengar();unpaid.energies=[];
 const lockedNoEnergy=view({active:unpaid,
  bench:[slot('Duskull VIV 069','Duskull')],hand:['Telepathic Psychic Energy MEG 088']});
 lockedNoEnergy.globalTurn=2;lockedNoEnergy.ownTurnResources.energyPlayedTurn=0;
 const wrongActive={kind:'play-card',token:'wrong-active-tpe',
   actorPrinting:'Telepathic Psychic Energy MEG 088',
   targetPrinting:unpaid.printing,
   publicMetadata:{cardType:'energy',handIndex:0,targetSeat:'actor',
    targetZone:'active',targetIndex:0,isOwnerVisible:true}};
 const rightDusk={kind:'play-card',token:'right-dusk-tpe',
   actorPrinting:'Telepathic Psychic Energy MEG 088',
   targetPrinting:'Duskull VIV 069',
   publicMetadata:{cardType:'energy',handIndex:0,targetSeat:'actor',
    targetZone:'bench',targetIndex:0,isOwnerVisible:true}};
 same(run(lockedNoEnergy,[wrongActive,rightDusk,pass()]),
  {kind:'select-action',token:'right-dusk-tpe'},
  'BUS locks Basic attacks; TPE funds evolving Duskull rather than unpaid Active Gengar');
 const benchDusk=view({active:basicGengar(),
   bench:[slot('Duskull VIV 069','Duskull')],hand:['Telepathic Psychic Energy MEG 088']});
 benchDusk.ownTurnResources.energyPlayedTurn=0;
 const benchTPE={kind:'play-card',token:'tpe-dusk',
   actorPrinting:'Telepathic Psychic Energy MEG 088',
   targetPrinting:benchDusk.ownPublic.bench[0].printing,
   publicMetadata:{cardType:'energy',handIndex:0,targetSeat:'actor',
    targetZone:'bench',targetIndex:0,isOwnerVisible:true}};
 same(run(benchDusk,[benchTPE,pass()]),
  {kind:'select-action',token:'tpe-dusk'},
  'save TPE energy on Benched Duskull for its Stage1 evolution');
 benchDusk.ownHand=['Dusclops SFA 019'];benchDusk.ownPublic.bench[0].energies=['Telepathic Psychic Energy MEG 088'];
 const evolve={kind:'play-card',token:'evolve-dusk',actorPrinting:'Dusclops SFA 019',
  targetPrinting:'Duskull VIV 069',publicMetadata:{cardType:'pokemon',handIndex:0,
   targetSeat:'actor',targetZone:'bench',targetIndex:0,isOwnerVisible:true}};
 same(run(benchDusk,[evolve,pass()]),
  {kind:'select-action',token:'evolve-dusk'},
  'native legal Stage1 evolution of previously placed Duskull');
 const stage= view({active:basicGengar(),
   bench:[dus([],1)],hand:['Tool Jammer BST 136']});
 const benchTool={kind:'play-card',token:'jammer-on-bench',
  actorPrinting:'Tool Jammer BST 136',targetPrinting:'Dusclops SFA 019',
  publicMetadata:{cardType:'tool',handIndex:0,targetSeat:'actor',
    targetZone:'bench',targetIndex:0,isOwnerVisible:true}};
 same(run(stage,[benchTool,pass()]),
  {kind:'select-action',token:'jammer-on-bench'},
  'Bench Stage1 Tool attachment remains available during AOR Item lock');
 stage.ownPublic.bench[0].tools=['Tool Jammer BST 136'];
 stage.ownPublic.bench[0].energies=['Basic Psychic Energy','Telepathic Psychic Energy MEG 088'];
 const retreat={kind:'retreat',token:'retreat-stage1',
  actorPrinting:'Gengar & Mimikyu-GX TEU 053',targetPrinting:'Dusclops SFA 019',
  publicMetadata:{benchIndex:0,targetSeat:'actor',targetZone:'bench',
   targetIndex:0,isOwnerVisible:true}};
 same(run(stage,[retreat,pass()]),
  {kind:'select-action',token:'retreat-stage1'},
  'Native legal retreat finally promotes fully paid Tool-Jammer Dusclops');
 const donorInHand=view({active:slot('Mewtwo & Mew-GX UNM 071','Mewtwo & Mew-GX',
  ['Perfection'],[],1),bench:[sealHost],
  bus:slot('Bunnelby PRC 121','Bunnelby'),oppBench:[],
  hand:['Gengar & Mimikyu-GX TEU 053']});
 donorInHand.globalTurn=3;
 const playDonor={kind:'play-card',token:'gengar-from-hand',
  actorPrinting:'Gengar & Mimikyu-GX TEU 053',
  publicMetadata:{cardType:'pokemon',handIndex:0}};
 same(run(donorInHand,[playDonor,pass()]),
  {kind:'select-action',token:'gengar-from-hand'},
  'Mewtwo plays held donor, does not waste global FSS search');
 donorInHand.ownPublic.bench.push(slot('Gengar & Mimikyu-GX TEU 053','Gengar & Mimikyu-GX'));
 same(run(donorInHand,[use('perfection','Perfection','active'),pass()]),
  {kind:'select-action',token:'perfection'},
  'Perfection becomes live after actual donor Bench transition');
 const heldJammer=view({active:dus(),bench:[dus(),sealHost],
  hand:['Tool Jammer BST 136']});
 same(run(heldJammer,[use('star','Star Alchemy','bench',1),pass()]),
  {kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'},
  'do not spend Star Alchemy on a Tool Jammer already visible in hand');
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
