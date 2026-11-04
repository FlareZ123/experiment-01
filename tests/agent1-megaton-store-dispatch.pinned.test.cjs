'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {installMegatonBlowerHook} =
  require('../simulation/twinleaf/megaton-blower-hook.cjs');
const {withMegatonNoEffectRootGuard} =
  require('../simulation/twinleaf/agent1-megaton-no-effect-root-guard.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(root, name));
const {State, GamePhase} = engine('game/store/state/state');
const {Player} = engine('game/store/state/player');
const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
const {CardList} = engine('game/store/state/card-list');
const {Store} = engine('game/store/store');
const {PlayCardAction, PlayerType, SlotType} =
  engine('game/store/actions/play-card-action');

/**
 * Staged genuine Store Item dispatch. It does not represent a dealt original
 * Aichi source game, an owner bot policy, or a qualified competitive trial.
 * The attached physical Special Energy is tracked in both native collections.
 * @param {0|1} seat
 * @param {boolean} targets
 * @param {boolean} corrected
 * @returns {object}
 */
function probe(seat, targets, corrected) {
  const manager = initializeCards();
  const card = printing => {
    const result = manager.getCardByName(printing);
    assert.ok(result, 'Missing pinned card ' + printing);
    return result;
  };
  const state = new State();
  state.players = [new Player(), new Player()];
  state.players[0].id = 101;
  state.players[1].id = 202;
  state.turn = 4 + seat;
  state.activePlayer = seat;
  state.phase = GamePhase.PLAYER_TURN;
  const actor = state.players[seat];
  const opponent = state.players[1 - seat];
  actor.active.cards.push(card('Regidrago V SIT'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const bench = new PokemonCardList();
  bench.cards.push(card('Regidrago V SIT'));
  opponent.bench.push(bench);
  const ownTool = card('Tool Jammer BST');
  actor.active.tools.push(ownTool);
  const megaton = card('Megaton Blower SSP');
  actor.hand.cards.push(megaton);
  actor.deck.cards.push(card('Psychic Energy MEE'));
  opponent.deck.cards.push(card('Psychic Energy MEE'));
  for (const player of state.players) {
    player.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      return prize;
    });
  }
  if (targets) {
    actor.stadium.cards.push(card('Sky Field ROS'));
    opponent.active.tools.push(card('Stealthy Hood UNB'));
    bench.tools.push(card('Stealthy Hood UNB'));
    const special = card('Speed Lightning Energy RCL');
    bench.cards.push(special);
    bench.energies.cards.push(special);
  }
  const store = new Store({onStateChange() {}});
  store.state = state;
  const restore = corrected ? installMegatonBlowerHook() : null;
  let error = null;
  try {
    store.dispatch(new PlayCardAction(actor.id, 0, {
      player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
    }));
  } catch (e) {
    error = String(e?.message ?? e);
  } finally {
    if (restore) restore();
  }
  return {
    seat, targets, corrected,
    storeAccepted: error === null,
    error,
    handHasMegaton: actor.hand.cards.includes(megaton),
    discardHasMegaton: actor.discard.cards.includes(megaton),
    enemyTools: [
      opponent.active.tools.length,
      opponent.bench[0].tools.length
    ],
    enemySpecialCards: bench.energies.cards.length,
    stadiumCards: actor.stadium.cards.length,
    ownToolPreserved: actor.active.tools.includes(ownTool),
    opposingDiscard: opponent.discard.cards.map(c => c.fullName).sort(),
    ownDiscard: actor.discard.cards.map(c => c.fullName).sort(),
    unresolvedPrompts: state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor?.name ?? 'unknown')
  };
}

test('pinned Store Megaton keeps opponent Tools; research hook removes both, each real seat', () => {
  for (const seat of [0, 1]) {
    const raw = probe(seat, true, false);
    const corrected = probe(seat, true, true);
    console.log('AGENT1_MEGATON_STORE_TARGETS ' +
      JSON.stringify({raw, corrected}));
    assert.equal(raw.storeAccepted, true);
    assert.equal(corrected.storeAccepted, true);
    assert.deepEqual(raw.enemyTools, [1, 1]);
    assert.deepEqual(corrected.enemyTools, [0, 0]);
    for (const result of [raw, corrected]) {
      assert.equal(result.discardHasMegaton, true);
      assert.equal(result.handHasMegaton, false);
      assert.equal(result.enemySpecialCards, 0);
      assert.equal(result.stadiumCards, 0);
      assert.equal(result.ownToolPreserved, true);
      assert.deepEqual(result.unresolvedPrompts, []);
    }
    assert.equal(raw.opposingDiscard.includes('Stealthy Hood UNB'), false);
    assert.equal(corrected.opposingDiscard.filter(x =>
      x === 'Stealthy Hood UNB').length, 2);
  }
});

test('observe pinned Store Megaton with no Tool, Special Energy, or Stadium target', () => {
  for (const seat of [0, 1]) {
    const raw = probe(seat, false, false);
    const corrected = probe(seat, false, true);
    console.log('AGENT1_MEGATON_STORE_NO_TARGET ' +
      JSON.stringify({raw, corrected}));
    assert.equal(raw.storeAccepted, true);
    assert.equal(corrected.storeAccepted, true);
    assert.equal(raw.discardHasMegaton, true);
    assert.equal(corrected.discardHasMegaton, true);
    assert.equal(raw.ownToolPreserved, true);
    assert.equal(corrected.ownToolPreserved, true);
    assert.deepEqual(raw.enemyTools, [0, 0]);
    assert.deepEqual(corrected.enemyTools, [0, 0]);
  }
});

test('paper zero-effect guard vetoes Item before state mutation on both seats', () => {
  for (const seat of [0, 1]) {
    const {result, audit} = withMegatonNoEffectRootGuard(() =>
      probe(seat, false, false));
    console.log('AGENT1_MEGATON_ZERO_EFFECT_GUARD ' +
      JSON.stringify({result, audit}));
    assert.equal(result.storeAccepted, false);
    assert.match(result.error, /PAPER_MEGATON_NO_EFFECT_TARGET/);
    assert.equal(result.handHasMegaton, true);
    assert.equal(result.discardHasMegaton, false);
    assert.deepEqual(result.enemyTools, [0, 0]);
    assert.deepEqual(result.opposingDiscard, []);
    assert.deepEqual(result.ownDiscard, []);
    assert.deepEqual(result.unresolvedPrompts, []);
    assert.equal(audit.inspectedMegatonActions, 1);
    assert.equal(audit.rejectedProvenNoEffect, 1);
  }
});

test('paper guard does not suppress target-bearing native corrected Megaton', () => {
  for (const seat of [0, 1]) {
    const {result, audit} = withMegatonNoEffectRootGuard(() =>
      probe(seat, true, true));
    console.log('AGENT1_MEGATON_TARGET_GUARD ' +
      JSON.stringify({result, audit}));
    assert.equal(result.storeAccepted, true);
    assert.deepEqual(result.enemyTools, [0, 0]);
    assert.equal(result.enemySpecialCards, 0);
    assert.equal(result.stadiumCards, 0);
    assert.equal(result.discardHasMegaton, true);
    assert.equal(audit.inspectedMegatonActions, 1);
    assert.equal(audit.rejectedProvenNoEffect, 0);
  }
});

/**
 * Genuine Store two-action board, with a staged owning Vileplume and opposing
 * Tool-equipped Garbotoxin. The Item lock must be recomputed immediately
 * after the opponent's Float Stone leaves Garbodor; no complete game is dealt.
 * @param {0|1} seat
 * @param {boolean} corrected
 * @returns {object}
 */
function probeReactivatedItemLock(seat, corrected, switchFirst = false) {
  const manager = initializeCards();
  const card = printing => {
    const result = manager.getCardByName(printing);
    assert.ok(result, 'Missing pinned printing ' + printing);
    return result;
  };
  const state = new State();
  state.players = [new Player(), new Player()];
  const owner = state.players[seat];
  const opponent = state.players[1 - seat];
  owner.id = 101;
  opponent.id = 202;
  state.activePlayer = seat;
  state.turn = 4 + seat;
  state.phase = GamePhase.PLAYER_TURN;
  owner.active.cards.push(card('Bunnelby PRC'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const flower = new PokemonCardList();
  flower.cards.push(card('Oddish UNB'), card('Gloom UNB'),
    card('Vileplume AOR'));
  owner.bench.push(flower);
  const fundedAttacker = new PokemonCardList();
  fundedAttacker.cards.push(card('Regidrago V SIT'));
  owner.bench.push(fundedAttacker);
  const trash = new PokemonCardList();
  trash.cards.push(card('Trubbish BKP'), card('Garbodor BKP'));
  const floatStone = card('Float Stone BKT');
  trash.tools.push(floatStone);
  opponent.bench.push(trash);
  const megaton = card('Megaton Blower SSP');
  const switchCard = card('Switch SVI');
  owner.hand.cards.push(megaton, switchCard);
  for (const p of state.players) {
    p.deck.cards.push(card('Psychic Energy SVE'));
    p.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }
  const store = new Store({onStateChange() {}});
  store.state = state;
  const restore = corrected ? installMegatonBlowerHook() : null;
  let itemError = null;
  let switchError = null;
  let guardAudit = null;
  const attemptMegaton = () => {
    try {
      const live = store.state.players.find(p => p.id === owner.id);
      const index = live.hand.cards.findIndex(c =>
        c.fullName === 'Megaton Blower SSP');
      assert.ok(index >= 0, 'Megaton remains in acting hand');
      store.dispatch(new PlayCardAction(owner.id, index, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      }));
    } catch (e) {
      itemError = String(e?.message ?? e);
    }
  };
  const attemptSwitch = () => {
    try {
      const live = store.state.players.find(p => p.id === owner.id);
      const index = live.hand.cards.findIndex(c =>
        c.fullName === 'Switch SVI');
      assert.ok(index >= 0, 'Switch remains in physical hand');
      store.dispatch(new PlayCardAction(owner.id, index, {
        player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
      }));
      if (switchFirst) {
        const prompt = store.state.prompts.find(p => p.result === undefined);
        assert.equal(prompt?.constructor?.name, 'ChoosePokemonPrompt');
        const liveOwner = store.state.players.find(p => p.id === owner.id);
        const target = liveOwner.bench.find(slot =>
          slot.getPokemonCard()?.fullName === 'Regidrago V SIT');
        assert.ok(target, 'Staged eligible original Bench attacker is live');
        assert.equal(prompt.validate([target], store.state), true);
        const {ResolvePromptAction} =
          engine('game/store/actions/resolve-prompt-action');
        store.dispatch(new ResolvePromptAction(prompt.id, [target]));
        assert.equal(store.state.prompts.some(p => p.result === undefined),
          false, 'Switch prompt must finish before Megaton');
      }
    } catch (e) {
      switchError = String(e?.message ?? e);
    }
  };
  try {
    const execution = withMegatonNoEffectRootGuard(() => {
      if (switchFirst) {
        attemptSwitch();
        attemptMegaton();
      } else {
        attemptMegaton();
        attemptSwitch();
      }
    });
    guardAudit = execution.audit;
  } finally {
    if (restore) restore();
  }
  const currentOwner = store.state.players.find(p => p.id === owner.id);
  const currentOpponent = store.state.players.find(p => p.id === opponent.id);
  const liveGarbo = currentOpponent.bench[0];
  return {
    seat, corrected, switchFirst, itemError, switchError, guardAudit,
    actorActivePrinting: currentOwner.active.getPokemonCard()?.fullName,
    opponentFloatStoneAttached: liveGarbo.tools.some(
      tool => tool.fullName === 'Float Stone BKT'),
    opponentFloatStoneDiscarded: currentOpponent.discard.cards.some(
      tool => tool.fullName === 'Float Stone BKT'),
    megatonDiscarded: currentOwner.discard.cards.some(
      item => item.fullName === 'Megaton Blower SSP'),
    switchInHand: currentOwner.hand.cards.some(
      item => item.fullName === 'Switch SVI'),
    pendingPrompts: store.state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor?.name ?? 'unknown')
  };
}

test('both seats Megaton Tool removal restores Vileplume Item lock before next Item', () => {
  for (const seat of [0, 1]) {
    const raw = probeReactivatedItemLock(seat, false);
    const corrected = probeReactivatedItemLock(seat, true);
    console.log('AGENT1_MEGATON_GARBOTOXIN_LOCK ' +
      JSON.stringify({raw, corrected}));
    assert.equal(raw.itemError, null);
    assert.equal(corrected.itemError, null);
    assert.equal(raw.opponentFloatStoneAttached, true);
    assert.equal(corrected.opponentFloatStoneAttached, false);
    assert.equal(raw.opponentFloatStoneDiscarded, false);
    assert.equal(corrected.opponentFloatStoneDiscarded, true);
    assert.equal(raw.megatonDiscarded, true);
    assert.equal(corrected.megatonDiscarded, true);
    assert.equal(raw.switchError, null);
    assert.equal(corrected.switchError, 'CANNOT_PLAY_THIS_CARD');
    assert.equal(raw.switchInHand, false);
    assert.equal(corrected.switchInHand, true);
    assert.deepEqual(raw.pendingPrompts, ['ChoosePokemonPrompt']);
    assert.deepEqual(corrected.pendingPrompts, []);
    for (const row of [raw, corrected]) {
      assert.equal(row.guardAudit.inspectedMegatonActions, 1);
      assert.equal(row.guardAudit.rejectedProvenNoEffect, 0);
    }
  }
});

test('both seats reverse paid Switch before Megaton to avoid restored self Item lock', () => {
  for (const seat of [0, 1]) {
    const after = probeReactivatedItemLock(seat, true, false);
    const before = probeReactivatedItemLock(seat, true, true);
    console.log('AGENT1_MEGATON_ACTION_ORDER ' +
      JSON.stringify({after, before}));
    assert.equal(after.itemError, null);
    assert.equal(before.itemError, null);
    assert.equal(after.switchError, 'CANNOT_PLAY_THIS_CARD');
    assert.equal(before.switchError, null);
    assert.equal(after.opponentFloatStoneDiscarded, true);
    assert.equal(before.opponentFloatStoneDiscarded, true);
    assert.equal(after.actorActivePrinting, 'Bunnelby PRC');
    assert.equal(before.actorActivePrinting, 'Regidrago V SIT');
    assert.equal(after.switchInHand, true);
    assert.equal(before.switchInHand, false);
    assert.deepEqual(after.pendingPrompts, []);
    assert.deepEqual(before.pendingPrompts, []);
    assert.equal(before.megatonDiscarded, true);
    assert.equal(before.guardAudit.inspectedMegatonActions, 1);
    assert.equal(before.guardAudit.rejectedProvenNoEffect, 0);
  }
});
