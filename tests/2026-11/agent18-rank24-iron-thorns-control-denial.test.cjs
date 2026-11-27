'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs');

function mon(printing, { energies = [], tools = [], types = ['Colorless'] } = {}) {
  return { printing, energies, tools, printed: { types }, specialConditions: [] };
}
function observation(options = {}) {
  return {
    actorSeat: 0,
    ownHand: options.ownHand ?? [],
    ownPublic: {
      active: mon('Iron Thorns ex TWM 77', {
        energies: options.ownEnergies ?? [], types: ['Lightning']
      }),
      bench: [],
      stadium: options.ownStadium ?? [],
      discard: [],
      deckCount: 30,
      publicTurnRestrictions: {
        supporterPlayLocked: false, itemPlayLocked: false, energyPlayLocked: false,
        specialEnergyPlayLocked: false, stadiumPlayLocked: false, toolPlayLocked: false
      }
    },
    opponentPublic: {
      active: options.opponentActive ?? null,
      bench: options.opponentBench ?? [],
      stadium: options.opponentStadium ?? [],
      deckCount: 20, handCount: 4, prizeCount: 6
    },
    ownTurnResources: {
      supporterPlayedTurn: options.supporterPlayedTurn ?? 0,
      itemPlayLocked: false, energyPlayedTurn: false, energyPlayLocked: false,
      specialEnergyPlayLocked: false, stadiumPlayedTurn: false,
      stadiumPlayLocked: false, toolPlayLocked: false
    }
  };
}
function root(options = {}) {
  return {
    role: 'opponent', seat: 0, prompt: null,
    observation: observation(options),
    publicEventReceipt: { opponentLastTurnAttacks: [] },
    actionFrontier: { items: options.items ?? [] }
  };
}
function prompt({ sourcePrinting, promptType, choices, publicMetadata, observationOptions = {} }) {
  return {
    role: 'opponent', seat: 0,
    prompt: {
      promptType,
      source: { sourcePrinting, effectName: null },
      choices,
      publicMetadata
    },
    observation: observation(observationOptions),
    publicEventReceipt: null,
    actionFrontier: { items: [] }
  };
}
function pokemonChoice(token, zone, index = 0) {
  return {
    token, kind: 'pokemon', printing: 'Target ex ABC 1', label: 'Target',
    publicMetadata: {
      selectionIndex: index, selectedCount: 0, selectionType: 'pokemon',
      ownerSeat: 'opponent', targetZone: zone, isOwnerVisible: true
    }
  };
}
function energyChoice(token, printing, zone = 'active') {
  return {
    token, kind: 'energy', printing, label: printing,
    publicMetadata: {
      sourceZone: 'attached', targetZone: zone, ownerSeat: 'opponent',
      energyType: /Double Colorless/.test(printing) ? 'Special' : 'Basic'
    }
  };
}

const policy = createPolicy({
  role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {}
});
const pass = { token: 'pass', kind: 'pass' };
const megaton = { token: 'meg', kind: 'play-card', actorPrinting: 'Megaton Blower SSP 182' };
const enhanced = { token: 'enh', kind: 'play-card', actorPrinting: 'Enhanced Hammer TWM 148' };
const plumeria = { token: 'plume', kind: 'play-card', actorPrinting: 'Plumeria BUS 120' };
const flare = { token: 'flare', kind: 'play-card', actorPrinting: 'Team Flare Grunt XY 129' };
const faba = { token: 'faba', kind: 'play-card', actorPrinting: 'Faba LOT 173' };
const activeSpecial = mon('Target ex ABC 1', {
  energies: ['Double Colorless Energy SUM 136'],
  tools: ['Float Stone BKT 137']
});

test('Megaton Blower takes priority with visible opponent Special Energy or Tool', () => {
  assert.deepEqual(policy.decide(root({
    opponentActive: activeSpecial,
    items: [megaton, enhanced, pass]
  })), { kind: 'select-action', token: 'meg' });
});

test('Enhanced Hammer is selected when Special Energy is visible', () => {
  assert.deepEqual(policy.decide(root({
    opponentActive: activeSpecial,
    items: [enhanced, pass]
  })), { kind: 'select-action', token: 'enh' });
});

test('Plumeria starts only with two safe discard costs', () => {
  assert.deepEqual(policy.decide(root({
    ownHand: ['Plumeria BUS 120', "Player's Ceremony SP 127", 'Palace Book SMP NAN25'],
    opponentActive: activeSpecial,
    items: [plumeria, pass]
  })), { kind: 'select-action', token: 'plume' });

  assert.deepEqual(policy.decide(root({
    ownHand: ['Plumeria BUS 120', 'N FCO 105', 'Bellelba & Brycen-Man CEC 186'],
    opponentActive: activeSpecial,
    items: [plumeria, pass]
  })), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('Team Flare Grunt is selected against an energized Active', () => {
  assert.deepEqual(policy.decide(root({
    ownHand: ['Team Flare Grunt XY 129'],
    opponentActive: mon('Target ex ABC 1', { energies: ['Lightning Energy'] }),
    items: [flare, pass]
  })), { kind: 'select-action', token: 'flare' });
});

test('Faba is selected for a visible Tool when no higher control action exists', () => {
  assert.deepEqual(policy.decide(root({
    ownHand: ['Faba LOT 173'],
    opponentActive: mon('Target ex ABC 1', { tools: ['Float Stone BKT 137'] }),
    items: [faba, pass]
  })), { kind: 'select-action', token: 'faba' });
});

test('Enhanced Hammer chooses the opponent Pokemon with visible Special Energy', () => {
  const request = prompt({
    sourcePrinting: 'Enhanced Hammer TWM 148',
    promptType: 'ChoosePokemonPrompt',
    choices: [pokemonChoice('a', 'active'), pokemonChoice('b', 'bench', 0)],
    publicMetadata: {
      selectionType: 'pokemon', requiredCount: 1, allowCancel: false, isSecret: false
    },
    observationOptions: {
      opponentActive: mon('A', { energies: ['Lightning Energy'] }),
      opponentBench: [mon('B', { energies: ['Double Colorless Energy SUM 136'] })]
    }
  });
  assert.deepEqual(policy.decide(request), { kind: 'select-choices', tokens: ['b'] });
});

test('Enhanced Hammer energy prompt selects Special Energy', () => {
  const request = prompt({
    sourcePrinting: 'Enhanced Hammer TWM 148',
    promptType: 'ChooseCardsPrompt',
    choices: [energyChoice('dce', 'Double Colorless Energy SUM 136')],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 1, maximumCount: 1
    }
  });
  assert.deepEqual(policy.decide(request), { kind: 'select-choices', tokens: ['dce'] });
});

test('Team Flare prompt prefers Special Energy over Basic when both are legal', () => {
  const request = prompt({
    sourcePrinting: 'Team Flare Grunt XY 129',
    promptType: 'ChooseCardsPrompt',
    choices: [
      energyChoice('basic', 'Lightning Energy'),
      energyChoice('dce', 'Double Colorless Energy SUM 136')
    ],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 1, maximumCount: 1
    }
  });
  assert.deepEqual(policy.decide(request), { kind: 'select-choice', token: 'dce' });
});

test('Plumeria payment spends disposable cards and protects N', () => {
  const request = prompt({
    sourcePrinting: 'Plumeria BUS 120',
    promptType: 'ChooseCardsPrompt',
    choices: [
      {
        token: 'ceremony', kind: 'card', printing: "Player's Ceremony SP 127",
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'hand' }
      },
      {
        token: 'book', kind: 'card', printing: 'Palace Book SMP NAN25',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'hand' }
      },
      {
        token: 'n', kind: 'card', printing: 'N FCO 105',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'hand' }
      }
    ],
    publicMetadata: {
      selectionType: 'card-combination', minimumCount: 2, maximumCount: 2
    },
    observationOptions: {
      ownHand: [
        'Plumeria BUS 120', "Player's Ceremony SP 127",
        'Palace Book SMP NAN25', 'N FCO 105'
      ]
    }
  });
  assert.deepEqual(policy.decide(request),
    { kind: 'select-choices', tokens: ['ceremony', 'book'] });
});

test('Plumeria target prompt chooses the more energized Pokemon', () => {
  const request = prompt({
    sourcePrinting: 'Plumeria BUS 120',
    promptType: 'ChoosePokemonPrompt',
    choices: [pokemonChoice('a', 'active'), pokemonChoice('b', 'bench', 0)],
    publicMetadata: {
      selectionType: 'pokemon', requiredCount: 1, allowCancel: false, isSecret: false
    },
    observationOptions: {
      opponentActive: mon('A', { energies: ['Lightning Energy'] }),
      opponentBench: [
        mon('B', { energies: ['Lightning Energy', 'Double Colorless Energy SUM 136'] })
      ]
    }
  });
  assert.deepEqual(policy.decide(request), { kind: 'select-choice', token: 'b' });
});

test('Faba chooses Special Energy option before Tool or Stadium', () => {
  const request = prompt({
    sourcePrinting: 'Faba LOT 173',
    promptType: 'SelectPrompt',
    choices: [
      { token: 'tool', kind: 'option', label: 'Pokemon Tool' },
      { token: 'special', kind: 'option', label: 'Special Energy' },
      { token: 'stadium', kind: 'option', label: 'Stadium' }
    ],
    publicMetadata: { selectionType: 'option' }
  });
  assert.deepEqual(policy.decide(request), { kind: 'select-choice', token: 'special' });
});
