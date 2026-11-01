'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {gitBlobHash}=
  require('./agent42-strict-profile-preflight.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {compareRows,writeJsonAtomically}=
  require('./agent8-rank15-movement-root-paired-development.cjs');
const {statuses,gateReceipt}=
  require('./agent8-rank15-effective-aor-item-replay.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION=
  'results/aichi-2026/registrations/agent8-rank15-effective-aor-item-fresh-native-20261101.json';
const REGISTRATION_BLOB='ab05d764508c03273bf30184a37b61b7ced0abd5';
const OUTPUT='agent8-rank15-effective-aor-item-fresh-native';
const VERSION='agent8-effective-aor-item-fresh-registered-paired-v1';
const ORIGINAL_SEEDS=new Set([
  1658736708,964534281,2617754130,1771076384,
  550503645,1664089330,2162090110,4165549731
]);

/** Validate immutable, previously unseen CSPRNG seed tranche preflight. */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  assert.equal(gitBlobHash(bytes),REGISTRATION_BLOB,
    'Fresh rank15 native Item-veto registration bytes have changed');
  const registration=JSON.parse(bytes.toString('utf8'));
  assert.equal(registration.schema,
    'agent8-rank15-effective-aor-item-fresh-native-20261101-v1');
  assert.equal(registration.sourceRank,15);
  assert.equal(registration.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const pin=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(pin,registration.enginePin);
  const roster=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'));
  assert.equal(gitBlobHash(roster),
    registration.originalSourceRosterBlobSha);
  const originalSource=JSON.parse(roster.toString('utf8'))
    .decks.find(row=>row.rank===15);
  assert.ok(originalSource);
  assert.equal(originalSource.cards.reduce((n,c)=>n+c.count,0),60);
  const groups=registration.seeds.A.concat(registration.seeds.B);
  assert.equal(groups.length,8);
  assert.equal(new Set(groups).size,8);
  assert.ok(groups.every(seed=>Number.isSafeInteger(seed)&&
    seed>=0&&seed<=0xffffffff&&!ORIGINAL_SEEDS.has(seed)),
    'Only eight independently registered unseen unsigned seeds may be used');
  assert.equal(registration.trials.length,16);
  for(const slot of ['A','B']){
    for(let i=0;i<4;i++){
      for(const candidateId of registration.candidateIds){
        const id=`15:${i}:${slot}:${candidateId}`;
        const found=registration.trials.filter(row=>row.id===id);
        assert.equal(found.length,1);
        assert.equal(found[0].rank,15);
        assert.equal(found[0].candidateSlot,slot);
        assert.equal(found[0].candidateId,candidateId);
        assert.equal(found[0].repeat,i);
        assert.equal(found[0].seed,registration.seeds[slot][i]);
      }
    }
  }
  assert.equal(registration.attemptsPerPolicy,16);
  assert.equal(registration.plannedNativeAttempts,32);
  assert.equal(registration.oneBooleanTreatmentOnly,
    'actorNativeAorItemLock=false (baseline), true (native-effective-AOR Item proposal suppression). Both policies and both candidate identities share same script and seed/repetition/seat groups.');
  return {registration,pin,originalSource,
    registrationBlob:REGISTRATION_BLOB,
    rosterBlob:gitBlobHash(roster)};
}

/** Run all committed fresh seeds, preserving any unexpected failure. */
function run(){
  const validation=preflight();
  const registration=validation.registration;
  const opts={
    ...registration.setupAndPolicyFixed,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema
  };
  assert.equal(opts.actorOnlyComposition,true);
  assert.equal(opts.sameRootPublicEventReceipt,true);
  assert.equal(opts.nativeRejectedActionEvidence,true);
  assert.equal(opts.sameRootChoiceApply,true);
  const control=runDevelopment({...opts,actorNativeAorItemLock:false});
  const filtered=runDevelopment({...opts,actorNativeAorItemLock:true});
  assert.equal(control.rows.length,16);
  assert.equal(filtered.rows.length,16);
  const pairs=compareRows(control,filtered);
  const summary={
    version:VERSION,
    registrationBlob:validation.registrationBlob,
    sourceRosterBlob:validation.rosterBlob,
    enginePin:validation.pin,
    runHeadCommit:process.env.GITHUB_SHA??null,
    sourceRank:15,sourceOriginal60Count:
      validation.originalSource.cards.reduce((n,c)=>n+c.count,0),
    prospectiveRegisteredBeforeGames:true,
    independentNewSeedGroups:8,
    totalNativeAttempts:32,
    controlStatuses:statuses(control.rows),
    filteredStatuses:statuses(filtered.rows),
    sameSourceDealPairs:pairs.filter(p=>
      p.samePhysicalSourceDeal===true).length,
    nonmatchingSourceDealPairs:pairs.filter(p=>
      p.samePhysicalSourceDeal===false).length,
    unresolvedSourceDealPairs:pairs.filter(p=>
      p.samePhysicalSourceDeal===null).length,
    sameStarterAndNativeSetupCertifiedPairs:pairs.filter(p=>
      p.sameActualStarter===true&&p.bothNativeSetupCertified===true).length,
    controlErrors:control.rows.filter(row=>row.status==='engine-error')
      .map(row=>({id:row.trial.id,
        printing:row.nativeRejectedPlayCard?.playedCardPrinting??null,
        publicBoard:row.nativeAbortEvidence?.preDispatchBoard??null})),
    filteredErrors:filtered.rows.filter(row=>row.status==='engine-error')
      .map(row=>({id:row.trial.id,
        printing:row.nativeRejectedPlayCard?.playedCardPrinting??null,
        publicBoard:row.nativeAbortEvidence?.preDispatchBoard??null})),
    controlGateReceipts:control.rows.map(gateReceipt),
    filteredGateReceipts:filtered.rows.map(gateReceipt),
    pairedStatusRows:pairs.map(p=>({
      id:p.id,sameSourceDeal:p.samePhysicalSourceDeal,
      sameStarter:p.sameActualStarter,
      setupCertified:p.bothNativeSetupCertified,
      baseline:p.control.status,filtered:p.treatment.status,
      baselineWinner:p.control.winner,filteredWinner:p.treatment.winner,
      baselineActions:p.control.nativeRootActions,
      filteredActions:p.treatment.nativeRootActions
    })),
    pairedStatusDigest:createHash('sha256').update(JSON.stringify(
      pairs.map(p=>({id:p.id,seed:p.seed,
        matched:p.samePhysicalSourceDeal,
        baseline:p.control.status,filtered:p.treatment.status})))).digest('hex'),
    competitiveQualifiedGames:0,
    verified99Point5:false,
    caveats:[
      'New independent seed group was registered before any games but the policy was developed on earlier rank15 failures',
      'A native Item-action legality preflight is not verified paper-expanded complete legality',
      'Shared opponent/candidate bots remain unqualified and 260-root cap censors unfinished games',
      'No official 25-minute clock, skilled opponent policy, or full 32-source testing',
      'Both contender sixties and original rank15 source sixty fixed throughout this seed tranche'
    ]
  };
  return {raw:{summary,control,filtered},summary};
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const p=preflight();
    process.stdout.write(JSON.stringify({
      schema:p.registration.schema,
      registrationBlob:p.registrationBlob,
      uniqueUnseenSeeds:8,
      originalSource:p.originalSource.archetype,
      nativeRevision:p.pin,
      attemptsPlanned:32,
      competitiveQualifiedGames:0},null,2)+'\n');
  }else{
    const executed=run();
    writeJsonAtomically(OUTPUT+'-raw.json',executed.raw);
    writeJsonAtomically(OUTPUT+'-summary.json',executed.summary);
    process.stdout.write(JSON.stringify({
      version:VERSION,
      sameSourceDealPairs:executed.summary.sameSourceDealPairs,
      nativeSetupPairs:executed.summary.sameStarterAndNativeSetupCertifiedPairs,
      controlStatuses:executed.summary.controlStatuses,
      filteredStatuses:executed.summary.filteredStatuses,
      competitiveQualifiedGames:0},null,2)+'\n');
  }
}
module.exports={VERSION,preflight,run};
