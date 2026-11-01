'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withBroadThornsSourceAttack,discardOrder}=
  require('../twinleaf/rank6-broad-thorns-policy.cjs');
const {withOwnerTagCallHala}=
  require('../twinleaf/agent6-owner-tagcall-hala-native.cjs');
const {observeSourceSupporterPayments}=
  require('./agent6-matched-t3-dce-attack-vs-plumeria-native.cjs');

const VERSION='agent6-rank6-dual-tagcall-gh-cc-native-selected-deal-v1';
const ROOT=path.resolve(__dirname,'../..');
const REG=path.join(ROOT,
  'results/aichi-2026/registrations/agent6-tagcall-dual-gh-cc-payment-20261101.json');

/** @returns {object} Complete retrospective native Store mechanics comparison. */
function run(){
  const reg=JSON.parse(fs.readFileSync(REG,'utf8'));
  assert.equal(reg.schema,
    'agent6-retrospective-original-rank6-tagcall-dual-gh-cc-payment-v1');
  assert.equal(reg.knownRetrospectiveSelection,true);
  assert.equal(reg.sourceAlwaysActualFirst,true);
  assert.equal(reg.sourceSeatSeedPairs.length,3);
  assert.equal(reg.arms.length,2);
  const manifest=JSON.parse(fs.readFileSync(
    path.join(ROOT,'results/aichi-2026/full-decklists.json'),'utf8'));
  assert.equal(manifest.decks.length,29);
  const reference=manifest.decks.find(x=>
    x.rank===reg.frozenOriginalCandidateRank);
  assert.ok(reference);
  const plan=planAichi({label:'champion-reference',
    cards:reference.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(x=>
    x.rank===reg.frozenOriginalSourceRank);
  assert.equal(source?.status,'ready');

  const rows=[];
  for(const {sourceSeat,seed} of reg.sourceSeatSeedPairs){
    assert.ok(sourceSeat===0||sourceSeat===1);
    const deckA=sourceSeat===0?source.cards:plan.candidate.cards;
    const deckB=sourceSeat===1?source.cards:plan.candidate.cards;
    const preferences=sourceSeat===0?[true,false]:[false,true];
    const request={deckA,deckB,seed,
      maxActions:reg.samePoliciesBothArms.maxActions,
      strictPromptValidation:
        reg.samePoliciesBothArms.strictPromptValidation,
      captureDecisionTrace:true,
      capturePublicAttackTransitions:true,
      captureInitialSourceDealFingerprintSeat:sourceSeat,
      captureStartingBoard:true};
    const arms=[];
    for(const arm of reg.arms){
      try{
        const observed=observeSourceSupporterPayments(sourceSeat,()=>
          withGoFirstChoice(preferences,()=>
            withCanonicalActorOnlyPolicy(()=>
              withBroadThornsSourceAttack(()=>
                withOwnerTagCallHala([deckA,deckB],
                  ()=>runMatch(request),{
                    secondaryTagTeamPriority:arm.secondaryTagTeamPriority
                  }),{
                  seat:sourceSeat,
                  turn:reg.samePoliciesBothArms.broadRank6OwnerTurn,
                  stageDceFirstTurn:true,
                  stageSpeedLightningFirstTurn:false,
                  turn3DirectSpeedAfterDce:false,
                  k1PrizedThunderSpeedFallback:true,
                  liveSpeedLightningAlternative:true,
                  playLockAwareOpening:true,
                  k1ReplanAfterTagCall:true,
                  discardPriority:[
                    ...reg.samePoliciesBothArms.discardPriorityStarts,
                    ...discardOrder.filter(x=>
                      !reg.samePoliciesBothArms.discardPriorityStarts.includes(x))
                  ]
                })
            )
          )
        );
        const go=observed.result;
        const broad=go.result.result;
        const nested=broad.result;
        const game=nested.result;
        assert.equal(game.firstTurnSlot,sourceSeat);
        assert.equal(game.verifiedByDrawLog,true);
        const roots=(seat,turn)=>(game.rootActionLedger??[])
          .filter(x=>x.playerSlot===seat&&x.turnBefore===turn)
          .map(x=>({ordinal:x.actionOrdinal,
            action:x.action,card:x.card??null,
            attack:x.attack??null,pendingPrompt:x.pendingPrompt??null}));
        const ownerAudit=nested.audit?.ownerBySeat?.[sourceSeat];
        arms.push({
          label:arm.label,status:'native-complete-or-capped',
          sourceSeat,seed,
          sourceDealDigest:
            game.initialSourceDealFingerprint?.digestSha256??null,
          sourceActualFirst:true,
          nativeOwnerTagCounts:ownerAudit,
          firstNativeTagPrompt:
            nested.audit?.firstAcceptedNativePairBySeat?.[sourceSeat]??null,
          sourceT1Roots:roots(sourceSeat,1),
          opponentT2Roots:roots(1-sourceSeat,2),
          sourceT3Roots:roots(sourceSeat,3),
          opponentT4Roots:roots(1-sourceSeat,4),
          nativeSourceSupporterPayments:observed.payments,
          broadEvents:broad.events,
          broadAbort:broad.abortReason,
          broadDceStage:broad.dceStagingConfirmed,
          broadK1SpeedPivot:broad.k1SpeedFallbackSelected,
          completeOriginalStoreRootLedger:game.rootActionLedger??[],
          gameFinished:game.finished??null,
          competitivelyQualified:false
        });
      }catch(error){
        arms.push({label:arm.label,status:'native-error',
          sourceSeat,seed,
          error:String(error?.stack??error).slice(0,1500),
          nativeTagCallAudit:error?.ownerTagCallHalaNativeAudit??null,
          broadPolicyEvidence:error?.rank6PolicyEvidence??null,
          competitivelyQualified:false});
      }
    }
    const matched=arms.every(x=>
      x.status==='native-complete-or-capped')&&
      arms[0].sourceDealDigest!==null&&
      arms[0].sourceDealDigest===arms[1].sourceDealDigest;
    rows.push({sourceSeat,seed,matchedPhysicalDeal:matched,
      matchedOpponentT2:matched&&
        JSON.stringify(arms[0].opponentT2Roots)===
        JSON.stringify(arms[1].opponentT2Roots),
      arms});
  }
  const all=rows.flatMap(x=>x.arms);
  assert.equal(all.length,6);
  return {version:VERSION,
    registration:'results/aichi-2026/registrations/agent6-tagcall-dual-gh-cc-payment-20261101.json',
    vendorPinned:true,retrospectiveMechanicOnly:true,
    nativeAttempts:all.length,
    errors:all.filter(x=>x.status==='native-error').length,
    pairedPhysicalDeals:rows.filter(x=>x.matchedPhysicalDeal).length,
    pairedOpponentT2:rows.filter(x=>x.matchedOpponentT2).length,
    competitiveQualifiedGames:0,rows};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
