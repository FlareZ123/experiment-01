'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const {buildCampaign} = require('../scripts/aichi-comparison-campaign.cjs');
const {auditArchive,createEvidenceEnvelope,hasMatchingResearchConditions,
  hasPairedTrialSchedule} =
  require('../simulation/evaluation/aichi-evidence-envelope.cjs');

/** @returns {object} */
function fixture(mirror = false) {
  const field = Array.from({length:32},(_,i)=>({
    rank:i+1,player:'P'+(i+1),archetype:'Synthetic',published:i===0
  }));
  const card = name => ({name,count:60,printing:{set:'SYN',number:'1',language:'en'}});
  const source = {decks:[{rank:1,player:'P1',archetype:'Synthetic',cards:[card(mirror?'Friend':'Enemy')]}]};
  const candidates = [{id:'reference',cards:[card('Friend')]}];
  const campaign = buildCampaign({field,source,candidates,pilotRanks:[1]});
  const trials = campaign.trials.filter(t=>t.phase==='pilot');
  const proof = {firstTurnSlot:0,firstTurnPlayerId:101,
    firstTurnPlayerName:'research-A',firstDrawLogName:'research-A',
    verifiedByDrawLog:true};
  const h1='a'.repeat(64),h2='b'.repeat(64);
  const records=trials.map(t=>({
    ...t,status:'completed',firstTurn:{...proof},
    observedSeed:t.seed,exactSourceMirror:mirror,
    potentialReplayAliasKey:mirror ? digest({phase:t.phase,rank:t.rank,
      seed:t.seed,candidateDigest:t.candidateDigest,
      opponentDigest:t.opponentDigest}) : null,
    candidateTrueTurn:t.candidateEngineSlot==='A'?'first':'second',
    observedWinnerIndex:0,observedFinished:true,
    observedEngine:'twinleafgg/pinned-test',
    resolvedEngineRevision:'pinned-test',
    observedRngProtocol:'isolated-policy-rng',
    observedPolicy:'test-policy',
    effectiveMatchOptions:{strictPromptValidation:true,isolatePolicyRandomness:true},
    winner:t.candidateEngineSlot==='A'?'candidate':'opponent',
    expectedEngineDeckHashes:[h1,h2],
    observedEngineDeckHashes:[h1,h2]
  }));
  const archive={schemaVersion:1,planDigest:campaign.planDigest,phase:'pilot',
    recordedTrials:2,selectedTrialIds:trials.map(t=>t.trialId),
    competitiveWinRateCertified:false,rulesAndBotCompetenceCertified:false,records};
  const provenance={researchRevision:'commit-test',engineRevision:'pinned-test',
    rulesetRevision:'paper-expanded-test',candidatePolicyRevision:'test-policy',
    opponentPolicyRevision:'test-policy',rngProtocol:'isolated-policy-rng',
    effectiveMatchOptions:{strictPromptValidation:true,isolatePolicyRandomness:true}};
  return {inputs:{field,source,candidates,campaign},archive,provenance};
}

test('valid paired trials preserve real first/second turn counts',()=>{
  const {inputs,archive}=fixture();
  assert.deepEqual(auditArchive(inputs,archive),
    {completed:2,failures:0,verifiedFirst:1,verifiedSecond:1,
      potentialDuplicateMirrorGames:0,maximumDistinctCompletedTrajectories:2});
});

test('modified schedule, turn proof, and engine hashes fail validation',()=>{
  const {inputs,archive}=fixture();
  archive.records[0].seed++;
  assert.throws(()=>auditArchive(inputs,archive),/Scheduled trial/);
  archive.records[0].seed--;
  archive.records[0].firstTurn.firstDrawLogName='wrong';
  assert.throws(()=>auditArchive(inputs,archive),/Unverifiable/);
  archive.records[0].firstTurn.firstDrawLogName='research-A';
  archive.records[0].observedEngineDeckHashes[0]='invalid';
  assert.throws(()=>auditArchive(inputs,archive),/Completed game/);
});

test('unfinished record cannot silently become a win',()=>{
  const {inputs,archive}=fixture();
  archive.records[0].status='unfinished';
  assert.throws(()=>auditArchive(inputs,archive),/Noncompleted/);
  archive.records[0].winner=null;
  assert.equal(auditArchive(inputs,archive).failures,1);
});

test('provenance envelope is explicitly uncertified and comparison-sensitive',()=>{
  const {inputs,archive,provenance}=fixture();
  const left=createEvidenceEnvelope(inputs,archive,provenance);
  assert.match(left.fingerprint,/^[a-f0-9]{64}$/);
  assert.equal(left.competitiveWinRateCertified,false);
  assert.equal(left.fullActionReplayAvailable,false);
  const same=createEvidenceEnvelope(inputs,archive,{...provenance});
  assert.equal(hasMatchingResearchConditions(left,same),true);
  const alternate=fixture();
  const alternateOptions={...alternate.provenance.effectiveMatchOptions,
    isolatePolicyRandomness:false};
  for (const row of alternate.archive.records) {
    row.effectiveMatchOptions={...alternateOptions};
  }
  const changed=createEvidenceEnvelope(alternate.inputs,alternate.archive,{
    ...alternate.provenance,effectiveMatchOptions:alternateOptions
  });
  assert.equal(hasMatchingResearchConditions(left,changed),false);
  assert.throws(()=>createEvidenceEnvelope(inputs,archive,{
    ...provenance,engineRevision:''
  }),/provenance/);
});

test('a same-seed source mirror pair contributes at most one trajectory',()=>{
  const {inputs,archive}=fixture(true);
  const audit=auditArchive(inputs,archive);
  assert.equal(audit.completed,2);
  assert.equal(audit.potentialDuplicateMirrorGames,1);
  assert.equal(audit.maximumDistinctCompletedTrajectories,1);
  archive.records[1].potentialReplayAliasKey='fabricated';
  assert.throws(()=>auditArchive(inputs,archive),/mirror replay alias/);
});

test('actual reported seed and policy provenance take priority',()=>{
  const {inputs,archive,provenance}=fixture();
  archive.records[0].observedSeed++;
  assert.throws(()=>auditArchive(inputs,archive),/Completed game/);
  archive.records[0].observedSeed--;
  archive.records[0].observedEngine='twinleafgg/pinned-test';
  archive.records[0].resolvedEngineRevision='pinned-test';
  archive.records[0].observedRngProtocol='isolated-policy-rng';
  archive.records[0].observedPolicy='test-policy';
  archive.records[0].effectiveMatchOptions={...provenance.effectiveMatchOptions};
  assert.equal(createEvidenceEnvelope(inputs,archive,provenance).audit.completed,2);
  archive.records[0].effectiveMatchOptions.isolatePolicyRandomness=false;
  assert.throws(()=>createEvidenceEnvelope(inputs,archive,provenance),/provenance conflicts/);
});

test('v2 independent-seat trial records pass envelope audit and reject protocol spoofing', () => {
  const {inputs,archive} = fixture();
  inputs.campaign = buildCampaign({
    field: inputs.field,source: inputs.source,candidates: inputs.candidates,
    pilotRanks:[1],seatSeedMode:'independent-slots-v2'
  });
  const pilot = inputs.campaign.trials.filter(x=>x.phase==='pilot');
  for (let i=0;i<archive.records.length;i++) {
    archive.records[i].seed=pilot[i].seed;
    archive.records[i].observedSeed=pilot[i].seed;
    archive.records[i].trialId=pilot[i].trialId;
  }
  archive.schemaVersion=2;
  archive.seedProtocol='independent-slots-v2';
  archive.planDigest=inputs.campaign.planDigest;
  archive.selectedTrialIds=pilot.map(x=>x.trialId);
  assert.deepEqual(pilot.map(x=>x.seed),
    [pilot[0].seed,pilot[0].seed+1]);
  assert.equal(auditArchive(inputs,archive).completed,2);
  archive.seedProtocol='paired-slots-v1';
  assert.throws(()=>auditArchive(inputs,archive),/Invalid, incomplete/);
  archive.seedProtocol='independent-slots-v2';
  archive.records[0].status='engine-protocol-mismatch';
  archive.records[0].winner=null;
  assert.equal(auditArchive(inputs,archive).failures,1);
  archive.records[0].status='engine-revision-mismatch';
  assert.equal(auditArchive(inputs,archive).failures,1);
  archive.records[0].status='policy-profile-mismatch';
  assert.equal(auditArchive(inputs,archive).failures,1);
});

test('raw terminal winner binds each candidate label to the actual physical slot', () => {
  const {inputs,archive} = fixture();
  assert.equal(auditArchive(inputs, archive).completed, 2);
  assert.equal(archive.records[0].winner, 'candidate');
  assert.equal(archive.records[1].winner, 'opponent');

  archive.records[1].winner = 'candidate';
  assert.throws(() => auditArchive(inputs, archive), /Completed game/);
  archive.records[1].winner = 'opponent';

  archive.records[0].observedWinnerIndex = 1;
  assert.throws(() => auditArchive(inputs, archive), /Completed game/);
  archive.records[0].observedWinnerIndex = 0;

  delete archive.records[0].observedWinnerIndex;
  assert.throws(() => auditArchive(inputs, archive), /Completed game/);
});

test('raw engine draw sentinel is verified in both physical candidate seats', () => {
  const {inputs,archive} = fixture();
  for (const record of archive.records) {
    record.observedWinnerIndex = 3;
    record.winner = 'draw';
  }
  assert.equal(auditArchive(inputs, archive).completed, 2);
  archive.records[0].winner = 'opponent';
  assert.throws(() => auditArchive(inputs, archive), /Completed game/);
  archive.records[0].winner = 'draw';
  archive.records[1].observedWinnerIndex = -1;
  assert.throws(() => auditArchive(inputs, archive), /Completed game/);
});

test('completed outcome must retain an affirmative raw engine-finished witness', () => {
  const {inputs,archive} = fixture();
  assert.equal(auditArchive(inputs, archive).completed, 2);
  archive.records[0].observedFinished = false;
  assert.throws(() => auditArchive(inputs, archive), /Completed game/);
  archive.records[0].observedFinished = true;
  delete archive.records[0].observedFinished;
  assert.throws(() => auditArchive(inputs, archive), /Completed game/);
});

test('completed evidence requires engine-observed provenance without optional bypasses', () => {
  const {inputs,archive,provenance} = fixture();
  assert.equal(createEvidenceEnvelope(inputs,archive,provenance).audit.completed,2);
  for (const key of ['observedEngine','resolvedEngineRevision',
    'observedRngProtocol','observedPolicy','effectiveMatchOptions']) {
    const value = archive.records[0][key];
    delete archive.records[0][key];
    assert.throws(() => createEvidenceEnvelope(inputs,archive,provenance),
      /provenance conflicts/, 'missing ' + key + ' must fail');
    archive.records[0][key] = value;
  }
  const rawSeed = archive.records[0].observedSeed;
  delete archive.records[0].observedSeed;
  assert.throws(() => auditArchive(inputs,archive), /Completed game/,
    'missing engine-reported seed must fail');
  archive.records[0].observedSeed = rawSeed;
  archive.records[0].effectiveMatchOptions = {
    ...provenance.effectiveMatchOptions, isolatePolicyRandomness:false
  };
  assert.throws(() => createEvidenceEnvelope(inputs,archive,provenance),
    /provenance conflicts/, 'changed per-run policy echo must fail');
});

test('explicit runner policy-echo mismatch is preserved as a failure', () => {
  const {inputs,archive} = fixture();
  archive.records[0].status = 'match-policy-echo-mismatch';
  archive.records[0].winner = null;
  assert.deepEqual(auditArchive(inputs,archive), {
    completed:1,failures:1,verifiedFirst:0,verifiedSecond:1,
    potentialDuplicateMirrorGames:0,maximumDistinctCompletedTrajectories:1
  });
});


test('compatible settings alone cannot certify paired trials across distinct subsets', () => {
  const full=fixture();
  const whole=createEvidenceEnvelope(full.inputs,full.archive,full.provenance);
  const subset=fixture();
  subset.archive.records=subset.archive.records.slice(1);
  subset.archive.selectedTrialIds=subset.archive.selectedTrialIds.slice(1);
  subset.archive.recordedTrials=1;
  const partial=createEvidenceEnvelope(subset.inputs,subset.archive,subset.provenance);
  assert.equal(hasMatchingResearchConditions(whole,partial),true);
  assert.equal(hasPairedTrialSchedule(whole,partial),false);

  const other=fixture();
  other.archive.records=other.archive.records.slice(0,1);
  other.archive.selectedTrialIds=other.archive.selectedTrialIds.slice(0,1);
  other.archive.recordedTrials=1;
  const disjoint=createEvidenceEnvelope(other.inputs,other.archive,other.provenance);
  assert.equal(hasMatchingResearchConditions(disjoint,partial),true);
  assert.equal(hasPairedTrialSchedule(disjoint,partial),false);
});

test('paired schedule requires actual first-turn parity and accepts record reordering', () => {
  const left=fixture();
  const a=createEvidenceEnvelope(left.inputs,left.archive,left.provenance);
  const equal=fixture();
  equal.archive.records.reverse();
  equal.archive.selectedTrialIds.reverse();
  const reordered=createEvidenceEnvelope(equal.inputs,equal.archive,equal.provenance);
  assert.equal(hasPairedTrialSchedule(a,reordered),true);

  const different=fixture();
  different.archive.records[0].firstTurn={
    firstTurnSlot:1,firstTurnPlayerId:202,firstTurnPlayerName:'research-B',
    firstDrawLogName:'research-B',verifiedByDrawLog:true
  };
  different.archive.records[0].candidateTrueTurn='second';
  const b=createEvidenceEnvelope(different.inputs,different.archive,
    different.provenance);
  assert.equal(hasMatchingResearchConditions(a,b),true);
  assert.equal(hasPairedTrialSchedule(a,b),false);
});

test('paired source cells require equal actual opponent engine-deck hashes', () => {
  const baseline=fixture();
  const left=createEvidenceEnvelope(baseline.inputs,baseline.archive,
    baseline.provenance);

  const changedCandidate=fixture();
  for (const row of changedCandidate.archive.records) {
    const candidateSlot=row.candidateEngineSlot==='A'?0:1;
    row.expectedEngineDeckHashes[candidateSlot]='d'.repeat(64);
    row.observedEngineDeckHashes[candidateSlot]='d'.repeat(64);
  }
  const candidateVariant=createEvidenceEnvelope(changedCandidate.inputs,
    changedCandidate.archive,changedCandidate.provenance);
  assert.equal(hasMatchingResearchConditions(left,candidateVariant),true);
  assert.equal(hasPairedTrialSchedule(left,candidateVariant),true,
    'candidate treatment is allowed to change its resolved deck');

  const changedOpponent=fixture();
  const sourceRow=changedOpponent.archive.records[0];
  const sourceSlot=sourceRow.candidateEngineSlot==='A'?1:0;
  sourceRow.expectedEngineDeckHashes[sourceSlot]='c'.repeat(64);
  sourceRow.observedEngineDeckHashes[sourceSlot]='c'.repeat(64);
  const opponentVariant=createEvidenceEnvelope(changedOpponent.inputs,
    changedOpponent.archive,changedOpponent.provenance);
  assert.equal(hasMatchingResearchConditions(left,opponentVariant),true);
  assert.equal(auditArchive(changedOpponent.inputs,changedOpponent.archive)
    .completed,2,'an internally consistent trial can still have a different source deck');
  assert.equal(hasPairedTrialSchedule(left,opponentVariant),false,
    'identical source digest and seed cannot hide changed resolved source printings');

  const unobserved=structuredClone(candidateVariant);
  delete unobserved.archive.records[0].observedEngineDeckHashes;
  assert.equal(hasPairedTrialSchedule(left,unobserved),false,
    'missing per-arm engine observation must fail closed');
});
