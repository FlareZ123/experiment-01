'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const registration=require('../../results/aichi-2026/registrations/agent20-issue25-v8-vs-seeker-guzma-retrospective-20261106.json');
const v8Registration=require('../../results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json');
const {runStewardBroaderV8}=require('./agent36-issue25-common-v8.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {hashRegisteredFile}=require('./agent36-issue25-selected-v0.cjs');
const {
  VERSION:LAYER_VERSION,
  withOwnerVsSeekerGuzmaLayer
}=require('../twinleaf/agent48-owner-vs-seeker-guzma-layer.cjs');

const VERSION='agent20-issue25-v8-vs-seeker-guzma-retrospective-v1';
const REGISTRATION_PATH=
  'results/aichi-2026/registrations/agent20-issue25-v8-vs-seeker-guzma-retrospective-20261106.json';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const HASH_PATHS=[
  'simulation/evaluation/agent20-issue25-v8-vs-seeker-guzma.cjs',
  REGISTRATION_PATH,
  'simulation/evaluation/agent36-issue25-common-v8.cjs',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/evaluation/agent36-issue25-selected-v0.cjs',
  'simulation/twinleaf/agent48-owner-vs-seeker-guzma-layer.cjs',
  'simulation/twinleaf/agent48-owner-vs-seeker-guzma-root.cjs',
  'simulation/twinleaf/agent48-owner-vs-seeker-supporter.cjs',
  'simulation/twinleaf/agent2-vs-seeker-guzma-recovery-frontier.cjs',
  'simulation/twinleaf/agent43-guzma-prompt-continuation.cjs',
  'simulation/evaluation/agent7-canonical-actor-composition.cjs',
  'simulation/twinleaf/agent34-actor-only-root-policy.cjs'
];

assert.equal(registration.schema,VERSION.replace('-retrospective','-retrospective-128root'));

/**
 * Build a v8 runner that adds the Agent48 retrieval layer and enables the
 * already-existing Agent43 Guzma prompt continuation. The original v8 runner,
 * registration, printed sixties, and source/candidate seat allocation remain
 * unchanged.
 *
 * @param {{runDevelopment?:Function,withOwnerVsSeekerGuzmaLayer?:Function,
 *   base?:string}} [deps]
 * @returns {(options:object)=>object}
 */
function createVsSeekerRunner(deps={}){
  const development=deps.runDevelopment??runDevelopment;
  const layer=deps.withOwnerVsSeekerGuzmaLayer??withOwnerVsSeekerGuzmaLayer;
  const base=deps.base??OUTPUT;
  assert.equal(typeof development,'function');
  assert.equal(typeof layer,'function');
  return options=>{
    const wrapped=layer(
      ()=>development({...options,actorGuzmaPromptContinuation:true}),
      {base}
    );
    assert.ok(wrapped&&wrapped.audit&&typeof wrapped.audit==='object',
      'VS Seeker/Guzma layer must return its native audit');
    assert.ok(wrapped.result&&typeof wrapped.result==='object',
      'Common v8 development runner must return its original result');
    return {
      ...wrapped.result,
      ownerVsSeekerGuzmaAudit:wrapped.audit
    };
  };
}

/**
 * Execute the exact eight retrospective v8 contexts with an additive
 * owner-scoped VS Seeker -> Guzma retrieval path.
 *
 * @param {{runV8?:Function,runDevelopment?:Function,
 *   withOwnerVsSeekerGuzmaLayer?:Function,base?:string}} [deps]
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object}}
 */
function runAgent20V8VsSeekerGuzma(deps={}){
  assert.deepEqual(registration.trials,v8Registration.trials,
    'Retrospective registration must preserve every original v8 trial');
  assert.equal(registration.pinnedTwinleaf,v8Registration.pinnedTwinleaf);
  assert.equal(registration.maxNativeRootActionsPerArm,
    v8Registration.maxNativeRootActionsPerArm);
  const runV8=deps.runV8??runStewardBroaderV8;
  assert.equal(typeof runV8,'function');
  const selected=runV8({
    runner:createVsSeekerRunner({
      runDevelopment:deps.runDevelopment,
      withOwnerVsSeekerGuzmaLayer:deps.withOwnerVsSeekerGuzmaLayer,
      base:deps.base
    })
  });
  assert.ok(selected?.rawDevelopment&&
    Array.isArray(selected.rawDevelopment.rows),
    'The v8 runner must preserve its complete native row archive');
  const raw=selected.rawDevelopment;
  const expectedIds=registration.trials.map(t=>t.id).sort();
  const actualIds=raw.rows.map(row=>row.trial?.id??row.id??null).sort();
  assert.deepEqual(actualIds,expectedIds,
    'All eight registered original contexts must remain present exactly once');
  assert.equal(raw.rows.length,8);
  const audit=raw.ownerVsSeekerGuzmaAudit;
  assert.ok(audit&&audit.version===LAYER_VERSION,
    'The actual Agent48 layer audit must be attached to the raw run');
  const guzmaPromptAudits=raw.rows.map(row=>({
    trialId:row.trial?.id??row.id??null,
    audit:row.actorOnlyDecisionCoverage?.guzmaPromptAudit??null
  }));
  const extensionHashes=HASH_PATHS.map(hashRegisteredFile);
  const manifest={
    ...selected.manifest,
    version:VERSION,
    retrospective:true,
    prospective:false,
    originalV8Registration:v8Registration.schema,
    addedOwnerVsSeekerGuzmaLayer:true,
    addedGuzmaPromptContinuation:true,
    ownerVsSeekerGuzmaLayerVersion:LAYER_VERSION,
    unchangedPrintedSixties:true,
    unchangedRegisteredSeeds:true,
    registeredTrialCount:8,
    nativeRootActionLimit:128,
    extensionSourceHashes:extensionHashes,
    releaseQualified:false,
    competitiveGamesQualified:0
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    registration:REGISTRATION_PATH,
    ownerVsSeekerGuzmaAudit:audit,
    guzmaPromptAudits,
    verdict:'RETROSPECTIVE-OWNER-VSSEEKER-GUZMA-INTEGRATION-ONLY',
    paperQualifiedCompetitiveGames:0,
    competitiveGamesQualified:0,
    winRateCertified:false,
    estimatedWinRate:null
  };
  return {...selected,manifest,diagnostic};
}

/**
 * Write a JSON artifact with an exclusive lock and atomic rename.
 * @param {string} filePath
 * @param {unknown} value
 * @returns {string} Absolute output path.
 */
function writeJsonAtomically(filePath,value){
  const absolute=path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolute),{recursive:true});
  const lockPath=absolute+'.lock';
  const tempPath=absolute+'.'+process.pid+'.tmp';
  const lockFd=fs.openSync(lockPath,'wx');
  try{
    fs.writeFileSync(tempPath,JSON.stringify(value,null,2)+'\n',
      {encoding:'utf8',flag:'wx'});
    fs.renameSync(tempPath,absolute);
  }finally{
    if(fs.existsSync(tempPath))fs.unlinkSync(tempPath);
    fs.closeSync(lockFd);
    fs.unlinkSync(lockPath);
  }
  return absolute;
}

if(require.main===module){
  const result=runAgent20V8VsSeekerGuzma();
  const output=process.env.AGENT20_OUTPUT_PATH;
  if(output)writeJsonAtomically(output,result);
  else process.stdout.write(JSON.stringify(result,null,2)+'\n');
}

module.exports={
  VERSION,REGISTRATION_PATH,HASH_PATHS,LAYER_VERSION,createVsSeekerRunner,
  runAgent20V8VsSeekerGuzma,writeJsonAtomically
};
