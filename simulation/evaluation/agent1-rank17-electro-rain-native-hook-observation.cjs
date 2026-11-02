'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {preflight,sourceWitness}=require('./agent1-rank17-original-evolution-prospective.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {withElectroRainDamageHook}=require('../twinleaf/electro-rain-damage-hook.cjs');
const REG=path.resolve(__dirname,'../../results/aichi-2026/registrations/agent1-rank17-electro-rain-hook-observational-20261102.json');

/** Replay prior original seeds as an explicitly dependent card-fidelity witness. */
function run(){
  const registered=JSON.parse(fs.readFileSync(REG,'utf8'));
  const {registration,options,trials}=preflight();
  assert.equal(registered.sourceRank,registration.sourceRank);
  assert.deepEqual(registered.groups,registration.registeredGroups);
  assert.equal(registered.expectedNativeArms,trials.length);
  const previous=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
  let corrected;
  try{
    corrected=withElectroRainDamageHook(()=>runDevelopment({
    ...options,actorNaturalEvolutionRoot:true,
    registeredTrials:trials,
    registeredFrameName:'agent1-original-rank17-damage-hook-observation',
    allowAdditionalOriginalSourceRanks:true
  }));
  }finally{
    if(previous===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=previous;
  }
  return {schema:registered.schema,attempted:corrected.rows.length,
    audit:{hook:'Agent46 preexisting electro-rain-damage-hook.cjs',
      sourceAttackConversionEvidence:'Inspect nativeRows for source Electro Rain attack roots',
      effectConversionCountUnmeasured:true},rows:corrected.rows,
    competitiveQualifiedGames:0,paperMatchCertified:false,
    independentValidation:false};
}

if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  process.stderr.write('AGENT1_RANK17_HOOK_AUDIT '+JSON.stringify({audit:r.audit,attempted:r.attempted,sourceWitness:r.rows.map(sourceWitness).map(w=>({trialId:w.trialId,status:w.status,nativeFinished:w.nativeFinished,nativeWinner:w.nativeWinnerUnqualified,sourceDealFingerprint:w.publicSourceDealFingerprint,sourceStages:w.sourceStage1PlayRoots,sourceAttacks:w.sourceAttackRoots,sourceAbilities:w.sourceAbilityRoots,sourceAttackDeclarations:w.sourceAttackDeclarations}))})+'\n');
}
module.exports={run};
