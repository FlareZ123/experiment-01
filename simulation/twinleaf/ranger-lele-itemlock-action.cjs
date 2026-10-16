'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Execute an actual pinned Store action from Lele Bench entry through Ranger
 * and unlocked Switch. The prior Budew effect is staged by its real reducer.
 * @param {{initialization?:boolean,rangerPrized?:boolean,
 *   supporterSpent?:boolean,forcedLeleActive?:boolean}} options
 */
function probeRangerLine(options = {}) {
  const cards = initializeCards();
  let nextId = 1;
  /** @param {string} name */
  const card = name => {
    const found = cards.getCardByName(name);
    assert.ok(found, 'Pinned card unavailable: ' + name);
    found.id = nextId++;
    return found;
  };
  const {Store} = load('game/store/store');
  const {GamePhase} = load('game/store/state/state');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {Format} = load('game/store/card/card-types');
  const {AttackEffect} = load('game/store/effects/game-effects');
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = 1;
  state.gameSettings.format = Format.EXPANDED;

  const attacker = new Player(), defender = new Player();
  attacker.id = 101; attacker.name = 'Budew lock';
  defender.id = 202; defender.name = 'Shadow Rider Ranger response';
  state.players = [attacker, defender];
  const budew = card('Budew ASC');
  attacker.active.cards.push(options.initialization ?
    card('Iron Thorns ex TWM') : budew);
  defender.active.cards.push(options.forcedLeleActive ?
    card('Tapu Lele-GX GRI') : card('Shadow Rider Calyrex V CRE'));
  defender.bench.push(new PokemonCardList());

  const ranger = card('Pokemon Ranger STS');
  const lele = card('Tapu Lele-GX GRI');
  const item = card('Switch SVI');
  if (!options.forcedLeleActive) defender.hand.cards.push(lele);
  defender.hand.cards.push(item);
  defender.deck.cards.push(
    card('Psychic Energy SVE'),
    ...(options.rangerPrized ? [] : [ranger]),
    card('Psychic Energy SVE'), card('Psychic Energy SVE')
  );
  attacker.deck.cards.push(card('Psychic Energy SVE'));
  for (const player of state.players) {
    for (let i = 0; i < 6; i += 1) {
      const prize = new CardList();
      prize.cards.push(options.rangerPrized && player === defender && i === 0 ?
        ranger : card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }

  // This is the lasting effect of a preceding Itchy Pollen attack, not an
  // attempt to attack during defender's turn.
  if (options.initialization) {
    defender.applyPlayLocks({item: true}, 1);
  } else {
    budew.reduceEffect(store, state,
      new AttackEffect(attacker, defender, budew.attacks[0]));
  }
  assert.equal(defender.cannotPlayItemCards, true,
    'The attack-origin Item restriction must survive into this staged turn');
  if (options.supporterSpent) defender.supporterTurn = state.turn;

  /** @returns {any} */
  const pending = () => state.prompts.find(p => p.result === undefined);
  /** @param {any} answer */
  function resolve(answer) {
    const prompt = pending();
    assert.ok(prompt, 'Expected outstanding Wonder Tag prompt');
    store.dispatch(new ResolvePromptAction(prompt.id, answer));
  }
  const play = (player, cardToPlay, target) => {
    const handIndex = player.hand.cards.indexOf(cardToPlay);
    assert.ok(handIndex >= 0, 'Requested card is not in hand');
    store.dispatch(new PlayCardAction(player.id, handIndex, target));
  };
  const benchTarget = {player: PlayerType.BOTTOM_PLAYER,
    slot: SlotType.BENCH, index: 0};
  const trainerTarget = {player: PlayerType.ANY,
    slot: SlotType.BOARD, index: 0};

  let leleBenched = false;
  let sawWonderTag = false;
  let rangerSearched = false;
  if (!options.forcedLeleActive) {
    play(defender, lele, benchTarget);
    leleBenched = defender.bench[0].getPokemonCard() === lele;
    let iterations = 0;
    while (pending()) {
      assert.ok(++iterations < 8, 'Wonder Tag prompt sequence did not terminate');
      const prompt = pending();
      switch (prompt.constructor.name) {
        case 'ConfirmPrompt':
          sawWonderTag = true;
          resolve(true);
          break;
        case 'ChooseCardsPrompt': {
          const chosen = options.rangerPrized ? [] : [ranger];
          assert.equal(prompt.validate(chosen), true,
            'Wonder Tag search selection rejected by real prompt');
          resolve(chosen);
          rangerSearched = chosen.length > 0;
          break;
        }
        case 'ShowCardsPrompt':
          resolve(true);
          break;
        case 'ShuffleDeckPrompt':
          resolve(Array.from({length: defender.deck.cards.length}, (_, i) => i));
          break;
        default:
          throw new Error('Unexpected Wonder Tag prompt: ' + prompt.constructor.name);
      }
    }
  }

  assert.equal(leleBenched, !options.forcedLeleActive);
  assert.equal(sawWonderTag, !options.initialization && !options.forcedLeleActive);
  const rangerInHand = defender.hand.cards.includes(ranger);
  assert.equal(rangerInHand, rangerSearched);
  let rangerPlayed = false;
  if (rangerInHand && !options.supporterSpent) {
    play(defender, ranger, trainerTarget);
    rangerPlayed = true;
    assert.ok(defender.supporterTurn > 0,
      'Ranger must consume the turn Supporter action');
  }
  assert.equal(defender.cannotPlayItemCards, !rangerPlayed);
  let switchPrompt = null;
  if (rangerPlayed) {
    play(defender, item, trainerTarget);
    switchPrompt = pending()?.constructor.name || null;
    assert.equal(switchPrompt, 'ChoosePokemonPrompt',
      'Real Switch Item should become playable after Ranger');
  } else {
    assert.ok(defender.hand.cards.includes(item), 'The locked Item must remain in hand');
  }
  return {
    options, initialItemLock: true, leleBenched, sawWonderTag,
    rangerSearched, rangerInHand, rangerPlayed,
    itemLockAfterResponse: defender.cannotPlayItemCards,
    switchPrompt, supporterSpent: defender.supporterTurn > 0
  };
}

