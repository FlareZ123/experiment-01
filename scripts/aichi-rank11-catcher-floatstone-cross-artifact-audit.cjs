'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const VERSION = 'agent14-postclaw-full-deal-cross-artifact-falsification-v1';
const BASE_SHA256 = '6f334b4f540b8b73be3e70c7d41b3c23afabd91030bdad0c4d264bc5b7c78a79';
const RESCUE_SHA256 = '62f3acb40e865d3cb01660191f73ec31557d9e4b868ec47066c06a27f06df1f9';
const TARGET = 'new-moon-lockbreaker-v1';
const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Audit two pre-existing pinned native Store archives on one identical full
 * physical deal, then verify the earliest selected-root divergence, actual
 * Float Stone attachment, retreat, attack and censored/terminal outcomes.
 * @param {object} original - Original retrospective six-arm archive.
 * @param {object} corrected - Independent symmetric mobility rescue replay.
 * @returns {object} A reproducible developmental counterfactual certificate.
 */
function crossAudit(original, corrected) {
  assert.equal(original.schema,
    'agent14-source-rank11-postclaw-six-retrospective-native-v1');
  assert.equal(corrected.schema,
    'agent14-rank11-native-catcher-plus-symmetric-floatstone-falsification-v1');
  assert.equal(original.enginePin, PIN);
  assert.equal(corrected.enginePin, PIN);
  assert.equal(corrected.symmetricFloatStoneRoot, true);
  assert.equal(corrected.originalSourceDealUnchanged, true);
  assert.equal(original.competitiveGameQualified, false);
  assert.equal(corrected.competitiveGameQualified, false);

  const control = original.modes.find(m => m.id === 'catcher')
    .rows.find(r => r.trial.candidateId === TARGET);
  const rescue = corrected.results.rows.find(r => r.trial.candidateId === TARGET);
  assert.ok(control && rescue);
  assert.equal(control.sourceSeat, 1);
  assert.equal(rescue.sourceSeat, 1);
  assert.equal(control.actualStarterSeat, 1);
  assert.equal(rescue.actualStarterSeat, 1);
  assert.equal(control.trial.seed, 2171744612);
  assert.equal(rescue.trial.seed, 2171744612);
  assert.equal(control.fullPhysicalDealFingerprint,
    rescue.fullPhysicalDealFingerprint,
    'The complete two-player physical deal must match');
  assert.equal(control.sourceDealFingerprint, rescue.sourceDealFingerprint);
  assert.equal(control.rootActionLedger[151].turnBefore, 33);

  const base = control.rootActionLedger;
  const fixed = rescue.rootActionLedger;
  const divergence = base.findIndex((row, i) =>
    JSON.stringify(row) !== JSON.stringify(fixed[i]));
  assert.equal(divergence, 152,
    'Native policies must agree before the source mobility decision');
  assert.equal(base[152].action, 'PassTurnAction');
  assert.equal(base[152].playerSlot, 1);
  assert.deepEqual(fixed.slice(152, 155).map(r =>
    [r.playerSlot, r.turnBefore, r.action]), [
    [1, 33, 'PlayCardAction'],
    [1, 33, 'RetreatAction'],
    [1, 33, 'AttackAction']
  ]);
  assert.equal(fixed[152].card, 'Float Stone');

  const afterCatcher = control.candidateRepliesAfterSourceAttacks.find(
    e => e.sourceTurn === 31).candidateReplyTurnFinalPass.publicBoardBeforePass;
  assert.equal(afterCatcher[1].active.name, 'Squawkabilly ex');
  assert.deepEqual(afterCatcher[1].active.energyCards, []);
  assert.deepEqual(afterCatcher[1].active.toolCards, []);
  assert.ok(afterCatcher[1].bench.some(p => p.name === 'Mega Absol ex' &&
    p.energyCards.length === 3));

  const turn33 = rescue.sourceAttackSettlement.attacks.find(a =>
    a.turnBefore === 33 && a.attackName === 'Claw of Darkness');
  assert.ok(turn33 && turn33.settledPromptChain);
  assert.equal(turn33.actionOrdinal, 154);
  assert.equal(turn33.publicBoardBefore[1].active.name, 'Mega Absol ex');
  assert.equal(turn33.publicBoardBefore[1].active.energyCards.length, 3);
  assert.ok(turn33.publicBoardBefore[1].bench.some(p =>
    p.name === 'Squawkabilly ex' && p.toolCards.includes('Float Stone')));
  assert.deepEqual(turn33.prizesBefore, [6, 5]);
  assert.deepEqual(turn33.prizesAfter, [6, 4]);
  const claws = rescue.sourceAttackSettlement.attacks.filter(a =>
    a.attackName === 'Claw of Darkness');
  assert.deepEqual(claws.map(a => a.turnBefore), [31, 33, 35, 37, 39]);

  assert.equal(control.endReason, 'action-limit');
  assert.equal(control.finished, false);
  assert.equal(control.winner, null);
  assert.deepEqual(control.finalPrizes, [6, 5]);
  assert.equal(rescue.endReason, 'engine-game-end');
  assert.equal(rescue.finished, true);
  assert.equal(rescue.winner, 1);
  assert.deepEqual(rescue.finalPrizes, [6, 0]);

  return {schema: VERSION, seed: 2171744612, enginePin: PIN,
    originalSource: 'rank11 Mega Absol/Garbodor', candidate: TARGET,
    sameFullPhysicalDeal: true, identicalRootsBeforeDivergence: divergence,
    firstDivergenceOrdinal: divergence, baselineT33: base[152].action,
    fixedT33: fixed.slice(152, 155).map(r => r.action),
    returnedAttacker: turn33.publicBoardBefore[1].active.name,
    turn33SourcePrizes: [turn33.prizesBefore[1], turn33.prizesAfter[1]],
    resumedClawTurns: claws.map(a => a.turnBefore),
    baselineDisposition: control.endReason, fixedDisposition: rescue.endReason,
    qualifiedGames: 0,
    scope: 'One retrospectively selected native deal; no competitive win inference'};
}

/** @param {string} filepath @param {string} expectedDigest */
function loadChecked(filepath, expectedDigest) {
  const bytes = fs.readFileSync(filepath);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
    expectedDigest);
  return JSON.parse(bytes.toString('utf8'));
}

if (require.main === module) {
  assert.equal(process.argv.length, 4,
    'Provide unzipped original six-arm JSON and independent mobility replay JSON');
  const first = loadChecked(process.argv[2], BASE_SHA256);
  const second = loadChecked(process.argv[3], RESCUE_SHA256);
  process.stdout.write(JSON.stringify(crossAudit(first, second), null, 2) + '\n');
}

module.exports = {VERSION, BASE_SHA256, RESCUE_SHA256, crossAudit, loadChecked};
