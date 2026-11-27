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
