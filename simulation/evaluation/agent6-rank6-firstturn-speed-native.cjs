'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withBroadThornsSourceAttack}=
  require('../twinleaf/rank6-broad-thorns-policy.cjs');
const {Store}=require('../../vendor/twinleaf/ptcg-server/output/game/store/store');

/**
 * Read-only post-dispatch original Store source-card consequences.
 * Snapshot physical counts before and after each real native root, never
 * supply them to a bot, and always restore the original dispatch method.
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} work
 * @returns {{result:T,receipts:object[]}}
 */
function observeSpeedNative(sourceSeat,work){
  const original=Store.prototype.dispatch;
  const receipts=[];
  Store.prototype.dispatch=function sourceSpeedReceipt(action){
    const state=this.state;
    const p=state?.players?.[sourceSeat];
    const onSourceT1=state?.turn===1 && state.activePlayer===sourceSeat;
    const before=onSourceT1&&p?{
      playerId:p.id,
      speed:p.active.energies.cards.filter(c=>
        c.name==='Speed Lightning Energy').length,
      hand:p.hand.cards.length,deck:p.deck.cards.length
    }:null;
    const result=original.call(this,action);
    if(before && action?.constructor?.name==='PlayCardAction'){
      const next=this.state.players[sourceSeat];
      const after={
        speed:next.active.energies.cards.filter(c=>
          c.name==='Speed Lightning Energy').length,
        hand:next.hand.cards.length,deck:next.deck.cards.length
      };
      if(after.speed>before.speed){
        receipts.push({sourceSeat,turn:1,
          rootAction:action.constructor.name,
          physicalSpeedAdded:after.speed-before.speed,
          handBefore:before.hand,handAfter:after.hand,
          deckBefore:before.deck,deckAfter:after.deck,
          nativeDrawCount:before.deck-after.deck,
          attachedToSourceActive:true});
      }
    }
    return result;
  };
  try{return {result:work(),receipts};}
  finally{Store.prototype.dispatch=original;}
}

/**
 * Six preregistered source-first physical seed/seat cells, with one control
 * and one opt-in Energy staging treatment. All errors stay in the archive.
 */
function run(){
  const registration=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/registrations/agent6-firstturn-speed-native-20261030.json'),'utf8'));
  assert.equal(registration.schema,
    'agent6-preregistered-native-source-speed-six-deal-v1');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(x=>x.rank===1);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const source=plan.opponents.find(x=>x.rank===6);
  assert.equal(source?.status,'ready');
  const rows=[];
  for(const {sourceSeat,seeds} of registration.fixedSeedsBySourceSeat){
    assert.ok(sourceSeat===0||sourceSeat===1);
    for(const seed of seeds){
      const originalDecks={deckA:sourceSeat===0?source.cards:plan.candidate.cards,
        deckB:sourceSeat===1?source.cards:plan.candidate.cards,
        seed,maxActions:110,strictPromptValidation:true,
        captureDecisionTrace:true,
        capturePublicAttackTransitions:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        captureStartingBoard:true};
      const preferences=sourceSeat===0?[true,false]:[false,true];
      const arms=[];
      for(const stageSpeedLightningFirstTurn of [false,true]){
        try{
          const watched=observeSpeedNative(sourceSeat,()=>
            withGoFirstChoice(preferences,()=>
              withCanonicalActorOnlyPolicy(()=>
                withBroadThornsSourceAttack(
                  ()=>runMatch(originalDecks),
                  {seat:sourceSeat,turn:3,
                    stageSpeedLightningFirstTurn,
                    liveSpeedLightningAlternative:true,
                    playLockAwareOpening:true}))));
          const native=watched.result;
          const broad=native.result.result;
          const game=broad.result;
          const chosen=native.audit.choices;
          assert.equal(chosen.length,1);
          assert.equal(game.firstTurnSlot,sourceSeat);
          assert.equal(game.verifiedByDrawLog,true);
          assert.equal(chosen[0].seat===sourceSeat,
            chosen[0].chooseFirst===true);
          // Postgame, read the source player's own original K0 first-root
          // hand as an alternative-action opportunity census. It never
          // enters either bot's policy, and is not a native legal-action proof.
          const firstOwnerDecision=(game.decisionTrace??[]).find(row=>
            row.playerSlot===sourceSeat&&row.turnBefore===1&&
            row.action!=='ResolvePromptAction'&&
            row.decisionHandBefore?.perspectiveSeat===sourceSeat);
          const firstSourceOwnerHandPrintings=
            firstOwnerDecision?.decisionHandBefore?.ownHandPrintings??null;
          const sourceT1=(game.rootActionLedger??[]).filter(row=>
            row.playerSlot===sourceSeat&&row.turnBefore===1&&
            row.pendingPrompt===null).map(row=>
            ({action:row.action,card:row.card??null}));
          const sourceSettlement=candidateAttackSettlement(game,sourceSeat);
          const sourceT3Settlements=sourceSettlement.attacks.filter(row=>
            row.turnBefore===3 && row.attackName==='Volt Cyclone');
          const candidateT2=(game.rootActionLedger??[]).filter(row=>
            row.playerSlot===1-sourceSeat&&row.turnBefore===2&&
            row.pendingPrompt===null).map(row=>
            ({action:row.action,card:row.card??null,attack:row.attack??null}));
          arms.push({status:'native-complete-or-capped',seed,
            sourceSeat,stageSpeedLightningFirstTurn,
            coinWinnerSeat:chosen[0].seat,sourceActualFirst:true,
            verifiedByDrawLog:true,
            sourceDealDigest:game.initialSourceDealFingerprint?.
              digestSha256??null,
            firstSourceTurnRoots:sourceT1,
            firstSourceOwnerHandPrintings,
            firstCandidateReplyRoots:candidateT2,
            speedStagingSelected:broad.speedStagingSelected,
            speedStagingConfirmed:broad.speedStagingConfirmed,
            speedNativeSettlements:watched.receipts,
            sourceTurn3LineCompleted:broad.completed,
            sourceNativeAttackDeclarations:sourceSettlement.declarations,
            sourceNativeSettledAttacks:sourceSettlement.settled,
            sourceTurn3Settlements:sourceT3Settlements,
            gameFinished:game.finished??null,
            actionCount:game.rootActionCount??null,
            candidateReplyObserved:candidateT2.length>0});
        }catch(error){
          arms.push({status:'native-error',seed,sourceSeat,
            stageSpeedLightningFirstTurn,
            errorName:error?.name??null,
            errorMessage:String(error?.message??error).slice(0,450),
            sourcePolicyEvidence:error?.rank6PolicyEvidence??null});
        }
      }
      rows.push({seed,sourceSeat,arms});
    }
  }
  assert.equal(rows.length,6);
  assert.ok(rows.every(row=>row.arms.length===2));
  const all=rows.flatMap(row=>row.arms);
  return {schema:'agent6-source-first-speed-six-deal-native-v3',
    registration:'results/aichi-2026/registrations/agent6-firstturn-speed-native-20261030.json',
    originalSourceRank:6,originalCandidateRank:1,
    attemptedNativeArms:all.length,
    nativeErrors:all.filter(x=>x.status==='native-error').length,
    stagedControls:all.filter(x=>x.speedStagingSelected===true).length,
    settledSpeedAttachments:all.reduce((sum,x)=>
      sum+(x.speedNativeSettlements?.length??0),0),
    qualifiedCompetitiveGames:0,rows};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={observeSpeedNative,run};
