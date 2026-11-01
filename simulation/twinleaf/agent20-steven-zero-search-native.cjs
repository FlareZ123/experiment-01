'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const {installStevenPaperMinimumHook} =
  require('./agent20-steven-paper-minimum-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));

/**
 * Genuine pinned Store witness for the printed Steven's Resolve CES 145.
 * Staged boards have original rank-7's Steven and Snorlax printings, not
 * authenticated natural deals or a complete original source 60.
 *
 * @param {0 | 1} seat Physical acting player seat.
 * @param {0 | 1} pickedCards Actual searched-card count.
 * @param {boolean} [paperGuard=false] Explicit opt-in reversible paper rule.
 * @returns {object} Physical prompt/zone receipt, not a game result.
 */
function probeStevenSearch(seat, pickedCards, paperGuard=false) {
  const manager = initializeCards();
  const { Store } = engine('game/store/store');
  const { Player } = engine('game/store/state/player');
  const { CardList } = engine('game/store/state/card-list');
  const { GamePhase } = engine('game/store/state/state');
  const { Format } = engine('game/store/card/card-types');
  const { PlayCardAction, PlayerType, SlotType } =
    engine('game/store/actions/play-card-action');
  const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');

  /** @param {string} name */
  const card = name => {
    const found = manager.getCardByName(name);
    assert.ok(found, 'Missing pinned printing: ' + name);
    return found;
  };
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const owner = new Player();
  const rival = new Player();
  owner.id = 701;
  rival.id = 702;
  owner.name = 'rank7 Snorlax';
  rival.name = 'controlled rival';
  state.players = seat === 0 ? [owner, rival] : [rival, owner];
  state.activePlayer = seat;
  state.turn = 3;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  owner.active.cards.push(card('Snorlax PGO'));
  rival.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for (const player of [owner, rival]) {
    player.prizes = Array.from({length: 6}, () => {
      const list = new CardList();
      list.cards.push(card('Dratini OBF'));
      return list;
    });
    player.deck.cards.push(card('Psychic Energy MEE'));
    player.deck.cards.push(card('Psychic Energy MEE'));
    player.deck.cards.push(card('Psychic Energy MEE'));
  }
  const steven = card("Steven's Resolve CES");
  owner.hand.cards.push(steven);
  const beforeDeck = owner.deck.cards.slice();
  const beforeTurn = state.turn;
  store.dispatch(new PlayCardAction(owner.id, 0, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  }));
  const prompt = state.prompts.find(p => p.result === undefined);
  assert.equal(prompt?.constructor.name, 'ChooseCardsPrompt');
  const min = prompt.options.min;
  const max = prompt.options.max;
  const sourceStamp=prompt.sourceCard?.fullName??null;
  const physicallyOwnedSearch=prompt.cards===owner.deck;
  const validatorAcceptedZero = prompt.validate([]);
  const choice = pickedCards === 0 ? [] : [beforeDeck[0]];
  const choiceValidated = prompt.validate(choice);
  const errors = [];
  let dispatched = false;
  const restore=paperGuard?installStevenPaperMinimumHook():()=>{};
  try {
    store.dispatch(new ResolvePromptAction(prompt.id, choice));
    dispatched = true;
  } catch (error) {
    errors.push(String(error?.message || error));
  } finally {
    restore();
  }
  const subsequentPrompts = [];
  for (let i = 0; dispatched && i < 12; i++) {
    const next = state.prompts.find(p => p.result === undefined);
    if (!next) break;
    const family = next.constructor.name;
    subsequentPrompts.push(family);
    const result = family === 'ShuffleDeckPrompt'
      ? owner.deck.cards.map((_, index) => index)
      : family === 'WaitPrompt' ? null : undefined;
    if (result === undefined) break;
    try { store.dispatch(new ResolvePromptAction(next.id, result)); }
    catch (error) { errors.push(String(error?.message || error)); break; }
  }
  return {
    seat, pickedCards, paperGuard, sourceStamp, physicallyOwnedSearch,
    sourcePrinting: "Steven's Resolve CES 145",
    originalRank: 7, nativePrompt: 'ChooseCardsPrompt',
    min, max, validatorAcceptedZero, choiceValidated,
    dispatched, errors,
    ownerHandAfter: owner.hand.cards.map(c => c.fullName),
    ownerDeckBefore: beforeDeck.length,
    ownerDeckAfter: owner.deck.cards.length,
    stevenInDiscard: owner.discard.cards.includes(steven),
    stevenInSupporterZone: owner.supporter.cards.includes(steven),
    nextTurnReached: state.turn > beforeTurn,
    subsequentPrompts,
    uncompletedPromptFamilies: state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor.name),
    opponentHandAfter: rival.hand.cards.map(c => c.fullName),
    opponentDeckAfter: rival.deck.cards.length
  };
}

/** @returns {object} Two-seat, zero-choice vs one-card positive controls. */
function run() {
  const rows = [], guardedRows=[];
  for (const seat of [0, 1]) {
    for (const pickedCards of [0, 1]) {
      rows.push(probeStevenSearch(seat, pickedCards));
      guardedRows.push(probeStevenSearch(seat, pickedCards,true));
    }
  }
  return {
    enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope: 'Staged native owner Store source-printing card. No actual opening, game, or win inference.',
    rows, guardedRows
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { probeStevenSearch, run };
