'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const VERSION='agent10-original-source-claw-opponent-ko-promotion-witness-v1';

/**
 * Extract a purely observed real Store post-attack physical board transition.
 * This is a narrow native opponent-KO dependency witness, not proof that
 * the source could not have found a different voluntary pivot.
 *
 * @param {object} sourceRow Real source-perspective native outcome record.
 * @param {0|1} sourceSeat Real original opponent seat.
 * @returns {object}
 */
function investigatePromotionGate(sourceRow,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  const candidateSeat=1-sourceSeat;
  const roots=sourceRow.rootActionLedger??[];
  const sourceClaw=roots.find(r=>r.playerSlot===sourceSeat&&
    r.action==='AttackAction'&&r.attack==='Claw of Darkness');
  const firstClawTurn=sourceClaw?.turnBefore??null;
  const sourceRetreats=roots.filter(r=>r.playerSlot===sourceSeat&&
    r.action==='RetreatAction'&&
    (firstClawTurn===null||r.turnBefore<firstClawTurn));
  const candidateAttacks=sourceRow.candidateAttackSettlement?.attacks??[];
  const promotions=candidateAttacks.filter(a=>{
    const before=a.publicBoardBefore?.[sourceSeat]?.active;
    const after=a.publicBoardAfter?.[sourceSeat]?.active;
    return a.settledPromptChain===true&&
      before?.name==='Squawkabilly ex'&&
      after?.name==='Mega Absol ex'&&
      Number.isSafeInteger(a.turnBefore)&&
      Array.isArray(a.prizesBefore)&&
      Array.isArray(a.prizesAfter)&&
      a.prizesBefore[candidateSeat]-
        a.prizesAfter[candidateSeat]===2;
  });
  const directPromotion=promotions.find(a=>
    firstClawTurn!==null&&a.turnBefore+1===firstClawTurn);
  return {
    originalSourceSeat:sourceSeat,
    nativeCandidateSeat:candidateSeat,
    firstSourceClawGlobalTurn:firstClawTurn,
    firstSourceClawRootOrdinal:sourceClaw?.actionOrdinal??null,
    actualSourceRetreatBeforeClaw:sourceRetreats.map(r=>({
      turn:r.turnBefore,ordinal:r.actionOrdinal
    })),
    candidateKoPromotionCount:promotions.length,
    sourceFirstClawImmediatelyAfterCandidateTwoPrizeKO:Boolean(directPromotion),
    candidateKoPromotion:directPromotion?{
      actualCandidateAttackName:directPromotion.attackName,
      globalTurn:directPromotion.turnBefore,
      attackingRootOrdinal:directPromotion.actionOrdinal,
      beforeActive:directPromotion.publicBoardBefore[sourceSeat].active,
      afterActive:directPromotion.publicBoardAfter[sourceSeat].active,
      candidatePrizesBefore:directPromotion.prizesBefore[candidateSeat],
      candidatePrizesAfter:directPromotion.prizesAfter[candidateSeat],
      sourcePrizesBefore:directPromotion.prizesBefore[sourceSeat],
      sourcePrizesAfter:directPromotion.prizesAfter[sourceSeat],
      sourceReceivedNoPrizesFromCandidateKO:
        directPromotion.prizesBefore[sourceSeat]===
          directPromotion.prizesAfter[sourceSeat],
      opponentNextRootSameEpochProven:
        directPromotion.nextSourceSameEpochProven===true
    }:null,
    paperQualified:false,
    interpretationLimit:'Observed immediate prior real KO-promotion, not a proof that no voluntary switching route ever existed.'
  };
}

/**
 * Consume complete archived paired developmental original-source JSON.
 * @param {object} archive
 * @returns {object}
 */
function analyze(archive){
  assert.equal(archive.beforeAndAfterSamePhysicalDeal,true);
  assert.equal(archive.totalNativeAttempts,40);
  const results=[];
  for(let i=0;i<(archive.comparisons??[]).length;i++){
    const p=archive.comparisons[i];
    if(p.rank!==11||p.rootFirstDifference===null)continue;
    const row=archive.rawTreatment.rows[i];
    assert.equal(p.id,row.trial?.id);
    results.push({
      id:p.id,seed:p.seed,sourceSeat:p.sourceSeat,
      candidateSeat:p.candidateSeat,
      fullPhysicalDealSame:p.fullPhysicalDealSame,
      nativeStatus:{finished:p.treatment.finished,
        winner:p.treatment.winner,endReason:p.treatment.endReason},
      evidence:investigatePromotionGate(row,p.sourceSeat)
    });
  }
  return {
    schema:VERSION,
    sourceArchiveResearchHead:archive.researchHead,
    vendorPin:archive.vendorPin,
    totalArchivedNativeAttempts:archive.totalNativeAttempts,
    qualifyingChangedSourcePairs:results.length,
    pairs:results,
    firstClawAfterOpponentKOCount:results.filter(x=>
      x.evidence.sourceFirstClawImmediatelyAfterCandidateTwoPrizeKO).length,
    priorSourceRetreatCount:results.reduce((n,x)=>
      n+x.evidence.actualSourceRetreatBeforeClaw.length,0),
    competitiveQualifiedGames:0,
    caveat:'Original prospective 40-arm developmental archive reused post-hoc; no new games or independent source seeds. Observational paper board/KO receipt only, no official clock, no competent counter-strategy demonstrated.'
  };
}
if(require.main===module){
  const archivePath=process.argv[2];
  assert.ok(archivePath,'Pass the downloaded original 40-attempt JSON archive');
  const archive=JSON.parse(fs.readFileSync(archivePath,'utf8'));
  process.stdout.write(JSON.stringify(analyze(archive),null,2)+'\n');
}
module.exports={VERSION,investigatePromotionGate,analyze};
