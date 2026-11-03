'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {preflight:basePreflight,narrow}=
  require('./agent42-selected-v3-known-witness-transport.cjs');
const {followthrough}=
  require('./agent42-selected-v3-known-witness-opponent-reply-extension.cjs');
const {effectiveOptions,withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareSafely}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent42-selected-v3-rank1-independent-heldout-20261103.json';
const BLOB='7bdaa9c551ae1ce5d4bb818e71c21c8675a355f8';
const OUTPUT='agent42-selected-v3-rank1-prospective-48-native.json';
const VERSION='agent42-selected-v3-rank1-240root-independent-8seedgroups-v1';
/** Check frozen unique new seed groups, original registered printings and policy. */
function preflight(){
 const raw=fs.readFileSync(path.join(ROOT,REG));
 assert.equal(gitBlobHash(raw),BLOB);
 const r=JSON.parse(raw.toString('utf8'));
 const old=basePreflight();
 assert.equal(r.schema,'agent42-prospective-selected-v3-rank1-240root-A-B-A-20261103-v1');
 assert.equal(r.registeredBeforeFirstNativeAttempt,true);
 assert.equal(r.originalAichiSourceRank,1);
 assert.equal(r.independentSeedGroups,8);
 assert.equal(r.physicalContexts,16);
 assert.equal(r.nativeAttempts,48);
 assert.equal(r.actionCap,240);
 assert.equal(r.commonPolicyRegistrationBlob,
   gitBlobHash(fs.readFileSync(path.join(ROOT,r.commonPolicyFrom))));
 assert.equal(r.pin,old.pinnedTwinleafRevision);
 assert.deepEqual(r.modeOrder,old.modes.map(m=>m.id));
 assert.deepEqual(r.candidateIds,['champion-reference','new-moon-lockbreaker-v1']);
 assert.equal(r.trials.length,16);
 const used=new Set([
  1122744069,3088848747,305615282,76580997,
  1929773419,2745353818,3143130084,76115361
 ]);
 const groups=new Map();
 for(const t of r.trials){
  assert.equal(t.rank,1);
  assert.ok(['A','B'].includes(t.candidateSlot));
  assert.equal(t.id,[1,t.repeat,t.candidateSlot,t.candidateId].join(':'));
  assert.equal(t.seed,r.seeds[t.candidateSlot][t.repeat-430]);
  assert.equal(used.has(t.seed),false,'No historical seed reuse');
  const group=t.candidateSlot+':'+t.seed;
  const list=groups.get(group)??[];
  list.push(t.candidateId);groups.set(group,list);
 }
 assert.equal(groups.size,8);
 assert.equal(new Set([...r.seeds.A,...r.seeds.B]).size,8);
 for(const members of groups.values())
  assert.deepEqual(members.sort(),r.candidateIds.slice().sort());
 return {r,old};
}
/** Admit physical source settlement evidence without inflating repeated game roots. */
function narrowEvidence(row){
 const basic=narrow(row),seat=basic.sourceSeat;
 const reply=followthrough(row,seat);
 const accepted=reply.chains.filter(x=>
  x.toolPhysicallyAccepted&&x.retreatPhysicallyAccepted&&x.attackSettled);
 return {...basic,sourceNativeFinished:row.finished??false,
  nativeWinner:row.winner??null,
  sourceRemainingPrizes:row.finalPrizes?.[seat]??null,
  candidateRemainingPrizes:row.finalPrizes?.[1-seat]??null,
  settledSourceFloatStoneRescues:accepted.length,
  settledSourceRescuesWithOpponentNonprompt:accepted.filter(x=>
   x.opponentFirstNonPrompt!==null).length,
  earliestSettledSourceReply:accepted.find(x=>
   x.opponentFirstNonPrompt!==null)?.opponentFirstNonPrompt??null,
  physicalReplyChains:reply.chains,paperQualifiedGames:0};
}
/** Run newly randomized rank1 source states in both seats with immutable A/B/A. */
function run(){
 const {r,old}=preflight();
 const pin=execFileSync('git',['rev-parse','HEAD'],{
  cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'}).trim();
 assert.equal(pin,r.pin);
 const common={...old.selectedV3CommonPolicy,
  nativeRootActionLimit:r.actionCap};
 const modes=[];
 for(const mode of old.modes){
  const opts=effectiveOptions({
    commonPolicy:common,nativeActionCap:r.actionCap,
    registeredTrials:r.trials
  },mode);
  opts.registeredFrameName=VERSION+':'+mode.id;
  const fullNative=withSameRuntime(()=>runDevelopment(opts));
  assert.equal(fullNative.attempted,16);
  assert.deepEqual(fullNative.rows.map(x=>x.trial.id),
    r.trials.map(x=>x.id));
  modes.push({id:mode.id,
   rows:fullNative.rows.map(narrowEvidence),fullNative});
 }
 const [control,selected,repeat]=modes;
 const ab=compareSafely(control.fullNative.rows,selected.fullNative.rows);
 const ac=compareSafely(control.fullNative.rows,repeat.fullNative.rows);
 const matched=x=>x.sameSeed&&x.sameSourceDeal&&x.sameFullDeal&&x.sameStart;
 const pairs=r.trials.map((trial,i)=>{
  const a=control.rows[i],b=selected.rows[i],c=repeat.rows[i];
  return {id:trial.id,seed:trial.seed,sourceSeat:a.sourceSeat,
   samePhysicalOpening:matched(ab[i])&&matched(ac[i]),
   identicalControlRoot:a.rootHash!==null&&a.rootHash===c.rootHash&&
      a.status===c.status,
   changedNativeRoots:a.rootHash!==b.rootHash,
   control:a,selected:b,repeat:c};
 });
 const sum=key=>pairs.reduce((n,p)=>n+(p.selected[key]??0),0);
 const summary={independentSeedGroups:8,
  registeredOriginalGameContexts:16,nativeAttempts:48,
  fullPhysicalDealMatches:pairs.filter(p=>p.samePhysicalOpening).length,
  identicalRepeatedControlRoots:pairs.filter(p=>p.identicalControlRoot).length,
  nativeChangedRootContexts:pairs.filter(p=>p.changedNativeRoots).length,
  selectedFundedVMAXIntentCount:sum('selectedFundedStoneIntents'),
  selectedSourceSettledPaidFloatStoneRescues:sum('settledSourceFloatStoneRescues'),
  selectedSourceRescuesFollowedByActualOpponentAction:
   sum('settledSourceRescuesWithOpponentNonprompt'),
  nativeTerminalsByMode:modes.map(m=>({mode:m.id,
   count:m.rows.filter(x=>x.sourceNativeFinished).length})),
  engineErrorsByMode:modes.map(m=>({mode:m.id,
   count:m.rows.filter(x=>x.status==='engine-error').length})),
  paperCompetitiveGames:0};
 return {schema:VERSION,registrationPath:REG,registeredBlob:BLOB,
  independentSeedGroups:r.independentSeedGroups,
  evidenceClass:'Fresh independent source seeds after earlier known-positive transport, original Aichi rank1 only',
  pinnedTwinleaf:pin,rank:1,summary,pairs,modes};
}
if(require.main===module){
 if(process.argv.includes('--preflight')){
  const {r}=preflight();
  process.stdout.write('AGENT42_RANK1_HELDOUT_PREFLIGHT '+
   JSON.stringify({blob:BLOB,seeds:r.seeds,contexts:r.physicalContexts})+'\n');
 }else{
  const x=run();
  const {writeAtomicLocked}=require('./agent23-selected-joint-v2-release.cjs');
  writeAtomicLocked(OUTPUT,x);
  process.stdout.write('AGENT42_RANK1_HELDOUT '+JSON.stringify({
   summary:x.summary,pairs:x.pairs.map(p=>({
    id:p.id,seed:p.seed,
    samePhysicalOpening:p.samePhysicalOpening,
    identicalControlRoot:p.identicalControlRoot,
    changedNativeRoots:p.changedNativeRoots,
    paidRescues:p.selected.settledSourceFloatStoneRescues,
    replies:p.selected.settledSourceRescuesWithOpponentNonprompt
   }))
  })+'\n');
  assert.equal(x.summary.fullPhysicalDealMatches,16);
  assert.equal(x.summary.identicalRepeatedControlRoots,16);
 }
}
module.exports={REG,BLOB,VERSION,preflight,narrowEvidence,run};
