'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {preflight:sourcePreflight,scheduledArms}=
  require('./agent10-original-rank9-absol-electrode-development.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent2-rank9-special-guzma-retrospective-20261102.json';
const REG_BLOB='e4e50b69bea3b3ae82dd54500ea848aa7a890eb2';
const VERSION='agent2-rank9-special-guzma-retrospective-same-deal-v1';
/** @returns {{manifest:object,trials:object[],base:object}} */
function preflight(){
  const bytes=fs.readFileSync(path.join(ROOT,REG));
  assert.equal(gitBlobHash(bytes),REG_BLOB,'External registration changed');
  const manifest=JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.pinnedVendorRevision,profile.pinnedVendorRevision);
  assert.equal(manifest.originalPrinted60Sha256,
    require('../../results/aichi-2026/original-printed60-admission-v1.json')
      .rows.find(x=>x.rank===9).printed60Sha256);
  for(const [file,sha] of Object.entries(manifest.effectiveCodeGitBlobShas))
    assert.equal(gitBlobHash(fs.readFileSync(path.join(ROOT,file))),sha,
      'Registered executable changed: '+file);
  sourcePreflight();
  const trials=scheduledArms();
  assert.deepEqual(manifest.registeredGroups,trials
    .filter(x=>x.candidateId==='champion-reference')
    .map(x=>({rank:x.rank,repeat:x.repeat,
      candidateSlot:x.candidateSlot,seed:x.seed})));
  const base={...profile.policyOptions,...manifest.commonBaselineOptions};
  assert.equal(base.actorOnlyComposition,true);
  assert.equal(base.actorGuzmaPromptContinuation,true);
  return {manifest,trials,base};
}
/** @param {object|null} r @returns {string} */
function disposition(r){
  if(!r||r.error!=null||r.status!=null)return 'NATIVE_ERROR';
  if(r.finished===true&&r.endReason==='engine-game-end')
    return 'ENGINE_TERMINAL_UNQUALIFIED';
  if(r.finished===false&&r.endReason==='action-limit')return 'CENSORED';
  return 'UNVERIFIED';
}
/** @param {object|null} r @returns {object} */
function witness(r){
  if(!r)return {disposition:'NATIVE_ERROR',sourceDealFingerprint:null};
  const seat=r.trial.candidateSlot==='A'?1:0;
  const roots=(r.rootActionLedger??[]).filter(x=>x.playerSlot===seat);
  const guzma=roots.filter(x=>x.action==='PlayCardAction'&&
    /^Guzma [A-Z0-9]/.test(x.card??''));
  const claw=roots.filter(x=>x.action==='AttackAction'&&
    JSON.stringify(x).includes('Claw of Darkness'));
  const bridge=r.actorOnlyDecisionCoverage?.guzmaPromptAudit??null;
  return {
    disposition:disposition(r),sourceSeat:seat,
    sourceDealFingerprint:r.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:r.fullPhysicalDealFingerprint??null,
    guzmaRoots:guzma.map(x=>({turn:x.turnBefore,ordinal:x.actionOrdinal,card:x.card})),
    clawRoots:claw.map(x=>({turn:x.turnBefore,ordinal:x.actionOrdinal})),
    nativeGuzmaBridge:bridge,
    sourceAttackSettlement:r.sourceAttackSettlement??null,
    nativeEndReason:r.endReason??null,nativeActionCount:r.actionCount??null,
    nativeError:r.error??null,
    paperPhases:{ROOT_PAPER:'unverified',PROMPT_PAPER:'unverified',
      PAYMENT_PAPER:'unverified',EFFECT_PAPER:'unverified',
      RANDOMNESS_PAPER:'unverified'},
    competitiveQualified:false
  };
}
/** @param {{pinNative?:boolean,runDevelopment?:Function}} [deps] */
function run(deps={}){
  const {manifest,trials,base}=preflight();
  const frozen=require('./agent41-frozen-bilateral-development-v1.cjs');
  frozen.assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  if(deps.pinNative!==false)frozen.assertPinnedNativeStore(ROOT,profile);
  const runner=deps.runDevelopment??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  const original={};
  for(const [key,value] of Object.entries(profile.injectedResearchEnvironment)){
    original[key]=process.env[key];process.env[key]=value;
  }
  const modes={};
  try{
    for(const mode of ['control','treatment']){
      try{
        const raw=runner({...base,
          actorRank9SpecialFundedGuzma:mode==='treatment',
          registeredTrials:trials,
          registeredFrameName:VERSION+'-'+mode,
          allowAdditionalOriginalSourceRanks:true});
        assert.equal(raw.attempted,4);
        assert.deepEqual(raw.rows.map(x=>x.trial.id),trials.map(x=>x.id));
        modes[mode]={attempts:raw.rows.map(r=>({trial:r.trial,
          evidence:witness(r),rawNativeRow:r})),rawNativeReport:raw};
      }catch(e){
        modes[mode]={batchError:String(e?.stack??e),
          attempts:trials.map(trial=>({trial,rawNativeRow:null,
            evidence:{disposition:'NATIVE_ERROR',
              reason:'BATCH_ABORT',sourceDealFingerprint:null,
              error:String(e?.message??e),competitiveQualified:false}}))};
      }
    }
  }finally{
    for(const [key,v] of Object.entries(original)){
      if(v===undefined)delete process.env[key];else process.env[key]=v;
    }
  }
  const comparisons=trials.map((trial,i)=>{
    const control=modes.control.attempts[i].evidence;
    const treatment=modes.treatment.attempts[i].evidence;
    const a=control.sourceDealFingerprint,b=treatment.sourceDealFingerprint;
    const pairing=typeof a!=='string'||typeof b!=='string'?'UNVERIFIED':
      a===b?'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT';
    return {trial:trial.id,pairing,control,treatment,
      acceptedGuzmaRootDelta:pairing==='EXACT_SOURCE_DEAL_MATCH'?
        treatment.guzmaRoots.length-control.guzmaRoots.length:null,
      competitivelyQualified:false};
  });
  return {schema:VERSION,externalRegistrationGitBlobSha:REG_BLOB,
    sourceRank:9,sourcePrinted60Sha256:manifest.originalPrinted60Sha256,
    vendorRevision:manifest.pinnedVendorRevision,
    actualResearchHead:process.env.GITHUB_SHA??null,
    intendedAttempts:8,
    executedModeAttemptCounts:Object.fromEntries(
      Object.entries(modes).map(([mode,r])=>
        [mode,r.rawNativeReport?.attempted??null])),
    comparisons,modes,competitiveQualifiedGames:0,
    certifiedWinRate:null,
    limitation:'Retrospectively selected source deals; no paper-complete action or official clock certification'};
}
if(require.main===module){
  const value=process.argv.includes('--inspect-only')?
    {schema:VERSION,preflight:preflight(),mode:'INSPECTION_ONLY'}:run();
  const output=process.env.AICHI_RANK9_SPECIAL_GUZMA_OUTPUT;
  if(output){
    const tmp=output+'.tmp-'+process.pid;
    fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n');
    fs.renameSync(tmp,output);
    process.stdout.write(JSON.stringify({
      schema:VERSION,intendedAttempts:value.intendedAttempts,
      comparisons:value.comparisons?.map(x=>({
        trial:x.trial,pairing:x.pairing,
        control:x.control.disposition,treatment:x.treatment.disposition,
        acceptedGuzmaRootDelta:x.acceptedGuzmaRootDelta
      })),competitiveQualifiedGames:0},null,2)+'\n');
  }else process.stdout.write(JSON.stringify(value,null,2)+'\n');
}
module.exports={VERSION,REG_BLOB,preflight,disposition,witness,run};
