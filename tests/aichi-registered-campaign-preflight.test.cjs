'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {createHash}=require('node:crypto');
const path=require('node:path');
const {preflightCampaign,preflightCampaignFiles}=
  require('../scripts/aichi-registered-campaign-preflight.cjs');
const ROOT=path.resolve(__dirname,'..');
const seedPath=path.join(ROOT,
  'results/aichi-2026/registrations/agent47-rank26-natural-owner-seed-plan-v2.json');
const pinsPath=path.join(ROOT,
  'results/aichi-2026/registrations/agent47-rank26-original-source-native-pins-v1.json');
const seed=JSON.parse(readFileSync(seedPath,'utf8'));
const pins=JSON.parse(readFileSync(pinsPath,'utf8'));
const roster=JSON.parse(readFileSync(path.join(ROOT,
  'results/aichi-2026/full-decklists.json'),'utf8'));
const admission=JSON.parse(readFileSync(path.join(ROOT,
  'results/aichi-2026/original-printed60-admission-v1.json'),'utf8'));
const fixture={roster,admission,gitlinkSha:pins.engineGitlinkSha};

test('both independent manifest files form one valid preregistered source campaign',()=>{
  const receipt=preflightCampaignFiles(seedPath,pinsPath);
  assert.equal(receipt.sourceRank,26);
  assert.equal(receipt.opponentRank,6);
  assert.equal(receipt.nativeAttempts,48);
  assert.equal(receipt.physicalPairs,24);
  assert.equal(receipt.nativeGamesExecuted,0);
  assert.equal(receipt.physicalDealParityVerified,false);
});

test('same valid manifests under pure dependency seam',()=>{
  assert.equal(preflightCampaign(seed,pins,fixture).nativeAttempts,48);
});

test('different campaign IDs fail before native compile',()=>{
  assert.throws(()=>preflightCampaign(seed,{...pins,campaignId:'different-campaign'},fixture),
    /different campaigns/);
});

test('seed hash rank and original source rank cannot diverge even with a reapproved digest',()=>{
  const changed={...seed,rank:25};
  const digest=createHash('sha256').update(JSON.stringify(changed)).digest('hex');
  assert.throws(()=>preflightCampaign(changed,{...pins,seedPlanSha256:digest},fixture),
    /hash rank disagrees/);
});

test('mutated original rank26 source pin rejected before any attempt',()=>{
  const bad=structuredClone(pins);
  bad.originalPrints[0].printed60Sha256='f'.repeat(64);
  assert.throws(()=>preflightCampaign(seed,bad,fixture),
    /printed source drifted/);
});

test('valid but posthoc shuffled seed-index order fails immutable registered digest',()=>{
  const changed={...seed,repeats:[...seed.repeats].reverse()};
  assert.throws(()=>preflightCampaign(changed,pins,fixture),
    /independently registered frozen manifest digest/);
});

test('valid but posthoc reselected 12 repeat indices fail reviewed digest',()=>{
  const changed={...seed,repeats:Array.from({length:12},(_,i)=>40+i)};
  assert.throws(()=>preflightCampaign(changed,pins,fixture),
    /independently registered frozen manifest digest/);
});

test('same range but changed registered seed base fails reviewed digest',()=>{
  const changed={...seed,seedBase:seed.seedBase+1};
  assert.throws(()=>preflightCampaign(changed,pins,fixture),
    /independently registered frozen manifest digest/);
});

test('seed-plan SHA256 is independently fixed and matches actual registered JSON',()=>{
  const digest=createHash('sha256').update(JSON.stringify(seed)).digest('hex');
  assert.equal(digest,pins.seedPlanSha256);
});
