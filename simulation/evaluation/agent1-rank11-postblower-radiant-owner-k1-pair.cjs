'use strict';

const assert=require('node:assert/strict');
const {verifyFrame}=require('../twinleaf/agent32-rank11-six-star-vip-k1-native.cjs');
const registration=require('../../results/aichi-2026/registrations/agent1-rank11-owner-quickball-radiant-20261101.json');
const frame=require('../../results/aichi-2026/registrations/agent32-rank11-six-k0-star-vip-native-20261030.json');
const horizon=require('../../results/aichi-2026/registrations/agent1-rank11-postgate-350-retrospective-20261102.json');
const countRegistration=require('../../results/aichi-2026/registrations/agent1-rank11-radiant-one-vmax-native-20261102.json');
const clockRegistration=require('../../results/aichi-2026/registrations/agent1-rank11-public-turn-prize-clock-sensitivity-20261102.json');
const {withPublicPrizeTurnClosures}=require('../twinleaf/agent1-public-prize-turn-closure.cjs');
const {withLateSourceOwnState}=require('../twinleaf/agent1-late-source-own-state-observer.cjs');
const {hypotheticalBracketCutoffs}=require('./agent1-public-prize-hypothetical-cutoffs.cjs');
const {withNewMoonBlowerAutonomy}=
  require('../twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');
const {withOwnerOranguruStarVipPlan}=
  require('../twinleaf/agent1-owner-oranguru-starvip-native.cjs');

function run(){
  verifyFrame();
  const {resolvedPrintedDecks}=
    require('./rank11-conditional-k0-screen-run.cjs');
  const {runMatch}=require('../twinleaf/headless.cjs');
  const decks=resolvedPrintedDecks();
  assert.equal(decks.engineRevision,registration.engineRevision);
  const entry=frame.selectedExactK0.find(x=>x.index===registration.frozenSourceIndex);
  assert.ok(entry);
  assert.equal(entry.seed,registration.seed);
  assert.equal(entry.seed,horizon.seed);
  assert.equal(horizon.maxActions,countRegistration.maxActions);
  assert.equal(entry.seed,countRegistration.seed);
  assert.equal(entry.seed,clockRegistration.seed);
  assert.equal(entry.sourceFirstOwnerHandSha256,registration.sourceFirstOwnerHandSha256);
  const rows=[];
  for(const {preferRadiantAfterBlowerSearch,activateRadiantClimacticGate,radiantVmaxTargetCount}
      of [{preferRadiantAfterBlowerSearch:false,
            activateRadiantClimacticGate:false,radiantVmaxTargetCount:2},
          {preferRadiantAfterBlowerSearch:true,
            activateRadiantClimacticGate:false,radiantVmaxTargetCount:2},
          {preferRadiantAfterBlowerSearch:true,
            activateRadiantClimacticGate:true,radiantVmaxTargetCount:2},
          {preferRadiantAfterBlowerSearch:true,
            activateRadiantClimacticGate:true,radiantVmaxTargetCount:1}]){
    try{
      const sourceObserved=withLateSourceOwnState(()=>
        withPublicPrizeTurnClosures(()=>withNewMoonBlowerAutonomy(1,()=>(
        withOwnerOranguruStarVipPlan(()=>runMatch({
          ...decks,seed:entry.seed,
          label:'rank11-conditional-K0-screen-v1:'+entry.index,
          maxActions:horizon.maxActions,captureDecisionTrace:true,
          strictPromptValidation:true,
          forestSealSearchCorrection:true,
          battleCompressorPositiveSelectionCorrection:true,
          isolatePolicyRandomness:true,
          captureFinalPublicBoard:true,
          capturePublicAttackTransitions:true,
          captureInitialFullPhysicalDeal:true,
          attackBeforeRetreat:true,
          attackBeforeRetreatSeat:0
        }),{
          chooseOffer:(view,offer)=>{
            assert.equal(view.decisionKind,'owner-root');
            assert.equal(offer.eligible,true);
            return true;
          }
        })
      ),{
        automaticFieldBlower:true,allowAnyActiveBlower:true,
        preferRadiantAfterBlowerSearch,activateRadiantClimacticGate,
        radiantVmaxTargetCount
      })));
      const observed=sourceObserved.result;
      const reply=observed.result;
      const game=reply.result.result;
      const source=reply.result.audit;
      const recipient=reply.policyAudit;
      const first=source.originalOwnK0AtOffer.find(x=>x.seat===0);
      assert.equal(first?.handSha256,entry.sourceFirstOwnerHandSha256);
      assert.deepEqual(first?.bench,entry.sourceBenchAtK0);
      assert.equal(game.firstTurnSlot,0);
      assert.equal(game.verifiedByDrawLog,true);
      assert.equal(source.nativeAccepted,11);
      assert.equal(source.ownerPromptAccepted,5);
      assert.equal(source.completedEquippedGarbodor,1);
      assert.deepEqual(source.abortReasons,{});
      const trace=game.decisionTrace??[];
      const blower=trace.filter(x=>x.playerSlot===1&&x.turnBefore===2&&
        x.action==='PlayCardAction'&&x.card==='Field Blower');
      const quickBall=trace.filter(x=>x.playerSlot===1&&x.turnBefore===2&&
        x.action==='PlayCardAction'&&x.card==='Quick Ball');
      const firstRecipientK1=recipient.events.find(x=>
        x.kind==='legitimate-owner-first-deck-search-K1');
      const candidateK1=recipient.events.find(x=>
        x.kind==='post-Blower-Radiant-owner-K1-check')??null;
      const nativeOpponentDeckChoices=trace.filter(x=>
        x.playerSlot===1&&x.turnBefore===2&&
        x.cardSelection?.sourceZone==='deck'&&
        x.cardSelection?.sourcePlayerSlot===1)
        .map(x=>({ordinal:x.actionOrdinal,
          selectedPrintings:x.cardSelection.selectedCards,
          prompt:x.cardSelection.message,
          nativeMax:x.cardSelection.nativePromptMax}));
      const ownerRadiantPlays=trace.filter(x=>
        x.playerSlot===1&&x.turnBefore===2&&
        x.action==='PlayCardAction'&&x.card==='Radiant Eternatus');
      const radiantPlayOrdinal=ownerRadiantPlays[0]?.actionOrdinal??null;
      const recipientNativeRootsAfterRadiant=radiantPlayOrdinal===null?
        []:(game.rootActionLedger??[]).filter(x=>
          x.playerSlot===1&&x.turnBefore===2&&
          x.actionOrdinal>radiantPlayOrdinal&&
          x.actionOrdinal<=radiantPlayOrdinal+16)
          .map(x=>({ordinal:x.actionOrdinal,action:x.action,
            card:x.card??null,ability:x.ability??null,
            pendingPrompt:x.pendingPrompt??null}));
      const recipientDecisionTraceAfterRadiant=radiantPlayOrdinal===null?
        []:trace.filter(x=>x.playerSlot===1&&x.turnBefore===2&&
          x.actionOrdinal>radiantPlayOrdinal&&
          x.actionOrdinal<=radiantPlayOrdinal+16)
          .map(x=>({ordinal:x.actionOrdinal,action:x.action,
            card:x.card??null,ability:x.ability??null,
            selectedOption:x.optionSelection??null,
            selectedCards:x.cardSelection?.selectedCards??null}));
      const ownerClimacticGates=trace.filter(x=>
        x.playerSlot===1&&x.turnBefore===2&&
        x.action==='UseAbilityAction'&&x.ability==='Climactic Gate');
      const atSourceT3=source.postOpponentOwnerReturns.find(x=>
        x.seat===0&&x.firstReturnTurn===3);
      const publicRemoval=recipient.events.filter(x=>
        x.turn===2&&x.kind==='public-Tool-check'&&
        x.garbodorToolRemoved===true);
      assert.equal(blower.length,1);
      assert.equal(publicRemoval.length,1);
      assert.equal(quickBall.length,1);
      assert.equal(firstRecipientK1?.turn,2);
      assert.equal(firstRecipientK1?.radiantEternatusInOwnDeck,1);
      assert.equal(firstRecipientK1?.shadowRiderVMaxInOwnDeck,2);
      assert.equal(atSourceT3?.garbodorCount,1);
      const laterPublicRoots=(game.rootActionLedger??[]).filter(x=>
        x.turnBefore>=3 && x.turnBefore<=12 &&
        ['PlayCardAction','UseAbilityAction','AttackAction',
          'PassTurnAction','RetreatAction'].includes(x.action))
        .slice(0,90).map(x=>({
          actionOrdinal:x.actionOrdinal,turnBefore:x.turnBefore,
          playerSlot:x.playerSlot,action:x.action,
          card:x.card??null,ability:x.ability??null,
          attack:x.attack??null
        }));
      const settledAttacks=(game.attackTrace??[]).map(x=>({
        turn:x.turn,seat:x.seat,activePokemon:x.activePokemon,
        attack:x.attack,prizesBefore:x.prizeCountBefore,
        prizesAfter:x.prizeCountAfter
      }));
      const latePublicRoots=(game.rootActionLedger??[])
        .filter(x=>x.turnBefore>=29&&x.turnBefore<=46&&
          x.action!=='ResolvePromptAction')
        .map(x=>({
          actionOrdinal:x.actionOrdinal,turnBefore:x.turnBefore,
          turnAfter:x.turnAfter,playerSlot:x.playerSlot,
          action:x.action,card:x.card??null,
          attack:x.attack??null,ability:x.ability??null
        }));
      rows.push({preferRadiantAfterBlowerSearch,
        radiantVmaxTargetCount,
        activateRadiantClimacticGate,
        status:'native-original-K0-and-recipient-owner-K1-confirmed',
        sourceOriginalK0HandSha256:first.handSha256,
        initialFullPhysicalDealFingerprint:game.initialFullPhysicalDealFingerprint,
        nativePublicTurnClosures:observed.audit,
        nativeSourceOwnVisibleLateTurns:sourceObserved.audit,
        hypotheticalAichiPrizeCutoffs:hypotheticalBracketCutoffs(observed.audit),
        sourceReturnPublicBoard:atSourceT3,
        recipientFirstRealK1:firstRecipientK1,
        postBlowerRadiantOwnerK1Predicate:candidateK1,
        nativeQuickBallRoots:quickBall.length,
        nativeRecipientOwnDeckChoices:nativeOpponentDeckChoices,
        recipientRadiantSelectionCommitted:recipient.radiantSearchSelected,
        recipientRadiantConfirmChosen:recipient.radiantConfirmChosen,
        recipientRadiantVmaxSelectedCount:recipient.radiantVmaxSelectedCount,
        nativeRadiantBenchPlayRoots:ownerRadiantPlays.length,
        nativeClimacticGateAbilityRoots:ownerClimacticGates.length,
        recipientNativeRootsAfterRadiant,
        recipientDecisionTraceAfterRadiant,
        publicOpponentRadiantAtSourceT3:
          atSourceT3?.opponentPublicRadiantEternatusCount??null,
        publicOpponentVMaxAtSourceT3:
          atSourceT3?.opponentPublicShadowRiderVMaxCount??null,
        gameFinished:game.finished===true,
        engineEndReason:game.endReason,
        engineWinner:game.finished?game.winner:null,
        actionCount:game.actions,
        lastEngineTurn:game.turns,
        prizesRemaining:game.prizesRemaining,
        finalPublicBoard:game.finalPublicBoard,
        finalPendingPromptTypes:game.finalPendingPromptTypes,
        finalPublicSlots:game.finalState.map(x=>({
          deckRemaining:x.deckRemaining,activePokemon:x.activePokemon,
          benchedPokemon:x.benchedPokemon
        })),
        settledAttacks,
        laterPublicRoots,
        latePublicRoots,
        latePublicAttackTransitions:(game.publicAttackTransitions??[])
          .filter(x=>x.turn>=29),
        competitiveQualifiedGame:false});
    }catch(error){
      rows.push({preferRadiantAfterBlowerSearch,
        radiantVmaxTargetCount,
        activateRadiantClimacticGate,status:'blocked',
        error:String(error?.stack??error).slice(0,1700),
        nativeDiagnostic:error?.agent1OwnerPlanDiagnostic??null,
        competitiveQualifiedGame:false});
    }
  }
  if(rows.every(x=>x.status===
      'native-original-K0-and-recipient-owner-K1-confirmed')){
    assert.equal(new Set(rows.map(x=>x.initialFullPhysicalDealFingerprint?.digestSha256)).size,1,
      'Four intervention arms must preserve BOTH players original physical setup');
    assert.equal(rows[0].initialFullPhysicalDealFingerprint?.digestSha256,
      horizon.requiredBothPlayerInitialDealDigestSha256,
      'Full original same-seed physical deal differs from registered baseline');
    assert.deepEqual(rows.map(x=>x.publicOpponentVMaxAtSourceT3),
      [0,0,2,1], 'Real source turn3 public VMAX board must distinguish four arms');
    assert.deepEqual(rows.map(x=>x.publicOpponentRadiantAtSourceT3),
      [0,1,1,1], 'Native owner Radiant Bench outcomes drifted');
    assert.deepEqual(rows.map(x=>x.recipientRadiantConfirmChosen),
      [false,false,true,true], 'Native owner Climactic Gate confirmation drifted');
    assert.deepEqual(rows.map(x=>x.recipientRadiantVmaxSelectedCount),
      [0,0,2,1], 'Genuine owner VMAX deck selection count drifted');
    const chosen=rows[2].nativeRecipientOwnDeckChoices.find(x=>
      x.prompt==='CHOOSE_CARD_TO_PUT_ONTO_BENCH');
    assert.deepEqual(chosen?.selectedPrintings,
      ['Shadow Rider Calyrex VMAX CRE','Shadow Rider Calyrex VMAX CRE'],
      'Two printed original VMAX must come from the genuine owner deck');
    assert.equal(chosen?.nativeMax,2);
    assert.equal(rows[2].nativeQuickBallRoots,1);
    const one=rows[3].nativeRecipientOwnDeckChoices.find(x=>
      x.prompt==='CHOOSE_CARD_TO_PUT_ONTO_BENCH');
    assert.deepEqual(one?.selectedPrintings,['Shadow Rider Calyrex VMAX CRE']);
    assert.equal(one?.nativeMax,2);
    assert.equal(rows[3].nativeQuickBallRoots,1);
    assert.ok(rows.every(x=>Number.isSafeInteger(x.actionCount)&&
      Number.isSafeInteger(x.lastEngineTurn)),
      'Every source attack-first intervention must preserve native action outcome');
    assert.ok(rows.every(x=>x.nativePublicTurnClosures?.observedClosureCount>0),
      'Missing actual Store post-turn Prize checkpoints');
    assert.ok(rows.every(x=>x.hypotheticalAichiPrizeCutoffs?.paperClockCertified===false),
      'Observed turn closures cannot certify an Aichi physical stopwatch');
  }
  return {schema:'agent1-original-rank11-retrospective-source-attack-first-treatment-v10',
    registration,horizonRegistration:horizon,countRegistration,clockRegistration,engineRevision:frame.engineRevision,
    attempted:rows.length,
    nativeVerified:rows.filter(x=>
      x.status==='native-original-K0-and-recipient-owner-K1-confirmed').length,
    rows,competitiveQualifiedGames:0,
    limitation:'Four same-seed original K0 physical arms. Original rank1 Field Blower native settled and native Quick Ball own-deck target chosen; optional actor-owned Radiant trigger and two original VMAX physically placed in one arm. One retrospectively selected original deal; no qualified games, paper-clock or field-wide claims.'};
}
if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  process.stderr.write('AGENT1_RADIANT_POSTBLOWER_K1 '+JSON.stringify(
    r.rows.map(x=>({prefer:x.preferRadiantAfterBlowerSearch,
      activate:x.activateRadiantClimacticGate,
      confirmed:x.recipientRadiantConfirmChosen,
      nativeVMAXSelected:x.recipientRadiantVmaxSelectedCount,
      status:x.status,k1:x.postBlowerRadiantOwnerK1Predicate,
      choice:x.nativeRecipientOwnDeckChoices,
      radiantSelected:x.recipientRadiantSelectionCommitted,
      played:x.nativeRadiantBenchPlayRoots,
      climactic:x.nativeClimacticGateAbilityRoots,
      nativeRootsAfterRadiant:x.recipientNativeRootsAfterRadiant,
      publicDecisionAfterRadiant:x.recipientDecisionTraceAfterRadiant,
      recipientPublicRadiant:x.publicOpponentRadiantAtSourceT3,
      recipientPublicVMAX:x.publicOpponentVMaxAtSourceT3,
      error:x.error??null})))+'\n');
  if(r.nativeVerified!==4)process.exitCode=1;
}
module.exports={run};
