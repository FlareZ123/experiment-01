'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  assessPaidRetreatAlternatives,
  proposeGuardedTwoUnitPaidRetreatV2,
} = require('../simulation/twinleaf/agent20-paid-retreat-alternative-guard.cjs');
const {
  proposeTwoUnitPaidRetreatV2,
} = require('../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal-v2.cjs');

const P = 'Psychic Energy MEE';
const C = 9;
const catalog = {
  stages: { BASIC: 0, STAGE_1: 1, VMAX: 5 },
  basicEnergies: new Set([P, 'Darkness Energy MEE']),
  basicEnergyTypes: { Psychic: 5, Darkness: 7 },
  specialEnergies: new Set([
    'Double Colorless Energy EVO',
    'Prism Energy ASC',
  ]),
  dragonPokemonPrintings: new Set(),
  ruleboxPokemonPrintings: new Set(),
  colorlessEnergyType: C,
  specialConditions: { ASLEEP: 1, PARALYZED: 2 },
};

const restrictions = () => ({
  cannotAttackNextTurn: false,
  cannotUseAttacksNextTurn: [],
  blockedAttackNameNextTurn: null,
  blockedAttackNameUntilLeavesActive: null,
  onlyAllowedAttackNameNextTurn: null,
  cannotRetreatNextTurn: false,
  cannotRetreatWhileActive: false,
});

function fixture() {
  const active = {
    printing: 'Shadow Rider Calyrex VMAX CRE',
    name: 'Shadow Rider Calyrex VMAX',
    hp: 320,
    damage: 0,
    printed: {
      stage: 5,
      types: [5],
      retreatCost: [C, C],
      resistance: [],
    },
    energies: [P, P],
    tools: [],
    specialConditions: [],
    abilityDetails: [],
    publicRestrictions: restrictions(),
    attacks: [{
      name: 'Max Geist',
      cost: [C, C, C],
      damage: 10,
      damageCalculation: null,
      gxAttack: false,
    }],
  };
  const latias = {
    printing: 'Latias ex SSP',
    name: 'Latias ex',
    hp: 210,
    damage: 0,
    printed: {
      stage: 0,
      types: [5],
      retreatCost: [C, C],
      resistance: [],
    },
    energies: [P, P, P],
    tools: [],
    specialConditions: [],
    abilityDetails: [{
      name: 'Skyliner',
      text: 'Your Basic Pokémon in play have no Retreat Cost.',
    }],
    publicRestrictions: restrictions(),
    attacks: [{
      name: 'Eon Blade',
      cost: [5, 5, C],
      damage: 200,
      damageCalculation: null,
      gxAttack: false,
    }],
  };
  const defender = {
    printing: 'Lunatone OBF',
    name: 'Lunatone',
    hp: 90,
    damage: 10,
    printed: {
      stage: 0,
      types: [5],
      retreatCost: [C],
      resistance: [],
    },
    energies: [],
    tools: [],
    specialConditions: [],
    publicRestrictions: restrictions(),
    abilities: ['New Moon'],
    abilityDetails: [{
      name: 'New Moon',
      text: 'If you have Solrock in play, prevent all effects of any Stadium done to your Pokémon in play.',
    }],
    attacks: [],
  };
  const view = {
    decisionKind: 'owner-root',
    globalTurn: 22,
    ownHand: [],
    ownTurnResources: {
      retreatedTurn: 0,
      toolPlayLocked: false,
    },
    ownPublic: {
      active,
      bench: [latias],
      prizeCount: 1,
      stadium: [],
      publicTurnRestrictions: {
        attackLockTurnsRemaining: 0,
        gxUsed: false,
        cannotUseGXAttacks: false,
        itemPlayLocked: false,
        toolPlayLocked: false,
      },
    },
    opponentPublic: {
      active: defender,
      bench: [],
      prizeCount: 6,
      stadium: [],
    },
  };
  Object.defineProperty(view, 'opponentPrivate', {
    get() {
      throw Error('opponent hidden information must not be accessed');
    },
  });
  return view;
}

test('guard permits the exact v2 two-Basic-Psychic terminal proposal when no alternative exists', () => {
  const view = fixture();
  const proposal = proposeTwoUnitPaidRetreatV2(view, catalog);
  const assessment = assessPaidRetreatAlternatives(view, proposal);

  assert.match(VERSION, /alternative-guard-v1/);
  assert.equal(proposal?.kind, 'two-unit-paid-retreat-proposal-v2');
  assert.equal(assessment.eligible, true);
  assert.deepEqual(assessment.reasons, []);
  assert.deepEqual(assessment.diagnostics.paymentPrintings, [P, P]);
  assert.equal(assessment.diagnostics.targetPrinting, 'Latias ex SSP');
});

test('guard blocks a playable held Float Stone until its zero-Energy route is compared', () => {
  const view = fixture();
  view.ownHand = ['Float Stone BKT'];

  const result = proposeGuardedTwoUnitPaidRetreatV2(view, catalog);

  assert.equal(result.proposal, null);
  assert.equal(result.assessment.eligible, false);
  assert.ok(result.assessment.reasons.includes(
    'held-float-stone-alternative-uncompared'));
  assert.equal(result.assessment.diagnostics.floatStoneInHand, true);
  assert.equal(result.assessment.diagnostics.toolJammerOnOpponentActive, false);
});

test('Tool Jammer on the opponent Active disables the held Float Stone alternative', () => {
  const view = fixture();
  view.ownHand = ['Float Stone BKT'];
  view.opponentPublic.active.tools = ['Tool Jammer TEU'];

  const result = proposeGuardedTwoUnitPaidRetreatV2(view, catalog);

  assert.equal(result.proposal?.kind, 'two-unit-paid-retreat-proposal-v2');
  assert.equal(result.assessment.eligible, true);
  assert.equal(result.assessment.diagnostics.toolJammerOnOpponentActive, true);
});

test('Tool Jammer on the opponent Bench does not disable Float Stone on our Active', () => {
  const view = fixture();
  view.ownHand = ['Float Stone BKT'];
  view.opponentPublic.bench = [{
    printing: 'Tool Jammer TEU',
    tools: [],
    abilityDetails: [],
  }];

  const result = proposeGuardedTwoUnitPaidRetreatV2(view, catalog);

  assert.equal(result.proposal, null);
  assert.ok(result.assessment.reasons.includes(
    'held-float-stone-alternative-uncompared'));
});

test('Item or Tool lock removes the held Float Stone alternative', () => {
  const itemLocked = fixture();
  itemLocked.ownHand = ['Float Stone BKT'];
  itemLocked.ownPublic.publicTurnRestrictions.itemPlayLocked = true;
  const itemResult = proposeGuardedTwoUnitPaidRetreatV2(itemLocked, catalog);
  assert.equal(itemResult.assessment.eligible, true);

  const toolLocked = fixture();
  toolLocked.ownHand = ['Float Stone BKT'];
  toolLocked.ownPublic.publicTurnRestrictions.toolPlayLocked = true;
  const toolResult = proposeGuardedTwoUnitPaidRetreatV2(toolLocked, catalog);
  assert.equal(toolResult.assessment.eligible, true);
});

test('missing hand, lock, or Tool Jammer metadata fails closed when Float Stone is held', () => {
  const noHand = fixture();
  noHand.ownHand = ['Float Stone BKT'];
  delete noHand.ownPublic.publicTurnRestrictions.toolPlayLocked;
  const noLockResult = proposeGuardedTwoUnitPaidRetreatV2(noHand, catalog);
  assert.equal(noLockResult.proposal, null);
  assert.ok(noLockResult.assessment.reasons.includes(
    'unknown-item-tool-lock-state'));

  const noOpponentTools = fixture();
  noOpponentTools.ownHand = ['Float Stone BKT'];
  delete noOpponentTools.opponentPublic.active.tools;
  const knownProposal = proposeTwoUnitPaidRetreatV2(fixture(), catalog);
  const noToolsAssessment = assessPaidRetreatAlternatives(
    noOpponentTools, knownProposal);
  assert.equal(noToolsAssessment.eligible, false);
  assert.ok(noToolsAssessment.reasons.includes(
    'unknown-opponent-active-tools'));

  const unknownHand = fixture();
  delete unknownHand.ownHand;
  const unknownHandResult = proposeGuardedTwoUnitPaidRetreatV2(unknownHand, catalog);
  assert.equal(unknownHandResult.proposal, null);
  assert.ok(unknownHandResult.assessment.reasons.includes('unknown-own-hand'));
});

test('unknown Active stage with own-board Skyliner fails closed', () => {
  const view = fixture();
  view.ownPublic.active.printed.stage = null;

  const proposal = proposeTwoUnitPaidRetreatV2(view, catalog);
  assert.ok(proposal);
  const assessment = assessPaidRetreatAlternatives(view, proposal);

  assert.equal(assessment.eligible, false);
  assert.ok(assessment.reasons.includes(
    'unknown-active-stage-with-skyliner'));
});

test('payment and target identity are revalidated against the owner observation', () => {
  const view = fixture();
  const proposal = proposeTwoUnitPaidRetreatV2(view, catalog);

  const badPayment = {
    ...proposal,
    paymentClass: 'single-special-energy',
    discardEnergyIndices: [0],
    discardEnergyPrintings: [P],
  };
  const paymentAssessment = assessPaidRetreatAlternatives(view, badPayment);
  assert.equal(paymentAssessment.eligible, false);
  assert.ok(paymentAssessment.reasons.includes('unsupported-payment-class'));
  assert.ok(paymentAssessment.reasons.includes('unsupported-energy-custody'));

  const badTarget = { ...proposal, printing: 'Girafarig LOT' };
  const targetAssessment = assessPaidRetreatAlternatives(view, badTarget);
  assert.equal(targetAssessment.eligible, false);
  assert.ok(targetAssessment.reasons.includes('proposal-target-mismatch'));
});

test('guard does not inspect opponent hidden information or mutate the observation', () => {
  const view = fixture();
  const before = JSON.stringify(view, (key, value) =>
    key === 'opponentPrivate' ? '[hidden]' : value);

  const result = proposeGuardedTwoUnitPaidRetreatV2(view, catalog);

  assert.equal(result.proposal?.kind, 'two-unit-paid-retreat-proposal-v2');
  assert.equal(JSON.stringify(view, (key, value) =>
    key === 'opponentPrivate' ? '[hidden]' : value), before);
});
