'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { stagePrepared, PIN } =
  require('./agent40-rank7-wobbuffet-hood-native-v2.cjs');

const VERSION = 'agent40-original-rank7-owned-faba-hood-lostzone-native-v1';
const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const native = file => require(path.join(OUT, file));

/** @param {object} player */
function occupied(player) {
  return player.active.cards.length +
    player.bench.reduce((n, b) =>
      n + b.cards.length + b.tools.length + b.energies.cards.length, 0) +
    player.hand.cards.length + player.deck.cards.length +
    player.discard.cards.length + player.lostzone.cards.length +
    player.prizes.reduce((n, prize) => n + prize.cards.length, 0) +
    player.stadium.cards.length + player.supporter.cards.length;
}

/**
 * Resolve the original owner's authentic non-cancelled native Nest Ball
 * search for a deck-resident original Basic, followed by the shuffled deck
 * and the engine's nonvisual wait. This is a staged positive control;
 * all decisions are restricted to original-owner prompts.
 *
 * @param {object} store
 * @param {number} ownerId
 * @param {number} selectedBasicId
 * @param {0|1} seat
 * @returns {{types:string[],chosen:string}}
 */
function settleNestSearch(store, ownerId, selectedBasicId, seat) {
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  const getOwner = () => store.state.players.find(p => p.id === ownerId);
  const history = [];
  let chosen = null;
  for (let step = 0; step < 6; step++) {
    const prompt = store.state.prompts.find(p => p.result === undefined);
    if (!prompt) break;
    assert.equal(prompt.playerId, ownerId, 'Only original owner prompts');
    let answer;
    switch (prompt.type) {
      case 'Choose cards': {
        const index = prompt.cards.cards.findIndex(c => c.id === selectedBasicId);
        assert.ok(index >= 0, 'Original Basic search target present');
        chosen = prompt.cards.cards[index].fullName;
        answer = prompt.decode([index]);
        break;
      }
      case 'Shuffle deck': {
        const count = getOwner().deck.cards.length;
        answer = Array.from({ length: count }, (_, i) => i);
        // Deterministic source-owned permutation, independent of opposing
        // private cards, used for this conditioned native test only.
        let s = (20261106 + seat * 397) >>> 0;
        for (let i = count - 1; i > 0; i--) {
          s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
          const j = s % (i + 1);
          [answer[i], answer[j]] = [answer[j], answer[i]];
        }
        break;
      }
      case 'WaitPrompt':
        answer = null;
        break;
      default:
        throw new Error('Unexpected original Nest Ball prompt ' + prompt.type);
    }
    history.push(prompt.type);
    store.dispatch(new ResolvePromptAction(prompt.id, answer));
  }
  assert.equal(store.state.prompts.filter(p => p.result === undefined).length, 0,
    'Nest Ball should settle without outstanding prompts');
  return { types: history, chosen };
}

/**
 * Conditional paper-rules test. Source rank7 Wobbuffet is already Active,
 * Faba is transferred from source deck to source hand with card count
 * preserved, opposing Sentinel Vileplume is evolved and Hood-equipped.
 * No prior random draw or full game is claimed.
 *
 * @param {0|1} seat
 * @returns {object}
 */
function probe(seat) {
  const x = stagePrepared({
    seat, wobbuffetActive: true, hood: true, vileplumePresent: true
  });
  const { IS_ABILITY_BLOCKED } = native('game/store/prefabs/prefabs');
  const { PlayCardAction, PlayerType, SlotType } =
    native('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  const { GameMessage } = native('game/game-message');
  const sourceId = x.originalPlayer.id;
  const candidateId = x.candidatePlayer.id;
  const source = () => x.store.state.players.find(p => p.id === sourceId);
  const candidate = () => x.store.state.players.find(p => p.id === candidateId);

  const faba = source().deck.cards.find(card => card.fullName === 'Faba LOT');
  assert.ok(faba, 'Original source Faba not in deterministic staged Prize cards');
  source().deck.moveCardTo(faba, source().hand);
  const regirock = source().deck.cards.find(card => card.fullName === 'Regirock XYP');
  assert.ok(regirock, 'Original source Basic search target in deck');
  assert.equal(occupied(source()), 60);
  assert.equal(occupied(candidate()), 60);

  const vileplume = x.evolved.getPokemonCard();
  const power = vileplume.powers.find(p => p.name === 'Irritating Pollen');
  const beforeBlocked = Boolean(IS_ABILITY_BLOCKED(
    x.store, x.store.state, candidate(), vileplume, power
  ));
  const originalHoodId = x.evolved.tools[0].id;
  assert.equal(beforeBlocked, false,
    'Source Wobb Active must not suppress protected Vileplume');

  // Actual owner Supporter root: Faba takes a target Tool/ Stadium/ Energy.
  const index = source().hand.cards.findIndex(c => c.id === faba.id);
  assert.ok(index >= 0);
  x.store.dispatch(new PlayCardAction(sourceId, index, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  }));
  const select = x.store.state.prompts.find(p =>
    p.result === undefined && p.playerId === sourceId && p.type === 'Select');
  assert.ok(select, 'Original Faba select-prompt root');
  const toolOption = select.values.indexOf(GameMessage.CHOICE_TOOL);
  assert.ok(toolOption >= 0, 'Opponent Hood is a legal Faba Tool option');
  x.store.dispatch(new ResolvePromptAction(select.id, toolOption));

  const chooseTarget = x.store.state.prompts.find(p =>
    p.result === undefined && p.playerId === sourceId &&
    p.type === 'Choose pokemon');
  assert.ok(chooseTarget, 'Faba opponent target prompt');
  const targets = [{
    player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 0
  }];
  x.store.dispatch(new ResolvePromptAction(chooseTarget.id,
    chooseTarget.decode(targets, x.store.state)));
  assert.equal(x.store.state.prompts.filter(p => p.result === undefined).length, 0,
    'Faba Tool selection should be settled');
  const hoodLost = candidate().lostzone.cards.some(card => card.id === originalHoodId);
  const hoodAttached = candidate().bench[0].tools.some(card => card.id === originalHoodId);
  const afterBlocked = Boolean(IS_ABILITY_BLOCKED(
    x.store, x.store.state, candidate(), vileplume, power
  ));
  assert.equal(hoodLost, true,
    'Faba must move the opposing Hood to its OWN Lost Zone');
  assert.equal(hoodAttached, false);
  assert.equal(afterBlocked, true,
    'Wobb Active must suppress now-unprotected Vileplume Item lock');

  // Original-owner Item acceptance after Faba, using the same actual Store.
  const nestIndex = source().hand.cards.findIndex(c => c.id === x.nest.id);
  assert.ok(nestIndex >= 0);
  x.store.dispatch(new PlayCardAction(sourceId, nestIndex, {
    player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
  }));
  const settled = settleNestSearch(x.store, sourceId, regirock.id, seat);
  const basicOnBench = source().bench.some(slot =>
    slot.cards.some(card => card.id === regirock.id));
  const itemDiscarded = source().discard.cards.some(card => card.id === x.nest.id);
  assert.equal(basicOnBench, true);
  assert.equal(itemDiscarded, true);
  assert.equal(occupied(source()), 60);
  assert.equal(occupied(candidate()), 60);

  return {
    seat, pin: PIN, version: VERSION,
    beforeBlocked, afterBlocked, hoodLost, hoodAttached,
    originalFabaSelectedTool: true, sourceBasic: settled.chosen,
    sourceBasicOnBench: basicOnBench, originalItemDiscarded: itemDiscarded,
    promptSequence: settled.types,
    sourcePhysicalCards: occupied(source()),
    candidatePhysicalCards: occupied(candidate()),
    conditionalStageOnly: true, naturalDeals: 0,
    qualifiedCompetitiveGames: 0
  };
}

/** @returns {object} */
function run() {
  const rows = [probe(0), probe(1)];
  return {
    version: VERSION, pin: PIN, rows, attempted: rows.length,
    qualifiedCompetitiveGames: 0
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}

module.exports = { VERSION, PIN, probe, run };
