'use strict';

const assert=require('node:assert/strict');
const {verifyFrame}=require('../twinleaf/agent32-rank11-six-star-vip-k1-native.cjs');
const registration=require('../../results/aichi-2026/registrations/agent1-rank11-fieldblower-timing-20261101.json');
const sourceFrame=require('../../results/aichi-2026/registrations/agent32-rank11-six-k0-star-vip-native-20261030.json');
const {withOwnerOranguruStarVipPlan}=
  require('../twinleaf/agent1-owner-oranguru-starvip-native.cjs');
const {withNewMoonBlowerAutonomy}=
  require('../twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');

const VERSION='agent1-preregistered-rank11-fieldblower-owner-timing-v1';

/** @param {object[]} rows @param {number} turn @returns {object[]} */
function playedBlowers(rows,turn){
  return rows.filter(row=>row.playerSlot===1&&row.turnBefore===turn&&
    row.action==='PlayCardAction'&&row.card==='Field Blower');
}
/** @param {object[]} rows @param {number} turn */
function ownerTurn(rows,turn){
  return rows.filter(row=>row.playerSlot===1&&row.turnBefore===turn);
}

/** Three preregistered native temporal treatments, no game win statistics. */
function run(){
  verifyFrame();
  assert.equal(registration.selectedK0Index,299);
  assert.equal(registration.sourcePhysicalSeed,2387754768);
  assert.equal(registration.engineRevision,sourceFrame.engineRevision);
  const {runMatch}=require('../twinleaf/headless.cjs');
  const {resolvedPrintedDecks}=
    require('./rank11-conditional-k0-screen-run.cjs');
  const decks=resolvedPrintedDecks();
  assert.equal(decks.engineRevision,registration.engineRevision);
  const entry=sourceFrame.selectedExactK0.find(x=>
    x.index===registration.selectedK0Index);
  assert.ok(entry);
  assert.equal(entry.seed,registration.sourcePhysicalSeed);
  assert.equal(entry.sourceFirstOwnerHandSha256,
    registration.sourceK0HandSha256);
  assert.deepEqual(entry.sourceBenchAtK0,registration.sourceK0Bench);
  const rows=[];
  for(const arm of registration.arms){
    try{
      const response=withNewMoonBlowerAutonomy(1,()=>(
        withOwnerOranguruStarVipPlan(()=>
          runMatch({...decks,seed:entry.seed,
            label:'rank11-conditional-K0-screen-v1:'+entry.index,
            maxActions:200,captureDecisionTrace:true,
            strictPromptValidation:true,
            forestSealSearchCorrection:true,
            battleCompressorPositiveSelectionCorrection:true,
            isolatePolicyRandomness:true}),{
              chooseOffer:(view,offer)=>{
                assert.equal(view.decisionKind,'owner-root');
                assert.equal(offer.eligible,true);
                return true;
              }
            })
      ),{
        automaticFieldBlower:arm.automaticFieldBlower,
        allowAnyActiveBlower:true,
        earliestFieldBlowerTurn:arm.firstAllowedGlobalTurn
      });
      const game=response.result.result;
      const source=response.result.audit;
      const recipient=response.policyAudit;
      const first=source.originalOwnK0AtOffer.find(x=>x.seat===0);
      assert.equal(first?.handSha256,entry.sourceFirstOwnerHandSha256,
        'Frozen original source first owner hand mismatch');
      assert.deepEqual(first?.bench,entry.sourceBenchAtK0);
      assert.equal(game.firstTurnSlot,0);
      assert.equal(game.verifiedByDrawLog,true);
      assert.equal(source.plansChosen,1);
      assert.equal(source.nativeAccepted,11);
      assert.equal(source.ownerPromptAccepted,5);
      assert.equal(source.completedEquippedGarbodor,1);
      assert.deepEqual(source.abortReasons,{});
      const trace=game.decisionTrace??[];
      const turn2=ownerTurn(trace,2);
      const turn4=ownerTurn(trace,4);
      const handAtT4=turn4[0]?.decisionHandBefore?.ownHandPrintings??null;
      const recipientFirstOwnerK1Search=recipient.events.find(x=>
        x.kind==='legitimate-owner-first-deck-search-K1')??null;
      const opponentT4Public=recipient.events.find(x=>
        x.turn===4&&x.kind==='read-only-own-turn-board');
      const sourceT3=source.postOpponentOwnerReturns.find(x=>
        x.seat===0&&x.firstReturnTurn===3);
      const t2Blowers=playedBlowers(trace,2);
      const t4Blowers=playedBlowers(trace,4);
      const afterBlowerActions=blow=>blow?
        trace.filter(x=>x.playerSlot===1&&
          x.turnBefore===blow.turnBefore&&
          x.actionOrdinal>blow.actionOrdinal).map(x=>({
            ordinal:x.actionOrdinal,action:x.action,
            card:x.card??null,ability:x.ability??null})):null;
      const twoBlower=recipient.events.filter(x=>
        x.turn===2&&x.kind==='public-Tool-check'&&
        x.garbodorToolRemoved===true).length;
      const fourBlower=recipient.events.filter(x=>
        x.turn===4&&x.kind==='public-Tool-check'&&
        x.garbodorToolRemoved===true).length;
      rows.push({arm:arm.id,status:'original-K0-native-settled',
        originalSourceHandSha256:first.handSha256,
        sourceSetupAccepted:source.nativeAccepted,
        sourceFirstT3Return:sourceT3??null,
        recipientFirstOwnerK1Search,
        recipientHeldBlowerAtT4:handAtT4?
          handAtT4.filter(card=>card==='Field Blower GRI').length:null,
        recipientTurn4PublicSourceGarbodorTools:
          opponentT4Public?.garbodorToolPrintings??null,
        recipientTurn2BlowerRoots:t2Blowers.length,
        recipientTurn4BlowerRoots:t4Blowers.length,
        confirmedToolRemovalTurn2:twoBlower,
        confirmedToolRemovalTurn4:fourBlower,
        recipientT2ActionsAfterBlower:afterBlowerActions(t2Blowers[0]),
        recipientT4ActionsAfterBlower:afterBlowerActions(t4Blowers[0]),
        recipientT4ActionCount:turn4.length,
        recipientT4AbilityNames:turn4.filter(x=>
          x.action==='UseAbilityAction').map(x=>x.ability?.name??x.ability),
        recipientT2AbilityNames:turn2.filter(x=>
          x.action==='UseAbilityAction').map(x=>x.ability?.name??x.ability),
        nativeRootCount:game.rootActionLedger?.length??null,
        gameFinished:game.finished===true,
        qualifiedCompetitiveGame:false});
    }catch(error){
      rows.push({arm:arm.id,status:'blocked',
        error:String(error?.stack??error).slice(0,1400),
        nativeDiagnostic:error?.agent1OwnerPlanDiagnostic??null,
        qualifiedCompetitiveGame:false});
    }
  }
  const clean=rows.filter(x=>x.status==='original-K0-native-settled');
  return {version:VERSION,registration,engineRevision:sourceFrame.engineRevision,
    attempted:rows.length,settled:clean.length,
    blocked:rows.length-clean.length,rows,competitiveQualifiedGames:0,
    caveat:'Three alternative owner-side Field Blower timing policies in one retrospectively selected original 60 physical seed; weak other native actions, no paper certification, no candidate win-rate comparison.'};
}
if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  process.stderr.write('AGENT1_BLOWER_TIMING_OWNERS '+JSON.stringify(
    r.rows.map(x=>({arm:x.arm,status:x.status,sourceT3:x.sourceFirstT3Return,
      heldT4:x.recipientHeldBlowerAtT4,
      publicT4:x.recipientTurn4PublicSourceGarbodorTools,
      firstRecipientK1:x.recipientFirstOwnerK1Search,
      blowerT2:x.recipientTurn2BlowerRoots,
      blowerT4:x.recipientTurn4BlowerRoots,
      removedT2:x.confirmedToolRemovalTurn2,
      removedT4:x.confirmedToolRemovalTurn4,
      abilityT4:x.recipientT4AbilityNames,
      afterT4:x.recipientT4ActionsAfterBlower,
      error:x.error??null})))+'\n');
  if(r.blocked>0)process.exitCode=1;
}
module.exports={VERSION,playedBlowers,ownerTurn,run};
