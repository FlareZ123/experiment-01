// Rank2 actual original source 60, no native Store/game or win-rate claim.
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


function engineRequest(promptType,description,choices,publicMetadata,overrides={}){
  return promptRequest({promptType,description,source:actorChoiceSource(null,description),
    choices,publicMetadata,observation:{phase:1,...overrides}});
}
function setupCard(token,printing,index){
  return {token,kind:'card',printing,label:printing,publicMetadata:{
    selectionIndex:index,selectedCount:1,sourceZone:'hand',ownerSeat:'actor',
    isOwnerVisible:true}};
}

const { decks } = require('../../results/aichi-2026/full-decklists.json');
const BASICS = new Set(['Pidgey','Oddish','Lillipup','Bunnelby','Fan Rotom',
  'Relicanth','Mr. Mime','Girafarig','Budew','Jirachi']);
const rank2 = decks.find(deck => deck.rank === 2);
assert.ok(rank2, 'rank 2 is missing from source Aichi field');
const printed = rank2.cards.flatMap(row => Array.from({length:row.count}, () => ({
  name: row.name,
  printing: row.name+' '+row.printing.set+' '+row.printing.number,
  basic: row.category === 'Pokémon' && BASICS.has(row.name)
})));
assert.equal(printed.length,60);
let rng=0xA10C2026;
function random32() {
  rng ^= rng<<13; rng ^= rng>>>17; rng ^= rng<<5; return rng>>>0;
}
const openingMeta = Object.freeze({selectionType:'card-combination',
  sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
  isSecret:false,allowCancel:false,minimumCount:1,maximumCount:6});

test('deterministic 5,000 original-rank2 seven-card openings remain valid actor choices',()=>{
  const count={deals:0,mulligans:0,valid:0,
    withBunnelby:0,bunnelbyLead:0,budewLeadWithBunnelby:0,
    reservedBench:0,maxBench:0,handWithSixBasics:0};
  for(let trial=0;trial<5000;trial++){
    const deck=printed.slice();
    // Exact, without-replacement uniformly indexed seven-card partial shuffle;
    // xorshift32 itself is deterministic and not a cryptographic generator.
    for(let i=0;i<7;i++){
      const j=i+random32()%(60-i);
      [deck[i],deck[j]]=[deck[j],deck[i]];
    }
    const hand=deck.slice(0,7);
    const available=hand.map((row,index)=>({...row,index}))
      .filter(row=>row.basic);
    count.deals++;
    if(!available.length){count.mulligans++;continue;}
    if(available.length>=6)count.handWithSixBasics++;
    const choices=available.map((row,index)=>
      setupCard('basic-'+index,row.printing,row.index));
    const max=Math.min(6,available.length);
    const request=engineRequest('ChooseCardsPrompt','CHOOSE_STARTING_POKEMONS',
      choices,{...openingMeta,maximumCount:max},
      {ownHand:hand.map(row=>row.printing)});
    const decision=checkedDecision(request);
    assert.equal(decision.kind,'select-choices',
      'original source opening could not be settled at seed '+trial);
    assert.ok(decision.tokens.length>=1&&decision.tokens.length<=max,
      'setup violates native min/max '+trial);
    assert.ok(new Set(decision.tokens).size===decision.tokens.length,
      'same native hand token selected twice '+trial);
    assert.ok(decision.tokens.length<=5,
      'starting Active+Bench overfills the reserved slot '+trial);
    count.valid++;
    const benchCount=decision.tokens.length-1;
    count.maxBench=Math.max(count.maxBench,benchCount);
    if(benchCount<=4)count.reservedBench++;
    const active=choices.find(choice=>choice.token===decision.tokens[0])?.printing;
    assert.ok(active,'no physical Active among selected source cards '+trial);
    if(hand.some(row=>row.name==='Bunnelby')){
      count.withBunnelby++;
      if(active==='Bunnelby PRC 121')count.bunnelbyLead++;
      else {
        // Under this v2 opening policy, with Bunnelby in hand, an unfunded
        // T1 Evolution may yield a deliberate zero-Energy Budew lock lead.
        assert.equal(active,'Budew ASC 16',
          'unexpected non-Bunnelby Active when source Bunnelby is held');
        count.budewLeadWithBunnelby++;
      }
    }
  }
  assert.equal(count.deals,5000);
  assert.equal(count.mulligans,680);
  assert.equal(count.valid,4320);
  assert.equal(count.withBunnelby,1116);
  assert.equal(count.bunnelbyLead,1012);
  assert.equal(count.budewLeadWithBunnelby,104);
  assert.equal(count.reservedBench,4320);
  assert.equal(count.maxBench,4);
  assert.equal(count.handWithSixBasics,0);
});
