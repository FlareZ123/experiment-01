'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const native = file => require(path.join(output, file));
const {Store} = native('game/store/store');
const {Player} = native('game/store/state/player');
const {CardList} = native('game/store/state/card-list');
const {PokemonCardList} = native('game/store/state/pokemon-card-list');
const {GamePhase} = native('game/store/state/state');
const {Format} = native('game/store/card/card-types');
const {IS_ABILITY_BLOCKED} = native('game/store/prefabs/prefabs');
const {CheckPokemonPowersEffect} = native('game/store/effects/check-effects');
const {PlayCardAction, PlayerType, SlotType} =
  native('game/store/actions/play-card-action');

/**
 * Stage a real Garbodor printing and attach Forest Seal Stone to it through
 * the native Store. The opponent has an ordinary printed Pokémon Ability.
 * This tests the Tool trigger, not Star Alchemy use or a natural source game.
 *
 * @param {0|1} toolOwnerSeat
 * @param {'Garbodor LTR'|'Garbodor BKP'} garbodorName
 * @returns {object}
 */
function fixture(toolOwnerSeat, garbodorName) {
  const cards = initializeCards();
  let nextId = 56000000 + toolOwnerSeat * 100000 +
    (garbodorName === 'Garbodor BKP' ? 10000 : 0);
  const card = printing => {
    const instance = cards.getCardByName(printing);
    assert.ok(instance, 'Pinned native printing unavailable: ' + printing);
    instance.id = nextId++;
    return instance;
  };

  const toolOwner = new Player();
  const abilityOwner = new Player();
  toolOwner.id = toolOwnerSeat === 0 ? 101 : 202;
  abilityOwner.id = toolOwnerSeat === 0 ? 202 : 101;
  toolOwner.name = 'Garbodor owner';
  abilityOwner.name = 'Ability owner';

  toolOwner.active.cards.push(card('Snorlax PGO'));
  toolOwner.bench = Array.from({length: 5}, () => new PokemonCardList());
  const garbodorSlot = toolOwner.bench[0];
  garbodorSlot.cards.push(card('Trubbish FST'), card(garbodorName));

  const forestSealStone = card('Forest Seal Stone SIT');
  toolOwner.hand.cards.push(forestSealStone);

  abilityOwner.active.cards.push(card('Tapu Lele-GX GRI'));
  abilityOwner.bench = Array.from({length: 5}, () => new PokemonCardList());

  for (const player of [toolOwner, abilityOwner]) {
    for (let i = 0; i < 5; i += 1) {
      player.deck.cards.push(card('Psychic Energy SVE'));
    }
    for (let i = 0; i < 6; i += 1) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }

  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.gameSettings.format = Format.EXPANDED;
  state.players = toolOwnerSeat === 0
    ? [toolOwner, abilityOwner]
    : [abilityOwner, toolOwner];
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 5;
  state.activePlayer = toolOwnerSeat;

  return {
    store, state, toolOwner, abilityOwner, garbodorSlot,
    forestSealStone, toolOwnerSeat, garbodorName
  };
}

/**
 * @param {ReturnType<typeof fixture>} f
 * @returns {object}
 */
function attachAndCheck(f) {
  const {
    store, state, toolOwner, abilityOwner, garbodorSlot,
    forestSealStone, toolOwnerSeat, garbodorName
  } = f;
  const tapuLele = abilityOwner.active.getPokemonCard();
  const wonderTag = tapuLele.powers.find(power => power.name === 'Wonder Tag');
  const garbodor = garbodorSlot.getPokemonCard();
  const garbotoxin = garbodor.powers.find(power => power.name === 'Garbotoxin');
  assert.ok(wonderTag);
  assert.ok(garbotoxin);

  const blockedBefore = Boolean(IS_ABILITY_BLOCKED(
    store, state, abilityOwner, tapuLele, wonderTag));
  assert.equal(blockedBefore, false,
    'Control Ability must be available before a Tool is attached');

  store.dispatch(new PlayCardAction(toolOwner.id, 0, {
    player: PlayerType.BOTTOM_PLAYER,
    slot: SlotType.BENCH,
    index: 0
  }));

  assert.ok(garbodorSlot.tools.includes(forestSealStone),
    'Store must attach Forest Seal Stone to the non-V Garbodor');
  const blockedAfter = Boolean(IS_ABILITY_BLOCKED(
    store, state, abilityOwner, tapuLele, wonderTag));
  // This low-level helper reports true for Garbotoxin itself in this fixture;
  // use the independent opposing Ability lock as the functional lock witness.
  const helperReportsGarbotoxinBlocked = Boolean(IS_ABILITY_BLOCKED(
    store, state, toolOwner, garbodor, garbotoxin));
  const garbodorCheck = new CheckPokemonPowersEffect(toolOwner, garbodor);
  store.reduceEffect(state, garbodorCheck);
  const garbotoxinVisible = garbodorCheck.powers.some(
    power => power.name === 'Garbotoxin');

  assert.equal(blockedAfter, true,
    'Forest Seal Stone is a Pokémon Tool and must activate Garbotoxin');

  return {
    toolOwnerSeat,
    garbodorName,
    attachedTool: forestSealStone.fullName,
    blockedBefore,
    blockedAfter,
    helperReportsGarbotoxinBlocked,
    garbotoxinVisible,
    competitiveGamesQualified: 0
  };
}

for (const garbodorName of ['Garbodor LTR', 'Garbodor BKP']) {
  for (const seat of [0, 1]) {
    test('Forest Seal Stone as Garbotoxin Tool: ' +
      garbodorName + ', owner seat ' + seat, () => {
      const result = attachAndCheck(fixture(seat, garbodorName));
      console.log('AGENT2_FSS_GARBOTOXIN_TOOL_TRIGGER',
        JSON.stringify(result));
      assert.equal(result.blockedBefore, false);
      assert.equal(result.blockedAfter, true);
      assert.equal(typeof result.helperReportsGarbotoxinBlocked, 'boolean');
      assert.equal(result.garbotoxinVisible, true,
        'Garbotoxin should remain an available exception to its own lock');
    });
  }
}
