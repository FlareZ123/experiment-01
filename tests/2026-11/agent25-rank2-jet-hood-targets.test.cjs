'use strict';

// Root actions have native physical target metadata; a same-print card name
// alone must not upgrade one attachment because a DIFFERENT copy has a Tool.
const test = require('node:test');
const assert = require('node:assert/strict');
const { POLICY_VERSION, createPolicy, scoreAction } =
  require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');

const BUNNELBY = 'Bunnelby PRC 121';
const VILEPLUME = 'Vileplume AOR 3';
const TM = 'Technical Machine: Evolution PAR 178';
const HOOD = 'Stealthy Hood UNB 186';
function state(seat) {
  return {
    actorSeat: seat, globalTurn: 3,
    ownHand: ['Jet Energy PAL 190', HOOD, 'Counter Gain SSP 140'],
    ownPublic: {
      active: { printing: 'Fan Rotom SCR 118', hp: 70, damage: 0, tools: [] },
      bench: [
        { printing: BUNNELBY, hp: 70, damage: 0, tools: [] },
        { printing: BUNNELBY, hp: 70, damage: 0, tools: [TM] },
        { printing: VILEPLUME, hp: 130, damage: 0, tools: [HOOD] },
        { printing: VILEPLUME, hp: 130, damage: 0, tools: [] }, null
      ],
      prizeCount: 5
    },
    opponentPublic: {
      active: {
        printing: 'Garbodor BKP 57', hp: 120, damage: 0,
        abilities: ['Garbotoxin'], tools: ['Float Stone BKT 137'],
        abilitySuppressions: [{ abilityName: 'Garbotoxin', suppressed: false }]
      },
      bench: [null, null, null, null, null], prizeCount: 3
    },
    ownTurnResources: { itemPlayLocked: false }
  };
}
function action(token, card, targetPrinting, targetZone, targetIndex, opts = {}) {
  return {
    token, kind: 'play-card', actorPrinting: card,
    targetPrinting,
    publicMetadata: {
      cardType: /^Jet Energy/.test(card) ? 'energy' : 'trainer',
      ...(opts.omitPhysical ? {} : {
        targetSeat: 'actor', targetZone, targetIndex, isOwnerVisible: true
      })
    }
  };
}
function chosen(seat, obs, items) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION,
    config: {} }).decide({
    role: 'opponent', seat, prompt: null, observation: obs,
    actionFrontier: { items: [{ token: 'pass', kind: 'pass' }, ...items] }
  });
}
function score(item, obs) { return scoreAction(item, { observation: obs }); }
const pick = token => ({ kind: 'select-action', token });

for (const seat of [0, 1]) {
  test('seat ' + seat + ': Jet attaches to the same Bunnelby that actually has TM Evolution', () => {
    const obs = state(seat);
    const empty = action('empty', 'Jet Energy PAL 190', BUNNELBY, 'bench', 0);
    const equipped = action('equipped', 'Jet Energy PAL 190', BUNNELBY, 'bench', 1);
    assert.equal(score(empty, obs), 80);
    assert.equal(score(equipped, obs), 225);
    assert.deepEqual(chosen(seat, obs, [empty, equipped]), pick('equipped'));
  });

  test('seat ' + seat + ': duplicate Bench printing without physical target cannot borrow other Tool', () => {
    const obs = state(seat);
    const ambiguous = action('ambiguous', 'Jet Energy PAL 190', BUNNELBY,
      'bench', 0, { omitPhysical: true });
    assert.equal(score(ambiguous, obs), 80);
  });

  test('seat ' + seat + ': Jet targetZone active does not impersonate Benched TM recipient', () => {
    const obs = state(seat);
    obs.ownPublic.active = {
      printing: BUNNELBY, hp: 70, damage: 0, tools: [TM]
    };
    const active = action('active', 'Jet Energy PAL 190', BUNNELBY, 'active', 0);
    const bench = action('bench', 'Jet Energy PAL 190', BUNNELBY, 'bench', 1);
    assert.equal(score(active, obs), 80);
    assert.equal(score(bench, obs), 225);
    assert.deepEqual(chosen(seat, obs, [active, bench]), pick('bench'));
  });

  test('seat ' + seat + ': a mismatched target printing cannot receive TM-based score', () => {
    const obs = state(seat);
    const mismatch = action('mismatch', 'Jet Energy PAL 190', BUNNELBY, 'bench', 3);
    assert.equal(score(mismatch, obs), 80);
  });

  test('seat ' + seat + ': Hood goes to actually unprotected Vileplume, not the already hooded copy', () => {
    const obs = state(seat);
    const hooded = action('hooded', HOOD, VILEPLUME, 'bench', 2);
    const unhooded = action('unhooded', HOOD, VILEPLUME, 'bench', 3);
    assert.equal(score(hooded, obs), 65);
    assert.equal(score(unhooded, obs), 205);
    assert.deepEqual(chosen(seat, obs, [hooded, unhooded]), pick('unhooded'));
  });

  test('seat ' + seat + ': ambiguous duplicate Hood target is not awarded phantom protection value', () => {
    const obs = state(seat);
    const ambiguous = action('ambiguous', HOOD, VILEPLUME, 'bench', 0,
      { omitPhysical: true });
    assert.equal(score(ambiguous, obs), 65);
  });

  test('seat ' + seat + ': Hood target of wrong physical printing does not gain protection score', () => {
    const obs = state(seat);
    const mismatch = action('mismatch', HOOD, VILEPLUME, 'bench', 1);
    assert.equal(score(mismatch, obs), 65);
  });

  test('seat ' + seat + ': Hood cannot claim priority while owner Tool play is locked', () => {
    const obs = state(seat);
    obs.ownTurnResources.toolPlayLocked = true;
    const item = action('tool-locked', HOOD, VILEPLUME, 'bench', 3);
    assert.equal(score(item, obs), 65);
  });

  test('seat ' + seat + ': Counter Gain only prioritizes actual Active, even with same-print Bench', () => {
    const obs = state(seat);
    obs.ownPublic.active = { printing: BUNNELBY, hp: 70, damage: 0 };
    const active = action('active', 'Counter Gain SSP 140', BUNNELBY, 'active', 0);
    const bench = action('bench', 'Counter Gain SSP 140', BUNNELBY, 'bench', 0);
    assert.equal(score(active, obs), 190);
    assert.equal(score(bench, obs), 0);
    assert.deepEqual(chosen(seat, obs, [bench, active]), pick('active'));
  });

  test('seat ' + seat + ': Counter Gain has no priority without being behind on Prizes', () => {
    const obs = state(seat);
    obs.ownPublic.active = { printing: BUNNELBY, hp: 70, damage: 0 };
    obs.ownPublic.prizeCount = 2;
    obs.opponentPublic.prizeCount = 3;
    const active = action('active', 'Counter Gain SSP 140', BUNNELBY, 'active', 0);
    assert.equal(score(active, obs), 0);
  });
  function tmDecisionView() {
    const obs = state(seat);
    obs.ownPublic.bench[1].tools = [];
    obs.ownPublic.bench[3] = {
      printing: 'Oddish UNB 5', hp: 50, damage: 0,
      lastPlayedOrEvolvedTurn: 3, // TM attack CAN evolve a newly played Basic.
      printed: { stage: 'BASIC' }, tools: []
    };
    obs.ownHand.unshift(TM);
    return obs;
  }

  test('seat ' + seat + ': TM Evolution attaches to real Bunnelby instead of Fan Rotom', () => {
    const obs = tmDecisionView();
    const rotom = action('rotom', TM, 'Fan Rotom SCR 118', 'active', 0);
    const bunnelby = action('bunnelby', TM, BUNNELBY, 'bench', 0);
    assert.equal(score(rotom, obs), 88);
    assert.equal(score(bunnelby, obs), 178);
    assert.deepEqual(chosen(seat, obs, [rotom, bunnelby]), pick('bunnelby'));
  });

  test('seat ' + seat + ': after the TM target is established Jet follows that same copy', () => {
    const obs = tmDecisionView();
    obs.ownPublic.bench[0].tools = [TM];
    const correct = action('tm-holder', 'Jet Energy PAL 190', BUNNELBY, 'bench', 0);
    const wrong = action('no-tm', 'Jet Energy PAL 190', BUNNELBY, 'bench', 1);
    assert.equal(score(correct, obs), 225);
    assert.equal(score(wrong, obs), 80);
    assert.deepEqual(chosen(seat, obs, [wrong, correct]), pick('tm-holder'));
  });

  test('seat ' + seat + ': TM on Active Bunnelby can be useful without Jet hand', () => {
    const obs = tmDecisionView();
    obs.ownHand = [TM];
    obs.ownPublic.active = { printing: BUNNELBY, hp: 70, damage: 0, tools: [] };
    const tm = action('active', TM, BUNNELBY, 'active', 0);
    assert.equal(score(tm, obs), 178);
  });

  test('seat ' + seat + ': TM lacks double-evolution priority with no matching Basic line', () => {
    const obs = tmDecisionView();
    // Unlike normal evolution, TM: Evolution is an attack and can evolve a
    // freshly played Oddish. Remove Oddish entirely rather than change age.
    obs.ownPublic.bench[3] = {
      printing: VILEPLUME, hp: 130, damage: 0,
      printed: { stage: 'STAGE2' }, tools: []
    };
    const tm = action('no-line', TM, BUNNELBY, 'bench', 0);
    assert.equal(score(tm, obs), 88);
  });

}
