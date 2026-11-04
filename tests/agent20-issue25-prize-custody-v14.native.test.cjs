'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {runIssue25PrizeCustodyV14,VERSION}=
  require('../simulation/evaluation/agent20-issue25-prize-custody-v14.cjs');

test('preserve original full-deal rank6/rank11 source replies with actual native Prize-to-hand counts',()=>{
  const result=runIssue25PrizeCustodyV14();
  const dir=process.env.AGENT20_ISSUE25_PRIZE_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const file=path.join(dir,'agent20-issue25-prize-custody-v14-native.json');
    const bytes=JSON.stringify(result,null,2)+'\n';
    const digest=createHash('sha256').update(bytes).digest('hex');
    writeAtomicLocked(file,bytes);
    writeAtomicLocked(file+'.sha256',digest+'  '+path.basename(file)+'\n');
  }
  console.log('AGENT20_ISSUE25_PRIZE_CUSTODY_V14',JSON.stringify({
    schema:result.schema,
    sourceDealMatches:result.samePhysicalSourceDeals,
    fullDealMatches:result.sameFullPhysicalDeals,
    root25Unaltered:result.originalRoot25PrefixPreserved,
    sourceRank11Status:result.sourceRank11Target?.treatmentStatus,
    nativeAcceptedRoots:result.sourceRank11Target?.treatmentAcceptedRootCount,
    sourcePromptAudit:result.sourceRank11Target?.ownerAudit?.ownerPromotion,
    realZoneCustody:result.sourceRank11Target?.ownerAudit?.nativePrizeZoneCustody,
    errorCount:result.nativeErrorCount,
    finishedCount:result.nativeFinishedCount,
    qualified:result.qualifiedGames
  }));
  assert.equal(result.schema,VERSION);
  assert.equal(result.allEightAttemptDispositions.length,8);
  assert.equal(result.samePhysicalSourceDeals,8);
  assert.equal(result.sameFullPhysicalDeals,8);
  assert.equal(result.originalRoot25PrefixPreserved,true);
  assert.equal(result.qualifiedGames,0);
});
