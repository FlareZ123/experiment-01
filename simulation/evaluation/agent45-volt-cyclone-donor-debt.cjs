'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent45-volt-cyclone-donor-debt-v1';
const THUNDER = 'Thunder Mountain Prism Star';
const WONDROUS = 'Wondrous Labyrinth Prism Star';
const ENERGY = Object.freeze({
  'Speed Lightning Energy': {units:1, lightning:1},
  'Capture Energy': {units:1, lightning:0},
  'Spiky Energy': {units:1, lightning:0},
  'Double Colorless Energy': {units:2, lightning:0}
});

/**
 * Printed-cost-only status immediately after Volt Cyclone, assuming the
 * current visible Stadium persists and no other attack-cost effects apply.
 * Return null for any energy or Stadium outside the verified rank-6 subset.
 * This cannot establish legal permission to announce the next attack.
 * @param {string[]} cards Attached Energy card names.
 * @param {string[]} stadiums Current public Stadium names.
 * @returns {boolean|null}
 */
function canPayVoltCost(cards, stadiums) {
  if (!Array.isArray(cards) || !Array.isArray(stadiums) ||
      stadiums.length > 1 ||
      stadiums.some(x => x !== THUNDER && x !== WONDROUS)) return null;
  let total = 0;
  let lightning = 0;
  for (const name of cards) {
    const entry = ENERGY[name];
    if (!entry) return null;
    total += entry.units;
    lightning += entry.lightning;
  }
  const thunder = stadiums.includes(THUNDER);
  const required = (thunder ? 2 : 3) + Number(stadiums.includes(WONDROUS));
  return total >= required && (thunder || lightning >= 1);
}

/**
 * Derive the unique card name removed from an Active Energy multiset.
 * This is evidence of one card moving, irrespective of Energy units.
 * @param {string[]} before
 * @param {string[]} after
 * @returns {string|null}
 */
function oneRemovedCard(before, after) {
  if (!Array.isArray(before) || !Array.isArray(after) ||
      before.length !== after.length + 1) return null;
  const pool = before.slice();
  for (const name of after) {
    const i = pool.indexOf(name);
    if (i < 0) return null;
    pool.splice(i, 1);
  }
  return pool.length === 1 ? pool[0] : null;
}

/**
 * Read-only, paper-printing-bounded decision audit. It compares all legal
 * single-card donors from the owner's Active Iron Thorns ex under the same
 * publicly recorded postattack Stadium. Targets are the already documented
 * own Bench; no private zones or hidden opponent cards are consulted.
 * @param {object} attack Native sourceAttackSettlement row.
 * @param {0|1} seat Actual original source seat.
 * @returns {object}
 */
function classifyVoltDonorDebt(attack, seat) {
  if (![0,1].includes(seat) || attack?.attackName !== 'Volt Cyclone' ||
      attack.settledPromptChain !== true) {
    return {status:'OUT_OF_SCOPE_OR_UNSETTLED'};
  }
  const before = attack.publicBoardBefore?.[seat];
  const after = attack.publicBoardAfter?.[seat];
  if (!before?.active || !after?.active ||
      before.active.name !== 'Iron Thorns ex' ||
      after.active.name !== 'Iron Thorns ex' ||
      !Array.isArray(before.bench) ||
      !Array.isArray(before.active.energyCards) ||
      !Array.isArray(after.active.energyCards) ||
      !Array.isArray(after.stadium) ||
      !Array.isArray(after.active.toolCards) ||
      after.active.toolCards.length !== 0) {
    return {status:'PUBLIC_STATE_UNVERIFIED'};
  }
  const initial = before.active.energyCards;
  const remaining = after.active.energyCards;
  const payable = canPayVoltCost(remaining, after.stadium);
  if (payable === null) return {status:'PRINTED_COST_UNKNOWN'};
  if (before.bench.length === 0) {
    if (initial.length !== remaining.length ||
        initial.slice().sort().join('|') !== remaining.slice().sort().join('|')) {
      return {status:'SOLO_ENERGY_CHANGED'};
    }
    return {
      status:'VERIFIED_SOLO',
      printedCostImmediatelyPayable:payable,
      avoidableDonorDebt:false,
      safeDonorAlternatives:[],
      observedDonor:null
    };
  }
  const donor = oneRemovedCard(initial, remaining);
  if (!donor) return {status:'DONOR_TRANSITION_UNVERIFIED'};
  const alternatives = [];
  for (const candidate of new Set(initial)) {
    const hypothetical = initial.slice();
    hypothetical.splice(hypothetical.indexOf(candidate), 1);
    if (canPayVoltCost(hypothetical, after.stadium) === true) {
      alternatives.push(candidate);
    }
  }
  const avoidableDonorDebt = !payable && alternatives.length > 0;
  return {
    status:'VERIFIED_BENCHED',
    printedCostImmediatelyPayable:payable,
    avoidableDonorDebt,
    safeDonorAlternatives:alternatives.sort(),
    observedDonor:donor,
    initialEnergy:initial.slice(),
    remainingEnergy:remaining.slice(),
    stadium:after.stadium.slice()
  };
}

/**
 * Postgame-only census of real settled original rank-6 source attacks.
 * Uses only observed roots at t+2 for the next own turn. Missing roots are
 * right-censored; it does not infer a future action or claim causality.
 * @param {{rows:object[]}} archive Unmodified frozen v2 native JSON.
 * @returns {object}
 */
function auditRank6VoltDonorDebt(archive) {
  assert.ok(Array.isArray(archive?.rows));
  const result = {
    version:VERSION,
    attempts:0,
    settledVoltAttacks:0,
    solo:0,
    benched:0,
    immediatelyPayableSolo:0,
    immediatelyPayableBenched:0,
    benchedPrintedCostDebt:0,
    avoidableBenchedDonorDebt:0,
    benchedAttacksWithObservedNextTurn:0,
    benchedNextTurnAttacks:0,
    benchedNextTurnPasses:0,
    benchedNextTurnCensored:0,
    observedBenchedAttackWithAttachment:0,
    observedBenchedAttackWithoutAttachment:0,
    observedBenchedPassWithAttachment:0,
    observedBenchedPassWithoutAttachment:0,
    unknown:0,
    sourceGamesWithAvoidableDonorDebt:[],
    sourceGamesWithBenchedCostDebt:[],
    counterexamples:[],
    competitiveQualifiedGames:0,
    limitation:'Frozen native effects, printed cost only; no prospective policy or whole-paper-game qualification'
  };
  const seen = new Set();
  const costDebtGames = new Set();
  const avoidableGames = new Set();
  for (const row of archive.rows) {
    if (row?.trial?.rank !== 6) continue;
    const id = row.trial.id;
    assert.equal(typeof id, 'string');
    assert.ok(!seen.has(id), 'Duplicate native trial');
    seen.add(id);
    result.attempts++;
    const roots = row.rootActionLedger;
    assert.ok(Array.isArray(roots));
    for (const attack of row.sourceAttackSettlement?.attacks ?? []) {
      if (attack.attackName !== 'Volt Cyclone') continue;
      result.settledVoltAttacks++;
      const decision = classifyVoltDonorDebt(attack, row.sourceSeat);
      if (decision.status === 'VERIFIED_SOLO') {
        result.solo++;
        if (decision.printedCostImmediatelyPayable)
          result.immediatelyPayableSolo++;
        continue;
      }
      if (decision.status !== 'VERIFIED_BENCHED') {
        result.unknown++;
        continue;
      }
      result.benched++;
      if (decision.printedCostImmediatelyPayable)
        result.immediatelyPayableBenched++;
      else {
        result.benchedPrintedCostDebt++;
        costDebtGames.add(id);
      }
      if (decision.avoidableDonorDebt) {
        result.avoidableBenchedDonorDebt++;
        avoidableGames.add(id);
        result.counterexamples.push({
          trialId:id,
          sourceSeat:row.sourceSeat,
          turnBefore:attack.turnBefore,
          rootActionOrdinal:attack.actionOrdinal,
          observedDonor:decision.observedDonor,
          safeDonorAlternatives:decision.safeDonorAlternatives,
          activeBefore:decision.initialEnergy,
          activeAfter:decision.remainingEnergy,
          stadium:decision.stadium
        });
      }
      const nextTurn = roots.filter(root =>
        root.playerSlot === row.sourceSeat &&
        root.turnBefore === attack.turnBefore + 2);
      const end = nextTurn.find(root =>
        root.action === 'AttackAction' ||
        root.action === 'PassTurnAction');
      if (!end) {
        result.benchedNextTurnCensored++;
        continue;
      }
      result.benchedAttacksWithObservedNextTurn++;
      const attached = nextTurn.some(root =>
        root.action === 'PlayCardAction' &&
        typeof root.card === 'string' &&
        root.card.endsWith('Energy'));
      if (end.action === 'AttackAction') {
        result.benchedNextTurnAttacks++;
        if (attached) result.observedBenchedAttackWithAttachment++;
        else result.observedBenchedAttackWithoutAttachment++;
      } else {
        result.benchedNextTurnPasses++;
        if (attached) result.observedBenchedPassWithAttachment++;
        else result.observedBenchedPassWithoutAttachment++;
      }
    }
  }
  result.sourceGamesWithAvoidableDonorDebt = [...avoidableGames].sort();
  result.sourceGamesWithBenchedCostDebt = [...costDebtGames].sort();
  return result;
}

module.exports = {
  VERSION, canPayVoltCost, oneRemovedCard,
  classifyVoltDonorDebt, auditRank6VoltDonorDebt
};
