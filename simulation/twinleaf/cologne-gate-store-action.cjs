'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { installRadiantGateLockHook } = require('./radiant-gate-lock-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Execute true Store actions on a staged midgame board. Confirm/choose/shuffle
 * prompts are dispatched through the real prompt pipeline. This is a legal
 * action sequence conditional on the injected board, not a deck setup replay.
 * @param {boolean} useCologne
 * @returns {{useCologne:boolean,initializationVisible:boolean,gatePrompt:boolean,
 *  gateUsed:boolean,vmaxBenched:number,radiantBenched:boolean,pendingCount:number}}
 */
function probeRealGateAction(useCologne) {
  const manager = initializeCards();
  let nextId = 1;
  /** @param {string} name */
  const card = name => {
    const c = manager.getCardByName(name);
    assert.ok(c, 'Missing pinned card ' + name);
    c.id = nextId++;
    return c;
  };
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
  const { CheckPokemonPowersEffect } =
    load('game/store/effects/check-effects');

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 3;
  state.activePlayer = 1;
  state.gameSettings.format = Format.EXPANDED;
  const opponent = new Player();
  opponent.id = 101;
  const iron = card('Iron Thorns ex TWM');
  opponent.active.cards.push(iron);
  const player = new Player();
  player.id = 202;
  player.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  player.bench.push(new PokemonCardList(), new PokemonCardList(), new PokemonCardList());
  state.players = [opponent, player];

  const radiant = card('Radiant Eternatus CRZ');
  const vmax1 = card('Shadow Rider Calyrex VMAX CRE');
  const vmax2 = card('Shadow Rider Calyrex VMAX CRE');
  const cologne = useCologne ? card('Canceling Cologne ASR') : null;
  player.hand.cards.push(radiant);
  if (cologne) player.hand.cards.push(cologne);
  player.deck.cards.push(vmax1, vmax2, card('Psychic Energy SVE'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  for (const side of state.players) {
    for (let i = 0; i < 6; i += 1) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      side.prizes.push(prize);
    }
  }

  const benchTarget = { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0 };
  const boardTarget = { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 };
  /** @param {any} played @param {any} target */
  function play(played, target) {
    const index = player.hand.cards.indexOf(played);
    assert.ok(index >= 0, 'Card to play must be in hand');
    store.dispatch(new PlayCardAction(player.id, index, target));
  }
  /** @returns {any} */
  const pending = () => state.prompts.find(prompt => prompt.result === undefined);
  /** @param {any} value */
  function answer(value) {
    const prompt = pending();
    assert.ok(prompt, 'Expected a pending prompt');
    store.dispatch(new ResolvePromptAction(prompt.id, value));
  }
  if (cologne) play(cologne, boardTarget);
  const powers = new CheckPokemonPowersEffect(opponent, iron);
  store.reduceEffect(state, powers);
  const initializationVisible = powers.powers.some(p => p.name === 'Initialization');

  play(radiant, benchTarget);
  const radiantBenched = player.bench[0].getPokemonCard() === radiant;
  const gatePrompt = pending()?.constructor.name === 'ConfirmPrompt';
  let gateUsed = false;
  if (gatePrompt) {
    answer(true);
    const choose = pending();
    assert.equal(choose?.constructor.name, 'ChooseCardsPrompt',
      'Gate confirmation should search for VMAX');
    assert.equal(choose.validate([vmax1, vmax2]), true,
      'The two pinned VMAX should be valid Gate selections');
    answer([vmax1, vmax2]);
    gateUsed = true;
    let steps = 0;
    while (pending()) {
      assert.ok(++steps < 8, 'Gate resolution loop did not terminate');
      const prompt = pending();
      if (prompt.constructor.name === 'ShuffleDeckPrompt') {
        answer(Array.from({length: player.deck.cards.length}, (_, i) => i));
      } else if (prompt.constructor.name === 'ShowCardsPrompt' ||
                 prompt.constructor.name === 'WaitPrompt') {
        // Climactic Gate ends the turn. Resolve the engine's silent
        // BETWEEN_TURNS wait through its normal Store prompt pipeline.
        answer(true);
      } else {
        throw new Error('Unexpected Gate prompt ' + prompt.constructor.name);
      }
    }
  }
  const vmaxBenched = player.bench.filter(slot =>
    slot.getPokemonCard()?.name === 'Shadow Rider Calyrex VMAX').length;
  assert.equal(vmaxBenched, gateUsed ? 2 : 0);
  return {
    useCologne, initializationVisible, gatePrompt, gateUsed,
    vmaxBenched, radiantBenched,
    pendingCount: state.prompts.filter(p => p.result === undefined).length
  };
}

/** @returns {object} Contrasting pinned and corrected action executions. */
function runTest() {
  const upstreamLocked = probeRealGateAction(false);
  const upstreamCologne = probeRealGateAction(true);
  const restore = installRadiantGateLockHook();
  try {
    const correctedLocked = probeRealGateAction(false);
    const correctedCologne = probeRealGateAction(true);
    assert.equal(upstreamLocked.initializationVisible, true);
    assert.equal(upstreamCologne.initializationVisible, false);
    assert.equal(correctedLocked.initializationVisible, true);
    assert.equal(correctedCologne.initializationVisible, false);
    assert.equal(correctedLocked.gatePrompt, false);
    assert.equal(correctedLocked.radiantBenched, true);
    assert.equal(correctedCologne.gatePrompt, true);
    assert.equal(correctedCologne.vmaxBenched, 2);
    for (const row of [upstreamLocked, upstreamCologne, correctedLocked, correctedCologne]) {
      assert.equal(row.pendingCount, 0);
    }
    return {
      kind: 'radiant-gate-real-store-action',
      pinnedEngine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      scope: 'injected board and legal action/prompt sequence, not natural setup or win rate',
      upstreamLocked, upstreamCologne, correctedLocked, correctedCologne
    };
  } finally {
    restore();
  }
}

if (require.main === module) console.log(JSON.stringify(runTest(), null, 2));
module.exports = { probeRealGateAction, runTest };
