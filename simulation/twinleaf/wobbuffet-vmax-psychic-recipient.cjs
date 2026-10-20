'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

/**
 * Choose a Benched Shadow Rider VMAX that is closest to its first three
 * attached basic Psychic Energy, without inspecting concealed zones.
 * An attack-ready VMAX is left alone; equal candidates use Bench order.
 *
 * @param {object} own Pinned Player, with only own public board inspected.
 * @returns {{index:number,psychicBefore:number}|null}
 */
function chooseWobbuffetVmaxRecipient(own) {
  if (own?.active?.getPokemonCard?.()?.name !== 'Wobbuffet') return null;
  let best = null;
  for (let index = 0; index < own.bench.length; index++) {
    const slot = own.bench[index];
    if (slot.getPokemonCard()?.name !== 'Shadow Rider Calyrex VMAX') continue;
    const psychicBefore = slot.energies.cards.filter(
      card => card.name === 'Psychic Energy').length;
    if (psychicBefore >= 3) continue;
    if (best === null || psychicBefore > best.psychicBefore) {
      best = {index, psychicBefore};
    }
  }
  return best;
}

/**
 * Redirect only an already-proposed legal manual Psychic attachment away from
 * non-ready VMAX when Wobbuffet is Active. The same rule works on either deck;
 * it never reads opponent hand, Deck, Prizes or hidden card identifiers.
 * This does not improve Underworld Door prompt choices, proactive attachments,
 * or the upstream bot's separate hidden-information problems.
 *
 * @template T
 * @param {0|1} seat Candidate physical seat.
 * @param {()=>T} execute Synchronous Store match runner.
 * @param {object} [injected] Unit seam for pinned engine constructors.
 * @returns {{result:T,policyAudit:object}}
 */
function withWobbuffetVmaxPsychicRecipient(seat, execute, injected) {
  assert.ok(seat === 0 || seat === 1);
  assert.equal(typeof execute, 'function');
  const load = name => require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output', name));
  const {SimpleTacticsAi, GamePhase, PlayCardAction, PlayerType, SlotType} =
    injected || {
      SimpleTacticsAi:load('simple-bot/simple-tactics-ai').SimpleTacticsAi,
      GamePhase:load('game/store/state/state').GamePhase,
      ...load('game/store/actions/play-card-action')
    };
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = seat === 0 ? 101 : 202;
  const events = [];
  const override = function vmaxPsychicRecipient(state) {
    const proposed = previous.call(this, state);
    const own = state.players[seat];
    if (this.client?.id !== sourceId || !own ||
        state.activePlayer !== seat || state.phase !== GamePhase.PLAYER_TURN ||
        own.energyPlayedTurn >= state.turn ||
        state.prompts.some(prompt => prompt.result === undefined) ||
        !(proposed instanceof PlayCardAction) ||
        own.hand.cards[proposed.handIndex]?.name !== 'Psychic Energy') {
      return proposed;
    }
    const recipient = chooseWobbuffetVmaxRecipient(own);
    if (!recipient) return proposed;
    const target = {
      player: PlayerType.BOTTOM_PLAYER,
      slot: SlotType.BENCH,
      index: recipient.index
    };
    if (proposed.target?.player === target.player &&
        proposed.target.slot === target.slot &&
        proposed.target.index === target.index) return proposed;
    const replacement = new PlayCardAction(own.id, proposed.handIndex, target);
    if (!this.isValidAction(state, replacement)) {
      events.push({kind:'native-rejected-vmax-target',turn:state.turn,
        psychicBefore:recipient.psychicBefore,recipientIndex:recipient.index});
      return proposed;
    }
    events.push({kind:'redirect-psychic-to-vmax',turn:state.turn,
      psychicBefore:recipient.psychicBefore,recipientIndex:recipient.index,
      from:proposed.target});
    return replacement;
  };
  SimpleTacticsAi.prototype.decodeNextAction = override;
  try {
    return {result:execute(),policyAudit:{
      version:'wobbuffet-vmax-manual-psychic-recipient-v1',
      seat,events,hiddenInformationSafeFullGame:false,
      actualGameWinEvidence:false
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,override,
      'Shared decodeNextAction hook changed during synchronous runner');
    SimpleTacticsAi.prototype.decodeNextAction = previous;
  }
}

module.exports = {chooseWobbuffetVmaxRecipient,
  withWobbuffetVmaxPsychicRecipient};
