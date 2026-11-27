'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  SOURCE_RANK,
  SOURCE_LIST_BLOB_SHA1,
  SOURCE_INVENTORY_SHA256,
  SOURCE_CARD_COUNTS,
  createPolicy
} = require('../../simulation/evaluation/2026-11/agent18-rank24-iron-thorns-opponent-policy.cjs');

function active({ specialConditions = [] } = {}) {
  return {
    printing: 'Iron Thorns ex TWM 77',
    specialConditions
  };
}

function observation({ seat = 0, opponentDeck = 2, ownHand = [], discard = [],
  supporterPlayedTurn = 0, supporterPlayLocked = false, itemPlayLocked = false,
  specialConditions = [] } = {}) {
  return {
    actorSeat: seat,
    ownHand,
    ownPublic: {
      active: active({ specialConditions }),
      discard,
      publicTurnRestrictions: { supporterPlayLocked: false, itemPlayLocked: false }
    },
    opponentPublic: { deckCount: opponentDeck },
    ownTurnResources: { supporterPlayedTurn, supporterPlayLocked, itemPlayLocked }
  };
}

function receipt({ paleMoon = false } = {}) {
  return {
    opponentLastTurnAttacks: paleMoon ? [{ attackName: 'Pale Moon-GX' }] : []
  };
}

function root({ seat = 0, items, publicEventReceipt = receipt(), ...obs } = {}) {
  return {
    role: 'opponent', seat, prompt: null,
    observation: observation({ seat, ...obs }),
    publicEventReceipt,
    actionFrontier: { items }
  };
}

function prompt({ seat = 0, sourcePrinting, promptType, choices, publicMetadata = {} }) {
  const p = {
    promptType,
    source: { sourcePrinting, effectName: null },
    choices,
    publicMetadata
  };
  return {
    role: 'opponent', seat, prompt: p,
    observation: { actorSeat: seat },
    publicEventReceipt: null,
    actionFrontier: { items: [] }
  };
}

function policy(seat = 0) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config: {} });
}

const pass = { token: 'pass', kind: 'pass' };
const mill = { token: 'mill', kind: 'play-card', actorPrinting: 'Bellelba & Brycen-Man CEC 186' };
const seeker = { token: 'seek', kind: 'play-card', actorPrinting: 'VS Seeker PHF 109' };

test('source identity is exact rank 24 and inventory totals 60 without rank-6-only cards', () => {
  assert.equal(SOURCE_RANK, 24);
  assert.equal(SOURCE_LIST_BLOB_SHA1, 'ae773f6201d7aa69d31914dbfee66f3fba692200');
  assert.equal(SOURCE_INVENTORY_SHA256, '82ef5571dc3ee91c30bb490faeab86d16082109042928e4dadbde7951fccc18a');
  assert.equal(Object.values(SOURCE_CARD_COUNTS).reduce((a, b) => a + b, 0), 60);
  assert.equal(SOURCE_CARD_COUNTS['Bellelba & Brycen-Man CEC 186'], 1);
  assert.equal(SOURCE_CARD_COUNTS['VS Seeker PHF 109'], 3);
  assert.equal(SOURCE_CARD_COUNTS['Double Colorless Energy SUM 136'], 3);
  assert.equal(SOURCE_CARD_COUNTS['Crushing Hammer POR 71'], undefined);
  assert.equal(SOURCE_CARD_COUNTS["Team Rocket's Handiwork FCO 112"], undefined);
  assert.equal(SOURCE_CARD_COUNTS['Tropical Beach BWP 50'], undefined);
  assert.equal(SOURCE_CARD_COUNTS['Palace Belt BWP 153'], undefined);
});

test('factory preserves family role/seat/version/empty-config contract', () => {
  assert.equal(typeof policy(0).decide, 'function');
  assert.equal(typeof policy(1).decide, 'function');
  assert.throws(() => createPolicy({ role: 'candidate', seat: 0, policyVersion: POLICY_VERSION, config: {} }), /INIT_MISMATCH/);
  assert.throws(() => createPolicy({ role: 'opponent', seat: 2, policyVersion: POLICY_VERSION, config: {} }), /INIT_MISMATCH/);
  assert.throws(() => createPolicy({ role: 'opponent', seat: 0, policyVersion: 'wrong', config: {} }), /INIT_MISMATCH/);
  assert.throws(() => createPolicy({ role: 'opponent', seat: 0, policyVersion: POLICY_VERSION, config: { rank: 24 } }), /INIT_MISMATCH/);
});

for (const seat of [0, 1]) {
  for (const deckCount of [1, 2, 3]) {
    test(`seat ${seat}: direct Bellelba is selected at opponent deck ${deckCount} with certified safe end-turn`, () => {
      const req = root({ seat, opponentDeck: deckCount,
        ownHand: ['Bellelba & Brycen-Man CEC 186'], items: [mill, pass] });
      assert.deepEqual(policy(seat).decide(req), { kind: 'select-action', token: 'mill' });
    });
  }
}

test('opponent deck zero selects pass only when end-turn is certified safe', () => {
  assert.deepEqual(policy().decide(root({ opponentDeck: 0, items: [pass] })),
    { kind: 'select-action', token: 'pass' });
});

test('missing public last-turn receipt fails closed instead of claiming terminal safety', () => {
  const req = root({ opponentDeck: 2, ownHand: ['Bellelba & Brycen-Man CEC 186'],
    items: [mill, pass], publicEventReceipt: null });
  assert.deepEqual(policy().decide(req), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('Pale Moon-GX in public opponent attack history blocks direct mill', () => {
  const req = root({ opponentDeck: 2, ownHand: ['Bellelba & Brycen-Man CEC 186'],
    items: [mill, pass], publicEventReceipt: receipt({ paleMoon: true }) });
  assert.deepEqual(policy().decide(req), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('a Special Condition blocks terminal pass/mill in this conservative first slice', () => {
  const req = root({ opponentDeck: 2, ownHand: ['Bellelba & Brycen-Man CEC 186'],
    specialConditions: ['POISONED'], items: [mill, pass] });
  assert.deepEqual(policy().decide(req), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('used or locked Supporter slot blocks Bellelba root', () => {
  for (const opts of [{ supporterPlayedTurn: 1 }, { supporterPlayLocked: true }]) {
    const req = root({ opponentDeck: 2, ownHand: ['Bellelba & Brycen-Man CEC 186'],
      items: [mill, pass], ...opts });
    assert.deepEqual(policy().decide(req), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
  }
});

test('nonterminal opponent deck count does not trigger this narrow direct-mill slice', () => {
  const req = root({ opponentDeck: 4, ownHand: ['Bellelba & Brycen-Man CEC 186'], items: [mill, pass] });
  assert.deepEqual(policy().decide(req), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
});

test('VS Seeker is selected only for visible Bellelba recovery inside the terminal window', () => {
  const req = root({ opponentDeck: 3, ownHand: ['VS Seeker PHF 109'],
    discard: ['Bellelba & Brycen-Man CEC 186'], items: [seeker, pass] });
  assert.deepEqual(policy().decide(req), { kind: 'select-action', token: 'seek' });
});

test('VS Seeker is not initiated when Bellelba is absent, Items are locked, or Supporter slot is spent', () => {
  const variants = [
    { discard: [] },
    { discard: ['Bellelba & Brycen-Man CEC 186'], itemPlayLocked: true },
    { discard: ['Bellelba & Brycen-Man CEC 186'], supporterPlayedTurn: 1 }
  ];
  for (const variant of variants) {
    const req = root({ opponentDeck: 3, ownHand: ['VS Seeker PHF 109'], items: [seeker, pass], ...variant });
    assert.deepEqual(policy().decide(req), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
  }
});

test('VS Seeker continuation chooses Bellelba from actor discard', () => {
  const req = prompt({ sourcePrinting: 'VS Seeker PHF 109', promptType: 'ChooseCardsPrompt',
    choices: [
      { token: 'lusamine', kind: 'card', printing: 'Lusamine CIN 96', publicMetadata: { ownerSeat: 'actor', sourceZone: 'discard' } },
      { token: 'belle', kind: 'card', printing: 'Bellelba & Brycen-Man CEC 186', publicMetadata: { ownerSeat: 'actor', sourceZone: 'discard' } }
    ], publicMetadata: { selectionType: 'card-combination', minimumCount: 1, maximumCount: 1 } });
  assert.deepEqual(policy().decide(req), { kind: 'select-choices', tokens: ['belle'] });
});

test('Bellelba optional three-card payment is declined through empty selection', () => {
  const req = prompt({ sourcePrinting: 'Bellelba & Brycen-Man CEC 186', promptType: 'ChooseCardsPrompt',
    choices: [
      { token: 'empty', kind: 'empty-selection', label: 'Choose no cards' },
      { token: 'a', kind: 'card', printing: "Trainers' Mail ROS 92" }
    ], publicMetadata: { selectionType: 'card-combination', minimumCount: 0, maximumCount: 3 } });
  assert.deepEqual(policy().decide(req), { kind: 'select-choice', token: 'empty' });
});

test('Bellelba optional payment is also declined on an explicit confirmation prompt', () => {
  const req = prompt({ sourcePrinting: 'Bellelba & Brycen-Man CEC 186', promptType: 'ConfirmPrompt',
    choices: [
      { token: 'yes', kind: 'confirm', label: 'Yes' },
      { token: 'no', kind: 'confirm', label: 'No' }
    ], publicMetadata: { selectionType: 'confirm' } });
  assert.deepEqual(policy().decide(req), { kind: 'select-choice', token: 'no' });
});

test('unrelated rank24 roots and prompts remain explicit abstentions', () => {
  const rootReq = root({ opponentDeck: 20, ownHand: ['N FCO 105'],
    items: [{ token: 'n', kind: 'play-card', actorPrinting: 'N FCO 105' }, pass] });
  assert.deepEqual(policy().decide(rootReq), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' });
  const promptReq = prompt({ sourcePrinting: 'N FCO 105', promptType: 'ChooseCardsPrompt', choices: [] });
  assert.deepEqual(policy().decide(promptReq), { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' });
});
