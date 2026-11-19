'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policyModule = require('../../simulation/evaluation/2026-11/agent23-rank19-raging-bolt-opponent-policy-v2.cjs');

const POLICY_VERSION = policyModule.POLICY_VERSION;
const EMPTY_BENCH = () => Array.from({ length: 5 }, () => null);

function publicRestrictions(overrides = {}) {
  return {
    gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0,
    attackMaxEnergy: null, attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false,
    itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false,
    energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: null,
    ...overrides
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
function pokemon({
  printing, name, hp = 240, damage = 0, subtypes = ['Basic'], types = ['Dragon'],
  energies = [], tools = [], abilities = [], attacks = [], weakness = [], resistance = [],
  retreatCost = [], stage = 'Basic', abilitySuppressions
}) {
  const suppressions = abilitySuppressions ?? abilities.map(abilityName => ({
    abilityName, suppressed: false, reasonCode: null, sourcePrinting: null
  }));
  return {
    printing, name: name ?? printing, hp, damage, lastPlayedOrEvolvedTurn: 1,
    printed: { stage, subtypes, types, retreatCost, weakness, resistance },
    specialConditions: [], publicRestrictions: pokemonRestrictions(),
    evolutionPrintings: [], energies, tools, attacks, abilities,
    abilityDetails: abilities.map(abilityName => ({ name: abilityName, powerType: 'ABILITY', text: null })),
    abilitySuppressions: suppressions
  };
}
function publicPlayer({
  active = null, bench = EMPTY_BENCH(), stadium = [], discard = [], lostZone = [],
  resolvingSupporter = [], publicHand = null, prizeSlots = [],
  restrictions = {}, handCount = 0, deckCount = 35, prizeCount = 6
} = {}) {
  return {
    active, bench, stadium, discard, lostZone, resolvingSupporter, publicHand, prizeSlots,
    publicTurnRestrictions: publicRestrictions(restrictions),
    handCount, deckCount, prizeCount
  };
}
function observation({
  seat = 0, turn = 1, ownActive = null, ownBench = EMPTY_BENCH(),
  opponentActive = null, opponentBench = EMPTY_BENCH(), ownHand = [],
  ownDiscard = [], ownStadium = [], opponentStadium = [],
  ownRestrictions = {}, opponentRestrictions = {}, ownPrizeCount = 6,
  opponentPrizeCount = 6, opponentHandCount = 0, decisionKind = 'owner-root',
  promptType = null
} = {}) {
  return {
    actorSeat: seat, globalTurn: turn, phase: 2, decisionKind,
    pendingPromptType: promptType, pendingOwnerDeckSearch: false,
    ownHand,
    ownPublic: publicPlayer({
      active: ownActive, bench: ownBench, stadium: ownStadium, discard: ownDiscard,
      restrictions: ownRestrictions, handCount: ownHand.length, prizeCount: ownPrizeCount
    }),
    opponentPublic: publicPlayer({
      active: opponentActive, bench: opponentBench, stadium: opponentStadium,
      restrictions: opponentRestrictions, handCount: opponentHandCount, prizeCount: opponentPrizeCount
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
function init(seat = 0, role = 'opponent') {
  return {
    schema: protocol.INIT_SCHEMA, type: 'init', role, seat,
    policyVersion: POLICY_VERSION, bundleSha256: 'a'.repeat(64), config: {}
  };
}
function prompt(seat, promptType, effectName, sourcePrinting, choices, publicMetadata) {
  const indexedChoices = choices.map((choice, index) => ({
    ...choice,
    ...(choice.publicMetadata ? {
      publicMetadata: { ...choice.publicMetadata, selectionIndex: index, selectedCount: 1 }
    } : {})
  }));
  return {
    schema: protocol.PROMPT_SCHEMA, actingSeat: seat, promptType,
    description: effectName, source: {
      classification: 'actor-choice', sourceKind: 'card-effect',
      sourcePrinting, effectName
    },
    choices: indexedChoices, publicMetadata
  };
}
function cardChoice(token, printing, extra = {}) {
  return {
    token, kind: 'card', printing,
    publicMetadata: { selectionIndex: 0, selectedCount: 1, sourceZone: 'deck',
      ownerSeat: 'actor', isOwnerVisible: true, ...extra }
  };
}
function pokemonChoice(token, pokemonCard, ownerSeat = 'actor', targetZone = 'bench') {
  return {
    token, kind: 'pokemon', printing: pokemonCard.printing,
    publicMetadata: { selectionIndex: 0, selectedCount: 1, selectionType: 'pokemon',
      ownerSeat, targetZone, isOwnerVisible: true }
  };
}
function energyChoice(token, printing, energyType, ownerSeat = 'actor') {
  return {
    token, kind: 'energy', printing,
    publicMetadata: { selectionIndex: 0, selectedCount: 1, sourceZone: 'play',
      ownerSeat, isOwnerVisible: true, energyType }
  };
}
function emptyChoice(token) {
  return { token, kind: 'empty-selection' };
}
function action(token, kind, fields = {}) {
  return { token, kind, ...fields };
}
function runDecision({
  obs, items = [], promptValue = null, receipt = null, seat = 0,
  role = 'opponent', requestId = 'rank19-test-request'
}) {
  const initMessage = init(seat, role);
  protocol.validateInit(initMessage);
  const request = {
    schema: protocol.REQUEST_SCHEMA, type: 'decision', requestId, sequence: 1,
    role, seat, observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: obs, prompt: promptValue, publicEventReceipt: receipt,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items }
  };
  const validated = protocol.validateRequest(request, initMessage, 1, new Set());
  const policy = policyModule.createPolicy({
    role, seat, policyVersion: POLICY_VERSION, config: {}
  });
  const decision = policy.decide(request);
  const accepted = protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return { decision: accepted, request, validated };
}

const RAGING = 'Raging Bolt ex TEF 123';
const ADP = 'Arceus & Dialga & Palkia-GX CEC 156';
const SANDY = 'Sandy Shocks ex PAR 108';
const MOLTRES = 'Galarian Moltres V CRE 97';
const HOOH = 'Ho-Oh-EX DRX 22';
const DDE = 'Double Dragon Energy ROS 97';
const LIGHTNING = 'Lightning Energy MEE 12';
const FIGHTING = 'Fighting Energy MEE 14';
const DARKNESS = 'Darkness Energy MEE 15';


test('source identity, policy version, and engine pin are explicit',()=>{
 assert.equal(policyModule.POLICY_VERSION,'agent23-rank19-raging-bolt-opponent-v2');
 assert.equal(policyModule.SOURCE_RANK,19);
 assert.equal(policyModule.SOURCE_FINGERPRINT_SHA256,'8fc9b7cf236a50ea34cdf10746bfc01d5f226739d106e4afcf438ed5c8f491eb');
 assert.equal(policyModule.ENGINE_PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.equal(policyModule.basicEnergyType(DDE),null);
});
test('init rejects candidate role and unknown policy version',()=>{
 assert.throws(()=>policyModule.createPolicy({role:'candidate',seat:0,policyVersion:POLICY_VERSION,config:{}}));
 assert.throws(()=>policyModule.createPolicy({role:'opponent',seat:0,policyVersion:'wrong',config:{}}));
});
test('Battle VIP Pass is selected on second player first turn when offered legally',()=>{
 const obs=observation({seat:1,turn:2,ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']})});
 const result=runDecision({obs,seat:1,items:[action('vip','play-card',{actorPrinting:'Battle VIP Pass FST 225'}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'vip'});
});
test('ADP uses Altered Creation-GX and fails closed on Ultimate Ray',()=>{
 const adp=pokemon({printing:ADP,subtypes:['Basic','TAG TEAM','GX'],energies:[DDE]});
 const obs=observation({ownActive:adp,ownRestrictions:{gxUsed:false}});
 const first=runDecision({obs,items:[action('altered','attack',{attackName:'Altered Creation-GX'}),action('ray','attack',{attackName:'Ultimate Ray'}),action('pass','pass')]});
 assert.deepEqual(first.decision,{kind:'select-action',token:'altered'});
 const after=runDecision({obs:observation({ownActive:adp,ownRestrictions:{gxUsed:true}}),items:[action('ray','attack',{attackName:'Ultimate Ray'}),action('pass','pass')]});
 assert.deepEqual(after.decision,{kind:'select-action',token:'pass'});
});
test('Sky Field replaces Temple of Sinnoh for an established ADP',()=>{
 const adp=pokemon({printing:ADP,subtypes:['Basic','TAG TEAM','GX'],energies:[DDE]});
 const obs=observation({ownActive:adp,ownStadium:['Temple of Sinnoh ASR 155']});
 const result=runDecision({obs,items:[action('sky','use-stadium',{actorPrinting:'Sky Field ROS 89'}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'sky'});
});
test('Bellowing Thunder is not selected because its native effect emits DiscardEnergyPrompt',()=>{
 const bolt=pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient'],energies:[LIGHTNING,FIGHTING,DDE]});
 const obs=observation({ownActive:bolt});
 const result=runDecision({obs,items:[action('bellowing','attack',{attackName:'Bellowing Thunder'}),action('burst','attack',{attackName:'Burst Roar'}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'burst'});
});
test('AttachEnergyPrompt and DiscardEnergyPrompt fail closed with explicit reasons',()=>{
 const obs=observation({decisionKind:'owner-prompt',promptType:'AttachEnergyPrompt'});
 const attach=prompt(0,'AttachEnergyPrompt',"Professor Sada's Vitality","Professor Sada's Vitality PAR 170",[],{});
 assert.deepEqual(runDecision({obs,promptValue:attach}).decision,{kind:'abstain',reasonCode:'UNSUPPORTED_ATTACH_ENERGY_PROMPT'});
 const dObs=observation({decisionKind:'owner-prompt',promptType:'DiscardEnergyPrompt'});
 const discard=prompt(0,'DiscardEnergyPrompt','Bellowing Thunder',RAGING,[],{});
 assert.deepEqual(runDecision({obs:dObs,promptValue:discard}).decision,{kind:'abstain',reasonCode:'UNSUPPORTED_DISCARD_ENERGY_PROMPT'});
});
test('Professor Sada and Raihan are not selected while their attachment prompt is unsupported',()=>{
 const obs=observation({ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),ownHand:["Professor Sada's Vitality PAR 170",'Raihan EVS 152'],ownDiscard:[LIGHTNING]});
 const result=runDecision({obs,items:[action('sada','play-card',{actorPrinting:"Professor Sada's Vitality PAR 170"}),action('raihan','play-card',{actorPrinting:'Raihan EVS 152'}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'pass'});
});
test('Tapu Koko and Sandy Shocks attachment abilities are not selected',()=>{
 const obs=observation({ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),ownBench:[pokemon({printing:SANDY,subtypes:['Basic','ex','Ancient']}),null,null,null,null],ownDiscard:[LIGHTNING,FIGHTING]});
 const result=runDecision({obs,items:[action('dance','use-ability',{publicMetadata:{abilityName:'Dance of the Ancients'}}),action('magnetic','use-ability',{publicMetadata:{abilityName:'Magnetic Absorption'}}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'pass'});
});
test('Ho-Oh Rebirth root action requires three distinct Basic Energy types and a free Bench slot',()=>{
 const obs=observation({ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),ownDiscard:[HOOH,LIGHTNING,FIGHTING,DARKNESS]});
 const result=runDecision({obs,items:[action('rebirth','use-ability',{publicMetadata:{abilityName:'Rebirth'}}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'rebirth'});
 const noSpace=observation({ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),ownBench:Array.from({length:5},(_,i)=>pokemon({printing:`Bench ${i}`})),ownDiscard:[HOOH,LIGHTNING,FIGHTING,DARKNESS]});
 const declined=runDecision({obs:noSpace,items:[action('rebirth','use-ability',{publicMetadata:{abilityName:'Rebirth'}}),action('pass','pass')]});
 assert.deepEqual(declined.decision,{kind:'select-action',token:'pass'});
});
test('Ho-Oh Rebirth chooses three distinct Basic Energy cards in its native ChooseCardsPrompt',()=>{
 const obs=observation({ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),ownDiscard:[HOOH,LIGHTNING,FIGHTING,DARKNESS],decisionKind:'owner-prompt',promptType:'ChooseCardsPrompt'});
 const choices=[cardChoice('l1',LIGHTNING,{sourceZone:'discard',ownerSeat:'actor'}),cardChoice('l2',LIGHTNING,{sourceZone:'discard',ownerSeat:'actor'}),cardChoice('f',FIGHTING,{sourceZone:'discard',ownerSeat:'actor'}),cardChoice('d',DARKNESS,{sourceZone:'discard',ownerSeat:'actor'}),cardChoice('dde',DDE,{sourceZone:'discard',ownerSeat:'actor'})];
 const p=prompt(0,'ChooseCardsPrompt','Rebirth',HOOH,choices,{selectionType:'card-combination',minimumCount:3,maximumCount:3,allowCancel:false,sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true});
 const result=runDecision({obs,promptValue:p});
 assert.equal(result.decision.kind,'select-choices');
 const types=result.decision.tokens.map(token=>policyModule.basicEnergyType(choices.find(c=>c.token===token).printing));
 assert.equal(new Set(types).size,3);assert.equal(types.includes(null),false);assert.equal(result.decision.tokens.includes('dde'),false);
});
test('Battle Compressor prioritizes Ho-Oh and distinct missing Basic Energy types, never Double Dragon Energy',()=>{
 const moltres=pokemon({printing:MOLTRES,subtypes:['Basic','V']});
 const obs=observation({ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),ownBench:[moltres,null,null,null,null],ownDiscard:[LIGHTNING],decisionKind:'owner-prompt',promptType:'ChooseCardsPrompt'});
 const choices=[cardChoice('hooh',HOOH,{sourceZone:'deck'}),cardChoice('f',FIGHTING,{sourceZone:'deck'}),cardChoice('d',DARKNESS,{sourceZone:'deck'}),cardChoice('l2',LIGHTNING,{sourceZone:'deck'}),cardChoice('dde',DDE,{sourceZone:'deck'}),emptyChoice('empty')];
 const p=prompt(0,'ChooseCardsPrompt','Battle Compressor','Battle Compressor PHF 92',choices,{selectionType:'card-combination',minimumCount:0,maximumCount:3,allowCancel:false,sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true});
 const result=runDecision({obs,promptValue:p});
 assert.equal(result.decision.kind,'select-choices');assert.equal(result.decision.tokens.includes('dde'),false);assert.equal(result.decision.tokens.includes('hooh'),true);
 const after=policyModule.discardEnergyTypes({...obs.ownPublic,discard:[...obs.ownPublic.discard,...result.decision.tokens.map(token=>choices.find(c=>c.token===token).printing)]});
 assert.equal(after.size,3);
});
test('Wait and See Hammer is selected when legal on the second player first turn',()=>{
 const target=pokemon({printing:ADP,subtypes:['Basic','TAG TEAM','GX'],energies:[DDE]});
 const obs=observation({turn:2,ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),opponentActive:target});
 const result=runDecision({obs,items:[action('hammer','play-card',{actorPrinting:'Wait and See Hammer LOT 192'}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'hammer'});
});
test('Wait and See Hammer selects the unique opponent Pokémon carrying Double Dragon Energy',()=>{
 const bolt=pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']});
 const active=pokemon({printing:'Shadow Rider Calyrex VMAX CRE 75',subtypes:['VMAX'],energies:[LIGHTNING]});
 const bench=pokemon({printing:ADP,subtypes:['Basic','TAG TEAM','GX'],energies:[DDE]});
 const obs=observation({ownActive:bolt,opponentActive:active,opponentBench:[bench,null,null,null,null],decisionKind:'owner-prompt',promptType:'ChoosePokemonPrompt'});
 const choices=[pokemonChoice('active',active,'opponent','active'),pokemonChoice('bench',bench,'opponent','bench')];
 const p=prompt(0,'ChoosePokemonPrompt','Wait and See Hammer','Wait and See Hammer LOT 192',choices,{selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false});
 assert.deepEqual(runDecision({obs,promptValue:p}).decision,{kind:'select-choices',tokens:['bench']});
});
test('Wait and See Hammer abstains when duplicate printings make target attribution ambiguous',()=>{
 const bolt=pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']});
 const first=pokemon({printing:ADP,subtypes:['Basic','TAG TEAM','GX'],energies:[DDE]});
 const second=pokemon({printing:ADP,subtypes:['Basic','TAG TEAM','GX'],energies:[LIGHTNING]});
 const obs=observation({ownActive:bolt,opponentActive:first,opponentBench:[second,null,null,null,null],decisionKind:'owner-prompt',promptType:'ChoosePokemonPrompt'});
 const choices=[pokemonChoice('active',first,'opponent','active'),pokemonChoice('bench',second,'opponent','bench')];
 const p=prompt(0,'ChoosePokemonPrompt','Wait and See Hammer','Wait and See Hammer LOT 192',choices,{selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false});
 assert.deepEqual(runDecision({obs,promptValue:p}).decision,{kind:'abstain',reasonCode:'NO_VISIBLE_OPPONENT_ENERGY_TARGET'});
});
test('Wait and See Hammer discards visible Double Dragon Energy before Basic Energy',()=>{
 const obs=observation({ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),decisionKind:'owner-prompt',promptType:'ChooseCardsPrompt'});
 const choices=[cardChoice('basic',LIGHTNING,{sourceZone:'play',ownerSeat:'opponent'}),cardChoice('dde',DDE,{sourceZone:'play',ownerSeat:'opponent'})];
 const p=prompt(0,'ChooseCardsPrompt','Wait and See Hammer','Wait and See Hammer LOT 192',choices,{selectionType:'card-combination',minimumCount:1,maximumCount:1,allowCancel:false,sourceZone:'play',ownerSeat:'opponent',isOwnerVisible:true});
 assert.deepEqual(runDecision({obs,promptValue:p}).decision,{kind:'select-choices',tokens:['dde']});
});
test('Moltres Direflame Wings chooses visible Basic Darkness Energy from discard',()=>{
 const obs=observation({ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),ownBench:[pokemon({printing:MOLTRES,subtypes:['Basic','V']}),null,null,null,null],ownDiscard:[DARKNESS],decisionKind:'owner-prompt',promptType:'ChooseCardsPrompt'});
 const choices=[cardChoice('lightning',LIGHTNING,{sourceZone:'discard',ownerSeat:'actor'}),cardChoice('darkness',DARKNESS,{sourceZone:'discard',ownerSeat:'actor'}),emptyChoice('empty')];
 const p=prompt(0,'ChooseCardsPrompt','Direflame Wings',MOLTRES,choices,{selectionType:'card-combination',minimumCount:0,maximumCount:1,allowCancel:false,sourceZone:'discard',ownerSeat:'actor',isOwnerVisible:true});
 assert.deepEqual(runDecision({obs,promptValue:p}).decision,{kind:'select-choices',tokens:['darkness']});
});
test('Squawk and Seize is not suppressed by global turn numbering for the second player',()=>{
 const obs=observation({turn:2,ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),ownHand:['Quick Ball FST 237','VS Seeker PHF 109']});
 const result=runDecision({obs,items:[action('squawk','use-ability',{publicMetadata:{abilityName:'Squawk and Seize'}}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'squawk'});
});
test('Carmine remains usable on the second player first turn when legally offered',()=>{
 const obs=observation({turn:2,ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']}),ownHand:['Carmine TWM 145','Quick Ball FST 237']});
 const result=runDecision({obs,items:[action('carmine','play-card',{actorPrinting:'Carmine TWM 145'}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'carmine'});
});
test('Guzma selects a low-HP two-Prize target from the opponent Bench',()=>{
 const bolt=pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']});
 const clefairy=pokemon({printing:"Lillie's Clefairy ex JTG 56",hp:190,damage:100,subtypes:['Basic','ex'],types:['Psychic']});
 const shadow=pokemon({printing:'Shadow Rider Calyrex VMAX CRE 75',hp:320,subtypes:['VMAX'],types:['Psychic']});
 const obs=observation({ownActive:bolt,opponentActive:shadow,opponentBench:[clefairy,null,null,null,null],decisionKind:'owner-prompt',promptType:'ChoosePokemonPrompt'});
 const p=prompt(0,'ChoosePokemonPrompt','Guzma','Guzma BUS 115',[pokemonChoice('clefairy',clefairy,'opponent')],{selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false,targetZone:'bench'});
 assert.deepEqual(runDecision({obs,promptValue:p}).decision,{kind:'select-choices',tokens:['clefairy']});
});
test('Quick Ball discard protects Double Dragon Energy and singleton Supporters',()=>{
 const obs=observation({ownHand:[DDE,"Professor Sada's Vitality PAR 170",LIGHTNING,FIGHTING],decisionKind:'owner-prompt',promptType:'ChooseCardsPrompt'});
 const choices=[cardChoice('dde',DDE,{sourceZone:'hand'}),cardChoice('sada',"Professor Sada's Vitality PAR 170",{sourceZone:'hand'}),cardChoice('lightning',LIGHTNING,{sourceZone:'hand'}),cardChoice('fighting',FIGHTING,{sourceZone:'hand'})];
 const p=prompt(0,'ChooseCardsPrompt','Quick Ball','Quick Ball FST 237',choices,{selectionType:'card-combination',minimumCount:1,maximumCount:1,allowCancel:false,sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true});
 const result=runDecision({obs,promptValue:p});
 assert.equal(result.decision.kind,'select-choices');assert.equal(result.decision.tokens.length,1);
 assert.notEqual(result.decision.tokens[0],'dde');assert.notEqual(result.decision.tokens[0],'sada');
});
test('Hisuian Heavy Ball does not guess hidden prize identities',()=>{
 const obs=observation({decisionKind:'owner-prompt',promptType:'ChoosePrizePrompt'});
 const choices=[{token:'p1',kind:'prize',label:'Prize 1',publicMetadata:{selectionIndex:0,selectedCount:1,ownerSeat:'actor',isOwnerVisible:false}},{token:'p2',kind:'prize',label:'Prize 2',publicMetadata:{selectionIndex:1,selectedCount:1,ownerSeat:'actor',isOwnerVisible:false}}];
 const p=prompt(0,'ChoosePrizePrompt','Hisuian Heavy Ball','Hisuian Heavy Ball ASR 146',choices,{selectionType:'prize-slots',requiredCount:1,allowCancel:false});
 assert.deepEqual(runDecision({obs,promptValue:p}).decision,{kind:'abstain',reasonCode:'NO_VISIBLE_BASIC_POKEMON_PRIZE'});
});
test('unknown prompt families fail closed',()=>{
 const obs=observation({decisionKind:'owner-prompt',promptType:'PutDamagePrompt'});
 const p=prompt(0,'PutDamagePrompt','unknown effect','unknown printing',[],{});
 assert.deepEqual(runDecision({obs,promptValue:p}).decision,{kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'});
});
test('analysis-only projected attacks cannot be selected',()=>{
 const result=runDecision({obs:observation(),items:[action('analysis','projected-attack',{attackName:'Bellowing Thunder'}),action('pass','pass')]});
 assert.deepEqual(result.decision,{kind:'select-action',token:'pass'});
});
test('protocol rejects forbidden policy seed fields before policy execution',()=>{
 const initMessage=init();protocol.validateInit(initMessage);const obs=observation();
 const request={schema:protocol.REQUEST_SCHEMA,type:'decision',requestId:'forbidden-seed',sequence:1,role:'opponent',seat:0,observationSchema:protocol.OBSERVATION_SCHEMA,observation:obs,prompt:null,publicEventReceipt:null,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[action('pass','pass',{publicMetadata:{seed:1}})]}};
 assert.throws(()=>protocol.validateRequest(request,initMessage,1,new Set()));
});
test('seat mismatch abstains without inventing a token',()=>{
 const obs=observation({seat:0});
 const policy=policyModule.createPolicy({role:'opponent',seat:1,policyVersion:POLICY_VERSION,config:{}});
 const request={role:'opponent',seat:0,observation:obs,actionFrontier:{items:[action('pass','pass')]},prompt:null};
 assert.deepEqual(policy.decide(request),{kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'});
});
test('repeated identical requests produce identical decisions',()=>{
 const obs=observation({ownActive:pokemon({printing:RAGING,subtypes:['Basic','ex','Ancient']})});
 const items=[action('vip','play-card',{actorPrinting:'Battle VIP Pass FST 225'}),action('pass','pass')];
 assert.deepEqual(runDecision({obs,items}).decision,runDecision({obs,items}).decision);
});
