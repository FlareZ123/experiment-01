'use strict';

const assert=require('node:assert/strict');
const {stagedChampionPowerBeamAfterRealApex}=
  require('./agent46-real-apex-champion-two-ko-native.cjs');

/**
 * Frozen physical original rank1/rank10 60s in each of two player seats.
 * Compare raw pinned game history and subsequent native Mimikyu copied attack
 * with the two existing reversible opt-in paper rules corrections.
 * All original physical card objects must remain conserved in each run.
 *
 * Source start is a constructed game state, not a naturally shuffled,
 * competitively qualified original-60 match.
 *
 * @returns {object} Actual native Store control and treatment receipts.
 */
function run(){
  const rows=[];
  for(const ownerSeat of [0,1]){
    const control=stagedChampionPowerBeamAfterRealApex({
      useOriginal60:true,ownerSeat,rawControl:true
    });
    const treatment=stagedChampionPowerBeamAfterRealApex({
      useOriginal60:true,ownerSeat
    });
    assert.equal(control.championOwnerSeat,ownerSeat);
    assert.equal(treatment.championOwnerSeat,ownerSeat);
    assert.equal(control.candidateNativeOrderedSha256,
      treatment.candidateNativeOrderedSha256);
    assert.deepEqual(control.original60ZoneChecks.slice(0,4),
      treatment.original60ZoneChecks.slice(0,4),
      'Original physical per-owner source inputs and prior Apex must match');
    assert.equal(control.originalSourceAttack.declared,'Overclock');
    assert.equal(treatment.originalSourceAttack.declared,'Apex Dragon');
    assert.equal(control.originalSourceAttack.copiedDragonPayload,'Overclock');
    assert.equal(treatment.originalSourceAttack.copiedDragonPayload,'Overclock');
    assert.equal(control.originalPrizesTaken,0);
    assert.equal(control.resultingRegidragoDamage,0);
    assert.equal(control.gxSpent,false);
    assert.equal(treatment.prizesTaken,4);
    assert.equal(treatment.usedGX,true);
    assert.equal(treatment.firstKo,true);
    assert.equal(treatment.secondKo,true);
    assert.equal(control.original60ZoneChecks.length,6);
    assert.equal(treatment.original60ZoneChecks.length,8);
    for(const record of [...control.original60ZoneChecks,
      ...treatment.original60ZoneChecks]){
      assert.equal(record.totalPhysicalCards,60);
      assert.equal(record.uniquePhysicalCards,60);
    }
    const row={
      ownerSeat,
      sourceSeat:1-ownerSeat,
      originalPrintedRank1CandidateNativeSHA:
        control.candidateNativeOrderedSha256,
      originalSourceBeforeCopycat:{
        control:control.originalSourceAttack,
        treatment:treatment.originalSourceAttack
      },
      unpatched:{
        handBeforeCopycat:control.firstOwnerHandBeforeCopycat,
        handAfterCopycat:control.firstOwnerHandAfterCopycat,
        deckBeforeCopycat:control.firstOwnerDeckBeforeCopycat,
        deckAfterCopycat:control.firstOwnerDeckAfterCopycat,
        damage:control.resultingRegidragoDamage,
        prizesTaken:control.originalPrizesTaken,
        usedGX:control.gxSpent,
        resolvedPrompts:control.resolvedPrompts,
        zoneChecks:control.original60ZoneChecks
      },
      paperOptIn:{
        firstAttack:treatment.first,
        secondAttack:treatment.second,
        prizesTaken:treatment.prizesTaken,
        gxSpent:treatment.usedGX,
        firstKo:treatment.firstKo,
        secondKo:treatment.secondKo,
        distinctPrizesTransferred:
          treatment.distinctOriginalPrizeObjectsInHandAtSecondKO,
        zoneChecks:treatment.original60ZoneChecks
      }
    };
    rows.push(row);
    console.log('AGENT46_ORIGINAL60_PAPER_CONTROL_SEAT '+JSON.stringify(row));
  }
  const out={
    schema:'agent46-original60-real-apex-unpatched-vs-paper-correction-both-seats-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalRank1AndRank10BothFixed60:true,
    noSyntheticHistoryInjection:true,
    original60ControlZoneReceipts:12,
    original60TreatmentZoneReceipts:16,
    stagedGameStateOnly:true,
    competitivelyQualifiedGames:0,
    rows
  };
  console.log('AGENT46_ORIGINAL60_PAPER_CONTROL '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={run};
