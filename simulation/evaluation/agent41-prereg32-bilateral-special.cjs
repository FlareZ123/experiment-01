'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {REGISTRATION_BLOB,plannedTrials} =
  require('./agent41-prospective-canonical-scout.cjs');

const ROOT = path.resolve(__dirname, '../..');
const FRAME =
  'results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const VERSION = 'agent41-prior-frozen-32-bilateral-special-policy-v1';

/**
 * Apply a post-registration policy contrast to all 32 authentic original
 * rank6/rank11 candidate-source combinations from the prior frozen frame.
 * The original frame hash is asserted before simulation; the intervention
 * cannot influence case selection, original decks or initial random seeds.
 * @param {'control'|'both-special'} mode
 * @returns {object} Full original Store attempts and raw audit receipts.
 */
function runPreregisteredSpecial(mode) {
  assert.ok(mode === 'control' || mode === 'both-special');
  const bytes = fs.readFileSync(path.join(ROOT, FRAME));
  const blob = createHash('sha1').update('blob ' + bytes.length + '\0')
    .update(bytes).digest('hex');
  assert.equal(blob, REGISTRATION_BLOB, 'Original seed plan changed');
  const plan = JSON.parse(bytes.toString('utf8'));
  const trials = plannedTrials(plan);
  const both = mode === 'both-special';
  const {runDevelopment} =
    require('./agent41-bilateral-v2-development.cjs');
  const result = runDevelopment({...plan.frozenRunOptions,
    registeredTrials:trials,registeredFrameName:FRAME,
    bilateralSpecialEnergyRoot:both});
  assert.equal(result.attempted, 32);
  assert.equal(result.rows.length, 32);
  assert.equal(result.enginePin, plan.enginePin);
  assert.equal(result.registeredTrialFrame, FRAME);
  assert.equal(result.competitiveQualifiedGames, 0);
  assert.ok(result.rows.every(row =>
    row.qualifiesForCompetitiveInference === false));
  if (both) {
    for (const row of result.rows) if (row.bilateralSpecialEnergyProfile) {
      assert.equal(row.bilateralSpecialEnergyProfile.mode, 'both');
      assert.equal(row.bilateralSpecialEnergyProfile.ownerSeat, null);
      assert.equal(row.bilateralSpecialEnergyProfile.sharedPolicy, true);
    }
  }
  return {schema:VERSION,mode,registrationPath:FRAME,
    registrationBlob:blob,registrationPredatesPolicy:true,
    originalSourceRanks:plan.ranks,
    candidateSlots:plan.candidateSlots,candidateIds:plan.candidateIds,
    registeredAttempts:32,unqualifiedGames:32,
    result,competitiveQualifiedGames:0,
    limitation:'Prior independent seeds only rank6/11, weak generic bot/prompt and paper clock; never a competitive game win-rate estimate.'};
}

if (require.main === module) {
  assert.equal(process.argv.length, 3);
  process.stdout.write(JSON.stringify(
    runPreregisteredSpecial(process.argv[2]), null, 2) + '\n');
}

module.exports = {FRAME,VERSION,runPreregisteredSpecial};
