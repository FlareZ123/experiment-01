'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const {buildCampaign} = require('../scripts/aichi-comparison-campaign.cjs');
const {auditArchive,createEvidenceEnvelope,hasMatchingResearchConditions} =
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
    winner:'candidate',expectedEngineDeckHashes:[h1,h2],
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
  const changed=createEvidenceEnvelope(inputs,archive,{
    ...provenance,effectiveMatchOptions:{isolatePolicyRandomness:false}
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
