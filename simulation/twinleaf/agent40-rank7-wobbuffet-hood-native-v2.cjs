'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { stage, PIN } = require('./agent40-rank7-wobbuffet-hood-native.cjs');

const VERSION = 'agent40-rank7-wobbuffet-hood-corrected-bench-and-prompt-v2';
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
    player.prizes.reduce((n, p) => n + p.cards.length, 0) +
    player.stadium.cards.length + player.supporter.cards.length;
}

/**
 * Correct the old v1 fixture's missing empty Bench slots. A raw new Player()
 * has bench=[]; Nest Ball's actual pinned canPlay checks for an empty slot.
 * Existing v1 archive remains unchanged for reproducibility.
 * @param {{seat:0|1,wobbuffetActive:boolean,hood:boolean,vileplumePresent?:boolean}} params
 */
function stagePrepared(params) {
  const x = stage(params);
  const { PokemonCardList } = native('game/store/state/pokemon-card-list');
  const { vileplumePresent = true } = params;
  if (!vileplumePresent) {
    x.candidatePlayer.discard.cards.push(...x.evolved.cards.splice(0));
    x.candidatePlayer.discard.cards.push(...x.evolved.tools.splice(0));
  }
  for (const player of [x.originalPlayer, x.candidatePlayer]) {
    while (player.bench.length < 5) player.bench.push(new PokemonCardList());
    assert.equal(player.bench.length, 5);
    assert.equal(occupied(player), 60, 'All 60 cards must remain in one zone');
  }
  return x;
}

/** @param {{seat:0|1,wobbuffetActive:boolean,hood:boolean,vileplumePresent?:boolean}} params */
function probe(params) {
  const x = stagePrepared(params);
  const { vileplumePresent = true } = params;
  const { IS_ABILITY_BLOCKED } = native('game/store/prefabs/prefabs');
  const { PlayCardAction, PlayerType, SlotType } =
    native('game/store/actions/play-card-action');
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  const originalId = x.originalPlayer.id;
  const currentOriginal = () =>
    x.store.state.players.find(p => p.id === originalId);
  const missing = currentOriginal().deck.cards.find(c => c.fullName === 'Regirock XYP');
  assert.ok(missing, 'Exact original rank7 source Basic deck target');
  const before = currentOriginal();
  const emptyBefore = before.bench.filter(b => b.cards.length === 0).length;
  assert.equal(emptyBefore, 4, 'Free physical Bench slots required for Nest Ball');

  const lock = x.evolved.getPokemonCard();
  const power = lock?.powers.find(p => p.name === 'Irritating Pollen');
  const abilityBlocked = Boolean(power && IS_ABILITY_BLOCKED(
    x.store, x.store.state, x.candidatePlayer, lock, power
  ));
  const expectedAbilityBlocked = vileplumePresent && params.wobbuffetActive && !params.hood;
  assert.equal(abilityBlocked, expectedAbilityBlocked,
    'Read-only native Ability block should match staged protection');

  const handIndex = before.hand.cards.indexOf(x.nest);
  assert.ok(handIndex >= 0);
  let rootError = null;
  try {
    x.store.dispatch(new PlayCardAction(originalId, handIndex, {
      player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
    }));
  } catch (error) {
    rootError = String(error?.message ?? error);
  }
  // The real authoritative state is store.state. On rejected actions Store
  // restores a deep-cloned snapshot, leaving external Player references stale.
  const postRoot = currentOriginal();
  const prompt = x.store.state.prompts.find(p =>
    p.result === undefined && p.playerId === originalId &&
    p.type === 'Choose cards' && p.cards === postRoot.deck);
  const rootHadPrompt = Boolean(prompt);
  const rootItemHeld = postRoot.hand.cards.some(c => c.id === x.nest.id);
  const rootItemInPlayZone = postRoot.supporter.cards.some(c => c.id === x.nest.id);
  const itemBlockedByPaper = vileplumePresent && !expectedAbilityBlocked;

  let settlementError = null;
  let choice = null;
  const settledPromptTypes = [];
  if (!rootError && prompt) {
    const index = prompt.cards.cards.findIndex(c => c.id === missing.id);
    assert.ok(index >= 0, 'Deck Basic must be present at prompt time');
    choice = prompt.cards.cards[index].fullName;
    try {
      x.store.dispatch(new ResolvePromptAction(prompt.id, prompt.decode([index])));
      settledPromptTypes.push(prompt.type);
      // Pinned Nest Ball follows the deck search with a shuffle prompt and
      // a nonvisual WaitPrompt. Complete both before asserting Item cleanup.
      for (let step = 0; step < 4; step += 1) {
        const pending = x.store.state.prompts.find(p => p.result === undefined);
        if (!pending) break;
        assert.equal(pending.playerId, originalId);
        let answer;
        if (pending.type === 'Shuffle deck') {
          const size = currentOriginal().deck.cards.length;
          answer = Array.from({ length: size }, (_, i) => i);
          let state = (20261106 + params.seat * 97 +
            Number(params.wobbuffetActive) * 101 +
            Number(params.hood) * 103) >>> 0;
          for (let i = answer.length - 1; i > 0; i -= 1) {
            state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
            const j = state % (i + 1);
            [answer[i], answer[j]] = [answer[j], answer[i]];
          }
        } else if (pending.type === 'WaitPrompt') {
          answer = null;
        } else {
          throw new Error('Unrecognized native follow-on prompt ' + pending.type);
        }
        x.store.dispatch(new ResolvePromptAction(pending.id, answer));
        settledPromptTypes.push(pending.type);
      }
    } catch (error) {
      settlementError = String(error?.message ?? error);
    }
  }
  const after = currentOriginal();
  const movedBasic = after.bench.some(b =>
    b.cards.some(c => c.id === missing.id));
  const itemDiscarded = after.discard.cards.some(c => c.id === x.nest.id);
  const itemHeldAfter = after.hand.cards.some(c => c.id === x.nest.id);
  const remainingPrompts = x.store.state.prompts
    .filter(p => p.result === undefined && p.playerId === originalId).length;
  const sourcePhysical = occupied(after);
  const opponentPhysical = occupied(x.store.state.players.find(p => p.id !== originalId));
  const paperParity = itemBlockedByPaper
    ? Boolean(rootError === 'CANNOT_PLAY_THIS_CARD' &&
      !rootHadPrompt && rootItemHeld && itemHeldAfter &&
      !movedBasic && !itemDiscarded)
    : Boolean(rootError === null && rootHadPrompt &&
      rootItemInPlayZone && !rootItemHeld &&
      settlementError === null && movedBasic && itemDiscarded &&
      !itemHeldAfter && remainingPrompts === 0);
  return {
    ...params, vileplumePresent,
    version: VERSION, pin: PIN, conditionalStagedBoard: true,
    sourcePhysical, opponentPhysical, originalSeat: params.seat,
    emptyBefore, expectedAbilityBlocked, nativeAbilityBlocked: abilityBlocked,
    paperItemBlocked: itemBlockedByPaper,
    rootError, rootHadPrompt, rootItemHeld, rootItemInPlayZone,
    settlementError, choice, settledPromptTypes, movedBasic, itemDiscarded, itemHeldAfter,
    remainingPrompts, paperParity, qualifiedGames: 0
  };
}

/** @returns {object} */
function run() {
  const rows = [];
  for (const seat of [0, 1]) {
    rows.push(probe({
      seat, wobbuffetActive: true, hood: false, vileplumePresent: false
    }));
    for (const wobbuffetActive of [false, true]) {
      for (const hood of [false, true]) {
        rows.push(probe({ seat, wobbuffetActive, hood }));
      }
    }
  }
  return {
    version: VERSION, pin: PIN, attempted: rows.length,
    parity: rows.filter(r => r.paperParity).length,
    rows, qualifiedCompetitiveGames: 0
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}

module.exports = { PIN, VERSION, stagePrepared, probe, run };
