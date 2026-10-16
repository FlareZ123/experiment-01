'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const {runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {loadDefaultCampaign} = require('../../scripts/aichi-comparison-campaign.cjs');

/** @param {unknown} x @returns {string} */
function sha(x) {
  return crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
}

/** @param {object[]} a @param {object[]} b */
function firstDifference(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
      return {index:i, control:a[i] || null, experimental:b[i] || null};
    }
  }
  return null;
}

function main() {
  const resolved = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), {
    allowEquivalentBasicEnergies:true, allowJapanesePromoHooks:true
  });
  const byRank = new Map(resolved.decks.map(d => [d.rank,d]));
  const candidate = byRank.get(1), opponent = byRank.get(10);
  assert.ok(candidate?.playableUnderEngine && opponent?.playableUnderEngine);
  const schedule = loadDefaultCampaign('decorrelated-slots-v3');
  const trials = schedule.trials.filter(t => t.phase === 'pilot' &&
    t.rank === 10 && t.candidateId === 'champion-reference' && t.repeat === 0);
  assert.equal(trials.length,2);
  const pairs = [];
  for (const trial of trials) {
    const seat = trial.candidateEngineSlot === 'A' ? 0 : 1;
    const common = {
      deckA:seat === 0 ? candidate.cardIds : opponent.cardIds,
      deckB:seat === 0 ? opponent.cardIds : candidate.cardIds,
      seed:trial.seed,maxActions:350,label:trial.trialId,
      strictPromptValidation:true,forestSealSearchCorrection:true,
      supporterDecisionCorrection:true,doubleDragonRecovery:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      postSuperAliasRepairIsolation:true,
      mimikyuApexCopycatCompatibility:true,
      mimikyuDeclaredHistoryCorrection:true,
      regidragoDeclaredHistoryCorrection:true,
      passClearsLastAttackCorrection:true
    };
    const control = runMatch(common);
    const experimental = runMatch({...common,
      mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:seat});
    assert.deepEqual(runMatch(common),control,
      'Prior policy/hook run altered a subsequent baseline');
    const expectedHashes = [sha(common.deckA),sha(common.deckB)];
    for (const game of [control,experimental]) {
      assert.deepEqual(game.deckHashes,expectedHashes);
      assert.equal(game.seed,trial.seed);
      assert.equal(game.verifiedByDrawLog,true);
    }
    assert.equal(control.firstTurnSlot,experimental.firstTurnSlot);
    pairs.push({
      trialId:trial.trialId,candidateSeat:seat,
      candidateActuallyFirst:control.firstTurnSlot === seat,
      originalReplayByteIdentical:true,
      firstMeaningfulDifference:firstDifference(
        control.decisionTrace || [],experimental.decisionTrace || []),
      control,experimental
    });
  }
  return {
    experiment:'agent7-rank10-copycat-policy-pair',
    engine:resolved.engineRevision,scheduleDigest:schedule.planDigest,
    sourceHashes:[sha(candidate.cardIds),sha(opponent.cardIds)],
    qualifiedForCompetitiveInference:false,
    caveat:'Two paired seeds, experimental clone, unqualified bots and partial action traces. Engine winners are diagnostics, never win-rate evidence.',
    pairs
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports = {main,firstDifference};
