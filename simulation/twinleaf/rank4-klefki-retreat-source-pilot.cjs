'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards,runMatch} = require('./headless.cjs');
const hood = require('../../results/aichi-2026/candidate-hood-shadow-rider.json');

/** @param {unknown} x */
const digest = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * An opt-in rank-4 source-dealt post-Pass intervention in a detached Store,
 * never a replacement decision policy. Both arms use identical original
 * engine seed, source card inventories, and gameplay decisions.
 */
function run() {
  initializeCards();
  const plan = planAichi(hood, {
    allowEquivalentBasicEnergies: true,
    allowJapanesePromoHooks: true
  });
  const opponent = plan.opponents.find(row => row.rank === 4);
  assert.equal(opponent?.status, 'ready');
  assert.equal(opponent.cards.length, 60);
  assert.equal(plan.candidate.cards.length, 60);
  const seed = deriveSlotSeeds(20261016, 'pilot', 4, 0).B;
  const common = {
    deckA: opponent.cards,
    deckB: plan.candidate.cards,
    seed,
    maxActions: 600,
    strictPromptValidation: true,
    forestSealSearchCorrection: true,
    doubleDragonRecovery: true,
    supporterDecisionCorrection: true,
    isolatePolicyRandomness: true,
    leleEntryAbilityLockCorrection: true,
    radiantGateLockCorrection: true,
    entryDrawLockCorrection: true,
    captureDecisionTrace: true
  };
  const baseline = runMatch(common);
  const probed = runMatch({...common,captureKlefkiRetreatPassProbe:true});
  assert.equal(baseline.verifiedByDrawLog,true);
  assert.equal(probed.verifiedByDrawLog,true);
  assert.equal(baseline.firstTurnSlot,probed.firstTurnSlot);
  assert.equal(baseline.actions,probed.actions);
  assert.equal(baseline.winner,probed.winner);
  assert.deepEqual(baseline.prizesRemaining,probed.prizesRemaining);
  assert.deepEqual(baseline.deckHashes,probed.deckHashes);
  const cleaned = probed.decisionTrace.map(({klefkiRetreatPassProbe,...row})=>row);
  const unchangedTrace = digest(baseline.decisionTrace) === digest(cleaned);
  assert.ok(unchangedTrace,'Detached probe changed actual game action trace');
  assert.equal(digest(baseline.attackTrace),digest(probed.attackTrace));
  assert.equal(digest(baseline.terminalTransition),digest(probed.terminalTransition));
  const candidates = probed.decisionTrace.filter(row=>row.klefkiRetreatPassProbe)
    .map(row=>({
      ordinal:row.actionOrdinal,globalTurn:row.turnBefore,
      playerSeat:row.playerSlot,active:row.publicBoardBeforePass?.[row.playerSlot]?.active?.name??null,
      benchIndex:row.klefkiRetreatPassProbe.benchIndex,
      probe:row.klefkiRetreatPassProbe
    }));
  assert.ok(candidates.length>0,'Missing source-dealt Dedenne-to-Klefki branch');
  return {
    kind:'rank4-source-dealt-dedenne-klefki-post-pass-branch-v1',
    evidenceClass:'pinned-engine detached action probe, no paper or policy qualification',
    sourceRank:4,candidate:'hood-shield-v1',candidateEngineSlot:'B',
    seedProtocol:'decorrelated-slots-v3',seed,
    verifiedFirstTurnSlot:baseline.firstTurnSlot,
    sourceNoProbeBaseline:{actions:baseline.actions,turns:baseline.turns,
      winner:baseline.winner,prizesRemaining:baseline.prizesRemaining},
    fullActualActionTraceUnchanged:unchangedTrace,
    candidateProbeOpportunities:candidates,
    candidateRankingPermitted:false,winRateEvidence:false,
    unresolved:['Paper-rules status/effects','Detached clone alias safety',
      'Opposing response competence','Strategic value beyond the attacked turn']
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
