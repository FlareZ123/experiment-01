'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installArticunoEntryLockHook } = require('./articuno-entry-lock-hook.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Dispatch a real Bench entry for source-printing Articuno-GX CES 31, and
 * resolve its optional Legendary Ascent prompt on a zero-Water-Energy board.
 * @param {'none'|'iron-thorns'|'klefki'|'path'|'silent-lab'|'garbotoxin-tool'|'garbotoxin-bare'} lock
 * @param {boolean} useCologne
 * @returns {object}
 */
function probeArticunoEntry(lock, useCologne = false) {
  const manager = initializeCards();
  let nextId = 1;
  /** @param {string} name */
  function card(name) {
    const found = manager.getCardByName(name);
    assert.ok(found, 'Missing pinned card ' + name);
    found.id = nextId++;
    return found;
  }
  const { Store } = load('game/store/store');
  const { GamePhase } = load('game/store/state/state');
  const { Player } = load('game/store/state/player');
  const { CardList } = load('game/store/state/card-list');
  const { PokemonCardList } = load('game/store/state/pokemon-card-list');
  const { Format } = load('game/store/card/card-types');
  const { PlayCardAction, PlayerType, SlotType } =
    load('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    load('game/store/actions/resolve-prompt-action');

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 1;
  state.gameSettings.format = Format.EXPANDED;

  const opponent = new Player();
  opponent.id = 101;
  opponent.active.cards.push(card(lock === 'iron-thorns'
    ? 'Iron Thorns ex TWM' : lock === 'klefki'
      ? 'Klefki SVI' : 'Dialga-GX UPR'));
  if (lock === 'path') opponent.stadium.cards.push(card('Path to the Peak CRE'));
  if (lock === 'silent-lab') opponent.stadium.cards.push(card('Silent Lab PRC'));
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
  const previousActive = card('Shadow Rider Calyrex V CRE');
  player.active.cards.push(previousActive);
  player.bench.push(new PokemonCardList());
  state.players = [opponent, player];

  const incoming = card('Articuno-GX CES');
  const cologne = useCologne ? card('Canceling Cologne ASR') : null;
  player.hand.cards.push(incoming);
  if (cologne) player.hand.cards.push(cologne);
  for (let i = 0; i < 12; i++) player.deck.cards.push(card('Psychic Energy SVE'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  for (const side of state.players) {
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      side.prizes.push(prize);
    }
  }

  /** @param {object} played @param {object} target */
  function play(played, target) {
    const index = player.hand.cards.indexOf(played);
    assert.ok(index >= 0, 'Card to play must be in hand');
    store.dispatch(new PlayCardAction(player.id, index, target));
  }
  /** @returns {object|undefined} */
  function pending() {
    return state.prompts.find(prompt => prompt.result === undefined);
  }
  if (cologne) {
    play(cologne, { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 });
  }
  play(incoming, {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
  });
  const offered = pending()?.constructor.name === 'ConfirmPrompt';
  if (offered) {
    store.dispatch(new ResolvePromptAction(pending().id, true));
  }
  return {
    lock, useCologne, offered,
    articunoActive: player.active.getPokemonCard() === incoming,
    oldActiveBenched: player.bench.some(slot => slot.getPokemonCard() === previousActive),
    articunoBenched: player.bench.some(slot => slot.getPokemonCard() === incoming),
    unresolvedPrompts: state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor.name)
  };
}

/** @returns {object} */
function runTest() {
  const scenarios = [
    ['none', false, true],
    ['iron-thorns', false, false],
    ['iron-thorns', true, true],
    ['klefki', false, false],
    ['klefki', true, true],
    ['path', false, false],
    ['silent-lab', false, false],
    ['garbotoxin-tool', false, false],
    ['garbotoxin-bare', false, true]
  ];
  const run = () => scenarios.map(([lock, cologne]) =>
    probeArticunoEntry(lock, cologne));
  const source = run();
  const restore = installArticunoEntryLockHook();
  try {
    const guarded = run();
    for (let i = 0; i < guarded.length; i++) {
      const expected = scenarios[i][2];
      const row = guarded[i];
      assert.equal(row.offered, expected, row.lock);
      assert.equal(row.articunoActive, expected, row.lock);
      assert.equal(row.oldActiveBenched, expected, row.lock);
      assert.equal(row.articunoBenched, !expected, row.lock);
      assert.deepEqual(row.unresolvedPrompts, [], row.lock);
    }
    for (const row of source) {
      assert.deepEqual(row.unresolvedPrompts, [], row.lock);
    }
    const raw = new Map(source.map(row =>
      [row.lock + ':' + row.useCologne, row]));
    for (const lock of ['iron-thorns', 'klefki', 'path']) {
      assert.equal(raw.get(lock + ':false').offered, true,
        'Raw pre-Bench check unexpectedly recognizes ' + lock);
    }
    assert.equal(raw.get('silent-lab:false').offered, false);
    return {
      kind: 'articuno-ces-legendary-ascent-entry-lock',
      engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      scope: 'staged actual PlayCardAction, no qualified game',
      source, guarded
    };
  } finally {
    restore();
  }
}
if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { probeArticunoEntry, runTest };
