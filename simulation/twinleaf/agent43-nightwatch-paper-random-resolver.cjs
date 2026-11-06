'use strict';

const path = require('node:path');
const { seededRandom } = require('./headless.cjs');

const BASE = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Uniformly sample distinct physical positions, without reading card identity.
 * A seeded PRNG provides reproducible diagnostic entropy, separate from the
 * native match random stream.
 * @param {number} size Number of cards in the opponent's hand.
 * @param {number} count Number of cards required by the printed attack.
 * @param {()=>number} random Random source with outputs in [0, 1).
 * @returns {number[]}
 */
function sampleDistinctHandPositions(size, count, random) {
  const remaining = Array.from({ length: size }, (_, i) => i);
  const selected = [];
  for (let k = 0; k < count; k++) {
    const chosen = Math.floor(random() * remaining.length);
    selected.push(remaining.splice(chosen, 1)[0]);
  }
  return selected;
}

/**
 * Detect only the original printed direct Night Watch hand-disruption prompt.
 * This intentionally excludes copied attacks, which need a broader effect
 * origin stamp before a paper-fidelity claim can be made.
 * @param {object} state Pinned native State.
 * @param {object} actor Pinned native Player answering the prompt.
 * @param {object} prompt Pinned native ChooseCardsPrompt.
 * @returns {boolean}
 */
function isDirectNightWatchHandPrompt(state, actor, prompt) {
  const opponent = state.players.find(p => p.id !== actor.id);
  return Boolean(
    opponent
    && state.players[state.activePlayer]?.id === actor.id
    && actor.active.getPokemonCard()?.fullName === 'Trevenant & Dusknoir-GX SMP'
    && prompt.constructor?.name === 'ChooseCardsPrompt'
    && prompt.playerId === actor.id
    && prompt.cards === opponent.hand
    && prompt.message === 'CHOOSE_CARD_TO_DISCARD'
    && prompt.options?.isSecret === true
    && prompt.options.allowCancel === false
    && prompt.options.min === prompt.options.max
    && Number.isInteger(prompt.options.min)
    && prompt.options.min >= 1
    && prompt.options.min <= 2
    && prompt.options.min <= opponent.hand.cards.length
  );
}

/**
 * A default-off, synchronous, research-owned direct Night Watch paper random
 * diagnostic. Returns a choice using only uniformly sampled physical indices.
 * It never sorts or scores opponent-held cards. The pinned vendor is untouched.
 *
 * This is NOT an official complete-paper-game patch: copied attacks and
 * independent legality or fairness constraints remain unverified.
 *
 * @template T
 * @param {()=>T} work Native synchronous research execution.
 * @param {{seed:number}} options Dedicated independent entropy seed.
 * @returns {{result:T,audit:{version:string,seed:number,samples:object[],restored:boolean,qualifiedGames:number}}}
 */
function withPaperRandomDirectNightWatch(work, options) {
  const { SimpleTacticsAi } = require(path.join(BASE, 'simple-bot/simple-tactics-ai'));
  const { ResolvePromptAction } = require(path.join(BASE,
    'game/store/actions/resolve-prompt-action'));
  const original = SimpleTacticsAi.prototype.resolvePrompt;
  const seed = options.seed >>> 0;
  const random = seededRandom(seed);
  const samples = [];
  const audit = {
    version: 'agent43-direct-night-watch-index-random-v1',
    seed, samples, restored: false, qualifiedGames: 0
  };
  SimpleTacticsAi.prototype.resolvePrompt = function (actor, state, prompt) {
    if (!isDirectNightWatchHandPrompt(state, actor, prompt)) {
      return original.call(this, actor, state, prompt);
    }
    const count = prompt.options.min;
    const indices = sampleDistinctHandPositions(
      prompt.cards.cards.length, count, random
    );
    const chosen = indices.map(i => prompt.cards.cards[i]);
    if (prompt.validate(chosen, state) !== true) {
      throw new Error('Night Watch randomly selected physical hand pair failed native prompt validation');
    }
    const seat = state.players.findIndex(p => p.id === actor.id);
    samples.push({
      seat, turn: state.turn, promptId: prompt.id,
      physicalHandSize: prompt.cards.cards.length,
      count, sampledIndices: indices,
      ownerHiddenCardNamesReadForDecision: false,
      nativePromptValidated: true
    });
    return new ResolvePromptAction(prompt.id, chosen);
  };
  try {
    return { result: work(), audit };
  } finally {
    SimpleTacticsAi.prototype.resolvePrompt = original;
    audit.restored = SimpleTacticsAi.prototype.resolvePrompt === original;
  }
}

module.exports = {
  sampleDistinctHandPositions,
  isDirectNightWatchHandPrompt,
  withPaperRandomDirectNightWatch
};
