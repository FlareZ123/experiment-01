'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight:basePreflight,narrow}=require('./agent42-selected-v3-known-witness-transport.cjs');
const {effectiveOptions,withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareSafely}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent42-selected-v3-known-witness-opponent-reply-extension-20261103.json';
const BLOB='b70ce79ab3c295e0e2142f4fb47fd9ff0125fefd';
const VERSION='agent42-selected-v3-postpaid-source-reply-extension-240root-v1';
const OUTPUT='agent42-selected-v3-known-witness-opponent-reply-240root-3attempts.json';
/** Frozen post-observation experiment registration and original profile. */
function preregistered(){
 const bytes=fs.readFileSync(path.join(ROOT,REG));
 assert.equal(gitBlobHash(bytes),BLOB);
 const r=JSON.parse(bytes.toString('utf8'));
 const base=basePreflight();
 assert.equal(r.priorRegistrationGitBlob,
   gitBlobHash(fs.readFileSync(path.join(ROOT,r.priorRegistration))));
 assert.equal(r.priorPositiveNativeRun,41718782033);
 assert.equal(r.priorPositiveArtifact,13270503827);
 assert.equal(r.baselineActionCap,180);
 assert.equal(r.extendedActionCap,240);
 assert.equal(r.totalNativeAttempts,3);
 assert.equal(r.originalSourceRank,1);
 assert.equal(r.originalSourceSeat,1);
 assert.equal(r.seed,1122744069);
 const trial=base.trials.find(x=>x.id===r.trialId);
 assert.ok(trial);
 assert.equal(trial.candidateSlot,'A');
 assert.equal(trial.candidateId,'new-moon-lockbreaker-v1');
 assert.deepEqual(r.modes,base.modes.map(x=>x.id));
 return {registration:r,original:base,trial};
}
/**
 * Find the first genuinely accepted opponent non-prompt root strictly after
 * the paid native attack. Never substitute a promotion prompt for counterplay.
 * @param {object} row Native Store source game.
 * @returns {object}
 */
function followthrough(row){
 const ledger=row.rootActionLedger??[];
 const source=1,opponent=0;
 const physicallyPaid=(row.sourceAttackSettlement?.attacks??[])
  .filter(x=>x.actionName==='AttackAction'||x.attackName==='Max Geist')
  .filter(x=>x.attackName==='Max Geist'&&
    x.settledPromptChain===true);
 const chains=[];
 for(let i=0;i+2<ledger.length;i++){
  const [a,b,c]=ledger.slice(i,i+3);
  if(a.playerSlot!==source||b.playerSlot!==source||
    c.playerSlot!==source||a.action!=='PlayCardAction'||
    a.card!=='Float Stone'||b.action!=='RetreatAction'||
    c.action!=='AttackAction'||c.attack!=='Max Geist'||
    a.turnBefore!==b.turnBefore||b.turnBefore!==c.turnBefore)continue;
  const settled=physicallyPaid.some(x=>x.actionOrdinal===c.actionOrdinal);
  const targets=row.nativeAcceptedTargetSidecar?.events??[];
  const tool=targets.some(e=>e.rootActionOrdinal===a.actionOrdinal&&
    e.action==='PlayCardAction'&&e.storeAccepted===true&&
    e.declared?.ownerHandPrinting==='Float Stone BKT');
  const retreat=targets.some(e=>e.rootActionOrdinal===b.actionOrdinal&&
    e.action==='RetreatAction'&&e.storeAccepted===true);
  const opponentReply=ledger.find(x=>x.actionOrdinal>c.actionOrdinal&&
    x.playerSlot===opponent&&x.action!=='ResolvePromptAction')??null;
  const sourceNext=ledger.find(x=>x.actionOrdinal>c.actionOrdinal&&
    x.playerSlot===source&&x.action!=='ResolvePromptAction')??null;
  chains.push({sourceSeat:source,toolOrdinal:a.actionOrdinal,
    retreatOrdinal:b.actionOrdinal,attackOrdinal:c.actionOrdinal,
    globalTurn:c.turnBefore,toolPhysicallyAccepted:tool,
    retreatPhysicallyAccepted:retreat,
    attackSettled:settled,
    opponentFirstNonPrompt:opponentReply,
    sourceFirstNextNonPrompt:sourceNext});
 }
 return {chains};
}
/** Complete 240-root native replay under immutable A/B/A policy and only one previously seen physical deal. */
function run(){
 const {registration:r,original:o,trial}=preregistered();
 const vendor=execFileSync('git',['rev-parse','HEAD'],{
  cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'}).trim();
 assert.equal(vendor,o.pinnedTwinleafRevision);
 const common={...o.selectedV3CommonPolicy,nativeRootActionLimit:r.extendedActionCap};
 const modes=[];
 for(const mode of o.modes){
  const options=effectiveOptions({
   commonPolicy:common,nativeActionCap:r.extendedActionCap,
   registeredTrials:[trial]
  },mode);
  options.registeredFrameName=VERSION+':'+mode.id;
  const fullNative=withSameRuntime(()=>runDevelopment(options));
  assert.equal(fullNative.attempted,1);
  assert.equal(fullNative.rows[0].trial.id,trial.id);
  modes.push({id:mode.id,summary:narrow(fullNative.rows[0]),
   followthrough:followthrough(fullNative.rows[0]),fullNative});
 }
 const [a,b,c]=modes;
 const ab=compareSafely(a.fullNative.rows,b.fullNative.rows)[0];
 const ac=compareSafely(a.fullNative.rows,c.fullNative.rows)[0];
 const matched=x=>x.sameSeed&&x.sameSourceDeal&&x.sameFullDeal&&x.sameStart;
 const controlHash=a.summary.rootHash===c.summary.rootHash&&
   a.summary.status===c.summary.status;
 const selectedRealOpponentNonPrompt=b.followthrough.chains
   .filter(x=>x.toolPhysicallyAccepted&&x.retreatPhysicallyAccepted&&
     x.attackSettled&&x.opponentFirstNonPrompt!==null);
 return {
  schema:VERSION,registeredPath:REG,registeredBlob:BLOB,
  historicalSeed:r.seed,priorPositiveRun:r.priorPositiveNativeRun,
  previousCap:r.baselineActionCap,extendedCap:r.extendedActionCap,
  frozenPrintedSixties:true,actualVendor:vendor,
  newIndependentSample:false,competitivelyQualifiedGames:0,
  summary:{attempts:3,trial:trial.id,
   allSourceAndCompleteDealsMatched:matched(ab)&&matched(ac),
   identicalRepeatedControl:controlHash,
   selectedSettledPaidChains:b.followthrough.chains.filter(x=>
     x.toolPhysicallyAccepted&&x.retreatPhysicallyAccepted&&x.attackSettled).length,
   selectedOpponentNonPromptReplyRoots:selectedRealOpponentNonPrompt.length,
   firstGenuineOpponentReply:selectedRealOpponentNonPrompt[0]?.opponentFirstNonPrompt??null,
   statuses:modes.map(m=>({id:m.id,status:m.summary.status,
    acceptedRoots:m.fullNative.rows[0].rootActionCount,finished:m.fullNative.rows[0].finished,
    sourceRemainingPrizes:m.fullNative.rows[0].finalPrizes?.[1]})),
   zeroCompetitivePaperQualification:true},
  modes
 };
}
if(require.main===module){
 if(process.argv.includes('--preflight')){
  const x=preregistered();process.stdout.write('AGENT42_REPLY_PREFLIGHT '+
   JSON.stringify({blob:BLOB,id:x.trial.id,cap:x.registration.extendedActionCap})+'\n');
 }else{
  const x=run();
  const {writeAtomicLocked}=require('./agent23-selected-joint-v2-release.cjs');
  writeAtomicLocked(OUTPUT,x);
  process.stdout.write('AGENT42_V3_REPLY '+JSON.stringify(x.summary)+'\n');
  assert.equal(x.summary.allSourceAndCompleteDealsMatched,true);
  assert.equal(x.summary.identicalRepeatedControl,true);
 }
}
module.exports={REG,BLOB,VERSION,preregistered,followthrough,run};
