'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const worker=require('../../simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
function publicRestrictions() {
  return {
    gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0,
    attackMaxEnergy: null, attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false,
    itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false,
    energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: 0
  };
}

function pokemonRestrictions() {
  return {
    cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false,
    cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
  };
}

function attack(name, cost, damage, extra = {}) {
  return {
    name, cost, damage, damageCalculation: null, text: null,
    gxAttack: false, barrage: false, ...extra
  };
}

function pokemon({
  printing, name, hp = 200, types = ['Psychic'], subtypes = ['Basic'],
  energies = [], attacks = [], abilities = [], suppression = null,
  damage = 0, tools = [], weakness = []
}) {
  return {
    printing, name, hp, damage, lastPlayedOrEvolvedTurn: 0,
    printed: {
      stage: subtypes.includes('VMAX') ? 'VMAX' : 'BASIC',
      subtypes, types, retreatCost: [], weakness, resistance: []
    },
    specialConditions: [], publicRestrictions: pokemonRestrictions(),
    evolutionPrintings: [], energies, tools, attacks, abilities,
    abilityDetails: abilities.map(name => ({ name, powerType: 'ABILITY', text: null })),
    abilitySuppressions: abilities.map(abilityName => ({
      abilityName,
      suppressed: suppression,
      reasonCode: suppression === true ? 'TEST_SUPPRESSION' : null,
      sourcePrinting: suppression === true ? 'Path to the Peak CES' : null
    }))
  };
}

function publicPlayer({
  active = null, bench = [], stadium = [], discard = [],
  handCount = 0, deckCount = 30, prizeCount = 6
} = {}) {
  return {
    active,
    bench: [...bench, ...Array(Math.max(0, 5 - bench.length)).fill(null)],
    stadium, discard, lostZone: [], resolvingSupporter: [],
    publicHand: null, prizeSlots: [],
    publicTurnRestrictions: publicRestrictions(),
    handCount, deckCount, prizeCount
  };
}

function observation(seat, {
  active = null, bench = [], opponentActive = null, opponentBench = [],
  ownHand = [], ownDiscard = [], globalTurn = 3, ownStadium = [],
  opponentStadium = [], decisionKind = 'owner-root', promptType = null
} = {}) {
  return {
    actorSeat: seat, globalTurn, phase: 2, decisionKind,
    pendingPromptType: promptType, pendingOwnerDeckSearch: false,
    ownHand,
    ownPublic: publicPlayer({
      active, bench, stadium: ownStadium, discard: ownDiscard,
      handCount: ownHand.length
    }),
    opponentPublic: publicPlayer({
      active: opponentActive, bench: opponentBench,
      stadium: opponentStadium, handCount: 5
    }),
    ownTurnResources: {
      supporterPlayedTurn: 0, retreatedTurn: 0, extraTurnActive: false,
      energyPlayedTurn: false, stadiumPlayedTurn: false, stadiumUsedTurn: false,
      vstarUsed: false, pokemonPlayLocked: false, abilityPokemonPlayLocked: false,
      evolutionPlayLocked: false, itemPlayLocked: false, supporterPlayLocked: false,
      stadiumPlayLocked: false, toolPlayLocked: false, energyPlayLocked: false,
      specialEnergyPlayLocked: false
    },
    ownerK1: null
  };
}


const profiles=[
  {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
  {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
const V='Shadow Rider Calyrex V CRE', M='Shadow Rider Calyrex VMAX CRE', R='Radiant Eternatus CRZ',
  L='Tapu Lele-GX GRI', W='Wobbuffet PHF', D='Dialga-GX UPR', A='Latias ex SSP',
  P='Psychic Energy SVE', T='Trevenant & Dusknoir-GX UNM', RANGER='Pokémon Ranger STS',
  FSS='Forest Seal Stone SIT', VS='VS Seeker PHF', NS='Night Stretcher SFA',
  HB='Hisuian Heavy Ball ASR', TEMPLE='Temple of Sinnoh ASR', FOG='Fog Crystal CRE';
const v=(energies=[])=>pokemon({printing:V,name:'Shadow Rider Calyrex V',subtypes:['Basic','V'],energies,
  attacks:[attack('Shadow Mist',['Psychic'],'10'),attack('Astral Barrage',['Colorless','Colorless','Colorless'],'0')]});
const vmax=(energies=[],suppression=false)=>pokemon({printing:M,name:'Shadow Rider Calyrex VMAX',subtypes:['VMAX','V'],energies,
  abilities:['Underworld Door'],suppression,attacks:[attack('Max Geist',['Colorless','Colorless','Colorless'],'10+')]});
const radiant=()=>pokemon({printing:R,name:'Radiant Eternatus',subtypes:['Basic','Radiant'],types:['Dragon'],
  abilities:['Climactic Gate'],suppression:false});
const wob=()=>pokemon({printing:W,name:'Wobbuffet',abilities:['Bide Barricade'],suppression:false,
  attacks:[attack('Psychic Assault',['Psychic','Colorless'],'10+')]});
const latias=()=>pokemon({printing:A,name:'Latias ex',subtypes:['Basic','ex'],abilities:['Skyliner'],suppression:false});
const dialga=()=>pokemon({printing:D,name:'Dialga-GX',subtypes:['Basic','GX'],types:['Dragon'],
  attacks:[attack('Timeless-GX',['Metal','Metal','Colorless'],'150',{gxAttack:true})]});
const defender=(overrides={})=>pokemon({printing:'Regidrago VSTAR SIT',name:'Regidrago VSTAR',hp:280,types:['Dragon'],
  subtypes:['VSTAR'],...overrides});
const root=(seat,view,actions,receipt=null)=>({role:'candidate',seat,observation:view,prompt:null,
  actionFrontier:{items:[...actions,{token:'pass',kind:'pass'}]},publicEventReceipt:receipt});
const play=(token,actorPrinting,targetPrinting=null,metadata={})=>({token,kind:'play-card',actorPrinting,targetPrinting,publicMetadata:metadata});
const target=(zone,index)=>({targetSeat:'actor',targetZone:zone,targetIndex:index,isOwnerVisible:true});
const sel=token=>({kind:'select-action',token});
const choice=token=>({kind:'select-choice',token});
function decide(profile,req){
  const p=worker.createPolicy({role:'candidate',seat:req.seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const d=p.decide(req);
  return protocol.validateDecision(d,req.prompt,new Set((req.actionFrontier?.items??[]).map(x=>x.token)));
}
function cardPrompt(seat,view,sourcePrinting,effectName,sourceZone,printings,min=1,max=1) {
  const choices=printings.map((printing,i)=>({token:'card-'+i,kind:'card',printing,label:printing,
    publicMetadata:{selectionIndex:i,selectedCount:1,sourceZone,ownerSeat:'actor',isOwnerVisible:true}}));
  if(min===0)choices.push({kind:'empty-selection',token:'empty',label:'Choose no items'});
  return {role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'ChooseCardsPrompt'},
    prompt:{actingSeat:seat,promptType:'ChooseCardsPrompt',description:null,
      source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting,effectName},choices,
      publicMetadata:{sourceZone,ownerSeat:'actor',isOwnerVisible:true,minimumCount:min,maximumCount:max,
        allowCancel:false,isSecret:false,selectionType:'card-combination'}},publicEventReceipt:null};
}
const mult=(...tokens)=>({kind:'select-choices',tokens});
function lockItems(view) {view.ownTurnResources.itemPlayLocked=true;view.ownPublic.publicTurnRestrictions.itemPlayLocked=true;return view;}
function paired(name,fn){test(name,()=>{for(const seat of [0,1])for(const [i,profile] of profiles.entries())fn(seat,profile,i);});}
paired('Ranger clears a real Item restriction only in Hood and never bypasses the Supporter resource',(seat,profile,i)=>{
  const view=lockItems(observation(seat,{active:v(),ownHand:[RANGER,FOG],opponentActive:defender()}));
  const actions=[play('ranger',RANGER),play('fog',FOG)];
  assert.deepEqual(decide(profile,root(seat,view,actions)),sel(i===0?'ranger':'pass'));
  view.ownTurnResources.supporterPlayedTurn=1;
  assert.deepEqual(decide(profile,root(seat,view,actions)),sel('pass'));
  view.ownTurnResources.supporterPlayedTurn=0;view.globalTurn=1;
  assert.deepEqual(decide(profile,root(seat,view,actions)),sel('pass'));
  view.globalTurn=3;view.ownTurnResources.itemPlayLocked=false;view.ownPublic.publicTurnRestrictions.itemPlayLocked=false;
  assert.deepEqual(decide(profile,root(seat,view,[play('ranger',RANGER)])),sel('pass'));
});
paired('Arven into Stone works through an Item lock; its actual search has one Item and one Tool',(seat,profile)=>{
  const arven='Arven SVI',view=lockItems(observation(seat,{active:v(),ownHand:[arven,FOG],opponentActive:defender()}));
  assert.deepEqual(decide(profile,root(seat,view,[play('arven',arven),play('fog',FOG)])),sel('arven'));
  const prompt=cardPrompt(seat,view,arven,'Arven','deck',[FOG,'Mysterious Treasure FLI',FSS],0,2);
  assert.deepEqual(decide(profile,prompt),mult('card-0','card-2'));
  const after=lockItems(observation(seat,{active:v(),ownHand:[FSS,FOG],opponentActive:defender()}));
  assert.deepEqual(decide(profile,root(seat,after,[play('stone',FSS,V,target('active',0)),play('fog',FOG)])),sel('stone'));
  after.ownTurnResources.toolPlayLocked=true;
  assert.deepEqual(decide(profile,root(seat,after,[play('stone',FSS,V,target('active',0)),play('fog',FOG)])),sel('pass'));
});
paired('recovery is useful only with available target, and must respect Item lock',(seat,profile)=>{
  const view=observation(seat,{active:v(),ownHand:[NS],ownDiscard:[P,D],opponentActive:defender()});
  assert.deepEqual(decide(profile,root(seat,view,[play('stretcher',NS)])),sel('stretcher'));
  assert.deepEqual(decide(profile,cardPrompt(seat,view,NS,'Night Stretcher','discard',[D,P])),mult('card-1'));
  lockItems(view);
  assert.deepEqual(decide(profile,root(seat,view,[play('stretcher',NS)])),sel('pass'));
  const vu=observation(seat,{active:v(),ownHand:[VS],ownDiscard:['Lillie\'s Determination MEG'],opponentActive:defender()});
  assert.deepEqual(decide(profile,root(seat,vu,[play('seeker',VS)])),sel('seeker'));
  vu.ownTurnResources.supporterPlayedTurn=1;
  assert.deepEqual(decide(profile,root(seat,vu,[play('seeker',VS)])),sel('pass'));
});
paired('discard-cost root cannot count the played Ball as its payment',(seat,profile)=>{
  const view=observation(seat,{active:v(),ownHand:['Quick Ball FST'],opponentActive:defender()});
  assert.deepEqual(decide(profile,root(seat,view,[play('ball','Quick Ball FST')])),sel('pass'));
  view.ownHand.push(P);view.ownPublic.handCount++;
  assert.deepEqual(decide(profile,root(seat,view,[play('ball','Quick Ball FST')])),sel('ball'));
});
paired('Gate competes with an attack and does not double-count its own bench slot',(seat,profile)=>{
  const view=observation(seat,{active:v([P]),bench:[v(),v()],ownHand:[R],opponentActive:defender()});
  const rad=play('gate',R,null,target('bench',2));
  const a={kind:'attack',token:'mist',attackName:'Shadow Mist'};
  assert.deepEqual(decide(profile,root(seat,view,[rad,a])),sel('gate'));
  const after=observation(seat,{active:v([P]),bench:[v(),v(),v(),radiant()],opponentActive:defender(),decisionKind:'owner-prompt'});
  const confirm={role:'candidate',seat,observation:after,publicEventReceipt:null,
    prompt:{actingSeat:seat,promptType:'ConfirmPrompt',description:'WANT_TO_USE_ABILITY',
      source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:R,effectName:'Climactic Gate'},
      choices:[{token:'yes',kind:'confirm',label:'Yes'},{token:'no',kind:'confirm',label:'No'}],publicMetadata:{selectionType:'confirm'}}};
  assert.deepEqual(decide(profile,confirm),choice('yes'));
});
paired('manual Energy funds a real attack and does not mistake Dialga Metal cost for Psychic',(seat,profile)=>{
  const view=observation(seat,{active:dialga(),bench:[v()],ownHand:[P],opponentActive:defender()});
  assert.deepEqual(decide(profile,root(seat,view,[play('dialga-energy',P,D,target('active',0)),
    play('rider-energy',P,V,target('bench',0))])),sel('rider-energy'));
  view.ownTurnResources.energyPlayedTurn=true;
  assert.deepEqual(decide(profile,root(seat,view,[play('rider-energy',P,V,target('bench',0))])),sel('pass'));
});
paired('Underworld Door needs its own unspent marker; Psychic bench restriction remains',(seat,profile)=>{
  const view=observation(seat,{active:vmax(),bench:[v()],ownHand:[P],opponentActive:defender()});
  const door={token:'door',kind:'use-ability',actorPrinting:M,publicMetadata:{abilityName:'Underworld Door',sourceSeat:'actor',sourceZone:'active'}};
  const receipt={version:'agent8-public-event-receipt-v3-turn-stamped',ownerActive:{printing:M,knownAbilityUse:[{name:'Underworld Door',usedThisTurn:false}]}};
  assert.deepEqual(decide(profile,root(seat,view,[door],receipt)),sel('door'));
  receipt.ownerActive.knownAbilityUse[0].usedThisTurn=true;
  assert.deepEqual(decide(profile,root(seat,view,[door],receipt)),sel('pass'));
  assert.deepEqual(decide(profile,root(seat,view,[door])),sel('pass'));
  receipt.ownerActive.knownAbilityUse[0].usedThisTurn=false;
  view.ownPublic.bench[0]=radiant();
  assert.deepEqual(decide(profile,root(seat,view,[door],receipt)),sel('pass'));
});
paired('Lockbridge Temple is conditional on real attached Special Energy and own bench cost',(seat,profile,i)=>{
  const view=observation(seat,{active:v(),ownHand:[TEMPLE],opponentActive:defender({energies:['Double Dragon Energy ROS']})});
  assert.deepEqual(decide(profile,root(seat,view,[play('temple',TEMPLE)])),sel(i===1?'temple':'pass'));
  view.opponentPublic.active.energies=[P];
  assert.deepEqual(decide(profile,root(seat,view,[play('temple',TEMPLE)])),sel('pass'));
  view.opponentPublic.active.energies=['Double Dragon Energy ROS'];
  view.ownPublic.stadium=['Sky Field ROS'];view.ownPublic.bench=Array.from({length:6},()=>v());
  assert.deepEqual(decide(profile,root(seat,view,[play('temple',TEMPLE)])),sel('pass'));
});
paired('Lockbridge can leave its own Active Wobbuffet for a live Gate line',(seat,profile,i)=>{
  const view=observation(seat,{active:wob(),bench:[v(),latias()],ownHand:[R],opponentActive:defender()});
  const retreat={token:'retreat-v',kind:'retreat',targetPrinting:V,publicMetadata:{benchIndex:0}};
  assert.deepEqual(decide(profile,root(seat,view,[retreat,play('gate',R,null,target('bench',2))])),sel(i===1?'retreat-v':'pass'));
});
paired('unadmitted Copycat is refused even when it appears in the supplied frontier',(seat,profile)=>{
  const mimi=pokemon({printing:'Mimikyu GRI',name:'Mimikyu',energies:[P,P],attacks:[attack('Copycat',['Psychic','Colorless'],0)]});
  const view=observation(seat,{active:mimi,opponentActive:defender(),ownDiscard:[D]});
  assert.deepEqual(decide(profile,root(seat,view,[{token:'copy',kind:'attack',attackName:'Copycat'}],
    {opponentCopycatChoices:[{attackName:'Apex Dragon',sourcePrinting:'Regidrago VSTAR SIT'}]})),sel('pass'));
});

paired('certified fully Prized Radiant prefers Heavy Ball over the dead tutor', (seat,profile)=>{
  const mt='Mysterious Treasure FLI';
  const view=observation(seat,{active:v(),ownHand:[HB,mt,P],opponentActive:defender()});
  const actions=[play('heavy',HB),play('treasure',mt)];
  assert.deepEqual(decide(profile,root(seat,view,actions)),sel('treasure'));
  view.ownerK1={epoch:1,exactMembershipKnown:false,knownPrintings:null,invalidationReason:null,
    prizeFacts:{schema:'agent46-owner-fully-prized-v1',actorSeat:seat,epoch:1,turn:view.globalTurn,
      prizeCount:6,fullyPrized:[{cardName:'Radiant Eternatus',printing:R,copies:1}]}};
  protocol.validateActorObservation(view,seat,profile);
  assert.deepEqual(decide(profile,root(seat,view,actions)),sel('heavy'));
  const prompt=cardPrompt(seat,view,HB,'Hisuian Heavy Ball','prizes',[D,R],0,1);
  assert.deepEqual(decide(profile,prompt),mult('card-1'));
  view.ownerK1.prizeFacts.epoch=0;
  assert.throws(()=>protocol.validateActorObservation(view,seat,profile));
  assert.deepEqual(decide(profile,root(seat,view,actions)),sel('treasure'));
  view.ownerK1.prizeFacts.epoch=1;
  assert.throws(()=>protocol.validateActorObservation(view,seat));
  view.ownerK1.prizeFacts.fullyPrized[0].copies=2;
  assert.throws(()=>protocol.validateActorObservation(view,seat,profile));
});

paired('Raihan after manual attachment funds the Active, not the unfundable Metal attacker',(seat,profile)=>{
  const name='Raihan EVS',view=observation(seat,{active:vmax([P,P]),bench:[dialga()],ownHand:[name],ownDiscard:[P],opponentActive:defender({damage:180})});
  view.ownTurnResources.energyPlayedTurn=true;
  const receipt={priorOpponentTurnKO:{any:true}};
  assert.deepEqual(decide(profile,root(seat,view,[play('raihan',name)],receipt)),sel('raihan'));
  const m={sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,energyType:'BASIC'};
  const prompt={actingSeat:seat,promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY_CARDS',
    source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:name,effectName:'Raihan'},
    choices:[{kind:'energy',token:'active',printing:P,publicMetadata:{...m,zone:'active',slotIndex:0}},
      {kind:'energy',token:'dialga',printing:P,publicMetadata:{...m,zone:'bench',benchIndex:0}}],
    publicMetadata:{...m,selectionType:'energy-attachment',minimumCount:1,maximumCount:1,allowCancel:false,zone:'active,bench',count:2}};
  assert.deepEqual(decide(profile,{role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'AttachEnergyPrompt'},prompt,publicEventReceipt:receipt}),choice('active'));
});
paired('Guzma evaluates the compulsory own switch before committing the Supporter',(seat,profile)=>{
  const name='Guzma BUS',fragile=defender({hp:70}),view=observation(seat,{active:vmax([P,P,P,P]),bench:[dialga()],ownHand:[name],opponentActive:defender(),opponentBench:[fragile]});
  assert.deepEqual(decide(profile,root(seat,view,[play('guzma',name)])),sel('pass'));
  view.ownPublic.bench[0]=vmax([P,P,P]);
  assert.deepEqual(decide(profile,root(seat,view,[play('guzma',name)])),sel('guzma'));
});
paired('Girafarig targets public Regidrago payloads but not hidden hand or arbitrary cards',(seat,profile)=>{
  const name='Girafarig LOT',active=pokemon({printing:name,name:'Girafarig',hp:90,energies:[P],attacks:[attack('Get Lost',['Colorless'],0)]});
  const view=observation(seat,{active,opponentActive:defender()});
  view.opponentPublic.discard=['Psychic Energy SVE','Dialga-GX UPR','Dragapult ex TWM'];
  const move={kind:'attack',token:'lost',attackName:'Get Lost'};
  assert.deepEqual(decide(profile,root(seat,view,[move])),sel('lost'));
  const q=cardPrompt(seat,view,name,'Get Lost','discard',view.opponentPublic.discard,2,2);
  q.prompt.publicMetadata.ownerSeat='opponent';
  for(const c of q.prompt.choices)c.publicMetadata.ownerSeat='opponent';
  assert.deepEqual(decide(profile,q),mult('card-1','card-2'));
  view.opponentPublic.discard=['Psychic Energy SVE'];
  assert.deepEqual(decide(profile,root(seat,view,[move])),sel('pass'));
});

paired('Fog Crystal does not spend a tutor on energy already held for the current attachment',(seat,profile)=>{
  const view=observation(seat,{active:v(),bench:[v()],opponentActive:pokemon({printing:'Pikachu',name:'Pikachu',types:['Lightning']}),ownHand:[P,P,FOG]});
  assert.deepEqual(decide(profile,root(seat,view,[play('fog',FOG)])),sel('pass'));
  view.ownHand=[FOG];view.ownPublic.handCount=1;
  assert.deepEqual(decide(profile,root(seat,view,[play('fog',FOG)])),sel('fog'));
});
paired('Teammates obtains distinct complementary bottlenecks rather than duplicate VMAX',(seat,profile)=>{
  const view=observation(seat,{active:v(),bench:[v(),v(),v(),v()],opponentActive:defender()});
  const req=cardPrompt(seat,view,'Teammates PRC','Teammates','deck',[M,M,P],2,2);
  assert.deepEqual(decide(profile,req),mult('card-0','card-2'));
});
paired('Raihan beats Teammates when acceleration unlocks a knockout now',(seat,profile)=>{
  const view=observation(seat,{active:vmax([P,P]),bench:[v([P,P,P])],opponentActive:defender({hp:180}),ownHand:['Raihan EVS','Teammates PRC'],ownDiscard:[P]});
  view.ownTurnResources.energyPlayedTurn=true;
  const receipt={priorOpponentTurnKO:{any:true}};
  assert.deepEqual(decide(profile,root(seat,view,[play('team','Teammates PRC'),play('raihan','Raihan EVS')],receipt)),sel('raihan'));
});
paired('Do not reset a nearly empty deck or throw away a live Gate hand for no gain',(seat,profile)=>{
  const name="Lillie's Determination MEG";
  const view=observation(seat,{active:v(),opponentActive:defender(),ownHand:[name,R,FSS,P]});
  view.ownPublic.deckCount=3;
  assert.deepEqual(decide(profile,root(seat,view,[play('draw',name)])),sel('pass'));
});

paired('Sky Field opens only a real three-slot Gate; Dimension Valley needs a funded own attack and cannot unlock the opponent',(seat,profile)=>{
  const sky='Sky Field ROS',dv='Dimension Valley PHF';
  const view=observation(seat,{active:v(),bench:[v(),v(),v(),v()],opponentActive:defender(),ownHand:[R,sky,dv]});
  assert.deepEqual(decide(profile,root(seat,view,[play('sky',sky),play('dv',dv)])),sel('sky'));
  const noGate=observation(seat,{active:v(),bench:[v()],opponentActive:defender(),ownHand:[sky]});
  assert.deepEqual(decide(profile,root(seat,noGate,[play('sky',sky)])),sel('pass'));
  const open=observation(seat,{active:v(),opponentActive:defender(),ownHand:[dv]});
  assert.deepEqual(decide(profile,root(seat,open,[play('dv',dv)])),sel('pass'));
  const psychic=pokemon({printing:'Test Psychic Attacker',name:'Test Psychic Attacker',types:['Psychic'],energies:[P,P],attacks:[attack('Triple Colorless',['Colorless','Colorless','Colorless'],'120')]});
  const funded=observation(seat,{active:psychic,opponentActive:defender(),ownHand:[dv]});
  assert.deepEqual(decide(profile,root(seat,funded,[play('dv',dv)])),sel('dv'));
  const opponentPsychic=pokemon({printing:'Opponent Psychic Attacker',name:'Opponent Psychic Attacker',types:['Psychic'],energies:[P,P],attacks:[attack('Triple Colorless',['Colorless','Colorless','Colorless'],'120')]});
  const mirror=observation(seat,{active:v(),opponentActive:opponentPsychic,ownHand:[dv]});
  assert.deepEqual(decide(profile,root(seat,mirror,[play('dv',dv)])),sel('pass'));
  const unknownOpponent=pokemon({printing:'Unknown Energy Attacker',name:'Unknown Energy Attacker',types:['Psychic'],
    energies:[],attacks:[attack('Triple Colorless',['Colorless','Colorless','Colorless'],'120')]});
  unknownOpponent.energies=null;
  const unknown=observation(seat,{active:v(),opponentActive:unknownOpponent,ownHand:[dv]});
  assert.deepEqual(decide(profile,root(seat,unknown,[play('dv',dv)])),sel('pass'));
});
paired('final-prize public attack precedes optional draw or bench expenditure',(seat,profile)=>{
  const view=observation(seat,{active:vmax([P,P,P,P,P,P,P,P,P]),opponentActive:defender({hp:250}),ownHand:["Lillie's Determination MEG"]});
  view.ownPublic.prizeCount=2;
  assert.deepEqual(decide(profile,root(seat,view,[play('draw',"Lillie's Determination MEG"),{token:'ko',kind:'attack',attackName:'Max Geist'}])),sel('ko'));
});
paired('Wobbuffet pivot pressure comes from live relevant non-Psychic abilities, not all boards',(seat,profile,i)=>{
  const thorns=pokemon({printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',types:['Lightning'],subtypes:['Basic','ex'],abilities:['Initialization'],suppression:false});
  const view=observation(seat,{active:v(),bench:[wob()],opponentActive:thorns});
  const retreat={token:'wob',kind:'retreat',targetPrinting:W,publicMetadata:{benchIndex:0}};
  assert.deepEqual(decide(profile,root(seat,view,[retreat])),sel(i===1?'wob':'pass'));
  view.opponentPublic.active=pokemon({printing:'Shadow Rider Calyrex VMAX CRE',name:'Shadow Rider Calyrex VMAX',subtypes:['VMAX','V'],abilities:['Underworld Door'],suppression:false});
  assert.deepEqual(decide(profile,root(seat,view,[retreat])),sel('pass'));
  view.opponentPublic.active=pokemon({printing:'Klefki SVI',name:'Klefki',abilities:['Mischievous Lock'],suppression:false});
  view.opponentPublic.bench[0]=thorns;
  assert.deepEqual(decide(profile,root(seat,view,[retreat])),sel('pass'));
});
function damageEffects(overrides={}){
  return {prevention:'none',effectsPrevention:'none',reduction:0,reductionFilter:'none',
    beforeWeaknessReduction:0,outgoingReduction:0,outgoingAfterWeaknessReduction:0,
    chancePrevention:false,chanceAttackFailure:0,...overrides};
}
paired('Safeguard wall blocks V damage but not GX or counter placement',(seat,profile)=>{
  const wall=pokemon({printing:'Mimikyu PAL',name:'Mimikyu',hp:70,damage:20,
    abilities:['Safeguard'],suppression:false});
  const bench1=pokemon({printing:'Comfey LOR',name:'Comfey',hp:70,damage:20});
  const bench2=pokemon({printing:'Snorlax PGO',name:'Snorlax',hp:150});
  const view=observation(seat,{active:v([P,P,P]),opponentActive:wall,opponentBench:[bench1,bench2]});
  const mist={kind:'attack',token:'mist',attackName:'Shadow Mist'};
  const barrage={kind:'attack',token:'barrage',attackName:'Astral Barrage'};
  assert.deepEqual(decide(profile,root(seat,view,[mist,barrage])),sel('barrage'));
  const prompt={actingSeat:seat,promptType:'ChoosePokemonPrompt',
    source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:V,effectName:'Astral Barrage'},
    publicMetadata:{selectionType:'pokemon',minimumCount:2,maximumCount:2,allowCancel:false},
    choices:[{token:'wall',kind:'pokemon',printing:wall.printing,publicMetadata:{ownerSeat:'opponent',targetZone:'active',isOwnerVisible:true}},
      {token:'bench1',kind:'pokemon',printing:bench1.printing,publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0,isOwnerVisible:true}},
      {token:'bench2',kind:'pokemon',printing:bench2.printing,publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:1,isOwnerVisible:true}}]};
  const req={role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'ChoosePokemonPrompt'},prompt,publicEventReceipt:null};
  assert.deepEqual(decide(profile,req),mult('wall','bench1'));
  bench1.publicDamageEffects=damageEffects({effectsPrevention:'all'});
  assert.deepEqual(decide(profile,req),mult('wall','bench2'));
  view.opponentPublic.bench=[bench1,null,null,null,null];
  assert.deepEqual(decide(profile,root(seat,view,[mist,barrage])),sel('pass'));
  const lele=pokemon({printing:L,name:'Tapu Lele-GX',subtypes:['Basic','GX'],energies:[P,P,P],
    attacks:[attack('Energy Drive',['Colorless','Colorless'],'20×')]});
  view.ownPublic.active=lele;
  assert.deepEqual(decide(profile,root(seat,view,[{kind:'attack',token:'drive',attackName:'Energy Drive'}])),sel('drive'));
});
paired('public Covert Flight and Rolling Iron change direct KO choices, uncertain effects do not fabricate KO',(seat,profile)=>{
  const noivern=pokemon({printing:'Noivern ex PAL',name:'Noivern ex',hp:260,damage:190,
    subtypes:['Stage 1','ex'],types:['Dragon']});
  const lele=pokemon({printing:L,name:'Tapu Lele-GX',subtypes:['Basic','GX'],energies:[P,P,P,P],
    attacks:[attack('Energy Drive',['Colorless','Colorless'],'20×')]});
  noivern.publicDamageEffects=damageEffects({prevention:'basic'});
  const view=observation(seat,{active:lele,opponentActive:noivern});
  const drive={kind:'attack',token:'drive',attackName:'Energy Drive'};
  assert.deepEqual(decide(profile,root(seat,view,[drive])),sel('pass'));
  noivern.publicDamageEffects=damageEffects({reduction:80});
  assert.deepEqual(decide(profile,root(seat,view,[drive])),sel('pass'));
  noivern.publicDamageEffects=damageEffects({prevention:'unknown'});
  assert.deepEqual(decide(profile,root(seat,view,[drive])),sel('pass'));
  noivern.publicDamageEffects=damageEffects();
  assert.deepEqual(decide(profile,root(seat,view,[drive])),sel('drive'));
});
paired('three-prize Mega KO precedes optional expenditure at three prizes remaining',(seat,profile)=>{
  const mega=pokemon({printing:'Mega Absol ex MEG',name:'Mega Absol ex',hp:280,damage:220,
    subtypes:['Basic','MEGA','ex'],types:['Darkness']});
  const view=observation(seat,{active:vmax([P,P,P]),opponentActive:mega,ownHand:[P]});
  view.ownPublic.prizeCount=3;
  assert.deepEqual(decide(profile,root(seat,view,[play('attach',P,M,target('active',0)),{kind:'attack',token:'ko',attackName:'Max Geist'}])),sel('ko'));
});

paired('one-step final prize line chooses extra Door before discretionary hand reset or manual attachment',(seat,profile)=>{
  const targetSlot=pokemon({printing:'Mega Absol ex M1L',name:'Mega Absol ex',hp:280,damage:150,
    subtypes:['Basic','ex'],types:['Darkness']});
  const view=observation(seat,{active:vmax([P,P,P]),bench:[v()],opponentActive:targetSlot,
    ownHand:[P,"Lillie's Determination MEG"]});
  view.ownPublic.prizeCount=3;
  const door={token:'door',kind:'use-ability',actorPrinting:M,publicMetadata:{abilityName:'Underworld Door',sourceSeat:'actor',sourceZone:'active'}};
  const receipt={version:'agent8-public-event-receipt-v3-turn-stamped',ownerActive:{printing:M,knownAbilityUse:[{name:'Underworld Door',usedThisTurn:false}]}};
  const items=[door,play('manual',P,V,target('bench',0)),play('draw',"Lillie's Determination MEG"),
    {kind:'attack',token:'ko',attackName:'Max Geist'}];
  assert.deepEqual(decide(profile,root(seat,view,items,receipt)),sel('door'));
  receipt.ownerActive.knownAbilityUse[0].usedThisTurn=true;
  assert.deepEqual(decide(profile,root(seat,view,items,receipt)),sel('manual'));
  view.ownPublic.bench[0].energies=[P];
  assert.deepEqual(decide(profile,root(seat,view,items,receipt)),sel('ko'));
});
paired('public one-step retreat enables final attack before optional supporter',(seat,profile)=>{
  const view=observation(seat,{active:v(),bench:[vmax([P,P,P])],opponentActive:
    pokemon({printing:'Genesect V FST',name:'Genesect V',hp:190,damage:90,subtypes:['Basic','V'],types:['Metal']}),
    ownHand:["Lillie's Determination MEG"]});
  view.ownPublic.prizeCount=2;
  view.ownPublic.active.printed.retreatCost=[];
  const retreat={token:'retreat',kind:'retreat',targetPrinting:M,publicMetadata:{benchIndex:0}};
  assert.deepEqual(decide(profile,root(seat,view,[retreat,play('draw',"Lillie's Determination MEG")])),sel('retreat'));
});
paired('attack cost increase blocks projected winning attachment unless cost is actually funded',(seat,profile)=>{
  const view=observation(seat,{active:vmax([P,P]),bench:[v([P,P])],opponentActive:
    pokemon({printing:'Genesect V FST',name:'Genesect V',hp:190,damage:30,subtypes:['Basic','V'],types:['Metal']}),
    ownHand:[P]});
  view.ownPublic.prizeCount=2;view.ownPublic.active.publicRestrictions.attackCostIncreaseWhileActive=1;
  // A single attach to Active still leaves a four-Energy cost unpaid.
  const items=[play('attach',P,M,target('active',0)),{kind:'attack',token:'ko',attackName:'Max Geist'}];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('attach'));
});

paired('Acerola refuses the only functioning attacker and saves exposed prize liability with a funded continuation',(seat,profile)=>{
  const victim=vmax([P,P,P]);victim.hp=320;victim.damage=260;
  const threat=pokemon({printing:'Mega Absol ex M1L',name:'Mega Absol ex',hp:280,
    subtypes:['Basic','ex'],types:['Darkness'],energies:['Darkness Energy SVE','Darkness Energy SVE','Darkness Energy SVE'],
    attacks:[attack('Claw of Darkness',['Darkness','Darkness','Colorless'],'200')]});
  const ace='Acerola BUS';
  const view=observation(seat,{active:victim,bench:[v()],opponentActive:threat,ownHand:[ace]});
  const items=[play('acerola',ace),{kind:'attack',token:'hit',attackName:'Max Geist'}];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('hit'));
  view.ownPublic.bench[0]=vmax([P,P,P]);view.ownPublic.bench[0].hp=320;
  view.opponentPublic.prizeCount=3;
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('acerola'));
});
paired('Tapu Cure spends GX only for useful two-Bench healing and never selects damaged Active',(seat,profile)=>{
  const lele=pokemon({printing:L,name:'Tapu Lele-GX',subtypes:['Basic','GX'],damage:30,energies:[P],
    attacks:[attack('Tapu Cure-GX',['Psychic'],'0',{gxAttack:true})]});
  const one=vmax([P]);one.hp=320;one.damage=260;
  const two=vmax([P]);two.hp=320;two.damage=240;
  const targetSlot=pokemon({printing:'Mega Absol ex M1L',name:'Mega Absol ex',hp:280,
    subtypes:['Basic','ex'],types:['Darkness'],energies:['Darkness Energy SVE','Darkness Energy SVE','Darkness Energy SVE'],
    attacks:[attack('Claw of Darkness',['Darkness','Darkness','Colorless'],'200')]});
  const view=observation(seat,{active:lele,bench:[one,two],opponentActive:targetSlot});
  const cure={kind:'attack',token:'cure',attackName:'Tapu Cure-GX'};
  assert.deepEqual(decide(profile,root(seat,view,[cure])),sel('cure'));
  const prompt={actingSeat:seat,promptType:'ChoosePokemonPrompt',
    source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:L,effectName:'Tapu Cure-GX'},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:2,allowCancel:false},
    choices:[{token:'active',kind:'pokemon',printing:L,publicMetadata:{ownerSeat:'actor',targetZone:'active',isOwnerVisible:true}},
      {token:'one',kind:'pokemon',printing:M,publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:0,isOwnerVisible:true}},
      {token:'two',kind:'pokemon',printing:M,publicMetadata:{ownerSeat:'actor',targetZone:'bench',benchIndex:1,isOwnerVisible:true}}]};
  assert.deepEqual(decide(profile,{role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'ChoosePokemonPrompt'},prompt,publicEventReceipt:null}),mult('one','two'));
  view.ownPublic.bench[1].damage=0;
  assert.deepEqual(decide(profile,root(seat,view,[cure])),sel('pass'));
});

function energyPaymentPrompt(seat,view,energyType,count=3){
 const choices=Array.from({length:count},(_,i)=>({token:'energy-'+i,kind:'energy',printing:P,label:P,publicMetadata:{selectionIndex:i,selectedCount:1,sourceZone:'active',ownerSeat:'actor',isOwnerVisible:true,energyType:'Psychic'}}));
 return {role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'ChooseEnergyPrompt'},prompt:{actingSeat:seat,promptType:'ChooseEnergyPrompt',description:null,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:V,effectName:'Retreat'},choices,publicMetadata:{count,energyCount:count,energyType,allowCancel:false,selectionType:'energy-payment'}},publicEventReceipt:null};
}
paired('Energy payment selects the cost count, not every offered Energy card',(seat,profile)=>{
 const view=observation(seat,{active:v([P,P,P]),opponentActive:defender()});
 assert.deepEqual(decide(profile,energyPaymentPrompt(seat,view,'Colorless',3)),mult('energy-0'));
 assert.deepEqual(decide(profile,energyPaymentPrompt(seat,view,'Psychic,Colorless',3)),mult('energy-0','energy-1'));
 assert.deepEqual(decide(profile,energyPaymentPrompt(seat,view,'Fire',3)),{kind:'abstain',reasonCode:'NO_SUPPORTED_ENERGY_PAYMENT'});
 const insufficient=energyPaymentPrompt(seat,view,'Psychic,Colorless',3);
 insufficient.prompt.publicMetadata.energyCount=1;
 assert.deepEqual(decide(profile,insufficient),{kind:'abstain',reasonCode:'NO_VISIBLE_ENERGY_CHOICE'});
 const nonBasic=energyPaymentPrompt(seat,view,'Colorless',3);
 nonBasic.prompt.choices[0].printing='Double Colorless Energy';
 nonBasic.prompt.choices[0].publicMetadata.energyType='Colorless';
 assert.deepEqual(decide(profile,nonBasic),{kind:'abstain',reasonCode:'NO_SUPPORTED_ENERGY_PAYMENT'});
});
test('projected Stadium replaces the shared Stadium on both sides without mutating the source view',()=>{
 const view=observation(0,{active:v(),opponentStadium:['Dimension Valley PHF']});
 const projected=worker.__test.projectedStadium(view,'Temple of Sinnoh ASR');
 assert.deepEqual(projected.ownPublic.stadium,['Temple of Sinnoh ASR']);
 assert.deepEqual(projected.opponentPublic.stadium,[]);
 assert.deepEqual(view.opponentPublic.stadium,['Dimension Valley PHF']);
});

function raihanAttachmentPrompt(seat,view) {
  const choices=[
    {token:'raihan-active',kind:'energy',printing:P,label:P,publicMetadata:{
      sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,energyType:'BASIC',
      zone:'active',choiceIndex:0,selectedCount:1
    }},
    {token:'raihan-bench',kind:'energy',printing:P,label:P,publicMetadata:{
      sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true,energyType:'BASIC',
      zone:'bench',benchIndex:0,choiceIndex:1,selectedCount:1
    }}
  ];
  return {role:'candidate',seat,
    observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'AttachEnergyPrompt'},
    prompt:{actingSeat:seat,promptType:'AttachEnergyPrompt',description:'ATTACH_ENERGY_CARDS',
      source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:'Raihan EVS',effectName:'Raihan'},
      choices,publicMetadata:{selectionType:'energy-attachment',count:2,minimumCount:1,
        maximumCount:1,allowCancel:false,sourceZone:'discard',ownerSeat:'actor',
        isOwnerVisible:true,energyType:'BASIC'}},
    publicEventReceipt:null};
}
paired('Raihan attachment policy chooses one legal occupied own target from Basic Psychic Energy choices',(seat,profile)=>{
  const view=observation(seat,{active:v([P,P]),bench:[v([P])],opponentActive:defender()});
  const result=decide(profile,raihanAttachmentPrompt(seat,view));
  assert.ok(result.kind==='select-choice'&&['raihan-active','raihan-bench'].includes(result.token));
});

// Append to existing agent46-two-profile-root.test.cjs; helper names are defined there.

paired('Agent31: ordinary paid Gate tutor preserves Forest Seal Stone',(seat,profile)=>{
  const MT='Mysterious Treasure FLI',Q='Quick Ball SSH',H='Stealthy Hood UNB',AR='Arven SVI';
  const view=observation(seat,{active:v([P]),bench:[v()],opponentActive:pokemon({printing:'Budew PRE',name:'Budew',types:['Grass']}),ownHand:[P,H]});
  view.ownTurnResources.supporterPlayedTurn=1;view.ownTurnResources.energyPlayedTurn=true;
  const prompt=v0=>decide(profile,cardPrompt(seat,v0,AR,'Arven','deck',[MT,Q,FSS],0,2));
  assert.deepEqual(prompt(view),mult('card-0','card-2'));
  const locked=lockItems(JSON.parse(JSON.stringify(view)));
  assert.deepEqual(prompt(locked),mult('card-2'));
  const empty={...view,ownHand:[],ownPublic:{...view.ownPublic,handCount:0}};
  assert.deepEqual(prompt(empty),mult('card-2'));
  const held={...view,ownHand:[MT,P,FSS],ownPublic:{...view.ownPublic,handCount:3}};
  assert.deepEqual(decide(profile,root(seat,held,[play('mt',MT),play('stone',FSS,V,target('active',0))])),sel('mt'));
});
paired('Agent31: held Gate supplies VMAX before spending Star Alchemy',(seat,profile)=>{
  const opp=pokemon({printing:'Budew PRE',name:'Budew',types:['Grass']});
  const H='Stealthy Hood UNB';
  const stone={token:'alchemy',kind:'use-ability',actorPrinting:V,publicMetadata:{sourceSeat:'actor',sourceZone:'active',sourceIndex:0,abilityName:'Star Alchemy'}};
  const view=observation(seat,{active:{...v([P]),tools:[FSS]},bench:[v()],opponentActive:opp,ownHand:[R,H],ownDiscard:[M,M],globalTurn:2});
  view.ownTurnResources.energyPlayedTurn=true;
  assert.deepEqual(decide(profile,root(seat,view,[stone,play('gate',R)])),sel('gate'));
  view.ownPublic.bench=[v(),v(),v(),v(),null];
  assert.deepEqual(decide(profile,root(seat,view,[stone,play('gate',R)])),sel('alchemy'));
});
paired('Agent31: Stone survives Pokemon Ability lock but not Tool lock',(seat,profile)=>{
  for(const [stadium,want] of [['Path to the Peak CES','stone'],['Silent Lab PRC','stone'],['Jamming Tower TWM','pass']]){
    const view=observation(seat,{active:v(),bench:[v()],opponentActive:defender(),ownHand:[FSS],opponentStadium:[stadium]});
    assert.deepEqual(decide(profile,root(seat,view,[play('stone',FSS,V,target('active',0))])),sel(want));
    view.ownPublic.active.tools=[FSS];view.ownHand=[];view.ownPublic.handCount=0;
    const alchemy={token:'stone',kind:'use-ability',actorPrinting:V,publicMetadata:{sourceSeat:'actor',sourceZone:'active',sourceIndex:0,abilityName:'Star Alchemy'}};
    assert.deepEqual(decide(profile,root(seat,view,[alchemy])),sel(want));
  }
});
paired('Agent31: public direct win outranks Get Lost hazard denial',(seat,profile)=>{
  const active=pokemon({printing:'Girafarig LOT',name:'Girafarig',hp:90,energies:[P,P,P],attacks:[attack('Get Lost',['Colorless'],0),attack('Mind Shock',['Colorless','Colorless','Colorless'],70)]});
  const opp=defender({damage:210,abilities:['Legacy Star'],energies:['Double Dragon Energy ROS','Grass Energy SVE']});
  const view=observation(seat,{active,bench:[{...vmax(),hp:320,damage:220},{...vmax(),hp:320,damage:220}],opponentActive:opp,opponentBench:[pokemon({printing:'Regidrago V SIT',name:'Regidrago V',types:['Dragon'],subtypes:['Basic','V']})]});
  view.ownPublic.prizeCount=2;view.opponentPublic.prizeCount=5;view.opponentPublic.discard=['Kyurem SFA','VS Seeker PHF'];
  const actions=[{kind:'attack',token:'lost',attackName:'Get Lost'},{kind:'attack',token:'mind',attackName:'Mind Shock'}];
  const p=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const rule=()=>p.decideWithAudit(root(seat,view,actions)).policyAudit.selectionRuleCode;
  assert.deepEqual(decide(profile,root(seat,view,actions)),sel('mind'));
  assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  view.ownPublic.prizeCount=3;view.opponentPublic.bench=[null,null,null,null,null];
  assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  opp.damage=200;
  assert.ok(rule()!=='ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
});

test('Hood Ranger spends its Supporter only for a productive unlocked Item (Agent2)',()=>{
  const arven='Arven SVI';
  for(const seat of [0,1])for(const [items,discard,expected] of [
    [[VS],[],'arven'],[['Battle Compressor PHF'],[],'arven'],[[NS],[],'arven'],
    [[FOG],[],'ranger'],[[NS],[P],'ranger'],[['Quick Ball FST',P],[],'ranger']
  ]){
    const view=lockItems(observation(seat,{active:v(),ownHand:[RANGER,arven,...items],ownDiscard:discard,opponentActive:defender()}));
    const actions=[play('ranger',RANGER),play('arven',arven),...items.filter(p=>p!==P).map((p,i)=>play('item-'+i,p))];
    assert.deepEqual(decide(profiles[0],root(seat,view,actions)),sel(expected));
  }
});
test('Hood VS Seeker reserves spent Ranger only for a plausible second Budew turn (Agent2)',()=>{
  const budew=()=>pokemon({printing:'Budew PRE',name:'Budew',hp:30,types:['Grass']});
  const lillie="Lillie's Determination MEG";
  for(const seat of [0,1])for(const [active,opp,bench,hand,locked,expected] of [
    [v(),budew(),[],[VS],false,'seeker'],
    [v(),budew(),[],[VS],true,'pass'],
    [v(),defender(),[],[VS],false,'pass'],
    [v(),budew(),[],[VS,RANGER],false,'pass'],
    [vmax([P,P,P]),budew(),[],[VS],false,'pass'],
    [vmax([P,P,P]),budew(),[budew()],[VS],false,'seeker']
  ]){
    const view=observation(seat,{active,opponentActive:opp,opponentBench:bench,ownHand:hand,ownDiscard:[lillie,RANGER]});
    view.ownTurnResources.supporterPlayedTurn=1;if(locked)lockItems(view);
    assert.deepEqual(decide(profiles[0],root(seat,view,[play('seeker',VS)])),sel(expected));
    if(expected==='seeker')assert.deepEqual(decide(profiles[0],cardPrompt(seat,view,VS,'VS Seeker','discard',[lillie,RANGER])),mult('card-1'));
  }
});
