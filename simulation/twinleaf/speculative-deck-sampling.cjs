'use strict';

const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
let activeRestore = null;

/**
 * Fisher-Yates sample from a canonical card-name multiset.
 * Sorting first ensures the same random stream gives an identical imagined
 * multiset order for two states differing only in actual hidden deck order.
 * The supplied array must belong to a private Simulator state clone.
 *
 * @param {object[]} cards
 * @param {() => number} random Research policy RNG, never game-event RNG.
 */
function sampleDeckOrder(cards, random) {
  for (const card of cards) {
    if (typeof card?.fullName !== 'string' || !card.fullName) {
      throw new Error('Speculative cards require resolved fullName identifiers.');
    }
  }
  cards.sort((a, b) => a.fullName < b.fullName ? -1 :
    a.fullName > b.fullName ? 1 : 0);
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = cards[i];
    cards[i] = cards[j];
    cards[j] = tmp;
  }
  return cards;
}

/**
 * Opt-in speculative-only Twinleaf hook. The original state is deep-cloned
 * by Simulator before hidden decks are sampled. Search prompt indices then
 * refer to the sampled clone, while the action returned to the real Store
 * retains its original hand/board targeting.
 *
 * This corrects only one demonstrated leak, actual unrevealed deck ORDER.
 * It does not mask hidden prize membership, opponent hand, known ordered
 * cards from prior effects, or tactics reading private state directly.
 * Use solely with a separate speculative-policy RNG.
 *
 * @param {{random:()=>number}} options
 * @returns {() => void} Revert the original Simulator export.
 */
function installSpeculativeDeckSampling(options) {
  if (activeRestore) throw new Error('Speculative sampling hook already installed.');
  if (typeof options?.random !== 'function') {
    throw new TypeError('An isolated speculative random source is required.');
  }
  const moduleRef = require(path.join(OUTPUT, 'game/bots/simulator'));
  const PriorSimulator = moduleRef.Simulator;
  const { random } = options;
  class SampledSimulator extends PriorSimulator {
    /** @param {object} state @param {object} [arbiterOptions] */
    constructor(state, arbiterOptions) {
      super(state, arbiterOptions);
      for (const player of this.store.state.players) {
        sampleDeckOrder(player.deck.cards, random);
      }
    }
  }
  moduleRef.Simulator = SampledSimulator;
  const restore = () => {
    if (moduleRef.Simulator !== SampledSimulator) {
      throw new Error('Restore speculative Simulator hooks in reverse order.');
    }
    moduleRef.Simulator = PriorSimulator;
    activeRestore = null;
  };
  activeRestore = restore;
  return restore;
}

module.exports = { sampleDeckOrder, installSpeculativeDeckSampling };
