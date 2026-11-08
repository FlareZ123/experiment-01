'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {stage, establishSentinelLock, resolveRank1Guzma} =
  require('../agent28-sentinel-direct-artazon-native.test.cjs');

const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative */
const native = relative => require(path.join(OUT, relative));
const {actorObservation} =
  require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseSentinelPreEvolutionFloat} =
  require('../../simulation/twinleaf/agent20-sentinel-pre-evolution-float-root.cjs');
const TOOL = 'Float Stone BKT';
const HOOD = 'Stealthy Hood UNB';
const V2 = path.resolve(__dirname,
  '../../results/aichi-2026/2026-11/candidate-sentinel-gust-escape-v2.psv');

/** @param {object} owner */
function sourcePhysical(owner) {
  return [
    ...owner.active.cards, ...owner.bench.flatMap(slot => slot.cards),
    ...owner.hand.cards, ...owner.deck.cards, ...owner.discard.cards,
    ...owner.lostzone.cards, ...owner.prizes.flatMap(slot => slot.cards)
  ];
}

/** Construct a single 60-card physical replacement from original v1. */
function stageVariant(seat) {
  const x = stage(seat);
  const lines = fs.readFileSync(V2, 'utf8').trim().split(/\r?\n/);
  const rows = lines.map(line => {
    const [supertype, name, set, number, rawCount] = line.split('|');
    const count = Number(rawCount);
    assert.ok(supertype && name && set && number &&
      Number.isSafeInteger(count) && count >= 1 && count <= 4);
    return {name, set, count};
  });
  assert.equal(rows.reduce((sum, row) => sum + row.count, 0), 60);
  assert.equal(rows.find(row =>
    row.name === 'Float Stone' && row.set === 'BKT')?.count, 1);
  assert.equal(rows.find(row =>
    row.name === 'Stealthy Hood' && row.set === 'UNB')?.count, 2);
  const oldHandIndex = x.owner.hand.cards.findIndex(card =>
    card.fullName === HOOD);
  assert.ok(oldHandIndex >= 0, 'Conditioned opening originally holds Hood');
  const stone = x.manager.getCardByName(TOOL);
  assert.ok(stone, 'Pinned native Float Stone BKT exists');
  stone.id = 985002 + seat * 1000;
  x.owner.hand.cards.splice(oldHandIndex, 1, stone);
  const physical = sourcePhysical(x.owner);
  assert.equal(physical.length, 60);
  assert.equal(new Set(physical).size, 60);
  const expected = x.sourceSixty.slice();
  const oldIndex = expected.indexOf(HOOD);
  assert.ok(oldIndex >= 0);
  expected.splice(oldIndex, 1, TOOL);
  assert.deepEqual(physical.map(card => card.fullName).sort(),
    expected.sort());
  return {...x, stone};
}

for (const seat of [0, 1]) {
  test('Sentinel fixed60 Float Stone prevents paid Guzma Active strand, native seat ' +
    seat, () => {
    const original = stage(seat);
    establishSentinelLock(original);
    resolveRank1Guzma(original);
    const {CheckRetreatCostEffect: ControlCost} =
      native('game/store/effects/check-effects');
    const baselineCost = new ControlCost(original.owner);
    original.f.store.reduceEffect(original.f.store.state, baselineCost);
    assert.equal(baselineCost.cost.length, 3,
      'Unmodified source after same legal Guzma is stranded at retreat 3');
    assert.equal(original.owner.active.energies.cards.length, 0);
    assert.equal(original.owner.active.tools.length, 0);

    const x = stageVariant(seat);
    const {PlayCardAction, PlayerType, SlotType} =
      native('game/store/actions/play-card-action');
    const {RetreatAction, PassTurnAction} =
      native('game/store/actions/game-actions');
    const {CheckRetreatCostEffect} =
      native('game/store/effects/check-effects');
    assert.equal(typeof PassTurnAction, 'function');
    const store = x.f.store;
    const originalDispatch = store.dispatch;
    let equipped = false;
    store.dispatch = function(action, ...args) {
      if (!equipped && action?.constructor?.name === 'AttackAction') {
        const plan = chooseSentinelPreEvolutionFloat(
          actorObservation(this.state, seat));
        assert.equal(plan?.kind, 'attach-sentinel-pre-evolution-float',
          'Owner-only policy must see this genuinely payable window');
        const {benchIndex, handIndex} = plan;
        assert.strictEqual(x.owner.hand.cards[handIndex], x.stone);
        assert.equal(x.owner.bench[benchIndex].getPokemonCard()?.fullName,
          plan.targetPrinting);
        const target = {
          player: PlayerType.BOTTOM_PLAYER,
          slot: SlotType.BENCH,
          index: benchIndex
        };
        originalDispatch.call(this,
          new PlayCardAction(x.owner.id, handIndex, target));
        assert.ok(x.owner.bench[benchIndex].tools.includes(x.stone),
          'Actual Store attaches Float Stone to Oddish before Evolution');
        equipped = true;
      }
      return originalDispatch.call(this, action, ...args);
    };
    try {
      establishSentinelLock(x);
    } finally {
      store.dispatch = originalDispatch;
    }
    assert.equal(equipped, true);
    const ville = x.owner.bench.find(slot =>
      slot.getPokemonCard()?.fullName === 'Vileplume AOR');
    assert.ok(ville && ville.tools.includes(x.stone),
      'Actual evolving Oddish retains attached Tool as Vileplume');
    resolveRank1Guzma(x);
    assert.equal(x.owner.active.getPokemonCard()?.fullName, 'Vileplume AOR');
    assert.ok(x.owner.active.tools.includes(x.stone));
    assert.equal(x.owner.active.energies.cards.length, 0);
    const cost = new CheckRetreatCostEffect(x.owner);
    store.reduceEffect(store.state, cost);
    assert.equal(cost.cost.length, 0,
      'One printed Float Stone eliminates the three-Energy Retreat Cost');
    const opponent = x.f.defender;
    const {ResolvePromptAction} =
      native('game/store/actions/resolve-prompt-action');
    store.dispatch(new PassTurnAction(opponent.id));
    for (let n = 0; n < 24; n++) {
      const prompt = store.state.prompts.find(p => p.result === undefined);
      if (!prompt) break;
      assert.equal(prompt.constructor.name, 'WaitPrompt',
        'Ordinary opponent Pass must have only native turn-closure waits');
      store.dispatch(new ResolvePromptAction(prompt.id, null));
    }
    assert.equal(store.hasPrompts(), false,
      'All actual end-turn waits must settle before next actor acts');
    assert.equal(store.state.activePlayer, seat,
      'Actual opponent Pass grants original Sentinel its own turn');
    const rescueIndex = x.owner.bench.findIndex(slot =>
      slot.getPokemonCard()?.fullName === 'Bunnelby PRC');
    assert.ok(rescueIndex >= 0);
    const priorPrize = x.owner.getPrizeLeft();
    store.dispatch(new RetreatAction(x.owner.id, rescueIndex));
    assert.equal(x.owner.active.getPokemonCard()?.fullName, 'Bunnelby PRC');
    const rescued = x.owner.bench.find(slot =>
      slot.getPokemonCard()?.fullName === 'Vileplume AOR');
    assert.ok(rescued);
    assert.ok(rescued.tools.includes(x.stone));
    assert.equal(x.owner.retreatedTurn, store.state.turn);
    assert.equal(x.owner.getPrizeLeft(), priorPrize);
    console.log('AGENT20_SENTINEL_GUST_ESCAPE_NATIVE',
      JSON.stringify({
        seat, originalPrintSixty: true, variantSwap: 'Hood -1; Float Stone +1',
        sourceFirstTurnTwoTmEvolutions: true,
        opponentGuzmaFullyResolved: true,
        originalVileplumeEnergy: 0,
        originalNativeRetreatCost: baselineCost.cost.length,
        actualNativeRetreatAfterFloat: 0,
        sourceNextTurnActualRetreat: true,
        retainedItemLockPokemonOnBench: true,
        opponentPassedWithoutAttacking: true,
        competitiveGamesQualified: 0
      }));
  });
}
