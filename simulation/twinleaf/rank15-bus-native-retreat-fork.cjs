'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {pairedCandidateSlots}=
  require('./new-moon-lockbreak-source-diagnostic.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {observeSourceLock}=
  require('./newmoon-rank15-source-duallock-census.cjs');
const {withRank15PaidTmPoffin}=
  require('./rank15-paid-tm-poffin-source-policy.cjs');
const {withRank15OddishPoffinPrompt}=
  require('./rank15-poffin-oddish-prompt-fork.cjs');
const {withRank15SecondBarrageYes}=
  require('./rank15-second-barrage-native-confirm-policy.cjs');
const {withRank15NativeBusRetreat}=
  require('./rank15-bus-native-retreat-policy.cjs');
const {withRank15NativePaidBusRetreat}=
  require('./rank15-bus-native-paid-retreat-policy.cjs');
const {withOwnerRootChoiceWindow}=
  require('./owner-root-choice-window.cjs');
const {withRank15CandidateTurn19ReadOnly}=
  require('./rank15-candidate-t19-readonly.cjs');

const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** Compare original printed-60 native Evolution setup versus one real retreat. */
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
    label:'rank15-retrospective-true-double-tm-native-bus-promotion',
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
    entryDrawLockCorrection:true,isolatePolicyRandomness:true,
    pendingEndTurnSwitchCleanupCorrection:true,captureDecisionTrace:true,
    bunnelbyK0SafeEvolution:true,bunnelbyObservedK1:true,
    bunnelbyTargetAwareEvolution:true,bunnelbyGuzmaHalaMode1:true,
    bunnelbyGuzmaHalaSearch:true
  };
  function arm(mode){
    assert.ok(['control','unpaid','paid'].includes(mode));
    let poffin,oddish,second,retreat=null,candidateT19=null;
    const x=observeSourceLock(Store,1,0,()=>
      withOwnerRootChoiceWindow(Store,1,()=>{
        const inner=()=>{
          const readOnly=withRank15CandidateTurn19ReadOnly(()=>{
          const r=withRank15SecondBarrageYes(()=>{
            const o=withRank15OddishPoffinPrompt(()=>{
              const p=withRank15PaidTmPoffin(()=>runMatch(request),1);
              poffin=p.audit;return p.result;
            },1);
            oddish=o.audit;return o.result;
          },1);
          second=r.audit;return r.result;
          },0);
          candidateT19=readOnly.observations;
          return readOnly.result;
        };
        if(mode==='control')return inner();
        const r=mode==='unpaid'?
          withRank15NativeBusRetreat(inner,1):
          withRank15NativePaidBusRetreat(inner,1);
        retreat=r.audit;return r.result;
      },{turnStart:16,turnEnd:26}));
    const game=x.result.result;
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.firstTurnSlot,0);
    assert.equal(game.rootActionLedger.length,game.actions);
    assert.equal(poffin.attempts.length,1);
    assert.equal(oddish.attempts.length,1);
    assert.equal(second.attempts.length,1);
    return {game,retreat,sourceZone:x.firstNormalTurnZoneDigest,
      prizes:x.firstNormalTurnPrizeGate,
      choiceWindow:x.result.trace,candidateT19,
      first:{aor:x.first.aor,bus:x.first.bus,busActive:x.first.busActive,
        dual:x.first.dual},max:x.max};
  }
  const control=arm('control'),promotion=arm('unpaid'),paid=arm('paid');
  assert.equal(control.sourceZone,promotion.sourceZone,
    'Physical deal differed before policy selection');
  assert.deepEqual(control.prizes,promotion.prizes);
  assert.deepEqual(control.game.deckHashes,promotion.game.deckHashes);
  assert.equal(control.sourceZone,paid.sourceZone);
  assert.deepEqual(control.prizes,paid.prizes);
  assert.deepEqual(control.game.deckHashes,paid.game.deckHashes);
  assert.deepEqual(
    control.game.rootActionLedger.filter(x=>x.turnBefore<18),
    paid.game.rootActionLedger.filter(x=>x.turnBefore<18),
    'Source original root sequence before t18 was not preserved');
  assert.equal(control.first.bus?.turn,16);
  assert.equal(control.first.aor?.turn,16);
  assert.equal(promotion.first.bus?.turn,16);
  assert.equal(promotion.first.aor?.turn,16);
  assert.equal(paid.first.bus?.turn,16);
  assert.equal(paid.first.aor?.turn,16);
  const summarize=x=>{
    const retreats=x.game.rootActionLedger.filter(e=>
      e.playerSlot===1&&e.action==='RetreatAction');
    const firstProposalRoot=retreats[0]?.actionOrdinal??null;
    return {
      roots:x.game.actions,finished:x.game.finished,
      rootLedgerSHA256:sha(x.game.rootActionLedger),
      nativeSourceAttacks:x.game.attackDeclarationTrace.filter(
        e=>e.playerSlot===1),
      nativeCandidateAttacks:x.game.attackDeclarationTrace.filter(
        e=>e.playerSlot===0),
      first:x.first,ownerSourceWindow:x.choiceWindow,
      candidateTurn19ReadOnly:x.candidateT19,
      sourceProposal:x.retreat?.attempts||[],
      nativeRootRetreats:retreats,
      postRetreatRootResponse:firstProposalRoot===null?[]:
        x.game.rootActionLedger.filter(e=>
          e.actionOrdinal>=firstProposalRoot&&
          e.actionOrdinal<firstProposalRoot+25)
    };
  };
  return {
    schema:'rank15-retrospective-owner-bus-promotion-native-fork-v1',
    sourceRank:15,sourceSeat:1,candidateSeat:0,seed,
    printedDecksUnchanged:true,
    enginePin:PIN,physicalFirstSeat:0,
    initialPrizeGate:control.prizes,
    nativeSecondAttackOnly:summarize(control),
    proposedNativePromotion:summarize(promotion),
    ownerPaysRetreat:summarize(paid),
    qualifications:{oneRetrospectivelySelectedSeed:true,
      noIndependentClock:true,independentCompetitiveGames:0,
      opponentResponseQualificationRequired:true,
      nativeRetreatOnlyIfAcceptedByRealRoot:true}
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
