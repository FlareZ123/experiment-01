'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight:basePreflight,narrow}=require('./agent42-selected-v3-known-witness-transport.cjs');
const {followthrough}=require('./agent42-selected-v3-known-witness-opponent-reply-extension.cjs');
const {effectiveOptions,withSameRuntime}=require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareSafely}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent42-v3-known-witness-opponent-reply-v2-20261103.json';
const BLOB='e1f283b88dd691c40d18271b286d0912d93341b6';
const VERSION='agent42-v3-known-witness-native-240root-reply-v2';
const OUTPUT='agent42-v3-known-witness-240root-reply-six-native.json';
/** Require exact precommitted original two-candidate group and historical source. */
function preflight(){
 const raw=fs.readFileSync(path.join(ROOT,REG));
 assert.equal(gitBlobHash(raw),BLOB);
 const r=JSON.parse(raw.toString('utf8'));
 const original=basePreflight();
 assert.equal(r.schema,'agent42-v3-known-witness-240root-counterreply-two-candidates-v2');
 assert.equal(r.previousFailedWorkflowRun,41719942681);
 assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,r.previousFailedRegistration))),
   r.previousFailedRegistrationGitBlob);
 assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,r.originalTransportRegistration))),
   r.originalTransportRegistrationGitBlob);
 assert.equal(r.physicalSeed,1122744069);
 assert.equal(r.physicalCandidateSlot,'A');
 assert.equal(r.originalSourceSeat,1);
 assert.equal(r.sourceRank,1);
 assert.equal(r.extendedNativeActionCap,240);
 assert.equal(r.expectedAttempts,6);
 assert.equal(r.trials.length,2);
 assert.deepEqual(r.trials,original.trials.filter(x=>
   x.candidateSlot==='A'));
 assert.deepEqual(r.modeOrder,original.modes.map(x=>x.id));
 return {r,original};
}
/** Run registered two candidate types under identical A/B/A policy with higher observation cap. */
function run(){
 const {r,original:o}=preflight();
 const pin=execFileSync('git',['rev-parse','HEAD'],{
   cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'}).trim();
 assert.equal(pin,o.pinnedTwinleafRevision);
 const common={...o.selectedV3CommonPolicy,
   nativeRootActionLimit:r.extendedNativeActionCap};
 const modes=[];
 for(const mode of o.modes){
  const options=effectiveOptions({
    commonPolicy:common,nativeActionCap:r.extendedNativeActionCap,
    registeredTrials:r.trials
  },mode);
  options.registeredFrameName=VERSION+':'+mode.id;
  const fullNative=withSameRuntime(()=>runDevelopment(options));
  assert.equal(fullNative.attempted,2);
  assert.deepEqual(fullNative.rows.map(x=>x.trial.id),r.trials.map(x=>x.id));
  modes.push({id:mode.id,fullNative,
    rows:fullNative.rows.map(row=>({...narrow(row),
      fullNativeFinished:row.finished,sourceRemainingPrizes:row.finalPrizes?.[1],
      nativeWinner:row.winner,
      meaningfulFollowthrough:followthrough(row)}))});
 }
 const [a,b,c]=modes;
 const ab=compareSafely(a.fullNative.rows,b.fullNative.rows);
 const ac=compareSafely(a.fullNative.rows,c.fullNative.rows);
 const pairs=r.trials.map((t,i)=>{
  const x=a.rows[i],y=b.rows[i],z=c.rows[i];
  const match=p=>p.sameSeed&&p.sameSourceDeal&&p.sameFullDeal&&p.sameStart;
  return {id:t.id,sourceSeat:x.sourceSeat,
    allInitialPhysicalDealsEqual:match(ab[i])&&match(ac[i]),
    exactControlRepeatRootIdentity:x.rootHash!==null&&x.rootHash===z.rootHash&&
       x.status===z.status,
    selectedRootChanged:x.rootHash!==y.rootHash,
    control:x,selected:y,repeat:z};
 });
 const witness=pairs.find(x=>x.id==='1:420:A:new-moon-lockbreaker-v1');
 assert.ok(witness);
 const settled=witness.selected.meaningfulFollowthrough.chains.filter(x=>
   x.toolPhysicallyAccepted&&x.retreatPhysicallyAccepted&&x.attackSettled);
 const after=settled.filter(x=>x.opponentFirstNonPrompt!==null);
 const summary={
  nativeAttempts:6,contexts:2,
  identicalPhysicalDeals:pairs.filter(p=>p.allInitialPhysicalDealsEqual).length,
  identicalRepeatedControls:pairs.filter(p=>p.exactControlRepeatRootIdentity).length,
  changedAcceptedRootPairs:pairs.filter(p=>p.selectedRootChanged).length,
  sourceSettledFloatStoneRescues:settled.length,
  sourceRescuesWithActualOpponentNonPromptReply:after.length,
  opponentFirstNonPrompt:after[0]?.opponentFirstNonPrompt??null,
  selectedSourceNativeTerminal:witness.selected.fullNativeFinished,
  selectedSourceRemainingPrizes:witness.selected.sourceRemainingPrizes,
  controlSourceNativeTerminal:witness.control.fullNativeFinished,
  controlSourceRemainingPrizes:witness.control.sourceRemainingPrizes,
  engineErrors:modes.map(x=>({mode:x.id,
    count:x.rows.filter(r=>r.status==='engine-error').length})),
  competitivePaperGames:0
 };
 return {schema:VERSION,registeredBlob:BLOB,
  registration:r,pin,previousNativeRun:41718782033,
  evidenceClass:'Retrospective known positive. Both original source and fixed candidate 60s identical',
  summary,pairs,modes};
}
if(require.main===module){
 if(process.argv.includes('--preflight')){
  const {r}=preflight();
  process.stdout.write('AGENT42_V3_REPLY_V2_PREFLIGHT '+
   JSON.stringify({blob:BLOB,trials:r.trials.map(x=>x.id),
     attempts:r.expectedAttempts})+'\n');
 }else{
  const result=run();
  const {writeAtomicLocked}=require('./agent23-selected-joint-v2-release.cjs');
  writeAtomicLocked(OUTPUT,result);
  process.stdout.write('AGENT42_V3_REPLY_V2 '+
   JSON.stringify({summary:result.summary,pairs:result.pairs.map(x=>({
    id:x.id,allInitialPhysicalDealsEqual:x.allInitialPhysicalDealsEqual,
    exactControlRepeatRootIdentity:x.exactControlRepeatRootIdentity,
    selectedRootChanged:x.selectedRootChanged,
    control:{sourceRoots:x.control.sourceAcceptedRoots,finished:x.control.fullNativeFinished},
    selected:{sourceRoots:x.selected.sourceAcceptedRoots,finished:x.selected.fullNativeFinished}
   }))})+'\n');
  assert.equal(result.summary.identicalPhysicalDeals,2);
  assert.equal(result.summary.identicalRepeatedControls,2);
 }
}
module.exports={REG,BLOB,VERSION,preflight,run};
