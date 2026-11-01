'use strict';

const assert=require('node:assert/strict');
const {CASES}=require('./agent47-strict-physical60-native-3case.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');
const {withActorHandDiscard}=require('./agent47-actor-hand-discard.cjs');
const {withMinimumAttachEnergySelection}=
  require('./agent47-minimum-attach-energy-hook.cjs');
const {withPaperCelestialRoarEnergy}=
  require('./agent47-celestial-roar-paper-energy-hook.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Retrospective replay of the identical 3 already-registered original-source
 * physical deals. Add ONLY opt-in paper Celestial Roar correction and the
 * fail-closed settled-custody gate; keep the original bot and deck lists.
 *
 * @param {object} c Frozen historical source trial.
 * @param {Map<number,object>} byRank Original source printed 60s.
 * @returns {object} Complete attempted result including native errors.
 */
function runOne(c,byRank){
  const source=byRank.get(c.sourceRank??20).cardIds;
  const opponent=byRank.get(c.opponentRank??11).cardIds;
  assert.equal(source.length,60);assert.equal(opponent.length,60);
  const request={
    deckA:c.sourceSeat===0?source:opponent,
    deckB:c.sourceSeat===1?source:opponent,
    seed:c.seed,maxActions:160,
    doubleDragonRecovery:true,strictPromptValidation:true,
    isolatePolicyRandomness:true,
    captureInitialSourceDealFingerprintSeat:c.sourceSeat,
    captureInitialFullPhysicalDeal:true,
    capturePhysicalZoneIntegrity:true,
    enforceSettledPhysicalZoneIntegrity:true,
    label:'agent33-retrospective-celestial-paper-hook-'
      +(c.sourceRank??20)+'-'+(c.opponentRank??11)+'-'
      +c.sourceSeat+'-'+c.seed
  };
  try{
    const outer=withPaperCelestialRoarEnergy(()=>
      withMinimumAttachEnergySelection(()=>
        withActorHandDiscard(()=>runMatch(request),{},{
          apexPayloadDiscard:false
        })
      ));
    const game=outer.result.result.result;
    const integrity=game.physicalZoneIntegrity;
    const nativeHook=outer.audit;
    const physicalConserved=integrity?.settledRootsChecked>0&&
      integrity?.settledRootsWithAnomaly===0;
    return {
      case:c,status:physicalConserved?'settled-physical-60-passed':
        'physical-integrity-unverified',
      hookAudit:nativeHook,
      minimumAttachAudit:outer.result.audit,
      game:{
        nativeActions:game.actions,turns:game.turns,
        finished:game.finished,
        firstPlayerSeat:game.firstTurnSlot,
        sourceDealSha256:
          game.initialSourceDealFingerprint?.digestSha256??null,
        initialPhysicalDealSha256:
          game.initialFullPhysicalDealFingerprint?.digestSha256??null,
        settledRootsChecked:integrity?.settledRootsChecked??0,
        settledRootsWithAnomaly:integrity?.settledRootsWithAnomaly??null
      }
    };
  }catch(error){
    return {case:c,status:'native-error',
      code:error?.code??null,
      message:String(error?.stack??error).slice(0,1800),
      hookAudit:error?.nativeCelestialRoarSpecialEvidence??null,
      minimumAttachAudit:error?.nativeMinimumAttachEvidence??null,
      physicalWitness:error?.physicalConservationWitness??null};
  }
}
function main(){
  initializeCards();
  const {byRank}=registration();
  const rows=CASES.map(c=>runOne(c,byRank));
  const changed=rows.filter(r=>r.case.shouldFail);
  const allPreviouslyFailingRecovered=changed.every(r=>
    r.status==='settled-physical-60-passed'&&
    r.hookAudit?.replacedAttackResolutions>0&&
    r.hookAudit?.nativeEffectSettlements>0);
  return {
    schema:'agent33-retrospective-original-rank20-celestial-custody-fix-v1',
    originalSourceRank:20,opponentRank:11,pinnedTwinleaf:PIN,
    originalPhysicalSeats:[1,1,0],
    previouslyFailingRootOrdinals:[52,98],
    totalTrials:rows.length,
    recoveredOriginallyFailingCases:changed.filter(r=>
      r.status==='settled-physical-60-passed').length,
    allPreviouslyFailingRecovered,
    rows,competitiveQualifiedGames:0,
    caveat:'Retrospective original source deals selected after prior failures. Fixed policy and physical-card conservation checks only; no paper-complete engine certification, skilled opponent policy or win-rate result'
  };
}
if(require.main===module){
  const result=main();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.allPreviouslyFailingRecovered)process.exitCode=1;
}
module.exports={main,runOne};
