'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {loadDefaultCampaign}=require('../scripts/aichi-comparison-campaign.cjs');
const {loadCampaignInputs}=require('../simulation/evaluation/aichi-campaign-runner.cjs');
const {freezeFullPhaseSchedule,freezeDefaultAichiSchedule}=
  require('../scripts/aichi-frozen-trial-schedule.cjs');

/** @param {unknown} value @returns {string} */
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('all published-field rank/physical-slot records are registered unchanged',()=>{
  const document=freezeDefaultAichiSchedule({
    phase:'published-field',candidateId:'champion-reference'
  });
  assert.equal(document.schema_version,1);
  assert.equal(document.seedProtocol,'decorrelated-slots-v3');
  assert.equal(document.sourceRankCount,29);
  assert.deepEqual(document.unavailableSourceRanks,[23,25,28]);
  assert.equal(document.expected_trials.length,58);
  assert.equal(document.expected_trials.every(row=>
    row.rank!==23&&row.rank!==25&&row.rank!==28),true);
  assert.equal(document.scheduleSha256,sha(
    Object.fromEntries(Object.entries(document)
      .filter(([key])=>key!=='scheduleSha256'))));
  const seen=new Set();
  for(const row of document.expected_trials){
    const key=row.rank+':'+row.candidate_side;
    assert.equal(seen.has(key),false);
    seen.add(key);
    assert.match(row.game_id,/^published-field:\d+:0:champion-reference:[AB]$/);
    assert.ok(Number.isInteger(row.seed)&&row.seed>=0&&row.seed<=0xffffffff);
  }
  assert.equal(seen.size,58);
});

test('pilot registration is the full ten-rank source plan, including rank11',()=>{
  const plan=freezeDefaultAichiSchedule({
    phase:'pilot',candidateId:'new-moon-lockbreaker-v1'
  });
  assert.equal(plan.expected_trials.length,20);
  assert.ok(plan.expected_trials.some(row=>row.rank===11));
  assert.equal(plan.expected_trials.filter(row=>row.rank===11).length,2);
  assert.match(plan.candidateDeckSha256,/^[0-9a-f]{64}$/);
  assert.equal(plan.phase,'pilot');
});

test('predeclared source input and schedule are deterministic',()=>{
  const choice={phase:'published-field',candidateId:'hood-shield-v1'};
  assert.deepEqual(freezeDefaultAichiSchedule(choice),freezeDefaultAichiSchedule(choice));
  const inputs=loadCampaignInputs();
  inputs.campaign=loadDefaultCampaign('decorrelated-slots-v3');
  const registered=freezeFullPhaseSchedule(inputs,choice);
  assert.equal(registered.expected_trials.length,58);
  const underlying=inputs.campaign.trials.filter(t=>
    t.phase===choice.phase&&t.candidateId===choice.candidateId);
  assert.deepEqual(registered.expected_trials.map(x=>x.game_id),
    underlying.map(x=>x.trialId));
  assert.deepEqual(registered.expected_trials.map(x=>x.seed),
    underlying.map(x=>x.seed));
});

test('corrupted committed plan, unknown candidate and a filtered schedule fail closed',()=>{
  const inputs=loadCampaignInputs();
  inputs.campaign=loadDefaultCampaign('decorrelated-slots-v3');
  const good={phase:'pilot',candidateId:'champion-reference'};
  assert.throws(()=>freezeFullPhaseSchedule(inputs,{
    ...good,candidateId:'not-a-candidate'
  }),/Candidate absent/);
  assert.throws(()=>freezeFullPhaseSchedule(inputs,{
    ...good,phase:'unknown-phase'
  }),/Declare a recognized phase/);
  const changed={
    ...inputs,campaign:{...inputs.campaign,
      trials:inputs.campaign.trials.filter(row=>
        row.trialId!=='pilot:11:0:champion-reference:A')}
  };
  assert.throws(()=>freezeFullPhaseSchedule(changed,good),/Campaign planDigest/);
  const tampered={
    ...inputs,campaign:{...inputs.campaign,
      planDigest:'f'.repeat(64)}
  };
  assert.throws(()=>freezeFullPhaseSchedule(tampered,good),/Campaign planDigest/);
});
