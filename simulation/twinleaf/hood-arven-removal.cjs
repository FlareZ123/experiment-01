'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installMegatonBlowerHook } = require('./megaton-blower-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const mod = p => require(path.join(output, p));

/**
 * This is an injected turn-three board, not a full opening game.
 * It tests a realistic sequence of legal card-effect transitions:
 * Arven searches a Tool and Item, Hood attaches, V evolves to VMAX,
 * Initialization is bypassed, then opponent Tool removal shuts Door off.
 *
 * @param {'Faba'|'Megaton Blower'} removal
 * @returns {object}
 */
function runResponse(removal) {
  const manager = initializeCards();
  let nextCardId = 1;
  /** @param {string} id */
  const card = id => {
    const c = manager.getCardByName(id);
    assert.ok(c, 'Missing pinned card ' + id);
    // Real deck setup assigns a unique numeric ID to each card instance.
    // Synthetic CardManager clones default to id=-1. Without unique IDs,
    // ChooseCardsPrompt's blocked-card reconstruction rejects every target.
    c.id = nextCardId++;
    return c;
  };

  const { Store } = mod('game/store/store');
  const { State, GamePhase } = mod('game/store/state/state');
  const { Player } = mod('game/store/state/player');
  const { CardList } = mod('game/store/state/card-list');
  const { PokemonCardList } = mod('game/store/state/pokemon-card-list');
  const { ChooseCardsPrompt } = mod('game/store/prompts/choose-cards-prompt');
  const { ShowCardsPrompt } = mod('game/store/prompts/show-cards-prompt');
  const { ShuffleDeckPrompt } = mod('game/store/prompts/shuffle-prompt');
  const { SelectPrompt } = mod('game/store/prompts/select-prompt');
  const { ChoosePokemonPrompt } = mod('game/store/prompts/choose-pokemon-prompt');
  const { ResolvePromptAction } = mod('game/store/actions/resolve-prompt-action');
  const {
    PlaySupporterEffect, PlayItemEffect, PlayPokemonEffect, AttachPokemonToolEffect
  } = mod('game/store/effects/play-card-effects');
  const { CheckPokemonPowersEffect } = mod('game/store/effects/check-effects');
  const { GameSettings } = mod('game/core/game-settings');

  const opponent = new Player();
  opponent.id = 101;
  opponent.name = 'Iron Thorns';
  opponent.active.cards.push(card('Iron Thorns ex TWM'));
  const player = new Player();
  player.id = 202;
  player.name = 'Hood Shield';
  player.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const target = new PokemonCardList();
  target.cards.push(card('Shadow Rider Calyrex V CRE'));
  player.bench.push(target);
  const arven = card('Arven SVI');
  const vmax = card('Shadow Rider Calyrex VMAX CRE');
  const hood = card('Stealthy Hood UNB');
  const item = card('Mysterious Treasure FLI');
  player.hand.cards.push(arven, vmax);
  player.deck.cards.push(
    hood, item, card('Forest Seal Stone SIT'), card('Float Stone BKT'),
    card('Fog Crystal CRE'), card('Psychic Energy SVE'), card('Psychic Energy SVE')
  );
  // Prevent a zero-Prize synthetic state from causing spurious game resolution
  // and resetting all once-per-game flags on prompt dispatch.
  for (const participant of [opponent, player]) {
    for (let i = 0; i < 6; i += 1) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      participant.prizes.push(prize);
    }
  }

  const state = new State();
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 1;
  state.players = [opponent, player];
  const settings = new GameSettings();
  state.gameSettings = settings;
  state.rules = settings.rules;
  const store = new Store({ onStateChange() {} });
  store.state = state;

  /** @param {Function} expected */
  function pending(expected) {
    const prompt = state.prompts.find(p => p.result === undefined);
    assert.ok(prompt instanceof expected,
      'Expected ' + expected.name + ', found ' + (prompt?.constructor.name || 'none'));
    return prompt;
  }
  /** @param {Function} expected @param {unknown} value */
  function answer(expected, value) {
    const prompt = pending(expected);
    store.dispatch(new ResolvePromptAction(prompt.id, value));
  }
  /** @returns {boolean} */
  function underworldVisible() {
    const check = new CheckPokemonPowersEffect(player, vmax);
    store.reduceEffect(state, check);
    return check.powers.some(p => p.name === 'Underworld Door');
  }

  // Ability discovery is meaningful only for an in-play target Pokémon;
  // the raw check does not enforce this condition when queried off-board.
  store.reduceEffect(state, new PlaySupporterEffect(player, arven));
  const search = pending(ChooseCardsPrompt);
  assert.equal(search.options.maxItems, 1);
  assert.equal(search.options.maxTools, 1);
  assert.equal(search.validate([hood, item]), true,
    'Arven search target unexpectedly rejected: ' + JSON.stringify({
      options: search.options,
      deck: search.cards.cards.map(c => ({name:c.name,type:c.trainerType,id:c.id})),
      desired: [{name:hood.name,id:hood.id},{name:item.name,id:item.id}]
    }));
  answer(ChooseCardsPrompt, [hood, item]);
  assert.ok(player.hand.cards.includes(hood) && player.hand.cards.includes(item),
    'Both resources must reach hand after real Arven prompt resolution');
  answer(ShowCardsPrompt, true);
  const shuffle = pending(ShuffleDeckPrompt);
  answer(ShuffleDeckPrompt, Array.from({length:player.deck.cards.length}, (_, i) => i));
  assert.equal(state.prompts.some(p => p.result === undefined), false,
    'Arven must finish resolving all prompts before other actions');
  assert.equal(player.supporterTurn, 1, 'Arven consumes the Supporter for this turn');

  store.reduceEffect(state, new AttachPokemonToolEffect(player, hood, target));
  assert.equal(target.tools.length, 1);
  assert.equal(target.tools[0], hood);
  assert.ok(!player.hand.cards.includes(hood), 'Hood must move from hand to attached Tools');
  store.reduceEffect(state, new PlayPokemonEffect(player, vmax, target));
  assert.equal(target.getPokemonCard(), vmax);
  assert.equal(target.tools[0], hood, 'Hood must survive V to VMAX evolution');
  assert.equal(underworldVisible(), true,
    'Attached Hood on Benched VMAX must restore Underworld Door under Initialization');

  // This response is the next player's turn, never a second player's
  // Supporter action during the Arven turn.
  state.turn = 4;
  state.activePlayer = 0;
  player.supporterTurn = 0;

  if (removal === 'Faba') {
    const faba = card('Faba LOT');
    opponent.hand.cards.push(faba);
    store.reduceEffect(state, new PlaySupporterEffect(opponent, faba));
    answer(SelectPrompt, 0);
    answer(ChoosePokemonPrompt, [target]);
    assert.ok(player.lostzone.cards.includes(hood), 'Faba sends the attached Hood to Lost Zone');
  } else {
    const megaton = card('Megaton Blower SSP');
    opponent.hand.cards.push(megaton);
    store.reduceEffect(state, new PlayItemEffect(opponent, megaton));
    assert.ok(player.discard.cards.includes(hood), 'Megaton discards opposing attached Hood');
  }
  assert.equal(target.tools.length, 0);
  assert.equal(underworldVisible(), false,
    'Iron Thorns Initialization must suppress Underworld Door immediately after Hood removal');

  return {
    removal, arvenSearched: ['Stealthy Hood', 'Mysterious Treasure'],
    supporterUsed: player.supporterTurn === 1,
    benchedVmaxEvolved: target.getPokemonCard() === vmax,
    hoodRemovedTo: removal === 'Faba' ? 'lostzone' : 'discard',
    underworldAfterRemoval: underworldVisible(),
    opponentCanRespondWithoutAttacking: true
  };
}

/** @returns {object} */
function runTest() {
  const restore = installMegatonBlowerHook();
  try {
    return {
      kind: 'Hood Shield Arven through evolution and adversarial Tool removal',
      engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      scope: 'injected legal-effect midgame sequence; not a full game or win rate',
      cases: [runResponse('Faba'), runResponse('Megaton Blower')]
    };
  } finally {
    restore();
  }
}

if (require.main === module) {
  console.log(JSON.stringify(runTest(), null, 2));
}

module.exports = { runResponse, runTest };
