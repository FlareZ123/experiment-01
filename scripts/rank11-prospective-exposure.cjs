'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {deriveSlotSeeds} = require('./aichi-decorrelated-seeds.cjs');

const CANDIDATES = Object.freeze([
  'champion-reference', 'new-moon-lockbreaker-v1'
]);
const RANK = 11;
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const POLICY_ID = 'rank11-autonomous-boostshake-v1';
const FROZEN_FILES = Object.freeze([
  'simulation/twinleaf/rank11-autonomous-opener.cjs',
  'simulation/twinleaf/policy-profiles.cjs',
  'simulation/twinleaf/rank11-boostshake-opening-eligibility.cjs',
  'simulation/twinleaf/headless.cjs'
]);

/** @param {unknown} value @returns {string} */
function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** @param {string} content @returns {string} */
function gitBlobSha(content) {
  const data=Buffer.from(content,'utf8');
  return createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');
}

/** @param {string} root @returns {Record<string,string>} */
function pinnedFileBlobs(root) {
  return Object.fromEntries(FROZEN_FILES.map(file => [
    file,gitBlobSha(fs.readFileSync(path.join(root,file),'utf8'))
  ]));
}

/**
 * Create a prospective rank-11 exposure schedule without observing game outcomes.
 * Seeds are generated independently for each physical seat, then reused between
 * the two unchanged candidate inventories for a diagnostic comparison. These
 * paired observations are not independent competitive games.
 *
 * @param {object} campaign Independently source-verified v3 campaign.
 * @param {{seedBase:number,repeats:number,fileBlobs:Record<string,string>}} config
 * @returns {object} Immutable, digest-addressed registration.
 */
function makeRank11ExposureFrame(campaign,config) {
  if (campaign.seedProtocol!=='decorrelated-slots-v3' ||
      !campaign.pilotRanks?.includes(RANK) ||
      !/^[a-f0-9]{64}$/.test(campaign.planDigest||'')) {
    throw new Error('Require a verified source-locked v3 campaign including rank11');
  }
  const {seedBase,repeats,fileBlobs}=config;
  if (!Number.isSafeInteger(seedBase) || seedBase<1 ||
      seedBase>0xffffffff || !Number.isInteger(repeats) ||
      repeats<2 || repeats>99) {
    throw new Error('Predeclare a 32-bit seed base and 2..99 repetitions');
  }
  if (!fileBlobs || FROZEN_FILES.some(file =>
    !/^[a-f0-9]{40}$/.test(fileBlobs[file]||''))) {
    throw new Error('Policy and engine research files need pinned Git blob IDs');
  }
  const source=campaign.trials.filter(trial=>trial.rank===RANK &&
    trial.phase==='pilot');
  if (source.length!==campaign.repeats*CANDIDATES.length*2 &&
      source.length<4) {
    throw new Error('No complete rank11 source pilot available');
  }
  const opponents=new Set(source.map(trial=>trial.opponentDigest));
  if (opponents.size!==1 || !/^[a-f0-9]{64}$/.test([...opponents][0])) {
    throw new Error('Rank11 source identity must be singular and printing-sensitive');
  }
  const candidates=CANDIDATES.map(id=>{
    const row=campaign.candidateRows.find(candidate=>candidate.id===id);
    if (!row || !/^[a-f0-9]{64}$/.test(row.deckDigest)) {
      throw new Error('Missing source-locked candidate '+id);
    }
    return {id,deckDigest:row.deckDigest,
      provisionalEnglishProxy:row.provisionalEnglishProxy===true};
  });
  const trials=[];
  for(let repeat=0;repeat<repeats;repeat++){
    const seeds=deriveSlotSeeds(seedBase,'pilot',RANK,repeat);
    for(const candidate of candidates){
      for(const seat of ['A','B']){
        trials.push({
          trialId:'rank11-exposure-v1:'+candidate.id+':'+repeat+':'+seat,
          candidateId:candidate.id,candidateDigest:candidate.deckDigest,
          opponentRank:RANK,opponentDigest:[...opponents][0],
          repeat,candidateEngineSlot:seat,
          opponentEngineSeat:seat==='A'?1:0,
          seed:seeds[seat],
          actualFirstPlayer:'unknown-until-verified-source-draw'
        });
      }
    }
  }
  const frame={
    schema:'aichi-rank11-prospective-actual-start-exposure-v1',
    createdFor:'source-opportunity-and-candidate-response-diagnostics',
    sourceCampaignPlanDigest:campaign.planDigest,
    sourceFieldDigest:campaign.fieldDigest,
    candidateRows:candidates,rank11SourceDigest:[...opponents][0],
    engineRevision:ENGINE_PIN,policyProfile:POLICY_ID,
    pinnedResearchFileBlobs:Object.fromEntries(
      FROZEN_FILES.map(file=>[file,fileBlobs[file]])),
    seedProtocol:'decorrelated-slots-v3',
    seedBase,repeats,
    actualStartAccrualRule:'attempt-every-predeclared-seed; never filter by turn order, lock exposure, outcome, or game success',
    exposureThresholdPerCandidateAndSeat: {
      rank11First:2,rank11Second:2,completedFirstTurnGarbodor:1
    },
    trials
  };
  return {...frame,frameSha256:sha256(frame)};
}

/** @param {object} frame @returns {boolean} */
function verifyFrameDigest(frame){
  const {frameSha256,...payload}=frame;
  return frameSha256===sha256(payload);
}

/**
 * Audit raw observation rows with a complete denominator. This function
 * deliberately has no input for winner scores. Missing trials and policy
 * opportunities remain visible. "Covered" is exposure only and is never
 * evidence of a competitively qualified match.
 *
 * @param {object} frame
 * @param {object[]} observations Zero or one raw record per registered trial.
 * @returns {object}
 */
function auditRank11Exposure(frame,observations){
  if(!verifyFrameDigest(frame))throw new Error('Registration digest mismatch');
  if(!Array.isArray(observations))throw new Error('Observations must be an array');
  const planned=new Map(frame.trials.map(trial=>[trial.trialId,trial]));
  if(planned.size!==frame.trials.length)throw new Error('Repeated registered trial IDs');
  const received=new Map();
  for(const row of observations){
    const plan=planned.get(row.trialId);
    if(!plan || received.has(row.trialId))throw new Error('Unknown or repeated trial');
    if(row.seed!==plan.seed || row.candidateDigest!==plan.candidateDigest ||
        row.opponentDigest!==plan.opponentDigest ||
        row.candidateEngineSlot!==plan.candidateEngineSlot ||
        row.observedPolicyProfile!==frame.policyProfile){
      throw new Error('Raw outcome conflicts with frozen source or policy');
    }
    received.set(row.trialId,row);
  }
  const cells=[];
  const attempts=[];
  for(const candidate of frame.candidateRows){
    for(const seat of ['A','B']){
      const plannedCell=frame.trials.filter(trial=>
        trial.candidateId===candidate.id && trial.candidateEngineSlot===seat);
      const cell={candidateId:candidate.id,candidateEngineSlot:seat,
        planned:plannedCell.length,observed:0,missing:0,
        unverifiedStart:0,rank11First:0,rank11Second:0,
        firstTurnPolicyOpportunity:0,completedFirstTurnGarbodor:0,
        candidateResponseObservedAfterLock:0,failedOrUnfinished:0};
      for(const trial of plannedCell){
        const row=received.get(trial.trialId);
        if(!row){
          cell.missing++;
          attempts.push({trialId:trial.trialId,status:'missing-attempt'});
          continue;
        }
        cell.observed++;
        if(row.finished!==true)cell.failedOrUnfinished++;
        const slot=row.firstTurnSlot,verified=row.verifiedByDrawLog===true;
        if(!verified || ![0,1].includes(slot)){
          cell.unverifiedStart++;
          attempts.push({trialId:trial.trialId,status:'unverified-start',
            reason:row.status||null});
          continue;
        }
        const rank11First=slot===trial.opponentEngineSeat;
        if(rank11First)cell.rank11First++;
        else cell.rank11Second++;
        const policy=row.sourcePolicyAudit;
        if(policy && policy.sourceSeat!==trial.opponentEngineSeat){
          throw new Error('Rank11 policy attached to wrong physical seat');
        }
        if(policy?.opportunityDetected===true){
          if(!rank11First)throw new Error('First-turn-only rank11 policy fired on second start');
          cell.firstTurnPolicyOpportunity++;
        }
        if(policy?.completeAtDecisionBoundary===true){
          if(!rank11First || policy.opportunityDetected!==true ||
              policy.attemptedActions!==11){
            throw new Error('Garbodor completion lacks complete first-turn proof');
          }
          cell.completedFirstTurnGarbodor++;
          if(row.candidateResponse?.playerSlot===
              (trial.candidateEngineSlot==='A'?0:1) &&
             row.candidateResponse?.turnBefore===2 &&
             row.candidateResponse?.legalStateTransitionWitness===true){
            cell.candidateResponseObservedAfterLock++;
          }
        }
        attempts.push({trialId:trial.trialId,status:'verified-start',
          rank11First,opportunityDetected:policy?.opportunityDetected===true,
          completedFirstTurnGarbodor:policy?.completeAtDecisionBoundary===true,
          candidateResponseObserved:row.candidateResponse?.legalStateTransitionWitness===true});
      }
      const threshold=frame.exposureThresholdPerCandidateAndSeat;
      cell.exposureCovered=cell.missing===0 && cell.unverifiedStart===0 &&
        cell.rank11First>=threshold.rank11First &&
        cell.rank11Second>=threshold.rank11Second &&
        cell.completedFirstTurnGarbodor>=threshold.completedFirstTurnGarbodor &&
        cell.candidateResponseObservedAfterLock>0;
      cells.push(cell);
    }
  }
  return {
    schema:'aichi-rank11-exposure-audit-v1',
    frameSha256:frame.frameSha256,
    scheduled:frame.trials.length,received:observations.length,
    fullyObserved:observations.length===frame.trials.length,
    allCellsExposed:cells.every(c=>c.exposureCovered),
    cells,attempts,
    qualifiedCompetitiveGames:0,
    warning:'A verified first-turn exposure is an experimental gate, not a win-rate estimate. Candidate response and paper-rule fidelity require separate review.'
  };
}

/**
 * Load the actual verified repo campaign and freeze its current policy files.
 * Save the output before running any matching experiment.
 * @param {{seedBase?:number,repeats?:number}} options
 */
function freezeCurrentRank11Frame(options={}){
  const {loadCampaignInputs,verifyCampaign} =
    require('../simulation/evaluation/aichi-campaign-runner.cjs');
  const {loadDefaultCampaign} = require('./aichi-comparison-campaign.cjs');
  const inputs=loadCampaignInputs();
  inputs.campaign=loadDefaultCampaign('decorrelated-slots-v3');
  const campaign=verifyCampaign(inputs);
  const root=path.resolve(__dirname,'..');
  return makeRank11ExposureFrame(campaign,{
    seedBase:options.seedBase??20261018,repeats:options.repeats??16,
    fileBlobs:pinnedFileBlobs(root)
  });
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(freezeCurrentRank11Frame(),null,2)+'\n');
}
module.exports={CANDIDATES,RANK,ENGINE_PIN,POLICY_ID,FROZEN_FILES,
  gitBlobSha,pinnedFileBlobs,makeRank11ExposureFrame,verifyFrameDigest,
  auditRank11Exposure,freezeCurrentRank11Frame};
