'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {classifyPhysicalZoneEvidence:judge,summarizePhysicalQualification:sum,
  INTEGRITY_SCHEMA,INVALID_CODE}=require('../simulation/evaluation/physical-zone-qualification.cjs');
function good(overrides={}){
  return {schema:INTEGRITY_SCHEMA,rootActionsChecked:40,
    actionsWithAnomaly:2,firstAnomaly:{actionOrdinal:9},
    settledRootsChecked:34,settledRootsWithAnomaly:0,
    firstSettledRootAnomaly:null,...overrides};
}
test('no instrumentation is never a physical-60 pass',()=>{
  assert.equal(judge({game:{physicalZoneIntegrity:good()}}).status,
    'PHYSICAL_INTEGRITY_UNVERIFIED');
  assert.equal(judge({requested:true}).status,
    'PHYSICAL_INTEGRITY_UNVERIFIED');
});
test('preserves unresolved-prompt anomalies while passing settled custody',()=>{
  const r=judge({requested:true,game:{physicalZoneIntegrity:good()}});
  assert.equal(r.status,'SETTLED_PHYSICAL_INTEGRITY_PASSED');
  assert.equal(r.pendingRootAnomalies,2);
  assert.equal(r.physicalIntegrityQualified,true);
  assert.equal(r.competitiveQualified,false);
});
test('settled 59-card case vetoes and keeps the first real witness',()=>{
  const w={actionOrdinal:22,turn:7,actingSeat:1,
    countAnomalies:[{seat:1,located:59,expected:60}]};
  const r=judge({requested:true,game:{physicalZoneIntegrity:
    good({settledRootsWithAnomaly:1,firstSettledRootAnomaly:w})}});
  assert.equal(r.status,'ENGINE_PHYSICAL_INVALID');
  assert.equal(r.firstFailingRoot,22);
  assert.deepEqual(r.witness,w);
});
test('actual headless guard exception is an invalid attempt, never a capped game',()=>{
  const w={actionOrdinal:17,turn:4,actingSeat:0};
  const r=judge({requested:true,error:{code:INVALID_CODE,
    physicalConservationWitness:w}});
  assert.equal(r.status,'ENGINE_PHYSICAL_INVALID');
  assert.deepEqual(r.witness,w);
});
test('unrelated engine exception remains abort and cannot qualify',()=>{
  const r=judge({requested:true,error:{code:'PROMPT_REJECTED'},
    game:{physicalZoneIntegrity:good()}});
  assert.equal(r.status,'NATIVE_GAME_ABORT');
  assert.equal(r.competitiveQualified,false);
});
test('zero settled roots, missing version and contradictory counters fail closed',()=>{
  assert.equal(judge({requested:true,game:{physicalZoneIntegrity:
    good({settledRootsChecked:0})}}).status,'PHYSICAL_INTEGRITY_UNVERIFIED');
  assert.equal(judge({requested:true,game:{physicalZoneIntegrity:
    good({schema:'unsupported'})}}).status,'PHYSICAL_INTEGRITY_UNVERIFIED');
  assert.equal(judge({requested:true,game:{physicalZoneIntegrity:
    good({settledRootsChecked:41})}}).status,'PHYSICAL_INTEGRITY_UNVERIFIED');
  assert.equal(judge({requested:true,game:{physicalZoneIntegrity:
    good({firstSettledRootAnomaly:{actionOrdinal:1}})}}).status,
    'PHYSICAL_INTEGRITY_UNVERIFIED');
});
test('failure-inclusive summary never drops invalid or unverified trials',()=>{
  const rows=[
    {physicalZoneQualification:judge({requested:true,game:{physicalZoneIntegrity:good()}})},
    {physicalZoneQualification:judge({requested:true,error:{code:INVALID_CODE}})},
    {status:'engine-error'}
  ];
  const result=sum(rows);
  assert.equal(result.attempted,3);
  assert.equal(result.physicallyAudited,1);
  assert.equal(result.byStatus.ENGINE_PHYSICAL_INVALID,1);
  assert.equal(result.byStatus.PHYSICAL_INTEGRITY_UNVERIFIED,1);
  assert.equal(result.allPhysicallyAudited,false);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(sum([]).allPhysicallyAudited,false);
});
