'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {runOriginalEightOwnerTrainerV15,VERSION}=
  require('../simulation/evaluation/agent20-issue25-v15-8row-owner-trainer-observer.cjs');

test('A/A all original rank6/rank11 source seats include previously aborted rank11/champion Trainer owner census',()=>{
  const res=runOriginalEightOwnerTrainerV15();
  const dir=process.env.AGENT20_ISSUE25_PRIZE_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const file=path.join(dir,'agent20-issue25-v15-readonly-trainer-aa-native.json');
    const bytes=JSON.stringify(res,null,2)+'\n';
    const sha=createHash('sha256').update(bytes).digest('hex');
    writeAtomicLocked(file,bytes);
    writeAtomicLocked(file+'.sha256',sha+'  '+path.basename(file)+'\n');
  }
  console.log('AGENT20_ISSUE25_V15_OWNER_TRAINER',JSON.stringify({
    mode:res.schema,
    verdict:res.resultClassification,
    physicalFullDealMatch:res.exactFullPhysicalDealBothArms,
    sourceDealMatch:res.exactSourceDealBothArms,
    identicalRoot8:res.exactAllEightRootLedgers,
    identicalStatuses:res.exactAllEightStatus,
    actualTrainerAuditCount:res.ownerTrainerAuditsCount,
    sourceOwnerTotals:res.sourceOwnerTotals,
    previouslyErrorRank11:res.formerlyErrorOriginalRank11Champion,
    qualified:res.qualifiedGames
  }));
  assert.equal(res.schema,VERSION+'-comparison-v1');
  assert.equal(res.nativeEightEntriesPerArm,8);
  assert.equal(res.rows.length,8);
  assert.equal(res.qualifiedGames,0);
});
