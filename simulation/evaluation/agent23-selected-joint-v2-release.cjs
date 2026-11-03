'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const {auditSourceCopiedAttacks}=
  require('./agent22-source-copy-choice-audit.cjs');

const ROOT=path.resolve(__dirname,'../..');
const MANIFEST='simulation/evaluation/agent23-selected-joint-v2-manifest.json';
const PINNED_MANIFEST_BLOB='8cd0c4b0734d3223d5c8c1f705f3af651f815c02';
const OUTPUT='agent23-selected-joint-v2-native-52arm.json';
const VIP_ENV='AGENT9_BATTLE_VIP_AFTER_PASS_DEV';
const PAYMENT_ENV='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';

/** @param {string} relative @returns {Buffer} */
function bytes(relative){return fs.readFileSync(path.join(ROOT,relative));}

/** Only accept frozen registration and pinned native source code before play. */
function preflight(){
  assert.equal(gitBlobHash(bytes(MANIFEST)),PINNED_MANIFEST_BLOB,
    'Registered selected profile changed after preregistration');
  const m=JSON.parse(bytes(MANIFEST).toString('utf8'));
  for(const [p,sha] of [
    [m.sourceRunner,m.runnerBlobSha],
    [m.sourceRoster,m.sourceRosterBlobSha],
    [m.actorOnlyVipAdapter,m.actorOnlyVipAdapterBlobSha]
  ])assert.equal(gitBlobHash(bytes(p)),sha,'Source provenance mismatch: '+p);
  assert.equal(m.expectedGroups,13);
  assert.equal(m.expectedContexts,26);
  assert.equal(m.expectedAttempts,52);
  assert.equal(m.uniqueFreshSourceSeedGroups,3);
  assert.equal(m.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(m.modes.map(x=>[x.id,x.ownerVipAfterPass]),[
    ['joint-v1-control',false],
    ['selected-v2-symmetric-vip',true]
  ]);
  assert.equal(m.policyOptions.actorOnlyComposition,true);
  assert.equal(m.policyOptions.actorVipBeforeAttack,true);
  assert.equal(m.policyOptions.actorDceMewMobilityRoot,true);
  assert.equal(m.policyOptions.actorActiveMegaClawPriorityRoot,true);
  assert.equal(m.policyOptions.actorOnlySingleSearch,false);
  assert.equal(m.policyOptions.sourceScopedQuickBallRoot,false);
  assert.equal(m.policyOptions.candidateScopedQuickBallRoot,false);
  assert.equal(m.policyOptions.nativeRootActionLimit,260);
  assert.equal(m.registeredTrials.length,m.expectedContexts);
  const groups=new Map(),seen=new Set();
  for(const row of m.registeredTrials){
    assert.equal(row.id,
      [row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':'));
    assert.ok(!seen.has(row.id),'Duplicate registered context');
    seen.add(row.id);
    assert.ok([5,6,11].includes(row.rank));
    assert.ok(['A','B'].includes(row.candidateSlot));
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&
      row.seed<=0xffffffff);
    const key=[row.rank,row.repeat,row.candidateSlot].join(':');
    const prior=groups.get(key)??{seed:row.seed,candidates:[]};
    assert.equal(prior.seed,row.seed);
    prior.candidates.push(row.candidateId);
    groups.set(key,prior);
  }
  assert.equal(groups.size,m.expectedGroups);
  for(const group of groups.values())assert.deepEqual(
    group.candidates.slice().sort(),
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(m.qualification.competitiveGameQualified,false);
  return m;
}

/**
 * Both-seat native adapter scope. The baseline runs with the owner-VIP root
 * absent; the selected policy runs with that same root enabled for both seats.
 * Every environment mutation is restored even if native play throws.
 * @template T
 * @param {boolean} vip
 * @param {()=>T} fn
 * @returns {T}
 */
function withMode(vip,fn){
  assert.equal(typeof fn,'function');
  const beforeVip=process.env[VIP_ENV];
  const beforePayment=process.env[PAYMENT_ENV];
  assert.ok(beforeVip===undefined||beforeVip==='false',
    'Unexpected ambient VIP override');
  assert.ok(beforePayment===undefined||beforePayment==='false'||
    beforePayment==='true','Unexpected payment receipt override');
  if(vip)process.env[VIP_ENV]='true';
  else delete process.env[VIP_ENV];
  process.env[PAYMENT_ENV]='true';
  try{return fn();}
  finally{
    if(beforeVip===undefined)delete process.env[VIP_ENV];
    else process.env[VIP_ENV]=beforeVip;
    if(beforePayment===undefined)delete process.env[PAYMENT_ENV];
    else process.env[PAYMENT_ENV]=beforePayment;
  }
}

/** @param {object} row @returns {object} */
function conciseSource(row){
  const led=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const sourceSeat=row.sourceSeat??(row.trial?.candidateSlot==='A'?1:0);
  const sourceRoots=led.filter(x=>x.playerSlot===sourceSeat);
  const nativeCopies=Array.isArray(row.sourceAttackSettlement?.attacks)?
    auditSourceCopiedAttacks(row):null;
  const vip=sourceRoots.filter(x=>x.action==='PlayCardAction'&&
    typeof x.card==='string'&&x.card.startsWith('Battle VIP Pass'));
  const attackSettlements=row.sourceAttackSettlement?.attacks??[];
  return {
    trialId:row.trial?.id??null,sourceSeat,
    physicalSourceDeal:row.sourceDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    fullRootLedgerSha256:row.rootActionLedgerSha256??null,
    nativeStatus:row.status??null,nativeEndReason:row.endReason??null,
    nativeFinished:row.finished??null,
    actionCount:row.actionCount??null,finalPrizes:row.finalPrizes??null,
    sourceVipCount:vip.length,sourceVipOrdinals:vip.map(x=>x.actionOrdinal),
    sourceNativeAttackCount:attackSettlements.length,
    sourceCopiedAttackChoices:nativeCopies,
    sourceNativeAttackSettlements:attackSettlements,
    sourceNaturalEvolutionCount:sourceRoots.filter(x=>
      x.action==='PlayCardAction'&&
      typeof x.card==='string'&&
      /Mew VMAX|Mega Absol ex|Garbodor/.test(x.card)).length,
    firstSourceOwnedAction:sourceRoots[0]??null,
    nativeError:row.error??null,
    paperRuleCertified:false,opponentPolicyCertified:false,
    paperClockMeasured:false,competitivelyQualified:false
  };
}

/**
 * 26 preregistered candidate/source/seat contexts in frozen original-v1
 * control and one selected symmetric owner-only VIP variation.
 * @param {(opts:object)=>object} [runner] Actual pinned native runner.
 * @returns {object} Complete failure-retaining source evidence.
 */
function runRelease(runner=require('./agent41-bilateral-v2-development.cjs')
  .runDevelopment){
  const manifest=preflight();
  assert.equal(typeof runner,'function');
  const modes=[];
  for(const mode of manifest.modes){
    const options={...manifest.policyOptions,
      registeredTrials:manifest.registeredTrials,
      registeredFrameName:'agent23-selected-joint-v2-'+mode.id};
    const result=withMode(mode.ownerVipAfterPass,()=>runner(options));
    assert.equal(result.attempted,manifest.expectedContexts,
      'A registered context was not executed');
    assert.deepEqual(result.rows.map(x=>x.trial.id),
      manifest.registeredTrials.map(x=>x.id),
      'Runner omitted or shuffled a source context');
    modes.push({id:mode.id,vipEnabled:mode.ownerVipAfterPass,
      rows:result.rows.map(conciseSource),native:result});
  }
  const comparison=manifest.registeredTrials.map((trial,i)=>{
    const baseline=modes[0].rows[i],selected=modes[1].rows[i];
    const physicalMatch=typeof baseline.physicalSourceDeal==='string'&&
      baseline.physicalSourceDeal.length>0&&
      baseline.physicalSourceDeal===selected.physicalSourceDeal;
    const starterMatch=baseline.actualStarterSeat!=null&&
      baseline.actualStarterSeat===selected.actualStarterSeat;
    return {trial,originalSourceDealMatch:physicalMatch,
      realStarterMatch:starterMatch,
      originalSourceRank:trial.rank,
      originalSourceSeat:trial.candidateSlot==='A'?1:0,
      originalRank5CopyChoiceCounts:[
        baseline.sourceCopiedAttackChoices?.selectedGenesectTechnoBlast??0,
        selected.sourceCopiedAttackChoices?.selectedGenesectTechnoBlast??0
      ],
      originalRank5EnergyMixCounts:[
        baseline.sourceCopiedAttackChoices?.selectedMewEnergyMix??0,
        selected.sourceCopiedAttackChoices?.selectedMewEnergyMix??0
      ],
      sourceVipAccepted:[baseline.sourceVipCount,selected.sourceVipCount],
      sourceNativeAttackCounts:[baseline.sourceNativeAttackCount,
        selected.sourceNativeAttackCount],
      originalNativeStatus:[baseline.nativeStatus,selected.nativeStatus],
      originalNativeEndReason:[baseline.nativeEndReason,selected.nativeEndReason],
      bothFullRootLedgersIdentical:baseline.fullRootLedgerSha256!=null&&
        baseline.fullRootLedgerSha256===selected.fullRootLedgerSha256};
  });
  return {
    schema:'agent23-selected-symmetric-joint-v2-native-source-audit-v1',
    selectedManifestGitBlobSha:PINNED_MANIFEST_BLOB,
    pinnedVendorGitRevision:manifest.enginePin,
    attemptCount:manifest.expectedAttempts,
    candidateContexts:manifest.expectedContexts,
    groups:manifest.expectedGroups,
    trulyFreshSourceSeedGroups:manifest.uniqueFreshSourceSeedGroups,
    matchedSourcePhysicalDeals:comparison.filter(x=>
      x.originalSourceDealMatch&&x.realStarterMatch).length,
    allControlsMatched:comparison.every(x=>
      x.originalSourceDealMatch&&x.realStarterMatch),
    modes,comparison,originalSourcePrintingsCovered:[5,6,11],
    originalSourceSixtiesAuthenticated:true,
    originalMissingRanks:[23,25,28],
    competitivelyQualifiedGames:0,paperMatchClockMeasured:false,
    sourceAndCandidatePoliciesFullyCompetent:false,
    certifiedFieldWinRate:null
  };
}

/**
 * Tiny file-borne mutex plus same-directory temporary rename. The file write
 * either commits a complete archive or leaves the old destination untouched.
 * @param {string} target Relative artifact path.
 * @param {object} value JSON archive to persist.
 */
function writeAtomicLocked(target,value){
  const file=path.resolve(ROOT,target);
  assert.equal(path.dirname(file),ROOT,
    'Research archive must stay in the repository working directory');
  const lock=file+'.lock',tmp=file+'.'+randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n',
      {encoding:'utf8',flag:'wx'});
    fs.renameSync(tmp,file);
  }finally{
    fs.closeSync(fd);
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.unlinkSync(lock);
  }
}

if(require.main===module){
  const result=runRelease();
  writeAtomicLocked(OUTPUT,result);
  process.stdout.write('SELECTED_JOINT_V2 '+JSON.stringify({
    attemptCount:result.attemptCount,contexts:result.candidateContexts,
    matchedPhysical:result.matchedSourcePhysicalDeals,
    selectedRootVipOriginalSourceTotal:result.modes[1].rows.reduce(
      (n,x)=>n+x.sourceVipCount,0),
    selectedOriginalRank5TechnoBlast:result.modes[1].rows
      .filter(x=>x.trialId?.startsWith('5:'))
      .reduce((n,x)=>n+(x.sourceCopiedAttackChoices?.
        selectedGenesectTechnoBlast??0),0),
    baselineOriginalRank5TechnoBlast:result.modes[0].rows
      .filter(x=>x.trialId?.startsWith('5:'))
      .reduce((n,x)=>n+(x.sourceCopiedAttackChoices?.
        selectedGenesectTechnoBlast??0),0),
    competitivelyQualifiedGames:0
  })+'\n');
}
module.exports={preflight,withMode,conciseSource,runRelease,writeAtomicLocked};
