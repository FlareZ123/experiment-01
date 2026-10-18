'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {
  runWithResearchProfile, RANK11_K1_HYBRID_PROFILE,
  RANK11_K0_K1_HYBRID_PROFILE
} = require('./policy-profiles.cjs');
const {withFirstReplySourceZones} =
  require('./rank11-firstreply-source-zones.cjs');

const SEED = 1804615887;
const SOURCE_SEAT = 1;
const ROOT_PAIRS = [
  [RANK11_K1_HYBRID_PROFILE, [
    'Battle VIP Pass', 'Darkness Energy', 'Forest Seal Stone',
    'Secret Box', 'Float Stone', 'Shopping Center'
  ]],
  [RANK11_K0_K1_HYBRID_PROFILE, [
    'Darkness Energy', 'Forest Seal Stone', 'Secret Box', 'Shopping Center'
  ]]
];

/** @param {object} game */
function matchSummary(game) {
  return {finished:game.finished,winner:game.winner,
    actions:game.actions,turns:game.turns,prizesRemaining:game.prizesRemaining};
}
/** @param {object} game */
function firstSourcePlays(game) {
  return game.rootActionLedger.filter(event =>
    event.playerSlot === SOURCE_SEAT && event.turnBefore === 1 &&
    event.action === 'PlayCardAction').map(event => event.card);
}
/** @param {string[]} items @param {string} name */
function copies(items,name) {
  return items.filter(item => item.split(' ').slice(0,-1).join(' ') === name ||
    item === name).length;
}

/**
 * One previously seen source first-turn opportunity; compares the visible
 * post-source first-turn hand/discard/Lost Zone at the exact first opponent
 * decision. The observer cannot modify the action selector.
 * @returns {object}
 */
function run() {
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const source = plan.opponents.find(deck => deck.rank === 11);
  assert.equal(source?.status, 'ready');
  const rows = [];
  const req = {
    deckA: plan.candidate.cards,
    deckB: source.cards,
    rank11SourceSeat: SOURCE_SEAT,
    seed: SEED,
    maxActions: 85,
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    battleCompressorPositiveSelectionCorrection: true,
    isolatePolicyRandomness: true,
    captureDecisionTrace: true,
    label:'rank11-k0-k1-firstreply-zone-witness'
  };
  for (const [profile, expected] of ROOT_PAIRS) {
    const wrapped = withFirstReplySourceZones(SOURCE_SEAT,
      () => runWithResearchProfile(req,profile));
    const game = wrapped.result;
    assert.equal(game.firstTurnSlot,SOURCE_SEAT);
    assert.ok(wrapped.witness,'Missing first ordinary opposing decision witness');
    assert.deepEqual(firstSourcePlays(game),expected);
    assert.deepEqual(matchSummary(game),{
      finished:false,winner:-1,actions:85,turns:13,
      prizesRemaining:[4,6]
    });
    const w=wrapped.witness;
    rows.push({
      profile, sourceSeat:SOURCE_SEAT,
      selectedDirectActions:game.rank11DirectPolicy.actions.length,
      firstSourcePlays:firstSourcePlays(game),
      firstReply:w,
      targetZones: {
        vipHand:copies(w.sourceHand,'Battle VIP Pass'),
        vipDiscard:copies(w.sourceDiscard,'Battle VIP Pass'),
        floatHand:copies(w.sourceHand,'Float Stone'),
        floatDiscard:copies(w.sourceDiscard,'Float Stone'),
        shakeHand:copies(w.sourceHand,'Boost Shake'),
        shakeDiscard:copies(w.sourceDiscard,'Boost Shake'),
        garbodorHand:copies(w.sourceHand,'Garbodor'),
        garbodorDiscard:copies(w.sourceDiscard,'Garbodor')
      },
      boundedOutcome:matchSummary(game)
    });
  }
  return {
    study:'rank11 first opposing normal decision source card-zone audit',
    seed:SEED,sourceRank:11,candidateRank:1,
    engineRevision:plan.engineRevision,
    sourceManifestDigest:plan.manifestDigest,
    candidateDigest:plan.candidateDigest,
    rows,
    qualifiedForCompetitiveInference:false,
    scope:'One previously observed source negative, read-only zone witness'
  };
}
if (require.main === module) {
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports = {run,SEED,SOURCE_SEAT};
