'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs');

function active() {
  return {
    printing: 'Iron Thorns ex TWM 77',
    hp: 230, damage: 0, energies: [], tools: [],
    printed: { types: ['Lightning'] }, specialConditions: []
  };
}
function observation(options = {}) {
  return {
    actorSeat: 0,
    ownHand: options.ownHand ?? [],
    ownPublic: {
      active: active(), bench: [], stadium: [], discard: [],
      deckCount: options.ownDeck ?? 30, prizeCount: options.ownPrizes ?? 6,
      publicTurnRestrictions: {
        supporterPlayLocked: false, itemPlayLocked: false,
        energyPlayLocked: false, specialEnergyPlayLocked: false,
        stadiumPlayLocked: false, toolPlayLocked: false
      }
    },
    opponentPublic: {
      active: null, bench: [], stadium: [], deckCount: 20,
      handCount: options.opponentHand ?? 4, prizeCount: 6
    },
    ownTurnResources: {
      supporterPlayedTurn: options.supporterPlayedTurn ?? 0,
      itemPlayLocked: false, energyPlayedTurn: false,
      energyPlayLocked: false, specialEnergyPlayLocked: false,
      stadiumPlayedTurn: false, stadiumPlayLocked: false, toolPlayLocked: false
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
function prompt({ sourcePrinting, choices, observationOptions = {} }) {
  return {
    role: 'opponent', seat: 0,
    prompt: {
      promptType: 'ChooseCardsPrompt',
      source: { sourcePrinting, effectName: sourcePrinting.split(/\s+(?:TEF|FST|SUM|ROS)\b/)[0] },
      choices,
      publicMetadata: {
        selectionType: 'card-combination',
        minimumCount: 0,
        maximumCount: sourcePrinting.startsWith("Trainers' Mail") ? 1 : 2
      }
    },
    observation: observation(observationOptions),
    publicEventReceipt: null,
    actionFrontier: { items: [] }
  };
}
function choice(token, printing, meta = {}) {
  return {
    token, kind: 'card', printing, label: printing,
    publicMetadata: { ownerSeat: 'opponent', sourceZone: 'hand', ...meta }
  };
}
const empty = { token: 'empty', kind: 'empty-selection', label: 'Choose no cards' };
const pass = { token: 'pass', kind: 'pass' };
const policy = createPolicy({
  role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: {}
});

test('Xerosic is deterministic at public hand count above 3 and not below', () => {
  const x = { token: 'x', kind: 'play-card', actorPrinting: "Xerosic's Machinations SFA 64" };
  assert.deepEqual(policy.decide(root({
    opponentHand: 6, ownHand: ["Xerosic's Machinations SFA 64"], items: [x, pass]
  })), { kind: 'select-action', token: 'x' });
  assert.deepEqual(policy.decide(root({
    opponentHand: 3, ownHand: ["Xerosic's Machinations SFA 64"], items: [x, pass]
  })), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test("Lillie's Determination refills a low public own hand", () => {
  const l = { token: 'l', kind: 'play-card', actorPrinting: "Lillie's Determination MEG 119" };
  assert.deepEqual(policy.decide(root({
    ownHand: ["Lillie's Determination MEG 119"], ownPrizes: 6, items: [l, pass]
  })), { kind: 'select-action', token: 'l' });
});

test("Trainers' Mail is used before an ordinary non-KO attack", () => {
  const mail = { token: 'mail', kind: 'play-card', actorPrinting: "Trainers' Mail ROS 92" };
  const attack = { token: 'volt', kind: 'attack', actorPrinting: 'Iron Thorns ex TWM 77', attackName: 'Volt Cyclone' };
  assert.deepEqual(policy.decide(root({
    ownHand: ["Trainers' Mail ROS 92"], items: [mail, attack, pass]
  })), { kind: 'select-action', token: 'mail' });
});

test('blind disruption is conservative below six public opponent cards', () => {
  for (const printing of ['Eri TEF 146', 'Sidney FST 241', 'Team Skull Grunt SUM 133']) {
    const action = { token: printing, kind: 'play-card', actorPrinting: printing };
    assert.deepEqual(policy.decide(root({
      opponentHand: 5, ownHand: [printing], items: [action, pass]
    })), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
  }
});

test('blind disruption becomes selectable at a large public opponent hand', () => {
  const e = { token: 'e', kind: 'play-card', actorPrinting: 'Eri TEF 146' };
  assert.deepEqual(policy.decide(root({
    opponentHand: 7, ownHand: ['Eri TEF 146'], items: [e, pass]
  })), { kind: 'select-action', token: 'e' });
});

test('Eri prompt selects up to two revealed Items and prioritizes access cards', () => {
  const req = prompt({
    sourcePrinting: 'Eri TEF 146',
    choices: [
      empty,
      choice('mail', "Trainers' Mail ROS 92"),
      choice('vs', 'VS Seeker PHF 109'),
      choice('nest', 'Nest Ball SVI 181')
    ],
    observationOptions: { opponentHand: 7 }
  });
  assert.deepEqual(policy.decide(req),
    { kind: 'select-choices', tokens: ['vs', 'nest'] });
});

test('Sidney prompt prioritizes Special Energy over Tool and Stadium', () => {
  const req = prompt({
    sourcePrinting: 'Sidney FST 241',
    choices: [
      empty,
      choice('stadium', 'Path to the Peak CRE 148', { cardType: 'Stadium' }),
      choice('tool', 'Float Stone BKT 137', { cardType: 'Tool' }),
      choice('dce', 'Double Colorless Energy SUM 136', { energyType: 'Special' })
    ],
    observationOptions: { opponentHand: 7 }
  });
  assert.deepEqual(policy.decide(req),
    { kind: 'select-choices', tokens: ['dce', 'tool'] });
});

test('Team Skull prompt prefers revealed Special Energy over Basic Energy', () => {
  const req = prompt({
    sourcePrinting: 'Team Skull Grunt SUM 133',
    choices: [
      empty,
      choice('basic', 'Lightning Energy', { energyType: 'Basic' }),
      choice('dce', 'Double Colorless Energy SUM 136', { energyType: 'Special' })
    ],
    observationOptions: { opponentHand: 7 }
  });
  assert.deepEqual(policy.decide(req),
    { kind: 'select-choices', tokens: ['dce', 'basic'] });
});

test("Trainers' Mail takes the highest-ranked revealed Trainer and can choose empty", () => {
  const req = prompt({
    sourcePrinting: "Trainers' Mail ROS 92",
    choices: [
      empty,
      {
        token: 'tag', kind: 'card', printing: 'Tag Call CEC 206', label: 'Tag Call CEC 206',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' }
      },
      {
        token: 'nest', kind: 'card', printing: 'Nest Ball SVI 181', label: 'Nest Ball SVI 181',
        publicMetadata: { ownerSeat: 'actor', sourceZone: 'deck' }
      }
    ],
    observationOptions: {}
  });
  assert.deepEqual(policy.decide(req),
    { kind: 'select-choices', tokens: ['nest'] });

  const emptyOnly = prompt({
    sourcePrinting: "Trainers' Mail ROS 92",
    choices: [empty]
  });
  assert.deepEqual(policy.decide(emptyOnly),
    { kind: 'select-choice', token: 'empty' });
});
