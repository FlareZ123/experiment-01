'use strict';

const VERSION='agent10-issue25-per-rank-physical-seat-coverage-v1';

/**
 * Detect an opponent-rank/physical-source-seat confound in actual native
 * attempts. Whole-panel seat diversity does not establish each rank has
 * been executed with both original-source positions.
 * @param {object[]} attempts Actual registered selected-receipt rows.
 * @returns {object}
 */
function auditPerRankPhysicalSourceSeats(attempts){
  if(!Array.isArray(attempts)||attempts.length===0)
    return {schema:VERSION,verdict:'FAIL',reason:'no-attempts'};
  const groups=new Map();
  const anomalies=[];
  for(const row of attempts){
    const id=row?.id;
    const rank=typeof id==='string'?
      /^(\d+):/.exec(id)?.[1]??null:null;
    if(rank===null){
      anomalies.push({id:id??null,reason:'unparseable-source-rank'});
      continue;
    }
    const direct=row.originalSourceSeat;
    const native=row.nativeAbortProvenance?.sourceSeat;
    const verifiedNative=row.nativeAbortProvenance?.aborted===true&&
      row.nativeAbortProvenance?.sourceDealStatus==='VERIFIED'&&
      row.nativeAbortProvenance?.fullPhysicalDealStatus==='VERIFIED';
    const directValid=direct===0||direct===1;
    const nativeValid=verifiedNative&&(native===0||native===1);
    const conflicting=directValid&&nativeValid&&direct!==native;
    if(conflicting)anomalies.push({id,reason:'contradictory-direct-and-abort-seat'});
    const seat=directValid?direct:nativeValid?native:null;
    if(!groups.has(rank))groups.set(rank,[]);
    groups.get(rank).push({id,seat,origin:directValid?'direct-row':
      nativeValid?'verified-native-abort':'unresolved',conflicting});
  }
  const byRank=[...groups].sort(([a],[b])=>Number(a)-Number(b))
    .map(([rank,rows])=>{
      const counts={0:rows.filter(r=>r.seat===0).length,
        1:rows.filter(r=>r.seat===1).length};
      const missing=[0,1].filter(seat=>counts[seat]===0);
      return {rank:Number(rank),rows,counts,missingSourceSeats:missing,
        bothSourceSeatsObserved:missing.length===0,
        unresolvedRows:rows.filter(r=>r.seat===null).length};
    });
  const overallSeats=new Set(byRank.flatMap(group=>
    group.rows.filter(row=>row.seat!==null).map(row=>row.seat)));
  const allRanksBothSeats=byRank.length>0&&anomalies.length===0&&
    byRank.every(group=>group.bothSourceSeatsObserved);
  return {schema:VERSION,verdict:allRanksBothSeats?'PASS':'FAIL',
    distinctRanks:byRank.length,
    globalBothSourceSeatsObserved:overallSeats.size===2,
    allRanksBothSourceSeatsObserved:allRanksBothSeats,
    byRank,anomalies,
    implication:'A global mix of actor seat labels cannot establish within-rank two-seat policy behavior; this checks sampling coverage, not policy symmetry or paper-game qualification',
    qualifiedGameCount:0};
}
module.exports={VERSION,auditPerRankPhysicalSourceSeats};
