'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(root, name));

/**
 * Native pinned Store reproduction of a source-side Active Trubbish line.
 * Both card objects and target lists are the actual Store instances.
 * A completed line is a mechanical witness, not an opponent win sample.
 * @param {0|1} sourceSeat
 */
function verifyActiveEvolution(sourceSeat) {
  const manager = initializeCards();
  let serial = 0;
  /** @param {string} printing */
  const card = printing => {
    const instance = manager.getCardByName(printing);
    assert.ok(instance, 'Missing printed card ' + printing);
    instance.id = ++serial;
    return instance;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {CardList} = engine('game/store/state/card-list');
  const {Format} = engine('game/store/card/card-types');
  const {GamePhase} = engine('game/store/state/state');
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {IS_ABILITY_BLOCKED} = engine('game/store/prefabs/prefabs');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const owner = new Player();
  const opponent = new Player();
  owner.id = sourceSeat === 0 ? 101 : 202;
  opponent.id = sourceSeat === 0 ? 202 : 101;
  state.players = sourceSeat === 0 ? [owner, opponent] : [opponent, owner];
  state.turn = sourceSeat === 0 ? 1 : 2;
  state.activePlayer = sourceSeat;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  owner.active.cards.push(card('Trubbish FST'));
  const candidate = card('Mewtwo & Mew-GX UNM');
  opponent.active.cards.push(candidate);
  for (const printing of ['Oranguru V ASR', 'Oranguru V ASR',
    'Crobat V DAA', 'Squawkabilly ex PAL', 'Tapu Lele-GX GRI']) {
    const slot = new PokemonCardList();
    slot.cards.push(card(printing));
    owner.bench.push(slot);
  }
  for (const player of state.players) {
    player.deck.cards.push(card('Psychic Energy SVE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }

  const evolution = card('Garbodor BKP');
  owner.deck.cards.push(evolution);
  const floatStone = card('Float Stone BKT');
  const shake = card('Boost Shake EVS');
  owner.hand.cards.push(floatStone, shake);

  const perfection = candidate.powers.find(power => power.name === 'Perfection');
  assert.ok(perfection, 'Real candidate Power required for lock witness');
  assert.equal(IS_ABILITY_BLOCKED(store, state, opponent, candidate, perfection),
    false, 'Starting Active Trubbish has no Garbotoxin');

  const activeTarget = {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
  };
  const boardTarget = {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  };

  store.dispatch(new PlayCardAction(owner.id, 0, activeTarget));
  assert.strictEqual(owner.active.tools[0], floatStone,
    'Native Store must attach selected Tool to Active Trubbish');
  store.dispatch(new PlayCardAction(owner.id, 0, boardTarget));

  const search = state.prompts.find(prompt => prompt.result === undefined);
  assert.equal(search?.constructor.name, 'ChooseCardsPrompt');
  assert.strictEqual(search.cards, owner.deck,
    'Search target must be own authentic visible deck');
  assert.equal(search.validate([evolution], state), true);
  store.dispatch(new ResolvePromptAction(search.id, [evolution]));

  const selection = state.prompts.find(prompt => prompt.result === undefined);
  assert.equal(selection?.constructor.name, 'ChoosePokemonPrompt');
  assert.ok(selection.slots.includes(SlotType.ACTIVE));
  assert.equal(selection.validate([owner.active], state), true,
    'Native Store must permit the printed Active evolution target');
  store.dispatch(new ResolvePromptAction(selection.id, [owner.active]));

  assert.equal(owner.active.getPokemonCard()?.fullName, 'Garbodor BKP');
  assert.strictEqual(owner.active.tools[0], floatStone,
    'Tool must remain attached through native evolution');
  assert.equal(owner.bench.length, 5,
    'Full Bench cannot prevent the Active route');
  assert.equal(IS_ABILITY_BLOCKED(store, state, opponent, candidate, perfection),
    true, 'Tool-bearing Active Garbodor should suppress candidate Ability');
  return {sourceSeat,active:owner.active.getPokemonCard()?.fullName,
    preservedTool:owner.active.tools[0]?.fullName,
    sourceBenchSize:owner.bench.length,abilityBlocked:true};
}

module.exports = {verifyActiveEvolution};
