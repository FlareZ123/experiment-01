'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withBroadThornsSourceAttack}=
  require('./rank6-broad-thorns-policy.cjs');
const {withNativePaperSupporterDiscipline,VERSION}=
  require('./agent41-paper-supporter-discipline.cjs');
const {TIER_NAMES}=require('../../scripts/aichi-thorns-crossrank-opening.cjs');

const SEEDS=Object.freeze([2966203069,1150814608,2804067880]);
const hash=o=>createHash('sha256').update(JSON.stringify(o)).digest('hex');

/**
 * Predeclared opposite-physical-actor diagnostic. Keep all three previously
 * published rank24 source-opening seeds: no favorable-seed screening.
 * The original rank24 proven repeat was physical source seat B; this fixture
 * checks the same complete paper restriction and actor-owned tactic at seat A.
 */
function main(){
  initializeCards();
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(entry=>entry.rank===24);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  const priority=TIER_NAMES.slice(1,4).flat();
  const rows=[];
  for(const seed of SEEDS){
    const request={
      deckA:source.cards,deckB:plan.candidate.cards,
      seed,maxActions:105,strictPromptValidation:true,
      forestSealSearchCorrection:true,doubleDragonRecovery:true,
      supporterDecisionCorrection:true,isolatePolicyRandomness:true,
      captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
      radiantGateLockCorrection:true,entryDrawLockCorrection:true,
      captureInitialSourceDealFingerprintSeat:0
    };
    try {
      const guarded=withNativePaperSupporterDiscipline(
        ()=>withBroadThornsSourceAttack(
          ()=>runMatch(request),{
            seat:0,turn:'first-eligible',discardPriority:priority,
            k1ReplanAfterTagCall:true
          })
      );
      const game=guarded.result.result,audit=guarded.audit;
      const actorSourceSupporters=audit.nativeSupporterEvents
        .filter(event=>event.seat===0);
      rows.push({
        seed,status:audit.nativeSupporterQuotaQualified?
          'bounded-native-quota-audited':'native-supporter-unqualified',
        sourcePhysicalSeat:0,actualSourceFirst:game.firstTurnSlot===0,
        firstTurnSlot:game.firstTurnSlot,
        verifiedByDrawLog:game.verifiedByDrawLog,
        sourcePhysicalDeal:game.initialSourceDealFingerprint??null,
        actions:game.actions,turns:game.turns,
        rootActionSha256:hash(game.rootActionLedger??[]),
        sourcePolicyStarted:guarded.result.started,
        sourcePolicyAborted:guarded.result.abortReason,
        actualSourceSupporterEvents:actorSourceSupporters,
        sourceSuppressionExamples:audit.ownerProposalSuppressions
          .filter(e=>e.seat===0),
        sourceSuppressionCountWithinCappedExamples:audit.ownerProposalSuppressions
          .filter(e=>e.seat===0).length,
        wholeGameProposalSuppressionCount:audit.ownerProposalSuppressionCount,
        nativeSupporterQuotaQualified:audit.nativeSupporterQuotaQualified,
        allNativeSettledEvents:audit.nativeSupporterEvents,
        rejectedDirectRoots:audit.rootDispatchVetoes,
        competitiveQualified:false
      });
    } catch(error) {
      rows.push({seed,status:'native-error',sourcePhysicalSeat:0,
        error:String(error?.stack??error),
        nativeSupporterQuotaQualified:false,
        quotaFailure:error?.paperSupporterQuotaEvidence??null,
        competitiveQualified:false
      });
    }
  }
  const report={
    schema:'agent41-rank24-opposite-native-supporter-seat-a-v1',
    sourceRank:24,sourcePhysicalSeat:0,
    candidatePhysicalSeat:1,sourceDeckSha256:hash(source.cards),
    candidateDeckSha256:hash(plan.candidate.cards),
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    policyVersion:VERSION,sourceFirstEligiblePolicy:true,
    sourceSeedSelection:'All three previously published rank24 K1 opening fixtures, precommitted without favorable-seed screening',
    seeds:SEEDS,attempted:rows.length,rows,
    nativeQuotaPasses:rows.filter(r=>r.nativeSupporterQuotaQualified===true).length,
    competitiveQualifiedGames:0,
    caveat:'Retrospective physical seat reversal changes the deal; not paired source hands, a newly representative deck policy, or a timed competitive game. Preserve negatives and no-opportunities.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  assert.equal(rows.length,SEEDS.length);
  assert.ok(rows.every(row=>
    row.nativeSupporterQuotaQualified===true &&
    row.verifiedByDrawLog===true &&
    (row.firstTurnSlot===0||row.firstTurnSlot===1) &&
    row.rejectedDirectRoots.length===0
  ),'One or more precommitted native source-A quota diagnostics failed closed');
  return report;
}
if(require.main===module)main();
module.exports={SEEDS,main};
