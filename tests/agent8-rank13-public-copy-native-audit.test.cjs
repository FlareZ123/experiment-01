'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {auditPublicCopyReport}=
  require('../scripts/agent8-rank13-public-copy-native-audit.cjs');

/** @param {object} overrides */
function root(overrides={}){
 return {
   turn:16,activePrinting:'Regidrago VSTAR SIT',
   activeAttachedEnergyPrintings:['Double Dragon Energy ROS','Fire Energy MEE'],
   eligiblePublicDragonDiscard:[],templeOfSinnohPublicInPlay:false,
   heldCompressorWhilePayloadMissing:true,
   ...overrides
 };
}
/** @param {object} options */
function sample(options={}){
 const a={
   status:'native-returned',sourceDealSha256:'a'.repeat(64),
   fullPhysicalDealSha256:'b'.repeat(64),
   sourceOwnerPayloadAccessRoots:options.roots??[root()],
   sourceNativeCopiedAttackChoices:[],
   publicAttackTransitions:[],
   prizesRemaining:[6,6],
   gameDecisionTraceSha256:'d'.repeat(64),
   physicalCustody:{abnormalSettledRoots:0},
   gameFinished:false,nativeActionCount:160
 };
 const b={...a,
   sourceOwnerPayloadAccessRoots:[...a.sourceOwnerPayloadAccessRoots],
   sourceNativeCopiedAttackChoices:[],
   publicAttackTransitions:[...a.publicAttackTransitions],
   physicalCustody:{...a.physicalCustody}
 };
 if(options.publicMismatch)b.publicAttackTransitions=[{turn:16,damage:200}];
 if(options.openingMismatch)b.fullPhysicalDealSha256='c'.repeat(64);
 return {schema:'agent8-rank13-prospective-public-flat-copy-v1',
   sourceRank:13,opponentRank:1,attempts:2,rows:[{
     trial:{sourceSeat:1,seed:2686109268},
     returned:true,paired:!options.openingMismatch,
     fullNativeArms:{control:a,selected:b}
   }]};
}
test('funded Regidrago and absent payload is a joint-gate failure',()=>{
 const result=auditPublicCopyReport(sample());
 assert.equal(result.physicalSeedGroups,1);
 assert.equal(result.returnedPairs,1);
 assert.equal(result.matchedFullPhysicalPairs,1);
 assert.equal(result.activeVstarDeals,1);
 assert.equal(result.publicPayloadDeals,0);
 assert.equal(result.payableDeals,1);
 assert.equal(result.allThreeNecessaryGateDeals,0);
 assert.equal(result.rows[0].heldCompressorMissingPayloadRoots,1);
 assert.equal(result.nativeTerminals,0);
 assert.equal(result.actionCensoredAttempts,2);
 assert.equal(result.competitiveQualifiedGames,0);
});
test('all three necessary public prerequisites are detected jointly',()=>{
 const result=auditPublicCopyReport(sample({roots:[
   root({eligiblePublicDragonDiscard:['Dragapult ex TWM']})
 ]}));
 assert.equal(result.allThreeNecessaryGateDeals,1);
});
test('matching action labels do not certify physical public board receipts',()=>{
 const result=auditPublicCopyReport(sample({publicMismatch:true}));
 assert.equal(result.identicalActionLedgerPairs,1);
 assert.equal(result.pairsWithMatchingRecordedPublicBoardFields,0);
});
test('different full initial deals are excluded from paired evidence',()=>{
 const result=auditPublicCopyReport(sample({openingMismatch:true}));
 assert.equal(result.matchedFullPhysicalPairs,0);
 assert.equal(result.returnedPairs,1);
});
test('fail closed when a registered return or native opportunity is inconsistent',()=>{
 const record=sample();record.rows[0].returned=false;
 assert.throws(()=>auditPublicCopyReport(record));
 const broken=sample();broken.rows[0].fullNativeArms.control
   .sourceOwnerPayloadAccessRoots=[{turn:16}];
 assert.throws(()=>auditPublicCopyReport(broken));
});
