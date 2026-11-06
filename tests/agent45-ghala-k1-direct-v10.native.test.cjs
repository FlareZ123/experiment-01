'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {VERSION,runAgent45DirectK1V10}=
  require('../simulation/evaluation/agent45-ghala-k1-direct-v10.cjs');

const EXPECTED=[
 'Thunder Mountain Prism Star LOT',
 'Double Colorless Energy SUM',
 'Handheld Fan TWM'
];

test('real original rank6 paid native G&H both owner searches yield directly proven K1 physical printings',()=>{
 const observed=runAgent45DirectK1V10();
 assert.equal(observed.schema,VERSION);
 assert.equal(observed.originalNativeAttemptCount,8);
 assert.equal(new Set(observed.rows.map(row=>row.id)).size,8);
 assert.equal(observed.sourceAndFullDeckAndPublicTapeParity,true);
 assert.equal(observed.qualifiedCompetitiveGames,0);
 assert.equal(observed.zeroActorPolicyChanges,true);
 assert.equal(observed.allOriginalPrintedSixtiesUnchanged,true);
 const targets=observed.rows.filter(row=>
   observed.originalFrozenTargets.includes(row.id));
 assert.equal(targets.length,2);
 for(const row of targets){
   assert.equal(row.originalSourceSeat,0);
   assert.equal(row.matchedFrozenV9SourceAndFullDealAndPublicTapes,true);
   assert.equal(row.acceptedRootDigestConsistent,true);
   assert.equal(row.originalSourceGuzmaHalaPublicPlayRoots.length,1);
   assert.equal(row.directNativeSourceK1Prompts.length,1,
     'G&H should have one real owner-deck search');
   const actual=row.directNativeSourceK1Prompts[0];
   assert.deepEqual(actual.selectedPrintedCards,EXPECTED);
   assert.equal(actual.selectedCount,3);
   assert.equal(actual.realOwnerDeckPrompt,true);
   assert.equal(actual.selectedOriginallyInOwnDeck,true);
   assert.equal(actual.samePhysicalCardsMovedToOwnHand,true);
   assert.equal(actual.nativeStoreResolvedWithoutThrow,true);
 }
 const summary={schema:VERSION,
  frozenEight:observed.originalNativeAttemptCount,
  sameOldV9PhysicalSourceDealsAndRootTapes:
    observed.sourceAndFullDeckAndPublicTapeParity,
  directRealSourceK1:targets.map(row=>({
    trialId:row.id,realSourceGuzmaHalaRoot:
      row.originalSourceGuzmaHalaPublicPlayRoots[0],
    actualSelectedPrintings:row.directNativeSourceK1Prompts[0].selectedPrintedCards,
    samePhysicalOwnerDeckToHand:
      row.directNativeSourceK1Prompts[0].samePhysicalCardsMovedToOwnHand,
    actualStoreDispatchOrdinal:
      row.directNativeSourceK1Prompts[0].StoreDispatchOrdinal,
    actualPromptId:row.directNativeSourceK1Prompts[0].promptId
  })),
  allStatuses:observed.rows.map(row=>({id:row.id,status:row.status})),
  paperQualifiedGames:0};
 const dir=process.env.AGENT45_K1_NATIVE_DIR;
 if(dir){
   fs.mkdirSync(dir,{recursive:true});
   const file=path.join(dir,'agent45-direct-k1-native-v10.json');
   const body=JSON.stringify(observed,null,2)+'\n';
   writeAtomicLocked(file,body);
   writeAtomicLocked(file+'.sha256',createHash('sha256')
     .update(body).digest('hex')+'  '+path.basename(file)+'\n');
 }
 console.log('AGENT45_DIRECT_K1_V10',JSON.stringify(summary));
});
