'use strict';

const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const {preflightRegisteredSeedPlan}=
  require('./aichi-registered-seed-preflight.cjs');
const {preflightOriginalSourcePins}=
  require('./aichi-registered-original60-preflight.cjs');

/**
 * Keep two versioned source and seed manifests cross-consistent before the
 * first native import. Both individual validators remain reusable.
 *
 * @param {object} seedPlan Frozen physical-deal and arm contract.
 * @param {object} originalPins Registered paper-source and engine contract.
 * @param {object} [inputs] Optional pure-test dependencies for both validators.
 * @returns {object}
 */
function preflightCampaign(seedPlan,originalPins,inputs={}){
  const seed=preflightRegisteredSeedPlan(seedPlan,inputs);
  const originals=preflightOriginalSourcePins(originalPins,inputs);
  assert.equal(seed.campaignId,originals.campaignId,
    'independent source and seed manifests refer to different campaigns');
  const source=originals.sourcePrints.find(row=>row.role==='source');
  assert.ok(source,'original source role required');
  assert.equal(seedPlan.rank,source.rank,
    'v3 source seed hash rank disagrees with pinned source 60');
  assert.equal(seed.summary.sourceSeat0,seed.summary.sourceSeat1,
    'source distribution must be balanced between both seats');
  return Object.freeze({
    campaignId:seed.campaignId,
    seedPlanManifestSha256:seed.manifestSha256,
    sourceRank:source.rank,
    opponentRank:originals.sourcePrints.find(row=>row.role==='opponent').rank,
    engineGitlinkSha:originals.engineGitlinkSha,
    outputFilename:originals.outputFilename,
    policyProfile:originals.policyProfile,
    physicalPairs:seed.summary.physicalPairs,
    nativeAttempts:seed.summary.nativeAttempts,
    physicalDealParityVerified:false,
    nativeGamesExecuted:0,
    competitiveGamesQualified:0
  });
}

/** @param {string} seedPath @param {string} sourcePinPath */
function preflightCampaignFiles(seedPath,sourcePinPath){
  return preflightCampaign(
    JSON.parse(readFileSync(path.resolve(seedPath),'utf8')),
    JSON.parse(readFileSync(path.resolve(sourcePinPath),'utf8')));
}

if(require.main===module){
  assert.equal(process.argv.length,4);
  const result=preflightCampaignFiles(process.argv[2],process.argv[3]);
  process.stdout.write('AICHI_CAMPAIGN_PREFLIGHT_OK '+JSON.stringify(result)+'\n');
}

module.exports={preflightCampaign,preflightCampaignFiles};
