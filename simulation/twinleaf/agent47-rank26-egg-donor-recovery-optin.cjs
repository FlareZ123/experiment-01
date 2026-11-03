'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Select an owner-visible action that reconstructs both 20-damaged Eggs
 * after the fourth original source self-KO. The fifth damage donor can
 * then be the surviving Egg rather than a damaged non-Egg. All checks are
 * based on public board/Prize state and this player's own zones.
 *
 * @param {object} state
 * @param {0|1} seat
 * @param {number} playerTurnPhase Native GamePhase.PLAYER_TURN, supplied by adapter.
 * @returns {{kind:'bench'|'propagate',index:number,benchIndex:number}|null}
 */
function eggDonorRecoveryChoice(state, seat, playerTurnPhase) {
  if (![0, 1].includes(seat)) return null;
  const own = state.players[seat];
  const opponent = state.players[1-seat];
  if (!own || !opponent || state.turn !== 1 ||
      state.activePlayer !== seat || state.phase !== playerTurnPhase ||
      state.prompts.some(p => p.result === undefined) ||
      opponent.prizes.filter(p => p.cards.length > 0).length !== 2 ||
      opponent.bench.some(slot => slot.getPokemonCard()) ||
      !own.hand.cards.some(c => c.name === 'Damage Pump') ||
      !own.stadium.cards.some(c => c.name === 'Risky Ruins')) {
    return null;
  }
  const eggsOnBench = own.bench.filter(slot =>
    slot.getPokemonCard()?.name === 'Exeggcute').length;
  const eggsAvailable = own.hand.cards.filter(c =>
    c.name === 'Exeggcute').length +
    own.discard.cards.filter(c => c.name === 'Exeggcute').length;
  const donor = own.bench.some(slot => slot.getPokemonCard() &&
    slot.getPokemonCard().name !== 'Exeggcute' && slot.damage >= 10);
  const empty = own.bench.findIndex(slot => !slot.getPokemonCard());
  if (donor || empty < 0 || eggsOnBench >= 2 ||
      eggsOnBench + eggsAvailable < 2) return null;

  const hand = own.hand.cards.findIndex(c => c.name === 'Exeggcute');
  if (hand >= 0) return {kind:'bench', index:hand, benchIndex:empty};
  const discarded = own.discard.cards.findIndex(c => c.name === 'Exeggcute');
  return discarded >= 0
    ? {kind:'propagate', index:discarded, benchIndex:empty}
    : null;
}

/**
 * Opt-in owner-only policy bridge for the fifth self-KO; default source
 * policies remain untouched. Reuses the actual engine actions and restores
 * the decoder after synchronous research. This wrapper is intentionally
 * separate from the frozen rank26 propagation-v1 source profile.
 *
 * @template T
 * @param {0|1} seat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withEggDonorRecovery(seat, execute) {
  if (![0, 1].includes(seat) || typeof execute !== 'function')
    throw new TypeError('Require a source seat and synchronous research call.');
  const {SimpleTacticsAi} =
    require(path.join(OUTPUT, 'simple-bot/simple-tactics-ai'));
  const {GamePhase} =
    require(path.join(OUTPUT, 'game/store/state/state'));
  const {PlayCardAction,PlayerType,SlotType} =
    require(path.join(OUTPUT, 'game/store/actions/play-card-action'));
  const {UseAbilityAction} =
    require(path.join(OUTPUT, 'game/store/actions/game-actions'));
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const id = seat === 0 ? 101 : 202;
  const events = [];
  SimpleTacticsAi.prototype.decodeNextAction = function donorRecovery(state) {
    if (state.phase !== GamePhase.PLAYER_TURN || this.client?.id !== id)
      return original.call(this,state);
    const choice = eggDonorRecoveryChoice(state,seat,GamePhase.PLAYER_TURN);
    if (!choice) return original.call(this,state);
    const location = {player:PlayerType.BOTTOM_PLAYER,
      slot:choice.kind === 'bench' ? SlotType.BENCH : SlotType.DISCARD,
      index:choice.kind === 'bench' ? choice.benchIndex : choice.index};
    const action = choice.kind === 'bench'
      ? new PlayCardAction(id,choice.index,location)
      : new UseAbilityAction(id,'Propagation',location);
    events.push({kind:choice.kind, action:action.constructor.name,
      sourceSeat:seat, remainingOpponentPrizes:2,
      source:'public board and Prize count, own hand/discard'});
    return action;
  };
  try {
    return {result:execute(),policyAudit:{
      version:'agent47-rank26-egg-donor-recovery-optin-v1',
      sourceSeat:seat,actions:events,
      qualifiedForCompetitiveInference:false
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction = original;
  }
}

module.exports = {eggDonorRecoveryChoice,withEggDonorRecovery};
