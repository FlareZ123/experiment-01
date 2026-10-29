'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const SCHEMA='agent9-original-32-vip-physical-deal-distribution-v1';

/**
 * A read-only summary of the archived, strict all-attempt native census.
 * Distinguishes a game arm from an independent original source physical deal
 * and preserves every native error, setup parity and censor change.
 *
 * @param {object} archive Frozen 32 paired-arm census.
 * @returns {object}
 */
function summarize(archive){
  assert.equal(archive.schema,
    'agent9-retrospective-original-32-bilateral-vip-census-v1');
  assert.equal(archive.attempts,32);
  assert.equal(archive.attemptRows.length,32);
  assert.equal(archive.matchedCompleteAttempts,32);
  assert.equal(archive.gatePassed,true);
  assert.equal(archive.competitiveQualifiedGames,0);
  const rows=archive.attemptRows;
  const group=(items)=>({
    gameArms:items.length,
    independentSourcePhysicalDeals:new Set(items.map(x=>
      x.controlSourceFingerprint)).size,
    actualSourceFirstArms:items.filter(x=>x.actualSourceFirst).length,
    heldSourceVipFirstPassArms:items.filter(x=>
      x.actualSourceHeldVipFirstPass).length,
    sourceVipItemArms:items.filter(x=>x.sourceVipItems>0).length,
    sourceVipItemCount:items.reduce((a,x)=>a+(x.sourceVipItems??0),0),
    sourceVipBenchConfirmed:items.reduce((a,x)=>
      a+(x.sourceVipBenchConfirmed??0),0),
    sourceNamedChosenPhysicalBasics:items.reduce((a,x)=>
      a+(x.selectedCards?.length??0),0),
    sourceZeroNamedBasicSearchArms:items.filter(x=>
      x.sourceVipItems>0&&(x.selectedCards?.length??0)===0).length,
    candidateVipItemArms:items.filter(x=>x.candidateVipItems>0).length,
    candidateVipBenchConfirmed:items.reduce((a,x)=>
      a+(x.candidateVipBenchConfirmed??0),0),
    oldCapped:items.filter(x=>x.controlStatus==='capped').length,
    treatedCapped:items.filter(x=>x.treatedStatus==='capped').length,
    oldEngineError:items.filter(x=>
      x.controlStatus==='engine-error').length,
    treatedEngineError:items.filter(x=>
      x.treatedStatus==='engine-error').length
  });
  const groupSourceDeals=(items)=>{
    const byFingerprint=new Map();
    for(const row of items){
      const id=row.controlSourceFingerprint;
      assert.ok(id,'All source physical fingerprints must be recorded');
      const existing=byFingerprint.get(id)??[];
      existing.push(row);
      byFingerprint.set(id,existing);
    }
    return [...byFingerprint].map(([fingerprint,group])=>({
      fingerprint,
      physicalGameArms:group.length,
      sourceSeats:[...new Set(group.map(x=>x.sourceSeat))],
      sourceActuallyFirst:[...new Set(group.map(x=>x.actualSourceFirst))],
      sourceVipAccepted:group.some(x=>x.sourceVipItems>0),
      sourceVipAllArmsAccepted:group.every(x=>x.sourceVipItems>0),
      heldSourceVipFirstPass:group.some(x=>
        x.actualSourceHeldVipFirstPass),
      examples:group.filter(x=>x.sourceVipItems>0).map(x=>({
        trial:x.id,sourceSeat:x.sourceSeat,
        selectedNativeCards:x.selectedCards
      })),
      treatmentCapCounts:group.filter(x=>
        x.treatedStatus==='capped').length
    }));
  };
  const sourceRanks=[...new Set(rows.map(x=>x.rank))].sort((a,b)=>a-b);
  assert.deepEqual(sourceRanks,[6,11]);
  const byRank=sourceRanks.map(rank=>{
    const rankRows=rows.filter(x=>x.rank===rank);
    return {rank,...group(rankRows),sourceDeals:groupSourceDeals(rankRows)};
  });
  const bySourcePhysicalSeat=[0,1].map(seat=>({
    seat,...group(rows.filter(x=>x.sourceSeat===seat))
  }));
  const capChanged=rows.filter(x=>x.controlStatus!==x.treatedStatus)
    .map(x=>({id:x.id,rank:x.rank,
      control:x.controlStatus,treatment:x.treatedStatus,
      vipSource:x.sourceVipItems,vipCandidate:x.candidateVipItems,
      competitiveQualified:false}));
  const keptErrors=rows.filter(x=>
    x.controlStatus==='engine-error'||x.treatedStatus==='engine-error')
    .map(x=>({id:x.id,control:x.controlStatus,
      treatment:x.treatedStatus,nativeError:x.nativeError}));
  return {
    schema:SCHEMA,firstNativeRun:'40959290027',
    originalRegistration:archive.registration,
    enginePin:archive.enginePin,
    parentRegistrationBlob:archive.parentRegistrationBlob,
    zipSha256:'90a2f558695c24fccf9dac5011b78dfb98a517ab9502509fdc50cd08b6b5d945',
    summary:group(rows),byRank,bySourcePhysicalSeat,
    allSourcePhysicalDealCount:new Set(rows.map(x=>
      x.controlSourceFingerprint)).size,
    changedCapOrTerminalArms:capChanged,
    keptErrors,allSetupsEquivalent:rows.every(x=>x.fingerprintParity),
    allNativeItemEffectsPaired:
      archive.sourceItemWithoutNativeOwnerPrompt.length===0&&
      (archive.candidateItemWithoutNativeOwnerPrompt??[]).length===0,
    competitiveQualifiedGames:0,
    inferenceCaveat:'Selected two-rank original 32 game arms share source physical deals in paired candidate arms. Source coverage and native response only; cannot infer strength, full-field success or event game win rate.'
  };
}
if(require.main===module){
  assert.equal(process.argv.length,3,'Expected archived all-attempt JSON');
  const summary=summarize(JSON.parse(fs.readFileSync(process.argv[2],'utf8')));
  process.stdout.write(JSON.stringify(summary,null,2)+'\n');
  process.stderr.write('AGENT9_32_NATIVE_ARCHIVE '+JSON.stringify({
    overall:summary.summary,
    byRank:summary.byRank.map(x=>({
      rank:x.rank,gameArms:x.gameArms,
      independentDeals:x.independentSourcePhysicalDeals,
      sourceVip:x.sourceVipItemArms,
      candidateVip:x.candidateVipItemArms,
      sourceFirst:x.actualSourceFirstArms,
      heldSourceVip:x.heldSourceVipFirstPassArms,
      sourceVipNativeBenches:x.sourceVipBenchConfirmed,
      sourceNamedChosenPhysicalBasics:x.sourceNamedChosenPhysicalBasics,
      sourceZeroNamedBasicSearchArms:x.sourceZeroNamedBasicSearchArms,
      sourceDealPositive:x.sourceDeals.filter(d=>
        d.sourceVipAccepted).length
    })),
    capChanged:summary.changedCapOrTerminalArms,
    nativeErrors:summary.keptErrors.length,
    competitive:summary.competitiveQualifiedGames
  })+'\n');
}
module.exports={SCHEMA,summarize};
