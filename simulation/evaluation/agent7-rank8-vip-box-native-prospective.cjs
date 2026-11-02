'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const {planAichi} = require('./aichi-pilot.cjs');
const {withCanonicalAndBoxShake} =
  require('./agent44-canonical-boxshake-composition.cjs');
const {boxShakeOpponentReplyPacket} =
  require('./agent44-boxshake-opponent-reply-packet.cjs');
const {runMatch, initializeCards} =
  require('../twinleaf/headless.cjs');
const {schedule} =
  require('../twinleaf/agent44-rank8-box-k0-source-census.cjs');
const {withRank8AuthenticK0Observer} =
  require('../twinleaf/agent44-rank8-box-k0-source-census.cjs');
const {withSharedFirstTurnBoxShake} =
  require('../twinleaf/agent44-owner-boxshake-native-policy.cjs');
const {withOwnerVipBeforeBox, VERSION} =
  require('../twinleaf/agent7-vip-before-box-native.cjs');

const ROOT = path.resolve(__dirname, '../..');
const registered = JSON.parse(fs.readFileSync(path.join(ROOT,
  'results/aichi-2026/registrations/agent7-rank8-vip-box-native-prospective-20261102.json'), 'utf8'));
const sha = obj => crypto.createHash('sha256').update(
  JSON.stringify(obj)).digest('hex');

/**
 * A historical previously registered original rank8 source schedule, but
 * indices 640..767 are preregistered specifically for this independent panel.
 * The manifest is checked before the first native Store action.
 *
 * @returns {{trial:string,sourceSeat:0|1,seed:number}[]}
 */
function frozenSchedule() {
  assert.equal(registered.index_start, 640);
  assert.equal(registered.index_count, 128);
  assert.equal(registered.index_end_inclusive, 767);
  const rows = schedule(640, 128);
  assert.equal(rows.length, registered.index_count);
  assert.equal(new Set(rows.map(x => x.seed)).size, rows.length);
  assert.equal(sha(rows), registered.source_schedule_sha256_canonical_json);
  assert.deepEqual(rows.slice(0, 3).map((r, i) =>
    ({index: 640 + i, sourceSeat: r.sourceSeat, seed: r.seed})),
  registered.first);
  assert.deepEqual(rows.slice(-3).map((r, i) =>
    ({index: 765 + i, sourceSeat: r.sourceSeat, seed: r.seed})),
  registered.last);
  return rows;
}

/**
 * Use actual canonical both-seat actor with original Agent44 Box handler.
 * In the treatment only, a *later installed* reversible VIP hook can precede
 * that same Box flow on a qualifying owner physical root. Both players
 * receive identical adapters and no opponent concealed state is consulted.
 *
 * @template T
 * @param {()=>T} execute Pinned Store game.
 * @param {boolean} vipFirst Adopt the independent alternative or baseline.
 * @returns {{result:T,audit:object,vipAudit:object|null}}
 */
function commonSymmetricPolicy(execute, vipFirst) {
  let vipAudit = null;
  const options = {
    enableBoxShake: true, flexible: true
  };
  if (vipFirst) {
    options.box = (inner, boxOptions) =>
      withSharedFirstTurnBoxShake(() => {
        try {
          const vip = withOwnerVipBeforeBox(inner);
          vipAudit = vip.audit;
          return vip.result;
        } catch (error) {
          vipAudit = error.agent7VipBeforeBoxAudit ?? null;
          throw error;
        }
      }, boxOptions);
  }
  const result = withCanonicalAndBoxShake(execute, options);
  if (vipFirst) assert.ok(vipAudit,
    'Enabled native VIP-before-Box hook must report actual Store audit');
  return {result: result.result, audit: result.audit, vipAudit};
}

/**
 * Real paired original-source native evidence. All 128 registered
 * original physical deals are reported regardless of opportunity, winning
 * side, cap or error. No source-strength certification.
 *
 * @returns {object}
 */
function run() {
  const allRows = frozenSchedule();
  const candidate = require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan = planAichi(candidate, {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  });
  const source = plan.opponents.find(x => x.rank === registered.source_rank);
  assert.equal(source?.status, 'ready');
  assert.equal(source.cards.length, 60);
  assert.equal(plan.candidate.cards.length, 60);
  initializeCards();
  const {Store} = require(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store'));
  const rows = [];
  for (const original of allRows) {
    const request = {
      deckA: original.sourceSeat === 0 ? source.cards : plan.candidate.cards,
      deckB: original.sourceSeat === 1 ? source.cards : plan.candidate.cards,
      seed: original.seed, maxActions: 120,
      strictPromptValidation: true, forestSealSearchCorrection: true,
      doubleDragonRecovery: true, supporterDecisionCorrection: true,
      isolatePolicyRandomness: true, leleEntryAbilityLockCorrection: true,
      radiantGateLockCorrection: true, entryDrawLockCorrection: true,
      captureDecisionTrace: true,
      label: 'agent7-original-rank8-vip-first-vs-box-' + original.trial
    };
    try {
      const baseline = withRank8AuthenticK0Observer(Store,
        original.sourceSeat, () =>
          commonSymmetricPolicy(() => runMatch(request), false));
      const selected = withRank8AuthenticK0Observer(Store,
        original.sourceSeat, () =>
          commonSymmetricPolicy(() => runMatch(request), true));
      const b = baseline.result;
      const t = selected.result;
      const v = t.vipAudit;
      assert.deepEqual(baseline.sourceK0, selected.sourceK0,
        'Same physical source first owner K0 must agree');
      assert.deepEqual(b.result.deckHashes, t.result.deckHashes,
        'Baseline and alternative must use the same deck and seed');
      assert.equal(b.result.firstTurnSlot, t.result.firstTurnSlot,
        'Baseline and alternative must have the same actual first player');
      assert.equal(v.competitiveQualifiedGames, 0);
      if (v.proposedVipRoots === 0)
        assert.deepEqual(b.result.decisionTrace, t.result.decisionTrace,
          'No eligible VIP contender must leave full native game unchanged');
      const box = t.audit.box;
      const sourceBox = box.offers.filter(x =>
        x.seat === original.sourceSeat);
      const sourceVip = v.offers.filter(x =>
        x.seat === original.sourceSeat);
      const packet = boxShakeOpponentReplyPacket(
        t.result, box, original.sourceSeat);
      const vipPublicRoots = t.result.rootActionLedger.filter(x =>
        x.playerSlot === original.sourceSeat &&
        x.action === 'PlayCardAction' &&
        x.card === 'Battle VIP Pass' && x.pendingPrompt === null);
      const originalSourceBoxRoots = t.result.rootActionLedger.filter(x =>
        x.playerSlot === original.sourceSeat &&
        x.action === 'PlayCardAction' &&
        x.card === 'Secret Box' && x.pendingPrompt === null);
      const chronological = sourceVip.length > 0 &&
        vipPublicRoots.some(vip =>
          originalSourceBoxRoots.some(boxRoot =>
            vip.turnBefore === boxRoot.turnBefore &&
            vip.actionOrdinal < boxRoot.actionOrdinal));
      const status = v.proposedVipRoots === 0 ? 'NO_VIP_BOX_CONTENTION' :
        v.acceptedVipRoots === 0 ? 'VIP_PROPOSED_UNACCEPTED' :
        v.physicalBenchConfirmed === 0 ?
        'VIP_ACCEPTED_BASIC_NOT_PHYSICALLY_CONFIRMED' :
        chronological && packet.strictPublicContinuationAccepted ?
        'VIP_THEN_BOX_SHAKE_OPPONENT_REPLY_CONFIRMED' :
        chronological ? 'VIP_THEN_BOX_WITHOUT_COMPLETE_REPLY' :
        'VIP_PLACED_BOX_NOT_CONFIRMED';
      rows.push({
        ...original, status,
        originalSourceK0: baseline.sourceK0,
        originalSourceK0Equal: true,
        trueStarterSeat: b.result.firstTurnSlot,
        sourceActualFirst: b.result.firstTurnSlot === original.sourceSeat,
        physicalDeckHashesEqual: true, originalBotNoOfferTraceParity:
          v.proposedVipRoots === 0 ? true : null,
        baseline: {
          actions: b.result.actions, finished: b.result.finished,
          traceSha256: sha(b.result.decisionTrace),
          publicRootLedgerSha256: sha(b.result.rootActionLedger)
        },
        treatment: {
          actions: t.result.actions, finished: t.result.finished,
          traceSha256: sha(t.result.decisionTrace),
          publicRootLedgerSha256: sha(t.result.rootActionLedger)
        },
        vipNativeAudit: v,
        originalBoxSourceOfferCount: sourceBox.length,
        sourceVipOpportunityCount: sourceVip.length,
        sourceVipNativeRootCount: vipPublicRoots.length,
        nativeAcceptedVipBeforeBox: chronological,
        sourceToolGarbodorReply: packet,
        sourceBoxRootOrdinals: originalSourceBoxRoots.map(x =>
          x.actionOrdinal).slice(0, 10),
        sourceVipRootOrdinals: vipPublicRoots.map(x =>
          x.actionOrdinal).slice(0, 10),
        error: null
      });
    } catch (error) {
      rows.push({
        ...original, status: 'NATIVE_ERROR',
        originalSourceK0: null, originalSourceK0Equal: null,
        trueStarterSeat: null, sourceActualFirst: null,
        physicalDeckHashesEqual: null, originalBotNoOfferTraceParity: null,
        baseline: null, treatment: null,
        vipNativeAudit: error.agent7VipBeforeBoxAudit ?? null,
        sourceToolGarbodorReply: null,
        error: {name: error.name ?? null,
          message: String(error.message ?? error)}
      });
    }
  }
  const count = key => rows.filter(r => r.status === key).length;
  return {
    schema: 'agent7-original-rank8-symmetric-vip-before-flexbox-native-128-pairs-v1',
    registration: registered,
    scheduleSha256: sha(allRows),
    actorProfile: {
      defaultOff: true, sameCanonicalBothSeats: true,
      sameOriginalFlexBoxBothSeats: true,
      onlyDifference: 'owner-native VIP-first pre-Box opt-in'
    },
    nativeSourceOriginal60: true, originalRank8Source: true,
    sourceManifestDigest: plan.manifestDigest,
    candidateDigest: plan.candidateDigest,
    enginePin: plan.engineRevision,
    sourceCodeRevision: process.env.GITHUB_SHA ?? null,
    nativeVipVersion: VERSION,
    registeredTrials: rows.length,
    totalNativeAttempted: rows.length * 2,
    sourceSeats: {
      0: rows.filter(r => r.sourceSeat === 0).length,
      1: rows.filter(r => r.sourceSeat === 1).length
    },
    summary: {
      noVipBoxContention: count('NO_VIP_BOX_CONTENTION'),
      nativeError: count('NATIVE_ERROR'),
      vipRootProposedUnaccepted: count('VIP_PROPOSED_UNACCEPTED'),
      vipAcceptedNoPhysicalBasic: count(
        'VIP_ACCEPTED_BASIC_NOT_PHYSICALLY_CONFIRMED'),
      nativeVipThenBoxCompleteReply: count(
        'VIP_THEN_BOX_SHAKE_OPPONENT_REPLY_CONFIRMED'),
      nativeVipThenBoxIncompleteReply: count(
        'VIP_THEN_BOX_WITHOUT_COMPLETE_REPLY'),
      nativeVipPlacedBoxUnconfirmed: count(
        'VIP_PLACED_BOX_NOT_CONFIRMED'),
      strictNoOpportunityParityCount: rows.filter(r =>
        r.originalBotNoOfferTraceParity === true).length
    },
    rows,
    competitiveQualifiedGames: 0,
    caveat: 'Prospective original-source development fixtures only. The native bot still has generic owner prompt and opposing decision gaps; 120-action caps and any Store terminal outcomes have no competitive-paper-clock interpretation. No 99.5% game win inference.'
  };
}

if (require.main === module) process.stdout.write(
  JSON.stringify(run(), null, 2) + '\n');

module.exports = {
  registered, frozenSchedule, commonSymmetricPolicy, run
};
