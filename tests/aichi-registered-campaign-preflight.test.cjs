'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
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

test('seed hash rank and original source rank cannot diverge silently',()=>{
  assert.throws(()=>preflightCampaign({...seed,rank:25},pins,fixture),
    /hash rank disagrees/);
});

test('mutated original rank26 source pin rejected before any attempt',()=>{
  const bad=structuredClone(pins);
  bad.originalPrints[0].printed60Sha256='f'.repeat(64);
  assert.throws(()=>preflightCampaign(seed,bad,fixture),
    /printed source drifted/);
});
