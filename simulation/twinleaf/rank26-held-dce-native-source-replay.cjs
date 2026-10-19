'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {initializeCards} = require('./headless.cjs');
const {firstTurnState} = require('./meloetta-rank26-firstturn-source-window.cjs');
const {runWithResearchProfile, RANK26_PROPAGATION_PROFILE} =
  require('./policy-profiles.cjs');
const {withRank26DceRecipientPreference} =
  require('./rank26-dce-recipient-preference.cjs');
const {withRank26SourceEnergyObserver} =
  require('./rank26-firstturn-energy-source-observer.cjs');

const SOURCE_SEEDS = Object.freeze([
  {repeat: 61, seat: 1, seed: 293786272, originalEnergy: 'Lightning Energy'},
  {repeat: 67, seat: 1, seed: 34971702, originalEnergy: 'Double Colorless Energy'},
  {repeat: 68, seat: 1, seed: 336175900, originalEnergy: 'Double Colorless Energy'}
]);
const ENGINE = 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Summarize the source first turn without inferring a competitive win.
 * @param {object} game Verified headless record.
 * @param {number} seed Native seed.
 * @param {string[]} a Physical source seat A list.
 * @param {string[]} b Physical source seat B list.
 * @returns {object}
 */
function sourceTurn(game, seed, a, b) {
  assert.equal(game.seed, seed);
  assert.equal(game.verifiedByDrawLog, true);
  assert.equal(game.engine, ENGINE);
  assert.equal(game.firstTurnSlot, 1);
  assert.deepEqual(game.deckHashes, [hash(a), hash(b)]);
  assert.equal(game.researchPolicyProfile, RANK26_PROPAGATION_PROFILE);
  const actions = (game.decisionTrace || []).filter(
    e => e.playerSlot === 1 && e.turnBefore === 1);
  return {
    actions: actions.map(e => ({
      action: e.action, card: e.card ?? null,
      ability: e.ability ?? null, turn: e.turnBefore,
      prizesAfter: e.prizesAfter ?? null
    })),
    selectedEnergy: actions.filter(e =>
      e.action === 'PlayCardAction' &&
      ['Lightning Energy','Double Colorless Energy'].includes(e.card)
    ).map(e => e.card),
    firstTurnRootAttack: actions.some(e => e.action === 'AttackAction'),
    opposingPrizesAtFinalSourceRoot: actions.length ?
      actions.at(-1).prizesAfter[0] : null,
    finished: game.finished === true,
    engineWinner: game.finished === true ? game.winner : null
  };
}

/** @returns {object} */
function compare() {
  initializeCards();
  const plan = planAichi(26, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const source = plan.candidate.cards;
  const mappedMeloetta = source.filter(name => name.startsWith('Meloetta ex '));
  assert.equal(mappedMeloetta.length, 1,
    'Exactly one original rank26 mapped Meloetta is required');
  const enemy = plan.opponents.find(d => d.rank === 6);
  assert.equal(source.length, 60);
  assert.equal(enemy?.status, 'ready');
  assert.equal(enemy.cards.length, 60);
  const cases = [];
  for (const item of SOURCE_SEEDS) {
    const root = firstTurnState(source, enemy.cards, item.seat, item.seed);
    assert.equal(root.verifiedByDrawLog, true);
    assert.equal(root.firstTurnSlot, item.seat);
    assert.ok(root.attackerHand.includes('Double Colorless Energy SUM'),
      'Registered genuine held-DCE opening changed');

    const request = {
      deckA: enemy.cards, deckB: source,
      rank26SourceSeat: 1, seed: item.seed,
      maxActions: 120, strictPromptValidation: true,
      isolatePolicyRandomness: true, captureDecisionTrace: true,
      forestSealSearchCorrection: true,
      leleEntryAbilityLockCorrection: true,
      entryDrawLockCorrection: true,
      label: 'rank26-held-DCE-source-development-' + item.repeat
    };
    const control = sourceTurn(
      runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE),
      item.seed, enemy.cards, source);
    assert.equal(control.selectedEnergy[0], item.originalEnergy,
      'Pinned baseline no longer reproduces registered Energy root');

    const observed = withRank26SourceEnergyObserver(1,
      () => withRank26DceRecipientPreference(1,
        () => runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE)));
    const guarded = observed.result;
    const variant = sourceTurn(guarded.result, item.seed, enemy.cards, source);
    assert.ok(guarded.policyAudit.events.length > 0,
      'New first-turn DCE guard failed to intercept an eligible root');
    const observedDce = observed.events.filter(e =>
      e.selectedCard.startsWith('Double Colorless Energy '));
    if (item.seed === 34971702) {
      assert.equal(observedDce.length, 1,
        'Native source did not actually attach the intended unique DCE');
      const e = observedDce[0];
      assert.equal(e.after.bench[1]?.pokemon,mappedMeloetta[0],
        'Native source Bench recipient must match exact mapped Meloetta print');
      assert.ok(e.after.bench[1].energy.includes('Double Colorless Energy SUM'),
        'Native Store accepted DCE root without attaching to Meloetta Bench');
      assert.equal(e.after.active.energy.some(x =>
        x.startsWith('Double Colorless Energy ')), false,
        'Unique DCE incorrectly attached to initial active instead');
    } else {
      assert.equal(observedDce.length,0,
        'Deferred development case unexpectedly consumed unique DCE');
    }
    cases.push({
      repeat: item.repeat, physicalSeat: 'B', seed: item.seed,
      opening: {
        active: root.attackerActive, bench: root.attackerBench,
        heldDce: true
      },
      control, guard: variant, policy: guarded.policyAudit,
      nativePostDispatchEnergy:observed.events,
      competitiveGameQualified: false
    });
  }
  return {
    schema: 'rank26-held-dce-native-source-policy-development-v2',
    engine: ENGINE, originalDeckCounts: [60,60],
    sourceRank: 26, opponentRank: 6,
    registeredDevelopmentCases: SOURCE_SEEDS.length,
    selection: 'retrospective held-DCE cases from fixed 48-deal source cohort',
    sourceHash: plan.candidateDigest,
    paperClockQualified: false,
    opponentPolicyQualified: false,
    competitiveGameQualified: false,
    cases
  };
}

/**
 * Atomic and exclusively locked research artifact write.
 * @param {string} filename JSON file name.
 * @param {object} value Serializable report.
 */
function writeAtomic(filename, value) {
  const dst = path.resolve(process.cwd(), filename);
  const lock = dst + '.lock';
  const tmp = dst + '.' + process.pid + '.tmp';
  const handle = fs.openSync(lock, 'wx');
  try {
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n',
      {flag: 'wx'});
    fs.renameSync(tmp, dst);
  } finally {
    fs.closeSync(handle);
    fs.rmSync(lock);
    if (fs.existsSync(tmp)) fs.rmSync(tmp);
  }
}
if (require.main === module) {
  const report = compare();
  writeAtomic('rank26-held-dce-native-source-replay.json', report);
  process.stdout.write(JSON.stringify(report.cases.map(c => ({
    seed: c.seed, original: c.control.selectedEnergy,
    guarded: c.guard.selectedEnergy,
    interventions: c.policy.events.length
  })), null, 2) + '\n');
}
module.exports = {compare, SOURCE_SEEDS};
