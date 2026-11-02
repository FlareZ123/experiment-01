'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const crypto=require('node:crypto');
const path=require('node:path');
const fs=require('node:fs');
const {schedule}=require('../simulation/twinleaf/agent44-rank8-box-k0-source-census.cjs');
const {SCOUT64_START,SCOUT64_COUNT,SCOUT64_REGISTERED_SHA256}=
  require('../simulation/evaluation/agent44-canonical-boxshake-native-pilot.cjs');

const root=path.resolve(__dirname,'..');
const registration=JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/registrations/agent44-rank8-prebox-scout-vs-box-first-fresh64-20261102.json'),'utf8'));
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

/** @returns {Array<{trial:string,sourceSeat:0|1,seed:number,selection:string}>} */
function registeredRows(){
  return schedule(SCOUT64_START,SCOUT64_COUNT)
    .map(row=>({...row,selection:'preregistered-prebox-quickball-scout64'}));
}

test('precommitted original rank8 64 exact physical seeds and both real seats are immutable',()=>{
  assert.equal(SCOUT64_START,402);
  assert.equal(SCOUT64_COUNT,64);
  const rows=registeredRows();
  assert.equal(rows.length,64);
  assert.deepEqual(rows[0],registration.sourceSeedSchedule.first);
  assert.deepEqual(rows.at(-1),registration.sourceSeedSchedule.last);
  assert.equal(hash(rows),SCOUT64_REGISTERED_SHA256);
  assert.equal(hash(rows),registration.sourceSeedSchedule.rowsSha256);
  assert.deepEqual([...new Set(rows.map(r=>r.trial))].length,64);
  assert.equal(rows.filter(r=>r.sourceSeat===0).length,32);
  assert.equal(rows.filter(r=>r.sourceSeat===1).length,32);
  for(const row of rows){
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&row.seed<=0xFFFFFFFF);
    assert.ok(/^rank8-original-box-k0:\d+$/.test(row.trial));
  }
});

test('the prospective source cohort cannot overlap previous 64, fresh32 or selected debug383',()=>{
  const rows=registeredRows();
  const indices=rows.map(r=>Number(r.trial.split(':')[1]));
  assert.ok(indices.every(i=>i>401));
  assert.equal(indices[0],402);
  assert.equal(indices.at(-1),465);
  assert.equal(new Set(indices).size,64);
  assert.ok(!indices.includes(383));
  assert.equal(registration.controls.all64Attempted,true);
  assert.equal(registration.controls.identicalInitialFullPhysicalSourceAndTwoSeatDealHashRequired,true);
  assert.equal(registration.controls.paperQuickBallMandatoryGuard,true);
  assert.equal(registration.controls.paperSecretBoxMandatoryGuard,true);
  assert.equal(registration.controls.secretBoxOwnerThreePhysicalCardCustody,true);
  assert.equal(registration.controls.baselineAndTreatmentBothBoxEnabled,true);
});

test('registration fixes both unchanged 60-card paper inventories and field source identity',()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const rank8=manifest.decks.find(row=>row.rank===8);
  assert.equal(rank8?.archetype,'Absol Garbodor');
  assert.equal(rank8?.cards.reduce((sum,card)=>sum+card.count,0),60);
  for(const [name,n] of [['Secret Box',1],['Boost Shake',1],
    ['Quick Ball',4],['Trubbish',2],['Garbodor',2],['Float Stone',4]]){
    assert.equal(rank8.cards.filter(card=>card.name===name)
      .reduce((sum,card)=>sum+card.count,0),n);
  }
  assert.equal(registration.printedSource60Sha256,
    '6d955f821a0ae206110189adf53621a29c2d49afdeade1206dee46a2a50f8541');
  assert.equal(registration.fieldOriginalRank,8);
});
