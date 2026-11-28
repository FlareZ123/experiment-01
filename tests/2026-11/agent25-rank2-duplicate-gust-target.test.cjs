'use strict';

// Actor-visible policy decisions only. No native Store, full game, or competitive result.
const test = require('node:test');
const assert = require('node:assert/strict');
const { POLICY_VERSION, createPolicy } =
  require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');

const duplicate = 'Gengar & Mimikyu-GX TEU 53';
const distinct = 'Shadow Rider Calyrex V CRE 74';
function state(seat, damages = [0, 220], printings = [duplicate, duplicate]) {
  return {
    actorSeat: seat, globalTurn: 3,
    ownHand: ['Guzma BUS 115', 'Cassius XY 123'],
    ownPublic: { active: { printing: 'Bunnelby PRC 121', hp: 60, damage: 0 },
      bench: [null, null, null, null, null] },
    opponentPublic: {
      active: { printing: 'Shadow Rider Calyrex VMAX CRE 75', hp: 320, damage: 0 },
      bench: printings.map((printing, index) =>
        ({ printing, hp: 240, damage: damages[index] })).concat([null, null, null])
    },
    ownTurnResources: { supporterPlayedTurn: 0, supporterPlayLocked: false }
  };
}
function policy(seat) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config: {} });
}
function prompt(seat, observation, opts = {}) {
  const choices = [0, 1].map(index => {
    const publicMetadata = {
      ownerSeat: 'opponent', targetZone: 'bench', selectionType: 'pokemon',
      selectionIndex: index, isOwnerVisible: true
    };
    if (!opts.noIndex) {
      if (opts.slotIndex) publicMetadata.slotIndex = index;
      else publicMetadata.benchIndex = index;
    }
    if (opts.conflict) publicMetadata.slotIndex = (index + 1) % 2;
    if (opts.swap) publicMetadata.benchIndex = (index + 1) % 2;
    const printing = observation.opponentPublic.bench[index].printing;
    return { token: 'target-' + index, kind: 'pokemon', printing, label: printing,
      publicMetadata };
  });
  if (opts.reverse) choices.reverse();
  return { role: 'opponent', seat, observation,
    prompt: {
      promptType: 'ChoosePokemonPrompt',
      source: { sourcePrinting: 'Guzma BUS 115', effectName: 'Guzma' },
      publicMetadata: { selectionType: 'pokemon', minimumCount: 1, maximumCount: 1 },
      choices
    },
    actionFrontier: { items: [] }
  };
}
function selected(index) {
  return { kind: 'select-choices', tokens: ['target-' + index] };
}
const abstain = { kind: 'abstain', reasonCode: 'INSUFFICIENT_SUPPORTED_PROMPT_CHOICES' };

for (const seat of [0, 1]) {
  test('seat ' + seat + ': Gust prompt selects the damaged second duplicate', () => {
    assert.deepEqual(policy(seat).decide(prompt(seat, state(seat))), selected(1));
  });

  test('seat ' + seat + ': reversed damage makes first copy the correct target', () => {
    assert.deepEqual(policy(seat).decide(prompt(seat, state(seat, [220, 0]))),
      selected(0));
  });

  test('seat ' + seat + ': reversing option order preserves physical Bench targeting', () => {
    assert.deepEqual(policy(seat).decide(prompt(seat, state(seat), { reverse: true })),
      selected(1));
  });

  test('seat ' + seat + ': physical slotIndex works without benchIndex', () => {
    assert.deepEqual(policy(seat).decide(prompt(seat, state(seat), { slotIndex: true })),
      selected(1));
  });

  test('seat ' + seat + ': choice ordinal alone cannot disambiguate duplicates', () => {
    assert.deepEqual(policy(seat).decide(prompt(seat, state(seat), { noIndex: true })),
      abstain);
  });

  test('seat ' + seat + ': conflicting physical index metadata fails closed', () => {
    assert.deepEqual(policy(seat).decide(prompt(seat, state(seat), { conflict: true })),
      abstain);
  });

  test('seat ' + seat + ': physical index that names another printing fails closed', () => {
    assert.deepEqual(policy(seat).decide(prompt(seat,
      state(seat, [0, 220], [duplicate, distinct]), { swap: true })), abstain);
  });

  test('seat ' + seat + ': unique printings still resolve without physical indices', () => {
    assert.deepEqual(policy(seat).decide(prompt(seat,
      state(seat, [0, 220], [duplicate, distinct]), { noIndex: true })), selected(1));
  });

  test('seat ' + seat + ': mismatched physical seat cannot decide', () => {
    const r = prompt(seat, state(seat));
    r.seat = 1 - seat;
    assert.deepEqual(policy(seat).decide(r),
      { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' });
  });
}
