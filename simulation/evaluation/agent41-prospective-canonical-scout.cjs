'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const root=path.resolve(__dirname,'../..');
const registrationPath='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const REGISTRATION_BLOB='8c54d8497f9927b04d501237462f64a42173d33d';
const SCHEMA='agent41-preregistered-32-arm-canonical-scout-v1';

/**
 * Verify the exact already-committed plan and enumerate every fixed experiment.
 * The common random integer couples candidate arms by design; their different
 * printed 60s do not imply identical full physical deals.
 * @param {object} plan
 * @returns {object[]}
 */
function plannedTrials(plan){
  assert.equal(plan.schema,'agent41-prospective-common-actor-scout-v1');
  assert.equal(plan.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(plan.ranks,[6,11]);
  assert.deepEqual(plan.candidateSlots,['A','B']);
  assert.deepEqual(plan.candidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(plan.repeats,4);
  assert.equal(plan.attempts,32);
  assert.equal(plan.pairs,16);
  assert.equal(plan.maxRootActions,260);
  const usedSeeds=new Set();
  const trials=[];
  for(const rank of plan.ranks){
    for(const slot of plan.candidateSlots){
      const seeds=plan.seeds[String(rank)]?.[slot];
      assert.ok(Array.isArray(seeds)&&seeds.length===plan.repeats);
      for(let repeat=0;repeat<plan.repeats;repeat++){
        const seed=seeds[repeat];
        assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
        assert.ok(!usedSeeds.has(seed),'Independent seed reused across source/seat cells');
        usedSeeds.add(seed);
        for(const candidateId of plan.candidateIds){
          trials.push({rank,repeat,seed,candidateSlot:slot,candidateId,
            id:[rank,repeat,slot,candidateId].join(':')});
        }
      }
    }
  }
  assert.equal(trials.length,plan.attempts);
  assert.equal(usedSeeds.size,plan.pairs);
  return trials;
}

/**
 * Classify every attempted native game, including exceptions and capped games.
 * This is an execution-quality census, never a competitive win-rate estimator.
 * @param {object} result
 * @param {object} plan
 * @returns {object}
 */
function census(result,plan){
  const scheduled=plannedTrials(plan);
  assert.equal(result.attempted,scheduled.length);
  assert.equal(result.rows.length,scheduled.length);
  assert.equal(result.sourcePairs.length,plan.pairs);
  const byId=new Map(result.rows.map(row=>[row.trial.id,row]));
  assert.equal(byId.size,scheduled.length);
  const cells=[];
  for(const rank of plan.ranks) for(const slot of plan.candidateSlots)
    for(const candidateId of plan.candidateIds){
      const rows=scheduled.filter(trial=>trial.rank===rank&&
        trial.candidateSlot===slot&&trial.candidateId===candidateId)
        .map(trial=>byId.get(trial.id));
      assert.equal(rows.length,plan.repeats);
      assert.ok(rows.every(Boolean));
      cells.push({rank,candidateSlot:slot,candidateId,
        attempts:rows.length,
        exceptions:rows.filter(row=>row.status!==undefined).length,
        capped:rows.filter(row=>row.status===undefined&&
          row.finished!==true).length,
        terminals:rows.filter(row=>row.status===undefined&&
          row.finished===true).length,
        verifiedFirstPlayer:rows.filter(row=>
          row.verifiedFirstTurn===true).length,
        actualSourceFirst:rows.filter(row=>
          row.sourceActuallyFirst===true).length,
        sourceAttackDeclarations:rows.reduce((n,row)=>
          n+(row.attackDeclarations?.source??0),0),
        candidateAttackDeclarations:rows.reduce((n,row)=>
          n+(row.attackDeclarations?.candidate??0),0),
        errors:rows.filter(row=>row.status!==undefined)
          .map(row=>({id:row.trial.id,status:row.status,
            stage:row.nativeAbortEvidence?.failureStage??null,
            action:row.nativeAbortEvidence?.actionName??null,
            attackingPokemon:row.nativeAbortEvidence?.attackingPokemon??null,
            attackName:row.nativeAbortEvidence?.attackName??null,
            message:row.nativeAbortEvidence?.errorMessage??null}))
      });
    }
  const all=result.rows;
  assert.ok(all.every(row=>row.qualifiesForCompetitiveInference===false));
  return {schema:'agent41-all-attempts-native-scout-census-v1',
    attempts:all.length,
    exceptions:all.filter(row=>row.status!==undefined).length,
    censored:all.filter(row=>row.status===undefined&&row.finished!==true).length,
    engineTerminals:all.filter(row=>row.status===undefined&&row.finished===true).length,
    verifiedFirstPlayers:all.filter(row=>row.verifiedFirstTurn===true).length,
    nativeTargetObserved:all.filter(row=>
      row.nativeAcceptedTargetSidecar?.observedLiveStore===true).length,
    sameTargetRepairs:all.reduce((n,row)=>
      n+(row.paperSameTargetAttachEnergyAudit?.repairedPromptCount??0),0),
    trubbishFullBenchSkips:all.reduce((n,row)=>
      n+(row.paperFullBenchCallForFamilyAudit?.skippedSearches??0),0),
    cells,competitiveQualifiedGames:0,clockCalibrated:false,
    missingFullOriginalRanks:[23,25,28],
    samplingCaveat:'Precommitted seeds, two difficult ranks only; each candidate has different full physical deals. No human-competent source/candidate policy or measured event clock.'};
}

/** @returns {object} */
function runScout(){
  const bytes=fs.readFileSync(path.join(root,registrationPath));
  const blob=createHash('sha1').update('blob '+bytes.length+'\\0')
    .update(bytes).digest('hex');
  assert.equal(blob,REGISTRATION_BLOB,'Preregistered plan was modified');
  const plan=JSON.parse(bytes.toString('utf8'));
  const trials=plannedTrials(plan);
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const result=runDevelopment({...plan.frozenRunOptions,
    registeredTrials:trials,registeredFrameName:registrationPath});
  assert.equal(result.enginePin,plan.enginePin);
  assert.equal(result.registeredTrialFrame,registrationPath);
  const summary=census(result,plan);
  return {schema:SCHEMA,registrationPath,registrationBlob:blob,
    preregistration:plan,summary,developmentResult:result};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runScout(),null,2)+'\\n');

module.exports={SCHEMA,REGISTRATION_BLOB,plannedTrials,census,runScout};
