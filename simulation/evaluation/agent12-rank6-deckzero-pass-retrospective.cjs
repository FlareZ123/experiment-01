'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');
const {withDeckoutPassObservation}=require('../twinleaf/agent12-rank6-deckzero-pass-observer.cjs');
const root=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent7-lillie-pass-rank6-prospective-20261102.json';
const EXPECT='5d6dece97c6f8f90b51c41805741fd4229b035cbbc027b1643e0fad738f47e8f';
function run(){
  const registration=JSON.parse(fs.readFileSync(path.join(root,REG)));
  const profile=JSON.parse(fs.readFileSync(path.join(__dirname,
    'agent20-frozen-rank6-canary-v1.json')));
  const trials=registration.trials.filter(t=>t.seed===1855410067);
  assert.equal(trials.length,2);
  const observed=withDeckoutPassObservation(()=>runDevelopment({
    ...profile.policyOptions,registeredTrials:trials,registeredFrameName:REG
  }),trials);
  assert.equal(observed.audit.realGames,2);
  const champion=observed.result.rows.find(r=>
    r.trial.id==='6:71:A:champion-reference');
  assert.ok(champion);
  assert.equal(champion.rootActionLedgerSha256,EXPECT);
  const output={version:observed.audit.version,registration:REG,
    baselineChampionRootLedgerSha256:EXPECT,
    exactHistoricalRootParity:true,
    pinnedVendor:registration.pinnedTwinleafRevision,
    rows:observed.result.rows.map(r=>({trial:r.trial.id,
      sourcePhysicalDealFingerprint:r.sourceDealFingerprint,
      nativeWinner:r.winner,nativeEndReason:r.endReason,
      rootLedger:r.rootActionLedgerSha256})),
    passAudit:observed.audit,competitiveQualifiedGames:0};
  writeAtomicLocked(path.join(root,'agent12-rank6-deckzero-pass-native.json'),
    JSON.stringify(output,null,2)+'\n');
  return output;
}
if(require.main===module){
 const x=run();
 console.log(JSON.stringify({matched:x.exactHistoricalRootParity,
   events:x.passAudit.events,competitiveQualifiedGames:0}));
}
module.exports={run};
