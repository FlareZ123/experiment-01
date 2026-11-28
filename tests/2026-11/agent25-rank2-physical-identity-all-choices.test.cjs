'use strict';

// Actor-view-only, source-print-aware continuation regressions. They do not
// model a native accepted Cassius or Grand Tree effect in a live Store.
const test = require('node:test');
const assert = require('node:assert/strict');
const { POLICY_VERSION, createPolicy } =
  require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');
const BUNNELBY = 'Bunnelby PRC 121';
const ODDISH = 'Oddish UNB 5';
const copy = value => JSON.parse(JSON.stringify(value));
function policy(seat) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config: {} });
}
function pokemon(printing, hp = 70, damage = 0, played = 1) {
  return {
    printing, hp, damage, lastPlayedOrEvolvedTurn: played,
    printed: { stage: 'BASIC', subtypes: ['Basic'], retreatCost: ['Colorless'] },
    abilities: [], energies: [], tools: []
  };
}
function view(seat) {
  return {
    actorSeat: seat, globalTurn: 3, ownerK1: null, ownHand: [],
    ownPublic: {
      active: pokemon(BUNNELBY), bench: [null, null, null, null, null],
      discard: [], lostZone: []
    },
    opponentPublic: { active: null, bench: [null, null, null, null, null] },
    ownTurnResources: { supporterPlayedTurn: 0, supporterPlayLocked: false }
  };
}
function target(token, printing, zone, index = 0, opts = {}) {
  const meta = { ownerSeat: 'actor', targetZone: zone, selectionType: 'pokemon',
    selectionIndex: index, isOwnerVisible: true };
  if (zone === 'bench' && !opts.noIndex) meta.benchIndex = index;
  if (zone === 'active') meta.slotIndex = 0;
  if (opts.conflict) meta.slotIndex = (index + 1) % 2;
  if (opts.pointWrong) meta.benchIndex = (index + 1) % 2;
  return { token, kind: 'pokemon', printing,
    label: printing, publicMetadata: meta };
}
function request(seat, source, obs, choices) {
  return {
    role: 'opponent', seat, observation: obs,
    prompt: {
      promptType: 'ChoosePokemonPrompt',
      source: { sourcePrinting: source, effectName: source.startsWith('Cassius') ?
        'Cassius' : 'Grand Tree' },
      publicMetadata: { selectionType: 'pokemon', minimumCount: 1, maximumCount: 1 },
      choices
    },
    actionFrontier: { items: [] }
  };
}
const pick = token => ({ kind: 'select-choices', tokens: [token] });
const abstain = { kind: 'abstain', reasonCode: 'NO_SUPPORTED_POKEMON_CHOICE' };

for (const seat of [0, 1]) {
  test('seat ' + seat + ': Cassius rescues damaged Benched Bunnelby, not same-print healthy Active', () => {
    const obs = view(seat);
    obs.ownPublic.bench[0] = pokemon(BUNNELBY, 70, 40);
    const choices = [target('healthy', BUNNELBY, 'active'),
      target('damaged', BUNNELBY, 'bench', 0)];
    assert.deepEqual(policy(seat).decide(request(seat, 'Cassius XY 115', obs, choices)),
      pick('damaged'));
  });

  test('seat ' + seat + ': Cassius reverses target when damage moves to Active', () => {
    const obs = view(seat);
    obs.ownPublic.active.damage = 40;
    obs.ownPublic.bench[0] = pokemon(BUNNELBY, 70, 0);
    const choices = [target('healthy', BUNNELBY, 'bench', 0),
      target('damaged', BUNNELBY, 'active')];
    assert.deepEqual(policy(seat).decide(request(seat, 'Cassius XY 115', obs, choices)),
      pick('damaged'));
  });

  test('seat ' + seat + ': Cassius resolves two same-print Bench targets by their physical slots', () => {
    const obs = view(seat);
    obs.ownPublic.bench[0] = pokemon(BUNNELBY, 70, 0);
    obs.ownPublic.bench[1] = pokemon(BUNNELBY, 70, 50);
    const choices = [target('healthy', BUNNELBY, 'bench', 0),
      target('damaged', BUNNELBY, 'bench', 1)];
    assert.deepEqual(policy(seat).decide(request(seat, 'Cassius XY 115', obs, choices)),
      pick('damaged'));
  });

  test('seat ' + seat + ': Cassius does not assume selectionIndex resolves ambiguous duplicate Bench slots', () => {
    const obs = view(seat);
    obs.ownPublic.active = pokemon('Stoutland BCR 122', 140);
    obs.ownPublic.bench[0] = pokemon(BUNNELBY, 70, 0);
    obs.ownPublic.bench[1] = pokemon(BUNNELBY, 70, 50);
    const choices = [target('healthy', BUNNELBY, 'bench', 0, { noIndex: true }),
      target('damaged', BUNNELBY, 'bench', 1, { noIndex: true })];
    assert.deepEqual(policy(seat).decide(request(seat, 'Cassius XY 115', obs, choices)),
      abstain);
  });

  test('seat ' + seat + ': Cassius mismatched physical slot metadata fails closed', () => {
    const obs = view(seat);
    obs.ownPublic.active = pokemon('Stoutland BCR 122', 140);
    obs.ownPublic.bench[0] = pokemon(BUNNELBY, 70, 50);
    obs.ownPublic.bench[1] = pokemon('Oddish UNB 5', 50, 0);
    const choice = target('invalid', BUNNELBY, 'bench', 0, { pointWrong: true });
    assert.deepEqual(policy(seat).decide(request(seat, 'Cassius XY 115', obs, [choice])),
      abstain);
  });

  test('seat ' + seat + ': Grand Tree evolves old Oddish, not fresh same-print Oddish', () => {
    const obs = view(seat);
    obs.ownPublic.bench[0] = pokemon(ODDISH, 50, 0, 3);
    obs.ownPublic.bench[1] = pokemon(ODDISH, 50, 0, 1);
    const choices = [target('fresh', ODDISH, 'bench', 0),
      target('old', ODDISH, 'bench', 1)];
    assert.deepEqual(policy(seat).decide(request(seat, 'Grand Tree SCR 136', obs, choices)),
      pick('old'));
  });

  test('seat ' + seat + ': Grand Tree target flips when age eligibility flips', () => {
    const obs = view(seat);
    obs.ownPublic.bench[0] = pokemon(ODDISH, 50, 0, 1);
    obs.ownPublic.bench[1] = pokemon(ODDISH, 50, 0, 3);
    const choices = [target('old', ODDISH, 'bench', 0),
      target('fresh', ODDISH, 'bench', 1)];
    assert.deepEqual(policy(seat).decide(request(seat, 'Grand Tree SCR 136', obs, choices)),
      pick('old'));
  });

  test('seat ' + seat + ': Grand Tree accepts old Active Oddish with physical active-slot identity', () => {
    const obs = view(seat);
    obs.ownPublic.active = pokemon(ODDISH, 50, 0, 1);
    obs.ownPublic.bench[0] = pokemon(ODDISH, 50, 0, 3);
    const choices = [target('fresh', ODDISH, 'bench', 0),
      target('active-old', ODDISH, 'active')];
    assert.deepEqual(policy(seat).decide(request(seat, 'Grand Tree SCR 136', obs, choices)),
      pick('active-old'));
  });

  test('seat ' + seat + ': Grand Tree does not infer eligible duplicate Bench from choice ordinal', () => {
    const obs = view(seat);
    obs.ownPublic.bench[0] = pokemon(ODDISH, 50, 0, 3);
    obs.ownPublic.bench[1] = pokemon(ODDISH, 50, 0, 1);
    const choices = [target('fresh', ODDISH, 'bench', 0, { noIndex: true }),
      target('old', ODDISH, 'bench', 1, { noIndex: true })];
    assert.deepEqual(policy(seat).decide(request(seat, 'Grand Tree SCR 136', obs, choices)),
      abstain);
  });

  test('seat ' + seat + ': Grand Tree conflict between benchIndex and slotIndex fails closed', () => {
    const obs = view(seat);
    obs.ownPublic.bench[0] = pokemon(ODDISH, 50, 0, 1);
    const choice = target('conflict', ODDISH, 'bench', 0, { conflict: true });
    assert.deepEqual(policy(seat).decide(request(seat, 'Grand Tree SCR 136', obs, [choice])),
      abstain);
  });

  test('seat ' + seat + ': wrong-seat command cannot select a physical owner target', () => {
    const obs = view(seat);
    obs.ownPublic.bench[0] = pokemon(ODDISH, 50, 0, 1);
    const r = request(seat, 'Grand Tree SCR 136', obs,
      [target('old', ODDISH, 'bench', 0)]);
    r.seat = 1 - seat;
    assert.deepEqual(policy(seat).decide(r),
      { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' });
  });
}
