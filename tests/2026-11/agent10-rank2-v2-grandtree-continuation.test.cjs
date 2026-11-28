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

// Reused exact Actor49-protocol setup envelopes from tested rank-2 v1 branch.
function engineRequest(promptType,description,choices,publicMetadata,overrides={}){
  return promptRequest({promptType,description,source:actorChoiceSource(null,description),
    choices,publicMetadata,observation:{phase:1,...overrides}});
}
function setupCard(token,printing,index){
  return {token,kind:'card',printing,label:printing,publicMetadata:{
    selectionIndex:index,selectedCount:1,sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true}};
}
test('rank2 reorders starting Basic to lead Bunnelby and reserves a Bench slot',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('fan','Fan Rotom SCR 118',0),
    setupCard('odd','Oddish UNB 5',1),
    setupCard('odd2','Oddish UNB 5',2),
    setupCard('pidgey','Pidgey MEW 16',3),
    setupCard('lillipup','Lillipup CEC 174',4),
    setupCard('relicanth','Relicanth TEF 84',5),
    setupCard('bunnelby','Bunnelby PRC 121',6)
  ],{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true,isSecret:false,allowCancel:false,
    minimumCount:1,maximumCount:6});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['bunnelby','odd','lillipup','pidgey','fan']});
});
test('rank2 opponent mulligan bonus uses min0 Bench-only placement, no new Active',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('newB','Bunnelby PRC 121',0),
    setupCard('newOdd','Oddish UNB 5',1),
    {token:'empty',kind:'empty-selection',label:'Choose no items'}],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:0,maximumCount:2},{
      ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[]})});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choices',tokens:['newOdd']});
});
test('rank2 mulligan extra setup declines when all five Bench slots occupied',()=>{
  const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('pidgey','Pidgey MEW 16',0),
    {token:'empty',kind:'empty-selection',label:'Choose no items'}],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:0,maximumCount:1},{
      ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[
        pokemon('Oddish UNB 5'),pokemon('Lillipup CEC 174'),
        pokemon('Fan Rotom SCR 118'),pokemon('Budew ASC 16'),
        pokemon('Girafarig LOT 94')]})});
  assert.deepEqual(checkedDecision(request),{
    kind:'select-choice',token:'empty'});
});

test('rank2 chooses Bunnelby when Hala can pay 2 and fetch TM plus Jet',()=>{
  const hand=['Budew ASC 16','Bunnelby PRC 121','Oddish UNB 5',
    'Guzma & Hala CEC 193','Tag Call CEC 206','Artazon PAL 171',
    'Pidgeotto TEU 123'];
  const req=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('budew','Budew ASC 16',0),setupCard('b','Bunnelby PRC 121',1),
    setupCard('odd','Oddish UNB 5',2)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6},{ownHand:hand});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['b','odd']});
});
test('rank2 chooses Bunnelby for Tag Call to Hala with two discards',()=>{
  const hand=['Budew ASC 16','Bunnelby PRC 121','Lillipup CEC 174',
    'Tag Call CEC 206','Artazon PAL 171','Counter Gain SSP 169',
    'Plumeria BUS 120'];
  const req=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('budew','Budew ASC 16',0),setupCard('b','Bunnelby PRC 121',1),
    setupCard('l','Lillipup CEC 174',2)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6},{ownHand:hand});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['b','l']});
});
test('rank2 keeps Budew if Hala payment would burn protected lock',()=>{
  const hand=['Budew ASC 16','Bunnelby PRC 121','Oddish UNB 5',
    'Guzma & Hala CEC 193','Vileplume AOR 3','Stoutland BCR 122',
    'Guzma BUS 115'];
  const req=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',[
    setupCard('b','Bunnelby PRC 121',0),setupCard('budew','Budew ASC 16',1),
    setupCard('odd','Oddish UNB 5',2)],
    {selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',
      isOwnerVisible:true,isSecret:false,allowCancel:false,
      minimumCount:1,maximumCount:6},{ownHand:hand});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['budew','odd','b']});
});

test('rank2 chooses to go second for Barrage Evolution opportunity',()=>{
  const request=engineRequest('ConfirmPrompt','GO_FIRST',
    [{token:'yes',kind:'confirm',label:'Yes'},{token:'no',kind:'confirm',label:'No'}],
    {selectionType:'confirm'});
  assert.deepEqual(checkedDecision(request),{kind:'select-choice',token:'no'});
});
test('rank2 takes largest native optional opponent mulligan draw',()=>{
  const request=engineRequest('SelectPrompt','WANT_TO_DRAW_CARDS',[
    {token:'one',kind:'option',label:'Draw 1 card(s)',publicMetadata:{choiceIndex:1}},
    {token:'two',kind:'option',label:'Draw 2 card(s)',publicMetadata:{choiceIndex:0}},
    {token:'zero',kind:'option',label:'Draw 0 card(s)',publicMetadata:{choiceIndex:2}}],
    {selectionType:'option',count:3,allowCancel:false});
  assert.deepEqual(checkedDecision(request),{kind:'select-choice',token:'two'});
});

// Certified owner K1 exact deck vs Prizes; actor-only boundary.
test('rank2 refuses Guzma & Hala Stadium-only search when K1 confirms Grand Tree Prized',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121'),
    bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]});
  const req=rootRequest({ownHand:['Guzma & Hala CEC 193'],ownPublic:own,
    ownerK1:{epoch:1,exactMembershipKnown:true,invalidationReason:null,
      knownPrintings:[
        {printing:'Gloom UNB 7',copies:2},
        {printing:'Vileplume AOR 3',copies:2},
        {printing:'Grand Tree SCR 136',copies:0},
        {printing:'Artazon PAL 171',copies:0}]},
    items:[{token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'pass'});
});
test('rank2 still uses Guzma & Hala when same K1 knowledge confirms Grand Tree in deck',()=>{
  const req=rootRequest({ownHand:['Guzma & Hala CEC 193'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]}),
    ownerK1:{epoch:1,exactMembershipKnown:true,invalidationReason:null,
      knownPrintings:[{printing:'Gloom UNB 7',copies:1},
        {printing:'Vileplume AOR 3',copies:1},
        {printing:'Grand Tree SCR 136',copies:1}]},
    items:[{token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'hala'});
});
test('rank2 treats invalidated K1 as uncertain K0, not a false zero deck',()=>{
  const req=rootRequest({ownHand:['Guzma & Hala CEC 193'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]}),
    ownerK1:{epoch:2,exactMembershipKnown:false,
      invalidationReason:'owner deck was shuffled since first search',
      knownPrintings:null},
    items:[{token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
      publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'hala'});
});


test('pinned TM Evolution selects up to two valid distinct Bench evolution targets',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121'),bench:[
    pokemon('Oddish UNB 5'),pokemon('Lillipup CEC 174')]});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Technical Machine: Evolution PAR 178','Evolution'),
    choices:[pokemonChoice('l','Lillipup CEC 174','actor','bench',1),
      pokemonChoice('o','Oddish UNB 5','actor','bench',0)],
    observation:{ownPublic:own},publicMetadata:{
      selectionType:'pokemon',minimumCount:1,maximumCount:2,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['o','l']});
});
test('pinned TM Evolution first deck search selects Gloom and skips irrelevant Herdier',()=>{
  const req=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Technical Machine: Evolution PAR 178','Evolution'),
    choices:[cardChoice('wrong','Herdier SUM 104'),cardChoice('stage','Gloom UNB 7'),
      {token:'empty',kind:'empty-selection',label:'Choose no items'}],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5')]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['stage']});
});
test('pinned TM Evolution second deck search can evolve Lillipup to Herdier',()=>{
  const req=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Technical Machine: Evolution PAR 178','Evolution'),
    choices:[cardChoice('wrong','Gloom UNB 7'),cardChoice('stage','Herdier SUM 104'),
      {token:'empty',kind:'empty-selection',label:'Choose no items'}],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Lillipup CEC 174')]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choices',tokens:['stage']});
});
test('pinned TM Evolution missing Stage1 completes via native min-zero empty selection',()=>{
  const req=promptRequest({promptType:'ChooseCardsPrompt',
    source:actorChoiceSource('Technical Machine: Evolution PAR 178','Evolution'),
    choices:[cardChoice('wrong','Herdier SUM 104'),
      {token:'empty',kind:'empty-selection',label:'Choose no items'}],
    observation:{ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Oddish UNB 5')]})},
    publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-choice',token:'empty'});
});

test('Guzma & Hala mode-one now funds Active Bunnelby with TM held, Jet missing',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121',{energies:[]}),
    bench:[pokemon('Oddish UNB 5')],prizeCount:6});
  const req=rootRequest({ownHand:['Guzma & Hala CEC 193',
    'Technical Machine: Evolution PAR 178','Artazon PAL 171',
    'Pidgeotto TEU 123','Tag Call CEC 206'],
    ownPublic:own,items:[
      {token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
        publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'artazon',kind:'use-stadium',actorPrinting:'Artazon PAL 171'},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'hala'});
});
test('Guzma & Hala does not consume a Supporter solely to find redundant Jet',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121',{energies:[]}),
    bench:[pokemon('Oddish UNB 5')],prizeCount:6});
  const req=rootRequest({ownHand:['Guzma & Hala CEC 193',
    'Technical Machine: Evolution PAR 178','Capture Energy RCL 171',
    'Artazon PAL 171','Pidgeotto TEU 123'],
    ownPublic:own,items:[
      {token:'hala',kind:'play-card',actorPrinting:'Guzma & Hala CEC 193',
        publicMetadata:{cardType:'trainer',handIndex:0}},
      {token:'artazon',kind:'use-stadium',actorPrinting:'Artazon PAL 171'},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{kind:'select-action',token:'artazon'});
});

test('TM Evolution physical Tool root rejects Oddish and equips Active Bunnelby',()=>{
  const mk=(token,targetPrinting,targetZone,targetIndex)=>({
    token,kind:'play-card',actorPrinting:'Technical Machine: Evolution PAR 178',
    targetPrinting,publicMetadata:{cardType:'trainer',handIndex:0,
      targetSeat:'actor',targetZone,targetIndex,isOwnerVisible:true}});
  const req=rootRequest({ownHand:['Technical Machine: Evolution PAR 178'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),bench:[
      pokemon('Oddish UNB 5')]}),items:[
      mk('wrong','Oddish UNB 5','bench',0),
      mk('correct','Bunnelby PRC 121','active',0),
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-action',token:'correct'});
});
test('TM Evolution physical duplicate rejects equipped Active and chooses free Bench Bunnelby',()=>{
  const mk=(token,targetZone,targetIndex)=>({
    token,kind:'play-card',actorPrinting:'Technical Machine: Evolution PAR 178',
    targetPrinting:'Bunnelby PRC 121',publicMetadata:{
      cardType:'trainer',handIndex:0,targetSeat:'actor',
      targetZone,targetIndex,isOwnerVisible:true}});
  const req=rootRequest({ownHand:['Technical Machine: Evolution PAR 178',
    'Jet Energy PAL 190'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121',{
      tools:['Stealthy Hood UNB 186']}),
      bench:[pokemon('Bunnelby PRC 121'),pokemon('Oddish UNB 5')]}),
    items:[mk('occupied','active',0),mk('free','bench',0),
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-action',token:'free'});
});

test('connected source-print rank2 opening Hala -> TM -> Jet -> Evolution -> Gloom',()=>{
 const tm='Technical Machine: Evolution PAR 178',gh='Guzma & Hala CEC 193';
 const own=player({active:pokemon('Bunnelby PRC 121'),bench:[
   pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:2})]});
 const source=actorChoiceSource(gh,'Guzma & Hala');
 const action=(token,actorPrinting,type='trainer',more={})=>({
   token,kind:'play-card',actorPrinting,publicMetadata:{
     cardType:type,handIndex:0,...more}});
 const root=rootRequest({globalTurn:2,ownPublic:own,ownHand:[
   gh,'Tag Call CEC 206','Artazon PAL 171','Pidgeotto TEU 123',
   'Counter Gain SSP 169'],items:[action('gh',gh),
     action('tag','Tag Call CEC 206'),
     {token:'artazon',kind:'use-stadium',actorPrinting:'Artazon PAL 171'},
     {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(root),{kind:'select-action',token:'gh'});
 const afterSupporter=['Tag Call CEC 206','Artazon PAL 171',
   'Pidgeotto TEU 123','Counter Gain SSP 169'];
 const mode=promptRequest({promptType:'SelectOptionPrompt',source,choices:[
   {token:'0',kind:'option',label:'Search for a Stadium card from your deck',
     publicMetadata:{choiceIndex:0,selectionType:'option'}},
   {token:'1',kind:'option',label:'Discard 2 cards from your hand. Search for a Pokemon Tool and Special Energy from your deck',
     publicMetadata:{choiceIndex:1,selectionType:'option'}}],
   observation:{globalTurn:2,ownHand:afterSupporter,ownPublic:own},
   publicMetadata:{selectionType:'option',count:2,minimumCount:1,
     maximumCount:1,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(mode),{kind:'select-choice',token:'1'});
 const discard=promptRequest({promptType:'ChooseCardsPrompt',source,choices:[
   cardChoice('tag','Tag Call CEC 206','hand'),
   cardChoice('art','Artazon PAL 171','hand'),
   cardChoice('p','Pidgeotto TEU 123','hand'),
   cardChoice('c','Counter Gain SSP 169','hand')],
   observation:{globalTurn:2,ownHand:afterSupporter,ownPublic:own},
   publicMetadata:{selectionType:'card-combination',minimumCount:2,
     maximumCount:2,allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(discard),{
   kind:'select-choices',tokens:['tag','art']});
 const search=promptRequest({promptType:'ChooseCardsPrompt',source,choices:[
   cardChoice('tree','Grand Tree SCR 136'),cardChoice('tm',tm),
   cardChoice('jet','Jet Energy PAL 190'),
   cardChoice('hood','Stealthy Hood UNB 186'),
   {token:'empty',kind:'empty-selection',label:'Choose no items'}],
   observation:{globalTurn:2,ownHand:['Pidgeotto TEU 123','Counter Gain SSP 169'],
     ownPublic:own},publicMetadata:{selectionType:'card-combination',
       minimumCount:0,maximumCount:3,allowCancel:false,isSecret:false}});
 const searchDecision=checkedDecision(search);
 assert.deepEqual(searchDecision.kind,'select-choices');
 assert.deepEqual(searchDecision.tokens.slice().sort(),['tree','tm','jet'].sort());
 const tool=(token,targetPrinting,targetZone,targetIndex)=>({
   ...action(token,tm,'trainer',{targetSeat:'actor',targetZone,
     targetIndex,isOwnerVisible:true}),targetPrinting});
 const toolRoot=rootRequest({globalTurn:2,ownPublic:own,
   ownHand:[tm,'Jet Energy PAL 190','Grand Tree SCR 136'],items:[
   tool('wrong','Oddish UNB 5','bench',0),
   tool('active','Bunnelby PRC 121','active',0),
   {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(toolRoot),{
   kind:'select-action',token:'active'});
 const equipped=player({active:pokemon('Bunnelby PRC 121',{tools:[tm]}),
   bench:[pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:2})]});
 const jetRoot=rootRequest({globalTurn:2,ownPublic:equipped,
   ownHand:['Jet Energy PAL 190'],items:[
   {...action('jet','Jet Energy PAL 190','energy',{targetSeat:'actor',
     targetZone:'active',targetIndex:0,isOwnerVisible:true}),
     targetPrinting:'Bunnelby PRC 121'},
   {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(jetRoot),{kind:'select-action',token:'jet'});
 const charged=player({active:pokemon('Bunnelby PRC 121',{tools:[tm],
   energies:['Jet Energy PAL 190']}),bench:[
   pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:2})]});
 const attack=rootRequest({globalTurn:2,ownPublic:charged,items:[
   {token:'evolution',kind:'attack',attackName:'Evolution'},
   {token:'burrow',kind:'attack',attackName:'Burrow'},
   {token:'pass',kind:'pass',label:'Pass turn'}]});
 assert.deepEqual(checkedDecision(attack),{
   kind:'select-action',token:'evolution'});
 const target=promptRequest({promptType:'ChoosePokemonPrompt',
   source:actorChoiceSource(tm,'Evolution'),
   choices:[pokemonChoice('odd','Oddish UNB 5','actor','bench',0)],
   observation:{globalTurn:2,ownPublic:charged},publicMetadata:{
     selectionType:'pokemon',minimumCount:1,maximumCount:2,
     allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(target),{kind:'select-choices',tokens:['odd']});
 const stage=promptRequest({promptType:'ChooseCardsPrompt',
   source:actorChoiceSource(tm,'Evolution'),
   choices:[cardChoice('gloom','Gloom UNB 7'),
     {token:'empty',kind:'empty-selection',label:'Choose no items'}],
   observation:{globalTurn:2,ownPublic:charged},publicMetadata:{
     selectionType:'card-combination',minimumCount:0,maximumCount:1,
     allowCancel:false,isSecret:false}});
 assert.deepEqual(checkedDecision(stage),{
   kind:'select-choices',tokens:['gloom']});
});

test('native Counter Gain targeted root rejects wrong physical Active while free Bench duplicate exists',()=>{
  const mk=(token,zone,index)=>({token,kind:'play-card',
    actorPrinting:'Counter Gain SSP 169',targetPrinting:'Bunnelby PRC 121',
    publicMetadata:{cardType:'trainer',handIndex:0,targetSeat:'actor',
      targetZone:zone,targetIndex:index,isOwnerVisible:true}});
  const req=rootRequest({ownHand:['Counter Gain SSP 169'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121',{
      tools:['Stealthy Hood UNB 186']}),
      bench:[pokemon('Bunnelby PRC 121')],prizeCount:6}),
    opponentPublic:player({prizeCount:4}),items:[
      mk('occupied','active',0),mk('free','bench',0),
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-action',token:'free'});
});
test('native Counter Gain targeted root rejects Budew and prefers viable Active Bunnelby',()=>{
  const mk=(token,printing,zone,index)=>({
    token,kind:'play-card',actorPrinting:'Counter Gain SSP 169',
    targetPrinting:printing,publicMetadata:{cardType:'trainer',
      handIndex:0,targetSeat:'actor',targetZone:zone,
      targetIndex:index,isOwnerVisible:true}});
  const req=rootRequest({ownHand:['Counter Gain SSP 169'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),
      bench:[pokemon('Budew ASC 16')],prizeCount:6}),
    opponentPublic:player({prizeCount:4}),items:[
      mk('budew','Budew ASC 16','bench',0),
      mk('bunny','Bunnelby PRC 121','active',0),
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-action',token:'bunny'});
});
test('native targeted Counter Gain action does not select an opponent Bench target',()=>{
  const req=rootRequest({ownHand:['Counter Gain SSP 169'],
    ownPublic:player({active:pokemon('Bunnelby PRC 121'),prizeCount:6}),
    opponentPublic:player({prizeCount:4,bench:[pokemon('Bunnelby PRC 121')]}),
    items:[
      {token:'wrong',kind:'play-card',actorPrinting:'Counter Gain SSP 169',
        targetPrinting:'Bunnelby PRC 121',publicMetadata:{
          cardType:'trainer',handIndex:0,targetSeat:'opponent',
          targetZone:'bench',targetIndex:0,isOwnerVisible:true}},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
  assert.deepEqual(checkedDecision(req),{
    kind:'select-action',token:'pass'});
});


test('Guzma physical duplicate chooses the damaged Bench copy, not first same-print copy',()=>{
  const duplicate='Shadow Rider Calyrex VMAX CRE 75';
  const opp=player({active:pokemon('Budew ASC 16'),bench:[
    pokemon(duplicate,{hp:320,damage:0}),
    pokemon(duplicate,{hp:320,damage:270})]});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Guzma BUS 115','Guzma'),
    choices:[pokemonChoice('healthy',duplicate,'opponent','bench',0),
      pokemonChoice('lethal',duplicate,'opponent','bench',1)],
    observation:{opponentPublic:opp},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['lethal']});
});
test('Cassius physical duplicate chooses damaged own Bench copy',()=>{
  const duplicate='Bunnelby PRC 121';
  const own=player({active:pokemon('Budew ASC 16'),bench:[
    pokemon(duplicate,{hp:150,damage:0}),
    pokemon(duplicate,{hp:150,damage:120})]});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Cassius XY 115','Cassius'),
    choices:[pokemonChoice('healthy',duplicate,'actor','bench',0),
      pokemonChoice('injured',duplicate,'actor','bench',1)],
    observation:{ownPublic:own},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['injured']});
});
test('Grand Tree physical stage target refuses a newly placed duplicate',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121'),bench:[
    pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:3}),
    pokemon('Oddish UNB 5',{lastPlayedOrEvolvedTurn:1})]});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Grand Tree SCR 136','Grand Tree'),
    choices:[pokemonChoice('young','Oddish UNB 5','actor','bench',0),
      pokemonChoice('older','Oddish UNB 5','actor','bench',1)],
    observation:{globalTurn:3,ownPublic:own},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['older']});
});
test('TM Evolution physical target rejects a printing/slot mismatch even if high priority',()=>{
  const own=player({active:pokemon('Bunnelby PRC 121'),
    bench:[pokemon('Oddish UNB 5')]});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    source:actorChoiceSource('Technical Machine: Evolution PAR 178','Evolution'),
    choices:[pokemonChoice('mismatched','Gloom UNB 7','actor','bench',0),
      pokemonChoice('physical','Oddish UNB 5','actor','bench',0)],
    observation:{ownPublic:own},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['physical']});
});


test('Guzma second native prompt promotes own Stoutland over funded Bunnelby to reapply Sentinel',()=>{
  const own=player({active:pokemon('Budew ASC 16'),bench:[
    pokemon('Bunnelby PRC 121',{energies:['Jet Energy PAL 190']}),
    pokemon('Stoutland BCR 122',{stage:'STAGE2',
      evolutionPrintings:['Lillipup CEC 174','Herdier SUM 104']})]});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    description:'CHOOSE_NEW_ACTIVE_POKEMON',
    source:actorChoiceSource('Guzma BUS 115','Guzma'),
    choices:[pokemonChoice('bunny','Bunnelby PRC 121','actor','bench',0),
      pokemonChoice('stout','Stoutland BCR 122','actor','bench',1)],
    observation:{ownPublic:own},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['stout']});
});
test('Guzma second prompt avoids suppressed Stoutland and selects funded Bunnelby',()=>{
  const own=player({active:pokemon('Budew ASC 16'),bench:[
    pokemon('Stoutland BCR 122',{stage:'STAGE2'}),
    pokemon('Bunnelby PRC 121',{energies:['Jet Energy PAL 190']})]});
  const opp=player({active:pokemon('Garbodor BKP 57',{stage:'STAGE1',
    abilities:['Garbotoxin'],tools:['Float Stone PLF 99']})});
  const req=promptRequest({promptType:'ChoosePokemonPrompt',
    description:'CHOOSE_NEW_ACTIVE_POKEMON',
    source:actorChoiceSource('Guzma BUS 115','Guzma'),
    choices:[pokemonChoice('stout','Stoutland BCR 122','actor','bench',0),
      pokemonChoice('bunny','Bunnelby PRC 121','actor','bench',1)],
    observation:{ownPublic:own,opponentPublic:opp},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false}});
  assert.deepEqual(checkedDecision(req),{kind:'select-choices',tokens:['bunny']});
});
