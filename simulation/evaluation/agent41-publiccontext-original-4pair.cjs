'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent41-public-special-native-4pair-20261030.json';
const REGISTRATION_BLOB='efa321728963b046647cdc03d5eb011cead70c38';

/**
 * Prepare all eight original-card, seeded native trials prior to execution.
 * The seed within a rank/physical seat is deliberately shared across the
 * two different candidate 60s, which are different physical deals.
 * @param {object} plan Already committed frozen experiment registration.
 * @returns {object[]} Immutable native trials.
 */
function scheduledPublicEnergyTrials(plan){
  assert.deepEqual(plan.ranks,[4,10]);
  assert.deepEqual(plan.candidateSlots,['A','B']);
  assert.deepEqual(plan.candidateIds,['champion-reference',
    'new-moon-lockbreaker-v1']);
  assert.equal(plan.repeats,1);
  const trials=[],usedSeeds=new Set();
  for(const rank of plan.ranks)for(const candidateSlot of plan.candidateSlots){
    const seeds=plan.seeds[String(rank)][candidateSlot];
    assert.equal(seeds.length,1);
    const seed=seeds[0];
    assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<2**32);
    assert.ok(!usedSeeds.has(seed));
    usedSeeds.add(seed);
    for(const candidateId of plan.candidateIds){
      const repeat=0;
      trials.push({id:[rank,repeat,candidateSlot,candidateId].join(':'),
        rank,repeat,candidateSlot,candidateId,seed});
    }
  }
  assert.equal(trials.length,8);
  assert.equal(usedSeeds.size,4);
  return trials;
}

/**
 * Execute a frozen 8-arm original Store cohort using exactly one of two
 * precommitted common policies. All error/cap rows remain in the output.
 * @param {'control'|'public-context'} mode
 * @returns {object}
 */
function runFrozenPublicEnergy(mode){
  assert.ok(['control','public-context'].includes(mode));
  const buffer=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const sha=createHash('sha1').update('blob '+buffer.length+'\0')
    .update(buffer).digest('hex');
  assert.equal(sha,REGISTRATION_BLOB,'Registration altered after commitment');
  const plan=JSON.parse(buffer.toString('utf8'));
  const trials=scheduledPublicEnergyTrials(plan);
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const result=runDevelopment({...plan.frozenRunOptions,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:trials,registeredFrameName:REGISTRATION,
    bilateralPublicContextSpecialEnergy:mode==='public-context'});
  assert.equal(result.attempted,8);
  assert.equal(result.rows.length,8);
  assert.equal(result.registeredTrialFrame,REGISTRATION);
  assert.ok(result.rows.every(r=>r.qualifiesForCompetitiveInference===false));
  return {schema:'agent41-rank4rank10-original-public-energy-scout-v1',
    mode,registrationPath:REGISTRATION,registrationBlob:sha,
    enginePin:plan.pinnedTwinleaf,attempts:8,
    result,competitiveQualifiedGames:0,
    caution:'Frozen rank4/10 source and unchanged two candidate 60s, eight games per policy; generic incomplete bots, native Store caps, no event clock or human competitive inference.'};
}

if(require.main===module){
  assert.equal(process.argv.length,3);
  process.stdout.write(JSON.stringify(runFrozenPublicEnergy(process.argv[2]),null,2)+'\n');
}

module.exports={REGISTRATION,REGISTRATION_BLOB,scheduledPublicEnergyTrials,
  runFrozenPublicEnergy};
