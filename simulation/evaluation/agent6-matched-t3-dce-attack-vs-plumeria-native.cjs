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
const {Store}=require('../../vendor/twinleaf/ptcg-server/output/game/store/store');

const REGISTRATION=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent6-matched-t3-dce-attack-vs-plumeria-20261030.json');

/**
 * Pure read-only observation of accepted source-owned Supporter two-card
 * physical payments. The prompt's selected physical cards and public played
 * Supporter are visible to their actual owner, not to the opposite policy.
 * This observer is never consulted by decision-making hooks.
 *
 * @template T
 * @param {0|1} seat
 * @param {()=>T} work
 * @returns {{result:T,payments:Array<object>}}
 */
function observeSourceSupporterPayments(seat,work){
  const original=Store.prototype.dispatch;
  const payments=[];
  Store.prototype.dispatch=function observedSupporterPayment(action,...rest){
    const state=this.state;
    const source=state?.players?.[seat];
    const pending=state?.prompts?.find(p=>p.result===undefined);
    const isPayment=Boolean(source&&
      state.activePlayer===seat&&
      state.turn===3&&
      action?.constructor?.name==='ResolvePromptAction'&&
      pending?.id===action.id&&
      pending?.constructor?.name==='ChooseCardsPrompt'&&
      pending?.message==='CHOOSE_CARD_TO_DISCARD'&&
      pending.playerId===source.id&&
      Array.isArray(action.result)&&action.result.length===2&&
      source.supporter.cards.some(c=>['Plumeria','Guzma & Hala']
        .includes(c.name))&&
      action.result.every(c=>source.hand.cards.includes(c)));
    const selected=isPayment?{
      turn:state.turn,sourceSeat:seat,
      pendingId:pending.id,
      supporter:source.supporter.cards.map(c=>c.fullName),
      selectedPrintings:action.result.map(c=>c.fullName),
      selectedPhysical:action.result
    }:null;
    const result=original.apply(this,[action,...rest]);
    if(selected){
      payments.push({
        turn:selected.turn,sourceSeat:selected.sourceSeat,
        pendingId:selected.pendingId,supporter:selected.supporter,
        selectedPrintings:selected.selectedPrintings,
        physicallyDiscarded:selected.selectedPhysical.every(c=>
          source.discard.cards.includes(c)&&
          !source.hand.cards.includes(c))
      });
    }
    return result;
  };
  try{return {result:work(),payments};}
  finally{Store.prototype.dispatch=original;}
}

/** Frozen same-T1 source Energy staging, fork on the one T3 Supporter route. */
function run(){
  const reg=JSON.parse(fs.readFileSync(REGISTRATION,'utf8'));
  assert.equal(reg.schema,
    'agent6-preregistered-retrospective-matched-t1-dce-t3-attack-vs-plumeria-v1');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(d=>d.rank===reg.candidateRank);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(d=>d.rank===reg.sourceRank);
  assert.equal(source?.status,'ready');
  const rows=[];
  for(const {seat:sourceSeat,seed} of reg.sourceFirstSeedSeat){
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
    for(const arm of reg.arms){
      try{
        const observed=observeSourceSupporterPayments(sourceSeat,()=>
          withGoFirstChoice(preferences,()=>
            withCanonicalActorOnlyPolicy(()=>
              withBroadThornsSourceAttack(()=>
                withOwnerPlumeriaAfterPass(()=>runMatch(request),{
                  sourceSeat
                }),{
                  seat:sourceSeat,turn:reg.shared.sourceTurn3ScriptTurn,
                  stageDceFirstTurn:true,stageSpeedLightningFirstTurn:false,
                  turn3DirectSpeedAfterDce:false,
                  k1PrizedThunderSpeedFallback:
                    arm.k1PrizedThunderSpeedFallback,
                  liveSpeedLightningAlternative:true,
                  playLockAwareOpening:true,k1ReplanAfterTagCall:true
                })
              )
            )
        );
        const outer=observed.result;
        const broad=outer.result.result;
        const plumeria=broad.result;
        const game=plumeria.result;
        assert.equal(game.firstTurnSlot,sourceSeat);
        assert.equal(game.verifiedByDrawLog,true);
        const settle=candidateAttackSettlement(game,sourceSeat);
        const roots=(seat,turn)=>(game.rootActionLedger??[])
          .filter(x=>x.playerSlot===seat&&x.turnBefore===turn&&
            x.pendingPrompt===null)
          .map(x=>({ordinal:x.actionOrdinal,
            action:x.action,card:x.card??null,attack:x.attack??null}));
        const physicalSource=game.initialSourceDealFingerprint?.
          digestSha256??null;
        arms.push({
          status:'native-complete-or-capped',sourceSeat,seed,
          label:arm.label,
          actualSourceFirst:true,actualGoFirstChoice:outer.audit.choices,
          sourcePhysicalDealDigest:physicalSource,
          sourceT1AttachedDce:broad.dceStagingConfirmed,
          sourceT3K1PivotSelected:broad.k1SpeedFallbackSelected,
          sourceT3AbortReason:broad.abortReason,
          sourceT1Roots:roots(sourceSeat,1),
          opponentT2Roots:roots(1-sourceSeat,2),
          sourceT3Roots:roots(sourceSeat,3),
          opponentT4Roots:roots(1-sourceSeat,4),
          nativeSourceSupporterPayments:observed.payments,
          nativeSourcePlumeriaAudit:plumeria.audit,
          sourcePolicyEvents:broad.events,
          sourceT3SettledAttack:settle.attacks.filter(x=>
            x.turnBefore===3&&x.attackName==='Volt Cyclone'),
          gameFinished:game.finished??null,
          competitivelyQualified:false});
      }catch(error){
        arms.push({status:'native-error',sourceSeat,seed,
          label:arm.label,error:String(error?.message??error).slice(0,850),
          sourcePolicyEvidence:error?.rank6PolicyEvidence??null});
      }
    }
    rows.push({
      sourceSeat,seed,arms,
      matchedOriginalSourcePhysicalDeal:arms.length===2&&
        arms.every(a=>typeof a.sourcePhysicalDealDigest==='string')&&
        arms[0].sourcePhysicalDealDigest===
        arms[1].sourcePhysicalDealDigest,
      matchedOriginalOpponentT2Roots:arms.length===2&&
        arms.every(a=>Array.isArray(a.opponentT2Roots))&&
        JSON.stringify(arms[0].opponentT2Roots)===
        JSON.stringify(arms[1].opponentT2Roots)
    });
  }
  const all=rows.flatMap(x=>x.arms);
  assert.equal(all.length,6);
  return {
    schema:'agent6-matched-t1-dce-t3-attack-vs-plumeria-native-v1',
    registration:'results/aichi-2026/registrations/agent6-matched-t3-dce-attack-vs-plumeria-20261030.json',
    attemptedNativeArms:all.length,
    nativeErrors:all.filter(x=>x.status==='native-error').length,
    identicalSourcePhysicalDeals:rows.filter(x=>
      x.matchedOriginalSourcePhysicalDeal).length,
    identicalOpponentT2ActionRoots:rows.filter(x=>
      x.matchedOriginalOpponentT2Roots).length,
    nativeSettledT3Attacks:all.reduce((n,x)=>
      n+(x.sourceT3SettledAttack?.length??0),0),
    nativeT3SupporterPayments:all.reduce((n,x)=>
      n+(x.nativeSourceSupporterPayments?.length??0),0),
    competitivelyQualifiedGames:0,rows
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(run(),null,2)+'\n');
module.exports={observeSourceSupporterPayments,run};
