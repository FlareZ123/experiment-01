'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {installHisuianHeavyBallPrizeShuffleHook} =
  require('../simulation/twinleaf/hisuian-heavy-ball-prize-hook.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(root, name));

/**
 * Minimal real Store board for a legal Hisuian Heavy Ball Item dispatch.
 * Each duplicate printed Energy is a distinct physical Card instance.
 * @param {boolean} includeBasic Whether the first Prize is a Basic Pokémon.
 */
function board(includeBasic) {
  const manager = initializeCards();
  /** @param {string} name */
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, 'Missing pinned card: ' + name);
    return result;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const a = new Player();
  const b = new Player();
  a.id = 101;
  b.id = 202;
  a.name = 'Hisuian-source';
  b.name = 'opponent';
  state.players = [a, b];
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 2;
  state.gameSettings.format = Format.EXPANDED;
  a.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  b.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const ball = card('Hisuian Heavy Ball ASR');
  a.hand.cards.push(ball);
  const prizeCards = [];
  for (let i = 0; i < 6; i++) {
    const list = new CardList();
    list.isSecret = true;
    const prizeCard = i === 0 && includeBasic ?
      card('Shadow Rider Calyrex V CRE') : card('Psychic Energy MEE');
    list.cards.push(prizeCard);
    a.prizes.push(list);
    prizeCards.push(prizeCard);
  }
  for (let i = 0; i < 8; i++) {
    a.deck.cards.push(card('Psychic Energy MEE'));
    b.deck.cards.push(card('Psychic Energy MEE'));
  }
  const slotReferences = a.prizes.slice();
  return {store, state, a, b, ball, prizeCards, slotReferences};
}

/**
 * Execute the actual PlayCardAction and ResolvePromptAction at fixed randomness.
 * Do not use the upstream card method directly. The output includes the
 * physical Prize sequence and any remaining unresolved display prompts.
 * @param {ReturnType<typeof board>} f
 * @param {boolean} chooseBasic
 * @param {boolean} patched
 */
function playBall(f, chooseBasic, patched) {
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const originalRandom = Math.random;
  const restore = patched ? installHisuianHeavyBallPrizeShuffleHook() : null;
  Math.random = () => 0;
  try {
    f.store.dispatch(new PlayCardAction(f.a.id, 0, {
      player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
    }));
    const pending = f.state.prompts.find(p => p.result === undefined);
    assert.ok(pending, 'Expected Prize-card selection prompt');
    assert.equal(pending.constructor.name, 'ChooseCardsPrompt');
    const selection = chooseBasic ? [f.prizeCards[0]] : [];
    assert.equal(pending.validate(selection, f.state), true,
      'Selection must be legal in the actual Store');
    f.store.dispatch(new ResolvePromptAction(pending.id, selection));
    assert.equal(f.a.prizes.length, 6);
    f.a.prizes.forEach((prize, i) => {
      assert.strictEqual(prize, f.slotReferences[i],
        'A Prize position must retain object identity');
      assert.equal(prize.isSecret, true,
        'Originally face-down Prize positions must return face down');
    });
    return {
      prizes: f.a.prizes.map(p => p.cards[0] ?? null),
      ballInDiscard: f.a.discard.cards.includes(f.ball),
      ballInSupporter: f.a.supporter.cards.includes(f.ball),
      basicInHand: f.a.hand.cards.includes(f.prizeCards[0]),
      pendingKinds: f.state.prompts.filter(p => p.result === undefined)
        .map(p => p.constructor.name)
    };
  } finally {
    if (restore) restore();
    Math.random = originalRandom;
  }
}

test('real Store no-Basic prompt: pinned code fails shuffle; opt-in patch shuffles physical Prizes', () => {
  const old = board(false);
  const baseline = playBall(old, false, false);
  assert.deepEqual(baseline.prizes, old.prizeCards,
    'Pinned code silently retains every physical Prize position');

  const fixed = board(false);
  const result = playBall(fixed, false, true);
  assert.deepEqual(result.prizes,
    [...fixed.prizeCards.slice(1), fixed.prizeCards[0]],
    'With Math.random=0 the corrected six face-down Prizes rotate');
  assert.equal(result.ballInDiscard, true,
    'If no Basic was selected, printed Item text discards Heavy Ball');
  assert.equal(result.ballInSupporter, false,
    'Heavy Ball must leave temporary trainer staging after resolution');
});

test('real Store Basic selection: Ball replaces chosen Prize before shuffling', () => {
  const fixed = board(true);
  const result = playBall(fixed, true, true);
  assert.equal(result.basicInHand, true);
  assert.deepEqual(result.prizes,
    [...fixed.prizeCards.slice(1), fixed.ball],
    'Card objects, including the chosen slot replacement, must be rotated');
  assert.equal(result.ballInDiscard, false);
  assert.equal(result.ballInSupporter, false);
  assert.equal(fixed.a.prizes.flatMap(p => p.cards).length, 6);
});
