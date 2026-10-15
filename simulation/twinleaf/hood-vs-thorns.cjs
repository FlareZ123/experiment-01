'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installToolJammerHook } = require('./tool-jammer-hook.cjs');

/**
 * Probe exact pinned-engine Ability visibility for the Hood / Initialization /
 * Tool Jammer interaction. This is a deterministic midgame effect fixture,
 * not a full match or an estimated matchup result.
 *
 * @param {{hood: boolean, jammer: boolean, vmaxActive: boolean}} options
 * @returns {{hasUnderworldDoor: boolean, observedPowerNames: string[]}}
 */
function probeHood(options) {
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const engine = name => require(path.join(root, name));
  const { Store } = engine('game/store/store');
  const { State, GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { CheckPokemonPowersEffect } = engine('game/store/effects/check-effects');

  const manager = initializeCards();
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, 'Missing expected pinned card: ' + name);
    return result;
  };

  const iron = card('Iron Thorns ex TWM');
  const basic = card('Shadow Rider Calyrex V CRE');
  const vmax = card('Shadow Rider Calyrex VMAX CRE');
  const hood = options.hood ? card('Stealthy Hood UNB') : null;
  const jammer = options.jammer ? card('Tool Jammer BST') : null;

  const lockPlayer = new Player();
  lockPlayer.id = 101;
  lockPlayer.name = 'Iron Thorns';
  lockPlayer.active = new PokemonCardList();
  lockPlayer.active.cards.push(iron);
  if (jammer) lockPlayer.active.tools.push(jammer);

  const calyrexPlayer = new Player();
  calyrexPlayer.id = 202;
  calyrexPlayer.name = 'Shadow Rider';
  calyrexPlayer.active = new PokemonCardList();
  const protectedVMAX = new PokemonCardList();
  protectedVMAX.cards.push(basic, vmax);
  if (hood) protectedVMAX.tools.push(hood);

  if (options.vmaxActive) {
    calyrexPlayer.active = protectedVMAX;
    const target = new PokemonCardList();
    target.cards.push(card('Shadow Rider Calyrex V CRE'));
    calyrexPlayer.bench.push(target);
  } else {
    calyrexPlayer.active.cards.push(card('Shadow Rider Calyrex V CRE'));
    calyrexPlayer.bench.push(protectedVMAX);
  }

  const store = new Store({ onStateChange() {} });
  const state = new State();
  state.phase = GamePhase.WAITING_FOR_PLAYERS;
  state.players = [lockPlayer, calyrexPlayer];
  store.state = state;

  const query = new CheckPokemonPowersEffect(calyrexPlayer, vmax);
  store.reduceEffect(state, query);
  const names = query.powers.map(power => power.name);
  return { hasUnderworldDoor: names.includes('Underworld Door'), observedPowerNames: names };
}

/** @returns {object[]} All six deterministic scenarios and assertions. */
function runFixture() {
  const cases = [
    { hood: false, jammer: false, vmaxActive: false, expected: false },
    { hood: true, jammer: false, vmaxActive: false, expected: true },
    { hood: true, jammer: true, vmaxActive: false, expected: true },
    { hood: true, jammer: false, vmaxActive: true, expected: true },
    { hood: true, jammer: true, vmaxActive: true, expected: false },
    { hood: false, jammer: true, vmaxActive: true, expected: false }
  ];

  const upstreamAnomaly = probeHood({ hood: true, jammer: true, vmaxActive: true });
  assert.equal(upstreamAnomaly.hasUnderworldDoor, true,
    'Pinned upstream Tool Jammer defect changed: review whether the compatibility hook remains needed.');
  const restore = installToolJammerHook();
  try {
    return {
      upstreamAnomaly,
      correctedCases: cases.map(options => {
        const actual = probeHood(options);
        assert.equal(
          actual.hasUnderworldDoor, options.expected,
          'Underworld Door availability does not match positioned Tool text: ' + JSON.stringify(options)
        );
        return { ...options, ...actual };
      })
    };
  } finally {
    restore();
  }
}

if (require.main === module) {
  console.log(JSON.stringify({
    kind: 'pinned-twinleaf-state-level-ability-visibility-test',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    claims: 'Ability discovery only; no Underworld Door action or completed match',
    results: runFixture()
  }, null, 2));
}

module.exports = { probeHood, runFixture };
