'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent19-rank5-energy-mix-independent-seat-rng-prospective-seeds-20261105.json');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {classifyNativeAttempt}=require('./agent41-native-attempt-disposition.cjs');
const {auditOriginalEnergyMixShuffleLineages}=
  require('./agent19-original-energy-mix-shuffle-lineage-audit.cjs');
const {withPaperMewEnergyMixShuffle}=
  require('../twinleaf/agent19-energy-mix-shuffle-hook.cjs');
const {withPaperAttachEnergyBlockedTo}=
  require('../twinleaf/agent19-paper-attach-energy-target-guard.cjs');
const {withIndependentSeatRng}=
  require('../twinleaf/agent19-independent-seat-rng.cjs');

const ROOT=path.resolve(__dirname,'../..');
const OUTPUT=path.join(ROOT,'agent19-rank5-independent-seat-rng-prospective-paired-native.json');
const VERSION='agent19-rank5-energy-mix-independent-seat-rng-prospective-seeds-v6';
const REGISTRATION_BLOB='02e45118baf0e660bbd48e0d686df0a7aca00e71';

/** @param {Buffer} bytes @returns {string} */
function gitBlob(bytes){
  return createHash('sha1').update('blob '+bytes.length+'\0').update(bytes)
    .digest('hex');
}
/** @param {unknown} value @returns {string} */
function digest(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
/** @param {object} row @returns {object} */
function diagnostic(row){
  const attacks=row?.sourceAttackSettlement?.attacks;
  const fusion=Array.isArray(attacks)?attacks.filter(x=>
    x.attackName==='Cross Fusion Strike'&&
    x.settledPromptChain===true&&
    x.settlementCrossesClockReset!==true):[];
  return {trialId:row?.trial?.id??null,
    sourceSeat:row?.sourceSeat??null,
    candidateSeat:row?.candidateSeat??null,
    actualStarterSeat:row?.actualStarterSeat??null,
    actualSourceDeal:row?.sourceDealFingerprint??null,
    actualFullDeal:row?.fullPhysicalDealFingerprint??null,
    nativeDisposition:classifyNativeAttempt(row).kind,
    nativeError:row?.error??null,
    sourceCrossFusionSettled: fusion.length,
    settledCopyAttackOrdinals:fusion.map(x=>x.actionOrdinal),
    rootActionCount:row?.rootActionLedger?.length??0,
    rootActionDigest:row?.rootActionLedgerSha256??null,
    sourcePromptSidecarCount:row?.nativeAcceptedEnergyPromptSidecar?.events?.length??null,
    sourceEnergyMixLineage:auditOriginalEnergyMixShuffleLineages(row),
    paperQualified:false,
    competitivelyQualified:false
  };
}

/** Immutable registration before any native match. */
function inspect(){
  const registrationPath=path.join(ROOT,
    'results/aichi-2026/registrations/agent19-rank5-energy-mix-independent-seat-rng-prospective-seeds-20261105.json');
  assert.equal(gitBlob(fs.readFileSync(registrationPath)),REGISTRATION_BLOB);
  assert.equal(registration.schema,
    'agent19-rank5-energy-mix-independent-seat-rng-prospective-seeds-v6');
  assert.deepEqual(registration.modeNames,
    ['guarded-target-control','guarded-target-plus-paper-shuffle']);
  assert.equal(registration.expectedNativeAttempts,32);
  assert.equal(registration.registeredTrials.length,16);
  assert.equal(registration.randomGroups.length,8);
  assert.equal(new Set(registration.randomGroups.map(x=>x.seed)).size,8);
  assert.equal(registration.newReplayNativeOutcomesUnobservedAtRegistration,true);
  assert.equal(gitBlob(fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/agent41-frozen-bilateral-development-v2.json'))),
    registration.frozenPolicyProfileGitBlobSha);
  assert.equal(gitBlob(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'))),
    registration.sourceRosterGitBlobSha);
  // Fail closed if a different common native runner or pinned engine arrives.
  assert.equal(gitBlob(fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/agent41-bilateral-v2-development.cjs'))),
    registration.originalRunnerGitBlobSha);
  for(const [p,sha] of [
    ['simulation/twinleaf/headless.cjs',registration.headlessGitBlobSha],
    ['simulation/twinleaf/agent19-independent-seat-rng.cjs',registration.rngWrapperGitBlobSha]
  ]) assert.equal(gitBlob(fs.readFileSync(path.join(ROOT,p))),sha);
  assert.equal(profile.pinnedVendorRevision,registration.pinnedTwinleaf);
  assert.equal(JSON.stringify(profile.policyOptions.actorOnlyComposition), 'true');
  const source=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const original=source.decks.find(x=>x.rank===5);
  assert.equal(original?.archetype,'Mew Genesect');
  assert.equal(original.cards.reduce((n,x)=>n+x.count,0),60);
  for(const [name,set,number,count] of [
    ['Mew V','FST','113',4],['Mew VMAX','FST','114',3],
    ['Genesect V','FST','185',4],
    ['Double Colorless Energy','SUM','136',4]]){
    const value=original.cards.find(x=>x.name===name&&
      x.printing.set===set&&String(x.printing.number)===number);
    assert.equal(value?.count,count);
  }
  assert.deepEqual(registration.registeredTrials.map(x=>x.id),
    ['5:0:A:champion-reference','5:0:A:new-moon-lockbreaker-v1',
     '5:0:B:champion-reference','5:0:B:new-moon-lockbreaker-v1',
     '5:1:A:champion-reference','5:1:A:new-moon-lockbreaker-v1',
     '5:1:B:champion-reference','5:1:B:new-moon-lockbreaker-v1']);
  for(const row of registration.registeredTrials){
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&row.seed<=0xffffffff);
    assert.equal(row.rank,5);
    assert.ok(registration.candidateIds.includes(row.candidateId));
  }
  return {version:VERSION,manifestBlob:REGISTRATION_BLOB,
    registeredPhysicalSourceGroups:8,attemptedNativeArms:32,
    originalSourceRosterGitBlobSha:registration.sourceRosterGitBlobSha,
    commonPolicyProfileGitBlobSha:registration.frozenPolicyProfileGitBlobSha,
    commonRunnerGitBlobSha:registration.originalRunnerGitBlobSha,
    pinnedNative:profile.pinnedVendorRevision,paperQualified:false,
    competitiveQualifiedGames:0};
}

/** Write native evidence under an exclusive file lock, replacing atomically. */
function saveEvidence(result){
  const lock=OUTPUT+'.lock';
  const file=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    const read=fs.openSync(temp,'r');
    try{fs.fsyncSync(read);}finally{fs.closeSync(read);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(file);fs.unlinkSync(lock);
  }
}

/** @returns {object} Experimental paired source-dealt native result. */
function run(){
  const preflight=inspect();
  const {planAichi}=require('./aichi-pilot.cjs');
  const nativeSource=planAichi(5,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  }).opponents.find(x=>x.rank===5);
  assert.equal(nativeSource?.status,'ready');
  assert.equal(nativeSource.cards.length,60);
  assert.deepEqual(nativeSource.substitutions,[],
    'Original rank5 may not be substituted for a playable proxy');
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const options={...profile.policyOptions,
    ...registration.policySourceCopyFlags,
    nativeRootActionLimit:registration.nativeRootActionLimit,
    registeredTrials:registration.registeredTrials,
    registeredFrameName:VERSION,
    allowAdditionalOriginalSourceRanks:true};
  const ambient='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  assert.equal(process.env[ambient],undefined);
  const previous=process.env[ambient];
  process.env[ambient]='true';
  const modes=[];
  try{
    const rngPacket=withIndependentSeatRng(()=>{
    for(const name of registration.modeNames){
      const useShuffle=name==='guarded-target-plus-paper-shuffle';
      const native=withPaperAttachEnergyBlockedTo(()=>{
        if(!useShuffle)return {result:runDevelopment(options),audit:null};
        return withPaperMewEnergyMixShuffle(()=>runDevelopment(options));
      });
      assert.ok(Array.isArray(native.result.result.rows));
      assert.equal(native.result.result.attempted,16);
      modes.push({name,
        paperMewEnergyMixShuffleEnabled:useShuffle,
        nativeResult:native.result.result,
        targetGuardAudit:native.audit,
        shuffleAudit:native.result.audit,
        diagnostics:native.result.result.rows.map(diagnostic)});
    }
    return null;
    });
    assert.equal(rngPacket.audit.matches,32,
      'All 16 registered native matches must use the isolated protocol');
  }finally{
    if(previous===undefined)delete process.env[ambient];
    else process.env[ambient]=previous;
  }
  const matched=registration.registeredTrials.map(t=>{
    const a=modes[0].diagnostics.find(x=>x.trialId===t.id);
    const b=modes[1].diagnostics.find(x=>x.trialId===t.id);
    assert.ok(a&&b);
    return {trialId:t.id,sourceSeat:a.sourceSeat,
      physicalSourceDeckMatch:Boolean(a.actualSourceDeal&&
        a.actualSourceDeal===b.actualSourceDeal),
      actualStarterMatch:a.actualStarterSeat!==null&&
        a.actualStarterSeat===b.actualStarterSeat,
      nativeDispositions:[a.nativeDisposition,b.nativeDisposition],
      sourceCopySettlements:[a.sourceCrossFusionSettled,b.sourceCrossFusionSettled],
      sourceActionDigestMatch:Boolean(a.rootActionDigest&&
        a.rootActionDigest===b.rootActionDigest),
      sourceFingerprint:[a.actualSourceDeal,b.actualSourceDeal],
      fullPhysicalFingerprint:[a.actualFullDeal,b.actualFullDeal],
      paperQualified:false};
  });
  const summary={version:VERSION,
    independentPhysicalShuffleBySeat:true,
    independentSpeculativePolicyBySeat:true,
    independentCoinRandomness:false,
    registeredPhysicalSourceGroups:8,
    candidatePrintedSixties:registration.candidateIds,
    intendedNativeAttempts:32,observedNativeAttempts:
      modes.reduce((n,m)=>n+m.diagnostics.length,0),
    physicallyMatchedSourcePairs:matched.filter(x=>x.physicalSourceDeckMatch).length,
    matchedActualStarterPairs:matched.filter(x=>x.actualStarterMatch).length,
    byMode:modes.map(m=>({name:m.name,attempts:m.diagnostics.length,
      targetRejected:m.targetGuardAudit.rejected,
      shuffleEvents:m.shuffleAudit?.energyMixEffects??0,
      shufflePromptsCreated:m.shuffleAudit?.shufflePromptsCreated??0,
      shufflePromptsSettled:m.shuffleAudit?.shufflePromptsSettled??0,
      sourceCopySettlements:m.diagnostics.reduce((n,x)=>
        n+x.sourceCrossFusionSettled,0),
      sourceEnergyMixChoices:m.diagnostics.reduce((n,x)=>
        n+(x.sourceEnergyMixLineage.observedChoices??0),0),
      sourceEnergyMixAttachPrompts:m.diagnostics.reduce((n,x)=>
        n+(x.sourceEnergyMixLineage.withPhysicalAttachPrompt??0),0),
      sourceEnergyMixMissingShuffles:m.diagnostics.reduce((n,x)=>
        n+(x.sourceEnergyMixLineage.missingPrintedShuffle??0),0),
      sourceEnergyMixSettledShuffles:m.diagnostics.reduce((n,x)=>
        n+(x.sourceEnergyMixLineage.withPrintedShuffleAfterAttach??0),0),
      sourceEnergyMixUnobservableRows:m.diagnostics.filter(x=>
        x.sourceEnergyMixLineage.status==='UNOBSERVABLE').length,
      dispositions:m.diagnostics.reduce((counts,x)=>{
        counts[x.nativeDisposition]=(counts[x.nativeDisposition]??0)+1;
        return counts;
      },{})})),
    sourceOriginalPrinted60Substitutions:0,
    publishedPrintedSourceRank:5,
    paperQualified:false,
    competitivelyQualifiedGames:0,
    anyWinRateClaim:false,
    retrospectivePolicySelection:true,
    historicalOutcomeSeedSelection:true,
    preregisteredBeforeCurrentReplayNativeOutcomes:true};
  const result={schema:VERSION,registration,preflight,
    policyOptions:options,
    summary,matched,
    rawModes:modes,pinnedVendor:registration.pinnedTwinleaf,
    caveat:'Retrospective selected seeds with new independent physical/policy seat RNG; not an independent field sample. Global coin RNG, paper legality, opponent competence and Aichi clock remain unqualified. Preserve every abort/cap.'};
  saveEvidence(result);
  assert.equal(summary.observedNativeAttempts,32);
  process.stdout.write(JSON.stringify({summary,matched,
    outputPath:path.basename(OUTPUT),
    registrationDigest:digest(registration)},null,2)+'\n');
  return result;
}
if(require.main===module){
  if(process.argv.includes('--inspect-only'))
    process.stdout.write(JSON.stringify(inspect(),null,2)+'\n');
  else run();
}
module.exports={VERSION,inspect,diagnostic,run};
