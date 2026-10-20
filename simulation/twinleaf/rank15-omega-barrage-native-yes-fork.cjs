'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {withRank15PaidTmPoffin}=
  require('./rank15-paid-tm-poffin-source-policy.cjs');
const {withRank15OddishPoffinPrompt}=
  require('./rank15-poffin-oddish-prompt-fork.cjs');
const {withRank15SecondBarrageYes}=
  require('./rank15-second-barrage-native-confirm-policy.cjs');
const {withRank15BarragePromptWitness}=
  require('./rank15-barrage-root-confirm-observer.cjs');
const {observeSourceLock}=
  require('./newmoon-rank15-source-duallock-census.cjs');

const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const ORIGINAL_HASH=
  '02c7a7db738de179d7146efcb3e06642327a1bcb670aea41942a0c9ba96a11bc';

/**
 * Same original source printing 60/seed/prizes, with only one post-first-TM
 * owner ConfirmPrompt changed from generic false to native validated true.
 * Captures the genuine opponent board and subsequent bot actions.
 */
function run(){
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const source=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true}).opponents.find(x=>x.rank===15);
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(candidate.length,60);
  const seed=deriveSlotSeeds(20261018,'pilot',15,0).A;
  assert.equal(seed,3050400820);
  const request={
    deckA:candidate,deckB:source.cards,seed,maxActions:260,
    label:'rank15-retrospective-same-poffin-two-owner-search-choices',
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true,isolatePolicyRandomness:true,
    pendingEndTurnSwitchCleanupCorrection:true,captureDecisionTrace:true,
    bunnelbyK0SafeEvolution:true,bunnelbyObservedK1:true,
    bunnelbyTargetAwareEvolution:true,bunnelbyGuzmaHalaMode1:true,
    bunnelbyGuzmaHalaSearch:true
  };
  function arm(forceSecondAttack){
    let poffin,oddish,barrage=null;
    const x=observeSourceLock(Store,1,0,()=>
      withRank15BarragePromptWitness(Store,1,()=>{
        const withOddish=()=> {
          const r=withRank15OddishPoffinPrompt(()=>{
            const item=withRank15PaidTmPoffin(()=>runMatch(request),1);
            poffin=item.audit;return item.result;
          },1);
          oddish=r.audit;return r.result;
        };
        if(!forceSecondAttack)return withOddish();
        const result=withRank15SecondBarrageYes(withOddish,1);
        barrage=result.audit;return result.result;
      }));
    const game=x.result.result;
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.rootActionLedger.length,game.actions);
    assert.equal(game.firstTurnSlot,0);
    assert.equal(poffin.attempts.length,1);
    assert.equal(oddish.attempts.length,1);
    return {
      game,poffin,oddish,barrage,
      sourceFirstZone:x.firstNormalTurnZoneDigest,
      sourceFirstPrizes:x.firstNormalTurnPrizeGate,
      stageSnapshots:{aor:x.first.aor,bus:x.first.bus,
        busActive:x.first.busActive,dual:x.first.dual,
        firstOddish:x.first.sourceOddishOnBench,
        maxEvolutionSlots:x.max.sourceStageLineSlots},
      promptEvents:x.result.events
    };
  }
  const base=arm(false),forced=arm(true);
  assert.equal(sha(base.game.rootActionLedger),ORIGINAL_HASH,
    'Historical no-second-attack root digest changed');
  assert.equal(base.sourceFirstZone,forced.sourceFirstZone);
  assert.deepEqual(base.sourceFirstPrizes,forced.sourceFirstPrizes);
  assert.deepEqual(base.game.deckHashes,forced.game.deckHashes);
  assert.equal(forced.barrage.attempts.length,1,
    'Actual actor-owned native second attack confirm was not offered');
  assert.equal(forced.barrage.attempts[0].ownerChoice,true);
  const beforeConfirm=x=>x.promptEvents.filter(e=>e.rootOrdinal<=149);
  assert.deepEqual(beforeConfirm(base),beforeConfirm(forced),
    'Second attack choice interfered with earlier genuine root decisions');
  const confirmation=events=>events.find(e=>
    e.promptType==='ConfirmPrompt'&&e.promptMessage==='WANT_TO_USE_ABILITY');
  assert.equal(confirmation(base.promptEvents)?.ownerResponse,false);
  assert.equal(confirmation(forced.promptEvents)?.ownerResponse,true);
  const summary=x=>({
    actualRootActions:x.game.actions,gameFinished:x.game.finished,
    rootLedgerSHA256:sha(x.game.rootActionLedger),
    promptEvents:x.promptEvents,stageSnapshots:x.stageSnapshots,
    sourceEvolutionDeclarations:x.game.attackDeclarationTrace.filter(e=>
      e.playerSlot===1&&e.attackName==='Evolution'),
    sourceOtherAttackDeclarations:x.game.attackDeclarationTrace.filter(e=>
      e.playerSlot===1&&e.attackName!=='Evolution'),
    ownerPromptOverride:x.barrage?.attempts??[]
  });
  return {
    schema:'rank15-authentic-omega-barrage-native-confirm-yes-fork-v1',
    sourceRank:15,sourceSeat:1,candidateSeat:0,seed,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    identicalOriginalPrepolicyPhysicalDeal:true,
    initialPrizeGate:base.sourceFirstPrizes,
    genericDecline:summary(base),
    ownerConfirmsSecondAttack:summary(forced),
    qualifications:{
      retrospectiveSingleDeal:true,competitiveGamesQualified:0,
      sourceAndCandidateBotsUnqualified:true
    }
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
