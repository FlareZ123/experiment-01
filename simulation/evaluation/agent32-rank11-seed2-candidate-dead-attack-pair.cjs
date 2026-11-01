'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {registeredTrials}=require('./agent41-frozen-bilateral-development-v1.cjs');
const frozen=require('./agent41-frozen-bilateral-development-v2.json');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent32-original-rank11-seed2-a-candidate-dead-attack-two-arm-pair-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ROOT=path.resolve(__dirname,'../..');
const IDS=[
  '11:2:A:champion-reference',
  '11:2:A:new-moon-lockbreaker-v1'
];
const ARCHIVED_SOURCE='e349d3b9b51790929b264117612a1a7c218cb6f2726d73862d7a5a1e7ba51c55';

/**
 * Return the exact two source-deal paired historical original trial entries.
 * @returns {object[]}
 */
function targetedTrials(){
  const selected=registeredTrials(frozen).filter(t=>IDS.includes(t.id));
  assert.equal(selected.length,2);
  assert.deepEqual(selected.map(x=>x.id),IDS);
  assert.equal(selected[0].seed,3821563342);
  assert.equal(selected[0].rank,11);
  assert.equal(selected[0].candidateSlot,'A');
  assert.equal(selected[0].seed,selected[1].seed);
  return selected;
}

/** @param {object} row @returns {object} */
function compact(row){
  const attacks=row.rootActionLedger?.filter(x=>x.action==='AttackAction')??[];
  const candidateSeat=row.candidateSeat??0;
  return {
    trialId:row.trial?.id??null,
    sourceSeat:row.sourceSeat??1,candidateSeat,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    sourceDeckFingerprint:row.sourceDeckFingerprint??null,
    candidateDeckFingerprint:row.candidateDeckFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    error:row.status??null,finished:row.finished===true,
    winner:row.finished===true?row.winner:null,
    endReason:row.endReason??null,finalPrizes:row.finalPrizes??null,
    actionCount:row.actionCount??null,
    selectedAttacks:attacks.filter(x=>x.playerSlot===candidateSeat)
      .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,name:x.attack})),
    originalSourceAttacks:attacks.filter(x=>x.playerSlot!==candidateSeat)
      .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,name:x.attack})),
    nativeAcceptedPromptEvents:row.nativePromptChoices?.events?.length??0,
    fullRootLedger:row.rootActionLedger??[]
  };
}

/** @param {object} resultA @param {object} resultB @returns {object} */
function analyze(resultA,resultB){
  assert.equal(resultA.rows?.length,2);
  assert.equal(resultB.rows?.length,2);
  const baseline=new Map(resultA.rows.map(r=>[r.trial.id,compact(r)]));
  const treatment=new Map(resultB.rows.map(r=>[r.trial.id,compact(r)]));
  assert.equal(baseline.size,2);
  assert.equal(treatment.size,2);
  const fields=['sourceSeat','candidateSeat','sourceDealFingerprint',
    'fullPhysicalDealFingerprint','sourceDeckFingerprint',
    'candidateDeckFingerprint','actualStarterSeat'];
  const pairs=IDS.map(id=>{
    const a=baseline.get(id),b=treatment.get(id);
    assert.ok(a&&b);
    const differentInputs=fields.filter(k=>a[k]!==b[k]);
    const al=a.fullRootLedger,bl=b.fullRootLedger;
    let firstDivergence=null;
    for(let i=0;i<=Math.max(al.length,bl.length);i++){
      if(i===Math.max(al.length,bl.length))break;
      if(JSON.stringify(al[i]??null)!==JSON.stringify(bl[i]??null)){
        firstDivergence={index:i,
          original:al[i]??null,knownDeadCandidate:bl[i]??null};
        break;
      }
    }
    const keep=x=>{const {fullRootLedger,...other}=x;return other;};
    return {
      trialId:id,unchangedPhysicalInputs:differentInputs.length===0,
      differentInputs,archivedV2OriginalSourceDealMatch:
        a.sourceDealFingerprint===ARCHIVED_SOURCE,
      baseline:keep(a),knownDeadCandidate:keep(b),
      firstNativeRootDivergence:firstDivergence,
      competitiveQualified:false
    };
  });
  return {
    schema:VERSION,sourceProfile:frozen.schema,
    parentNativeArtifactId:13072623187,originalSourcePin:PIN,
    sourceRegistrationBlobSha:frozen.registrationGitBlobSha,
    exactCandidateSixtiesUnchanged:true,
    selectedOriginalRank11Arms:IDS,
    registeredHistoricalSeed:3821563342,
    actualNativeArmCount:resultA.rows.length+resultB.rows.length,
    allOriginalRegisteredArmsAttempted:
      resultA.attempted===2&&resultB.attempted===2,
    matchedPhysicalInputs:pairs.every(p=>p.unchangedPhysicalInputs),
    comparisonAgainstArchivedV2SourceInputs:
      pairs.every(p=>p.archivedV2OriginalSourceDealMatch),
    pairs,competitiveQualifiedGames:0,
    limitation:'Retrospective original two-candidate source seed2-sideA development only; actor-only roots remain an incomplete, unqualified opponent policy. Store replies/prompt legality and event clocks require independent certification.'
  };
}

/** @returns {object} */
function run(){
  const bytes=fs.readFileSync(path.join(ROOT,frozen.registration));
  const blob=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(blob,frozen.registrationGitBlobSha);
  const nativePin=execFileSync('git',['-C',
    path.join(ROOT,frozen.vendorSubmodulePath),'rev-parse','HEAD'],
    {encoding:'utf8'}).trim();
  assert.equal(nativePin,PIN,'Expected exact pinned upstream native engine');
  const shared={
    ...frozen.policyOptions,registeredTrials:targetedTrials(),
    registeredFrameName:VERSION
  };
  assert.equal(shared.actorOnlyComposition,true);
  assert.equal(shared.bilateralPublicContextSpecialEnergy,true);
  const key='AGENT4_NATIVE_PAYMENT_RECEIPT_DEV';
  const prior=process.env[key];
  process.env[key]='true';
  try{
    const baseline=runDevelopment({...shared,candidateOnlyKnownDeadRoot:false});
    const treatment=runDevelopment({...shared,candidateOnlyKnownDeadRoot:true});
    const result=analyze(baseline,treatment);
    result.researchHeadSha=process.env.GITHUB_SHA??null;
    return result;
  }finally{
    if(prior===undefined)delete process.env[key];
    else process.env[key]=prior;
  }
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={VERSION,IDS,targetedTrials,compact,analyze,run};
