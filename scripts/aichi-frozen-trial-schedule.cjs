'use strict';

const {createHash} = require('node:crypto');
const {verifyCampaign,loadCampaignInputs} =
  require('../simulation/evaluation/aichi-campaign-runner.cjs');
const {loadDefaultCampaign} = require('./aichi-comparison-campaign.cjs');

/** @param {unknown} data @returns {string} */
const digest = data => createHash('sha256')
  .update(JSON.stringify(data)).digest('hex');

/**
 * Produce the full, deterministic, independently source-verified sampling frame
 * for one unchanged candidate and one declared phase. The function intentionally
 * has no post-outcome trial-ID selector or success filter.
 *
 * A caller must commit this object before running matches and independently
 * retain the committed SHA/research revision. Regenerating it from observed
 * results would defeat the purpose of pre-registration.
 *
 * @param {object} inputs Inputs carrying the committed source inventories and campaign plan.
 * @param {{phase:'pilot'|'published-field',candidateId:string}} selection
 * @returns {object} Python raw-intake compatible expected_trials plus source digests.
 */
function freezeFullPhaseSchedule(inputs,selection) {
  const campaign=verifyCampaign(inputs);
  if (!selection || !['pilot','published-field'].includes(selection.phase) ||
      typeof selection.candidateId!=='string') {
    throw new Error('Declare a recognized phase and exact fixed candidate ID.');
  }
  const candidate=campaign.candidateRows.find(row=>
    row.id===selection.candidateId);
  if (!candidate) throw new Error('Candidate absent from source-verified plan.');

  const ranks=selection.phase==='pilot' ?
    campaign.pilotRanks : campaign.coverage.publishedRanks;
  const scheduled=campaign.trials.filter(trial=>
    trial.phase===selection.phase && trial.candidateId===selection.candidateId);
  const expectedCount=ranks.length*campaign.repeats*2;
  if (scheduled.length!==expectedCount) {
    throw new Error('Incomplete campaign candidate phase schedule.');
  }
  const expected=new Set();
  for(const rank of ranks) {
    for(let repeat=0;repeat<campaign.repeats;repeat++) {
      for(const slot of ['A','B']) expected.add(rank+':'+repeat+':'+slot);
    }
  }
  const trials=[];
  const ids=new Set();
  for(const trial of scheduled) {
    const key=trial.rank+':'+trial.repeat+':'+trial.candidateEngineSlot;
    if (!expected.delete(key) || ids.has(trial.trialId) ||
        trial.candidateDigest!==candidate.deckDigest ||
        !Number.isInteger(trial.seed) || trial.seed<0 ||
        trial.seed>0xffffffff) {
      throw new Error('Duplicate, invalid, or altered source phase trial.');
    }
    ids.add(trial.trialId);
    trials.push({
      game_id:trial.trialId,
      rank:trial.rank,
      seed:trial.seed,
      candidate_side:trial.candidateEngineSlot
    });
  }
  if(expected.size) throw new Error('Missing declared rank/repeat/physical slot.');

  const schedule={
    schema_version:1,
    scope:'entire-candidate-phase-no-retroactive-selection',
    campaignPlanDigest:campaign.planDigest,
    fieldDigest:campaign.fieldDigest,
    sourceRankCount:campaign.coverage.publishedRanks.length,
    unavailableSourceRanks:campaign.coverage.missingRanks,
    candidateId:candidate.id,
    candidateDeckSha256:candidate.deckDigest,
    phase:selection.phase,
    seedProtocol:campaign.seedProtocol || 'paired-slots-v1',
    seedBase:campaign.seedBase,
    repeats:campaign.repeats,
    expected_trials:trials
  };
  return {...schedule,scheduleSha256:digest(schedule)};
}

/**
 * A ready-to-commit registration from the exact repository-backed source
 * inventory and v3 physical-slot seed protocol. No game engine is needed.
 * @param {{phase:'pilot'|'published-field',candidateId:string}} selection
 * @returns {object}
 */
function freezeDefaultAichiSchedule(selection) {
  const inputs=loadCampaignInputs();
  inputs.campaign=loadDefaultCampaign('decorrelated-slots-v3');
  return freezeFullPhaseSchedule(inputs,selection);
}

module.exports={freezeFullPhaseSchedule,freezeDefaultAichiSchedule};
