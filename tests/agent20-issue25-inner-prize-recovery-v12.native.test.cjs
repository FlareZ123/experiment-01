'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {runIssue25InnerPrizeV12,VERSION}=
  require('../simulation/evaluation/agent20-issue25-inner-prize-recovery-v12.cjs');

test('the exact v6 eight-source native Store panel tests a Prize callback at the innermost owner decoder',()=>{
  const result=runIssue25InnerPrizeV12();
  const dir=process.env.AGENT20_ISSUE25_PRIZE_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const filename=path.join(dir,'agent20-issue25-inner-prize-v12-native.json');
    const bytes=JSON.stringify(result,null,2)+'\n';
    const sum=createHash('sha256').update(bytes).digest('hex');
    writeAtomicLocked(filename,bytes);
    writeAtomicLocked(filename+'.sha256',sum+'  '+path.basename(filename)+'\n');
  }
  console.log('AGENT20_ISSUE25_INNER_PRIZE_V12',JSON.stringify({
    schema:result.schema,
    originalSourceDealMatches:result.sameSourceDealCount,
    fullPhysicalDealMatches:result.sameFullDealCount,
    root25PrefixReproduced:result.root25PrefixReproduced,
    prizeByStore:result.innerPrizeNativeAudit.nativePrizePrompts.map(row=>({
      label:row.nativeMatchLabel,status:row.status,
      submitted:row.ownerPrizeAudit?.ownerPrizeChoiceSubmitted??null,
      accepted:row.actualStoreAcceptedPrizePromptRoots,
      delegated:row.ownerPrizeAudit?.delegated??null,
      lastPromptKinds:row.ownerPrizeAudit?.delegatedPromptMetadata?.map(x=>x.promptKind)??[]
    })),
    nativeErrorCount:result.nativeErrors,
    nativeFinished:result.nativeFinished,
    sourceRank11Champion:result.comparedById.find(
      row=>row.id==='11:102:A:champion-reference'),
    qualified:result.claimedQualifiedGames
  }));
  assert.equal(result.schema,VERSION);
  assert.equal(result.actualAttempts.length,8);
  assert.equal(result.originalRawOutcomeCount,8);
  assert.equal(result.innerPrizeNativeAudit.actualNativeAttempts,8);
  assert.equal(result.sameSourceDealCount,8);
  assert.equal(result.sameFullDealCount,8);
  assert.equal(result.claimedQualifiedGames,0);
  assert.ok(result.comparedById.every(row=>row.returnedExactlyOnce));
});
