'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {runConservativeSourceSupporterV16,VERSION}=
  require('../simulation/evaluation/agent20-issue25-v16-bilateral-conservative-supporter.cjs');

test('pinned native same eight original paper source 60s symmetric owner Supporter A/B',()=>{
  const result=runConservativeSourceSupporterV16();
  const dir=process.env.AGENT20_ISSUE25_PRIZE_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const file=path.join(dir,'agent20-issue25-v16-bilateral-supporter-native.json');
    const bytes=JSON.stringify(result,null,2)+'\n';
    const digest=createHash('sha256').update(bytes).digest('hex');
    writeAtomicLocked(file,bytes);
    writeAtomicLocked(file+'.sha256',digest+'  '+path.basename(file)+'\n');
  }
  console.log('AGENT20_ISSUE25_V16_SUPPORTER',JSON.stringify({
    schema:result.schema,
    allPhysicalMatched:result.sourceAndCompletePhysicalDealsMatched,
    controlOption:result.actualNativeRunnerReportedControlFlag,
    treatmentOption:result.actualNativeRunnerReportedTreatmentFlag,
    changedRows:result.changedNativeRootsInRows,
    firstSourceChange:result.firstChangedRootOriginalSourceCount,
    sourceNewPlayCardRows:result.sourcePlayerNewPlayCardsObserved,
    matchedOriginalV6:result.rows.every(x=>x.originalSourceInitialDealMatchesV6),
    differences:result.rows.filter(x=>!x.sameWholeNativeLedger).map(x=>({
      id:x.id,first:x.firstDivergentRootOrdinal,
      source:x.firstDivergenceActedByOriginalSource,
      baseline:x.firstBaselineNativeRoot,treatment:x.firstTreatmentNativeRoot,
      sourcePlaysA:x.originalSourcePlayCards,
      sourcePlaysB:x.treatedSourcePlayCards
    })),
    qualified:result.qualifiedGames
  }));
  assert.equal(result.schema,VERSION);
  assert.equal(result.rows.length,8);
  assert.equal(result.treatmentOptionReachedNativeRunner,true);
  assert.equal(result.sourceAndCompletePhysicalDealsMatched,true);
  assert.equal(result.qualifiedGames,0);
});
