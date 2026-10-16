'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { deriveSlotSeeds } = require('../scripts/aichi-decorrelated-seeds.cjs');
const { loadDefaultCampaign, buildCampaign, parseField } =
  require('../scripts/aichi-comparison-campaign.cjs');
const { executeDiagnostic } =
  require('../simulation/evaluation/aichi-campaign-execute.cjs');

/** @param {unknown} value @returns {string} */
const digest = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

test('v3 seeds are deterministic, nonzero and distinct across physical seats', () => {
  const campaign = loadDefaultCampaign('decorrelated-slots-v3');
  assert.equal(campaign.schemaVersion, 3);
  assert.equal(campaign.seedProtocol, 'decorrelated-slots-v3');
  assert.equal(campaign.trials.length, 228);
  const pairs = new Map();
  for (const trial of campaign.trials) {
    const seeds = deriveSlotSeeds(campaign.seedBase, trial.phase,
      trial.rank, trial.repeat);
    assert.equal(trial.seed, seeds[trial.candidateEngineSlot]);
    assert.ok(trial.seed > 0 && trial.seed <= 0xffffffff);
    assert.notEqual(seeds.A, seeds.B);
    const key = [trial.phase, trial.rank, trial.repeat,
      trial.candidateEngineSlot].join(':');
    if (pairs.has(key)) assert.equal(pairs.get(key), trial.seed);
    pairs.set(key, trial.seed);
  }
  assert.deepEqual(campaign, loadDefaultCampaign('decorrelated-slots-v3'));
  assert.deepEqual(deriveSlotSeeds(20261016, 'pilot', 6, 0),
    { A: 1509836216, B: 995631139 });
  assert.notEqual(campaign.planDigest,
    loadDefaultCampaign('independent-slots-v2').planDigest);
  assert.notEqual(campaign.planDigest, loadDefaultCampaign().planDigest);
});

test('v3 physical slots remain decorrelated across phase, repeat and rank', () => {
  const a = deriveSlotSeeds(20261016, 'pilot', 6, 0);
  assert.notDeepEqual(a, deriveSlotSeeds(20261016, 'pilot', 6, 1));
  assert.notDeepEqual(a, deriveSlotSeeds(20261016, 'pilot', 7, 0));
  assert.notDeepEqual(a, deriveSlotSeeds(20261016, 'published-field', 6, 0));
  assert.notDeepEqual(a, deriveSlotSeeds(20261017, 'pilot', 6, 0));

  let agreement = 0, count = 0;
  /** @param {number} x @returns {number} */
  const firstCoin = x => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 31;
  };
  const seen = new Set();
  for (const phase of ['pilot', 'published-field']) {
    for (let rank = 1; rank <= 32; rank += 1) {
      for (let repeat = 0; repeat < 100; repeat += 1) {
        const s = deriveSlotSeeds(20261016, phase, rank, repeat);
        assert.notEqual(s.A, s.B);
        agreement += Number(firstCoin(s.A) === firstCoin(s.B));
        count += 1;
        seen.add(s.A);
        seen.add(s.B);
      }
    }
  }
  assert.equal(count, 6400);
  assert.equal(seen.size, 12800);
  // Descriptive fixed-seed sanity check, not a randomness certification.
  assert.ok(agreement / count > 0.46 && agreement / count < 0.54);
});

test('v3 rejects invalid seed identities and wrong campaign protocol', () => {
  for (const [seedBase, phase, rank, repeat] of [
    [-1, 'pilot', 1, 0],
    [2 ** 32, 'pilot', 1, 0],
    [1, 'unknown', 1, 0],
    [1, 'pilot', 0, 0],
    [1, 'pilot', 33, 0],
    [1, 'pilot', 1, -1],
    [1, 'pilot', 1, 100]
  ]) assert.throws(() => deriveSlotSeeds(seedBase, phase, rank, repeat),
    /Invalid v3 seed identity/);
  const campaign = loadDefaultCampaign('decorrelated-slots-v3');
  campaign.seedProtocol = 'independent-slots-v2';
  assert.throws(() => run(campaign), /Unsupported campaign seed protocol/);
});

const cards = Array(60).fill('SYNTHETIC');

/** @param {object} campaign @param {(request:object)=>object} [runMatch] */
function run(campaign, runMatch = request => ({
  seed: request.seed,
  deckHashes: [request.deckA, request.deckB].map(digest),
  rules: { format: 'EXPANDED' },
  finished: true, winner: 0, actions: 2,
  firstTurnSlot: 0, firstTurnPlayerId: 101,
  firstTurnPlayerName: 'research-A', firstDrawLogName: 'research-A',
  verifiedByDrawLog: true
})) {
  return executeDiagnostic({
    campaign, ranks: [6],
    expectedEngineRevision: 'twinleafgg/' + 'a'.repeat(40),
    runMatch(request) {
      const game = runMatch(request);
      return game && {
        engine: 'twinleafgg/' + 'a'.repeat(40),
        label: request.label,
        ...game,
        rules: { ...game.rules, format: 'EXPANDED',
          firstTurnDrawCard: true, firstTurnUseSupporter: false,
          attackFirstTurn: false }
      };
    },
    resolvePair: trial => ({
      candidateDigest: trial.candidateDigest,
      opponentDigest: trial.opponentDigest,
      candidateCards: cards, opponentCards: cards
    })
  });
}

test('v3 executes frozen diagnostic identity with no competitive claim', () => {
  const campaign = loadDefaultCampaign('decorrelated-slots-v3');
  const seen = [];
  const out = run(campaign, request => {
    seen.push(request.seed);
    return {
      seed: request.seed,
      deckHashes: [request.deckA, request.deckB].map(digest),
      rules: { format: 'EXPANDED' },
      finished: true, winner: 0, actions: 2,
      firstTurnSlot: 0, firstTurnPlayerId: 101,
      firstTurnPlayerName: 'research-A',
      firstDrawLogName: 'research-A', verifiedByDrawLog: true
    };
  });
  const pair = deriveSlotSeeds(20261016, 'pilot', 6, 0);
  assert.deepEqual(seen, [pair.A, pair.B, pair.A, pair.B, pair.A, pair.B]);
  assert.equal(out.campaignSchemaVersion, 3);
  assert.equal(out.seedProtocol, 'decorrelated-slots-v3');
  assert.equal(out.counts['completed-engine-game'], 6);
  assert.equal(out.strengthClaimPermitted, false);
});

test('v3 rejects changed scheduled seeds even with a forged plan digest', () => {
  const campaign = loadDefaultCampaign('decorrelated-slots-v3');
  const trial = campaign.trials.find(t => t.phase === 'pilot' && t.rank === 6);
  trial.seed += 1;
  assert.throws(() => run(campaign), /planDigest integrity mismatch/);
  const { planDigest, trials, ...metadata } = campaign;
  campaign.planDigest = digest({ metadata, trials });
  assert.throws(() => run(campaign), /Malformed fixed-plan trial/);
});

test('v1 and v2 remain separately reproducible', () => {
  const v1 = loadDefaultCampaign();
  const v2 = loadDefaultCampaign('independent-slots-v2');
  assert.equal(v1.schemaVersion, 1);
  assert.equal(v2.schemaVersion, 2);
  assert.ok(!Object.hasOwn(v1, 'seedProtocol'));
  assert.equal(v2.seedProtocol, 'independent-slots-v2');
  assert.deepEqual(v1, loadDefaultCampaign('paired-slots-v1'));
  assert.deepEqual(v2, loadDefaultCampaign('independent-slots-v2'));
});
