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
const {withNativePaperSupporterDiscipline,VERSION:paperQuotaVersion} =
  require('./agent41-paper-supporter-discipline.cjs');
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
  const tagTeamNames=['Guzma & Hala','Cynthia & Caitlin',
    'Bellelba & Brycen-Man'];
  const tagTeamPrintings=[...new Set(source.cards.filter(printing=>
    tagTeamNames.some(name=>printing.startsWith(name+' '))))];
  assert.equal(tagTeamPrintings.length,3,
    'Published rank24 deck should register the three named TAG TEAM Supporters');

  const base={
    deckA:plan.candidate.cards,deckB:source.cards,
    maxActions:105,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureInitialSourceDealFingerprintSeat:1,
    leleEntryAbilityLockCorrection:true,
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
      Store,1,[...thunder,...tagTeamPrintings],experiment,
      ({owner,prompt,rootOrdinal,globalTurn})=>{
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
          tagTeamAvailableAtNativeSearch:tagTeamPrintings.map(printing=>({
            printing,copies:ownerK1.lookup(printing).knownCopies
          })),
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
    // Compare K1 alone, paper quota alone, and their composition on identical
    // physical source deals. The original unguarded K1 branch contains a
    // genuinely settled second Supporter; it cannot be a paper-valid control.
    /** @param {boolean} k1Enabled Native K1 replanning policy toggle. */
    const guardedLine=(k1Enabled)=>{
      const run=withNativePaperSupporterDiscipline(
        ()=>withBroadThornsSourceAttack(()=>runMatch(request),{
          seat:1,turn:2,discardPriority:priority,
          k1ReplanAfterTagCall:k1Enabled
        })
      );
      const game=run.result.result;
      const audit=run.audit;
      assert.equal(game.verifiedByDrawLog,true);
      assert.equal(game.firstTurnSlot,0);
      assert.equal(game.initialSourceDealFingerprint?.seat,1);
      assert.equal(audit.nativeSupporterQuotaQualified,true,
        'Guarded policy must pass its native both-seat paper-quota audit');
      assert.equal(audit.rootDispatchVetoes.length,0,
        'Guarded policy submitted an illegal Supporter to native Store');
      return {
        k1Enabled,paperQuotaEnabled:true,
        policyVersion:paperQuotaVersion,
        nativeSupporterQuotaQualified:true,
        physicalSourceDealSha256:
          game.initialSourceDealFingerprint.digestSha256,
        sourceTurn2Actions:sourceTurn2Actions(game),
        sourceSupporterEvents:audit.nativeSupporterEvents
          .filter(event=>event.seat===1)
          .map(event=>({
            turn:event.turn,name:event.name,settled:event.settled,
            repeatOnSameTurn:event.repeatOnSameTurn,
            supporterTurnBefore:event.supporterTurnBefore,
            supporterTurnAfter:event.supporterTurnAfter
          })),
        suppressedOwnerProposals:audit.ownerProposalSuppressionCount,
        actions:game.actions,finished:game.finished,
        endReason:game.endReason,
        rootActionTraceSha256:digest(game.decisionTrace??[]),
        // Internal only; used to assert noninterference in the two controls.
        game
      };
    };
    const guardedK0=guardedLine(false);
    const guardedK1=guardedLine(true);
    assert.equal(guardedK0.physicalSourceDealSha256,
      guardedK1.physicalSourceDealSha256,
      'K1 intervention must preserve exact source physical starting deal');
    if(item.label!=='tag-call-before-prized-stadium'){
      assert.deepEqual(stableGame(guardedK1.game),stableGame(guardedK0.game),
        'K1 policy unexpectedly changed an inapplicable quota-guarded control');
    }
    // Exclude full private-bearing games from the portable evidence record.
    const {game:ignoredK0,...quotaOnly}=guardedK0;
    const {game:ignoredK1,...quotaPlusK1}=guardedK1;
    const paperQuotaFactorial={
      evidenceType:'same-deal-native-k1-by-paper-quota-2x2-v1',
      sourceRank:24,candidateRank:1,sourceSeat:1,
      k0Unrestricted:{
        k1Enabled:false,paperQuotaEnabled:false,
        sourceTurn2Actions:sourceTurn2Baseline,
        actualSecondSupporterSettlement:'not-independently-audited-in-this-arm'
      },
      k1Unrestricted:{
        k1Enabled:true,paperQuotaEnabled:false,
        sourceTurn2Actions:sourceTurn2OptIn,
        actualSecondSupporterSettlement:item.label===
          'tag-call-before-prized-stadium'?'audited-below':'unexercised'
      },
      quotaOnly,quotaPlusK1,
      competitiveQualifiedGames:0
    };
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
        paperQuotaFactorial,
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
    schema:'rank24-owner-search-k0-k1-regression-v8-tag-team-choice-availability',
    evidenceType:'retrospective native Store actor-owned deck-search witness',
    fieldManifest:plan.manifestDigest,
    candidateDeckHash:digest(plan.candidate.cards),
    sourceDeckHash:digest(source.cards),
    sourceRank:24, candidateRank:1,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    researchRevision:process.env.GITHUB_SHA??null,
    targetPrinting:thunder[0],
    alternatePrintedTagTeamTargets:tagTeamPrintings,
    rows,
    competitiveQualifiedGames:0,
    caveat:'Retrospective 2x2 K1 by reversible native paper-Supporter-quota contrast. Same-source paired physical deals are verified. Guarded branches pass narrow native quota audit; unguarded root sequences cannot by themselves establish legal Supporter settlement. Selected seeds remain unqualified for competitive win-rate inference.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}

if(require.main===module) main();
module.exports={CASES,main};
