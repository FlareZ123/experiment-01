'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));

/**
 * Genuine Stage-1 PlayCardAction on a staged legal midgame board.
 * Herdier SUM 104's Treasure Hunt is an on-evolution Ability that retrieves
 * one Item. The opposing lock is fully in play before evolution.
 * @param {'none'|'wobbuffet'|'garbotoxin-tool'|'garbotoxin-bare'|'silent-lab'|'iron-thorns'} lock
 * @param {boolean} [twoItems=false] Whether to test illicit two-Item selection
 * @returns {object}
 */
function probe(lock, twoItems = false) {
  const manager = initializeCards();
  let nextId = 1;
  /** @param {string} name */
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, 'Pinned engine lacks printing ' + name);
    result.id = nextId++;
    return result;
  };
  const { Store } = engine('game/store/store');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { CardList } = engine('game/store/state/card-list');
  const { GamePhase } = engine('game/store/state/state');
  const { Format } = engine('game/store/card/card-types');
  const { PlayCardAction, PlayerType, SlotType } =
    engine('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    engine('game/store/actions/resolve-prompt-action');
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 1;
  state.gameSettings.format = Format.EXPANDED;

  const opponent = new Player();
  opponent.id = 101;
  opponent.active.cards.push(card(lock === 'wobbuffet'
    ? 'Wobbuffet PHF' : lock === 'iron-thorns'
      ? 'Iron Thorns ex TWM' : 'Dialga-GX UPR'));
  if (lock === 'silent-lab') {
    opponent.stadium.cards.push(card('Silent Lab PRC'));
  }
  if (lock.startsWith('garbotoxin')) {
    const garb = new PokemonCardList();
    garb.cards.push(card('Trubbish BKP'), card('Garbodor BKP'));
    if (lock === 'garbotoxin-tool') {
      garb.tools.push(card('Stealthy Hood UNB'));
    }
    opponent.bench.push(garb);
  }

  const player = new Player();
  player.id = 202;
  player.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const evolvingSlot = new PokemonCardList();
  const lillipup = card('Lillipup CEC');
  evolvingSlot.cards.push(lillipup);
  player.bench.push(evolvingSlot);
  state.players = [opponent, player];

  const incoming = card('Herdier SUM');
  const retrievedItem = card('Switch SVI');
  const secondItem = twoItems ? card('Ultra Ball SVI') : null;
  player.hand.cards.push(incoming);
  player.discard.cards.push(retrievedItem);
  if (secondItem) player.discard.cards.push(secondItem);
  for (const side of state.players) {
    side.deck.cards.push(card('Psychic Energy SVE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      side.prizes.push(prize);
    }
  }

  store.dispatch(new PlayCardAction(player.id, 0, {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
  }));
  const prompts = [];
  let allowedTwoItemSelection = null;
  let itemPromptMax = null;
  for (let n = 0; n < 5; n++) {
    const pending = state.prompts.find(prompt => prompt.result === undefined);
    if (!pending) break;
    prompts.push(pending.constructor.name);
    if (pending.constructor.name === 'ConfirmPrompt') {
      store.dispatch(new ResolvePromptAction(pending.id, true));
    } else if (pending.constructor.name === 'ChooseCardsPrompt') {
      const wanted = secondItem ? [retrievedItem, secondItem] : [retrievedItem];
      allowedTwoItemSelection = secondItem ? pending.validate(wanted) : null;
      itemPromptMax = pending.options.max;
      const selection = allowedTwoItemSelection ? wanted : [retrievedItem];
      assert.equal(pending.validate(selection), true,
        'Treasure Hunt must permit a legal Item selection');
      store.dispatch(new ResolvePromptAction(pending.id, selection));
    } else {
      break;
    }
  }

  const evolved = evolvingSlot.getPokemonCard() === incoming;
  const recovered = player.hand.cards.includes(retrievedItem);
  const recoveredItemCount = [retrievedItem, secondItem]
    .filter(item => item && player.hand.cards.includes(item)).length;
  const expected = ['none', 'garbotoxin-bare', 'silent-lab', 'iron-thorns']
    .includes(lock);
  return {
    lock, twoItems, evolved, expectedRecoveryByPrintedRules: expected,
    recovered, recoveredItemCount,
    matchesPrintedExpectation: recovered === expected && recoveredItemCount <= 1,
    allowedTwoItemSelection, itemPromptMax,
    itemStillInDiscard: player.discard.cards.includes(retrievedItem),
    promptSequence: prompts,
    unhandledPrompts: state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor.name)
  };
}

/** @returns {object} */
function runTest() {
  const scenarios = [
    'none', 'wobbuffet', 'garbotoxin-tool', 'garbotoxin-bare',
    'silent-lab', 'iron-thorns'
  ];
  const records = [...scenarios.map(lock => probe(lock)), probe('none', true)];
  for (const record of records) {
    assert.equal(record.evolved, true, record.lock + ': real evolution failed');
  }
  return {
    schema: 'herdier-sum-on-evolution-item-recovery-lock-source-v1',
    engineRevision: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope: 'seven staged real Store evolution actions; no full-game performance',
    sourceFieldRanksWithHerdier: [2, 15],
    discrepancies: records.filter(record => !record.matchesPrintedExpectation),
    records,
    qualifiedForCompetitiveInference: false
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runTest(), null, 2) + '\n');
}

module.exports = { probe, runTest };
