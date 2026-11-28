// Strict actor protocol rank-2 v2 integration; NOT native Store, games or win-rate evidence.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  POLICY_VERSION,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');

const policy = createPolicy({
  role: 'opponent',
  seat: 0,
  policyVersion: POLICY_VERSION,
  config: {}
});

const init = {
  schema: protocol.INIT_SCHEMA,
  type: 'init',
  role: 'opponent',
  seat: 0,
  policyVersion: POLICY_VERSION,
  bundleSha256: 'a'.repeat(64),
  config: {}
};

function restrictions() {
  return {
    cannotAttackNextTurn: false,
    cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null,
    blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null,
    attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0,
    cannotRetreat: false,
    cannotRetreatNextTurn: false,
    cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
  };
}

function publicRestrictions() {
  return {
    gxUsed: false,
    vstarUsed: false,
    attackLockTurnsRemaining: 0,
    attackMaxEnergy: null,
    attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [],
    ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false,
    pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false,
    itemPlayLocked: false,
    supporterPlayLocked: false,
    stadiumPlayLocked: false,
    toolPlayLocked: false,
    energyPlayLocked: false,
    specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: null
  };
}

function pokemon(printing, options = {}) {
  const abilities = options.abilities ?? [];
  return {
    printing,
    name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? 150,
    damage: options.damage ?? 0,
    lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: {
      stage: options.stage ?? 'BASIC',
      subtypes: options.subtypes ?? ['Basic'],
      types: options.types ?? ['Colorless'],
      retreatCost: options.retreatCost ?? [],
      weakness: options.weakness ?? [],
      resistance: options.resistance ?? []
    },
    specialConditions: [],
    publicRestrictions: restrictions(),
    evolutionPrintings: options.evolutionPrintings ?? [],
    energies: options.energies ?? [],
    tools: options.tools ?? [],
    attacks: options.attacks ?? [],
    abilities,
    abilityDetails: abilities.map(name => ({
      name,
      powerType: 'ABILITY',
      text: 'Once during your turn.'
    })),
    abilitySuppressions: abilities.map(name => ({ abilityName: name, suppressed: false, reasonCode: null, sourcePrinting: null }))
  };
}

function player(options = {}) {
  const bench = (options.bench ?? []).slice(0, 5);
  while (bench.length < 5) bench.push(null);
  return {
    active: options.active ?? null,
    bench,
    stadium: options.stadium ?? [],
    discard: options.discard ?? [],
    lostZone: [],
    resolvingSupporter: [],
    publicHand: options.publicHand ?? null,
    prizeSlots: [],
    publicTurnRestrictions: {
      ...publicRestrictions(),
      ...(options.publicTurnRestrictions ?? {})
    },
    handCount: options.handCount ?? 0,
    deckCount: options.deckCount ?? 30,
    prizeCount: options.prizeCount ?? 6
  };
}

function turnResources() {
  return {
    supporterPlayedTurn: 0,
    retreatedTurn: 0,
    extraTurnActive: false,
    energyPlayedTurn: false,
    stadiumPlayedTurn: false,
    stadiumUsedTurn: false,
    vstarUsed: false,
    pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false,
    itemPlayLocked: false,
    supporterPlayLocked: false,
    stadiumPlayLocked: false,
    toolPlayLocked: false,
    energyPlayLocked: false,
    specialEnergyPlayLocked: false
  };
}

function observation(options = {}) {
  return {
    actorSeat: 0,
    globalTurn: options.globalTurn ?? 3,
    phase: options.phase ?? 2,
    decisionKind: options.prompt ? 'owner-prompt' : 'owner-root',
    pendingPromptType: options.prompt?.promptType ?? null,
    pendingOwnerDeckSearch: false,
    ownHand: options.ownHand ?? [],
    ownPublic: options.ownPublic ?? player(),
    opponentPublic: options.opponentPublic ?? player(),
    ownTurnResources: options.ownTurnResources ?? turnResources(),
    ownerK1: options.ownerK1 ?? null
  };
}

function rootRequest(options = {}) {
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent10-root-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat: 0,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation(options),
    prompt: null,
    publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: options.items ?? [{ token: 'pass', kind: 'pass', label: 'Pass turn' }]
    }
  };
}

function actorChoiceSource(sourcePrinting, effectName) {
  return {
    classification: 'actor-choice',
    sourceKind: sourcePrinting === null ? 'engine' : 'card-effect',
    sourcePrinting,
    effectName
  };
}

function promptRequest(options = {}) {
  const prompt = {
    schema: protocol.PROMPT_SCHEMA,
    actingSeat: 0,
    promptType: options.promptType,
    description: options.description ?? 'Choose a legal option',
    source: options.source,
    choices: options.choices ?? [],
    // Fill native actor selection metadata missing in older test fixtures.
    publicMetadata: options.publicMetadata ?? (
      options.promptType==='ChooseCardsPrompt' ?
        {selectionType:'card-combination',minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ChoosePokemonPrompt' ?
        {selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ChooseEnergyPrompt' ?
        {selectionType:'energy-payment',energyCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ChooseAttackPrompt' ?
        {selectionType:'attack',allowCancel:false} :
      options.promptType==='ChoosePrizePrompt' ?
        {selectionType:'prize-slots',minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false} :
      options.promptType==='ConfirmPrompt' ?
        {selectionType:'confirm',allowCancel:false} :
      {selectionType:'option',allowCancel:false})
  };
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: options.requestId ?? 'agent10-prompt-1',
    sequence: options.sequence ?? 1,
    role: 'opponent',
    seat: 0,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({
      ...(options.observation ?? {}),
      prompt
    }),
    prompt,
    publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: []
    }
  };
}

function checkedDecision(request) {
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  const decision = policy.decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}

function cardChoice(token, printing, zone = 'deck', owner = 'actor') {
  return {
    token,
    kind: 'card',
    printing,
    label: printing,
    publicMetadata: { sourceZone: zone, ownerSeat: owner }
  };
}

function pokemonChoice(token, printing, owner = 'actor', zone = 'bench', index = 0) {
  return {
    token,
    kind: 'pokemon',
    printing,
    label: printing,
    publicMetadata: {
      selectionIndex: index,
      selectedCount: 0,
      selectionType: 'pokemon',
      ownerSeat: owner,
      targetZone: zone,
      ...(zone === 'bench' ? { benchIndex: index } : { slotIndex: index }),
      isOwnerVisible: true
    }
  };
}


test('pinned Grand Tree root wins over Artazon and identifies legal Oddish target', () => {
  const older=pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1});
  const own=player({active:pokemon('Bunnelby PRC 121'),bench:[older]});
  const root=rootRequest({globalTurn:3,ownPublic:own,items:[
    {token:'pass',kind:'pass',label:'Pass turn'},
    {token:'artazon',kind:'use-stadium',actorPrinting:'Artazon PAL 171'},
    {token:'tree',kind:'use-stadium',actorPrinting:'Grand Tree SCR 136'}
  ]});
  assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'tree'});
  const request=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[pokemonChoice('odd','Oddish UNB 5','actor','bench',0)],
    observation:{globalTurn:3,ownPublic:own},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['odd']});
});
test('pinned Grand Tree first deck search chooses actual Gloom stage', () => {
  const request=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[cardChoice('herdier','Herdier SUM 104'),
      cardChoice('gloom','Gloom UNB 7'),
      {token:'cancel',kind:'cancel',label:'Cancel selection'}],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,
      maximumCount:1,allowCancel:true,isSecret:false}});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['gloom']});
});
test('pinned Grand Tree second deck search prioritizes AOR Item lock over GX', () => {
  const request=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[cardChoice('gx','Vileplume-GX CEC 4'),
      cardChoice('item','Vileplume AOR 3'),
      {token:'cancel',kind:'cancel',label:'Cancel selection'}],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Gloom UNB 7',{stage:'STAGE1',lastPlayedOrEvolvedTurn:3,
        evolutionPrintings:['Oddish UNB 5']})]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,
      maximumCount:1,allowCancel:true,isSecret:false}});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['item']});
});
test('pinned Grand Tree empty optional Stage2 search uses native cancellation', () => {
  const request=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[cardChoice('wrong','Herdier SUM 104'),
      {token:'cancel',kind:'cancel',label:'Cancel selection'}],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Gloom UNB 7',{stage:'STAGE1',
        evolutionPrintings:['Oddish UNB 5']})]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:1,
      maximumCount:1,allowCancel:true,isSecret:false}});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choice',token:'cancel'});
});

test('Counter Gain root is accepted without pretarget on behind-Prize Bunnelby', () => {
  const own=player({active:pokemon('Bunnelby PRC 121',{energies:[]}),
    bench:[pokemon('Bunnelby PRC 121',{energies:[]})],prizeCount:6});
  const req=rootRequest({ownHand:['Counter Gain SSP 169'],ownPublic:own,
    opponentPublic:player({prizeCount:4}),items:[
      {token:'counter',kind:'play-card',actorPrinting:'Counter Gain SSP 169',
        publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}
    ]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'counter'});
});
test('Counter Gain targets physical eligible Active over same-printing Bench', () => {
  const own=player({active:pokemon('Bunnelby PRC 121',{energies:[]}),
    bench:[pokemon('Bunnelby PRC 121',{energies:[],tools:['Stealthy Hood UNB 186']})],
    prizeCount:6});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Counter Gain SSP 169','Counter Gain'),
    choices:[pokemonChoice('bad','Bunnelby PRC 121','actor','bench',0),
      pokemonChoice('good','Bunnelby PRC 121','actor','active',0)],
    observation:{ownPublic:own,opponentPublic:player({prizeCount:4})},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['good']});
});
test('Counter Gain declines when ahead on Prizes and Budew attack costs zero', () => {
  const counter=(active,ownPrize,oppPrize)=>rootRequest({
    ownHand:['Counter Gain SSP 169'],
    ownPublic:player({active:pokemon(active),prizeCount:ownPrize}),
    opponentPublic:player({prizeCount:oppPrize}),
    items:[{token:'gain',kind:'play-card',actorPrinting:'Counter Gain SSP 169',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(counter('Bunnelby PRC 121',2,5)),
    {kind:'select-action',token:'pass'});
  assert.deepEqual(checkedDecision(counter('Budew ASC 16',6,4)),
    {kind:'select-action',token:'pass'});
});
test('Counter Gain does not attach onto equipped Active if only Bench Bunnelby is free', () => {
  const own=player({active:pokemon('Bunnelby PRC 121',{
    tools:['Technical Machine: Evolution PAR 178']}),
    bench:[pokemon('Bunnelby PRC 121')],prizeCount:6});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Counter Gain SSP 169','Counter Gain'),
    choices:[pokemonChoice('bad','Bunnelby PRC 121','actor','active',0),
      pokemonChoice('free','Bunnelby PRC 121','actor','bench',0)],
    observation:{ownPublic:own,opponentPublic:player({prizeCount:4})},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['free']});
});
