'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');
const {runJoinedIssue25V5}=
  require('./agent1-issue25-joined-three-attacks-v5.cjs');

const VERSION='agent1-issue25-preregistered-mirrored-r6-r11-v6-development';
const REGISTRATION_PATH=
  'results/aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json';
const ROOT=path.resolve(__dirname,'../..');
const EXPECTED_CANDIDATES=[
  'champion-reference','new-moon-lockbreaker-v1'
];
const EXTRA_HASH_PATHS=[
  'simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs',
  REGISTRATION_PATH,
  'tests/agent1-issue25-mirrored-r6-r11-v6.test.cjs',
  'tests/agent1-issue25-mirrored-r6-r11-v6.native.test.cjs'
];

/**
 * Fail closed on trial ID / paired seed / per-rank both-seat registration.
 * No metagame rank substitution, retrospective reseeding or chosen openings.
 * @param {object} registration
 * @returns {Array<object>}
 */
function validateMirroredRegistration(registration){
  assert.equal(registration?.schema,
    'agent1-issue25-mirrored-original-source-r6-r11-v1');
  assert.equal(registration.maxNativeRootActionsPerArm,48);
  assert.deepEqual(registration.frozenOriginalSourceRanks,[6,11]);
  assert.ok(Array.isArray(registration.trials));
  assert.equal(registration.trials.length,8);
  const ids=new Set(),groups=new Map(),observed=new Map();
  for(const row of registration.trials){
    assert.ok([6,11].includes(row.rank));
    assert.ok(['A','B'].includes(row.candidateSlot));
    assert.ok(EXPECTED_CANDIDATES.includes(row.candidateId));
    assert.ok(Number.isSafeInteger(row.repeat)&&row.repeat>=0);
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&row.seed<=0xffffffff);
    const id=[row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':');
    assert.equal(row.id,id);
    assert.ok(!ids.has(id),'duplicate registered trial ID');
    ids.add(id);
    const key=[row.rank,row.repeat,row.candidateSlot].join(':');
    const group=groups.get(key)??{seed:row.seed,candidates:[]};
    assert.equal(group.seed,row.seed,'paired original source seed mismatch');
    group.candidates.push(row.candidateId);
    groups.set(key,group);
    const sourceSeat=row.candidateSlot==='A'?1:0;
    observed.set(row.rank,new Set([...(observed.get(row.rank)??[]),sourceSeat]));
  }
  assert.equal(groups.size,4);
  for(const group of groups.values())
    assert.deepEqual(group.candidates.sort(),[...EXPECTED_CANDIDATES].sort());
  for(const rank of [6,11])
    assert.deepEqual([...observed.get(rank)].sort(),[0,1]);
  return registration.trials.map(row=>({...row}));
}

function loadMirroredRegistration(){
  return JSON.parse(fs.readFileSync(
    path.join(ROOT,REGISTRATION_PATH),'utf8'));
}

/**
 * Run the same source-independent actor-policy composition as v5 with fresh,
 * distinct rank×seat groups. This is an exploratory source-seat coverage
 * experiment. Even terminal raw games do not enter competitive win samples.
 *
 * @param {{runner?:Function,layers?:object,attackLayer?:Function}} [deps]
 */
function runMirroredIssue25V6(deps={}){
  const registration=loadMirroredRegistration();
  const trials=validateMirroredRegistration(registration);
  const ids=trials.map(row=>row.id);
  const run=deps.runner??runDevelopment;
  const selected=runJoinedIssue25V5({
    runner:options=>run({...options,
      registeredTrials:trials.map(t=>({...t})),
      registeredFrameName:registration.schema}),
    registeredTrialIds:ids,
    layers:deps.layers,
    attackLayer:deps.attackLayer
  });
  const observedSeats=new Map([ [6,new Set()],[11,new Set()] ]);
  for(const row of selected.diagnostic.attemptedRows){
    const rank=Number(row.id?.split(':')[0]);
    const recovered=row.originalSourceSeat??
      row.nativeAbortProvenance?.sourceSeat??null;
    if((recovered===0||recovered===1)&&observedSeats.has(rank))
      observedSeats.get(rank).add(recovered);
  }
  const observedSourceSeatCrossTab=Object.fromEntries(
    [...observedSeats].map(([rank,seats])=>[
      String(rank),[...seats].sort()
    ]));
  const designedSourceSeatCrossTab={'6':[0,1],'11':[0,1]};
  const manifest={
    ...selected.manifest,
    version:VERSION,
    policyEntryPoint:EXTRA_HASH_PATHS[0],
    profile:'fresh-preregistered-eight-arm-mirrored-rank6-rank11-development',
    historicalOnly:false,
    precommittedDevelopmentRegistration:REGISTRATION_PATH,
    originallySelectedFourHistoricalArmsRetainedAsSeparateReceipts:true,
    originalSourceRanks:[6,11],
    requiredRankAndSourceSeatCoverage:designedSourceSeatCrossTab,
    developmentTrialCount:8,
    nativeRootActionLimit:48,
    verifiedFull32SourceField:false,
    registeredTrialIDs:ids,
    resolvedSourceAndPolicyHashes:[
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified:false,competitiveGamesQualified:0
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    expectedMirroredEightArmIDs:ids,
    designedSourceSeatCrossTab,
    observedSourceSeatCrossTab,
    bothSourceSeatsObservedPerRank:
      [6,11].every(rank=>observedSeats.get(rank).size===2),
    verdict:'FAIL-mirrored-development-only-not-qualified-games',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}

module.exports={VERSION,REGISTRATION_PATH,EXTRA_HASH_PATHS,
  validateMirroredRegistration,loadMirroredRegistration,runMirroredIssue25V6};
