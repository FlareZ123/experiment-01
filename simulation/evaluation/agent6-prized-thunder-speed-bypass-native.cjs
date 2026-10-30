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
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');

const REGISTRATION=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent6-source-first-prized-stadium-speed-bypass-20261030.json');

/**
 * Preregistered RETROSPECTIVE original Store mechanism cells. Source T1
 * attaches a held DCE only if it genuinely exists in the owner's hand.
 * The T3 Speed fallback accesses own deck only at the genuine Tag Call
 * ChooseCardsPrompt, never in K0 decision policy.
 *
 * @returns {object} Full noncompetitive 2x2 same-deal attempt archive.
 */
function run(){
  const reg=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
  assert.equal(reg.schema,
    'agent6-preregistered-retrospective-prized-thunder-deferred-dce-speed-2x2-v1');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(d=>d.rank===reg.candidateRank);
  assert.ok(champion);
  const plan=planAichi(
    {label:'champion-reference',cards:champion.cards},
    {allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true}
  );
  const source=plan.opponents.find(x=>x.rank===reg.sourceRank);
  assert.equal(source?.status,'ready');
  const rows=[];
  for(const {sourceSeat,seeds} of reg.exactOriginalSeedsBySourceSeat){
    for(const seed of seeds){
      const request={
        deckA:sourceSeat===0?source.cards:plan.candidate.cards,
        deckB:sourceSeat===1?source.cards:plan.candidate.cards,
        seed,maxActions:reg.shared.maxActions,
        strictPromptValidation:reg.shared.strictPromptValidation,
        captureDecisionTrace:true,
        capturePublicAttackTransitions:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        captureStartingBoard:true
      };
      const preferences=sourceSeat===0?[true,false]:[false,true];
      const arms=[];
      for(const treatment of reg.arms){
        const {stageDceFirstTurn,k1PrizedThunderSpeedFallback}=treatment;
        try{
          const outer=withGoFirstChoice(preferences,()=>
            withCanonicalActorOnlyPolicy(()=>
              withBroadThornsSourceAttack(()=>runMatch(request),{
                seat:sourceSeat,turn:3,
                playLockAwareOpening:reg.shared.playLockAwareOpening,
                k1ReplanAfterTagCall:reg.shared.k1ReplanAfterTagCall,
                liveSpeedLightningAlternative:
                  reg.shared.liveSpeedLightningAlternative,
                stageSpeedLightningFirstTurn:
                  reg.shared.stageSpeedLightningFirstTurn,
                stageDceFirstTurn,k1PrizedThunderSpeedFallback
              })));
          const broad=outer.result.result;
          const game=broad.result;
          const settle=candidateAttackSettlement(game,sourceSeat);
          const sourceT1=(game.rootActionLedger??[]).filter(x=>
            x.playerSlot===sourceSeat&&x.turnBefore===1&&
            x.pendingPrompt===null).map(x=>({
              action:x.action,card:x.card??null,attack:x.attack??null,
              ordinal:x.actionOrdinal}));
          const sourceT3=(game.rootActionLedger??[]).filter(x=>
            x.playerSlot===sourceSeat&&x.turnBefore===3).map(x=>({
              action:x.action,card:x.card??null,attack:x.attack??null,
              prompt:x.pendingPrompt??null,ordinal:x.actionOrdinal}));
          const candidateT2=(game.rootActionLedger??[]).filter(x=>
            x.playerSlot===1-sourceSeat&&x.turnBefore===2&&
            x.pendingPrompt===null).map(x=>({
              action:x.action,card:x.card??null,ordinal:x.actionOrdinal}));
          const sourceT3Attacks=settle.attacks.filter(x=>
            x.turnBefore===3&&x.attackName==='Volt Cyclone');
          const firstOwner=(game.decisionTrace??[]).find(x=>
            x.playerSlot===sourceSeat&&x.turnBefore===1&&
            x.action!=='ResolvePromptAction'&&
            x.decisionHandBefore?.perspectiveSeat===sourceSeat);
          arms.push({status:'native-complete-or-capped',sourceSeat,seed,
            stageDceFirstTurn,k1PrizedThunderSpeedFallback,
            sourceActualFirst:game.firstTurnSlot===sourceSeat,
            verifiedByDrawLog:game.verifiedByDrawLog,
            coinWinnerSeat:outer.audit.choices[0]?.seat,
            sourceDealDigest:game.initialSourceDealFingerprint?.
              digestSha256??null,
            originalSourceK0OwnerHand:firstOwner?.
              decisionHandBefore?.ownHandPrintings??null,
            nativeDceStageSelected:broad.dceStagingSelected,
            nativeDceStageConfirmed:broad.dceStagingConfirmed,
            k1SpeedFallbackSelected:broad.k1SpeedFallbackSelected,
            sourceT3OpeningPlan:broad.openingPlan,
            sourceT3PolicyCompleted:broad.completed,
            sourceT3AbortReason:broad.abortReason,
            sourcePolicyEvents:broad.events,
            sourceT1AcceptedRoots:sourceT1,
            candidateT2AcceptedRoots:candidateT2,
            sourceT3AcceptedRoots:sourceT3,
            sourceT3SettledVoltCyclone:sourceT3Attacks,
            sourceAttackDeclarations:settle.declarations,
            sourceSettledAttacks:settle.settled,
            gameFinished:game.finished??null,
            competitiveQualified:false});
        }catch(error){
          arms.push({status:'native-error',sourceSeat,seed,
            stageDceFirstTurn,k1PrizedThunderSpeedFallback,
            error:String(error?.message??error).slice(0,700),
            rank6PolicyEvidence:error?.rank6PolicyEvidence??null});
        }
      }
      const digests=arms.map(a=>a.sourceDealDigest).filter(Boolean);
      rows.push({sourceSeat,seed,arms,
        exactSourcePhysicalOpeningMatched:
          arms.length===reg.arms.length&&
          digests.length===reg.arms.length&&
          new Set(digests).size===1});
    }
  }
  const all=rows.flatMap(row=>row.arms);
  return {
    schema:'agent6-prized-thunder-speed-bypass-native-2x2-v1',
    registration:'results/aichi-2026/registrations/agent6-source-first-prized-stadium-speed-bypass-20261030.json',
    originalRank6Cards:source.cards.length,
    candidateRank1Cards:plan.candidate.cards.length,
    attemptedNativeArms:all.length,
    nativeErrors:all.filter(x=>x.status==='native-error').length,
    exactSourceDealPairs:rows.filter(x=>
      x.exactSourcePhysicalOpeningMatched).length,
    nativeDceStageSelections:all.filter(x=>
      x.nativeDceStageSelected).length,
    nativeDceStageConfirmations:all.filter(x=>
      x.nativeDceStageConfirmed).length,
    authenticatedK1SpeedFallbackSelections:all.filter(x=>
      x.k1SpeedFallbackSelected).length,
    competitiveQualifiedGames:0,rows
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(run(),null,2)+'\n');
module.exports={run};
