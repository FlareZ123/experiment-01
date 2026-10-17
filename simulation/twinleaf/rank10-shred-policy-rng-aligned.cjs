'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {runMatch,initializeCards} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {withStoreDispatchTranscript} = require('./store-dispatch-transcript.cjs');
const {withTurn28CopycatShredFork} = require('./mimikyu-turn28-shred-fork.cjs');
const {responseLedger} = require('./rank10-copycat-response-ledger.cjs');

/** @param {string[]} cards */
const deckHash = cards => crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');

/** @param {object} event */
const comparedAction = event => ({
  action:event.action,parameters:event.parameters,
  pendingPrompt:event.pendingPrompt||null,
  zoneDigestBefore:event.zoneDigestBefore,
  continuityDigestBefore:event.continuityDigestBefore
});

/** @param {object[]} a @param {object[]} b @param {number} start */
function firstDifferenceAfter(a,b,start) {
  const max=Math.max(a.length,b.length);
  for(let i=start;i<max;i++) {
    if(JSON.stringify(comparedAction(a[i]||{})) !==
       JSON.stringify(comparedAction(b[i]||{}))) {
      return {index:i,control:a[i]?.action||null,alternate:b[i]?.action||null};
    }
  }
  return null;
}

/**
 * Three source-dealt arms: true original root-215 Retreat proposal, a direct
 * Shred fork with proposal RNG consumption skipped, and the same direct
 * Shred fork after consuming exactly the measured original policy RNG draws.
 *
 * This aligns one policy RNG *position* under the pinned headless xorshift
 * protocol; no source Store is cloned and no opponent competence is claimed.
 */
function main() {
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(manifest.decks.map(x=>[x.rank,x]));
  const candidate=byRank.get(1),opponent=byRank.get(10);
  assert.ok(candidate?.playableUnderEngine && opponent?.playableUnderEngine);
  assert.equal(candidate.cardIds.length,60);
  assert.equal(opponent.cardIds.length,60);
  initializeCards();

  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {SimpleTacticsAi}=require(path.join(output,
    'simple-bot/simple-tactics-ai'));
  const {AttackAction}=require(path.join(output,
    'game/store/actions/game-actions'));
  const {ResolvePromptAction}=require(path.join(output,
    'game/store/actions/resolve-prompt-action'));
  const types={Store,Bot:SimpleTacticsAi,AttackAction,ResolvePromptAction};
  const seed=4246551499,rootOrdinal=215;
  const request={
    deckA:opponent.cardIds,deckB:candidate.cardIds,seed,
    maxActions:350,captureDecisionTrace:true,captureCopycatTurnStartSeat:1,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,mimikyuApexTimelessPolicy:true,
    mimikyuApexTimelessPolicySeat:1,mimikyuTurn27SetupSeat:1,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };

  /** @param {boolean} force @param {object} options */
  function run(force,options={}) {
    return withStoreDispatchTranscript(Store,
      ()=>withTurn28CopycatShredFork(types,()=>runMatch(request),
        {forceShred:force,rootActionOrdinal:rootOrdinal,...options}),
      {liveStoreOnly:true,sourceZoneEveryDispatch:true});
  }

  const original=run(false,{capturePolicyRngAtOrdinal:true});
  const originalDecision=original.result.policyRngLedger;
  assert.equal(originalDecision.length,1,
    'Original root-215 bot decision RNG draw count must be observed exactly once');
  assert.equal(originalDecision[0].rootActionOrdinal,rootOrdinal);
  assert.equal(originalDecision[0].action,'RetreatAction',
    'Published source branch no longer proposes the historical Retreat');
  const proposalDraws=originalDecision[0].draws;
  assert.ok(Number.isSafeInteger(proposalDraws) && proposalDraws>=0);

  const unaligned=run(true);
  const aligned=run(true,{policyRngAlignDraws:proposalDraws});
  assert.deepEqual(aligned.result.policyRngLedger,[{
    kind:'aligned-direct-fork',rootActionOrdinal:rootOrdinal,
    draws:proposalDraws,action:'AttackAction'
  }]);
  const originalTrace=original.actionTrace;
  const unalignedTrace=unaligned.actionTrace;
  const alignedTrace=aligned.actionTrace;

  for(let i=0;i<rootOrdinal;i++) {
    assert.deepEqual(comparedAction(unalignedTrace[i]),
      comparedAction(originalTrace[i]),'Unaligned original prefix diverged at '+i);
    assert.deepEqual(comparedAction(alignedTrace[i]),
      comparedAction(originalTrace[i]),'Aligned original prefix diverged at '+i);
  }
  assert.equal(originalTrace[rootOrdinal].action,'RetreatAction');
  for(const trace of [unalignedTrace,alignedTrace]) {
    assert.equal(trace[rootOrdinal].action,'AttackAction');
    assert.equal(trace[rootOrdinal].parameters.name,'Copycat');
    assert.equal(trace[rootOrdinal].zoneDigestBefore,
      originalTrace[rootOrdinal].zoneDigestBefore);
    assert.equal(trace[rootOrdinal].continuityDigestBefore,
      originalTrace[rootOrdinal].continuityDigestBefore);
  }
  assert.equal(originalTrace[rootOrdinal].zoneDigestBefore,
    '5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d');
  assert.equal(originalTrace[rootOrdinal].continuityDigestBefore,
    '0faef7ac48c4f7a82c92413a3e0831b33bcc5ad162336e451d4d8ae4d6235548');

  const summary=r=>({
    finished:r.result.result.finished,
    winner:r.result.result.winner,
    prizesRemaining:r.result.result.prizesRemaining,
    turns:r.result.result.turns,
    actions:r.result.result.actions,
    traceLength:r.actionTrace.length
  });

  return {
    schema:'rank10-shred-policy-rng-consumption-aligned-preflight-v1',
    source:{opponentRank:10,candidateRank:1,physicalCandidateSeat:1,
      seed,rootOrdinal,pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      opponentDeckSha256:deckHash(opponent.cardIds),
      candidateDeckSha256:deckHash(candidate.cardIds),
      initialPolicyRng:'seat-isolated-seeded-xorshift',
      sourceZoneDigest:originalTrace[rootOrdinal].zoneDigestBefore},
    originalProposal:originalDecision[0],
    alignedForkProposal:aligned.result.policyRngLedger[0],
    assumption:'Same seed, source prefix and measured seat-policy RNG draws place the two streams at the same position immediately after the fork. Closure state is not independently serialized.',
    firstRootDivergence:rootOrdinal,
    unalignedVsAlignedAfterFork:firstDifferenceAfter(
      unalignedTrace,alignedTrace,rootOrdinal+1),
    original:summary(original),
    unaligned:summary(unaligned),
    aligned:summary(aligned),
    nextFiveTurnsUnaligned:responseLedger(unalignedTrace,
      {startOrdinal:rootOrdinal,horizonTurns:5}),
    nextFiveTurnsAligned:responseLedger(alignedTrace,
      {startOrdinal:rootOrdinal,horizonTurns:5}),
    policyRngPositionPreconditionCheckedByDrawCount:true,
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    caveat:'Exact one-seed two-policy fork. Decision-quality, hidden-information and paper-rule gates remain open.'
  };
}

if(require.main===module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,firstDifferenceAfter};
