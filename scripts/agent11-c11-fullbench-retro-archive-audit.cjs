'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const pins=[
 '1d5a7ebe7389d65d4539b473d7bfb370fac216c4dabf161a7421d7a67f068bf4',
 'ee45cc79147dbd49e0ea8248f8cf6aea649d3a683c4150200d73cf879b47f13c',
 '55cd13474d0618de436b5c8ca81c7e2319375e6ee1ed81e6f9b326f5e4455433',
 '8da2270bd28377f782060f952e7d056a57070f3569f657a4c1c6f46e052ae6b6'];
const id=r=>[r.seed,r.rank5Seat,r.mode].join(':');
const digest=b=>createHash('sha256').update(b).digest('hex');
const deal=r=>r.initialFullPhysicalDealDigest??r.error?.nativeAbortEvidence?.fullPhysicalDealFingerprint?.digestSha256;
const first=r=>r.firstTurnSlot??r.error?.nativeAbortEvidence?.initialTurnOrderEvidence?.firstTurnSlot;
/** Compare one pinned original source profile with its retrospective guard. */
function compare(original,guarded,errors,passes){
 assert.equal(original.rows.length,64);assert.equal(guarded.rows.length,64);
 assert.equal(original.registrationSha256,guarded.registrationSha256);
 assert.equal(guarded.experimentalC11FullBenchPassGuard,'retrospective-paper-no-search-equivalent-pass-v1');
 const next=new Map(guarded.rows.map(r=>[id(r),r]));
 const out={originalErrors:0,originalNonerrorExactTrace:0,exactAbortPrefixAndPass:0,acceptedPasses:0,unchangedWinners:0};
 for(const old of original.rows){
  const now=next.get(id(old));assert(now);
  assert(deal(old));assert.equal(deal(old),deal(now));assert.equal(first(old),first(now));
  assert.equal(now.nativeStatus==='native-error',false);
  const a=now.c11GuardAudit;assert.equal(a?.paperQualified,false);
  assert.equal(a.guardProposals,a.acceptedPasses);assert.equal(a.rejectedPasses,0);
  out.acceptedPasses+=a.acceptedPasses;
  if(old.nativeStatus==='native-error'){
   out.originalErrors++;assert.equal(now.nativeStatus,'native-capped');
   const v=old.error.nativeAbortEvidence;
   assert.equal(v.attackName,'Call for Family');assert.equal(v.attackingPokemon,'Trubbish FST');
   assert.equal(v.preDispatchBoard[v.actingSeat].bench.length,5);
   assert.deepEqual(now.rootActionLedger.slice(0,v.rootActionLedger.length),v.rootActionLedger);
   const replacement=now.rootActionLedger[v.rootActionLedger.length];
   assert.equal(replacement.actionOrdinal,v.actionOrdinal);
   assert.equal(replacement.action,'PassTurnAction');
   assert.equal(replacement.playerSlot,v.actingSeat);
   out.exactAbortPrefixAndPass++;
  }else{
   assert.deepEqual(old.rootActionLedger,now.rootActionLedger);
   assert.equal(old.rootActionLedgerSha,now.rootActionLedgerSha);
   assert.equal(old.decisionTraceSha,now.decisionTraceSha);
   assert.equal(old.nativeStatus,now.nativeStatus);
   assert.equal(old.nativeWinner,now.nativeWinner);
   out.originalNonerrorExactTrace++;
   if(old.nativeStatus==='native-terminal')out.unchangedWinners++;
  }
 }
 assert.equal(out.originalErrors,errors);
 assert.equal(out.exactAbortPrefixAndPass,errors);
 assert.equal(out.originalNonerrorExactTrace,64-errors);
 assert.equal(out.acceptedPasses,passes);
 return out;
}
if(require.main===module){
 assert.equal(process.argv.length,6);
 const docs=pins.map((pin,i)=>{const b=fs.readFileSync(process.argv[i+2]);assert.equal(digest(b),pin);return JSON.parse(b.toString('utf8'));});
 const off=compare(docs[0],docs[2],10,59),on=compare(docs[1],docs[3],13,65);
 assert.equal(off.unchangedWinners,13);assert.equal(on.unchangedWinners,6);
 process.stdout.write(JSON.stringify({schema:'agent11-c11-four-source-trace-audit-v1',off,on,qualifiedPaperGames:0},null,2)+'\n');
}
module.exports={compare};
