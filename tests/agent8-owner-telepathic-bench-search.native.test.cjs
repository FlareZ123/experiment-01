'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {withOwnerTelepathicBenchSearch} =
  require('../simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs');

const base = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(base, name));

/**
 * True printed Telepathic attachment to a Psychic Active and owner deck search.
 * Initial piles are staged, so these are mechanism tests, not dealt games.
 * @param {0|1} seat Actual physical owner seat.
 * @param {boolean} psychicRecipient Whether the target is Psychic.
 * @returns {object} Native Store fixture with card identity witnesses.
 */
function stage(seat, psychicRecipient = true) {
  assert.ok(seat === 0 || seat === 1);
  const manager = initializeCards();
  let id = 17001;
  const get = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Missing printed native card: ' + name);
    card.id = id++;
    return card;
  };
  const {Store} = native('game/store/store');
  const {Player} = native('game/store/state/player');
  const {CardList} = native('game/store/state/card-list');
  const {PokemonCardList} = native('game/store/state/pokemon-card-list');
  const {GamePhase} = native('game/store/state/state');
  const {Format} = native('game/store/card/card-types');
  const {PlayCardAction, PlayerType, SlotType} =
    native('game/store/actions/play-card-action');
  const owner = new Player();
  const opponent = new Player();
  owner.id = 17011;
  opponent.id = 17022;
  owner.bench = Array.from({length: 5}, () => new PokemonCardList());
  opponent.bench = Array.from({length: 5}, () => new PokemonCardList());
  owner.active.cards.push(get(psychicRecipient ?
    'Mewtwo & Mew-GX UNM' : 'Bunnelby PRC'));
  opponent.active.cards.push(get('Pidgey MEW'));
  const telepath = get('Telepath [P] Energy M3');
  owner.hand.cards.push(telepath);
  const basics = [get('Duskull VIV'), get('Mewtwo & Mew-GX UNM')];
  owner.deck.cards.push(...basics);
  for (const p of [owner, opponent]) {
    for (let n = 0; n < 12; n++) p.deck.cards.push(get('Psychic Energy SVE'));
    for (let n = 0; n < 6; n++) {
      const prize = new CardList();
      prize.cards.push(get('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.players = seat === 0 ? [owner, opponent] : [opponent, owner];
  state.activePlayer = seat;
  state.turn = 2;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  const {SimpleTacticsAi} = native('simple-bot/simple-tactics-ai');
  const ai = Object.create(SimpleTacticsAi.prototype);
  ai.client = {id: owner.id};
  const attach = () => store.dispatch(new PlayCardAction(owner.id, 0, {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
  }));
  return {seat, owner, opponent, store, state, ai, basics, telepath, attach};
}

for (const seat of [0, 1]) {
  test('real native Telepath Psychic owner deck-to-Bench custody in seat ' + seat, () => {
    const wrapped = withOwnerTelepathicBenchSearch(() => {
      const f = stage(seat);
      const {ResolvePromptAction} = native('game/store/actions/resolve-prompt-action');
      f.attach();
      assert.ok(f.owner.active.energies.cards.includes(f.telepath));
      const unresolved = f.state.prompts.filter(p => p.result === undefined);
      assert.equal(unresolved.length, 1);
      assert.equal(unresolved[0].constructor.name, 'ChooseCardsPrompt');
      const action = f.ai.decodeNextAction(f.state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.equal(action.id, unresolved[0].id);
      assert.equal(action.result.length, 2);
      assert.ok(action.result.every(c => f.basics.includes(c)));
      f.store.dispatch(action);
      assert.equal(f.state.prompts.some(p => p.result === undefined &&
        p.constructor.name === 'ShuffleDeckPrompt'), true);
      assert.ok(f.basics.every(card => !f.owner.deck.cards.includes(card)));
      assert.ok(f.basics.every(card => f.owner.bench.some(slot =>
        slot.cards.includes(card))));
      assert.equal(f.owner.bench.filter(slot => slot.cards.length > 0).length, 2);
      assert.ok(f.owner.active.energies.cards.includes(f.telepath));
      return {ownerSeat: seat, selected: action.result.map(c => c.fullName),
        phase: f.state.phase, globalTurn: f.state.turn};
    });
    assert.equal(wrapped.audit.actualAttachments, 1);
    assert.equal(wrapped.audit.matchingOwnerSearches, 1);
    assert.equal(wrapped.audit.settled, 1);
    assert.equal(wrapped.audit.physicallyBenched, 2);
    assert.equal(wrapped.audit.shuffleMissing, 0);
    assert.equal(wrapped.audit.competitiveGamesQualified, 0);
    console.log('AGENT8_TELEPATH_NATIVE', JSON.stringify({
      result: wrapped.result, audit: wrapped.audit
    }));
  });
  test('real native non-Psychic recipient opens no Psychic search in seat ' + seat, () => {
    const wrapped = withOwnerTelepathicBenchSearch(() => {
      const f = stage(seat, false);
      f.attach();
      assert.ok(f.owner.active.energies.cards.includes(f.telepath));
      assert.equal(f.state.prompts.some(p => p.result === undefined &&
        p.constructor.name === 'ChooseCardsPrompt'), false);
    });
    assert.equal(wrapped.audit.actualAttachments, 1);
    assert.equal(wrapped.audit.matchingOwnerSearches, 0);
    assert.equal(wrapped.audit.settled, 0);
  });
}
