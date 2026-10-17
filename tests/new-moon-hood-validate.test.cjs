'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const source=require('../results/als/new-moon-perfection-english-map.json');
const candidate=require('../results/als/new-moon-hood-english-proxy-60.json');
const {idCountHash,verifyManifest}=
  require('../simulation/twinleaf/new-moon-hood-validate.cjs');

test('exact source count/hash and frozen two-Hood count/hash are consistent',()=>{
  const verified=verifyManifest();
  assert.equal(verified.total,60);
  assert.equal(verified.replacedTrainersMail,2);
  assert.equal(verified.addedStealthyHood,2);
  assert.equal(source.sha256_id_counts,
    '4dd537adbf73d89e50215b3d056a9f40d474f05b79e33774c281a30079e1ce95');
  assert.equal(candidate.candidate_sha256_id_counts,
    'fa9d615c5dcbf94da9d529e436bbf5d81903299fde6d2750402834efebe186c8');
  assert.equal(idCountHash(candidate.entries),verified.sha256);
});

test('exactly one original printed source row replaced with Stealthy Hood',()=>{
  for(let i=0;i<source.entries.length;i++) {
    const before=source.entries[i],after=candidate.entries[i];
    if(before.name==="Trainer's Mail") {
      assert.equal(before.count,2);
      assert.equal(after.name,'Stealthy Hood');
      assert.equal(after.count,2);
      assert.equal(after.id,'sm10-186');
      assert.equal(after.twinleaf_full_name,'Stealthy Hood UNB');
    } else {
      assert.deepEqual(after,before);
    }
  }
  assert.equal(candidate.entries.filter(x=>x.name==='Powerglass')[0].count,2);
  assert.equal(candidate.entries.filter(x=>x.name==='Rescue Carrier')[0].count,4);
});
