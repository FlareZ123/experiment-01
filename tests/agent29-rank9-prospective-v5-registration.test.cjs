'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const registered=require('../results/aichi-2026/registrations/agent29-rank9-prospective-eight-seed-compressor-bomb-v5-20261107.json');
const {options,PROSPECTIVE_VERSION}=
  require('../simulation/evaluation/agent29-rank9-compressor-owner-bridge-retro.cjs');

const CANDIDATES=['champion-reference','new-moon-lockbreaker-v1'];

/** @param {number} index */
function seeded(index){
  const prefix=registered.seedGeneration.prefix;
  const digest=createHash('sha256').update(prefix+':'+index).digest();
  return digest.readUInt32BE(0);
}

test('all eight frozen source seeds are generated without prior native outcome selection',()=>{
  assert.equal(registered.schema,
    'agent29-original-rank9-prospective-new-seeds-v5-preregistered');
  assert.equal(registered.seedGeneration.indexRange[0],0);
  assert.equal(registered.seedGeneration.indexRange[1],7);
  assert.equal(registered.seedGeneration.seedSelectedBeforeAnyNativeProspectiveExecution,true);
  assert.equal(registered.groupCount,8);
  assert.equal(registered.attemptsPerArm,16);
  assert.equal(registered.pairedNativeAttempts,32);
  const seen=new Set();
  for(let i=0;i<8;i++){
    const group=registered.seeds[i];
    assert.equal(group.index,i);
    assert.equal(group.seed,seeded(i));
    assert.ok(!seen.has(group.seed));
    assert.ok(![3060075246,690229661].includes(group.seed));
    seen.add(group.seed);
    assert.equal(group.repeat,200+i);
    assert.equal(group.candidateSlot,i%2===0?'A':'B');
  }
});

test('prospective native A/B registry exactly pairs both frozen candidate 60s',()=>{
  assert.equal(registered.trials.length,16);
  for(let i=0;i<8;i++){
    const pair=registered.trials.slice(i*2,i*2+2);
    assert.deepEqual(pair.map(t=>t.candidateId),CANDIDATES);
    for(const t of pair){
      assert.equal(t.rank,9);
      assert.equal(t.repeat,200+i);
      assert.equal(t.seed,registered.seeds[i].seed);
      assert.equal(t.candidateSlot,registered.seeds[i].candidateSlot);
      assert.equal(t.id,['9',t.repeat,t.candidateSlot,t.candidateId].join(':'));
    }
  }
});

test('source intervention is default off, treatment uses isolated fresh-randomness flags',()=>{
  const config={anyTurn:true,shuffleCustody:true,
    bombAfterCompressor:true,prospectiveV5:true};
  const control=options(false,config),treatment=options(true,config);
  assert.equal(PROSPECTIVE_VERSION,control.registeredFrameName);
  assert.equal(control.registeredFrameName,treatment.registeredFrameName);
  assert.equal(control.actorRank9CompressorOwnerBridge,false);
  assert.equal(control.actorRank9CompressorBombAfter,false);
  assert.equal(treatment.actorRank9CompressorOwnerBridge,true);
  assert.equal(treatment.actorRank9CompressorAnyTurn,true);
  assert.equal(treatment.actorRank9CompressorBombAfter,true);
  for(const arm of [control,treatment]){
    assert.equal(arm.isolatePolicyRandomness,true);
    assert.equal(arm.isolatePhysicalShuffleRandomnessAfterSetup,true);
    assert.deepEqual(arm.registeredTrials,registered.trials);
    assert.equal(arm.paperRank9ElectrodeGXCorrection,true);
  }
});
