'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,IDS,targetedTrials,compact,analyze}=
  require('../simulation/evaluation/agent32-rank11-seed2-candidate-dead-attack-pair.cjs');

const SOURCE='e349d3b9b51790929b264117612a1a7c218cb6f2726d73862d7a5a1e7ba51c55';

/** @param {string} id @param {boolean} [treatment] */
function row(id,treatment=false){
  const isChampion=id.includes('champion-reference');
  return {
    trial:{id,candidateId:isChampion?'champion-reference':
      'new-moon-lockbreaker-v1',candidateSlot:'A',rank:11,repeat:2,
    seed:3821563342},
    candidateSeat:0,sourceSeat:1,sourceDealFingerprint:SOURCE,
    fullPhysicalDealFingerprint:'pair-full-'+id,
    sourceDeckFingerprint:'rank11-original-60',
    candidateDeckFingerprint:isChampion?'original-champion-60':'new-moon-60',
    actualStarterSeat:1,finished:false,status:undefined,
    endReason:'action-limit',actionCount:260,finalPrizes:[6,6],
    rootActionLedger:[
      {actionOrdinal:14,turnBefore:2,playerSlot:0,
        action:'AttackAction',attack:'Get Lost'},
      {actionOrdinal:46,turnBefore:6,playerSlot:0,
        action:'AttackAction',attack:treatment?'Mind Shock':'Get Lost'}
    ],
    nativePromptChoices:{events:[]}
  };
}
const nativeRows=flag=>({attempted:2,rows:IDS.map(id=>row(id,flag))});

test('exact original rank11 registration selects only both two seed2-sideA candidates',()=>{
  assert.match(VERSION,/agent32-original-rank11/);
  const selected=targetedTrials();
  assert.equal(selected.length,2);
  assert.deepEqual(selected.map(x=>x.id),IDS);
  assert.ok(selected.every(x=>x.seed===3821563342));
});

test('paired original-to-actor intervention preserves every actual native arm',()=>{
  const result=analyze(nativeRows(false),nativeRows(true));
  assert.equal(result.actualNativeArmCount,4);
  assert.equal(result.matchedPhysicalInputs,true);
  assert.equal(result.comparisonAgainstArchivedV2SourceInputs,true);
  assert.ok(result.allOriginalRegisteredArmsAttempted);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.pairs.length,2);
  assert.deepEqual(result.pairs[0].firstNativeRootDivergence,{
    index:1,original:nativeRows(false).rows[0].rootActionLedger[1],
    knownDeadCandidate:nativeRows(true).rows[0].rootActionLedger[1]});
  assert.equal(result.pairs[0].knownDeadCandidate.selectedAttacks[1].name,'Mind Shock');
});

test('physical source swap fails matched evidence without falsifying actual attempts',()=>{
  const b=nativeRows(true);
  b.rows[0].fullPhysicalDealFingerprint='wrong';
  const result=analyze(nativeRows(false),b);
  assert.equal(result.matchedPhysicalInputs,false);
  assert.deepEqual(result.pairs[0].differentInputs,['fullPhysicalDealFingerprint']);
  assert.equal(result.competitiveQualifiedGames,0);
});

test('missing or duplicate original candidate arms fail closed',()=>{
  const a=nativeRows(false),b=nativeRows(true);
  assert.throws(()=>analyze(a,{attempted:1,rows:b.rows.slice(1)}));
  const duplicate={...b,rows:[b.rows[0],b.rows[0]]};
  assert.throws(()=>analyze(a,duplicate));
});

test('compact root measures candidate physical seat independent of target hidden hand',()=>{
  const rowA=row(IDS[0]);
  const compactA=compact(rowA);
  assert.equal(compactA.selectedAttacks.length,2);
  assert.equal(compactA.originalSourceAttacks.length,0);
  assert.equal(compactA.nativeAcceptedPromptEvents,0);
  assert.equal(compactA.actionCount,260);
  assert.equal(compactA.fullRootLedger.length,2);
});
