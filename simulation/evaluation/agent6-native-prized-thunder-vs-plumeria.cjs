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
const {withOwnerPlumeriaAfterPass}=
  require('../twinleaf/agent4-plumeria-after-pass.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');

const REGISTRATION=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent6-thunder-bypass-vs-plumeria-source-denial-20261030.json');

/** Real-store, original-source contender with zero win-rate qualification. */
function run(){
  const reg=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
  assert.equal(reg.schema,
    'agent6-retrospective-physical-original-prized-thunder-attack-vs-energy-denial-2x2-v1');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(d=>d.rank===reg.originalCandidateRank);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(x=>x.rank===reg.originalSourceRank);
  assert.equal(source?.status,'ready');
  const rows=[];
  for(const {seat:sourceSeat,seed} of reg.fixedOriginalSourceFirstDeals){
    assert.ok(sourceSeat===0||sourceSeat===1);
    const request={
      deckA:sourceSeat===0?source.cards:plan.candidate.cards,
      deckB:sourceSeat===1?source.cards:plan.candidate.cards,
      seed,maxActions:reg.frozen.maxActions,
      strictPromptValidation:reg.frozen.strictPromptValidation,
      captureDecisionTrace:true,
      capturePublicAttackTransitions:true,
      captureInitialSourceDealFingerprintSeat:sourceSeat,
      captureStartingBoard:true
    };
    const preferences=sourceSeat===0?[true,false]:[false,true];
    const arms=[];
    for(const {bypass,plumeriaAfterPass} of reg.arms){
      try{
        const outer=withGoFirstChoice(preferences,()=>
          withCanonicalActorOnlyPolicy(()=>
            withBroadThornsSourceAttack(
              ()=>plumeriaAfterPass?
                withOwnerPlumeriaAfterPass(()=>runMatch(request),{
                  sourceSeat
                }):{result:runMatch(request),audit:null},
              {seat:sourceSeat,turn:reg.frozen.sourceT3ScriptTurn,
                playLockAwareOpening:true,k1ReplanAfterTagCall:true,
                liveSpeedLightningAlternative:true,
                stageSpeedLightningFirstTurn:false,
                stageDceFirstTurn:bypass,
                k1PrizedThunderSpeedFallback:bypass}
            )
          )
        );
        const broad=outer.result.result;
        const plumeria=broad.result;
        const game=plumeria.result;
        assert.equal(game.firstTurnSlot,sourceSeat);
        assert.equal(game.verifiedByDrawLog,true);
        assert.equal(outer.audit.choices.length,1);
        const sourceT3=game.rootActionLedger.filter(x=>
          x.playerSlot===sourceSeat&&x.turnBefore===3).map(x=>({
            action:x.action,card:x.card??null,
            attack:x.attack??null,
            prompt:x.pendingPrompt??null,
            ordinal:x.actionOrdinal
          }));
        const sourceT1=game.rootActionLedger.filter(x=>
          x.playerSlot===sourceSeat&&x.turnBefore===1&&
          x.pendingPrompt===null).map(x=>({
            action:x.action,card:x.card??null,ordinal:x.actionOrdinal
          }));
        const candidateT2=game.rootActionLedger.filter(x=>
          x.playerSlot===1-sourceSeat&&x.turnBefore===2&&
          x.pendingPrompt===null).map(x=>({
            action:x.action,card:x.card??null,ordinal:x.actionOrdinal
          }));
        const candidateT4=game.rootActionLedger.filter(x=>
          x.playerSlot===1-sourceSeat&&x.turnBefore===4&&
          x.pendingPrompt===null).map(x=>({
            action:x.action,card:x.card??null,
            attack:x.attack??null,ordinal:x.actionOrdinal
          }));
        const settle=candidateAttackSettlement(game,sourceSeat);
        const firstOwner=game.decisionTrace.find(x=>
          x.playerSlot===sourceSeat&&x.turnBefore===1&&
          x.action!=='ResolvePromptAction'&&
          x.decisionHandBefore?.perspectiveSeat===sourceSeat);
        arms.push({status:'native-complete-or-capped',
          sourceSeat,seed,bypass,plumeriaAfterPass,
          sourceActualFirst:true,verifiedByDrawLog:true,
          sourceDealDigest:game.initialSourceDealFingerprint?.
            digestSha256??null,
          originalSourceK0OwnerHand:firstOwner?.
            decisionHandBefore?.ownHandPrintings??null,
          dceStageConfirmed:broad.dceStagingConfirmed,
          k1SpeedFallbackSelected:broad.k1SpeedFallbackSelected,
          sourceT3AbortReason:broad.abortReason,
          sourceT3PolicyEvents:broad.events,
          sourceT1AcceptedRoots:sourceT1,
          candidateT2AcceptedRoots:candidateT2,
          sourceT3AcceptedRoots:sourceT3,
          candidateT4AcceptedRoots:candidateT4,
          sourceT3SettledVoltCyclone:settle.attacks.filter(x=>
            x.turnBefore===3&&x.attackName==='Volt Cyclone'),
          plumeriaAudit:plumeria.audit,
          gameFinished:game.finished??null,
          competitiveQualified:false});
      }catch(error){
        arms.push({status:'native-error',sourceSeat,seed,
          bypass,plumeriaAfterPass,
          error:String(error?.message??error).slice(0,900),
          sourcePolicyEvidence:error?.rank6PolicyEvidence??null});
      }
    }
    const sourceDigests=arms.map(x=>x.sourceDealDigest).filter(Boolean);
    rows.push({sourceSeat,seed,arms,
      exactSourcePhysicalOpeningMatched:
        sourceDigests.length===reg.arms.length&&
        new Set(sourceDigests).size===1});
  }
  const all=rows.flatMap(r=>r.arms);
  assert.equal(all.length,12);
  return {
    schema:'agent6-native-prized-thunder-attack-vs-plumeria-denial-v1',
    registration:'results/aichi-2026/registrations/agent6-thunder-bypass-vs-plumeria-source-denial-20261030.json',
    attemptedNativeArms:all.length,
    nativeErrors:all.filter(x=>x.status==='native-error').length,
    exactSourceDealGroups:rows.filter(x=>
      x.exactSourcePhysicalOpeningMatched).length,
    nativePlumeriaRoots:all.reduce((n,x)=>
      n+(x.plumeriaAudit?.acceptedPlumeria??0),0),
    nativePlumeriaEnergyDiscards:all.reduce((n,x)=>
      n+(x.plumeriaAudit?.settledEnergyDiscards??0),0),
    nativeSettledTurn3Attacks:all.reduce((n,x)=>
      n+(x.sourceT3SettledVoltCyclone?.length??0),0),
    competitivelyQualifiedGames:0,rows
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(run(),null,2)+'\n');
module.exports={run};
