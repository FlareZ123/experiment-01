'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch, initializeCards} = require('./headless.cjs');
const {observeFirstTurn, summarizeTurnOrder} = require('./turn-order-evidence.cjs');

/** Read the root Store before its first normal turn action is dispatched.
 * This observes the actual source-dealt state, never a speculative clone.
 * The deliberate sentinel stops play before the first bot decision.
 * @param {string[]} meloetta Registered mapped rank-26 exact 60.
 * @param {string[]} thorns Registered mapped rank-6 exact 60.
 * @param {0|1} attackerSeat
 * @param {number} seed
 * @returns {object}
 */
function firstTurnState(meloetta, thorns, attackerSeat, seed) {
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const {Store} = require(path.join(output, 'game/store/store'));
  const {GamePhase} = require(path.join(output, 'game/store/state/state'));
  const original = Store.prototype.dispatch;
  const stop = {};
  let root = null;
  let observed = null;
  Store.prototype.dispatch = function observeRoot(action, ...args) {
    if (!root && action.constructor.name === 'AddPlayerAction') root = this;
    const result = original.call(this, action, ...args);
    const s = this.state;
    if (this === root && !observed && s.players.length === 2 &&
        s.turn === 1 && s.phase === GamePhase.PLAYER_TURN &&
        !s.prompts.some(prompt => prompt.result === undefined)) {
      const first = summarizeTurnOrder(observeFirstTurn(s), s.logs);
      const attacker = s.players[attackerSeat];
      const defender = s.players[1 - attackerSeat];
      const names = list => list.cards.map(card => card.fullName);
      const active = player => player.active.getPokemonCard()?.fullName ?? null;
      const bench = player => player.bench
        .map(slot => slot.getPokemonCard()?.fullName)
        .filter(Boolean);
      observed = {
        ...first,
        turn:s.turn, attackerSeat, seed,
        attackerActive:active(attacker),
        attackerBench:bench(attacker),
        attackerHand:names(attacker.hand),
        defenderActive:active(defender),
        defenderBench:bench(defender),
        attackerPrizeCount:attacker.prizes.filter(p => p.cards.length).length,
        defenderPrizeCount:defender.prizes.filter(p => p.cards.length).length,
        attackerColognePrized:attacker.prizes.some(p =>
          p.cards.some(card => card.fullName.startsWith('Canceling Cologne '))),
        observationPoint:'root Store immediately after setup and mandatory first draw; before first normal turn policy decision'
      };
      throw stop;
    }
    return result;
  };
  try {
    runMatch({
      deckA:attackerSeat === 0 ? meloetta : thorns,
      deckB:attackerSeat === 1 ? meloetta : thorns,
      seed, maxActions:100, strictPromptValidation:true,
      isolatePolicyRandomness:true,
      forestSealSearchCorrection:true,
      supporterDecisionCorrection:true,
      leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true
    });
  } catch (error) {
    if (error !== stop) throw error;
  } finally {
    Store.prototype.dispatch = original;
  }
  assert.ok(observed, 'Source root first turn was not captured');
  assert.equal(observed.verifiedByDrawLog, true,
    'First-turn state not corroborated by first draw log');
  return observed;
}

/** @param {object} state */
function classify(state) {
  const first = state.firstTurnSlot === state.attackerSeat;
  const solo = state.defenderActive?.startsWith('Iron Thorns ex ') &&
    state.defenderBench.length === 0;
  const meloetta = state.attackerActive?.startsWith('Meloetta ex ') === true;
  const hand = state.attackerHand;
  return {
    rank26ActuallyFirst:first,
    defenderLoneIronThorns:solo,
    meloettaInitiallyActive:meloetta,
    directCologne:hand.some(name => name.startsWith('Canceling Cologne ')),
    orderPadsVisible:hand.filter(name => name.startsWith('Order Pad ')).length,
    stoneVisible:hand.some(name => name.startsWith('Forest Seal Stone ')),
    crobatAvailableFromHandOrBench:hand.some(name => name.startsWith('Crobat V ')) ||
      state.attackerBench.some(name => name.startsWith('Crobat V ')),
    riskRuinsVisible:hand.some(name => name.startsWith('Risky Ruins ')),
    pumpsVisible:hand.filter(name => name.startsWith('Damage Pump ')).length
  };
}

/** A targeted source-deal case search; its selected examples are not random
 * performance samples or evidence of complete first-turn combo feasibility.
 * @returns {object}
 */
function scan() {
  initializeCards();
  const plan = planAichi(26, {
    allowEquivalentBasicEnergies:true, allowJapanesePromoHooks:true
  });
  const attacker = plan.candidate;
  const defender = plan.opponents.find(row => row.rank === 6);
  assert.equal(attacker?.cards.length, 60);
  assert.equal(defender?.status, 'ready');
  assert.equal(defender.cards.length, 60);
  assert.equal(attacker.cards.filter(name => name.startsWith('Meloetta ex ')).length, 1);
  assert.equal(attacker.cards.filter(name => name.startsWith('Canceling Cologne ')).length, 1);

  let examined = 0, attackerFirst = 0, activeMeloetta = 0;
  let firstEligible = null, firstDirect = null, firstPad = null;
  const MAX_BASES = [20261017, 20261018, 20261019, 20261020];
  outer:for (const base of MAX_BASES) {
    for (let repeat = 0; repeat < 100; repeat++) {
      const seeds = deriveSlotSeeds(base, 'pilot', 26, repeat);
      for (const seat of [0,1]) {
        const seed = seat === 0 ? seeds.A : seeds.B;
        const state = firstTurnState(attacker.cards, defender.cards, seat, seed);
        examined++;
        const flags = classify(state);
        if (flags.rank26ActuallyFirst) attackerFirst++;
        if (flags.rank26ActuallyFirst && flags.meloettaInitiallyActive) activeMeloetta++;
        if (flags.rank26ActuallyFirst && flags.defenderLoneIronThorns &&
            flags.meloettaInitiallyActive) {
          const record = {base, repeat, ...state, flags};
          if (!firstEligible) firstEligible = record;
          if (!firstPad && flags.orderPadsVisible > 0 &&
              !state.attackerColognePrized) firstPad = record;
          if (flags.directCologne) {
            firstDirect = record;
            break outer;
          }
        }
      }
    }
  }
  const selected = firstDirect ?? firstPad ?? firstEligible;
  const repeatVerified = selected ? firstTurnState(
    attacker.cards, defender.cards, selected.attackerSeat, selected.seed) : null;
  if (selected) assert.deepEqual(repeatVerified,
    Object.fromEntries(Object.entries(selected).filter(([key]) =>
      !['base','repeat','flags'].includes(key))),
    'Selected actual-source opening did not repeat identically');

  return {
    schema:'aichi-rank26-v-rank6-authenticated-firstturn-source-window-v1',
    opponentRank:6, attackerRank:26,
    publishedCardCounts:[attacker.cards.length,defender.cards.length],
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    fixedSeedPlan:'aichi-decorrelated-slots-v3 pilot rank26 bases 20261017..20261020 repeats 0..99 both seats; stop at first direct-Cologne qualifying source root',
    examined,attackerFirst,activeMeloetta,
    firstDirect,firstPad,firstEligible,selected,
    selectedReplayedIdentically:selected!==null,
    sourceSetupQualified:selected!==null,
    cardSequenceOrAttackQualified:false,
    opponentPolicyQualified:false,
    competitiveGameQualified:false,
    caveats:'Selection deliberately searches seeds for a first-player Meloetta Active against sole Iron Thorns; no candidate plays, attacks, self-KOs, Item searches, opponent actions or game wins observed. Root snapshot is read-only, captured after real setup and first draw before policy chooses any normal-turn action. Prize Boolean is privileged post-hoc evidence only and must not be offered to a K0 playing policy.'
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(scan(),null,2)+'\n');
module.exports = {firstTurnState,classify,scan};
