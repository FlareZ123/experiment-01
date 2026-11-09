'use strict';

const assert=require('node:assert/strict');
const register=require('../../../results/aichi-2026/registrations/agent8-source-evolution-v4-corrected-20261109.json');
const v2=require('./agent8-source-challenger-2x2-v2.cjs');
const v3=require('./agent8-source-challenger-2x2-v3.cjs');
const {analyze,save}=require('./agent8-source-challenger-2x2.cjs');
const {runNativeBatch,summarizeRow}=require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');

const VERSION='agent8-source-only-evolution-gate-fixed-prospective-v4';
const PHASES=v2.PHASES;

/** @returns {object[]} Fresh sealed original rank5/13 deals with both candidate seats. */
function registered(){
  assert.equal(register.schema,'agent8-source-ordinary-evolution-v4-corrected-gate');
  assert.equal(register.physicalGroups,8);
  assert.equal(register.expectedAttempts,32);
  assert.equal(register.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const g=register.groups;
  assert.equal(g.length,8);
  assert.equal(new Set(g.map(row=>row.seed)).size,8);
  assert.equal(new Set(g.map(row=>row.id)).size,8);
  for(const row of g)
    assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':'));
  for(const rank of [5,13])for(const seat of ['A','B'])
    assert.equal(g.filter(row=>row.rank===rank&&row.candidateSlot===seat).length,2);
  return g.map(row=>({...row}));
}

/**
 * S0 and S1 share source Item choices and both-seat owner prompt responders.
 * Only source-owned natural evolution is changed. A root seat-gate unit test
 * guards against the v3 cross-seat leak.
 * @param {boolean} evolution
 */
function options(evolution){
  assert.equal(typeof evolution,'boolean');
  return {
    ...v2.options(true),
    actorNaturalEvolutionRoot:evolution,
    actorNaturalEvolutionSourceOnly:evolution,
    actorGenesectFusionDrawRoot:false,
    actorGenesectFusionDrawSourceOnly:false
  };
}

/** @param {object} phase @param {Function} [runner] */
function runPhase(phase,runner=runDevelopment){
  assert.ok(PHASES.some(row=>row.id===phase.id));
  return runNativeBatch(true,base=>runner({
    ...base,...options(phase.sourceChallenge)
  }),{
    registeredTrials:registered(),
    registeredFrameName:register.schema+'-'+phase.id,
    nativeRootActionLimit:register.rootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true,
    perfectionTransition:phase.pivot
  });
}

/** @param {{runPhase?:Function}} [deps] */
function run(deps={}){
  const groups=registered(),summaries={},rawNativeRows={},originalSourceActions={};
  for(const phase of PHASES){
    const output=(deps.runPhase??runPhase)(phase);
    const rows=output?.selected?.rawDevelopment?.rows;
    assert.ok(Array.isArray(rows)&&rows.length===groups.length);
    rawNativeRows[phase.id]=rows;
    summaries[phase.id]=rows.map(row=>summarizeRow(row,true));
    originalSourceActions[phase.id]=rows.map(v3.sourceNativeActions);
  }
  const comparisons=analyze(summaries,groups);
  const sum=(phase,key)=>originalSourceActions[phase]
    .reduce((n,item)=>n+Number(item[key]??0),0);
  const first=key=>comparisons.pairs.filter(row=>
    Number.isInteger(row[key]?.ordinal)).length;
  return {
    ...comparisons,version:VERSION,registration:register.schema,
    enginePin:register.enginePin,original60sUnchanged:true,
    commonSourceItemPolicy:true,
    candidatePolicyIdenticalBetweenS0S1:true,
    correctedEvolutionOwnerSeatGate:true,
    paperCompetitiveGames:0,
    totals:{
      ...comparisons.totals,
      sourcePrimaryEvolutionsS0:sum('P0S0','ordinaryEvolutionToPrimaryAttacker')+
        sum('P1S0','ordinaryEvolutionToPrimaryAttacker'),
      sourcePrimaryEvolutionsS1:sum('P0S1','ordinaryEvolutionToPrimaryAttacker')+
        sum('P1S1','ordinaryEvolutionToPrimaryAttacker'),
      sourceAttacksS0:sum('P0S0','attacks')+sum('P1S0','attacks'),
      sourceAttacksS1:sum('P0S1','attacks')+sum('P1S1','attacks'),
      firstSourceRootDifferenceWithoutPivot:
        first('sourceChallengerFirstDifferenceWithoutPivot'),
      firstSourceRootDifferenceWithPivot:
        first('sourceChallengerFirstDifferenceWithPivot')
    },
    originalSourceActions,phaseSummaries:summaries,rawNativeRows
  };
}

if(require.main===module){
  const result=run();
  save(process.env.AGENT8_EVOLUTION_V4_OUTPUT??
    'artifacts/agent8-source-evolution-v4.json',result);
  console.log('AGENT8_SOURCE_CORRECTED_EVOLUTION_V4',JSON.stringify({
    totals:result.totals,
    statuses:result.pairs.map(p=>({
      id:p.id,
      matched:p.physicallyMatchedAcrossFour,
      status:PHASES.map(ph=>p[ph.id].status),
      winners:PHASES.map(ph=>p[ph.id].winner),
      firstChange:p.sourceChallengerFirstDifferenceWithoutPivot?.ordinal??null
    }))
  }));
  if(result.status!=='PHYSICAL-MATCHED-DEVELOPMENT-ONLY')
    process.exitCode=1;
}
module.exports={
  VERSION,PHASES,registered,options,runPhase,run
};
