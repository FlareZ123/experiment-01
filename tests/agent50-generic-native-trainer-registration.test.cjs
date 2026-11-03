'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const test=require('node:test');
const {deriveSlotSeeds}=require('../scripts/aichi-decorrelated-seeds.cjs');

const file=path.resolve(__dirname,
  '../results/aichi-2026/registrations/agent50-owner-native-trainer-fallback-v1-20261103.json');
const registration=JSON.parse(fs.readFileSync(file,'utf8'));
const registrationSha256=createHash('sha256').update(fs.readFileSync(file))
  .digest('hex');

/** Check the exact immutable registration before any Twinleaf compile. */
function preflight(){
  const m=registration;
  assert.equal(m.schema,'agent50-generic-native-trainer-fallback-registration-v1');
  assert.deepEqual(m.sourceRanks,[5,11]);
  assert.deepEqual(m.seedProtocol.repeats,[1,2]);
  assert.deepEqual(m.physicalSeatOrders.map(row=>row.slot),['A','B']);
  assert.deepEqual(m.physicalSeatOrders.map(row=>row.rank5Seat),[0,1]);
  assert.deepEqual(m.policyFactor,
    {control:false,treatment:true,repeatedControl:false,
      optionName:'nativeOwnerTrainerFallback',
      otherCanonicalOptions:{ownerGenericTrainerFrontier:true,
        genericFallbackAttribution:true}});
  const cohorts=[];
  for(const repeat of m.seedProtocol.repeats){
    const seeds=deriveSlotSeeds(m.seedProtocol.base,
      m.seedProtocol.phase,m.seedProtocol.rank,repeat);
    for(const order of m.physicalSeatOrders){
      const seed=seeds[order.slot];
      assert.ok(Number.isSafeInteger(seed)&&seed>=0);
      cohorts.push({repeat,slot:order.slot,rank5Seat:order.rank5Seat,seed});
    }
  }
  assert.equal(cohorts.length,m.plannedPhysicalCohorts);
  assert.equal(cohorts.length*3,m.plannedNativeAttempts);
  assert.equal(new Set(cohorts.map(c=>c.seed)).size,cohorts.length);
  assert.equal(new Set(cohorts.map(c=>c.repeat+':'+c.slot)).size,cohorts.length);
  assert.equal(m.perAttempt.maxActions,90);
  return {registrationSha256,cohorts};
}

test('exact registered four physical groups, twelve A/B/A attempts',()=>{
  const result=preflight();
  assert.equal(result.registrationSha256.length,64);
  assert.equal(result.cohorts.length,4);
  process.stdout.write('AGENT50_GENERIC_TRAINER_PREFLIGHT '+
    JSON.stringify(result)+'\n');
});

module.exports={registration,registrationSha256,preflight};
