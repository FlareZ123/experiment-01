'use strict';

const path=require('node:path');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {registeredTrials,exactSourceFingerprint,runFrozenDevelopment}=
  require('./agent41-frozen-bilateral-development-v1.cjs');

const VERSION=profile.schema;
const ROOT=path.resolve(__dirname,'../..');

/**
 * Shared original native two-seat policy, only one new Public Context
 * Special Energy actor option relative to the archived v1 comparison.
 * Keep all 16 physical seed groups and 32 original-source candidate arms.
 * @returns {object}
 */
function runV2(){
  return runFrozenDevelopment({profile});
}

if(require.main===module){
  const inspect=process.argv.includes('--inspect-only');
  const result=inspect?{
    version:VERSION,profileStatus:profile.status,
    source:exactSourceFingerprint(ROOT,profile),
    registeredTrialCount:registeredTrials(profile).length,
    competitiveQualified:false
  }:runV2();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!inspect&&!result.attemptedComplete)process.exitCode=1;
}

module.exports={VERSION,profile,runV2};
