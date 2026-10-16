'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const engine = name => require(path.join(__dirname,
  '../../vendor/twinleaf/ptcg-server/output', name));

/** @param {boolean} supporterAtFront */
function fixture(supporterAtFront) {
  const manager = initializeCards();
  let nextId = 1;
  /** @param {string} name */
  function card(name) {
    const value = manager.getCardByName(name);
    assert.ok(value, 'Missing card: ' + name);
    value.id = nextId++;
    return value;
  }
  const { State, GamePhase } = engine('game/store/state/state');
  const { Player } = engine('game/store/state/player');
  const { CardList } = engine('game/store/state/card-list');
  const { GameSettings } = engine('game/core/game-settings');
  const { Format } = engine('game/store/card/card-types');
  const own = new Player();
  own.id = 101;
  own.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  own.hand.cards.push(card('Pokegear SVI'));
  const hidden = Array.from({length: 17}, () => card('Psychic Energy SVE'));
  const arven = card('Arven SVI');
  if (supporterAtFront) hidden.unshift(arven);
  else hidden.push(arven);
  own.deck.cards.push(...hidden);
  for (let n = 0; n < 34; n++) own.discard.cards.push(card('Psychic Energy SVE'));

  const other = new Player();
  other.id = 202;
  other.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for (let n = 0; n < 18; n++) other.deck.cards.push(card('Psychic Energy SVE'));
  for (let n = 0; n < 35; n++) other.discard.cards.push(card('Psychic Energy SVE'));
  for (const player of [own, other]) {
    for (let n = 0; n < 6; n++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state = new State();
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = 0;
  state.turn = 4;
  state.players = [own, other];
  const settings = new GameSettings();
  settings.format = Format.EXPANDED;
  state.gameSettings = settings;
  state.rules = settings.rules;
  return state;
}

/** @returns {object} An information-set differential from pinned Twinleaf. */
function runAudit() {
  const { PlayTrainerTactic } = engine('simple-bot/simple-tactics/play-trainer-tactic');
  const { allPromptResolvers, defaultStateScores, defaultArbiterOptions } =
    engine('simple-bot/simple-bot-definitions');
  const options = {
    scores: defaultStateScores,
    promptResolvers: allPromptResolvers,
    arbiter: defaultArbiterOptions
  };
  const left = fixture(true);
  const right = fixture(false);
  const signature = state => JSON.stringify(state.players.map(p => ({
    active: p.active.cards.map(c => c.fullName),
    hand: p.hand.cards.map(c => c.fullName),
    deckMultiset: p.deck.cards.map(c => c.fullName).sort(),
    discard: p.discard.cards.map(c => c.fullName).sort(),
    prizes: p.prizes.length
  })));
  assert.equal(signature(left), signature(right), 'Visible states and deck multiset differ');
  const decisions = [left, right].map(state => {
    const action = new PlayTrainerTactic(options).useTactic(state, state.players[0]);
    return action?.constructor.name || 'no-action';
  });
  assert.deepEqual(decisions.slice().sort(), ['PlayCardAction', 'no-action'].sort(),
    'Expected the hypothetical Item choice to depend on unrevealed deck order');
  return {
    kind: 'pinned-twinleaf-information-set-audit',
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scenario: 'Pokégear 3.0 with one Arven and 17 Psychic Energy hidden in deck',
    supporterAtFirstIndex: decisions[0],
    supporterAtLastIndex: decisions[1],
    invariantVisibleState: true,
    scope: 'Injected midgame decision; not a win-rate estimate'
  };
}
if (require.main === module) console.log(JSON.stringify(runAudit(), null, 2));
module.exports = { fixture, runAudit };
