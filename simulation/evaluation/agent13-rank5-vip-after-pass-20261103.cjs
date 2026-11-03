'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const {writeAtomicLocked}=require('./agent13-rank5-joint-transport-20261103.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent13-rank5-vip-after-pass-20261103.json';
const BASE='simulation/evaluation/agent41-joint-source-r5-r11-v1.json';
const EXEC='simulation/evaluation/agent41-bilateral-v2-development.cjs';
const COMPOSE='simulation/evaluation/agent7-canonical-actor-composition.cjs';
const ADAPTER='simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs';
const REG_BLOB='5814b458588177fff798928798c333ea4cd4f35e';
const OUTPUT='agent13-rank5-vip-after-pass-8arm.json';
const ENV='AGENT9_BATTLE_VIP_AFTER_PASS_DEV';

/** @param {string} p @returns {Buffer} */
const bytes=p=>fs.readFileSync(path.join(ROOT,p));

/** Read and attest immutable pre-outcome source identity, adapter and trial plan. */
function preflight(){
  assert.equal(gitBlobHash(bytes(REG)),REG_BLOB,'Registered contrast has changed');
  const r=JSON.parse(bytes(REG).toString('utf8'));
  const base=JSON.parse(bytes(BASE).toString('utf8'));
  assert.equal(gitBlobHash(bytes(BASE)),r.baselineJointV1BlobSha);
  assert.equal(gitBlobHash(bytes(EXEC)),r.nativeRunnerGitBlobSha);
  assert.equal(gitBlobHash(bytes(COMPOSE)),r.actorCompositionGitBlobSha);
  assert.equal(gitBlobHash(bytes(ADAPTER)),r.ownerVipAfterPassAdapterGitBlobSha);
  assert.equal(base.pinnedVendor,r.nativeEngineGitRevision);
  assert.equal(r.registeredAttempts,8);
  const trials=base.registeredTrials.filter(x=>x.rank===5);
  const registered=r.registeredSourceGroups.flatMap(g=>
    r.candidateIds.map(candidateId=>({...g,candidateId,
      id:[g.rank,g.repeat,g.candidateSlot,candidateId].join(':')})));
  assert.deepEqual(trials,registered);
  assert.deepEqual(r.modes.map(m=>[m.id,m.ownerVipAfterPassEnvironment]),[
    ['joint_v1_control',false],['symmetric_vip_after_pass',true]
  ]);
  assert.equal(base.policyOptions.actorOnlyComposition,true);
  assert.equal(base.policyOptions.actorVipBeforeAttack,true);
  assert.equal(base.policyOptions.nativeRootActionLimit,r.maxActions);
  return {registration:r,base,trials};
}

/**
 * Change only the documented existing owner-VIP policy toggle in an auditable
 * synchronous scope; always restore the process environment after execution.
 * @template T
 * @param {boolean} enabled
 * @param {()=>T} run
 * @returns {T}
 */
function withSelectedVipMode(enabled,run){
  assert.equal(typeof run,'function');
  const before=process.env[ENV];
  assert.ok(before===undefined||before==='false',
    'Unexpected ambient owner VIP policy override');
  if(enabled)process.env[ENV]='true';
  else delete process.env[ENV];
  try{return run();}finally{
    if(before===undefined)delete process.env[ENV];
    else process.env[ENV]=before;
  }
}

/** @param {object} row @returns {object} */
function actualSourceWitness(row){
  const sourceSeat=row.trial.candidateSlot==='A'?1:0;
  const source=Array.isArray(row.rootActionLedger)?
    row.rootActionLedger.filter(r=>r.playerSlot===sourceSeat):[];
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits||{};
  const vip=audit.ownerVipAfterPass||null;
  const copied=audit.chooseAttack?.selections||[];
  const sourceVipRoots=source.filter(r=>r.action==='PlayCardAction'&&
    typeof r.card==='string'&&r.card.startsWith('Battle VIP Pass'));
  const sourceEvolutions=source.filter(r=>r.action==='PlayCardAction'&&
    typeof r.card==='string'&&r.card.startsWith('Mew VMAX'));
  const srcAttack=row.attackDeclarations?.source??null;
  return {
    nativeStatus:row.status??null,
    nativeFinished:row.finished??null,
    nativeEndReason:row.endReason??null,
    nativeActionCount:row.actionCount??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    completeNativeRootLedgerSha256:row.rootActionLedgerSha256??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceFirstOwnHand:row.sourceFirstOwnedAffordances??null,
    sourceVipRootPlayReceipts:sourceVipRoots,
    sourceVmaxEvolutions:sourceEvolutions,
    sourceCopiedTechnoBlast:copied.filter(x=>x.seat===sourceSeat&&
      x.printing==='Genesect V FST'&&x.attack==='Techno Blast'),
    sourceAttackDeclarations:srcAttack,
    sourceSettlement:row.sourceAttackSettlement??null,
    originalSourceVipPolicyAudit:vip?{
      enabled:true,
      proposedItems:vip.proposedItems,
      acceptedItems:vip.acceptedItems,
      rejectedItems:vip.rejectedItems,
      acceptedSearches:vip.acceptedSearches,
      rejectedSearches:vip.rejectedSearches,
      nativeBenchConfirmed:vip.nativeBenchConfirmed,
      nativeEmptySearchConfirmed:vip.nativeEmptySearchConfirmed,
      sourceSeatNativeItems:vip.bySeat?.[sourceSeat]?.items??null,
      sourceSeatNativeSearches:vip.bySeat?.[sourceSeat]?.searches??null,
      sourceSeatBenchConfirmed:vip.bySeat?.[sourceSeat]?.benchConfirmed??null,
      originalPassBySeat:vip.originalPassBySeat??null,
      passOpportunities:vip.passOpportunities??[],
      firstTurnRootContentions:vip.firstTurnRootContentions??[],
      examples:vip.examples??[]
    }:null,
    nativeError:row.error??null,
    paperCompetingLinesCertified:false,competitiveGameQualified:false
  };
}

/**
 * Execute exactly four original-source physical deals in each symmetric mode.
 * Native raw rows are retained alongside concise postchoice action evidence.
 * @param {Function} run Native development executor, optional pure-test injection.
 * @returns {object}
 */
function runRelease(run=require('./agent41-bilateral-v2-development.cjs').runDevelopment){
  const {registration,base,trials}=preflight();
  assert.equal(typeof run,'function');
  const modes=[];
  for(const mode of registration.modes){
    const opts={...base.policyOptions,registeredTrials:trials,
      registeredFrameName:'agent13-rank5-vip-afterpass-'+mode.id};
    const native=withSelectedVipMode(mode.ownerVipAfterPassEnvironment,
      ()=>run(opts));
    assert.equal(native.attempted,4);
    assert.deepEqual(native.rows.map(row=>row.trial.id),
      trials.map(row=>row.id));
    modes.push({name:mode.id,envEnabled:mode.ownerVipAfterPassEnvironment,
      rows:native.rows.map(actualSourceWitness),native});
  }
  const physicalComparison=trials.map((trial,index)=>{
    const a=modes[0].rows[index],b=modes[1].rows[index];
    const identical=typeof a.sourceDealFingerprint==='string'&&
      a.sourceDealFingerprint.length>0&&
      a.sourceDealFingerprint===b.sourceDealFingerprint;
    return {trial,sourcePhysicalDeal:identical?'EXACT_SOURCE_DEAL_MATCH':
      'UNVERIFIED_OR_DIFFERENT',control:a,treatment:b,
      rootLedgerIdentical:a.completeNativeRootLedgerSha256!=null&&
      a.completeNativeRootLedgerSha256===b.completeNativeRootLedgerSha256};
  });
  return {schema:'agent13-rank5-owner-vip-pass-native-v1',
    registrationGitBlobSha:REG_BLOB,
    baseGitBlobSha:registration.baselineJointV1BlobSha,
    vendorPin:registration.nativeEngineGitRevision,
    modes,physicalComparison,attempts:8,
    sourceIdenticalPairs:physicalComparison.filter(x=>
      x.sourcePhysicalDeal==='EXACT_SOURCE_DEAL_MATCH').length,
    newIndependentGameTrials:0,
    competitiveQualifiedGames:0,
    paperClockQualified:false,target995Verified:false,
    caveat:'Retrospective native source policy capability check; no tournament-performance inference.'};
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {registration,trials}=preflight();
    process.stdout.write(JSON.stringify({mode:'NO_NATIVE_EXECUTION',
      registrationGitBlobSha:REG_BLOB,registeredAttempts:8,
      trials,modes:registration.modes,competitiveQualifiedGames:0},null,2)+'\n');
  }else{
    const full=runRelease();
    writeAtomicLocked(OUTPUT,full);
    process.stdout.write(JSON.stringify({output:OUTPUT,attempts:full.attempts,
      matched:full.sourceIdenticalPairs,
      pairs:full.physicalComparison.map(x=>({id:x.trial.id,
        physical:x.sourcePhysicalDeal,
        sourceVipRoots:[x.control.sourceVipRootPlayReceipts.length,
          x.treatment.sourceVipRootPlayReceipts.length],
        sourceAttacks:[x.control.sourceAttackDeclarations,
          x.treatment.sourceAttackDeclarations],
        rootSequenceSame:x.rootLedgerIdentical,
        controlStatus:x.control.nativeEndReason,
        treatmentStatus:x.treatment.nativeEndReason
      })),competitiveQualifiedGames:0},null,2)+'\n');
  }
}
module.exports={preflight,withSelectedVipMode,
  actualSourceWitness,runRelease};
