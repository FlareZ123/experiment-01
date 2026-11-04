'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {runIssue25PrizeAndPromotionV13,VERSION}=
  require('../simulation/evaluation/agent20-issue25-inner-prize-promotion-v13.cjs');

test('original eight source-deal-matched Issue25 runs a real owner Prize then owner Bench-promotion policy',()=>{
  const result=runIssue25PrizeAndPromotionV13();
  const dir=process.env.AGENT20_ISSUE25_PRIZE_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const file=path.join(dir,'agent20-issue25-inner-prize-promotion-v13-native.json');
    const bytes=JSON.stringify(result,null,2)+'\n';
    const digest=createHash('sha256').update(bytes).digest('hex');
    writeAtomicLocked(file,bytes);
    writeAtomicLocked(file+'.sha256',digest+'  '+path.basename(file)+'\n');
  }
  console.log('AGENT20_ISSUE25_INNER_PRIZE_PROMOTION_V13',JSON.stringify({
    schema:result.schema,
    sourceDealMatches:result.samePhysicalSourceDeals,
    fullDealMatches:result.sameFullPhysicalDeals,
    root25Unaltered:result.originalRoot25PrefixPreserved,
    targetTrial:result.sourceRank11Target?.id,
    nativeAcceptedCount:result.sourceRank11Target?.treatmentAcceptedRootCount,
    sourceTargetStatus:result.sourceRank11Target?.treatmentStatus,
    sourceRootWindow:result.sourceRank11Target?.publicRootWindow,
    ownerAudit:result.sourceRank11Target?.ownerAudit,
    errors:result.nativeErrorCount,
    finals:result.nativeFinishedCount,
    qualified:result.qualifiedGames
  }));
  assert.equal(result.schema,VERSION);
  assert.equal(result.allEightAttemptDispositions.length,8);
  assert.equal(result.samePhysicalSourceDeals,8);
  assert.equal(result.sameFullPhysicalDeals,8);
  assert.equal(result.originalRoot25PrefixPreserved,true);
  assert.equal(result.qualifiedGames,0);
});
