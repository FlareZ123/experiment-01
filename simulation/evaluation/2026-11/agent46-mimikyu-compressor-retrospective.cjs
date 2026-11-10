'use strict';

const assert=require('node:assert/strict');
const {initializeCards,runMatch}=require('../../twinleaf/headless.cjs');
const {sourceDecks}=require('./agent46-mimikyu-bench-priority-source-ab.cjs');
const {runTreatment:runFundedControl}=
  require('./agent46-mimikyu-manual-promote-source-ab.cjs');
const {installMimikyuCompressorDonor}=
  require('../../twinleaf/2026-11/agent46-mimikyu-battle-compressor-donor.cjs');

const SEED=589307622,SEAT=0;
const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const {Store}=require(path.join(OUTPUT,'game/store/store'));
const {DealDamageEffect}=
  require(path.join(OUTPUT,'game/store/effects/attack-effects'));

/**
 * Retrospective mechanism from previously observed hand-held Compressor at
 * an Apex response with two-Energy Benched Mimikyu, but no discarded donor.
 * Important: Treasure donor is OFF in this arm, isolating Compressor.
 * @returns {object} Native both-arm original-source receipt.
 */
function run(){
  initializeCards();
  const byRank=sourceDecks();
  const baseline=runFundedControl(byRank,SEED,SEAT),events=[];
  const damageEvents=[];
  const originalReduce=Store.prototype.reduceEffect;
  function observedReduce(state,effect){
    if(state?.turn===8&&effect instanceof DealDamageEffect){
      const owner=state.players[SEAT],opponent=state.players[1-SEAT];
      damageEvents.push({
        turn:state.turn,damageAmount:effect.damage,
        effectName:effect.constructor.name,
        ownerActive:owner.active.getPokemonCard()?.fullName,
        opponentActive:opponent.active.getPokemonCard()?.fullName,
        opponentActiveHp:opponent.active.getPokemonCard()?.hp,
        opponentPriorDamage:opponent.active.damage,
        targetPrinting:effect.target?.getPokemonCard()?.fullName,
        sourcePrinting:effect.source?.getPokemonCard()?.fullName,
        opponentWeakness:opponent.active.getPokemonCard()?.weakness??[],
        attackName:effect.attack?.name??null
      });
    }
    return originalReduce.call(this,state,effect);
  }
  Store.prototype.reduceEffect=observedReduce;
  const restore=installMimikyuCompressorDonor({
    seat:SEAT,includeTreasureDonor:false,onEvent:e=>{
      if(events.length<128)events.push(e);
    }
  });
  let treatment;
  try{
    const game=runMatch({
      deckA:byRank.get(1).cardIds,deckB:byRank.get(10).cardIds,
      seed:SEED,maxActions:180,
      label:'Agent46 exact original source Compressor-only donor',
      isolatePolicyRandomness:true,
      captureInitialSourceDealFingerprintSeat:SEAT,
      doubleDragonRecovery:true,supporterDecisionCorrection:true,
      mimikyuApexCopycatCompatibility:true,
      mimikyuApexTimelessPolicy:true,mimikyuApexTimelessPolicySeat:SEAT,
      mimikyuDeclaredHistoryCorrection:true,
      regidragoDeclaredHistoryCorrection:true,
      passClearsLastAttackCorrection:true,
      captureCopycatTurnStartSeat:SEAT,captureDecisionTrace:true,
      capturePublicAttackTransitions:true,captureRootConfirmationTrace:true
    });
    const own=game.attackTrace.filter(a=>a.seat===SEAT);
    const opp=game.attackTrace.filter(a=>a.seat!==SEAT);
    treatment={
      status:game.finished?'native-terminal':'native-censored',
      actions:game.actions,turns:game.turns,
      sourceDeal:game.initialSourceDealFingerprint,
      actualCopycat:own.filter(a=>a.attack==='Copycat').length,
      actualOpponentApex:opp.filter(a=>a.attack==='Apex Dragon').length,
      actualOwnerAttackTrace:own,
      nativeCopiedAttackTransitions:(game.publicAttackTransitions??[]).filter(
        row=>row.triggerPlayerSlot===SEAT),
      nativeAllPublicAttackTransitions:game.publicAttackTransitions,
      nativeRootConfirmations:game.rootConfirmationTrace,
      nativeAttackDeclarations:game.attackDeclarationTrace,
      actualPrizesRemaining:game.prizesRemaining,
      actualPrintedDamageEffectEvents:damageEvents,
      nativeCompressorRoots:(game.rootActionLedger??[]).filter(row=>
        row.playerSlot===SEAT&&row.card==='Battle Compressor'),
      nativeCopyAttackSelectionRoots:(game.rootActionLedger??[]).filter(row=>
        row.playerSlot===SEAT&&row.attackChoice!==undefined),
      physicalCompressorDonorSearches:events.filter(e=>
        e.kind==='resolved-physical-compressor-donor-search').length,
      proposedCompressorRoots:events.filter(e=>
        e.kind==='proposed-donor-compressor-root').length,
      ownerPostApexFirstRoots:game.copycatTurnStartEvidence.filter(t=>
        t.previousOpponentAttack?.name==='Apex Dragon').map(t=>({
          turn:t.turn,mimikyu:t.mimikyu,dialga:t.ownDialga,
          handCompressor:t.candidateHand.includes('Battle Compressor PHF'),
          usedGX:t.candidateUsedGX
        })),
      ownerEvents:events,
      competitivePaperGames:0
    };
  }catch(error){
    treatment={status:'native-error',error:String(error?.stack??error),
      ownerEvents:events,competitivePaperGames:0};
  }finally{restore();Store.prototype.reduceEffect=originalReduce;}
  const matched=Boolean(baseline.nativeInitialSourceDeal&&
    treatment.sourceDeal&&JSON.stringify(baseline.nativeInitialSourceDeal)===
      JSON.stringify(treatment.sourceDeal));
  const result={
    schema:'agent46-original-rank1-compressor-only-donor-retrospective-v1',
    selectedHistoricalWindow:true,seed:SEED,seat:SEAT,
    originalRank1And10FullSixties:true,
    physicalSourceDealMatched:matched,
    baselineStatus:baseline.status,treatmentStatus:treatment.status,
    baselineCopycat:baseline.actualCopycat??null,
    compressorCopycat:treatment.actualCopycat??null,
    baselineOpponentApex:baseline.actualOpponentApex??null,
    compressorOpponentApex:treatment.actualOpponentApex??null,
    baseline,treatment,qualifiedPaperGames:0
  };
  assert.equal(result.seed,SEED);
  console.log(JSON.stringify(result));
  return result;
}
if(require.main===module)run();
module.exports={SEED,SEAT,run};
