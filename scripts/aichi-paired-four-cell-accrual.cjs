'use strict';

const assert=require('node:assert/strict');
const CELLS=Object.freeze([
  'seat0-candidate-first','seat0-source-first',
  'seat1-candidate-first','seat1-source-first'
]);
const SHA256=/^[a-f0-9]{64}$/;

/**
 * Accrue four physical seat x actual first-player strata from a precommitted,
 * ordered two-candidate source-setup-only stream. The preregistration fixes
 * the exact 60-printing candidate and source deck SHA-256 digests. Every attempted comparison
 * remains in the census, including misaligned setups and blocked observations.
 * Never consult outcomes, policy decisions, terminal status or Prize results.
 *
 * @param {object} plan A precommitted finite ordered physical pair schedule.
 * @param {object[]} observations Chronological setup-only pair observations.
 * @returns {object} Pre-outcome design diagnostic; no competitive win inference.
 */
function accruePairedFourCells(plan,observations){
  assert.equal(plan?.schema,'aichi-fourcell-paired-start-plan-v2');
  assert.equal(plan?.status,'precommitted');
  assert.ok(Array.isArray(plan.candidateIds) && plan.candidateIds.length===2);
  assert.equal(new Set(plan.candidateIds).size,2);
  assert.ok(plan.candidateIds.every(id=>typeof id==='string'&&id.length>0));
  assert.ok(Array.isArray(plan.ranks)&&plan.ranks.length>0);
  assert.equal(new Set(plan.ranks).size,plan.ranks.length);
  assert.ok(plan.ranks.every(r=>Number.isSafeInteger(r)&&r>=1&&r<=32));
  assert.ok(plan.candidateDeckHashes && typeof plan.candidateDeckHashes==='object');
  assert.deepEqual(Object.keys(plan.candidateDeckHashes).sort(),
    [...plan.candidateIds].sort(),'Must pin both candidate rosters');
  assert.ok(plan.candidateIds.every(id=>SHA256.test(plan.candidateDeckHashes[id])),
    'Candidate printing-list SHA-256 required');
  assert.ok(plan.sourceDeckHashes && typeof plan.sourceDeckHashes==='object');
  assert.deepEqual(Object.keys(plan.sourceDeckHashes).sort(),
    plan.ranks.map(String).sort(),'Must pin every opposing source roster');
  assert.ok(plan.ranks.every(rank=>SHA256.test(plan.sourceDeckHashes[rank])),
    'Source printing-list SHA-256 required');
  assert.ok(Array.isArray(plan.attempts)&&plan.attempts.length>0);
  assert.ok(Array.isArray(observations)&&observations.length<=plan.attempts.length);
  assert.ok(plan.quotas&&typeof plan.quotas==='object');
  const counts={};
  for(const rank of plan.ranks){
    const quota=plan.quotas[rank];
    assert.ok(quota && CELLS.every(cell=>
      Number.isSafeInteger(quota[cell]) && quota[cell]>0));
    counts[rank]=Object.fromEntries(CELLS.map(cell=>[cell,0]));
  }
  const pairIds=new Set(), streams=new Set(), armIds=new Set();
  for(const pair of plan.attempts){
    assert.ok(typeof pair?.pairId==='string'&&pair.pairId.length);
    assert.ok(plan.ranks.includes(pair.rank)&&[0,1].includes(pair.candidateSeat));
    assert.ok(Number.isSafeInteger(pair.seed)&&pair.seed>=0&&pair.seed<=0xffffffff);
    assert.ok(Array.isArray(pair.arms)&&pair.arms.length===2);
    assert.deepEqual(new Set(pair.arms.map(a=>a.candidateId)),
      new Set(plan.candidateIds));
    assert.ok(pair.arms.every(a=>typeof a.armId==='string'&&a.armId.length));
    const stream=JSON.stringify([pair.rank,pair.candidateSeat,pair.seed]);
    assert.ok(!pairIds.has(pair.pairId),'Duplicate pairId');
    assert.ok(!streams.has(stream),'Repeated registered physical stream');
    pairIds.add(pair.pairId);streams.add(stream);
    for(const arm of pair.arms){
      assert.ok(!armIds.has(arm.armId),'Duplicate armId');
      armIds.add(arm.armId);
    }
  }

  let blocked=false,complete=false;
  const retainedAttempts=[],plannedPairs=[];
  const allQuotasMet=()=>plan.ranks.every(rank=>CELLS.every(cell=>
    counts[rank][cell]===plan.quotas[rank][cell]));
  for(let i=0;i<observations.length;i++){
    assert.ok(!complete,'Observed pair after all four-cell quotas completed');
    const expected=plan.attempts[i], observed=observations[i];
    assert.ok(observed && observed.pairId===expected.pairId &&
      observed.rank===expected.rank &&
      observed.candidateSeat===expected.candidateSeat &&
      observed.seed===expected.seed &&
      Array.isArray(observed.arms) && observed.arms.length===2,
    'Setup observation violates frozen pair order or identity');
    const arms=plan.candidateIds.map(id=>{
      const planned=expected.arms.find(a=>a.candidateId===id);
      const matching=observed.arms.filter(a=>a.candidateId===id);
      assert.ok(matching.length===1&&matching[0].armId===planned.armId,
        'Frozen candidate arm missing, duplicated or renamed');
      return matching[0];
    });
    const good=arms.every(arm=>{
      const slot=arm.firstTurnSlot;
      const name=slot===0?'research-A':slot===1?'research-B':null;
      return name!==null && arm.verifiedByDrawLog===true &&
        arm.firstTurnPlayerId===(slot===0?101:202) &&
        arm.firstTurnPlayerName===name && arm.firstDrawLogName===name &&
        arm.candidateDeckSha256===plan.candidateDeckHashes[arm.candidateId] &&
        arm.sourceDeckSha256===plan.sourceDeckHashes[expected.rank] &&
        typeof arm.sourcePhysicalDealSha256==='string' &&
        SHA256.test(arm.sourcePhysicalDealSha256);
    });
    let reason,cell=null,selected=false;
    if(!good){
      reason='unverified-setup';blocked=true;
      assert.equal(i,observations.length-1,
        'Cannot skip an unverified pair and inspect later setup outcomes');
    }else if(arms[0].firstTurnSlot!==arms[1].firstTurnSlot){
      reason='unmatched-actual-first';
    }else if(arms[0].sourcePhysicalDealSha256!==arms[1].sourcePhysicalDealSha256){
      reason='unmatched-physical-source-deal';
    }else{
      const first=arms[0].firstTurnSlot===expected.candidateSeat?
        'candidate':'source';
      cell=`seat${expected.candidateSeat}-${first}-first`;
      selected=counts[expected.rank][cell]<plan.quotas[expected.rank][cell];
      if(selected){
        counts[expected.rank][cell]++;
        plannedPairs.push({pairId:expected.pairId,rank:expected.rank,
          candidateSeat:expected.candidateSeat,seed:expected.seed,
          actualStarter:first,cell,armIds:expected.arms.map(a=>a.armId)});
      }
      reason=selected?'accepted-preoutcome-quota':'surplus-preoutcome-stratum';
    }
    retainedAttempts.push({pairId:expected.pairId,rank:expected.rank,
      candidateSeat:expected.candidateSeat,seed:expected.seed,
      ordinal:i,cell,selected,reason});
    complete=allQuotasMet();
  }
  const remainingQuotas=Object.fromEntries(plan.ranks.map(rank=>[rank,
    Object.fromEntries(CELLS.map(cell=>[
      cell,plan.quotas[rank][cell]-counts[rank][cell]]))]));
  return {
    schema:'aichi-fourcell-paired-start-accrual-v2',
    complete,blocked,
    consumedPairs:retainedAttempts.length,
    retainedAttempts,plannedPairs,counts,remainingQuotas,
    candidateDeckHashes:{...plan.candidateDeckHashes},
    sourceDeckHashes:{...plan.sourceDeckHashes},
    conditionalOnMatchedSourceDeals:true,
    unconditionalGameRateCertified:false,
    competitiveWinRateCertified:false
  };
}

module.exports={CELLS,accruePairedFourCells};
