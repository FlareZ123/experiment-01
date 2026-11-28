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
  for(const previousTurn of [-1,0,2]){
    view.ownTurnResources.energyPlayedTurn=previousTurn;
    assert.deepEqual(decide(profile,root(seat,view,[play('rider-energy',P,V,target('bench',0))])),sel('rider-energy'));
  }
  view.ownTurnResources.energyPlayedTurn=view.globalTurn;
  assert.deepEqual(decide(profile,root(seat,view,[play('rider-energy',P,V,target('bench',0))])),sel('pass'));
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
  assert.equal(rule(),'ROOT_PUBLIC_FINAL_BOARD_EMPTY_ATTACK');
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

// Append to existing Agent46 root test (same helper scope).
paired('Agent31 public control Get Lost denial',(seat,profile)=>{
 const gir=pokemon({printing:'Girafarig LOT',name:'Girafarig',hp:90,energies:[P],attacks:[attack('Get Lost',['Colorless'],'0')]});
 const raichu=pokemon({printing:'Alolan Raichu UNM',name:'Alolan Raichu',hp:110,types:['Lightning'],energies:['Reversal Energy PAL'],attacks:[attack('Electro Rain',['Lightning'],'0')]});
 const thorns=pokemon({printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',hp:230,types:['Lightning'],energies:[]});
 const get={kind:'attack',token:'get',attackName:'Get Lost'};
 function prompt(view,expected){
  const req=cardPrompt(seat,view,'Girafarig LOT','Get Lost','discard',view.opponentPublic.discard,2,2);
  req.prompt.publicMetadata.ownerSeat='opponent';
  for(const c of req.prompt.choices)c.publicMetadata.ownerSeat='opponent';
  const got=decide(profile,req);
  assert.deepEqual([...got.tokens].sort(),expected.sort());
 }
 const r=observation(seat,{active:gir,opponentActive:raichu,ownStadium:[TEMPLE]});
 r.opponentPublic.discard=['Marshadow UNB','Rescue Carrier EVS','Secret Box TWM'];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('get'));
 prompt(r,['card-0','card-2']);
 r.ownPublic.stadium=[];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('pass'));
 const t=observation(seat,{active:gir,opponentActive:thorns,ownStadium:[TEMPLE]});
 t.opponentPublic.discard=['Lusamine CIN','Lusamine CIN','Cynthia & Caitlin CEC','Faba LOT',"Team Rocket's Handiwork FCO"];
 assert.deepEqual(decide(profile,root(seat,t,[get])),sel('get'));
 prompt(t,['card-3','card-4']);
 t.opponentPublic.discard=['Lusamine CIN','Lusamine CIN','Cynthia & Caitlin CEC','Secret Box TWM'];
 assert.deepEqual(decide(profile,root(seat,t,[get])),sel('get'));
 prompt(t,['card-0','card-1']);
 t.opponentPublic.discard=['Lusamine CIN','Cynthia & Caitlin CEC','Secret Box TWM'];
 assert.deepEqual(decide(profile,root(seat,t,[get])),sel('get'));
 prompt(t,['card-0','card-1']);
 t.opponentPublic.discard=['Lusamine CIN','Secret Box TWM'];
 assert.deepEqual(decide(profile,root(seat,t,[get])),sel('pass'));
 t.opponentPublic.active=defender();
 t.opponentPublic.discard=['Lusamine CIN','Lusamine CIN','Cynthia & Caitlin CEC'];
 assert.deepEqual(decide(profile,root(seat,t,[get])),sel('pass'));
});

paired('Agent31: executable public control Girafarig access',(seat,profile)=>{
const gir='Girafarig LOT';const thorns=pokemon({printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',hp:230,types:['Lightning']});
const active=v([P]);active.printed.retreatCost=['Colorless'];
const view=observation(seat,{active,opponentActive:thorns,ownHand:[gir,P]});
view.opponentPublic.discard=['Lusamine CIN','Lusamine CIN','Cynthia & Caitlin CEC'];
const bench=play('gir',gir,null,target('bench',0));
assert.deepEqual(decide(profile,root(seat,view,[bench])),sel('gir'));
view.ownHand=[FOG,P];
assert.deepEqual(decide(profile,root(seat,view,[play('fog',FOG)])),sel('fog'));
assert.deepEqual(decide(profile,cardPrompt(seat,view,FOG,'Fog Crystal','deck',[gir,P],0,1)),mult('card-0'));
view.ownTurnResources.energyPlayedTurn=true;
view.ownHand=[gir,P];
assert.deepEqual(decide(profile,root(seat,view,[bench])),sel('pass'));
view.ownTurnResources.energyPlayedTurn=false;
view.ownTurnResources.retreatedTurn=view.globalTurn;
assert.deepEqual(decide(profile,root(seat,view,[bench])),sel('pass'));
view.ownTurnResources.retreatedTurn=0;
active.publicRestrictions.cannotRetreat=true;
assert.deepEqual(decide(profile,root(seat,view,[bench])),sel('pass'));
active.publicRestrictions.cannotRetreat=false;view.opponentPublic.discard=['Lusamine CIN','Secret Box TWM'];
assert.deepEqual(decide(profile,root(seat,view,[bench])),sel('pass'));
});

paired('Agent31: public Rain denial unit priority',(seat,profile)=>{
 const gir=pokemon({printing:'Girafarig LOT',name:'Girafarig',hp:90,energies:[P],attacks:[attack('Get Lost',['Colorless'],'0')]});
 const raichu=pokemon({printing:'Alolan Raichu UNM',name:'Alolan Raichu',hp:110,types:['Lightning'],energies:['Unit Energy LPM UPR'],attacks:[attack('Electro Rain',['Lightning'],'0')]});
 const elec=pokemon({printing:'Electrode-GX CES',name:'Electrode-GX',hp:190,types:['Lightning'],subtypes:['Stage 1','GX'],abilities:['Extra Energy Bomb']});
 const get={kind:'attack',token:'get',attackName:'Get Lost'};
 const view=observation(seat,{active:gir,opponentActive:raichu,opponentBench:[elec]});
 view.opponentPublic.discard=['Unit Energy LPM UPR','Counter Energy CIN','Reversal Energy PAL','Unit Energy LPM UPR','Reversal Energy PAL','Counter Energy CIN'];
 function prompt(want){
  const req=cardPrompt(seat,view,'Girafarig LOT','Get Lost','discard',view.opponentPublic.discard,2,2);
  req.prompt.publicMetadata.ownerSeat='opponent';for(const c of req.prompt.choices)c.publicMetadata.ownerSeat='opponent';
  const got=decide(profile,req);assert.deepEqual([...(got.tokens??[])].sort(),want.sort());
 }
 assert.deepEqual(decide(profile,root(seat,view,[get])),sel('get'));
 prompt(['card-2','card-4']);
 view.opponentPublic.bench=[];view.opponentPublic.prizeCount=6;view.ownPublic.prizeCount=5;
 prompt(['card-2','card-4']);
 view.opponentPublic.prizeCount=3;view.ownPublic.prizeCount=6;
 prompt(['card-0','card-3']);
 view.opponentPublic.prizeCount=6;view.ownPublic.prizeCount=5;
 view.ownPublic.stadium=[TEMPLE];view.opponentPublic.discard=['Reversal Energy PAL','Reversal Energy PAL','Marshadow UNB','Secret Box TWM'];
 prompt(['card-2','card-3']);
 view.opponentPublic.active=defender();view.ownPublic.stadium=[];view.opponentPublic.discard=['Reversal Energy PAL','Reversal Energy PAL','Counter Energy CIN'];
 assert.deepEqual(decide(profile,root(seat,view,[get])),sel('pass'));
});


paired('Agent31: complete public control denial pivot',(seat,profile)=>{
 const active=v([P]);active.printed.retreatCost=['Colorless'];
 const gir=pokemon({printing:'Girafarig LOT',name:'Girafarig',hp:90,attacks:[attack('Get Lost',['Colorless'],'0')]});
 const thorns=pokemon({printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',hp:230,types:['Lightning']});
 const view=observation(seat,{active,bench:[gir],opponentActive:thorns,ownHand:[P]});
 view.opponentPublic.discard=['Lusamine CIN','Lusamine CIN','Cynthia & Caitlin CEC'];
 const ret={kind:'retreat',token:'ret',targetPrinting:gir.printing,publicMetadata:{benchIndex:0}};
 const aa=play('attach-active',P,V,target('active',0)),ag=play('attach-gir',P,gir.printing,target('bench',0));
 const mist={kind:'attack',token:'mist',attackName:'Shadow Mist'};
 assert.deepEqual(decide(profile,root(seat,view,[aa,ag,ret,mist])),sel('attach-gir'));
 assert.deepEqual(decide(profile,root(seat,view,[aa,ag,mist])),sel('attach-active'));
 view.ownTurnResources.retreatedTurn=3;
 assert.deepEqual(decide(profile,root(seat,view,[aa,ag,ret,mist])),sel('attach-active'));
 view.ownTurnResources.retreatedTurn=0;
 view.opponentPublic.discard=['Lusamine CIN','Secret Box TWM'];
 assert.deepEqual(decide(profile,root(seat,view,[aa,ag,ret,mist])),sel('attach-active'));
 view.opponentPublic.discard=['Lusamine CIN','Lusamine CIN','Cynthia & Caitlin CEC'];
 active.publicRestrictions.cannotRetreat=true;
 assert.deepEqual(decide(profile,root(seat,view,[aa,ag,ret,mist])),sel('attach-active'));
 active.publicRestrictions.cannotRetreat=false;gir.energies=[P];
 assert.deepEqual(decide(profile,root(seat,view,[aa,ag,ret,mist])),sel('attach-active'));
 view.ownTurnResources.energyPlayedTurn=true;view.ownHand=[];
 assert.deepEqual(decide(profile,root(seat,view,[ret,mist])),sel('ret'));
 view.ownPublic.active=gir;view.ownPublic.bench[0]=active;active.energies=[];
 view.ownTurnResources.retreatedTurn=3;
 assert.deepEqual(decide(profile,root(seat,view,[{kind:'attack',token:'get',attackName:'Get Lost'}])),sel('get'));
 const req=cardPrompt(seat,view,'Girafarig LOT','Get Lost','discard',view.opponentPublic.discard,2,2);
 req.prompt.publicMetadata.ownerSeat='opponent';for(const c of req.prompt.choices)c.publicMetadata.ownerSeat='opponent';
 assert.deepEqual([...decide(profile,req).tokens].sort(),['card-0','card-1']);
});


paired('Agent31: public Moltres and Vileplume resource cuts',(seat,profile)=>{
 const gir=pokemon({printing:'Girafarig LOT',name:'Girafarig',hp:90,energies:[P],attacks:[attack('Get Lost',['Colorless'],'0')]});
 const moltres=pokemon({printing:'Galarian Moltres V CRE',name:'Galarian Moltres V',hp:220,types:['Darkness'],subtypes:['Basic','V']});
 const pidgey=pokemon({printing:'Pidgey FLF',name:'Pidgey',hp:60,types:['Colorless']});
 const r=observation(seat,{active:gir,bench:[v()],opponentActive:moltres});
 const get={kind:'attack',token:'get',attackName:'Get Lost'};
 const D='Darkness Energy MEE';
 function prompt(want){
  const req=cardPrompt(seat,r,'Girafarig LOT','Get Lost','discard',r.opponentPublic.discard,2,2);
  req.prompt.publicMetadata.ownerSeat='opponent';for(const c of req.prompt.choices)c.publicMetadata.ownerSeat='opponent';
  assert.deepEqual([...decide(profile,req).tokens].sort(),want.sort());
 }
 r.opponentPublic.discard=['VS Seeker PHF',D,'Double Dragon Energy ROS',D];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('get'));
 prompt(['card-1','card-3']);
 moltres.energies=[D,D];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('pass'));
 moltres.energies=[];
 r.opponentPublic.discard=[D,'Double Dragon Energy ROS','VS Seeker PHF'];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('pass'));
 r.opponentPublic.discard=[D,D];r.ownPublic.bench=[];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('pass'));
 r.opponentPublic.active=pidgey;r.ownPublic.bench=[v()];
 r.opponentPublic.discard=['Oddish UNB','Karen XYP','Oddish UNB','Gloom UNB'];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('get'));
 prompt(['card-0','card-2']);
 r.opponentPublic.discard=['Gloom UNB','Karen XYP','Gloom UNB','Oddish UNB'];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('get'));
 prompt(['card-0','card-2']);
 r.opponentPublic.bench=[pokemon({printing:'Vileplume AOR',name:'Vileplume',hp:130,types:['Grass']})];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('pass'));
 r.opponentPublic.bench=[];r.opponentPublic.discard=['Oddish UNB','Gloom UNB','Karen XYP'];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('pass'));
 r.opponentPublic.active=defender();r.opponentPublic.discard=['Oddish UNB','Oddish UNB'];
 assert.deepEqual(decide(profile,root(seat,r,[get])),sel('pass'));
});

// Append to the existing Agent46 root test.
paired('Agent31: preserve funded solo Night Watch against observed Snorlax',(seat,profile)=>{
const td=pokemon({printing:'Trevenant & Dusknoir-GX SMP',name:'Trevenant & Dusknoir-GX',hp:270,subtypes:['Basic','TAG TEAM','GX'],energies:[P,P,P,P,P],attacks:[attack('Night Watch',['Psychic','Psychic','Colorless'],'150')]});
const snor=pokemon({printing:'Snorlax PGO 55',name:'Snorlax',hp:150,types:['Colorless'],abilities:['Block']});
const lat='Latias ex SSP';
const view=observation(seat,{active:td,opponentActive:snor,ownHand:[V,lat,L,R,P]});
view.ownPublic.prizeCount=3;
view.opponentPublic.discard=['Target Whistle PHF','Captivating Poké Puff STS'];
const bench=[play('v',V,null,target('bench',0)),play('latias',lat,null,target('bench',0)),play('lele',L,null,target('bench',0)),play('gate',R,null,target('bench',0))];
const charge=play('charge',P,td.printing,target('active',0)),night={kind:'attack',token:'night',attackName:'Night Watch'};
assert.deepEqual(decide(profile,root(seat,view,[...bench,charge,night])),sel('charge'));
view.ownTurnResources.energyPlayedTurn=true;view.ownPublic.publicTurnRestrictions.energyPlayedTurn=true;
assert.deepEqual(decide(profile,root(seat,view,[...bench,night])),sel('night'));
view.opponentPublic.discard=['Target Whistle PHF'];
assert.deepEqual(decide(profile,root(seat,view,[...bench,night])),sel('v'));
view.opponentPublic.discard=['Target Whistle PHF','Captivating Poké Puff STS'];td.energies=[P,P];
assert.deepEqual(decide(profile,root(seat,view,[...bench])),sel('v'));
td.energies=[P,P,P,P,P];view.opponentPublic.active=defender();
assert.deepEqual(decide(profile,root(seat,view,[...bench])),sel('v'));
});

test('Hood Ranger does not spend its Supporter against a continuous Item lock',()=>{
  const arven='Arven SVI';
  for(const seat of [0,1]){
    const lock=(printing,name,ability,suppression=false)=>pokemon({printing,name,hp:130,abilities:[ability],suppression});
    const plume=lock('Vileplume AOR','Vileplume','Irritating Pollen');
    const jelli=lock('Jellicent ex WHT','Jellicent ex','Oceanic Curse');
    const trev=lock('Trevenant XY','Trevenant',"Forest's Curse");
    const oma=lock('Omastar TEU','Omastar','Fossil Bind');
    const cases=[
      [defender(),[plume],[], 'arven'],
      [defender(),[lock('Vileplume AOR','Vileplume','Irritating Pollen',true)],[], 'ranger'],
      [jelli,[],[], 'arven'],
      [trev,[],[], 'arven'],
      [defender(),[trev],[], 'ranger'],
      [oma,[],[v()], 'arven'],
      [oma,[],[], 'ranger']
    ];
    for(const [opponentActive,opponentBench,bench,expected] of cases){
      const view=lockItems(observation(seat,{active:v(),bench,opponentActive,opponentBench,ownHand:[RANGER,arven,FOG]}));
      assert.deepEqual(decide(profiles[0],root(seat,view,[play('ranger',RANGER),play('arven',arven)])),sel(expected));
    }
  }
});


paired('Acerola responds to publicly funded Rondo and typed weakness exposure, not nominal Energy count',(seat,profile)=>{
  const ace='Acerola BUS', dark='Darkness Energy SVE', clefairy="Lillie's Clefairy ex JTG";
  const victim=vmax([P]);victim.hp=320;victim.damage=180;
  const active=vmax([P,P,P]);active.hp=320;
  const threat=pokemon({printing:clefairy,name:"Lillie's Clefairy ex",hp:190,subtypes:['Basic','ex'],
    energies:[P,P],attacks:[attack('Full Moon Rondo',['Psychic','Colorless'],'20+')]});
  const filler=()=>pokemon({printing:'Unown AOR',name:'Unown',hp:60});
  const view=observation(seat,{active,bench:[victim],opponentActive:threat,
    opponentBench:Array.from({length:5},filler),ownHand:[ace]});
  const items=[play('acerola',ace),{kind:'attack',token:'hit',attackName:'Max Geist'}];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('acerola')); // 140 against 140 HP
  view.opponentPublic.bench[4]=null;
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('hit')); // 120, no rescue
  view.opponentPublic.bench[4]=filler();
  threat.energies=[dark,dark];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('hit')); // wrong colored cost
  threat.energies=[P];view.ownPublic.stadium=['Dimension Valley PHF'];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('acerola')); // reduced cost
  view.ownPublic.stadium=[];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('hit'));
  threat.energies=[P,'Double Turbo Energy BRS'];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('hit')); // 20 less damage
  view.ownPublic.stadium=[TEMPLE];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('acerola')); // Temple blanks penalty, still paid
  view.ownPublic.stadium=[];
  view.opponentPublic.active=pokemon({printing:'Galarian Moltres V CRE',name:'Galarian Moltres V',hp:220,
    subtypes:['Basic','V'],types:['Darkness'],energies:[dark,dark,dark],
    attacks:[attack('Aura Burn',['Darkness','Darkness','Colorless'],'190')]});
  victim.damage=20;victim.printed.weakness=[{type:'Darkness',value:'×2'}];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('acerola')); // 380 against 300 HP
  victim.printed.weakness=[];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('hit'));
  victim.damage=180;view.opponentPublic.active=vmax([P,P,P]);
  view.opponentPublic.bench=[vmax([P,P]),null,null,null,null];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('acerola')); // 160 against 140 HP
  view.opponentPublic.bench[0].energies=[dark,dark];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('hit')); // only 3 Psychic, 100 damage
});


paired('Direct terminal Max Geist precedes further setup despite nondefensive opposing abilities',(seat,profile)=>{
  const active=vmax([P,P,P,P,P,P]);active.hp=320;
  const clefairy=pokemon({printing:"Lillie's Clefairy ex JTG",name:"Lillie's Clefairy ex",hp:190,
    subtypes:['Basic','ex'],abilities:['Fairy Zone'],suppression:false,
    energies:[P,P],attacks:[attack('Full Moon Rondo',['Psychic','Colorless'],'20+')]});
  const unown=pokemon({printing:'Unown AOR',name:'Unown',hp:60,
    abilities:['Farewell Letter'],suppression:false});
  const lele=pokemon({printing:L,name:'Tapu Lele-GX',subtypes:['Basic','GX'],
    abilities:['Wonder Tag'],suppression:false});
  const view=observation(seat,{active,bench:[v()],opponentActive:clefairy,
    opponentBench:[unown,latias(),lele,vmax([]),radiant()],ownHand:[P]});
  view.ownPublic.prizeCount=2;
  const items=[play('attach',P,M,target('active',0)),{kind:'attack',token:'win',attackName:'Max Geist'}];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('win'));
  // The public terminal certificate cannot cover a missing KO.
  clefairy.hp=200;
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('attach'));
  clefairy.hp=190;view.ownPublic.prizeCount=3;
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('attach'));
  view.ownPublic.prizeCount=2;
  // A different, unadmitted Ability must not be relabelled harmless.
  view.opponentPublic.bench[0]=pokemon({printing:'Mimikyu PAL',name:'Mimikyu',hp:70,
    abilities:['Safeguard'],suppression:false});
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('attach'));
});


paired('Mandatory KO promotion selects funded counterattacker and rejects wrong prompt shape',(seat,profile)=>{
  const funded=vmax([P,P,P,P,P,P]);funded.hp=320;
  const bait=v();bait.hp=210;
  const view=observation(seat,{bench:[bait,funded],opponentActive:defender({hp:190}),decisionKind:'owner-prompt',promptType:'ChoosePokemonPrompt'});
  view.phase=3;view.ownPublic.prizeCount=2;
  const req={role:'candidate',seat,observation:view,publicEventReceipt:null,
    prompt:{actingSeat:seat,promptType:'ChoosePokemonPrompt',description:'CHOOSE_NEW_ACTIVE_POKEMON',
      source:{classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,effectName:'CHOOSE_NEW_ACTIVE_POKEMON'},
      choices:[bait,funded].map((p,i)=>({token:'bench-'+i,kind:'pokemon',printing:p.printing,label:'Your bench '+(i+1),
        publicMetadata:{selectionIndex:i,selectedCount:1,selectionType:'pokemon',ownerSeat:'actor',targetZone:'bench',benchIndex:i,isOwnerVisible:true}})),
      publicMetadata:{minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false,selectionType:'pokemon',targetZone:'bench'}}};
  assert.deepEqual(decide(profile,req),mult('bench-1'));
  // An engine promotion has no Active to replace. Do not mistake a switching
  // or arbitrary target prompt for mandatory replacement.
  view.ownPublic.active=bait;
  assert.equal(decide(profile,req).kind,'abstain');
  view.ownPublic.active=null;
  req.prompt.choices[1].publicMetadata.ownerSeat='opponent';
  assert.equal(decide(profile,req).kind,'abstain');
  req.prompt.choices[1].publicMetadata.ownerSeat='actor';
  req.prompt.publicMetadata.allowCancel=true;
  assert.equal(decide(profile,req).kind,'abstain');
  req.prompt.publicMetadata.allowCancel=false;
  req.prompt.choices=[req.prompt.choices[0]];
  assert.deepEqual(decide(profile,req),mult('bench-0'));
});

test('Candidate-only native promotion projection admits strict owner Bench choices in both physical seats',()=>{
  const {projectPrompt}=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
  const native={GamePhase:{ATTACK:3},PlayerType:{BOTTOM_PLAYER:0,TOP_PLAYER:1},SlotType:{ACTIVE:0,BENCH:1}};
  const slot=(printing)=>({cards:printing?[{fullName:printing}]:[],getPokemonCard(){return this.cards[0]??null}});
  class ChoosePokemonPrompt{
    getPerspectivePlayerId(){return this.playerId;}
  }
  for(const seat of [0,1]){
    const players=[0,1].map(i=>({id:i,active:slot(i===seat?null:V),bench:i===seat?[slot(V),slot(M),slot(null)]:[slot(D)]}));
    const state={players,phase:3};
    const prompt=Object.assign(new ChoosePokemonPrompt(),{playerId:seat,message:'CHOOSE_NEW_ACTIVE_POKEMON',playerType:0,slots:[1],
      options:{min:1,max:1,allowCancel:false,blocked:[]}});
    const args={prompt,state,actorSeat:seat,native,candidateKnockoutContinuation:true};
    const result=projectPrompt(args);
    assert.equal(result.promptProjection.source.sourceKind,'engine');
    assert.deepEqual(result.promptProjection.choices.map(c=>c.printing),[V,M]);
    assert.ok(result.promptProjection.choices.every(c=>c.publicMetadata.ownerSeat==='actor'));
    assert.equal(result.choiceByToken.size,2);
    assert.throws(()=>projectPrompt({...args,candidateKnockoutContinuation:false}),/trusted/);
    players[seat].active=slot(V);
    assert.throws(()=>projectPrompt(args),/trusted/);
    players[seat].active=slot(null);
    prompt.options.allowCancel=true;
    assert.throws(()=>projectPrompt(args),/trusted/);
    prompt.options.allowCancel=false;prompt.playerType=1;
    assert.throws(()=>projectPrompt(args),/trusted/);
    prompt.playerType=0;state.phase=2;
    assert.throws(()=>projectPrompt(args),/trusted/);
  }
});


paired('Mandatory owner-hand Prize selection uses occupied indices and no hidden identities',(seat,profile)=>{
  const {projectPrompt}=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
  class ChoosePrizePrompt{getPerspectivePlayerId(){return this.playerId;}}
  const hidden=()=>({get fullName(){throw Error('Concealed Prize face read');}});
  const players=[0,1].map(i=>({id:i,hand:{cards:[]},prizes:Array.from({length:6},(_,j)=>({cards:j===1?[]:[hidden()]}))}));
  const state={players,phase:3};
  const prompt=Object.assign(new ChoosePrizePrompt(),{playerId:seat,message:'CHOOSE_PRIZE_CARD',
    options:{count:2,allowCancel:false,useOpponentPrizes:false,blocked:[],destination:players[seat].hand}});
  const args={prompt,state,actorSeat:seat,native:{GamePhase:{ATTACK:3}},candidateKnockoutContinuation:true};
  const projection=projectPrompt(args);
  const binding=projection.promptProjection;
  assert.equal(binding.source.sourceKind,'engine');
  assert.equal(binding.choices.length,5);
  assert.ok(binding.choices.every(c=>c.printing===undefined&&c.publicMetadata.isOwnerVisible===false));
  const view=observation(seat,{active:v(),opponentActive:defender(),decisionKind:'owner-prompt',promptType:'ChoosePrizePrompt'});view.phase=3;
  const req={role:'candidate',seat,observation:view,prompt:binding,publicEventReceipt:null};
  assert.deepEqual(decide(profile,req),mult(binding.choices[0].token,binding.choices[1].token));
  assert.deepEqual([projection.choiceByToken.get(binding.choices[0].token),projection.choiceByToken.get(binding.choices[1].token)],[0,1]);
  // Missing destination is the demonstrated same-class/message collision
  // with reveal/swap/attach effects. Foreign destination is also rejected.
  const options=prompt.options;
  options.destination=undefined;
  assert.throws(()=>projectPrompt(args),/trusted/);
  options.destination=players[1-seat].hand;
  assert.throws(()=>projectPrompt(args),/trusted/);
  options.destination=players[seat].hand;options.useOpponentPrizes=true;
  assert.throws(()=>projectPrompt(args),/trusted/);
  options.useOpponentPrizes=false;options.blocked=[0];
  assert.throws(()=>projectPrompt(args),/trusted/);
  options.blocked=[];options.allowCancel=true;
  assert.throws(()=>projectPrompt(args),/trusted/);
  options.allowCancel=false;
  assert.throws(()=>projectPrompt({...args,candidateKnockoutContinuation:false}),/trusted/);
  // More Prizes awarded than remaining: choose all occupied slots.
  options.count=6;
  const rest=projectPrompt(args).promptProjection;
  assert.equal(rest.publicMetadata.requiredCount,5);
  assert.deepEqual(decide(profile,{...req,prompt:rest}),mult(...rest.choices.map(c=>c.token)));
  // Reject foreign / duplicate worker menu even if fabricated.
  const corrupted=JSON.parse(JSON.stringify(binding));
  corrupted.choices[0].publicMetadata.ownerSeat='opponent';
  assert.equal(decide(profile,{...req,prompt:corrupted}).kind,'abstain');
  corrupted.choices[0].publicMetadata.ownerSeat='actor';
  corrupted.choices[0].publicMetadata.selectionIndex=corrupted.choices[1].publicMetadata.selectionIndex;
  assert.equal(decide(profile,{...req,prompt:corrupted}).kind,'abstain');
});


paired('Discard payment preserves live Energy, Gate, and lock answers; spent Stone becomes payment',(seat,profile)=>{
  const compressor='Battle Compressor PHF',treasure='Mysterious Treasure FLI',marshadow='Marshadow UNB';
  const view=observation(seat,{active:vmax([P,P,P,P,P]),bench:[v()],opponentActive:defender(),ownHand:[P,compressor]});
  assert.deepEqual(decide(profile,cardPrompt(seat,view,treasure,'Mysterious Treasure','hand',[P,compressor])),mult('card-1'));
  view.ownHand=[P,FSS];view.ownPublic.handCount=2;
  assert.deepEqual(decide(profile,cardPrompt(seat,view,treasure,'Mysterious Treasure','hand',[P,FSS])),mult('card-0'));
  view.ownTurnResources.vstarUsed=true;
  assert.deepEqual(decide(profile,cardPrompt(seat,view,treasure,'Mysterious Treasure','hand',[P,FSS])),mult('card-1'));
  const gateView=observation(seat,{active:v(),opponentActive:defender(),ownHand:[treasure,R]});
  const gateActions=[play('treasure',treasure),play('gate',R,null,target('bench',0))];
  assert.deepEqual(decide(profile,root(seat,gateView,gateActions)),sel('gate'));
  gateView.opponentPublic.stadium=['Silent Lab PRC'];
  assert.deepEqual(decide(profile,root(seat,gateView,gateActions)),sel('treasure'));
  const lockView=observation(seat,{active:v(),opponentActive:defender(),ownHand:[P,marshadow],
    opponentStadium:['Path to the Peak CRE']});
  assert.deepEqual(decide(profile,cardPrompt(seat,lockView,treasure,'Mysterious Treasure','hand',[P,marshadow])),mult('card-0'));
  lockView.opponentPublic.stadium=[];
  assert.deepEqual(decide(profile,cardPrompt(seat,lockView,treasure,'Mysterious Treasure','hand',[P,marshadow])),mult('card-1'));
});

paired('A live Door consumes held Energy before hand reset, but never draws through last cards speculatively',(seat,profile)=>{
  const lillie="Lillie's Determination MEG";
  const view=observation(seat,{active:vmax([P,P,P]),bench:[v()],opponentActive:defender(),ownHand:[P,lillie]});
  view.ownTurnResources.energyPlayedTurn=true;
  const door={token:'door',kind:'use-ability',actorPrinting:M,publicMetadata:{abilityName:'Underworld Door',sourceSeat:'actor',sourceZone:'active'}};
  const receipt={version:'agent8-public-event-receipt-v3-turn-stamped',ownerActive:{printing:M,knownAbilityUse:[{name:'Underworld Door',usedThisTurn:false}]}};
  const actions=[door,play('lillie',lillie)];
  assert.deepEqual(decide(profile,root(seat,view,actions,receipt)),sel('door'));
  receipt.ownerActive.knownAbilityUse[0].usedThisTurn=true;
  assert.deepEqual(decide(profile,root(seat,view,actions,receipt)),sel('lillie'));
  receipt.ownerActive.knownAbilityUse[0].usedThisTurn=false;
  view.ownPublic.deckCount=2;
  assert.deepEqual(decide(profile,root(seat,view,[door],receipt)),sel('pass'));
  view.ownPublic.deckCount=3;
  assert.deepEqual(decide(profile,root(seat,view,[door],receipt)),sel('door'));
});


paired('Guzma breaks an Active-only Ability lock only for a productive post-switch turn',(seat,profile)=>{
  const guzma='Guzma BUS';
  const thorns=()=>pokemon({printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',types:['Lightning'],
    subtypes:['Basic','ex'],abilities:['Initialization'],suppression:false});
  const active=vmax([P],true);active.abilitySuppressions[0].sourcePrinting='Iron Thorns ex TWM';
  const view=observation(seat,{active,bench:[v()],opponentActive:thorns(),opponentBench:[defender(),thorns()],ownHand:[guzma,P]});
  const receipt={version:'agent8-public-event-receipt-v3-turn-stamped',ownerActive:{printing:M,knownAbilityUse:[{name:'Underworld Door',usedThisTurn:false}]}};
  const actions=[play('guzma',guzma),play('attach',P,M,target('active',0))];
  assert.deepEqual(decide(profile,root(seat,view,actions,receipt)),sel('guzma'));
  const req={role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'ChoosePokemonPrompt'},publicEventReceipt:receipt,
    prompt:{actingSeat:seat,promptType:'ChoosePokemonPrompt',description:null,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:guzma,effectName:'Guzma'},
      choices:view.opponentPublic.bench.filter(Boolean).map((p,i)=>({token:'gust-'+i,kind:'pokemon',label:'Opponent bench '+(i+1),printing:p.printing,
        publicMetadata:{selectionIndex:i,selectedCount:1,selectionType:'pokemon',ownerSeat:'opponent',targetZone:'bench',benchIndex:i,isOwnerVisible:true}})),
      publicMetadata:{minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false,selectionType:'pokemon',targetZone:'bench'}}};
  assert.deepEqual(decide(profile,req),mult('gust-0'));
  receipt.ownerActive.knownAbilityUse[0].usedThisTurn=true;
  assert.deepEqual(decide(profile,root(seat,view,actions,receipt)),sel('attach'));
  receipt.ownerActive.knownAbilityUse[0].usedThisTurn=false;
  view.ownHand=[guzma];view.ownPublic.handCount=1;
  assert.deepEqual(decide(profile,root(seat,view,[play('guzma',guzma)],receipt)),sel('pass'));
  view.ownHand=[guzma,P];view.ownPublic.handCount=2;
  const garb=pokemon({printing:'Garbodor DRX',name:'Garbodor',subtypes:['Stage 1'],abilities:['Garbotoxin'],suppression:false,tools:['Float Stone BKT']});
  view.opponentPublic.bench[2]=garb;
  assert.deepEqual(decide(profile,root(seat,view,actions,receipt)),sel('attach'));
  view.opponentPublic.bench[2]=null;view.opponentPublic.bench[0]=null;
  assert.deepEqual(decide(profile,root(seat,view,actions,receipt)),sel('attach'));
  const gateView=observation(seat,{active:v(),bench:[v()],opponentActive:pokemon({printing:'Klefki SVI',name:'Klefki',abilities:['Mischievous Lock'],suppression:false}),opponentBench:[defender()],ownHand:[guzma,R]});
  assert.deepEqual(decide(profile,root(seat,gateView,[play('guzma',guzma),play('gate',R,null,target('bench',1))])),sel('guzma'));
  gateView.opponentPublic.stadium=['Path to the Peak CRE'];
  assert.deepEqual(decide(profile,root(seat,gateView,[play('guzma',guzma),play('gate',R,null,target('bench',1))])),sel('pass'));
});

paired('Hood recipient restores a blocked engine, not an arbitrary legal attachment',(seat,profile)=>{
  const H='Stealthy Hood UNB', thorns=pokemon({printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',hp:230,subtypes:['Basic','ex','Future'],types:['Lightning'],abilities:['Initialization'],suppression:false});
  const engine=vmax([P,P],true);
  engine.abilitySuppressions[0].sourcePrinting=thorns.printing;
  const view=observation(seat,{active:v([P]),bench:[engine,v()],opponentActive:thorns,ownHand:[H,P]});
  const items=[play('a-useless',H,V,target('active',0)),play('z-engine',H,M,target('bench',0))];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('z-engine'));
  view.opponentPublic.stadium=['Jamming Tower TWM'];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('pass'));
  view.opponentPublic.stadium=['Path to the Peak CES'];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('pass'));
});
paired('Fairy Zone replaces weakness with Psychic, and Muk suppresses both sides',(seat,profile)=>{
  const f=pokemon({printing:"Lillie's Clefairy ex JTG",name:"Lillie's Clefairy ex",hp:190,subtypes:['Basic','ex'],types:['Psychic'],abilities:['Fairy Zone'],suppression:false});
  const dragon=pokemon({printing:'Dragonite V EVS',name:'Dragonite V',hp:230,subtypes:['Basic','V'],types:['Dragon']});
  dragon.printed.weakness=[{type:'Lightning',value:'×2'}];
  const lightning=pokemon({printing:'Pikachu SVI',name:'Pikachu',types:['Lightning']});
  const view=observation(seat,{active:v([P]),bench:[f],opponentActive:dragon});
  const core=require('../../simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs').__test;
  assert.equal(core.weaknessMultiplier(view.ownPublic.active,dragon,view),2);
  assert.equal(core.weaknessMultiplier(lightning,dragon,view),1);
  dragon.tools=['Stealthy Hood UNB'];
  assert.equal(core.weaknessMultiplier(view.ownPublic.active,dragon,view),1);
  assert.equal(core.weaknessMultiplier(lightning,dragon,view),2);
  dragon.tools=[];
  const muk=pokemon({printing:'Alolan Muk SUM',name:'Alolan Muk',subtypes:['Stage 1'],abilities:['Power of Alchemy'],suppression:false});
  view.ownPublic.bench.push(muk);
  f.abilitySuppressions=[];
  assert.equal(core.fairyZoneStatusForSeat(view,'actor'),false);
  f.tools=['Stealthy Hood UNB'];
  assert.equal(core.fairyZoneStatusForSeat(view,'actor'),false);
});

paired('Final-Prize Fairy Zone placement beats Gate reservation and setup only with a real lethal attack',(seat,profile)=>{
  const clefairy="Lillie's Clefairy ex JTG";
  const active=vmax([P,P,P,P,P]);active.hp=320;
  const dragon=defender({abilities:['Legacy Star'],suppression:false});
  const view=observation(seat,{active,bench:[v(),latias(),v()],opponentActive:dragon,
    opponentBench:[v()],ownHand:[clefairy,R,P]});
  view.ownPublic.prizeCount=2;
  const items=[play('clefairy',clefairy,null,target('bench',3)),play('energy',P,M,target('active',0)),
    {token:'max',kind:'attack',attackName:'Max Geist'}];
  const get=()=>worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile}).decideWithAudit(root(seat,view,items));
  assert.deepEqual(get().decision,sel('clefairy'));
  assert.equal(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FAIRY_ZONE_BENCH');
  dragon.tools=['Stealthy Hood UNB'];
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FAIRY_ZONE_BENCH');
  dragon.tools=[];
  for(const stadium of ['Path to the Peak CRE','Silent Lab PRC']){
    view.opponentPublic.stadium=[stadium];
    assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FAIRY_ZONE_BENCH');
  }
  view.opponentPublic.stadium=[];
  view.opponentPublic.bench[1]=pokemon({printing:'Alolan Muk SUM',name:'Alolan Muk',subtypes:['Stage 1'],abilities:['Power of Alchemy'],suppression:false});
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FAIRY_ZONE_BENCH');
  view.opponentPublic.bench[1]=null;
  view.ownPublic.prizeCount=3;
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FAIRY_ZONE_BENCH');
  view.ownPublic.prizeCount=2;
  view.ownPublic.active.energies=[P,P,P];
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FAIRY_ZONE_BENCH');
  view.ownPublic.active.energies=[P,P,P,P,P];
  const noAttack=root(seat,view,items.slice(0,2));
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  assert.notEqual(policy.decideWithAudit(noAttack).policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FAIRY_ZONE_BENCH');
  view.ownTurnResources.pokemonPlayLocked=true;
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FAIRY_ZONE_BENCH');
  view.ownTurnResources.pokemonPlayLocked=false;
  view.ownPublic.bench[3]=v();view.ownPublic.bench[4]=v();
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FAIRY_ZONE_BENCH');
});

paired('Fairy Zone final-Prize retrieval spends free access first and completes the actual revealed choice',(seat,profile,i)=>{
  const c="Lillie's Clefairy ex JTG",mt='Mysterious Treasure FLI',bc='Battle Compressor PHF';
  const active=vmax([P,P,P,P,P]);active.hp=320;
  const dragon=defender({abilities:['Legacy Star'],suppression:false});
  const view=observation(seat,{active,bench:[v(),latias(),v()],opponentActive:dragon,
    opponentBench:[v()],ownHand:[FOG,mt,R,P,bc]});
  view.ownPublic.prizeCount=2;
  const max={token:'max',kind:'attack',attackName:'Max Geist'};
  const actions=[play('fog',FOG),play('treasure',mt),play('energy',P,M,target('active',0)),max];
  const get=(xs=actions)=>worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile}).decideWithAudit(root(seat,view,xs));
  assert.deepEqual(get().decision,sel('fog'));
  assert.equal(get().policyAudit.selectionRuleCode,'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR');
  assert.deepEqual(decide(profile,cardPrompt(seat,view,FOG,'Fog Crystal','deck',[V,P,c])),mult('card-2'));
  assert.deepEqual(decide(profile,cardPrompt(seat,view,mt,'Mysterious Treasure','deck',[R,c,M])),mult('card-1'));
  view.ownHand=[mt,R,bc];view.ownPublic.handCount=3;
  assert.deepEqual(get([play('treasure',mt),max]).decision,sel('treasure'));
  view.ownHand=[mt,R,FSS];view.ownPublic.handCount=3;
  assert.notEqual(get([play('treasure',mt),max]).policyAudit.selectionRuleCode,'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR');
  view.ownHand=[FOG,NS,HB,R];view.ownPublic.handCount=4;view.ownPublic.discard=[c];
  const recover=[play('fog',FOG),play('stretcher',NS),play('heavy',HB),max];
  assert.deepEqual(get(recover).decision,sel('stretcher'));
  assert.deepEqual(decide(profile,cardPrompt(seat,view,NS,'Night Stretcher','discard',[R,c,P])),mult('card-1'));
  view.ownPublic.discard=[];view.ownerK1={epoch:1,exactMembershipKnown:false,knownPrintings:null,invalidationReason:null,
    prizeFacts:{schema:'agent46-owner-fully-prized-v1',actorSeat:seat,epoch:1,turn:view.globalTurn,
      prizeCount:2,fullyPrized:[{cardName:"Lillie's Clefairy ex",printing:c,copies:i===0?2:1}]}};
  assert.deepEqual(get(recover).decision,sel('heavy'));
  assert.deepEqual(decide(profile,cardPrompt(seat,view,HB,'Hisuian Heavy Ball','prizes',[R,c],0,1)),mult('card-1'));
  assert.notEqual(get([play('fog',FOG),max]).policyAudit.selectionRuleCode,'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR');
  view.ownerK1=null;
  view.ownPublic.lostZone=Array(i===0?2:1).fill(c);
  assert.notEqual(get([play('fog',FOG),max]).policyAudit.selectionRuleCode,'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR');
  view.ownPublic.lostZone=[];
  lockItems(view);
  assert.notEqual(get(recover).policyAudit.selectionRuleCode,'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR');
  view.ownTurnResources.itemPlayLocked=false;view.ownPublic.publicTurnRestrictions.itemPlayLocked=false;
  assert.notEqual(get([play('fog',FOG)]).policyAudit.selectionRuleCode,'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR');
  dragon.tools=['Stealthy Hood UNB'];
  assert.notEqual(get(recover).policyAudit.selectionRuleCode,'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR');
  assert.notEqual(decide(profile,cardPrompt(seat,view,mt,'Mysterious Treasure','deck',[R,c,M])).tokens?.[0],'card-1');
  dragon.tools=[];
  view.ownPublic.prizeCount=3;
  assert.notEqual(get(recover).policyAudit.selectionRuleCode,'ROOT_TRY_FINAL_BY_CLEFAIRY_TUTOR');
  // Staged sequential root decisions after the retrieval menu has resolved.
  view.ownPublic.prizeCount=2;
  view.ownHand=[c,R,P];view.ownPublic.handCount=3;
  assert.deepEqual(get([play('clefairy',c,null,target('bench',3)),max]).decision,sel('clefairy'));
  view.ownHand=[R,P];view.ownPublic.handCount=2;
  view.ownPublic.bench[3]=pokemon({printing:c,name:"Lillie's Clefairy ex",hp:190,subtypes:['Basic','ex'],types:['Psychic'],abilities:['Fairy Zone'],suppression:false});
  assert.deepEqual(get([play('energy',P,M,target('active',0)),max]).decision,sel('max'));
});

paired('Final-Prize Field Blower removes the actual Active Hood before Fairy Zone; already lethal attack skips removal',(seat,profile)=>{
  const c="Lillie's Clefairy ex JTG",fb='Field Blower GRI',hood='Stealthy Hood UNB';
  const active=vmax([P,P,P,P,P]);active.hp=320;
  const dragon=defender({abilities:['Legacy Star'],suppression:false,tools:[hood]});
  const view=observation(seat,{active,bench:[v(),latias(),v()],opponentActive:dragon,
    opponentBench:[pokemon({printing:'Regidrago V SIT',name:'Regidrago V',types:['Dragon'],subtypes:['Basic','V'],tools:['Float Stone BKT']})],
    ownHand:[c,fb,R,P],ownStadium:['Dimension Valley PHF']});
  view.ownPublic.prizeCount=2;
  const max={token:'max',kind:'attack',attackName:'Max Geist'},items=[play('blower',fb),play('clefairy',c,null,target('bench',3)),play('energy',P,M,target('active',0)),max];
  const get=()=>worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile}).decideWithAudit(root(seat,view,items));
  assert.deepEqual(get().decision,sel('blower'));
  assert.equal(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FIELD_BLOWER_HOOD');
  const req={role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'SelectOptionPrompt'},
    prompt:{actingSeat:seat,promptType:'SelectOptionPrompt',description:null,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:fb,effectName:'Field Blower'},
      choices:[{token:'stadium',kind:'option',label:'Discard a Stadium and a Tool'},{token:'tools',kind:'option',label:'Discard up to 2 Tools'}],
      publicMetadata:{selectionType:'option'}},publicEventReceipt:null};
  assert.deepEqual(decide(profile,req),choice('tools'));
  const choiceReq={...req,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'ChoosePokemonPrompt'},
    prompt:{...req.prompt,promptType:'ChoosePokemonPrompt',choices:[
      {token:'active-hood',kind:'pokemon',printing:dragon.printing,label:'Active',publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,targetZone:'active',slotIndex:0,selectedCount:1}},
      {token:'bench-float',kind:'pokemon',printing:view.opponentPublic.bench[0].printing,label:'Bench',publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,targetZone:'bench',benchIndex:0,selectedCount:1}},
      {token:'empty',kind:'empty-selection',label:'Choose no items'}],
      publicMetadata:{selectionType:'pokemon',minimumCount:0,maximumCount:2,allowCancel:false,isSecret:false}}};
  assert.deepEqual(decide(profile,choiceReq),mult('active-hood','bench-float'));
  lockItems(view);
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FIELD_BLOWER_HOOD');
  view.ownTurnResources.itemPlayLocked=false;view.ownPublic.publicTurnRestrictions.itemPlayLocked=false;
  view.ownHand=[fb,R,P];view.ownPublic.handCount=3;
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FIELD_BLOWER_HOOD');
  view.ownPublic.bench[3]=pokemon({printing:c,name:"Lillie's Clefairy ex",hp:190,subtypes:['Basic','ex'],types:['Psychic'],abilities:['Fairy Zone'],suppression:false});
  assert.deepEqual(get().decision,sel('blower'));
  dragon.damage=130;
  assert.deepEqual(get().decision,sel('max')); // 150 remaining: 160 without weakness
  dragon.damage=0;
  view.ownPublic.active.energies=[P,P,P];
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FIELD_BLOWER_HOOD');
  view.ownPublic.active.energies=[P,P,P,P,P];
  view.ownPublic.prizeCount=3;
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FIELD_BLOWER_HOOD');
  view.ownPublic.prizeCount=2;
  dragon.tools=[];
  assert.deepEqual(get().decision,sel('max'));
});

paired('Manual Psychic funds a final-Prize bench Rondo before a legal pivot; paid retreat reduces Max Geist',(seat,profile)=>{
  const c="Lillie's Clefairy ex JTG",lillie="Lillie's Determination MEG";
  const clefairy=pokemon({printing:c,name:"Lillie's Clefairy ex",hp:190,subtypes:['Basic','ex'],types:['Psychic'],abilities:['Fairy Zone'],suppression:false,energies:[P],
    attacks:[attack('Full Moon Rondo',['Psychic','Colorless'],'20+')]});
  const mew=pokemon({printing:'Mew V FST',name:'Mew V',hp:180,subtypes:['Basic','V'],types:['Psychic']});
  const view=observation(seat,{active:latias(),bench:[clefairy,v(),radiant()],opponentActive:mew,
    opponentBench:Array.from({length:5},()=>pokemon({printing:'Genesect V FST',name:'Genesect V',types:['Metal'],subtypes:['Basic','V']})),
    ownHand:[P,lillie]});
  view.ownPublic.prizeCount=2;
  const ret={token:'retreat',kind:'retreat',targetPrinting:c,publicMetadata:{benchIndex:0}};
  const attach=play('charge',P,c,target('bench',0)),reset=play('reset',lillie);
  const get=(xs=[attach,ret,reset])=>worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile}).decideWithAudit(root(seat,view,xs));
  assert.deepEqual(get().decision,sel('charge'));
  assert.equal(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT');
  assert.notEqual(get([attach,reset]).policyAudit.selectionRuleCode,'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT');
  view.ownTurnResources.energyPlayedTurn=2;
  assert.deepEqual(get().decision,sel('charge'));
  assert.equal(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT');
  view.ownTurnResources.energyPlayedTurn=view.globalTurn;
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT');
  view.ownTurnResources.energyPlayedTurn=false;
  view.ownTurnResources.retreatedTurn=2;
  assert.deepEqual(get().decision,sel('charge'));
  assert.equal(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT');
  view.ownTurnResources.retreatedTurn=view.globalTurn;
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT');
  view.ownTurnResources.retreatedTurn=0;
  view.ownPublic.prizeCount=3;
  assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT');
  view.ownPublic.prizeCount=2;
  view.ownPublic.bench[0].energies.push(P);view.ownTurnResources.energyPlayedTurn=true;
  assert.deepEqual(get().decision,sel('retreat'));
  assert.equal(get().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_FUNDED_BENCH_RETREAT');
  view.ownPublic.active=view.ownPublic.bench[0];view.ownPublic.bench[0]=latias();
  assert.deepEqual(get([{token:'rondo',kind:'attack',attackName:'Full Moon Rondo'},reset]).decision,sel('rondo'));
  // Paid retreat spends a Psychic and changes the Max Geist damage total.
  const old=v([P]);old.printed.retreatCost=['Colorless'];
  const benched=vmax([P,P]),v2=v([P]);
  const targetPokemon=pokemon({printing:'Tapu Lele-GX GRI',name:'Tapu Lele-GX',hp:150,subtypes:['Basic','GX'],types:['Psychic']});
  const paid=observation(seat,{active:old,bench:[benched,v2],opponentActive:targetPokemon,opponentBench:[v()],ownHand:[P,lillie]});
  paid.ownPublic.prizeCount=2;
  const paidActions=[play('energy',P,M,target('bench',0)),{token:'retreat',kind:'retreat',targetPrinting:M,publicMetadata:{benchIndex:0}},reset];
  const paidGet=()=>worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile}).decideWithAudit(root(seat,paid,paidActions));
  assert.notEqual(paidGet().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT');
  old.printed.retreatCost=[];
  assert.deepEqual(paidGet().decision,sel('energy'));
  assert.equal(paidGet().policyAudit.selectionRuleCode,'ROOT_FINAL_BY_BENCH_CHARGE_RETREAT');
});


paired('Agent31: Guzma mirror final-three prize route beats double damage at both continuations',(seat,profile)=>{
 const guzma='Guzma BUS';
 const c=pokemon({printing:"Lillie's Clefairy ex JTG",name:"Lillie's Clefairy ex",hp:190,subtypes:['Basic','ex'],abilities:['Fairy Zone'],suppression:false,attacks:[attack('Full Moon Rondo',['Psychic','Colorless'],'20+')]});
 const a=vmax([P,P,P]);a.hp=320;
 const b=vmax([P,P,P,P]);b.hp=320;
 const d=vmax([P,P,P,P]);d.hp=320;
 const oppV=vmax([P,P,P]);oppV.hp=320;oppV.printed.weakness=[{type:'Darkness',value:'×2'}];
 const oppD=pokemon({printing:D,name:'Dialga-GX',hp:180,subtypes:['Basic','GX'],types:['Dragon'],weakness:[{type:'Fairy',value:'×2'}],attacks:[attack('Overclock',['Metal'],''),attack('Shred',['Metal','Colorless','Colorless'],'80'),attack('Timeless-GX',['Metal','Metal','Metal','Colorless','Colorless'],'150',{gxAttack:true})]});
 const oppA=pokemon({printing:'Girafarig LOT',name:'Girafarig',hp:90,attacks:[attack('Get Lost',['Colorless'],0),attack('Mind Shock',['Colorless','Colorless','Colorless'],'70')]});
 const ownA=pokemon({printing:'Mimikyu GRI',name:'Mimikyu',hp:70,attacks:[attack('Filch',['Colorless'],0),attack('Copycat',['Psychic','Colorless'],0)]});
 const view=observation(seat,{active:ownA,bench:[a,b,d,c],opponentActive:oppA,opponentBench:[oppV,oppD],ownHand:[guzma]});
 view.globalTurn=15;view.ownPublic.prizeCount=3;view.opponentPublic.prizeCount=2;
 const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
 function prompt(v,side){
 const choices=v[side==='actor'?'ownPublic':'opponentPublic'].bench.flatMap((p,i)=>p?[{token:side+'-'+i,kind:'pokemon',label:'Bench '+(i+1),printing:p.printing,publicMetadata:{selectionIndex:i,selectedCount:1,selectionType:'pokemon',ownerSeat:side,targetZone:'bench',benchIndex:i,isOwnerVisible:true}}]:[]);
 return {role:'candidate',seat,observation:{...v,decisionKind:'owner-prompt',pendingPromptType:'ChoosePokemonPrompt'},publicEventReceipt:null,
 prompt:{actingSeat:seat,promptType:'ChoosePokemonPrompt',description:null,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:guzma,effectName:'Guzma'},
 choices,publicMetadata:{minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false,selectionType:'pokemon',targetZone:'bench'}}};
 }
 const rootResult=policy.decideWithAudit(root(seat,view,[play('guzma',guzma)]));
 assert.deepEqual(rootResult.decision,sel('guzma'));
 assert.equal(rootResult.policyAudit.selectionRuleCode,'ROOT_FINAL_BY_GUZMA');
 assert.deepEqual(decide(profile,prompt(view,'opponent')),mult('opponent-0'));
 const afterGust={...view,opponentPublic:{...view.opponentPublic,active:oppV,bench:[oppA,oppD,null,null,null]}};
 const pivot=decide(profile,prompt(afterGust,'actor'));
 assert.deepEqual(pivot,mult('actor-0'));
 const pivotIndex=Number(pivot.tokens[0].split('-')[1]);
 const afterPivot={...afterGust,ownPublic:{...view.ownPublic,active:view.ownPublic.bench[pivotIndex],bench:view.ownPublic.bench.map((x,i)=>i===pivotIndex?ownA:x)}};
 const final=policy.decideWithAudit(root(seat,afterPivot,[{token:'max',kind:'attack',attackName:'Max Geist'}]));
 assert.deepEqual(final.decision,sel('max'));
 assert.equal(final.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
 view.ownPublic.prizeCount=2;assert.deepEqual(decide(profile,prompt(view,'opponent')),mult('opponent-1'));view.ownPublic.prizeCount=3;
 d.energies.pop();assert.deepEqual(decide(profile,prompt(view,'opponent')),mult('opponent-1'));d.energies.push(P);
 view.opponentPublic.bench=[oppD,oppV,null,null,null];assert.deepEqual(decide(profile,prompt(view,'opponent')),mult('opponent-1'));view.opponentPublic.bench=[oppV,oppD,null,null,null];
 oppV.publicDamageEffects={prevention:'all',effectsPrevention:'none',reduction:0,reductionFilter:'none',beforeWeaknessReduction:0,outgoingReduction:0,outgoingAfterWeaknessReduction:0,chancePrevention:false,chanceAttackFailure:0};
 assert.deepEqual(decide(profile,prompt(view,'opponent')),mult('opponent-1'));delete oppV.publicDamageEffects;
 view.ownPublic.publicTurnRestrictions.attackMaxEnergyTurnsRemaining=1;
 const uncertain=policy.decideWithAudit(root(seat,view,[play('guzma',guzma)]));
 assert.notEqual(uncertain.policyAudit.selectionRuleCode,'ROOT_FINAL_BY_GUZMA');
});


paired('Agent31: take final two prizes with Astral Barrage before evolution',(seat,profile)=>{
 const active=v([P,P,P]);active.hp=210;
 const opponent=vmax(Array(11).fill(P));opponent.hp=320;opponent.printed.weakness=[{type:'Darkness',value:'×2'}];
 const mm=pokemon({printing:'Mimikyu GRI',name:'Mimikyu',hp:70,damage:50,attacks:[attack('Filch',['Colorless'],0),attack('Copycat',['Psychic','Colorless'],0)]});
 const gf=pokemon({printing:'Girafarig LOT',name:'Girafarig',hp:90,damage:50,attacks:[attack('Get Lost',['Colorless'],0),attack('Mind Shock',['Colorless','Colorless','Colorless'],'70')]});
 const view=observation(seat,{active,opponentActive:opponent,opponentBench:[mm,gf],ownHand:[M]});
 view.globalTurn=15;view.ownPublic.prizeCount=2;view.opponentPublic.prizeCount=2;view.ownTurnResources.energyPlayedTurn=true;
 const evo=play('evolve',M,V,target('active',0)),barrage={token:'barrage',kind:'attack',attackName:'Astral Barrage'},mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
 const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
 const get=(items=[evo,barrage,mist])=>policy.decideWithAudit(root(seat,view,items));
 assert.equal(get().decision.token,'barrage');
 assert.equal(get().policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE');
 const prompt={actingSeat:seat,promptType:'ChoosePokemonPrompt',source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:V,effectName:'Astral Barrage'},
 publicMetadata:{selectionType:'pokemon',minimumCount:2,maximumCount:2,allowCancel:false},
 choices:[{token:'active',kind:'pokemon',printing:opponent.printing,publicMetadata:{ownerSeat:'opponent',targetZone:'active',isOwnerVisible:true}},
 {token:'mimikyu',kind:'pokemon',printing:mm.printing,publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0,isOwnerVisible:true}},
 {token:'girafarig',kind:'pokemon',printing:gf.printing,publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:1,isOwnerVisible:true}}]};
 const q={role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'ChoosePokemonPrompt'},prompt,publicEventReceipt:null};
 const chosen=decide(profile,q);
 assert.deepEqual(chosen.tokens.slice().sort(),['girafarig','mimikyu']);
 const negative=()=>{assert.equal(get().decision.token,'evolve');assert.notEqual(get().policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE');};
 gf.damage=30;negative();gf.damage=50;
 gf.publicDamageEffects={prevention:'none',effectsPrevention:'all',reduction:0,reductionFilter:'none',beforeWeaknessReduction:0,outgoingReduction:0,outgoingAfterWeaknessReduction:0,chancePrevention:false,chanceAttackFailure:0};
 negative();delete gf.publicDamageEffects;
 view.opponentPublic.bench[1]=null;negative();view.opponentPublic.bench[1]=gf;
 assert.equal(get([evo,mist]).decision.token,'evolve');
 view.ownPublic.prizeCount=3;negative();
});


paired('one-VMAX Gate access remains reachable with two free Bench slots but below the full Gate score',(seat,profile)=>{
  const quick='Quick Ball FST';
  const filler=pokemon({printing:'Marshadow UNB',name:'Marshadow',hp:80});
  const view=observation(seat,{active:v(),bench:[vmax(),latias(),filler],ownHand:[P],opponentActive:defender()});
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const request=cardPrompt(seat,view,quick,'Quick Ball','deck',[R,V],0,1);
  let got=policy.decideWithAudit(request);
  assert.deepEqual(got.decision,mult('card-0'));
  assert.equal(got.policyAudit.evaluations.find(row=>row.token==='card-0').score,100);

  const full=observation(seat,{active:v(),bench:[vmax(),filler],ownHand:[P],opponentActive:defender()});
  got=policy.decideWithAudit(cardPrompt(seat,full,quick,'Quick Ball','deck',[R,V],0,1));
  assert.deepEqual(got.decision,mult('card-0'));
  assert.equal(got.policyAudit.evaluations.find(row=>row.token==='card-0').score,120);

  const locked=observation(seat,{active:latias(),bench:[vmax(),filler,latias()],ownHand:[P],
    opponentActive:defender(),opponentStadium:['Path to the Peak CRE']});
  got=policy.decideWithAudit(cardPrompt(seat,locked,quick,'Quick Ball','deck',[R,V],0,1));
  assert.deepEqual(got.decision,mult('card-1'));
  assert.equal(got.policyAudit.evaluations.find(row=>row.token==='card-0').score,-5);
});


test('paid retreat to Wobbuffet unlocks a held Guzma final-two-Prize line against Stoutland Sentinel',()=>{
  for(const seat of [0,1]){
    const profile=profiles[1],guzma='Guzma BUS';
    const active=v([P,P]);active.printed.retreatCost=['Colorless','Colorless'];
    const w=wob();
    const attacker=vmax([P,P,P,P,P]);
    const stout=pokemon({printing:'Stoutland BCR',name:'Stoutland',hp:140,types:['Colorless'],
      subtypes:['Stage 2'],abilities:['Sentinel'],suppression:false});
    const pollen=pokemon({printing:'Vileplume AOR',name:'Vileplume',hp:130,types:['Grass'],
      subtypes:['Stage 2'],abilities:['Irritating Pollen'],suppression:false});
    const gx=pokemon({printing:'Vileplume-GX CEC',name:'Vileplume-GX',hp:240,damage:90,types:['Grass'],
      subtypes:['Stage 2','GX'],abilities:['Fragrant Flower Garden'],suppression:false});
    const view=observation(seat,{active,bench:[w,attacker],opponentActive:stout,opponentBench:[pollen,gx],
      ownHand:[guzma],globalTurn:15});
    view.ownPublic.prizeCount=2;
    view.ownTurnResources.supporterPlayLocked=true;
    view.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
    const retreat={token:'retreat-w',kind:'retreat',targetPrinting:W,publicMetadata:{benchIndex:0}};
    const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
    assert.deepEqual(decide(profile,root(seat,view,[retreat,mist])),sel('retreat-w'));

    const noGuzma=JSON.parse(JSON.stringify(view));noGuzma.ownHand=[];
    assert.deepEqual(decide(profile,root(seat,noGuzma,[retreat,mist])),sel('mist'));
    const spent=JSON.parse(JSON.stringify(view));spent.ownTurnResources.supporterPlayedTurn=1;
    assert.deepEqual(decide(profile,root(seat,spent,[retreat,mist])),sel('mist'));
    const short=JSON.parse(JSON.stringify(view));short.ownPublic.active.energies=[P];
    assert.deepEqual(decide(profile,root(seat,short,[retreat,mist])),sel('mist'));
    const unfunded=JSON.parse(JSON.stringify(view));unfunded.ownPublic.bench[1].energies=[P,P,P,P];
    assert.deepEqual(decide(profile,root(seat,unfunded,[retreat,mist])),sel('mist'));
    const blocked=JSON.parse(JSON.stringify(view));
    blocked.ownPublic.bench[0].abilitySuppressions[0].suppressed=true;
    blocked.ownPublic.bench[0].abilitySuppressions[0].reasonCode='TEST_SUPPRESSION';
    assert.deepEqual(decide(profile,root(seat,blocked,[retreat,mist])),sel('mist'));
    const tooMany=JSON.parse(JSON.stringify(view));tooMany.ownPublic.prizeCount=3;
    assert.deepEqual(decide(profile,root(seat,tooMany,[retreat,mist])),sel('mist'));

    const direct=JSON.parse(JSON.stringify(view));
    direct.ownPublic.prizeCount=1;direct.opponentPublic.active.damage=130;
    assert.deepEqual(decide(profile,root(seat,direct,[retreat,mist])),sel('mist'));
  }
});


test('Agent4 CRE74 capability enables Active plus one Bench Astral final only when explicitly bound',()=>{
  for(const base of profiles)for(const seat of [0,1]){
    const hooked={...base,paperAstralBarrageTargets:'agent4-cre74-hook-v1'};
    const regidrago=pokemon({printing:'Regidrago V SIT',name:'Regidrago V',hp:220,damage:180,
      subtypes:['Basic','V'],types:['Dragon']});
    const budew=pokemon({printing:'Budew ASC',name:'Budew',hp:30,damage:0,
      subtypes:['Basic'],types:['Grass']});
    const view=observation(seat,{active:v([P,P,P]),opponentActive:regidrago,opponentBench:[budew]});
    view.globalTurn=15;view.ownPublic.prizeCount=3;
    const barrage={token:'barrage',kind:'attack',attackName:'Astral Barrage'};
    const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
    const hookedPolicy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:hooked});
    const hookedRoot=hookedPolicy.decideWithAudit(root(seat,view,[barrage,mist]));
    assert.deepEqual(hookedRoot.decision,sel('barrage'));
    assert.equal(hookedRoot.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE');
    const basePolicy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:base});
    const unhookedRoot=basePolicy.decideWithAudit(root(seat,view,[barrage,mist]));
    assert.notEqual(unhookedRoot.decision.token,'barrage');
    assert.notEqual(unhookedRoot.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE');
    const prompt={actingSeat:seat,promptType:'ChoosePokemonPrompt',
      source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:V,effectName:'Astral Barrage'},
      publicMetadata:{selectionType:'pokemon',minimumCount:2,maximumCount:2,allowCancel:false},
      choices:[
        {token:'active',kind:'pokemon',printing:regidrago.printing,publicMetadata:{ownerSeat:'opponent',targetZone:'active',isOwnerVisible:true}},
        {token:'budew',kind:'pokemon',printing:budew.printing,publicMetadata:{ownerSeat:'opponent',targetZone:'bench',benchIndex:0,isOwnerVisible:true}}
      ]};
    const req={role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'ChoosePokemonPrompt'},prompt,publicEventReceipt:null};
    assert.deepEqual(hookedPolicy.decide(req),mult('active','budew'));
    assert.equal(basePolicy.decide(req).kind,'abstain');
    assert.throws(()=>worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,
      config:{...base,paperAstralBarrageTargets:'untrusted-hook'}}));
  }
});


test('paid Wobbuffet terminal projection respects effective Stoutland Hood after retreat',()=>{
  for(const seat of [0,1]){
    const profile=profiles[1],guzma='Guzma BUS';
    const active=v([P,P]);active.printed.retreatCost=['Colorless','Colorless'];
    const w=wob(),attacker=vmax([P,P,P,P,P]);
    const stout=pokemon({printing:'Stoutland BCR',name:'Stoutland',hp:140,types:['Colorless'],
      subtypes:['Stage 2'],abilities:['Sentinel'],suppression:false,tools:['Stealthy Hood UNB']});
    const pollen=pokemon({printing:'Vileplume AOR',name:'Vileplume',hp:130,types:['Grass'],
      subtypes:['Stage 2'],abilities:['Irritating Pollen'],suppression:false});
    const gx=pokemon({printing:'Vileplume-GX CEC',name:'Vileplume-GX',hp:240,damage:90,types:['Grass'],
      subtypes:['Stage 2','GX'],abilities:['Fragrant Flower Garden'],suppression:false});
    const view=observation(seat,{active,bench:[w,attacker],opponentActive:stout,opponentBench:[pollen,gx],
      ownHand:[guzma],globalTurn:15});
    view.ownPublic.prizeCount=2;
    view.ownTurnResources.supporterPlayLocked=true;
    view.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
    const retreat={token:'retreat-w',kind:'retreat',targetPrinting:W,publicMetadata:{benchIndex:0}};
    const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
    assert.deepEqual(decide(profile,root(seat,view,[retreat,mist])),sel('mist'));

    const jammed=JSON.parse(JSON.stringify(view));
    jammed.ownPublic.active.tools=['Tool Jammer BST'];
    assert.deepEqual(decide(profile,root(seat,jammed,[retreat,mist])),sel('mist'),
      'Tool Jammer on the departing Active must not manufacture a post-retreat Hood bypass');

    const disabled=JSON.parse(JSON.stringify(view));
    disabled.opponentPublic.stadium=['Jamming Tower TWM'];
    assert.deepEqual(decide(profile,root(seat,disabled,[retreat,mist])),sel('retreat-w'));
  }
});

test('hooked Astral Barrage admits the sole opposing Active while unhooked policy stays engine-conservative',()=>{
  for(const base of profiles)for(const seat of [0,1]){
    const hooked={...base,paperAstralBarrageTargets:'agent4-cre74-hook-v1'};
    const regidrago=pokemon({printing:'Regidrago V SIT',name:'Regidrago V',hp:220,damage:180,
      subtypes:['Basic','V'],types:['Dragon']});
    const view=observation(seat,{active:v([P,P,P]),opponentActive:regidrago,opponentBench:[]});
    view.globalTurn=15;view.ownPublic.prizeCount=2;
    const barrage={token:'barrage',kind:'attack',attackName:'Astral Barrage'};
    const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
    const hp=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:hooked});
    const bp=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:base});
    const got=hp.decideWithAudit(root(seat,view,[barrage,mist]));
    assert.deepEqual(got.decision,sel('barrage'));
    assert.equal(got.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE');
    assert.notEqual(bp.decide(root(seat,view,[barrage,mist])).token,'barrage');

    const prompt={actingSeat:seat,promptType:'ChoosePokemonPrompt',
      source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:V,effectName:'Astral Barrage'},
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false},
      choices:[{token:'active',kind:'pokemon',printing:regidrago.printing,
        publicMetadata:{ownerSeat:'opponent',targetZone:'active',isOwnerVisible:true}}]};
    const req={role:'candidate',seat,observation:{...view,decisionKind:'owner-prompt',pendingPromptType:'ChoosePokemonPrompt'},prompt,publicEventReceipt:null};
    assert.deepEqual(hp.decide(req),mult('active'));
    assert.equal(bp.decide(req).kind,'abstain');
  }
});


test('hooded Stoutland terminal line is certified only through held Field Blower after Wobbuffet suppresses Vileplume',()=>{
  for(const seat of [0,1]){
    const profile=profiles[1],guzma='Guzma BUS',blower='Field Blower GRI';
    const active=v([P,P]);active.printed.retreatCost=['Colorless','Colorless'];
    const w=wob(),attacker=vmax([P,P,P,P,P]);
    const stout=pokemon({printing:'Stoutland BCR',name:'Stoutland',hp:140,types:['Colorless'],
      subtypes:['Stage 2'],abilities:['Sentinel'],suppression:false,tools:['Stealthy Hood UNB']});
    const pollen=pokemon({printing:'Vileplume AOR',name:'Vileplume',hp:130,types:['Grass'],
      subtypes:['Stage 2'],abilities:['Irritating Pollen'],suppression:false});
    const gx=pokemon({printing:'Vileplume-GX CEC',name:'Vileplume-GX',hp:240,damage:90,types:['Grass'],
      subtypes:['Stage 2','GX'],abilities:['Fragrant Flower Garden'],suppression:false});
    const view=observation(seat,{active,bench:[w,attacker],opponentActive:stout,opponentBench:[pollen,gx],
      ownHand:[guzma,blower],globalTurn:15});
    view.ownPublic.prizeCount=2;
    view.ownTurnResources.supporterPlayLocked=true;
    view.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
    const retreat={token:'retreat-w',kind:'retreat',targetPrinting:W,publicMetadata:{benchIndex:0}};
    const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
    assert.deepEqual(decide(profile,root(seat,view,[retreat,mist])),sel('retreat-w'));

    const noBlower=JSON.parse(JSON.stringify(view));noBlower.ownHand=[guzma];
    assert.deepEqual(decide(profile,root(seat,noBlower,[retreat,mist])),sel('mist'));

    const hoodedPlume=JSON.parse(JSON.stringify(view));
    hoodedPlume.opponentPublic.bench[0].tools=['Stealthy Hood UNB'];
    assert.deepEqual(decide(profile,root(seat,hoodedPlume,[retreat,mist])),sel('mist'));

    const independentLock=JSON.parse(JSON.stringify(view));
    independentLock.ownTurnResources.itemPlayLocked=true;
    independentLock.ownPublic.publicTurnRestrictions.itemPlayLocked=true;
    assert.deepEqual(decide(profile,root(seat,independentLock,[retreat,mist])),sel('mist'));

    const extraTool=JSON.parse(JSON.stringify(view));
    extraTool.opponentPublic.active.tools=['Stealthy Hood UNB','Float Stone BKT'];
    assert.deepEqual(decide(profile,root(seat,extraTool,[retreat,mist])),sel('mist'));

    const unfunded=JSON.parse(JSON.stringify(view));
    unfunded.ownPublic.bench[1].energies=[P,P,P,P];
    assert.deepEqual(decide(profile,root(seat,unfunded,[retreat,mist])),sel('mist'));
  }
});


test('zero-Prize Trainer dolls never masquerade as final Prize KOs while sole-doll board wipe stays terminal',()=>{
  for(const profile of profiles)for(const seat of [0,1]){
    for(const spec of [
      ['Robo Substitute PHF','Robo Substitute'],
      ['Robo Substitute Team Flare Gear PHF','Robo Substitute Team Flare Gear'],
      ["Lillie's Poké Doll CEC","Lillie's Poké Doll"],
      ['Snorlax Doll PAR','Snorlax Doll']
    ]){
      const doll=pokemon({printing:spec[0],name:spec[1],hp:30,types:['Colorless'],subtypes:['Basic']});
      const snorlax=pokemon({printing:'Snorlax PGO',name:'Snorlax',hp:150,damage:0,types:['Colorless'],subtypes:['Basic']});
      const view=observation(seat,{active:vmax([P,P,P,P]),opponentActive:doll,opponentBench:[snorlax],globalTurn:15});
      view.ownPublic.prizeCount=1;
      const max={token:'max',kind:'attack',attackName:'Max Geist'};
      const got=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile})
        .decideWithAudit(root(seat,view,[max]));
      assert.notEqual(got.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
      assert.notEqual(got.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_BOARD_EMPTY_ATTACK');

      const sole=JSON.parse(JSON.stringify(view));
      sole.opponentPublic.bench=Array(5).fill(null);
      const soleGot=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile})
        .decideWithAudit(root(seat,sole,[max]));
      assert.deepEqual(soleGot.decision,sel('max'));
      assert.equal(soleGot.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_BOARD_EMPTY_ATTACK');
    }

    const ordinary=pokemon({printing:'Snorlax PGO',name:'Snorlax',hp:150,damage:120,types:['Colorless'],subtypes:['Basic']});
    const ordinaryView=observation(seat,{active:vmax([P,P,P,P]),opponentActive:ordinary,
      opponentBench:[pokemon({printing:'Pidgey MEW',name:'Pidgey',hp:60,types:['Colorless'],subtypes:['Basic']})],globalTurn:15});
    ordinaryView.ownPublic.prizeCount=1;
    const max={token:'max',kind:'attack',attackName:'Max Geist'};
    const ordinaryGot=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile})
      .decideWithAudit(root(seat,ordinaryView,[max]));
    assert.deepEqual(ordinaryGot.decision,sel('max'));
    assert.equal(ordinaryGot.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');

    const two=defender({hp:220,damage:200,subtypes:['Basic','V']});
    const twoView=observation(seat,{active:vmax([P,P,P,P]),opponentActive:two,
      opponentBench:[ordinary],globalTurn:15});
    twoView.ownPublic.prizeCount=2;
    const twoGot=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile})
      .decideWithAudit(root(seat,twoView,[max]));
    assert.deepEqual(twoGot.decision,sel('max'));
    assert.equal(twoGot.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  }
});


test('Astral terminal treats damage-only Safeguard and retreat-only Block as benign but not effect immunity',()=>{
  for(const base of profiles)for(const seat of [0,1]){
    const hooked={...base,paperAstralBarrageTargets:'agent4-cre74-hook-v1'};
    const attacker=v([P,P,P]);attacker.printed.retreatCost=['Colorless','Colorless'];
    const vmaxer=vmax([P,P,P,P,P]);
    const girafarig=pokemon({printing:'Girafarig LOT',name:'Girafarig',hp:90,damage:60,
      types:['Psychic'],subtypes:['Basic']});
    const mimikyu=pokemon({printing:'Mimikyu PAL',name:'Mimikyu',hp:70,damage:30,
      types:['Psychic'],subtypes:['Basic'],abilities:['Safeguard'],suppression:false});
    const snorlax=pokemon({printing:'Snorlax PGO',name:'Snorlax',hp:150,damage:120,
      types:['Colorless'],subtypes:['Basic'],abilities:['Block'],suppression:false});
    const barrage={token:'barrage',kind:'attack',attackName:'Astral Barrage'};
    const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
    const retreat={token:'retreat-vmax',kind:'retreat',targetPrinting:'Shadow Rider Calyrex VMAX CRE',publicMetadata:{benchIndex:0}};
    const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:hooked});

    for(const [active,bench] of [[girafarig,mimikyu],[snorlax,girafarig],[snorlax,mimikyu]]){
      const view=observation(seat,{active:attacker,bench:[vmaxer],opponentActive:active,opponentBench:[bench],globalTurn:11});
      view.ownPublic.prizeCount=2;
      const got=policy.decideWithAudit(root(seat,view,[barrage,mist,retreat]));
      assert.deepEqual(got.decision,sel('barrage'));
      assert.equal(got.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE');
    }

    const unaware=pokemon({printing:'Skeledirge SSP',name:'Skeledirge',hp:180,damage:140,
      types:['Fire'],subtypes:['Stage 2'],abilities:['Unaware'],suppression:false});
    const blocked=observation(seat,{active:attacker,bench:[vmaxer],opponentActive:girafarig,opponentBench:[unaware],globalTurn:11});
    blocked.ownPublic.prizeCount=2;
    const blockedGot=policy.decideWithAudit(root(seat,blocked,[barrage,mist,retreat]));
    assert.notEqual(blockedGot.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE');

    const basePolicy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:base});
    const unhooked=observation(seat,{active:attacker,bench:[vmaxer],opponentActive:girafarig,opponentBench:[mimikyu],globalTurn:11});
    unhooked.ownPublic.prizeCount=2;
    const unhookedGot=basePolicy.decideWithAudit(root(seat,unhooked,[barrage,mist,retreat]));
    assert.notEqual(unhookedGot.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE');
  }
});


test('Astral terminal target surface matches hook semantics and recognizes zero-Prize board-empty wins',()=>{
  for(const base of profiles)for(const seat of [0,1]){
    const hooked={...base,paperAstralBarrageTargets:'agent4-cre74-hook-v1'};
    const barrage={token:'barrage',kind:'attack',attackName:'Astral Barrage'};
    const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};

    const doll=pokemon({printing:"Lillie's Poké Doll CEC",name:"Lillie's Poké Doll",
      hp:30,damage:0,types:['Colorless'],subtypes:['Basic']});
    const sole=observation(seat,{active:v([P,P,P]),opponentActive:doll,opponentBench:[],globalTurn:9});
    sole.ownPublic.prizeCount=6;
    const hp=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:hooked});
    const soleGot=hp.decideWithAudit(root(seat,sole,[barrage,mist]));
    assert.deepEqual(soleGot.decision,sel('barrage'));
    assert.equal(soleGot.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BOARD_EMPTY');

    const activeV=pokemon({printing:'Regidrago V SIT',name:'Regidrago V',hp:220,damage:180,
      types:['Dragon'],subtypes:['Basic','V']});
    const b1=pokemon({printing:'Snorlax PGO',name:'Snorlax',hp:150,damage:0,types:['Colorless'],subtypes:['Basic']});
    const b2=pokemon({printing:'Mimikyu PAL',name:'Mimikyu',hp:70,damage:0,types:['Psychic'],subtypes:['Basic']});
    const unhooked=observation(seat,{active:v([P,P,P]),opponentActive:activeV,opponentBench:[b1,b2],globalTurn:9});
    unhooked.ownPublic.prizeCount=2;
    const bp=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:base});
    const baseGot=bp.decideWithAudit(root(seat,unhooked,[barrage,mist]));
    assert.notEqual(baseGot.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_ASTRAL_BARRAGE',
      'unhooked CRE74 cannot count an Active target it never receives in its target prompt');
  }
});


paired('public Altered Creation damage and extra-Prize flags feed Acerola exposure without conflating them',(seat,profile)=>{
  const ace='Acerola BUS';
  const victim=vmax([P]);victim.hp=320;victim.damage=140;
  const backup=vmax([P,P,P]);backup.hp=320;
  const threat=pokemon({printing:'Arceus & Dialga & Palkia-GX CEC',name:'Arceus & Dialga & Palkia-GX',
    hp:280,subtypes:['Basic','GX'],types:['Dragon'],energies:[],
    attacks:[attack('Public Threat',[],'150')]});
  const view=observation(seat,{active:victim,bench:[backup],opponentActive:threat,ownHand:[ace],globalTurn:9});
  view.opponentPublic.prizeCount=4;
  const items=[play('acerola',ace),{kind:'attack',token:'hit',attackName:'Max Geist'}];

  view.opponentPublic.publicTurnRestrictions.alteredCreationDamage=false;
  view.opponentPublic.publicTurnRestrictions.usedAlteredCreation=false;
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('hit'));

  view.opponentPublic.publicTurnRestrictions.alteredCreationDamage=true;
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('acerola'),
    'public +30 turns 150 into a funded 180-damage KO threat');

  view.opponentPublic.publicTurnRestrictions.alteredCreationDamage=false;
  view.opponentPublic.publicTurnRestrictions.usedAlteredCreation=true;
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('hit'),
    'extra-Prize flag alone must not fabricate damage exposure');

  view.opponentPublic.publicTurnRestrictions.alteredCreationDamage=true;
  view.opponentPublic.publicTurnRestrictions.usedAlteredCreation=true;
  view.opponentPublic.prizeCount=4;
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('acerola'),
    'once the public attack is lethal, the conditional extra Prize raises exposed liability');
});


paired('Altered Creation extra Prize enters Apex hazard only through an Active attack-damage KO',(seat,profile)=>{
  const get={kind:'attack',token:'get',attackName:'Get Lost'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const score=view=>policy.decideWithAudit(root(seat,view,[get])).policyAudit.evaluations
    .find(row=>row.token==='get')?.score;

  const gir=pokemon({printing:'Girafarig LOT',name:'Girafarig',hp:90,energies:[P],
    attacks:[attack('Get Lost',['Colorless'],'0')]});
  const reg=defender({energies:['Grass Energy SVE','Grass Energy SVE','Fire Energy SVE']});
  const victim=vmax([P]);victim.hp=320;victim.damage=130;
  const phantom=observation(seat,{active:gir,bench:[victim],opponentActive:reg,globalTurn:9});
  phantom.opponentPublic.discard=['Dragapult ex TWM','Psychic Energy SVE','Psychic Energy SVE'];
  phantom.opponentPublic.publicTurnRestrictions.alteredCreationDamage=false;
  phantom.opponentPublic.publicTurnRestrictions.usedAlteredCreation=false;
  const phantomBase=score(phantom);
  phantom.opponentPublic.publicTurnRestrictions.usedAlteredCreation=true;
  const phantomBoost=score(phantom);
  assert.equal(phantomBoost-phantomBase,2200,
    'one Active attack-damage Prize raises maximum-cut by 1800 and gust-potential cut by 400');

  const b1=vmax();b1.hp=320;b1.damage=220;
  const b2=vmax();b2.hp=320;b2.damage=220;
  const b3=vmax();b3.hp=320;b3.damage=220;
  const tri=observation(seat,{active:gir,bench:[b1,b2,b3],opponentActive:reg,globalTurn:9});
  tri.opponentPublic.discard=['Kyurem SFA','Psychic Energy SVE'];
  tri.opponentPublic.publicTurnRestrictions.alteredCreationDamage=false;
  tri.opponentPublic.publicTurnRestrictions.usedAlteredCreation=false;
  const triBase=score(tri);
  tri.opponentPublic.publicTurnRestrictions.usedAlteredCreation=true;
  const triBoost=score(tri);
  assert.equal(triBoost-triBase,0,
    'Trifrost maximum can take three Benched VMAX without KOing Active, so no extra Prize applies');
});

test('native public-damage projection survives candidate protocol, rejects legacy and malformed data',()=>{
  const {projectPublicDamageEffects}=require('../../simulation/evaluation/2026-11/agent46-owner-prize-facts.cjs');
  const clean={
    preventDamageNextTurn:null,preventEffectsOfAttacksNextTurn:null,
    damageReductionNextTurn:0,damageReductionNextTurnFilter:null,
    damageReductionBeforeWeaknessNextTurn:0,attackDamageReductionNextTurn:0,
    attackDamageReductionAfterWeaknessNextTurn:0,
    coinFlipPreventAttackDamageNextTurn:false,coinFlipCancelAttackNextTurn:0
  };
  for(const seat of [0,1]){
    const view=observation(seat,{active:v(),opponentActive:defender()});
    const mine={active:clean,bench:[null,null,null,null,null]};
    const theirs={active:{...clean,preventDamageNextTurn:{sourceStage:'BASIC'}},
      bench:[null,null,null,null,null]};
    const players=seat===0?[mine,theirs]:[theirs,mine];
    const enriched=projectPublicDamageEffects(view,{players},seat,{BASIC:'BASIC'});
    assert.equal(enriched.opponentPublic.active.publicDamageEffects.prevention,'basic');
    assert.doesNotThrow(()=>protocol.validateActorObservation(enriched,seat,profiles[0]));
    assert.doesNotThrow(()=>protocol.validateActorObservation(enriched,seat,profiles[1]));
    assert.throws(()=>protocol.validateActorObservation(enriched,seat),
      /UNKNOWN_FIELD/,'unconfigured legacy role must not gain new schema fields');
    const bad={...enriched,opponentPublic:{...enriched.opponentPublic,
      active:{...enriched.opponentPublic.active,
        publicDamageEffects:{...enriched.opponentPublic.active.publicDamageEffects,
          prevention:'opponent-secret'}}}};
    assert.throws(()=>protocol.validateActorObservation(bad,seat,profiles[0]),
      /BAD_PUBLIC_DAMAGE_EFFECT/,'unrecognized filter claims must fail closed');
    const badNumber={...enriched,ownPublic:{...enriched.ownPublic,
      active:{...enriched.ownPublic.active,
        publicDamageEffects:{...enriched.ownPublic.active.publicDamageEffects,
          reduction:-1}}}};
    assert.throws(()=>protocol.validateActorObservation(badNumber,seat,profiles[0]),
      /BAD_PUBLIC_DAMAGE_EFFECT/,'invalid native reduction cannot pass');
  }
});

paired('Agent2: unhooked Astral ignores a phantom Active KO when Benched targets block effects',(seat,profile)=>{
  const active=pokemon({printing:'Regidrago V SIT',name:'Regidrago V',
    hp:220,damage:190,types:['Dragon'],subtypes:['Basic','V']});
  const misted=()=>pokemon({printing:'Kyurem SFA',name:'Kyurem',
    hp:130,types:['Dragon'],energies:['Mist Energy TEF']});
  const view=observation(seat,{active:v([P,P,P]),opponentActive:active,
    opponentBench:[misted(),misted()]});
  const items=[
    {token:'barrage',kind:'attack',attackName:'Astral Barrage'},
    {token:'mist',kind:'attack',attackName:'Shadow Mist'}
  ];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('mist'));
  // Positive: when the legal Bench targets are unprotected, retain the attack.
  view.opponentPublic.bench[0].energies=[];
  view.opponentPublic.bench[1].energies=[];
  assert.deepEqual(decide(profile,root(seat,view,items)),sel('barrage'));
});
paired('Agent2: an inaccessible Gate cannot reserve away a second Rider Basic',(seat,profile)=>{
  const thorns=pokemon({printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',
    hp:230,types:['Lightning'],subtypes:['Basic','ex','Future'],
    abilities:['Initialization'],suppression:false});
  const view=observation(seat,{active:v([P]),bench:[latias(),wob()],
    opponentActive:thorns,ownHand:[R,V]});
  const cards=[
    play('bench-v',V,null,target('bench',2)),
    play('gate',R,null,target('bench',2))
  ];
  assert.deepEqual(decide(profile,root(seat,view,cards)),sel('bench-v'));
  // A live Gate still outranks a discretionary extra Rider Bench play.
  thorns.abilities=[];
  thorns.abilityDetails=[];
  thorns.abilitySuppressions=[];
  assert.deepEqual(decide(profile,root(seat,view,cards)),sel('gate'));
  // An unremoved Path is another distinct source of the same blocked-Gate case.
  view.opponentPublic.stadium=['Path to the Peak CRE'];
  assert.deepEqual(decide(profile,root(seat,view,cards)),sel('bench-v'));
});

paired('Agent2: source-certified disabled Safeguard admits a final Prize attack, stale suppression does not',(seat,profile)=>{
  const targetPokemon=suppression=>pokemon({printing:'Mimikyu PAL',name:'Mimikyu',
    hp:70,damage:10,abilities:['Safeguard'],suppression});
  const blocker=()=>pokemon({printing:'Garbodor DRX',name:'Garbodor',hp:100,
    subtypes:['Stage 1'],abilities:['Garbotoxin'],suppression:false,
    tools:['Float Stone BKT']});
  const view=observation(seat,{active:vmax([P,P,P]),opponentActive:targetPokemon(true),
    opponentBench:[blocker()],ownHand:[P]});
  view.ownPublic.prizeCount=1;
  const actions=[
    {token:'max',kind:'attack',attackName:'Max Geist'},
    play('energy',P,M,target('active',0))
  ];
  const decision=()=>decide(profile,root(seat,view,actions));
  assert.deepEqual(decision(),sel('max')); // Explicitly suppressed with a live lock source.
  view.opponentPublic.active=targetPokemon(null);
  assert.deepEqual(decision(),sel('max')); // Unknown row but independent public lock.
  view.opponentPublic.bench=[null,null,null,null,null];
  view.opponentPublic.active=targetPokemon(true);
  assert.deepEqual(decision(),sel('energy')); // Stale row alone never proves the win.
  view.opponentPublic.active=targetPokemon(false);
  assert.deepEqual(decision(),sel('energy')); // Live Safeguard is a real blocker.
  view.opponentPublic.active.abilities=[];
  view.opponentPublic.active.abilityDetails=[];
  view.opponentPublic.active.abilitySuppressions=[];
  assert.deepEqual(decision(),sel('max')); // Ordinary unprotected final-Prize KO.
});

paired('Agent7: an authenticated opponent Tropical Beach draws instead of passing, without displacing attacks',(seat,profile)=>{
  const beach={token:'beach',kind:'use-stadium',
    actorPrinting:'Tropical Beach BWP 50',publicMetadata:{stadiumEffectLive:true}};
  const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
  const view=observation(seat,{active:v(),opponentActive:defender()});
  view.ownPublic.deckCount=20;
  view.opponentPublic.stadium=['Tropical Beach BWP 50'];
  const select=items=>decide(profile,root(seat,view,items));
  assert.deepEqual(select([beach]),sel('beach'));
  view.ownPublic.stadium=['Tropical Beach BWP 50'];
  view.opponentPublic.stadium=[];
  assert.deepEqual(select([beach]),sel('beach')); // Either physical owner.
  view.ownPublic.active=v([P]);
  assert.deepEqual(select([beach,mist]),sel('mist')); // Beach ends turn.
  view.ownPublic.active=v();
  view.ownPublic.stadium=[];
  assert.deepEqual(select([beach]),sel('pass')); // No visible source.
  view.opponentPublic.stadium=['Tropical Beach BWP 50'];
  assert.deepEqual(select([{...beach,actorPrinting:'Tropical Beach BWP 28'}]),sel('pass'));
  assert.deepEqual(select([{...beach,publicMetadata:{stadiumEffectLive:false}}]),sel('pass'));
  assert.deepEqual(select([{...beach,actorPrinting:'Tropical Beach BWP'}]),sel('pass'));
  view.ownHand=[P,P,P,P,P,P];view.ownPublic.handCount=6;
  assert.deepEqual(select([beach]),sel('pass')); // <=1 draw.
  view.ownHand=[];view.ownPublic.handCount=0;
  view.ownPublic.deckCount=8;
  assert.deepEqual(select([beach]),sel('pass')); // Leave >=2 after draw 7.
  view.ownHand=[P,P,P,P,P];view.ownPublic.handCount=5;
  view.ownPublic.deckCount=4;
  assert.deepEqual(select([beach]),sel('beach')); // Exactly two retained.
  view.ownPublic.deckCount=3;
  assert.deepEqual(select([beach]),sel('pass'));
  view.ownPublic.deckCount=20;
  view.ownHand=[V];view.ownPublic.handCount=1;
  assert.deepEqual(select([beach,play('bench',V,null,target('bench',0))]),sel('bench'));
});

paired('Agent46: Mist Energy does not prevent direct final-Prize damage, unlike unknown reactive Energy',(seat,profile)=>{
  const victim=defender({hp:280,damage:0,energies:['Mist Energy TEF']});
  const view=observation(seat,{active:vmax(Array(9).fill(P)),
    opponentActive:victim,ownHand:[P]});
  view.globalTurn=8;view.ownPublic.prizeCount=2;
  const attackItem={token:'max',kind:'attack',attackName:'Max Geist'};
  const energy=play('energy',P,M,target('active',0));
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const selected=()=>policy.decideWithAudit(root(seat,view,[energy,attackItem]));
  const receipt=selected();
  assert.deepEqual(receipt.decision,sel('max'));
  assert.equal(receipt.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  // Other special Energy is intentionally not generalized: it might retaliate.
  view.opponentPublic.active.energies=['Spiky Energy JTG'];
  assert.notEqual(selected().policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  // Mist is safe on a non-target Benched Pokemon as well.
  view.opponentPublic.active.energies=[P];
  view.opponentPublic.bench[0]=pokemon({printing:'Kyurem SFA',name:'Kyurem',
    energies:['Mist Energy TEF']});
  assert.equal(selected().policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  // This addition never makes effect-based Astral counters penetrate Mist.
  view.ownPublic.active=v([P,P,P]);
  view.opponentPublic.active=defender({hp:280});
  view.opponentPublic.bench=[
    pokemon({printing:'Kyurem SFA',name:'Kyurem',hp:130,energies:['Mist Energy TEF']}),
    pokemon({printing:'Kyurem SFA',name:'Kyurem',hp:130,energies:['Mist Energy TEF']}),
    null,null,null
  ];
  const barrage={token:'barrage',kind:'attack',attackName:'Astral Barrage'};
  const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
  assert.deepEqual(decide(profile,root(seat,view,[barrage,mist])),sel('mist'));
});

paired('Agent46: source-field non-defensive Special Energy does not erase a direct Prize KO',(seat,profile)=>{
  const victim=defender({hp:280,damage:0});
  const view=observation(seat,{active:vmax(Array(9).fill(P)),opponentActive:victim});
  view.globalTurn=8;view.ownPublic.prizeCount=2;
  const max={token:'max',kind:'attack',attackName:'Max Geist'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const receipt=()=>policy.decideWithAudit(root(seat,view,[max]));
  const plain=['Double Colorless Energy FCO','Capture Energy RCL','Jet Energy PAL',
    'Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR',
    'Memory Energy LOT','Recycle Energy UNM','Prism Energy NXD',
    'Powerful Colorless Energy DAA','Mist Energy TEF',
    'Double Dragon Energy ROS'];
  for(const special of plain){
    view.opponentPublic.active.energies=[special];
    const got=receipt();
    assert.deepEqual(got.decision,sel('max'),special);
    assert.equal(got.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',special);
  }
  // Special-energy effects that change the direct outcome are still withheld.
  for(const unsafe of ['Spiky Energy JTG','Legacy Energy TWM','Stone Fighting Energy VIV',
    'Horror Psychic Energy RCL','UNKNOWN ENERGY']) {
    view.opponentPublic.active.energies=[unsafe];
    assert.notEqual(receipt().policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  }
});

paired('Agent46: source-field draw/search support Abilities never veto a direct current KO',(seat,profile)=>{
  const view=observation(seat,{active:vmax(Array(9).fill(P)),
    opponentActive:defender({hp:280}),opponentBench:[]});
  view.globalTurn=8;view.ownPublic.prizeCount=2;
  const item={token:'max',kind:'attack',attackName:'Max Geist'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const checked=()=>policy.decideWithAudit(root(seat,view,[item]));
  const supporters=[
    ['Dedenne-GX UNB','Dedechange'],
    ['Crobat V DAA','Dark Asset'],
    ['Squawkabilly ex PAL','Squawk and Seize'],
    ['Fezandipiti ex SFA','Flip the Script'],
    ['Eldegoss V CPA','Happy Match'],
    ['Pidgeot ex OBF','Quick Search'],
    ['Pidgeotto TEU','Air Mail'],
    ['Fan Rotom SCR','Fan Call'],
    ['Genesect V FST','Fusion Strike System'],
    ['Marshadow UNB','Resetting Hole'],
    ['Electrode-GX CES','Extra Energy Bomb']
  ];
  for(const [printing,ability] of supporters){
    view.opponentPublic.bench[0]=pokemon({printing,name:printing.replace(/ [A-Z]{2,4}$/, ''),
      abilities:[ability],suppression:false});
    const result=checked();
    assert.deepEqual(result.decision,sel('max'),printing);
    assert.equal(result.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',printing);
  }
  // Never generalize beyond a recognized source printing and Ability.
  view.opponentPublic.bench[0]=pokemon({printing:'Dedenne-GX UNB',name:'Dedenne-GX',
    abilities:['UNRECOGNIZED_ABIL'],suppression:false});
  assert.notEqual(checked().policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
});

paired('Agent46: inert source Stadium must not mask a payable direct final Prize win',(seat,profile)=>{
  const view=observation(seat,{active:vmax(Array(9).fill(P)),
    opponentActive:defender({hp:280})});
  view.globalTurn=8;view.ownPublic.prizeCount=2;
  const attackItem={token:'max',kind:'attack',attackName:'Max Geist'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const final=()=>policy.decideWithAudit(root(seat,view,[attackItem]))
    .policyAudit.selectionRuleCode;
  for(const stadium of ['Tropical Beach BWP 50','Chaotic Swell CEC',
      'Artazon PAL','Thunder Mountain LOT']) {
    view.opponentPublic.stadium=[stadium];
    assert.equal(final(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',stadium);
  }
  // Wondrous payment and Path/Silent Ability suppression are now
  // modeled explicitly; unverified Stadiums remain excluded.
  for(const stadium of ['UNRECOGNIZED STADIUM']){
    view.opponentPublic.stadium=[stadium];
    assert.notEqual(final(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  }
  // Never certify a Thunder Mountain energy-cost interaction for an
  // unregistered Lightning attacker from this generic helper.
  view.opponentPublic.stadium=['Thunder Mountain LOT'];
  view.ownPublic.active.printed.types=['Lightning'];
  assert.notEqual(final(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
});

paired('Agent46: opponent control locks do not by themselves negate a funded direct Prize KO',(seat,profile)=>{
  const candidate=vmax(Array(9).fill(P));
  const view=observation(seat,{active:candidate,opponentActive:defender({hp:280})});
  view.globalTurn=8;view.ownPublic.prizeCount=1;
  const max={token:'max',kind:'attack',attackName:'Max Geist'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const rule=()=>policy.decideWithAudit(root(seat,view,[max])).policyAudit.selectionRuleCode;
  const lockHolders=[
    ['Iron Thorns ex TWM','Initialization',true,230,['Basic','ex','Future']],
    ['Wobbuffet PHF','Bide Barricade',true,110,['Basic']],
    ['Vileplume AOR','Irritating Pollen',false,130,['Stage 2']],
    ['Vileplume BUS','Disgusting Pollen',true,140,['Stage 2']],
    ['Stoutland BCR','Sentinel',true,140,['Stage 2']],
    ['Klefki SVI','Mischievous Lock',true,70,['Basic']],
    ['Galarian Weezing RCL','Neutralizing Gas',true,130,['Stage 1']],
    ['Alolan Muk SUM','Power of Alchemy',false,120,['Stage 1']],
    ['Flutter Mane TEF','Midnight Fluttering',true,90,['Basic','Ancient']]
  ];
  for(const [printing,ability,active,hp,subtypes] of lockHolders){
    const lock=pokemon({printing,name:printing,hp,subtypes,
      abilities:[ability],suppression:false});
    if(active){
      view.opponentPublic.active=lock;
      view.opponentPublic.bench=[null,null,null,null,null];
    } else {
      view.opponentPublic.active=defender({hp:280});
      view.opponentPublic.bench=[lock,null,null,null,null];
    }
    assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',printing);
  }
  // Active Vileplume BUS genuinely bars a Basic from using Shadow Mist.
  const bust=pokemon({printing:'Vileplume BUS',name:'Vileplume',hp:110,damage:100,
    abilities:['Disgusting Pollen'],suppression:false});
  view.ownPublic.active=v([P]);view.opponentPublic.active=bust;
  view.opponentPublic.bench=[null,null,null,null,null];
  view.ownPublic.prizeCount=1;
  const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
  const basic=policy.decideWithAudit(root(seat,view,[mist]));
  assert.notEqual(basic.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
});

paired('Agent46: nondefensive opponent Tools do not veto a direct final Prize hit',(seat,profile)=>{
  const victim=defender({hp:280});
  const view=observation(seat,{active:vmax(Array(9).fill(P)),opponentActive:victim});
  view.globalTurn=8;view.ownPublic.prizeCount=2;
  const max={token:'max',kind:'attack',attackName:'Max Geist'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const rule=()=>policy.decideWithAudit(root(seat,view,[max])).policyAudit.selectionRuleCode;
  const safe=['Float Stone BKT','Muscle Band XY','Forest Seal Stone SIT',
    'Tool Jammer BST','Stealthy Hood UNB','Telescopic Sight VIV',
    'U-Turn Board UNM','Air Balloon SSH','Big Parasol DAA'];
  for(const tool of safe){
    view.opponentPublic.active.tools=[tool];
    assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',tool);
    view.opponentPublic.active.tools=[];
    view.opponentPublic.bench[0]=pokemon({printing:'Dedenne-GX UNB',name:'Dedenne-GX',
      abilities:['Dedechange'],suppression:false,tools:[tool]});
    assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',tool+' bench');
  }
  view.opponentPublic.bench=[null,null,null,null,null];
  for(const reactive of ['Rock Guard PLF','Eviolite NVI','Hero\'s Cape TEF',
    'Bravery Charm PAL','UNRECOGNIZED TOOL']){
    view.opponentPublic.active.tools=[reactive];
    assert.notEqual(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',reactive);
  }
});

paired('Agent46: Wondrous Labyrinth source cost is paid before Shadow Mist final certification',(seat,profile)=>{
  const thorns=pokemon({printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',
    hp:230,damage:220,types:['Lightning'],subtypes:['Basic','ex','Future'],
    abilities:['Initialization'],suppression:false});
  const view=observation(seat,{active:v([P]),opponentActive:thorns,
    opponentStadium:['Wondrous Labyrinth TEU']});
  view.globalTurn=8;view.ownPublic.prizeCount=2;
  const mist={token:'mist',kind:'attack',attackName:'Shadow Mist'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const rule=()=>policy.decideWithAudit(root(seat,view,[mist])).policyAudit.selectionRuleCode;
  assert.notEqual(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK'); // One P underpays P+C.
  view.ownPublic.active.energies.push(P);
  assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK'); // Two paid P, 10 final damage.
  view.ownPublic.active.energies.pop();
  view.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=1;
  view.opponentPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=1;
  assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK'); // Stadium effect disabled.
  view.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=0;
  view.opponentPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=0;
  view.opponentPublic.stadium=[];
  assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK'); // No Stadium.
});

paired('Agent46: source Path and Silent Lab do not erase payable direct KO but suppress Fairy Zone',(seat,profile)=>{
  const dragon=pokemon({printing:'Regidrago VSTAR SIT',name:'Regidrago VSTAR',
    hp:280,damage:0,types:['Dragon'],subtypes:['Stage 1','VSTAR'],
    abilities:['Legacy Star'],suppression:null});
  const view=observation(seat,{active:vmax(Array(9).fill(P)),opponentActive:dragon});
  view.globalTurn=8;view.ownPublic.prizeCount=2;
  const max={token:'max',kind:'attack',attackName:'Max Geist'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const final=()=>policy.decideWithAudit(root(seat,view,[max]))
    .policyAudit.selectionRuleCode;
  for(const stadium of ['Path to the Peak CRE','Silent Lab PRC']){
    view.opponentPublic.stadium=[stadium];
    assert.equal(final(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',stadium);
  }
  // The same Stadium really removes the Basic Clefairy's Fairy Zone:
  // 5 Psychic give Geist 160, enough only if doubled against Dragon.
  view.ownPublic.active=vmax(Array(5).fill(P));
  view.ownPublic.bench[0]=pokemon({printing:"Lillie's Clefairy ex JTG",
    name:"Lillie's Clefairy ex",hp:190,subtypes:['Basic','ex'],
    types:['Psychic'],abilities:['Fairy Zone'],suppression:null});
  view.opponentPublic.stadium=[];
  assert.equal(final(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  for(const stadium of ['Path to the Peak CRE','Silent Lab PRC']){
    view.opponentPublic.stadium=[stadium];
    assert.notEqual(final(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',stadium);
  }
  // Silent Lab disables a Basic Safeguard on the defender. Path does not,
  // because the non-Rule-Box Mimikyu is unaffected by Path.
  view.ownPublic.active=vmax(Array(9).fill(P));
  view.ownPublic.bench=[null,null,null,null,null];
  view.ownPublic.prizeCount=1;
  view.opponentPublic.active=pokemon({printing:'Mimikyu PAL',name:'Mimikyu',
    hp:70,subtypes:['Basic'],abilities:['Safeguard'],suppression:null});
  view.opponentPublic.stadium=['Silent Lab PRC'];
  assert.equal(final(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  view.opponentPublic.stadium=['Path to the Peak CRE'];
  assert.notEqual(final(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
});

paired('Agent46: CIN Counter and LPM Unit source energy supply is state and Prize exact',(seat,profile)=>{
  const tp=pokemon({printing:L,name:'Tapu Lele-GX',hp:170,
    subtypes:['Basic','GX'],energies:[P,P],
    attacks:[attack('Energy Drive',['Colorless','Colorless'],'20x')]});
  const raichu=pokemon({printing:'Alolan Raichu UNM',name:'Alolan Raichu',
    hp:110,types:['Lightning'],subtypes:['Stage 1'],
    energies:['Counter Energy CIN','Counter Energy CIN','Unit Energy LPM UPR'],
    attacks:[attack('Electric Ball',['Lightning','Colorless','Colorless'],'90')]});
  const view=observation(seat,{active:tp,opponentActive:raichu});
  view.globalTurn=8;view.ownPublic.prizeCount=1;view.opponentPublic.prizeCount=4;
  const drive={token:'drive',kind:'attack',attackName:'Energy Drive'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const rule=()=>policy.decideWithAudit(root(seat,view,[drive])).policyAudit.selectionRuleCode;
  const supply=(slot,side='opponent')=>worker.__test.publicEnergySupply(slot,view,false,side);
  assert.equal(supply(raichu).length,5);
  assert.deepEqual(supply(raichu)[4],['Lightning','Psychic','Metal']);
  assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK'); // 2+5 units ->140>=110.
  view.opponentPublic.prizeCount=1;
  assert.equal(supply(raichu).length,3);
  assert.notEqual(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK'); // 2+3 units ->100<110.
  // GX/EX attached Counter Energy never gains the conditional 2-unit bonus.
  view.opponentPublic.prizeCount=4;
  const gx=pokemon({printing:'Electrode-GX CES',name:'Electrode-GX',
    subtypes:['Stage 1','GX'],energies:['Counter Energy CIN']});
  assert.equal(supply(gx).length,1);
  // Unrecognized Unit type family is unknown, never guessed Colorless.
  raichu.energies=['Unit Energy UNRECOGNIZED'];
  assert.equal(supply(raichu),null);
  // Wondrous costs an extra Colorless for the source attack as well.
  raichu.energies=['Unit Energy LPM UPR','Counter Energy CIN'];
  view.opponentPublic.prizeCount=4;
  view.opponentPublic.stadium=['Wondrous Labyrinth TEU'];
  assert.equal(worker.__test.publicEnergyCanPay(raichu,raichu.attacks[0],view,false,'opponent'),false);
  view.opponentPublic.stadium=[];
  assert.equal(worker.__test.publicEnergyCanPay(raichu,raichu.attacks[0],view,false,'opponent'),true);
  view.opponentPublic.prizeCount=1;
  assert.equal(worker.__test.publicEnergyCanPay(raichu,raichu.attacks[0],view,false,'opponent'),false);
});

paired('Agent46: poisoned or burned current attacker and statused defender still take direct final Prize',(seat,profile)=>{
  const view=observation(seat,{active:vmax(Array(9).fill(P)),
    opponentActive:defender({hp:280})});
  view.globalTurn=8;view.ownPublic.prizeCount=2;
  const attack={token:'max',kind:'attack',attackName:'Max Geist'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const rule=()=>policy.decideWithAudit(root(seat,view,[attack])).policyAudit.selectionRuleCode;
  const final='ROOT_PUBLIC_FINAL_PRIZE_ATTACK';
  view.ownPublic.active.specialConditions=['poisoned'];
  view.opponentPublic.active.specialConditions=['asleep'];
  assert.equal(rule(),final); // Defender's sleep does not prevent being hit.
  view.ownPublic.active.specialConditions=[3,4]; // Poisoned and Burned engine codes.
  view.opponentPublic.active.specialConditions=[1]; // Confused defender.
  assert.equal(rule(),final); // Confusion only affects attacking Pokémon.
  view.ownPublic.active.specialConditions=['burned'];
  view.opponentPublic.active.specialConditions=['poisoned','burned'];
  assert.equal(rule(),final); // End-of-turn Checkup is after the Prize win.
  for(const unsafe of [['confused'],['asleep'],['paralyzed'],[1],[2],[0],['unfamiliar']]){
    view.ownPublic.active.specialConditions=unsafe;
    assert.notEqual(rule(),final); // Probability/forbidden/unknown -> no certificate.
  }
  view.ownPublic.active.specialConditions=[];
  view.opponentPublic.active.specialConditions=['unfamiliar'];
  assert.notEqual(rule(),final); // Unknown opponent state cannot be certified.
});

test('Agent46: owner Ranger chain through Battle Compressor then VS Seeker then attack',()=>{
  const bc='Battle Compressor PHF',opponent=defender();
  for(const seat of [0,1]){
    const view=observation(seat,{active:v([P]),opponentActive:opponent,
      ownHand:[bc,VS]});
    view.globalTurn=8;
    view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
    const bcPlay=play('compress',bc),vsPlay=play('seeker',VS);
    const rooted=profile=>decide(profile,root(seat,view,[bcPlay,vsPlay]));
    assert.deepEqual(rooted(profiles[0]),sel('compress')); // Hood exact-60 chain.
    assert.deepEqual(rooted(profiles[1]),sel('pass')); // Lockbridge lacks Ranger.
    const deckPrompt=cardPrompt(seat,view,bc,'Battle Compressor','deck',
      [RANGER,'Psychic Energy SVE',D],0,3);
    assert.deepEqual(decide(profiles[0],deckPrompt),mult('card-0'));
    // If Ranger is prized/unavailable on the actual deck search, skip the
    // optional discard instead of burning key cards as fake payloads.
    const missing=cardPrompt(seat,view,bc,'Battle Compressor','deck',[P,D],0,3);
    assert.deepEqual(decide(profiles[0],missing),choice('empty'));
    const after={...view,ownHand:[VS],ownPublic:{...view.ownPublic,
      handCount:1,discard:[bc,RANGER]}};
    assert.deepEqual(decide(profiles[0],root(seat,after,[vsPlay])),sel('seeker'));
    const seeker=cardPrompt(seat,after,VS,'VS Seeker','discard',[RANGER]);
    assert.deepEqual(decide(profiles[0],seeker),mult('card-0'));
    const ranger=play('ranger',RANGER);
    const recovered={...after,ownHand:[RANGER],ownPublic:{...after.ownPublic,
      handCount:1,discard:[bc,VS]}};
    assert.deepEqual(decide(profiles[0],root(seat,recovered,[ranger])),sel('ranger'));
    const unlocked={...recovered,ownHand:[],ownPublic:{...recovered.ownPublic,
      handCount:0,publicTurnRestrictions:{...recovered.ownPublic.publicTurnRestrictions,
        attackLockTurnsRemaining:0}},ownTurnResources:{...recovered.ownTurnResources,
        supporterPlayedTurn:1}};
    assert.deepEqual(decide(profiles[0],root(seat,unlocked,
      [{token:'mist',kind:'attack',attackName:'Shadow Mist'}])),sel('mist'));
    // No VS Seeker / no active attack restriction / spent Supporter => avoid.
    const noVS={...view,ownHand:[bc]};
    assert.deepEqual(decide(profiles[0],root(seat,noVS,[bcPlay])),sel('pass'));
    const notLocked={...view,ownPublic:{...view.ownPublic,
      publicTurnRestrictions:{...view.ownPublic.publicTurnRestrictions,
        attackLockTurnsRemaining:0}}};
    assert.deepEqual(decide(profiles[0],root(seat,notLocked,[bcPlay])),sel('pass'));
    const spent={...view,ownTurnResources:{...view.ownTurnResources,
      supporterPlayedTurn:1}};
    assert.deepEqual(decide(profiles[0],root(seat,spent,[bcPlay])),sel('pass'));
  }
});

test('Agent46: Compressor via VS Seeker restores Raihan or Teammates after a real opposing KO',()=>{
  const bc='Battle Compressor PHF',raihan='Raihan EVS',teammates='Teammates PRC';
  const koReceipt={priorOpponentTurnKO:{any:true}};
  for(const seat of [0,1])for(const profile of profiles){
    for(const useRaihan of [false,true]){
      const active=useRaihan?vmax([P,P]):v([P]);
      const view=observation(seat,{active,opponentActive:defender(),
        ownHand:[bc,VS],ownDiscard:useRaihan?[P]:[]});
      view.globalTurn=8;
      const compressor=play('compress',bc),seeker=play('seeker',VS);
      const rootReq=root(seat,view,[compressor,seeker],koReceipt);
      assert.deepEqual(decide(profile,rootReq),sel('compress'));
      const choose=cardPrompt(seat,view,bc,'Battle Compressor','deck',
        [teammates,raihan,D],0,3);
      choose.publicEventReceipt=koReceipt;
      const intended=useRaihan?'card-1':'card-0';
      assert.deepEqual(decide(profile,choose),mult(intended));
      const selected=useRaihan?raihan:teammates;
      const post={...view,ownHand:[VS],ownPublic:{...view.ownPublic,
        handCount:1,discard:[bc,...view.ownPublic.discard,selected]}};
      assert.deepEqual(decide(profile,root(seat,post,[seeker],koReceipt)),sel('seeker'));
      const supporterPrompt=cardPrompt(seat,post,VS,'VS Seeker','discard',[selected]);
      supporterPrompt.publicEventReceipt=koReceipt;
      assert.deepEqual(decide(profile,supporterPrompt),mult('card-0'));
      const ready={...post,ownHand:[selected],ownPublic:{...post.ownPublic,
        handCount:1,discard:[bc,...view.ownPublic.discard,VS]}};
      assert.deepEqual(decide(profile,root(seat,ready,[play('supporter',selected)],koReceipt)),
        sel('supporter'));
    }
    // No opposing KO: neither source Supporter has a live condition.
    const view=observation(seat,{active:v([P]),opponentActive:defender(),
      ownHand:[bc,VS]});
    assert.deepEqual(decide(profile,root(seat,view,[play('compress',bc)])),sel('pass'));
  }
});

test('Agent46: Compressor fuels held Raihan with precisely one searchable Psychic Energy',()=>{
  const bc='Battle Compressor PHF',raihan='Raihan EVS';
  const koReceipt={priorOpponentTurnKO:{any:true}};
  for(const seat of [0,1])for(const profile of profiles){
    const view=observation(seat,{active:vmax([P,P]),opponentActive:defender(),
      ownHand:[bc,raihan],ownDiscard:[]});
    view.globalTurn=8;
    const playBC=play('compress',bc),playRaihan=play('raihan',raihan);
    assert.deepEqual(decide(profile,root(seat,view,[playBC,playRaihan],koReceipt)),
      sel('compress')); // Direct Raihan has no discard fuel.
    const choose=cardPrompt(seat,view,bc,'Battle Compressor','deck',
      [P,'Teammates PRC',D],0,3);
    choose.publicEventReceipt=koReceipt;
    assert.deepEqual(decide(profile,choose),mult('card-0'));
    const after={...view,ownHand:[raihan],ownPublic:{...view.ownPublic,
      handCount:1,discard:[bc,P]}};
    assert.deepEqual(decide(profile,root(seat,after,[playRaihan],koReceipt)),
      sel('raihan'));
    const noKO=observation(seat,{active:vmax([P,P]),opponentActive:defender(),
      ownHand:[bc,raihan]});
    assert.deepEqual(decide(profile,root(seat,noKO,[playBC])),sel('pass'));
    const noRaihan={...view,ownHand:[bc]};
    assert.deepEqual(decide(profile,root(seat,noRaihan,[playBC],koReceipt)),sel('pass'));
    const alreadyEnergy={...view,ownPublic:{...view.ownPublic,
      discard:[P]}};
    assert.deepEqual(decide(profile,root(seat,alreadyEnergy,
      [playBC,playRaihan],koReceipt)),sel('raihan'));
  }
});

test('Agent46: attack-effect Ranger opens a guaranteed final and defeats competing Raihan',()=>{
  for(const seat of [0,1]){
    const ranger='Pokémon Ranger STS',raihan='Raihan EVS';
    const dragon=defender({hp:280,damage:180});
    const view=observation(seat,{active:vmax([P,P,P]),bench:[vmax([P,P])],
      opponentActive:dragon,ownHand:[ranger,raihan],ownDiscard:[P]});
    view.globalTurn=8;view.ownPublic.prizeCount=2;
    view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
    const koReceipt={priorOpponentTurnKO:{any:true}};
    const opts=[play('ranger',ranger),play('raihan',raihan)];
    const get=()=>worker.createPolicy({role:'candidate',seat,
      policyVersion:worker.POLICY_VERSION,config:profiles[0]})
      .decideWithAudit(root(seat,view,opts,koReceipt));
    assert.deepEqual(get().decision,sel('ranger'));
    assert.equal(get().policyAudit.selectionRuleCode,'ROOT_PLAY_MAX_COMPONENT_SCORE');
    const after={...view,ownPublic:{...view.ownPublic,
      publicTurnRestrictions:{...view.ownPublic.publicTurnRestrictions,
        attackLockTurnsRemaining:0}}};
    assert.deepEqual(decide(profiles[0],root(seat,after,
      [{token:'max',kind:'attack',attackName:'Max Geist'}])),sel('max'));

    // An opponent's live, continuous Vileplume BUS Ability is unaffected by
    // Ranger and still forbids Basic Shadow Mist, even if an old attack
    // restriction happens to coexist.
    const vile=pokemon({printing:'Vileplume BUS',name:'Vileplume',
      hp:140,damage:130,types:['Grass'],subtypes:['Stage 2'],
      abilities:['Disgusting Pollen'],suppression:false});
    const blocked=observation(seat,{active:v([P]),opponentActive:vile,
      ownHand:[ranger]});
    blocked.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
    assert.deepEqual(decide(profiles[0],root(seat,blocked,
      [play('ranger',ranger)])),sel('pass'));
  }
});

test('Agent46: native unaccented Pokemon Ranger name still reaches legal source tactic',()=>{
  const native='Pokemon Ranger STS',source='Pokémon Ranger STS',bc='Battle Compressor PHF';
  for(const seat of [0,1]){
    const view=observation(seat,{active:v([P]),opponentActive:defender(),
      ownHand:[native]});
    view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
    assert.deepEqual(decide(profiles[0],root(seat,view,[play('ranger',native)])),sel('ranger'));
    // Also accept the exact authenticated source spelling.
    view.ownHand=[source];
    assert.deepEqual(decide(profiles[0],root(seat,view,[play('ranger',source)])),sel('ranger'));
    view.ownHand=[bc,VS];
    const search=cardPrompt(seat,view,bc,'Battle Compressor','deck',
      [native,D],0,3);
    assert.deepEqual(decide(profiles[0],search),mult('card-0'));
    const recovered={...view,ownHand:[VS],ownPublic:{...view.ownPublic,
      discard:[bc,native]}};
    assert.deepEqual(decide(profiles[0],root(seat,recovered,
      [play('seeker',VS)])),sel('seeker'));
    const seeker=cardPrompt(seat,recovered,VS,'VS Seeker','discard',[native]);
    assert.deepEqual(decide(profiles[0],seeker),mult('card-0'));
  }
});

test('Agent46: Compressor leaves a searchable deck for Raihan or Teammates',()=>{
  const bc='Battle Compressor PHF',ranger='Pokémon Ranger STS',
    raihan='Raihan EVS';
  const ko={priorOpponentTurnKO:{any:true}};
  for(const seat of [0,1])for(const profile of profiles){
    const view=observation(seat,{active:vmax([P,P]),opponentActive:defender(),
      ownHand:[bc,raihan]});
    view.ownPublic.deckCount=1;view.globalTurn=8;
    const offer=[play('compress',bc)];
    assert.deepEqual(decide(profile,root(seat,view,offer,ko)),sel('pass'));
    view.ownPublic.deckCount=2;
    assert.deepEqual(decide(profile,root(seat,view,offer,ko)),sel('compress'));
    view.ownHand=[bc,VS];
    view.ownPublic.deckCount=1;
    assert.deepEqual(decide(profile,root(seat,view,offer,ko)),sel('pass'));
    view.ownPublic.deckCount=2;
    assert.deepEqual(decide(profile,root(seat,view,offer,ko)),sel('compress'));
  }
  // Ranger does not need to search deck, so one card is sufficient when it
  // can actually be discarded into VS Seeker and the lock is attack-sourced.
  for(const seat of [0,1]){
    const view=observation(seat,{active:v([P]),opponentActive:defender(),
      ownHand:[bc,VS]});
    view.ownPublic.deckCount=1;
    view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
    assert.deepEqual(decide(profiles[0],root(seat,view,
      [play('compress',bc)])),sel('compress'));
  }
});

paired('Agent46: pinned native GRW and FDY Unit variants share source-safe semantics',(seat,profile)=>{
  const variants=[
    ['Unit Energy LPM UPR',['Lightning','Psychic','Metal']],
    ['Unit Energy GRW UPR',['Grass','Fire','Water']],
    ['Unit Energy FDY FLI',['Fighting','Darkness','Fairy']],
    ['Unit Energy LightningPsychicMetal UPR',['Lightning','Psychic','Metal']],
    ['Unit Energy GrassFireWater UPR',['Grass','Fire','Water']],
    ['Unit Energy FightingDarknessFairy FLI',['Fighting','Darkness','Fairy']]
  ];
  const view=observation(seat,{active:vmax(Array(9).fill(P)),
    opponentActive:defender({hp:280})});
  view.globalTurn=8;view.ownPublic.prizeCount=2;
  const max={token:'max',kind:'attack',attackName:'Max Geist'};
  const policy=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile});
  const rule=()=>policy.decideWithAudit(root(seat,view,[max])).policyAudit.selectionRuleCode;
  for(const [printing,types] of variants){
    view.opponentPublic.active.energies=[printing];
    assert.deepEqual(worker.__test.publicEnergySupply(view.opponentPublic.active,view)[0],
      types,printing);
    assert.equal(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',printing);
  }
  for(const invalid of ['Unit Energy UNRECOGNIZED',
    'Unit Energy GFW UPR','Unit Energy FDF FLI','Unit Energy LPM UNKNOWN']){
    view.opponentPublic.active.energies=[invalid];
    assert.equal(worker.__test.publicEnergySupply(view.opponentPublic.active,view),
      null,invalid);
    assert.notEqual(rule(),'ROOT_PUBLIC_FINAL_PRIZE_ATTACK',invalid);
  }
});

test('Agent46: Battle Compressor and Night Stretcher form an exact no-KO Psychic access line',()=>{
  const bc='Battle Compressor PHF',stretcher='Night Stretcher SFA';
  for(const seat of [0,1])for(const profile of profiles){
    const view=observation(seat,{active:vmax([P,P]),bench:[vmax([])],
      opponentActive:defender(),ownHand:[bc,stretcher]});
    view.globalTurn=8;
    const compressor=play('compress',bc),recover=play('recover',stretcher);
    assert.deepEqual(decide(profile,root(seat,view,[compressor])),sel('compress'));
    const choose=cardPrompt(seat,view,bc,'Battle Compressor','deck',
      [P,D,'Shadow Rider Calyrex V CRE'],0,3);
    assert.deepEqual(decide(profile,choose),mult('card-0'));
    const notInDeck=cardPrompt(seat,view,bc,'Battle Compressor','deck',
      [D,'Shadow Rider Calyrex V CRE'],0,3);
    assert.deepEqual(decide(profile,notInDeck),choice('empty'));
    const after={...view,ownHand:[stretcher],ownPublic:{...view.ownPublic,
      handCount:1,discard:[bc,P],deckCount:view.ownPublic.deckCount-1}};
    assert.deepEqual(decide(profile,root(seat,after,[recover])),sel('recover'));
    const pick=cardPrompt(seat,after,stretcher,'Night Stretcher','discard',
      [P,bc]);
    assert.deepEqual(decide(profile,pick),mult('card-0'));
    const ready={...after,ownHand:[P],ownPublic:{...after.ownPublic,
      handCount:1,discard:[bc,stretcher]}};
    assert.deepEqual(decide(profile,root(seat,ready,
      [play('attach',P,null,target('active',0))])),sel('attach'));
    // This line consumes Items and can still function after a Supporter.
    const spent={...view,ownTurnResources:{...view.ownTurnResources,
      supporterPlayedTurn:1}};
    assert.deepEqual(decide(profile,root(seat,spent,[compressor])),sel('compress'));
    // It is a real energy-access line, not a reason for blind milling.
    const noStretcher={...view,ownHand:[bc]};
    assert.deepEqual(decide(profile,root(seat,noStretcher,[compressor])),sel('pass'));
    const alreadyHeld={...view,ownHand:[bc,stretcher,P]};
    assert.deepEqual(decide(profile,root(seat,alreadyHeld,[compressor])),sel('pass'));
    const alreadyDiscarded={...view,ownPublic:{...view.ownPublic,discard:[P]}};
    assert.deepEqual(decide(profile,root(seat,alreadyDiscarded,[compressor])),sel('pass'));
    const nearEmpty={...view,ownPublic:{...view.ownPublic,deckCount:1}};
    assert.deepEqual(decide(profile,root(seat,nearEmpty,[compressor])),sel('pass'));
  }
});

test('Agent46: Compressor-Stretcher turns a real deck VMAX into an immediately playable evolution',()=>{
  const bc='Battle Compressor PHF',stretcher='Night Stretcher SFA';
  for(const seat of [0,1])for(const profile of profiles){
    const view=observation(seat,{active:v([P]),bench:[v([])],
      opponentActive:defender(),ownHand:[bc,stretcher,P]});
    view.globalTurn=8;
    const compressor=play('compress',bc),recover=play('recover',stretcher);
    assert.deepEqual(decide(profile,root(seat,view,[compressor])),sel('compress'));
    const choose=cardPrompt(seat,view,bc,'Battle Compressor','deck',[M,P,D],0,3);
    assert.deepEqual(decide(profile,choose),mult('card-0'));
    const absent=cardPrompt(seat,view,bc,'Battle Compressor','deck',[P,D],0,3);
    assert.deepEqual(decide(profile,absent),choice('empty'));
    const after={...view,ownHand:[stretcher,P],ownPublic:{...view.ownPublic,
      discard:[bc,M],handCount:2,deckCount:view.ownPublic.deckCount-1}};
    assert.deepEqual(decide(profile,root(seat,after,[recover])),sel('recover'));
    const pick=cardPrompt(seat,after,stretcher,'Night Stretcher','discard',[M,bc]);
    assert.deepEqual(decide(profile,pick),mult('card-0'));
    const ready={...after,ownHand:[M,P],ownPublic:{...after.ownPublic,
      handCount:2,discard:[bc,stretcher]}};
    assert.deepEqual(decide(profile,root(seat,ready,
      [play('evolve',M,null,target('active',0))])),sel('evolve'));
    // Direct Stretcher on a useful already-discarded evolution dominates
    // spending Compressor just to access another copy.
    const direct={...view,ownPublic:{...view.ownPublic,discard:[M]}};
    assert.deepEqual(decide(profile,root(seat,direct,[compressor,recover])),sel('recover'));
    const noStretcher={...view,ownHand:[bc,P]};
    assert.deepEqual(decide(profile,root(seat,noStretcher,[compressor])),sel('pass'));
    const alreadyHeld={...view,ownHand:[bc,stretcher,P,M]};
    assert.deepEqual(decide(profile,root(seat,alreadyHeld,[compressor])),sel('pass'));
    const almostEmpty={...view,ownPublic:{...view.ownPublic,deckCount:1}};
    assert.deepEqual(decide(profile,root(seat,almostEmpty,[compressor])),sel('pass'));
  }
});
