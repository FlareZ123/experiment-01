'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('../actor-observation-contract.cjs');

const VERSION = 'agent42-owner-visible-path-versus-genesect-after-pass-v1';
const PATH = 'Path to the Peak CRE';
const GENESECT = 'Genesect V FST';

/**
 * Proposed public, symmetric counter to a live Fusion Strike System.
 * The holder's hidden deck, Prize identities and opponent hand are excluded.
 *
 * @param {object} view Detached owner-root actor observation.
 * @returns {{printing:string,handIndex:number}|null}
 */
function choosePathAfterPass(view) {
  if (view?.decisionKind !== 'owner-root' ||
      view.globalTurn <= 1 ||
      !Array.isArray(view.ownHand) ||
      view.ownTurnResources?.stadiumPlayLocked ||
      view.ownPublic?.publicTurnRestrictions?.stadiumPlayLocked ||
      view.ownTurnResources?.stadiumPlayedTurn === view.globalTurn) return null;

  const handIndex = view.ownHand.indexOf(PATH);
  if (handIndex < 0) return null;
  const own = view.ownPublic, opponent = view.opponentPublic;
  if (!Array.isArray(own?.stadium) || !Array.isArray(opponent?.stadium) ||
      !Array.isArray(own?.bench) || !Array.isArray(opponent?.bench)) return null;
  if ([...own.stadium, ...opponent.stadium].includes(PATH)) return null;

  // Rule-box Ability suppression is mutual. Do not disable our own Genesect.
  const allOwn = [own.active, ...own.bench].filter(Boolean);
  const allOpponent = [opponent.active, ...opponent.bench].filter(Boolean);
  const isFusionSystem = pokemon =>
    pokemon?.printing === GENESECT &&
    Array.isArray(pokemon.abilities) &&
    pokemon.abilities.includes('Fusion Strike System');
  if (allOwn.some(isFusionSystem) || !allOpponent.some(isFusionSystem))
    return null;
  return {printing: PATH, handIndex};
}

/**
 * Run one native match with a genuine Store-accepted owner-held Stadium
 * replacement on an otherwise proposed Pass. Installed inside the canonical
 * actor wrapper for the individual match, on both seats equally.
 *
 * @template T
 * @param {()=>T} execute Synchronous actual headless runMatch call.
 * @param {object} [deps] Test substitutions.
 * @returns {{result:T,audit:object}}
 */
function withOwnerPathAfterPass(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const base = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
  const Bot = deps.Bot ??
    require(path.join(base, 'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store = deps.Store ??
    require(path.join(base, 'game/store/store')).Store;
  const {PlayCardAction, PlayerType, SlotType} = deps.cardActions ??
    require(path.join(base, 'game/store/actions/play-card-action'));
  const GamePhase = deps.GamePhase ??
    require(path.join(base, 'game/store/state/state')).GamePhase;
  const observe = deps.observe ?? actorObservation;
  const priorDecode = Object.getOwnPropertyDescriptor(Bot.prototype, 'decodeNextAction');
  const priorDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof priorDecode?.value, 'function');
  assert.equal(typeof priorDispatch?.value, 'function');

  const attempts = new WeakMap();
  const audit = {version: VERSION, bothSeats: true,
    passObserved: 0, proposed: 0, accepted: 0, rejected: 0,
    events: [], fullPaperQualified: false, competitiveGames: 0};
  function replacement(state, ...args) {
    const action = priorDecode.value.call(this, state, ...args);
    if (action?.constructor?.name !== 'PassTurnAction' ||
        state?.phase !== GamePhase.PLAYER_TURN ||
        state.prompts.some(prompt => prompt.result === undefined)) return action;
    const seat = state.players.findIndex(player => player.id === this.client?.id);
    if (seat !== 0 && seat !== 1 || state.activePlayer !== seat)
      return action;
    audit.passObserved++;
    const view = observe(state, seat);
    const choice = choosePathAfterPass(view);
    if (!choice) return action;
    const next = new PlayCardAction(state.players[seat].id, choice.handIndex, {
      player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
    });
    attempts.set(next, {seat, turn: state.turn, card: choice.printing,
      opponentGenesectCount: [view.opponentPublic.active,
        ...view.opponentPublic.bench].filter(p =>
        p?.printing === GENESECT).length});
    audit.proposed++;
    return next;
  }
  function dispatched(action, ...args) {
    const proposal = attempts.get(action);
    try {
      const result = priorDispatch.value.call(this, action, ...args);
      if (proposal) {
        audit.accepted++;
        const player = this.state.players[proposal.seat];
        audit.events.push({...proposal, accepted: true,
          stadiumAfter: player.stadium.cards.map(c => c.fullName),
          pathStillInHand: player.hand.cards.some(c => c.fullName === PATH)});
      }
      return result;
    } catch (error) {
      if (proposal) {
        audit.rejected++;
        audit.events.push({...proposal, accepted: false,
          error: String(error?.message ?? error)});
      }
      throw error;
    }
  }
  Object.defineProperty(Bot.prototype, 'decodeNextAction',
    {...priorDecode, value: replacement});
  Object.defineProperty(Store.prototype, 'dispatch',
    {...priorDispatch, value: dispatched});
  try {
    return {result: execute(), audit};
  } finally {
    assert.strictEqual(Bot.prototype.decodeNextAction, replacement);
    assert.strictEqual(Store.prototype.dispatch, dispatched);
    Object.defineProperty(Bot.prototype, 'decodeNextAction', priorDecode);
    Object.defineProperty(Store.prototype, 'dispatch', priorDispatch);
  }
}

module.exports = {VERSION, PATH, GENESECT, choosePathAfterPass,
  withOwnerPathAfterPass};
