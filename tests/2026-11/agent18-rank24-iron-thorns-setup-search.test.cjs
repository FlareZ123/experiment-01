'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs');

function active({ energies = [], tools = [] } = {}) {
  return {
    printing: 'Iron Thorns ex TWM 77',
    specialConditions: [],
    energies,
    tools,
    printed: { types: ['Lightning'] }
  };
}
function observation(options = {}) {
  return {
    actorSeat: 0,
    ownHand: options.ownHand ?? [],
    ownPublic: {
      active: active({ energies: options.ownEnergies ?? [] }),
      bench: options.ownBench ?? [],
      stadium: [],
      discard: [],
      deckCount: options.ownDeck ?? 30,
      publicTurnRestrictions: {
        itemPlayLocked: false, energyPlayLocked: false,
        specialEnergyPlayLocked: false, supporterPlayLocked: false,
        stadiumPlayLocked: false, toolPlayLocked: false
      }
    },
    opponentPublic: {
      active: null, stadium: [],
      deckCount: 20, handCount: 4, prizeCount: 6
    },
    ownTurnResources: {
      supporterPlayedTurn: 0,
      itemPlayLocked: false,
      energyPlayedTurn: false,
      energyPlayLocked: false,
      specialEnergyPlayLocked: false,
      stadiumPlayedTurn: false,
      stadiumPlayLocked: false,
      toolPlayLocked: false
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
function prompt(sourcePrinting, choices) {
  return {
    role: 'opponent', seat: 0,
    prompt: {
      promptType: 'ChooseCardsPrompt',
      source: { sourcePrinting, effectName: null },
      choices,
      publicMetadata: {
        selectionType: 'card-combination',
        minimumCount: 0,
        maximumCount: 1
      }
    },
    observation: observation(),
    publicEventReceipt: null,
    actionFrontier: { items: [] }
  };
}
const policy = createPolicy({
  role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {}
});
const pass = { token: 'pass', kind: 'pass' };
const speed = {
  token: 'speed', kind: 'play-card',
  actorPrinting: 'Speed Lightning Energy RCL 173',
  targetPrinting: 'Iron Thorns ex TWM 77'
};
const nest = { token: 'nest', kind: 'play-card', actorPrinting: 'Nest Ball SVI 181' };
const heavy = { token: 'heavy', kind: 'play-card', actorPrinting: 'Heavy Ball BKT 140' };
const tag = { token: 'tag', kind: 'play-card', actorPrinting: 'Tag Call CEC 206' };
const capture = {
  token: 'capture', kind: 'play-card',
  actorPrinting: 'Capture Energy RCL 171',
  targetPrinting: 'Iron Thorns ex TWM 77'
};
const benchThorns = {
  token: 'bench-thorns', kind: 'play-card',
  actorPrinting: 'Iron Thorns ex TWM 77'
};

test('second Iron Thorns from hand outranks energy funding', () => {
  assert.deepEqual(policy.decide(root({
    ownHand: ['Iron Thorns ex TWM 77', 'Speed Lightning Energy RCL 173'],
    items: [benchThorns, speed, pass]
  })), { kind: 'select-action', token: 'bench-thorns' });
});

test('Nest Ball outranks Heavy Ball and Tag Call while a second Thorns is needed', () => {
  assert.deepEqual(policy.decide(root({
    ownHand: ['Nest Ball SVI 181', 'Heavy Ball BKT 140', 'Tag Call CEC 206'],
    items: [nest, heavy, tag, pass]
  })), { kind: 'select-action', token: 'nest' });
});

test('Capture Energy doubles as setup and funding when a second Thorns is needed', () => {
  assert.deepEqual(policy.decide(root({
    ownHand: ['Capture Energy RCL 171'],
    items: [capture, pass]
  })), { kind: 'select-action', token: 'capture' });
});

for (const [source, name] of [
  ['Nest Ball SVI 181', 'Nest Ball'],
  ['Heavy Ball BKT 140', 'Heavy Ball'],
  ['Capture Energy RCL 171', 'Capture Energy']
]) {
  test(name + ' search continuation selects Iron Thorns', () => {
    const request = prompt(source, [
      { token: 'empty', kind: 'empty-selection', label: 'Choose no cards' },
      {
        token: 'thorns', kind: 'card', printing: 'Iron Thorns ex TWM 77',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' }
      }
    ]);
    assert.deepEqual(policy.decide(request),
      { kind: 'select-choices', tokens: ['thorns'] });
  });
}

test('search continuation chooses explicit empty selection if no Thorns is available', () => {
  const request = prompt('Nest Ball SVI 181', [
    { token: 'empty', kind: 'empty-selection', label: 'Choose no cards' }
  ]);
  assert.deepEqual(policy.decide(request),
    { kind: 'select-choice', token: 'empty' });
});
