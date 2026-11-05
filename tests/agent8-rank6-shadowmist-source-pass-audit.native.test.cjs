'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runExtended}=
 require('../simulation/evaluation/agent4-issue25-capture-retrospective-96.cjs');
const {withRank6OwnerShadowMistPassAudit,TARGET,VERSION}=
 require('../simulation/twinleaf/agent8-rank6-shadowmist-source-pass-audit.cjs');

/** Actual previously documented rank6 same-deal 96-root historical control. */
test('native source hand lock flags, damage and true owner Passes after paid Shadow Mist',()=>{
 const traced=withRank6OwnerShadowMistPassAudit(()=>runExtended(null));
 const audit=traced.audit;
 const raw=traced.result.rawDevelopment.rows;
 const original=raw.find(r=>r.trial.id===TARGET);
 const publicRoots=original?.rootActionLedger??
   original?.nativeAbortEvidence?.rootActionLedger??[];
 const roots=publicRoots.filter(r=>
   r.playerSlot===0&&r.action==='AttackAction'&&
   r.attack==='Shadow Mist');
 const summary={
   schema:VERSION,matchIds:raw.map(row=>row.trial.id),
   actualSourceOriginalRank6Seat:1,
   originalPhysicalSourceFingerprint:original?.sourceDealFingerprint??null,
   realRootCount:publicRoots.length,status:original?.status??null,
   nativeAttackRootCount:roots.length,
   actualStoreMatchingMatches:audit.matchingMatches,
   actualStoreObservations:audit,
   paperGameQualified:0,winRate:null
 };
 console.log('AGENT8_RANK6_SHADOWMIST_SOURCE_NATIVE',JSON.stringify(summary));
 assert.equal(raw.length,8);
 assert.equal(audit.matchingMatches,1);
 assert.equal(audit.nativeStores,1);
 assert.equal(roots.length,10);
 assert.equal(audit.shadowMistAttacks.length,10);
 assert.equal(audit.sourcePasses.length,11);
 assert.deepEqual(audit.shadowMistAttacks.map(x=>x.turn),
   [2,4,6,8,10,12,14,16,18,20]);
 assert.deepEqual(audit.sourcePasses.map(x=>x.turn),
   [1,3,5,7,9,11,13,15,17,19,21]);
 assert.ok(audit.shadowMistAttacks.every(row=>
   row.attacking==='Shadow Rider Calyrex V CRE' &&
   row.specialEnergyLockedAfter===true &&
   row.stadiumLockedAfter===true),
 'After genuine native attacks the original owner must actually be locked');
 assert.ok(audit.sourcePasses.slice(1).every(row=>
   row.specialEnergyHandPlayLocked===true &&
   row.stadiumHandPlayLocked===true),
 'At the actual original owner Pass root the attack lock must still apply');
 assert.equal(audit.readsOtherActorPrivate,false);
 assert.equal(audit.nativeGamesQualified,0);
});
