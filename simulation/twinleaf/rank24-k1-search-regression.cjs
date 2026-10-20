'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch, initializeCards} = require('./headless.cjs');
const {withBroadThornsSourceAttack} = require('./rank6-broad-thorns-policy.cjs');
const {withOwnerDeckSearchWitness} = require('./owner-deck-search-witness.cjs');
const {createOwnerDeckKnowledgeEpoch} =
  require('./owner-deck-knowledge-epoch.cjs');
const {createOwnerK1DeckMembership} =
  require('./owner-k1-deck-membership.cjs');
const {ownerK0ObservableInventory} =
  require('./owner-k0-observable-inventory.cjs');
const {withNativeSupporterTurnAudit} =
  require('./native-supporter-turn-audit.cjs');
const {withPaperSupporterQuotaGuard} =
  require('./paper-supporter-quota-guard.cjs');
const {TIER_NAMES} = require('../../scripts/aichi-thorns-crossrank-opening.cjs');

// All three already appeared in the original 24-source-deal registered cohort.
// This experiment is a retrospective causal observability regression.
const CASES = Object.freeze([
  {seed:2966203069,label:'tag-call-before-prized-stadium'},
  {seed:1150814608,label:'held-supporter-prized-stadium'},
  {seed:2804067880,label:'reachable-stadium-attack-control'}
]);

/** @param {object} game */
function stableGame(game) {
  return {
    seed:game.seed,firstTurnSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,deckHashes:game.deckHashes,
    actions:game.actions,turns:game.turns,finished:game.finished,
    winner:game.finished?game.winner:null,
    decisionTrace:game.decisionTrace,attackTrace:game.attackTrace
  };
}

/** @param {string[]} ids */
function digest(ids) {
  return crypto.createHash('sha256').update(JSON.stringify(ids)).digest('hex');
}

/** Actual Store-own-deck-search visibility test for frozen source openings. */
function main() {
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const {TrainerType}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types'));
  const {GameLog}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/game-message'));
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(entry=>entry.rank===24);
  assert.ok(source?.status==='ready'&&plan.candidate.cards.length===60);
  assert.equal(source.cards.length,60);
  const thunder=source.cards.filter(fullName=>
    fullName.startsWith('Thunder Mountain Prism Star '));
  assert.equal(thunder.length,1,'Need exact singleton printed identity');

  const base={
    deckA:plan.candidate.cards,deckB:source.cards,
    maxActions:105,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  const priority=TIER_NAMES.slice(1,4).flat();
  const rows=[];
  for(const item of CASES) {
    const request={...base,seed:item.seed};
    const experiment=()=>withBroadThornsSourceAttack(
      ()=>runMatch(request),{seat:1,turn:2,discardPriority:priority}
    );
    const original=experiment();
    const k1Replanned=withBroadThornsSourceAttack(
      ()=>runMatch(request),{
        seat:1,turn:2,discardPriority:priority,
        k1ReplanAfterTagCall:true
      }
    );
    assert.equal(k1Replanned.result.verifiedByDrawLog,true);
    assert.equal(k1Replanned.result.firstTurnSlot,0);
    assert.deepEqual(k1Replanned.result.deckHashes,original.result.deckHashes);
    if(item.label==='tag-call-before-prized-stadium') {
      assert.match(k1Replanned.abortReason??'',
        /K1 invalidated opening line: Thunder Mountain Prism Star/);
      assert.ok(k1Replanned.events.some(event=>
        event.k1MissingOpeningTargets?.includes('Thunder Mountain Prism Star')));
    } else {
      assert.deepEqual(stableGame(k1Replanned.result),stableGame(original.result),
        'K1 guard must not change an already-viable or non-Tag-Call route');
    }
    // The same native search that exposes a complete deck to its owner is
    // the only event permitted to turn this source actor from K0 into K1.
    const ownerEpoch=createOwnerDeckKnowledgeEpoch();
    const ownerK1=createOwnerK1DeckMembership();
    const ownerK1Events=[];
    const witnessed=withOwnerDeckSearchWitness(
      Store,1,thunder,experiment,({owner,prompt,rootOrdinal,globalTurn})=>{
        ownerEpoch.observeOwnerDeckSearch();
        const learned=ownerK1.observeSearch({owner,prompt,rootOrdinal});
        const stadium=ownerK1.requirementStatus([
          {printing:thunder[0],count:1}
        ]);
        // A stale first-search claim is now impossible even if a caller
        // supplies the owner's true deck and Prize containers.
        assert.throws(()=>ownerK0ObservableInventory({
          owner,registered:source.cards,deckUnsearched:true,
          knowledgeEpoch:ownerEpoch
        }),/K0 first-search claim contradicted/);
        assert.equal(learned.exactMembershipKnown,true);
        ownerK1Events.push({
          rootActionOrdinal:rootOrdinal,globalTurn,
          ownerEpoch:ownerEpoch.snapshot().epoch,
          ownerK1Epoch:learned.epoch,
          stadiumAvailability:stadium.status,
          stadiumAvailableCopies:ownerK1.lookup(thunder[0]).knownCopies,
          staleK0ClaimRejected:true
        });
      }
    );
    assert.deepEqual(stableGame(witnessed.result.result),
      stableGame(original.result),
      'Owner-search witness changed recorded gameplay on seed '+item.seed);
    assert.deepEqual(witnessed.result.events,original.events,
      'Owner-search witness changed policy choices on seed '+item.seed);
    assert.equal(witnessed.result.result.firstTurnSlot,0,
      'Source must actually start second for this historical fixture');
    assert.equal(witnessed.result.result.verifiedByDrawLog,true);

    // Keep just owner-root actions from the actual decision traces so we can
    // distinguish abandoning the scripted line from the generic fallback's
    // potentially identical Supporter spend. Opponent private zones omitted.
    const sourceTurn2Actions=game=>(game.decisionTrace??[])
      .filter(row=>row.playerSlot===1&&row.turnBefore===2)
      .map(row=>({
        actionOrdinal:row.actionOrdinal,
        action:row.action,
        card:row.card??null,
        attackName:row.attackName??null
      }));
    const sourceTurn2Baseline=sourceTurn2Actions(original.result);
    const sourceTurn2OptIn=sourceTurn2Actions(k1Replanned.result);
    let nativeSupporterTurnAudit=null;
    let paperSupporterGuardDiagnostic=null;
    if(item.label==='tag-call-before-prized-stadium'){
      const optInRecheck=withNativeSupporterTurnAudit(
        Store,TrainerType.SUPPORTER,()=>withBroadThornsSourceAttack(
          ()=>runMatch(request),{
            seat:1,turn:2,discardPriority:priority,
            k1ReplanAfterTagCall:true
          }
        ),
        {playSupporterLogMessage:GameLog.LOG_PLAYER_PLAYS_SUPPORTER}
      );
      assert.deepEqual(stableGame(optInRecheck.result.result),
        stableGame(k1Replanned.result),
        'Native Supporter observer must preserve opt-in source game');
      nativeSupporterTurnAudit={
        attemptedSupporterPlays:optInRecheck.events,
        settledSameTurnSecondSupporters:optInRecheck.repeatPlays,
        unsettledRootAttempts:optInRecheck.unsettledPlays,
        observationallyIdentical:true
      };
      assert.ok(optInRecheck.repeatPlays.some(event=>
        event.seat===1&&event.turn===2&&
        event.name.startsWith('Sidney ')&&event.settled&&
        event.supporterTurnBefore>=1&&event.supporterTurnAfter>=2&&
        !event.cardInHandAfter&&event.supporterLogMatched===true),
      'Frozen source must actually settle a second logged Supporter on turn 2');
      // The original registered source root 22 remains native-accepted,
      // while root 24 must be blocked before the illegal second Supporter
      // reaches Store. This is a diagnostic fork, not a substitute bot action.
      const legalRoots=[];
      let violation=null;
      let guardFailure=null;
      try {
        withPaperSupporterQuotaGuard(Store,TrainerType.SUPPORTER,
          ()=>withBroadThornsSourceAttack(
            ()=>runMatch(request),{
              seat:1,turn:2,discardPriority:priority,
              k1ReplanAfterTagCall:true
            }
          ),{
            onLegalSupporter:event=>legalRoots.push(event),
            onViolation:event=>{violation=event;}
          }
        );
      } catch(error) {
        guardFailure=String(error?.message??error);
      }
      assert.ok(guardFailure?.includes('PAPER_SUPPORTER_QUOTA_VIOLATION'),
        'Native paper-rule gate must stop the selected illegal second root');
      assert.equal(violation?.turn,2);
      assert.equal(violation?.seat,1);
      assert.equal(violation?.card,'Sidney FST 241');
      assert.equal(violation?.quotaBefore,1);
      assert.equal(violation?.supporterZoneCountBefore,0);
      assert.equal(violation?.rejectedBeforeNativeDispatch,true);
      assert.ok(legalRoots.some(e=>e.turn===2&&e.seat===1&&
        e.card==='Cynthia & Caitlin CEC'&&e.quotaBefore===0),
        'Native first Supporter must remain legal under reversible guard');
      paperSupporterGuardDiagnostic={
        evidenceType:'source-native-reversible-paper-quota-v1',
        originalSecondSupporterSettled:true,
        acceptedPriorLegalSupporterRoots:legalRoots,
        rejectedRoot:violation,
        guardedGameStopped:true,
        notAnOpponentWin:true,
        strengthQualified:false
      };
    }
    const sourceSearches=witnessed.events.filter(event=>
      event.globalTurn===2&&event.ownerSeat===1);
    assert.ok(ownerK1Events.length>=1,
      'Frozen source must actually conduct a native deck search');
    const expectedStatus=item.seed===2804067880 ?
      'physically-available' : 'impossible';
    assert.equal(ownerK1Events[0].stadiumAvailability,expectedStatus,
      'First own-search K1 must distinguish the two Prized negatives');
    rows.push({
      ...item,
      observedNativeSourceSearches:sourceSearches,
      actorK0ToK1:ownerK1Events,
      policyEvents:original.events,
      k1OptInReplanDiagnostic:{
        policyOption:'k1ReplanAfterTagCall',
        openingPlan:k1Replanned.openingPlan,
        abortReason:k1Replanned.abortReason,
        events:k1Replanned.events,
        originalSourceTurn2Actions:sourceTurn2Baseline,
        optInSourceTurn2Actions:sourceTurn2OptIn,
        ...(nativeSupporterTurnAudit?{nativeSupporterTurnAudit}:{}),
        ...(paperSupporterGuardDiagnostic?{paperSupporterGuardDiagnostic}:{}),
        rootActionTraceSha256:digest(k1Replanned.result.decisionTrace),
        sameGameAsOriginal:JSON.stringify(stableGame(k1Replanned.result))===
          JSON.stringify(stableGame(original.result)),
        gameFinished:k1Replanned.result.finished,
        strengthQualified:false
      },
      openingPlan:original.openingPlan,
      abortReason:original.abortReason,
      proposedAttack:original.completed,
      actualSourceAttacks:original.result.attackTrace.filter(event=>
        event.seat===1&&event.turn===2),
      firstTurnSlot:original.result.firstTurnSlot,
      identicalRootDecisionsAndSourceEffects:true
    });
  }
  const report={
    schema:'rank24-owner-search-k0-k1-regression-v6-native-paper-guard-negative-control',
    evidenceType:'retrospective native Store actor-owned deck-search witness',
    fieldManifest:plan.manifestDigest,
    candidateDeckHash:digest(plan.candidate.cards),
    sourceDeckHash:digest(source.cards),
    sourceRank:24, candidateRank:1,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    researchRevision:process.env.GITHUB_SHA??null,
    targetPrinting:thunder[0],
    rows,
    competitiveQualifiedGames:0,
    caveat:'Read-only native owner-epoch and Supporter observers preserve gameplay. Opt-in K1 replanning is checked for actually settled second same-turn Supporters by card identity, hand removal, quota increment and printed Supporter log; paper-rule exception audit remains a separate question. These selected seeds remain unqualified for competitive win rate.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}

if(require.main===module) main();
module.exports={CASES,main};
