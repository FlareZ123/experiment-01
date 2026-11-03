'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {effectiveOptions,withSameRuntime}=require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {compareSafely}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {completeSourceToolAttackChains,maxGeist}=require('./agent31-floatstone-heldout-provenance.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent42-selected-v3-known-witness-retrospective-20261103.json';
const BLOB='8b7f7dfd271937fc613d277f03941dda663734ff';
const OUTPUT='agent42-selected-v3-known-witness-transport-native-12.json';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION='agent42-selected-v3-known-witness-retrospective-transport-v1';
const raw=p=>fs.readFileSync(path.join(ROOT,p));
/** Check previously sealed seed, profile, source files, and symmetric modes. */
function preflight(){
  assert.equal(gitBlobHash(raw(REG)),BLOB);
  const m=JSON.parse(raw(REG).toString('utf8'));
  assert.equal(m.schema,'agent42-selected-v3-20261103-historical-natural-floatstone-transport-v1');
  assert.equal(m.pinnedTwinleafRevision,PIN);
  assert.equal(m.expectedContexts,4);
  assert.equal(m.expectedAttempts,12);
  assert.equal(m.actionCap,180);
  assert.equal(m.frozenWitness.seed,1122744069);
  assert.equal(m.frozenWitness.priorRun,41692878040);
  assert.equal(gitBlobHash(raw(m.baseSelectedV3Manifest)),
    m.baseSelectedV3ManifestGitBlob);
  for(const x of m.currentIntegrationSourceBlobs)
    assert.equal(gitBlobHash(raw(x.path)),x.blob,
      'Frozen transport source drift '+x.path);
  const grouped=new Map();
  for(const t of m.trials){
    assert.equal(t.rank,1);
    assert.equal(t.seed,1122744069);
    assert.equal(t.repeat,420);
    assert.ok(['A','B'].includes(t.candidateSlot));
    assert.equal(t.id,[t.rank,t.repeat,t.candidateSlot,t.candidateId].join(':'));
    const arr=grouped.get(t.candidateSlot)??[];
    arr.push(t.candidateId);grouped.set(t.candidateSlot,arr);
  }
  assert.equal(grouped.size,2);
  for(const members of grouped.values())
    assert.deepEqual(members.sort(),
      ['champion-reference','new-moon-lockbreaker-v1'].sort());
  assert.deepEqual(m.modes.map(x=>[
    x.id,x.ownerGenericTrainerFrontier,x.actorFundedShadowRiderFloatStoneRoot]),
    [['corrected-bilateral-control-a',false,false],
     ['selected-v3-paper-plus-funded-mobility',true,true],
     ['corrected-bilateral-control-b',false,false]]);
  assert.equal(m.selectedV3CommonPolicy.actorOnlyComposition,true);
  assert.equal(m.selectedV3CommonPolicy.nativeRootActionLimit,180);
  return m;
}
/** Only summarize accepted genuine Store source actions. */
function narrow(row){
  const seat=row.trial.candidateSlot==='A'?1:0;
  const owner=(row.rootActionLedger??[]).filter(x=>x.playerSlot===seat);
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{};
  return {id:row.trial.id,sourceSeat:seat,
    status:row.status??null,error:row.error??null,
    sourcePhysicalDeal:row.sourceDealFingerprint??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    rootHash:row.rootActionLedgerSha256??null,
    sourceAcceptedRoots:owner.length,
    sourceFloatStoneRoots:owner.filter(x=>x.action==='PlayCardAction'&&
      (x.card==='Float Stone'||x.card?.startsWith('Float Stone '))).length,
    sourceRetreatRoots:owner.filter(x=>x.action==='RetreatAction').length,
    sourceMaxGeistRoots:maxGeist(row,seat),
    paidToolRetreatAttackChains:completeSourceToolAttackChains(row,seat),
    selectedFundedStoneIntents:root.fundedVmaxFloatStoneRootSelected??0,
    paperQualifiedGames:0};
}
/** Execute A/B/A on the exact previously positive source seed in both physical seats. */
function run(){
  const m=preflight();
  const vendor=execFileSync('git',['rev-parse','HEAD'],{
    cwd:path.join(ROOT,'vendor/twinleaf'),encoding:'utf8'}).trim();
  assert.equal(vendor,PIN);
  const modes=[];
  for(const mode of m.modes){
    const options=effectiveOptions({
      commonPolicy:m.selectedV3CommonPolicy,
      nativeActionCap:m.actionCap,registeredTrials:m.trials
    },mode);
    options.registeredFrameName=VERSION+':'+mode.id;
    const fullNative=withSameRuntime(()=>runDevelopment(options));
    assert.equal(fullNative.attempted,4);
    assert.deepEqual(fullNative.rows.map(x=>x.trial.id),
      m.trials.map(x=>x.id));
    modes.push({id:mode.id,fullNative,rows:fullNative.rows.map(narrow),
      paperObservationEnabled:mode.ownerGenericTrainerFrontier,
      fundedFloatStoneEnabled:mode.actorFundedShadowRiderFloatStoneRoot});
  }
  const [control,selected,repeat]=modes;
  const ab=compareSafely(control.fullNative.rows,selected.fullNative.rows);
  const ac=compareSafely(control.fullNative.rows,repeat.fullNative.rows);
  const pairs=m.trials.map((t,i)=>{
    const a=control.rows[i],b=selected.rows[i],c=repeat.rows[i];
    return {id:t.id,sourceSeat:a.sourceSeat,
      controlSelectedSameDeal:ab[i].sameSeed&&ab[i].sameSourceDeal&&
        ab[i].sameFullDeal&&ab[i].sameStart,
      controlRepeatSameDeal:ac[i].sameSeed&&ac[i].sameSourceDeal&&
        ac[i].sameFullDeal&&ac[i].sameStart,
      controlsIdentical:a.rootHash!==null&&a.rootHash===c.rootHash&&
        a.status===c.status,
      selectedChangedRoot:a.rootHash!==b.rootHash,
      control:a,selected:b,repeat:c};
  });
  const summary={contexts:4,attempts:12,
    matchedControlSelectedDeals:pairs.filter(p=>p.controlSelectedSameDeal).length,
    matchedControlRepeatDeals:pairs.filter(p=>p.controlRepeatSameDeal).length,
    identicalControlReplays:pairs.filter(p=>p.controlsIdentical).length,
    selectedChangedRootPairs:pairs.filter(p=>p.selectedChangedRoot).length,
    selectedFundedStoneIntents:pairs.reduce((n,p)=>
      n+p.selected.selectedFundedStoneIntents,0),
    selectedSourcePaidToolRetreatMaxGeistChains:pairs.reduce((n,p)=>
      n+p.selected.paidToolRetreatAttackChains,0),
    engineErrorsByMode:modes.map(x=>({id:x.id,
      count:x.rows.filter(r=>r.status==='engine-error').length})),
    paperQualifiedGames:0};
  return {schema:VERSION,registeredPath:REG,registeredBlob:BLOB,
    evidenceClass:'Historical observed positive seed, retrospective only',
    historicalWitnessRun:m.frozenWitness.priorRun,
    pinnedVendor:vendor,runtimeHead:process.env.GITHUB_SHA??null,
    note:'No independent win-rate, match clock, or opponent quality certification',
    summary,pairs,modes};
}
if(require.main===module){
  if(process.argv.includes('--preflight')){
    const m=preflight();process.stdout.write('AGENT42_V3_TRANSPORT_PREFLIGHT '+
      JSON.stringify({blob:BLOB,trials:m.trials.map(t=>t.id)})+'\n');
  }else{
    const x=run();
    const {writeAtomicLocked}=require('./agent23-selected-joint-v2-release.cjs');
    writeAtomicLocked(OUTPUT,x);
    process.stdout.write('AGENT42_V3_TRANSPORT '+
      JSON.stringify({summary:x.summary,pairs:x.pairs})+'\n');
    assert.equal(x.summary.matchedControlSelectedDeals,4);
    assert.equal(x.summary.matchedControlRepeatDeals,4);
  }
}
module.exports={REG,BLOB,VERSION,preflight,narrow,run};
