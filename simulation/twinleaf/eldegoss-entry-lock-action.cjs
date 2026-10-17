'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installEldegossEntryLockHook } = require('./eldegoss-entry-lock-hook.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Make a real PlayCardAction and complete Happy Match's optional Supporter
 * recovery on a staged midgame board, with chosen active lock and Coliseum.
 * @param {'none'|'iron-thorns'|'klefki'|'path'|'silent-lab'|'garbotoxin-tool'|'garbotoxin-bare'} lock
 * @param {boolean} useCologne
 * @returns {object}
 */
function probeEldegossEntry(lock, useCologne = false) {
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
  player.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  player.bench.push(new PokemonCardList());
  state.players = [opponent, player];

  const incoming = card('Eldegoss V RCL');
  const supporter = card('Guzma BUS');
  const cologne = useCologne ? card('Canceling Cologne ASR') : null;
  player.hand.cards.push(incoming);
  if (cologne) player.hand.cards.push(cologne);
  player.discard.cards.push(supporter);
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
    play(cologne, {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0});
  }
  play(incoming, {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0
  });

  const offered = pending()?.constructor.name === 'ConfirmPrompt';
  if (offered) {
    store.dispatch(new ResolvePromptAction(pending().id, true));
    const selection = pending();
    assert.equal(selection?.constructor.name, 'ChooseCardsPrompt',
      'Happy Match must offer a discarded Supporter');
    assert.equal(selection.validate([supporter]), true);
    store.dispatch(new ResolvePromptAction(selection.id, [supporter]));
  }
  return {
    lock, useCologne, offered,
    supporterRecovered: player.hand.cards.includes(supporter),
    supporterStillDiscarded: player.discard.cards.includes(supporter),
    benchEntry: player.bench[0].getPokemonCard() === incoming,
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
    probeEldegossEntry(lock, cologne));
  const source = run();
  const restore = installEldegossEntryLockHook();
  try {
    const guarded = run();
    for (let i = 0; i < guarded.length; i++) {
      const expected = scenarios[i][2];
      const row = guarded[i];
      assert.equal(row.benchEntry, true, row.lock);
      assert.equal(row.offered, expected, row.lock);
      assert.equal(row.supporterRecovered, expected, row.lock);
      assert.equal(row.supporterStillDiscarded, !expected, row.lock);
      assert.deepEqual(row.unresolvedPrompts, [], row.lock);
    }
    for (const row of source) {
      assert.equal(row.benchEntry, true, row.lock);
      assert.deepEqual(row.unresolvedPrompts, [], row.lock);
    }
    const raw = new Map(source.map(row =>
      [row.lock + ':' + row.useCologne, row]));
    assert.equal(raw.get('iron-thorns:false').offered, true,
      'Pinned pre-Bench hand card incorrectly evades in-play lock');
    assert.equal(raw.get('path:false').offered, true,
      'Pinned pre-Bench hand card incorrectly evades Path');
    assert.equal(raw.get('klefki:false').offered, true,
      'Pinned pre-Bench hand card incorrectly evades Klefki');
    assert.equal(raw.get('silent-lab:false').offered, false,
      'Explicit hand-zone lock should work without a guard');
    return {
      kind: 'eldegoss-rcl-happy-match-entry-lock',
      engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      scope: 'injected legal-action midgame board, zero qualified matches',
      source, guarded
    };
  } finally {
    restore();
  }
}
if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { probeEldegossEntry, runTest };
