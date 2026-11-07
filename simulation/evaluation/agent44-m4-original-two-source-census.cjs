'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {deriveSlotSeeds}=
  require('../../scripts/aichi-decorrelated-seeds.cjs');

const REGISTRATION=Object.freeze({
  schema:'agent44-m4-two-authenticated-source-open-root-development-v1',
  sourceRanks:[5,26],fixedOriginalOpposingRank:1,
  physicalSourceSeats:[0,1],seedBase:20261107,phase:'pilot',repeat:2,
  maxActions:110,selectedPolicy:
    'unmodified-native-bot+opt-in-M4-paper-preselection-and-physical-store',
  registeredBeforeResults:true,
  prospectiveWinRateDesign:false,
  competitiveQualifiedGames:0
});
/** @param {unknown} value */
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
/** @param {Error} error */
const failure=error=>({
  type:error.name,
  messageSha256:digest(String(error.message)),
  nativeAbortStage:error.nativeAbortEvidence?.failureStage??null,
  competitiveGameQualified:false
});

/**
 * Reproduce bounded real-dealt original-source M4 opportunities on both
 * seats without choosing favorable seeds from results. This diagnostic
 * records genuine source held-card owner roots, never a benchmark win.
 * @returns {object} Exact deterministic, potentially aborting native records.
 */
function run(){
  const rows=[];
  for(const rank of REGISTRATION.sourceRanks){
    const plan=planAichi(rank,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    });
    const original=plan.candidate.cards;
    const other=plan.opponents.find(o=>
      o.rank===REGISTRATION.fixedOriginalOpposingRank)?.cards;
    assert.equal(original?.length,60,'Exact original source must resolve');
    assert.equal(other?.length,60,'Exact opponent source must resolve');
    const seeds=deriveSlotSeeds(REGISTRATION.seedBase,
      REGISTRATION.phase,rank,REGISTRATION.repeat);
    for(const seat of REGISTRATION.physicalSourceSeats){
      const physicalSlot=seat===0?'A':'B';
      const deckA=seat===0?original:other;
      const deckB=seat===1?original:other;
      const seed=seeds[physicalSlot];
      const request={
        deckA,deckB,seed,
        label:REGISTRATION.schema+':rank'+rank+':'+physicalSlot,
        maxActions:REGISTRATION.maxActions,
        strictPromptValidation:true,
        isolatePolicyRandomness:true,
        captureDecisionTrace:true,
        captureNativeAbortEvidence:true,
        captureInitialSourceDealFingerprintSeat:seat,
        specialRedCardPaperPreselection:true,
        specialRedCardPaperCorrection:true
      };
      const metadata={
        rank,sourceSeat:seat,opponentOriginalRank:1,
        seed,physicalSlot,orderedDeckHashes:[digest(deckA),digest(deckB)]
      };
      try {
        const result=runMatch(request);
        assert.deepEqual(result.deckHashes,metadata.orderedDeckHashes);
        assert.equal(result.specialRedCardPaperPreselection,true);
        assert.equal(result.specialRedCardPaperCorrection,true);
        assert.equal(result.specialRedCardPaperPreselectionVersion,
          'agent44-m4-owner-root-preselection-v1');
        const m4=result.specialRedCardPaperPreselectionAudits;
        assert.ok(Array.isArray(m4));
        assert.ok(m4.every(row=>
          row.version==='agent44-m4-owner-root-preselection-v1' &&
          (row.actorSeat===0||row.actorSeat===1) &&
          row.competitiveGameQualified===false));
        const sourceRoots=m4.filter(row=>row.actorSeat===seat);
        rows.push({...metadata,status:'native-run-returned',
          sourceM4HeldRootDecisions:sourceRoots.length,
          sourcePublicPaperVetoRoots:sourceRoots.filter(row=>
            row.provenPaperBlockedCopies>0).length,
          sourceHandZeroVetoRoots:sourceRoots.filter(row=>
            row.observedOpponentHandCount===0 &&
            row.provenPaperBlockedCopies>0).length,
          sourceM4SelectedRoots:sourceRoots.filter(row=>
            row.selectedM4Printing!==null).length,
          sourceM4InvalidSelectionAttempts:sourceRoots.filter(row=>
            row.attemptedPaperInvalidM4).length,
          allSeatM4OwnerRootAuditCount:m4.length,
          sourceDealFingerprintSha256:
            result.initialSourceDealFingerprint?.digestSha256??null,
          actions:result.actions,
          nativeFinished:result.finished,
          nativeWinnerSeat:result.winner,
          nativeEndReason:result.endReason,
          actionsBySeat:result.actionsBySeat,
          nativeAttackDeclarationsBySeat:[0,1].map(actor=>
            result.attackDeclarationTrace.filter(row=>
              row.playerSlot===actor).length),
          nativeRecordedAttackActionsBySeat:[0,1].map(actor=>
            result.attackTrace.filter(row=>
              row.playerSlot===actor).length),
          finalPrizesRemaining:result.prizesRemaining,
          sourceFirst:result.firstTurnSlot===seat,
          paperQualified:false});
      }catch(error){
        rows.push({...metadata,status:'native-run-aborted',
          error:failure(error),paperQualified:false});
      }
    }
  }
  const report={registration:REGISTRATION,
    originalSourceGamesAttempted:rows.length,
    returnedRows:rows.filter(x=>x.status==='native-run-returned').length,
    abortedRows:rows.filter(x=>x.status==='native-run-aborted').length,
    sourceHeldM4AuditRoots:rows.reduce((n,row)=>
      n+(row.sourceM4HeldRootDecisions??0),0),
    qualifiedCompetitiveGames:0,
    caveat:'Four small bounded original-source developmental games under naive native policies; not full-game paper/clock-qualified matches or win-rate evidence',
    rows};
  assert.equal(report.originalSourceGamesAttempted,4);
  return report;
}
if(require.main===module){
  process.stdout.write('AGENT44_M4_ORIGINAL_SOURCE_BOUNDARY '+
    JSON.stringify(run())+'\n');
}
module.exports={REGISTRATION,run};
