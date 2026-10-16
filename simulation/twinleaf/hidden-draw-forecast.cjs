'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { stagedRaichu } = require('./temple-raichu-board.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relativePath */
function engine(relativePath) {
  return require(path.join(output, relativePath));
}

/**
 * Inspect the pinned SimpleTacticsAi's speculative evaluation of a draw
 * Supporter. A player knows their remaining deck contents after a search,
 * but not the shuffled physical order of its unseen cards.
 *
 * The two states have identical public information and identical hand/deck
 * multisets. Only their inaccessible draw order changes.
 *
 * @returns {object} Source-backed real-engine decision-score diagnostic.
 */
function auditHiddenDrawForecast() {
  const { PlaySupporterTactic } =
    engine('simple-bot/simple-tactics/play-supporter-tactic');
  const { PlayCardAction, PlayerType, SlotType } =
    engine('game/store/actions/play-card-action');
  const defs = engine('simple-bot/simple-bot-definitions');
  const { CardList } = engine('game/store/state/card-list');

  /** @param {boolean} energyFirst */
  function prepare(energyFirst) {
    const f = stagedRaichu([], null);
    f.state.turn = 4;
    f.a.supporterTurn = 0;
    f.a.hand.cards.push(f.card("Professor's Research JTG"));
    const energies = Array.from({length: 7},
      () => f.card('Double Dragon Energy ROS'));
    const pokemons = Array.from({length: 7},
      () => f.card('Shadow Rider Calyrex V CRE'));
    f.a.deck.cards.push(...(energyFirst ?
      [...energies, ...pokemons] : [...pokemons, ...energies]));
    f.b.deck.cards.push(f.card('Shadow Rider Calyrex V CRE'));

    for (const p of [f.a, f.b]) {
      p.prizes = Array.from({length: 6}, () => {
        const pile = new CardList();
        pile.cards.push(f.card('Shadow Rider Calyrex V CRE'));
        return pile;
      });
    }
    let id = 1;
    for (const p of [f.a, f.b]) {
      for (const zone of [p.active, p.hand, p.deck, p.discard,
        p.stadium, ...p.prizes, ...p.bench]) {
        for (const card of zone.cards) card.id = id++;
      }
    }
    return f;
  }

  const energyTop = prepare(true);
  const pokemonTop = prepare(false);
  const sameMultiset = f => f.a.deck.cards.map(c => c.fullName).sort();
  assert.deepEqual(sameMultiset(energyTop), sameMultiset(pokemonTop),
    'Only hidden deck order may change');
  assert.deepEqual(energyTop.a.hand.cards.map(c => c.fullName),
    pokemonTop.a.hand.cards.map(c => c.fullName),
    'The visible Supporter hand must be identical');

  const options = {
    tactics: defs.allSimpleTactics,
    promptResolvers: defs.allPromptResolvers,
    scores: defs.defaultStateScores,
    arbiter: defs.defaultArbiterOptions
  };
  /** @param {ReturnType<typeof prepare>} fixture */
  function score(fixture) {
    const tactic = new PlaySupporterTactic(options);
    const action = new PlayCardAction(fixture.a.id, 0,
      {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0});
    return tactic.evaluateAction(fixture.state, fixture.a.id, action);
  }
  const energyTopScore = score(energyTop);
  const pokemonTopScore = score(pokemonTop);
  assert.equal(typeof energyTopScore, 'number',
    'Research Supporter evaluation must complete in pinned engine');
  assert.equal(typeof pokemonTopScore, 'number',
    'Research Supporter evaluation must complete in pinned engine');
  assert.notEqual(energyTopScore, pokemonTopScore,
    'Speculative evaluation must be sensitive to hidden upcoming draws');

  return {
    pinnedEngine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    identicalVisibleStateAndDeckMultiset: true,
    energyTopScore, pokemonTopScore,
    leaksUnseenDrawOrderIntoSpeculativeActionScore: true,
    scope: 'Prepared state and one speculative Supporter; this does not prove an actual choice changes or measure wins'
  };
}
if (require.main === module) {
  console.log(JSON.stringify(auditHiddenDrawForecast(), null, 2));
}
module.exports = { auditHiddenDrawForecast };
