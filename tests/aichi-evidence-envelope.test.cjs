'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {buildCampaign} = require('../scripts/aichi-comparison-campaign.cjs');
const {auditArchive,createEvidenceEnvelope,hasMatchingResearchConditions} =
  require('../simulation/evaluation/aichi-evidence-envelope.cjs');

/** @returns {object} */
function fixture() {
  const field = Array.from({length:32},(_,i)=>({
    rank:i+1,player:'P'+(i+1),archetype:'Synthetic',published:i===0
  }));
  const card = name => ({name,count:60,printing:{set:'SYN',number:'1',language:'en'}});
  const source = {decks:[{rank:1,player:'P1',archetype:'Synthetic',cards:[card('Enemy')]}]};
  const candidates = [{id:'reference',cards:[card('Friend')]}];
  const campaign = buildCampaign({field,source,candidates,pilotRanks:[1]});
  const trials = campaign.trials.filter(t=>t.phase==='pilot');
  const proof = {firstTurnSlot:0,firstTurnPlayerId:101,
    firstTurnPlayerName:'research-A',firstDrawLogName:'research-A',
    verifiedByDrawLog:true};
  const h1='a'.repeat(64),h2='b'.repeat(64);
  const records=trials.map(t=>({
    ...t,status:'completed',firstTurn:{...proof},
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
    {completed:2,failures:0,verifiedFirst:1,verifiedSecond:1});
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
