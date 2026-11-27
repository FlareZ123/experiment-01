'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const policyModule = require('../../simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs');

const rr = Object.freeze({
  cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [],
  blockedAttackNameNextTurn: null, blockedAttackNameUntilLeavesActive: null,
  onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
  attackCostIncreaseWhileActive: 0, cannotRetreat: false,
  cannotRetreatNextTurn: false, cannotRetreatWhileActive: false,
  cannotEvolveNextTurn: false
});
const pr = Object.freeze({
  gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0,
  attackMaxEnergy: null, attackMaxEnergyTurnsRemaining: 0,
  ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
  cannotUseGXAttacks: false, pokemonPlayLocked: false,
  abilityPokemonPlayLocked: false, evolutionPlayLocked: false,
  itemPlayLocked: false, supporterPlayLocked: false, stadiumPlayLocked: false,
  toolPlayLocked: false, energyPlayLocked: false, specialEnergyPlayLocked: false,
  stadiumAndToolHaveNoEffectTurnsRemaining: null
});
function mon(printing = 'Iron Thorns ex TWM 77', options = {}) {
  const thorns = /^Iron Thorns ex/.test(printing);
  return {
    printing, name: printing, hp: options.hp ?? (thorns ? 230 : 200),
    damage: options.damage ?? 0, lastPlayedOrEvolvedTurn: 1,
    printed: {
      stage: 'BASIC', subtypes: thorns ? ['Basic', 'ex', 'Future'] : (options.subtypes ?? ['Basic']),
      types: thorns ? ['Lightning'] : (options.types ?? ['Colorless']),
      retreatCost: [], weakness: [], resistance: []
    },
    specialConditions: [], publicRestrictions: { ...rr }, evolutionPrintings: [],
    energies: options.energies ?? [], tools: options.tools ?? [],
    attacks: thorns ? [{
      name: 'Volt Cyclone', cost: ['Lightning', 'Colorless', 'Colorless'],
      damage: '140', damageCalculation: null,
      text: 'Move an Energy from this Pokémon to 1 of your Benched Pokémon.',
      gxAttack: false, barrage: false
    }] : [],
    abilities: thorns ? ['Initialization'] : [],
    abilityDetails: thorns ? [{ name: 'Initialization', powerType: 'ABILITY', text: 'lock' }] : [],
    abilitySuppressions: null
  };
}
function player(options = {}) {
  const bench = (options.bench ?? []).slice(); while (bench.length < 5) bench.push(null);
  return {
    active: options.active ?? null, bench, stadium: options.stadium ?? [],
    discard: options.discard ?? [], lostZone: [], resolvingSupporter: [], publicHand: null,
    prizeSlots: [0,1,2,3,4,5].map(index => ({ index })),
    publicTurnRestrictions: { ...pr }, handCount: options.handCount ?? 0,
    deckCount: options.deckCount ?? 20, prizeCount: options.prizeCount ?? 6
  };
}
function turnResources() {
  return {
    supporterPlayedTurn: 0, retreatedTurn: 0, extraTurnActive: false,
    energyPlayedTurn: false, stadiumPlayedTurn: false, stadiumUsedTurn: false,
    vstarUsed: false, pokemonPlayLocked: false, abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false, itemPlayLocked: false, supporterPlayLocked: false,
    stadiumPlayLocked: false, toolPlayLocked: false, energyPlayLocked: false,
    specialEnergyPlayLocked: false
  };
}
function observation({ prompt = null, hand = [], ownActive = mon(), ownBench = [],
  ownStadium = [], ownDiscard = [], ownPrizes = 6, opponentActive = null,
  opponentBench = [], opponentDeck = 20, opponentHand = 4, opponentPrizes = 6,
  ownerK1 = null } = {}) {
  return {
    actorSeat: 0, globalTurn: 5, phase: 2,
    decisionKind: prompt ? 'owner-prompt' : 'owner-root',
    pendingPromptType: prompt?.promptType ?? null, pendingOwnerDeckSearch: false,
    ownHand: hand,
    ownPublic: player({
      active: ownActive, bench: ownBench, stadium: ownStadium, discard: ownDiscard,
      handCount: hand.length, deckCount: 30, prizeCount: ownPrizes
    }),
    opponentPublic: player({
      active: opponentActive, bench: opponentBench,
      handCount: opponentHand, deckCount: opponentDeck, prizeCount: opponentPrizes
    }),
    ownTurnResources: turnResources(), ownerK1
  };
}
function receipt(view, attacks = []) {
  return {
    version: protocol.EVENT_RECEIPT_VERSION, actorSeat: 0, turn: view.globalTurn,
    ownerActive: {
      printing: view.ownPublic.active.printing,
      movedFromBenchToActiveThisTurn: null, knownAbilityUse: []
    },
    ownerBench: view.ownPublic.bench.map(p => p ? ({
      printing: p.printing, movedFromBenchToActiveThisTurn: null, knownAbilityUse: []
    }) : null),
    priorOpponentTurnKO: { any: false, byAttack: false },
    opponentLastTurnAttack: null, opponentLastTurnTurn: view.globalTurn - 1,
    opponentLastTurnAttacks: attacks
  };
}
const init = {
  schema: protocol.INIT_SCHEMA, type: 'init', role: 'opponent', seat: 0,
  policyVersion: policyModule.POLICY_VERSION, bundleSha256: 'a'.repeat(64), config: {}
};
const policy = policyModule.createPolicy({
  role: 'opponent', seat: 0, policyVersion: policyModule.POLICY_VERSION, config: {}
});
function runRoot(id, options, items, attacks = []) {
  const view = observation(options);
  const request = {
    schema: protocol.REQUEST_SCHEMA, type: 'decision', requestId: id, sequence: 1,
    role: 'opponent', seat: 0, observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: view, prompt: null, publicEventReceipt: receipt(view, attacks),
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items }
  };
  const validated = protocol.validateRequest(request, init, 1, new Set());
  const decision = policy.decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}
function runPrompt(id, prompt, options = {}) {
  const view = observation({ ...options, prompt });
  const request = {
    schema: protocol.REQUEST_SCHEMA, type: 'decision', requestId: id, sequence: 1,
    role: 'opponent', seat: 0, observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: view, prompt, publicEventReceipt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] }
  };
  const validated = protocol.validateRequest(request, init, 1, new Set());
  const decision = policy.decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}
function source(printing, effectName) {
  return { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: printing, effectName };
}

test('native play-card Energy projection is accepted and funded', () => {
  assert.deepEqual(runRoot('energy', {
    hand: ['Speed Lightning Energy RCL 173']
  }, [
    {
      token: 'speed', kind: 'play-card', actorPrinting: 'Speed Lightning Energy RCL 173',
      targetPrinting: 'Iron Thorns ex TWM 77',
      publicMetadata: { cardType: 'energy', handIndex: 0, targetSeat: 'actor', targetZone: 'active', isOwnerVisible: true }
    },
    { token: 'pass', kind: 'pass', label: 'Pass turn' }
  ]), { kind: 'select-action', token: 'speed' });
});

test('native use-stadium and retreat root kinds validate', () => {
  assert.deepEqual(runRoot('stadium', {
    hand: ['N FCO 105'], ownStadium: ["Player's Ceremony SP 127"]
  }, [
    {
      token: 'ceremony', kind: 'use-stadium', actorPrinting: "Player's Ceremony SP 127",
      publicMetadata: { stadiumEffectLive: true }
    },
    { token: 'pass', kind: 'pass', label: 'Pass turn' }
  ]), { kind: 'select-action', token: 'ceremony' });

  const funded = mon('Iron Thorns ex TWM 77', {
    energies: ['Speed Lightning Energy RCL 173', 'Double Colorless Energy SUM 136']
  });
  assert.deepEqual(runRoot('retreat', { ownBench: [funded] }, [
    {
      token: 'retreat0', kind: 'retreat', actorPrinting: 'Iron Thorns ex TWM 77',
      targetPrinting: 'Iron Thorns ex TWM 77',
      publicMetadata: {
        benchIndex: 0, targetSeat: 'actor', targetZone: 'bench',
        targetIndex: 0, isOwnerVisible: true
      }
    },
    { token: 'pass', kind: 'pass', label: 'Pass turn' }
  ]), { kind: 'select-action', token: 'retreat0' });
});

test('Shadow Rider terminal fallback beats Megaton using ordinary native attack metadata', () => {
  const target = mon('Shadow Rider Calyrex VMAX CRE 75', {
    hp: 320, damage: 190, subtypes: ['VMAX'],
    energies: ['Psychic Energy'], tools: ['Stealthy Hood UNB 186']
  });
  assert.deepEqual(runRoot('terminal', {
    ownPrizes: 3, opponentActive: target, hand: ['Megaton Blower SSP 182']
  }, [
    {
      token: 'meg', kind: 'play-card', actorPrinting: 'Megaton Blower SSP 182',
      publicMetadata: { cardType: 'trainer', handIndex: 0 }
    },
    {
      token: 'volt', kind: 'attack', actorPrinting: 'Iron Thorns ex TWM 77',
      attackName: 'Volt Cyclone',
      publicMetadata: {
        attackCostPayable: true,
        attackSource: {
          sourceKind: 'active-pokemon', sourceSlot: 'ACTIVE', sourceIndex: 0,
          sourceCardName: 'Iron Thorns ex', sourceCardFullName: 'Iron Thorns ex TWM 77',
          attackName: 'Volt Cyclone'
        }
      }
    },
    { token: 'pass', kind: 'pass', label: 'Pass turn' }
  ]), { kind: 'select-action', token: 'volt' });
});

test('ChoosePokemon and one-card ChooseCards use select-choices', () => {
  const choosePokemon = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: 0, promptType: 'ChoosePokemonPrompt',
    description: 'Choose Pokémon', source: source('Enhanced Hammer TWM 148', 'Enhanced Hammer'),
    choices: [{
      token: 'bench', kind: 'pokemon', printing: 'Target B', label: 'Target B',
      publicMetadata: {
        selectionIndex: 0, selectedCount: 0, selectionType: 'pokemon',
        ownerSeat: 'opponent', targetZone: 'bench', isOwnerVisible: true
      }
    }],
    publicMetadata: {
      selectionType: 'pokemon', minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false
    }
  };
  const d1 = runPrompt('pokemon', choosePokemon, {
    opponentBench: [mon('Target B', { energies: ['Double Colorless Energy SUM 136'] })]
  });
  assert.equal(d1.kind, 'select-choices');

  const chooseCard = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: 0, promptType: 'ChooseCardsPrompt',
    description: 'Choose Energy', source: source('Team Flare Grunt XY 129', 'Team Flare Grunt'),
    choices: [{
      token: 'dce', kind: 'card', printing: 'Double Colorless Energy SUM 136', label: 'DCE',
      publicMetadata: {
        ownerSeat: 'opponent', sourceZone: 'attached', targetZone: 'active', energyType: 'Special'
      }
    }],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 1, maximumCount: 1,
      allowCancel: false, isSecret: false
    }
  };
  assert.equal(runPrompt('one-card', chooseCard).kind, 'select-choices');
});

test('AttachEnergy is single-select and ChoosePrize is multi-select', () => {
  const attach = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: 0, promptType: 'AttachEnergyPrompt',
    description: 'Move Energy', source: source('Iron Thorns ex TWM 77', 'Volt Cyclone'),
    choices: [{
      token: 'speed', kind: 'energy', printing: 'Speed Lightning Energy RCL 173', label: 'Speed',
      publicMetadata: {
        ownerSeat: 'actor', sourceZone: 'active', targetZone: 'bench', benchIndex: 0, energyType: 'Special'
      }
    }],
    publicMetadata: { selectionType: 'energy-attachment', allowCancel: false, isSecret: false }
  };
  assert.equal(runPrompt('attach', attach, {
    ownBench: [mon('Iron Thorns ex TWM 77')]
  }).kind, 'select-choice');

  const prize = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: 0, promptType: 'ChoosePrizePrompt',
    description: 'Choose Prize', source: source('Gladion CIN 95', 'Gladion'),
    choices: [{
      token: 'p0', kind: 'prize', printing: 'Thunder Mountain ♢ LOT 191', label: 'Thunder Mountain',
      publicMetadata: { slotIndex: 0, ownerSeat: 'actor', isOwnerVisible: true }
    }],
    publicMetadata: { selectionType: 'prize-slots', requiredCount: 1, allowCancel: false, isSecret: false }
  };
  assert.equal(runPrompt('prize', prize).kind, 'select-choices');
});

test('min-zero card prompt carries and can select explicit empty token', () => {
  const prompt = {
    schema: protocol.PROMPT_SCHEMA, actingSeat: 0, promptType: 'ChooseCardsPrompt',
    description: 'You may discard cards',
    source: source('Bellelba & Brycen-Man CEC 186', 'Bellelba & Brycen-Man'),
    choices: [
      { token: 'empty', kind: 'empty-selection', label: 'Choose no cards' },
      {
        token: 'mail', kind: 'card', printing: "Trainers' Mail ROS 92", label: "Trainers' Mail",
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'hand' }
      }
    ],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 0, maximumCount: 3,
      allowCancel: false, isSecret: false
    }
  };
  assert.deepEqual(runPrompt('empty', prompt),
    { kind: 'select-choice', token: 'empty' });
});
