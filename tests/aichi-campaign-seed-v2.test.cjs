'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { loadDefaultCampaign } = require('../scripts/aichi-comparison-campaign.cjs');
const { executeDiagnostic } = require('../simulation/evaluation/aichi-campaign-execute.cjs');

const cards = Array(60).fill('SYNTHETIC');
/** @param {object} campaign @param {(request:object)=>object} play */
function execute(campaign, play) {
  return executeDiagnostic({
    campaign, ranks: [6],
    resolvePair: trial => ({
      candidateDigest: trial.candidateDigest,
      opponentDigest: trial.opponentDigest,
      candidateCards: cards, opponentCards: cards
    }),
    runMatch: play
  });
}

test('v2 seeds differ by physical slot and match across fixed candidates', () => {
  const campaign = loadDefaultCampaign('independent-slots-v2');
  const observed = [];
  const out = execute(campaign, request => {
    observed.push(request.seed);
    return {
      seed: request.seed, deckHashes: [
        request.deckA, request.deckB
      ].map(deck => createHash('sha256').update(JSON.stringify(deck)).digest('hex')),
      rules: { format: 'EXPANDED' },
      finished: true, winner: 0, actions: 2,
      firstTurnSlot: 0, firstTurnPlayerId: 101,
      firstTurnPlayerName: 'research-A',
      firstDrawLogName: 'research-A', verifiedByDrawLog: true
    };
  });
  assert.equal(out.campaignSchemaVersion, 2);
  assert.equal(out.seedProtocol, 'independent-slots-v2');
  assert.equal(out.counts['completed-engine-game'], 6);
  assert.deepEqual(observed, [observed[0], observed[0] + 1,
    observed[0], observed[0] + 1, observed[0], observed[0] + 1]);
  assert.equal(out.strengthClaimPermitted, false);
});

test('changed scheduled seed is rejected before gameplay', () => {
  const campaign = loadDefaultCampaign('independent-slots-v2');
  campaign.trials.find(t => t.phase === 'pilot' && t.rank === 6).seed += 1;
  assert.throws(() => execute(campaign, () => null), /planDigest integrity mismatch/);
});

test('even a recomputed digest cannot excuse inconsistent seed assignment', () => {
  const campaign = loadDefaultCampaign('independent-slots-v2');
  campaign.trials.find(t => t.phase === 'pilot' && t.rank === 6).seed += 1;
  const {planDigest: oldDigest, trials, ...metadata} = campaign;
  campaign.planDigest = createHash('sha256')
    .update(JSON.stringify({metadata, trials})).digest('hex');
  assert.throws(() => execute(campaign, () => null), /Malformed fixed-plan trial/);
});

test('schema and seed protocol must agree', () => {
  const campaign = loadDefaultCampaign('independent-slots-v2');
  campaign.seedProtocol = 'paired-slots-v1';
  assert.throws(() => execute(campaign, () => null), /Unsupported campaign seed protocol/);
});
