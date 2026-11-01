'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withBroadThornsSourceAttack}=
  require('../twinleaf/rank6-broad-thorns-policy.cjs');
const {withOwnerTagCallHala}=
  require('../twinleaf/agent6-owner-tagcall-hala-native.cjs');
const {observeSourceSupporterPayments}=
  require('./agent6-matched-t3-dce-attack-vs-plumeria-native.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');

const VERSION='agent6-cross-turn-authenticated-owner-k1-rank6-native-v1';
const ROOT=path.resolve(__dirname,'../..');
const REG=path.join(ROOT,
  'results/aichi-2026/registrations/agent6-cross-turn-owner-k1-tagcall-native-20261101.json');

/**
 * Development-only prior K1 owner deck search retention.
 * Each match obtains owner knowledge through its own genuine native
 * Tag Call owner-deck prompt. Source root decisions only read a
 * per-match, owner-id scoped legal earlier observation.
 * @returns {object} Full original Store retrospective comparison.
 */
function run(){
  const reg=JSON.parse(fs.readFileSync(REG,'utf8'));
  assert.equal(reg.schema,
    'agent6-original-store-cross-turn-k1-tagcall-thunder-speed-native-v1');
  assert.equal(reg.sourceSeatSeedPairs.length,3);
  assert.equal(reg.totalArms,6);
  const original=JSON.parse(fs.readFileSync(
    path.join(ROOT,'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=original.decks.find(d=>d.rank===reg.candidateRank);
  assert.ok(reference);
  const plan=planAichi({label:'champion-reference',cards:reference.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(d=>d.rank===reg.sourceRank);
  assert.equal(source?.status,'ready');
  const rows=[];
  for(const {sourceSeat,seed} of reg.sourceSeatSeedPairs){
    const deckA=sourceSeat===0?source.cards:plan.candidate.cards;
    const deckB=sourceSeat===1?source.cards:plan.candidate.cards;
    const preferences=sourceSeat===0?[true,false]:[false,true];
    const request={deckA,deckB,seed,maxActions:reg.plan.maxActions,
      strictPromptValidation:reg.plan.strictPromptValidation,
      captureDecisionTrace:true,capturePublicAttackTransitions:true,
      captureInitialSourceDealFingerprintSeat:sourceSeat,
      captureStartingBoard:true};
    const arms=[];
    for(const arm of reg.frozenArms){
      const seenK1=[];
      const byOwner=new Map();
      try{
        const observed=observeSourceSupporterPayments(sourceSeat,()=>
          withGoFirstChoice(preferences,()=>
            withCanonicalActorOnlyPolicy(()=>
              withBroadThornsSourceAttack(()=>
                withOwnerTagCallHala([deckA,deckB],
                  ()=>runMatch(request),{
                    includeCanonicalOwnerK1Snapshot:true,
                    onAuthenticatedOwnerDeckInspect:record=>{
                      seenK1.push(record);
                      byOwner.set(record.ownerId,record);
                    }
                  }),{
                  seat:sourceSeat,turn:reg.plan.sourceTurnThree,
                  stageDceFirstTurn:true,
                  stageSpeedLightningFirstTurn:false,
                  turn3DirectSpeedAfterDce:true,
                  k1PrizedThunderSpeedFallback:true,
                  liveSpeedLightningAlternative:true,
                  playLockAwareOpening:true,
                  k1ReplanAfterTagCall:true,
                  ownerPriorK1Lookup:arm.carryOwnerK1AcrossTurns?
                    ownerId=>byOwner.get(ownerId)??null:undefined
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
          .map(x=>({ordinal:x.actionOrdinal,action:x.action,
            card:x.card??null,attack:x.attack??null,
            pendingPrompt:x.pendingPrompt??null}));
        const settlement=candidateAttackSettlement(game,sourceSeat);
        arms.push({label:arm.label,carryOwnerK1AcrossTurns:
          arm.carryOwnerK1AcrossTurns,
          status:'native-complete-or-capped',sourceSeat,seed,
          sourceDealDigest:
            game.initialSourceDealFingerprint?.digestSha256??null,
          nativeOwnK1PromptRecords:seenK1,
          firstTagPrompt:
            nested.audit?.firstAcceptedNativePairBySeat?.[sourceSeat]??null,
          tagAuditCounts:nested.audit?.ownerBySeat?.[sourceSeat]??null,
          sourceT1Roots:roots(sourceSeat,1),
          opponentT2Roots:roots(1-sourceSeat,2),
          sourceT3Roots:roots(sourceSeat,3),
          opponentT4Roots:roots(1-sourceSeat,4),
          nativeGuzmaHalaPayments:observed.payments,
          sourceScriptStarted:broad.started,
          sourceScriptCompleted:broad.completed,
          priorK1SpeedSelected:broad.k1SpeedFallbackSelected,
          sourceScriptAbort:broad.abortReason,
          sourceEvents:broad.events,
          nativeSourceSettledT3Attacks:settlement.attacks.filter(x=>
            x.turnBefore===3&&x.attackName==='Volt Cyclone'),
          completeOriginalStoreRootLedger:game.rootActionLedger??[],
          gameFinished:game.finished??null,
          competitiveQualified:false});
      }catch(error){
        arms.push({label:arm.label,carryOwnerK1AcrossTurns:
          arm.carryOwnerK1AcrossTurns,
          sourceSeat,seed,status:'native-error',
          nativeOwnK1PromptRecords:seenK1,
          error:String(error?.stack??error).slice(0,1800),
          nativeTagCallAudit:error?.ownerTagCallHalaNativeAudit??null,
          broadEvidence:error?.rank6PolicyEvidence??null,
          competitiveQualified:false});
      }
    }
    const paired=arms.every(x=>
      x.status==='native-complete-or-capped')&&
      arms[0].sourceDealDigest!==null&&
      arms[0].sourceDealDigest===arms[1].sourceDealDigest;
    rows.push({sourceSeat,seed,pairedSourcePhysicalDeal:paired,
      pairedOpponentT2:paired&&
        JSON.stringify(arms[0].opponentT2Roots)===
        JSON.stringify(arms[1].opponentT2Roots),
      arms});
  }
  const all=rows.flatMap(x=>x.arms);
  assert.equal(all.length,reg.totalArms);
  return {version:VERSION,
    registration:'results/aichi-2026/registrations/agent6-cross-turn-owner-k1-tagcall-native-20261101.json',
    originalPrintedSource60:true,
    vendorPinned:true,
    retrospectivelySelected:true,
    nativeAttempts:all.length,
    nativeExceptions:all.filter(x=>x.status==='native-error').length,
    physicalPairsMatched:rows.filter(x=>x.pairedSourcePhysicalDeal).length,
    opponentT2PairsMatched:rows.filter(x=>x.pairedOpponentT2).length,
    competitiveQualifiedGames:0,rows};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
