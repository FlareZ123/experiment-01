'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Remove precisely the generic HandScore "first Supporter in hand" bonus
 * after the acting player has spent that turn's normal Supporter play.
 *
 * This is a marginal, immediate-turn scoring correction, not a claim that
 * fetching a Supporter for a subsequent turn has zero strategic value.
 * Identical baseline-card scores preserve their original tie order.
 *
 * @template T
 * @param {readonly T[]} cards Cards in the native resolver's legal ordering.
 * @param {(card:T)=>number} score Native marginal card score.
 * @param {(card:T)=>boolean} isSupporter Check the pinned TrainerType.
 * @param {number} firstSupporterBonus Native HandScore option.
 * @returns {T[]} New ordering, with no card omitted or duplicated.
 */
function rerankSpentSupporterSearch(cards, score, isSupporter, firstSupporterBonus) {
  assert.ok(Number.isFinite(firstSupporterBonus) && firstSupporterBonus >= 0);
  return cards.map((card, index) => ({
    card, index,
    adjusted: score(card) - (isSupporter(card) ? firstSupporterBonus : 0)
  })).sort((a, b) => b.adjusted - a.adjusted || a.index - b.index)
    .map(entry => entry.card);
}

/**
 * Limit the intervention to a real unrestricted, non-cancellable, one-card
 * owner-deck search. A player already holding a Supporter receives no
 * spurious first-Supporter bonus in the native score.
 *
 * @param {object} prompt Pinned ChooseCardsPrompt.
 * @param {number} ownerId Actual candidate player ID.
 * @param {number} supporterType Pinned TrainerType.SUPPORTER.
 * @returns {boolean}
 */
function eligibleUnrestrictedSearch(prompt, ownerId, supporterType) {
  const owner = prompt?.player;
  return owner?.id === ownerId &&
    owner.supporterTurn > 0 &&
    !owner.hand.cards.some(card => card.trainerType === supporterType) &&
    prompt.cards === owner.deck &&
    prompt.options?.max === 1 &&
    prompt.options?.allowCancel === false &&
    Object.keys(prompt.filter ?? {}).length === 0;
}

/**
 * Reversible, research-owned one-ply prompt ranking policy. The same method
 * can be installed for either competing 60; the card list is the owner's deck
 * legally exposed by the search prompt, never the opponent's concealed zones.
 *
 * @template T
 * @param {0|1} candidateSeat Actual candidate physical seat.
 * @param {()=>T} execute Synchronous headless match.
 * @param {{resolverClass?:Function,supporterType?:number}} [injected]
 *   Pure-test seam; production values come from pinned Twinleaf.
 * @returns {{result:T,audit:object}}
 */
function withSpentSupporterSearch(candidateSeat, execute, injected={}) {
  assert.ok(candidateSeat === 0 || candidateSeat === 1);
  assert.equal(typeof execute, 'function');
  const engine = file => require(path.join(output, file));
  const Resolver = injected.resolverClass ??
    engine('simple-bot/prompt-resolver/choose-cards-prompt-resolver')
      .ChooseCardsPromptResolver;
  const supporterType = injected.supporterType ??
    engine('game/store/card/card-types').TrainerType.SUPPORTER;
  const previous = Resolver.prototype.buildCardsToChoose;
  assert.equal(typeof previous, 'function');
  const ownerId = candidateSeat === 0 ? 101 : 202;
  const events = [];

  function correctedBuild(state, prompt) {
    const native = previous.call(this, state, prompt);
    if (!eligibleUnrestrictedSearch(prompt, ownerId, supporterType)) {
      return native;
    }
    const bonus = this.options.scores.hand.hasSupporter;
    const next = rerankSpentSupporterSearch(native,
      card => this.stateScore.getCardScore(state, ownerId, card),
      card => card.trainerType === supporterType, bonus);
    events.push({
      turn: state.turn,
      nativeFirst: native[0]?.fullName ?? null,
      correctedFirst: next[0]?.fullName ?? null,
      candidates: native.length,
      firstSupporterBonusRemoved: bonus,
      status: 'proposal-only; prompt selection and game continuation not certified'
    });
    return next;
  }

  Resolver.prototype.buildCardsToChoose = correctedBuild;
  try {
    return {
      result: execute(),
      audit: {
        version: 'spent-supporter-unrestricted-search-v1',
        candidateSeat,
        events,
        competitiveQualifiedGames: 0,
        qualification: 'Score-order intervention only; must verify real Store prompt selection'
      }
    };
  } finally {
    assert.equal(Resolver.prototype.buildCardsToChoose, correctedBuild);
    Resolver.prototype.buildCardsToChoose = previous;
  }
}

module.exports = {
  rerankSpentSupporterSearch,
  eligibleUnrestrictedSearch,
  withSpentSupporterSearch
};
