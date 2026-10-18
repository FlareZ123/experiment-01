'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

const DUO = Object.freeze(['Solrock CES', 'Lunatone OBF']);

/**
 * Determine which of the two New Moon partners are absent, based exclusively
 * on the owner's public Active/Bench. Never inspect hidden deck or Prize zones.
 *
 * @param {object} owner Acting player's own State.
 * @returns {{missing:string[],free:number,hasAttackCore:boolean}}
 */
function newMoonBenchNeeds(owner) {
  const cards = [owner.active.getPokemonCard(),
    ...owner.bench.map(slot => slot.getPokemonCard())]
    .filter(Boolean).map(card => card.fullName);
  const missing = DUO.filter(name => !cards.includes(name));
  const free = owner.bench.filter(slot => !slot.getPokemonCard()).length;
  return {
    missing, free,
    hasAttackCore: cards.includes('Mewtwo & Mew-GX UNM') &&
      cards.includes('Gengar & Mimikyu-GX TEU')
  };
}

/**
 * A printed Basic Pokémon play into an otherwise reserved slot is deferred.
 * The declared source actor's known deck family is an explicit intervention.
 * A desired member of the Solrock/Lunatone duo itself is never deferred.
 *
 * @param {object} action Pinned simple-bot proposed root action.
 * @param {object} owner Player's own source State.
 * @param {number} turn Actual global turn.
 * @param {number} phase Pinned GamePhase.PLAYER_TURN enum.
 * @param {number} activePhase GamePhase from State.
 * @returns {null|{name:string,free:number,missing:string[]}}
 */
function reservedBasicPlay(action, owner, turn, phase, activePhase) {
  if (phase !== activePhase || turn > 4 ||
      action?.constructor?.name !== 'PlayCardAction') return null;
  const need = newMoonBenchNeeds(owner);
  if (!need.hasAttackCore || !need.missing.length ||
      need.free > need.missing.length) return null;
  const card = owner.hand.cards[action.handIndex];
  if (!card || !card.fullName ||
      card.stage === undefined || card.stage === null ||
      need.missing.includes(card.fullName)) return null;
  return {name:card.fullName,free:need.free,missing:need.missing};
}

/**
 * Source-revision-bound *policy* variant, not a game-rule correction.
 * When PlayBasicTactic would consume a space specifically reserved for
 * Solrock/Lunatone, preserve it and try later standard tactics instead.
 * The known bot tactic order and legal-action validator are confirmed in
 * Twinleaf a9905a76 simple-bot-definitions.ts and simple-tactics-ai.ts.
 *
 * @template T
 * @param {()=>T} execute Synchronous source-dealt match.
 * @param {0|1} candidateSeat Fixed candidate's physical seat.
 * @returns {{result:T,audit:object}}
 */
function withNewMoonBenchReservation(execute, candidateSeat) {
  assert.equal(typeof execute,'function');
  assert.ok(candidateSeat === 0 || candidateSeat === 1);
  const {SimpleTacticsAi} = require(path.join(OUTPUT,'simple-bot/simple-tactics-ai'));
  const {PassTurnAction,PlayCardAction} =
    require(path.join(OUTPUT,'game/store/actions/game-actions'));
  const {GamePhase} = require(path.join(OUTPUT,'game/store/state/state'));
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const id = candidateSeat === 0 ? 101 : 202;
  const events = [];

  const handle = function reservedBenchAction(state) {
    if (this.client?.id !== id ||
        state.activePlayer !== candidateSeat ||
        state.phase !== GamePhase.PLAYER_TURN ||
        state.prompts.some(prompt => prompt.result === undefined)) {
      return original.call(this,state);
    }
    const player = state.players[candidateSeat];
    const suggested = original.call(this,state);
    const defer = reservedBasicPlay(
      suggested,player,state.turn,state.phase,GamePhase.PLAYER_TURN);
    if (!defer) return suggested;
    const tactics = this.tactics;
    assert.ok(Array.isArray(tactics),'Pinned bot tactic list unavailable');
    const index = tactics.findIndex(tactic =>
      tactic.constructor.name === 'PlayBasicTactic');
    assert.ok(index >= 0,'Pinned PlayBasicTactic not found');
    // The standard bot has already deemed earlier tactics non-actions.
    // Continue from the next tactic instead of forcing an early Pass.
    let replacement = new PassTurnAction(player.id);
    for (let i = index + 1; i < tactics.length; i++) {
      const action = tactics[i].useTactic(state,player);
      if (action !== undefined && this.isValidAction(state,action)) {
        replacement = action;
        break;
      }
    }
    if (events.length < 128) {
      events.push({turn:state.turn,kind:'reserve-bench-over-basic',
        proposed:defer.name,freeBefore:defer.free,
        missingPartners:defer.missing,
        selectedAction:replacement.constructor.name,
        selectedCard:replacement.constructor.name==='PlayCardAction' ?
          player.hand.cards[replacement.handIndex]?.fullName || null : null});
    }
    return replacement;
  };
  SimpleTacticsAi.prototype.decodeNextAction=handle;
  try {
    return {result:execute(),audit:{
      schema:'newmoon-two-slot-bench-reservation-v1',
      candidateSeat,events,competitivePolicyQualified:false
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,handle);
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={DUO,newMoonBenchNeeds,reservedBasicPlay,
  withNewMoonBenchReservation};
