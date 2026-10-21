'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Limited public and acting-owner snapshot for native Store veto comparison.
 * @param {object} state Real native State.
 * @param {0|1} candidateSeat Actual candidate seat.
 */
function attackProbeSnapshot(state, candidateSeat) {
  const actor = state.players[candidateSeat];
  const other = state.players[1 - candidateSeat];
  return {
    turn: state.turn,
    phase: state.phase,
    activePlayer: state.activePlayer,
    active: actor.active.getPokemonCard()?.fullName ?? null,
    activeDamage: actor.active.damage,
    activeEnergies: actor.active.energies.cards.map(c => c.fullName),
    hand: actor.hand.cards.map(c => c.fullName),
    ownBench: actor.bench.map(s => s.getPokemonCard()?.fullName ?? null),
    sourceActive: other.active.getPokemonCard()?.fullName ?? null,
    sourceBench: other.bench.map(s => s.getPokemonCard()?.fullName ?? null),
    ownPrizeCount: actor.prizes.filter(p => p.cards.length > 0).length,
    sourcePrizeCount: other.prizes.filter(p => p.cards.length > 0).length,
    gxIndicators: Object.fromEntries(Object.entries(actor)
      .filter(([k, v]) => /gx|attack/i.test(k) &&
        (typeof v === 'boolean' || typeof v === 'number')))
  };
}

/**
 * At one genuine source-dealt rank15 paid-BUS candidate t19 root, attempt
 * native Store.dispatch of the actor's printed Miraculous Duo-GX. This is
 * an intentionally aborted, independent counterfactual branch: never permit
 * the main match to continue after a rejected action could have partly
 * mutated native State. Neither player's unseen zones are read.
 *
 * @template T
 * @param {Function} Store Pinned native Store class.
 * @param {()=>T} execute Entire source-dealt paid retreat replay.
 * @param {0|1} candidateSeat Candidate physical seat.
 * @returns {{schema:string,attempt:object|null,stoppedAtProbe:boolean}}
 */
function withRank15T19GenuineBasicAttackVeto(Store, execute, candidateSeat) {
  assert.equal(typeof execute, 'function');
  assert.ok(candidateSeat === 0 || candidateSeat === 1);
  const {GamePhase} = require(path.join(OUTPUT, 'game/store/state/state'));
  const {AttackAction} = require(path.join(OUTPUT,
    'game/store/actions/game-actions'));
  const original = Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value, 'function');

  const stop = new Error('rank15 t19 native attack counterfactual deliberately stopped');
  let root = null;
  let attempt = null;

  function dispatch(action, ...args) {
    const type = action?.constructor?.name;
    if (root === null && type === 'AddPlayerAction') root = this;
    const state = this.state;
    if (this === root && attempt === null &&
        state?.turn === 19 &&
        state.activePlayer === candidateSeat &&
        state.phase === GamePhase.PLAYER_TURN &&
        !state.prompts.some(p => p.result === undefined) &&
        ['PlayCardAction','PassTurnAction','AttackAction','RetreatAction'].includes(type) &&
        state.players[candidateSeat].active.getPokemonCard()?.fullName ===
          'Mewtwo & Mew-GX UNM' &&
        state.players[1 - candidateSeat].active.getPokemonCard()?.fullName ===
          'Vileplume BUS' &&
        state.players[1 - candidateSeat].bench.some(s =>
          s.getPokemonCard()?.fullName === 'Vileplume AOR')) {
      const prior = attackProbeSnapshot(state,candidateSeat);
      const printedAction = new AttackAction(
        state.players[candidateSeat].id, 'Miraculous Duo-GX');
      let nativeAccepted = false;
      let rejection = null;
      try {
        original.value.call(this, printedAction);
        nativeAccepted = true;
      } catch (e) {
        rejection = {name: e?.name ?? null, message: String(e?.message ?? e)};
      }
      const after = attackProbeSnapshot(this.state,candidateSeat);
      attempt = {
        sourceRootDecisionType: type,
        printedAttack: 'Miraculous Duo-GX',
        realStoreDispatchAttempted: true,
        nativeAccepted,
        rejection,
        prior,
        after,
        publiclyObservableStateUnchanged:
          JSON.stringify(prior) === JSON.stringify(after),
        caveat: 'Aborted original-source branch; no candidate or source continuation'
      };
      // Intentional stop even if native accepted; safely isolate the fork
      // before generic policy can exploit an altered or invalid game state.
      throw stop;
    }
    return original.value.call(this, action, ...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
  let stopped = false;
  try {
    execute();
  } catch (e) {
    // headless wraps dispatch errors, retaining the exact original as cause.
    if (e !== stop && e?.cause !== stop) throw e;
    stopped = true;
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
  return {
    schema:'rank15-authentic-t19-basic-printed-attack-native-counterfactual-v1',
    attempt,stoppedAtProbe:stopped,
    competitiveGameQualified:false
  };
}

module.exports = {attackProbeSnapshot, withRank15T19GenuineBasicAttackVeto};
