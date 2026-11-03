'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const {writeAtomicLocked}=require('./agent13-rank5-joint-transport-20261103.cjs');
const {actualSourceWitness,withSelectedVipMode}=
  require('./agent13-rank5-vip-after-pass-20261103.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent13-rank5-vip-quickball-20261103.json';
const PROFILE='simulation/evaluation/agent41-joint-source-r5-r11-v1.json';
const PIN={
  baseRunner:'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  actor:'simulation/evaluation/agent7-canonical-actor-composition.cjs',
  quickBall:'simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs',
  ownerSearch:'simulation/twinleaf/agent41-actor-owner-single-search.cjs',
  ownerDiscard:'simulation/twinleaf/agent47-actor-hand-discard.cjs',
  vip:'simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs'
};
const REG_BLOB='d791af24530cdae268dee24bdc9d87371b1374bb';
const OUTPUT='agent13-rank5-vip-quickball-12arm.json';
const Q_ENV='AGENT8_ACTOR_QUICK_BALL_DEV';
const read=file=>fs.readFileSync(path.join(ROOT,file));

/** Check exact before-outcome source profile and selected research code bytes. */
function preflight(){
  assert.equal(gitBlobHash(read(REG)),REG_BLOB);
  const reg=JSON.parse(read(REG).toString('utf8'));
  const base=JSON.parse(read(PROFILE).toString('utf8'));
  const selected=[
    [PROFILE,reg.baseProfileGitBlobSha],
    [PIN.baseRunner,reg.baseRunnerGitBlobSha],
    [PIN.actor,reg.canonicalActorGitBlobSha],
    [PIN.quickBall,reg.quickBallRootAdapterGitBlobSha],
    [PIN.ownerSearch,reg.quickBallOwnerSearchGitBlobSha],
    [PIN.ownerDiscard,reg.quickBallOwnerDiscardGitBlobSha],
    [PIN.vip,reg.vipAdapterGitBlobSha]
  ];
  for(const [file,expected] of selected)
    assert.equal(gitBlobHash(read(file)),expected,'Frozen code mismatch: '+file);
  assert.equal(base.pinnedVendor,reg.pinnedVendor);
  assert.equal(reg.expectedNativeAttempts,12);
  assert.equal(base.policyOptions.actorOnlyComposition,true);
  assert.equal(base.policyOptions.nativeRootActionLimit,reg.rootCap);
  assert.ok(base.policyOptions.actorVipBeforeAttack);
  assert.equal(base.policyOptions.actorOnlySingleSearch,false);
  assert.equal(base.policyOptions.actorHandDiscard,false);
  assert.equal(reg.modes.length,3);
  assert.deepEqual(reg.modes.map(x=>[x.quickBallRoot,
    x.ownerSingleSearch,x.actorHandDiscard]),
    [[false,false,false],[true,false,false],[true,true,true]]);
  const groups=base.registeredTrials.filter(x=>x.rank===5);
  const selectedTrials=reg.sourceGroups.flatMap(s=>reg.candidateIds.map(
    candidateId=>({...s,candidateId,
      id:[s.rank,s.repeat,s.candidateSlot,candidateId].join(':')})));
  assert.deepEqual(groups,selectedTrials);
  return {reg,base,trials:groups};
}

/**
 * A genuine both-seat owner root option already provided in the canonical
 * adapter; scope the exact available environment flag without leaking it.
 * @template T
 * @param {boolean} enabled
 * @param {()=>T} run
 * @returns {T}
 */
function withSelectedQuickBallMode(enabled,run){
  assert.equal(typeof run,'function');
  const prior=process.env[Q_ENV];
  assert.ok(prior===undefined||prior==='false',
    'Ambient unknown Quick Ball policy makes an experiment unrepeatable');
  if(enabled)process.env[Q_ENV]='true';else delete process.env[Q_ENV];
  try{return run();}finally{
    if(prior===undefined)delete process.env[Q_ENV];
    else process.env[Q_ENV]=prior;
  }
}

/** @param {object} row @returns {object} */
function sourceEvidence(row){
  const base=actualSourceWitness(row);
  const sourceSeat=row.trial.candidateSlot==='A'?1:0;
  const roots=Array.isArray(row.rootActionLedger)?
    row.rootActionLedger.filter(r=>r.playerSlot===sourceSeat):[];
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits||{};
  const root=audit.root||{};
  const ownerSearch=audit.ownerSearch||null;
  const handDiscard=audit.handDiscard||null;
  return {
    ...base,
    sourceQuickBallRoots:roots.filter(r=>r.action==='PlayCardAction'&&
      typeof r.card==='string'&&r.card.startsWith('Quick Ball')),
    sourceOtherTrainerRoots:roots.filter(r=>r.action==='PlayCardAction'&&
      typeof r.card==='string'&&
      /(?:Ultra Ball|Trainer|VS Seeker|Special Red|Secret Box|Field Blower|Path to the Peak|Sky Field|Marnie|Guzma|Wally)/i.test(r.card)),
    actorQuickBallRootEnabled:root.quickBallRootOptIn??null,
    actorQuickBallRootOwnerSeat:root.quickBallRootOwnerSeat??null,
    selectedOwnerRootDecisions:root.selectedRootDecisions??null,
    ownerSearchPromptAudit:ownerSearch,
    ownerHandDiscardPromptAudit:handDiscard,
    nativeQuickBallOwnerTransactions:row.nativeQuickBallOwnerTransactions??null,
    competitiveGameQualified:false
  };
}

/**
 * Run all three independent source policy arms on each original frozen deal.
 * @param {Function} run Recorded native runner or pure-test injected function.
 * @returns {object}
 */
function runRelease(run=require('./agent41-bilateral-v2-development.cjs').runDevelopment){
  const {reg,base,trials}=preflight();
  assert.equal(typeof run,'function');
  const modes=reg.modes.map(mode=>{
    const opts={...base.policyOptions,
      actorOnlySingleSearch:mode.ownerSingleSearch,
      actorHandDiscard:mode.actorHandDiscard,
      registeredTrials:trials,
      registeredFrameName:'agent13-rank5-vip-quickball-'+mode.id};
    const native=withSelectedQuickBallMode(mode.quickBallRoot,
      ()=>withSelectedVipMode(mode.vipAfterPass,()=>run(opts)));
    assert.equal(native.attempted,4);
    assert.deepEqual(native.rows.map(x=>x.trial.id),trials.map(x=>x.id));
    return {id:mode.id,configuration:mode,native,
      evidence:native.rows.map(sourceEvidence)};
  });
  const comparisons=trials.map((trial,i)=>{
    const e=modes.map(m=>({mode:m.id,...m.evidence[i]}));
    const fingerprints=e.map(x=>x.sourceDealFingerprint);
    return {trial,sourcePhysical:(
      fingerprints.every(x=>typeof x==='string'&&x.length>0)&&
      new Set(fingerprints).size===1)?
      'EXACT_SOURCE_DEAL_MATCH':'UNVERIFIED_OR_DIFFERENT',evidence:e};
  });
  return {schema:'agent13-rank5-vip-quickball-native-twelvearm-v1',
    preregistrationGitBlobSha:REG_BLOB,
    sourceProfileBlobSha:reg.baseProfileGitBlobSha,
    nativeRunnerBlobSha:reg.baseRunnerGitBlobSha,
    vendorRevision:reg.pinnedVendor,attempts:12,
    registeredSourcePhysicalDeals:4,
    matchedSourcePhysicalDeals:comparisons.filter(x=>
      x.sourcePhysical==='EXACT_SOURCE_DEAL_MATCH').length,
    modes,comparisons,
    sourceOriginalPrinted60Sha256:reg.originalPrintedSource60Sha256,
    qualifiedCompetitiveGames:0,target995Demonstrated:false,
    caveat:'Only native original-source development evidence. Symmetric source/candidate policy, no paper clock, no competitive win inference.'};
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {reg,trials}=preflight();
    process.stdout.write(JSON.stringify({mode:'NO_NATIVE_EXECUTION',
      regBlob:REG_BLOB,trials,policies:reg.modes,
      expectedNativeAttempts:reg.expectedNativeAttempts,
      qualifiedCompetitiveGames:0},null,2)+'\n');
  }else{
    const result=runRelease();
    writeAtomicLocked(OUTPUT,result);
    process.stdout.write(JSON.stringify({output:OUTPUT,attempts:result.attempts,
      sameDeal:result.matchedSourcePhysicalDeals,
      comparisons:result.comparisons.map(x=>({id:x.trial.id,
        physical:x.sourcePhysical,
        modes:x.evidence.map(y=>({mode:y.mode,
          quickBallRootEnabled:y.actorQuickBallRootEnabled,
          sourceQuickBallPlays:y.sourceQuickBallRoots.length,
          sourceVipPlays:y.sourceVipRootPlayReceipts.length,
          sourceAttackDeclarations:y.sourceAttackDeclarations,
          sourceCopySelections:y.sourceCopiedTechnoBlast.length,
          endReason:y.nativeEndReason
        }))})),
      qualifiedCompetitiveGames:0},null,2)+'\n');
  }
}
module.exports={REG_BLOB,preflight,withSelectedQuickBallMode,
  sourceEvidence,runRelease};
