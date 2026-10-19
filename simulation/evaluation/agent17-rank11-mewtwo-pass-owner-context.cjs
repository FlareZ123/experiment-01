'use strict';

const assert = require('node:assert/strict');
const {developmentTrials, executeDevelopment} =
  require('./agent41-bilateral-v2-development.cjs');

const HISTORICAL_ARM_ID = '11:2:B:new-moon-lockbreaker-v1';

/**
 * Reinspect exactly one existing development deal. No newly sampled seeds
 * or wins may be mixed with prospectively registered experiments.
 * @returns {object}
 */
function historicalArm() {
  const row = developmentTrials().find(trial=>trial.id===HISTORICAL_ARM_ID);
  assert.ok(row, 'Historical candidate/source arm must remain registered');
  assert.equal(row.rank, 11);
  assert.equal(row.candidateId, 'new-moon-lockbreaker-v1');
  return row;
}

/** @returns {object} Complete one-arm reproducibility and public evidence. */
function run() {
  const {planAichi} = require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate} =
    require('../../scripts/aichi-new-moon-candidate.cjs');
  const trial=historicalArm();
  const prepared=new Map([[trial.candidateId, {
    plan:planAichi({
      label:'new-moon-lockbreaker-v1',
      cards:loadNewMoonCandidate().cards
    },{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })
  }]]);
  const row=executeDevelopment(trial,prepared);
  assert.equal(row.trial.id,HISTORICAL_ARM_ID);
  assert.equal(row.qualifiesForCompetitiveInference,false);
  return {
    schema:'agent17-single-archived-rank11-mewtwo-pass-owner-context-v1',
    historicalArmId:HISTORICAL_ARM_ID,
    source:'same rank11 physical deal and frozen both-player development policies',
    row,
    competitiveQualifiedGames:0,
    winRateCertified:false
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={HISTORICAL_ARM_ID,historicalArm,run};
