'use strict';

const assert=require('node:assert/strict');
const {plannedTrials}=require('./agent41-prospective-canonical-scout.cjs');
const registration=require('../../results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json');
const SEED=2307728896;
const LABEL='postobserved-rank11-held-Seal-development-20261029';

/** @returns {object[]} Two unchanged sixties from the originally committed plan. */
function selectedTrials(){
  const rows=plannedTrials(registration).filter(trial=>
    trial.rank===11&&trial.seed===SEED&&trial.candidateSlot==='A');
  assert.deepEqual(rows.map(trial=>trial.candidateId).sort(),
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.ok(rows.every(trial=>trial.repeat===3));
  return rows;
}

/**
 * A knowingly retrospective same-seed, same-deck, source-policy comparison.
 * Use for native capability regression only, never as competitive evidence.
 * @returns {object}
 */
function run(){
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const base={...registration.frozenRunOptions,
    registeredTrials:selectedTrials(),registeredFrameName:LABEL};
  const control=runDevelopment({...base,rank11ExclusiveOpening:false});
  const treatment=runDevelopment({...base,rank11ExclusiveOpening:true});
  const pairs=selectedTrials().map(trial=>{
    const before=control.rows.find(row=>row.trial.id===trial.id);
    const after=treatment.rows.find(row=>row.trial.id===trial.id);
    assert.ok(before&&after);
    return {id:trial.id,
      sameInitialSourceDeal:Boolean(before.sourceDealFingerprint&&
        before.sourceDealFingerprint===after.sourceDealFingerprint),
      sameAuthenticatedActualStart:before.verifiedFirstTurn===true&&
        after.verifiedFirstTurn===true&&
        before.actualStarterSeat===after.actualStarterSeat,
      beforeStatus:before.status??null,afterStatus:after.status??null,
      beforeSourceAudit:before.sourceAudit??null,
      afterExclusiveSourceAudit:after.rank11ExclusiveOpeningAudit??null,
      afterCandidateFollowupStatus:after.candidateFollowupStatus??null,
      competitiveQualified:false};
  });
  return {schema:'agent30-retrospective-rank11-exclusive-fork-v1',
    seed:SEED,enginePin:registration.enginePin,pairs,
    control,treatment,qualifiedCompetitiveGames:0};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={selectedTrials,run};
