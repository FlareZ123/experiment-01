'use strict';

const assert=require('node:assert/strict');
const register=require('../../../results/aichi-2026/registrations/agent8-source-challenger-prospective-v3-20261109.json');
const previous=require('./agent8-source-challenger-2x2-v2.cjs');
const {runNativeBatch,summarizeRow}=require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {save}=require('./agent8-source-challenger-2x2.cjs');

const VERSION='agent8-source-ability-evolution-2x2-v3';
const PHASES=previous.PHASES;

/** @returns {object[]} Frozen before use: two Mew/Genesect and Regidrago seeds per physical seat. */
function registered(){
  assert.equal(register.schema,'agent8-source-native-draw-evolution-2x2-v3');
  assert.equal(register.physicalGroups,8);
  assert.equal(register.attempts,32);
  assert.equal(register.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const g=register.groups;
  assert.equal(g.length,8);
  assert.equal(new Set(g.map(x=>x.seed)).size,8);
  assert.equal(new Set(g.map(x=>x.id)).size,8);
  for(const row of g){
    assert.ok([5,13].includes(row.rank));
    assert.equal(row.candidateId,register.candidate);
    assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':'));
  }
  for(const rank of register.ranks)
    for(const seat of ['A','B'])
      assert.equal(g.filter(x=>x.rank===rank&&x.candidateSlot===seat).length,2);
  return g.map(row=>({...row}));
}

/**
 * Exact source-actor-only Ability/evolution expansion of v2 source challenger.
 * The original source, candidate sixties, hand-discard prompt and deck search
 * are unchanged, while source matchups are newly generated and precommitted.
 * @param {boolean} challenge
 */
function options(challenge){
  const base=previous.options(challenge);
  return {
    ...base,
    actorNaturalEvolutionRoot:challenge,
    actorNaturalEvolutionSourceOnly:challenge,
    actorGenesectFusionDrawRoot:challenge,
    actorGenesectFusionDrawSourceOnly:challenge
  };
}

/** @param {{id:string,pivot:boolean,sourceChallenge:boolean}} phase @param {Function} [nativeRunner] */
function runPhase(phase,nativeRunner=runDevelopment){
  assert.ok(PHASES.some(p=>p.id===phase.id));
  return runNativeBatch(true,optionsFromRun=>nativeRunner({
    ...optionsFromRun,...options(phase.sourceChallenge)
  }),{
    registeredTrials:registered(),
    registeredFrameName:register.schema+'-'+phase.id,
    nativeRootActionLimit:register.rootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true,
    perfectionTransition:phase.pivot
  });
}

/**
 * Count genuine, original-source-owned native actions; the native Store,
 * not the prospective planner, decides whether an action resolves.
 * @param {object} native
 */
function sourceNativeActions(native){
  const basic=previous.sourceActions(native);
  const owned=(native.rootActionLedger??[])
    .filter(x=>x.playerSlot===basic.seat);
  const ability=owned.filter(x=>
    x.action==='UseAbilityAction'&&x.ability==='Fusion Strike System');
  const evolutions=owned.filter(x=>x.action==='PlayCardAction'&&
    (x.card==='Mew VMAX'||x.card==='Regidrago VSTAR'));
  return {
    ...basic,genesectDrawRoot:ability.length,
    ordinaryEvolutionToPrimaryAttacker:evolutions.length,
    firstGenesect:ability.slice(0,2).map(x=>({
      ordinal:x.actionOrdinal,turn:x.turnBefore,playerSlot:x.playerSlot
    })),
    firstEvolution:evolutions.slice(0,2).map(x=>({
      ordinal:x.actionOrdinal,turn:x.turnBefore,card:x.card
    }))
  };
}

/** @param {{runPhase?:Function}} [deps] */
function run(deps={}){
  const groups=registered(),rawNativeRows={},summaries={},sourceActions={};
  for(const phase of PHASES){
    const outcome=(deps.runPhase??runPhase)(phase);
    const rows=outcome?.selected?.rawDevelopment?.rows;
    assert.ok(Array.isArray(rows)&&rows.length===groups.length);
    rawNativeRows[phase.id]=rows;
    summaries[phase.id]=rows.map(row=>summarizeRow(row,true));
    sourceActions[phase.id]=rows.map(sourceNativeActions);
  }
  const analysis=require('./agent8-source-challenger-2x2.cjs')
    .analyze(summaries,groups);
  const sum=(phase,key)=>sourceActions[phase]
    .reduce((n,row)=>n+(row[key]??0),0);
  const sourceFirstChanged=key=>analysis.pairs
    .filter(p=>Number.isSafeInteger(p[key]?.ordinal)).length;
  const details={
    ...analysis,version:VERSION,registration:register.schema,
    phaseOrder:PHASES,enginePin:register.enginePin,
    original60sUnchanged:true,qualifyingCompetitiveGames:0,
    sourceRootPolicy:options(true),
    totals:{
      ...analysis.totals,
      sourceQuickBallInBothS1:sum('P0S1','quickBall')+sum('P1S1','quickBall'),
      sourceTrainersMailInBothS1:sum('P0S1','trainersMail')+sum('P1S1','trainersMail'),
      sourceGenesectDrawInBothS1:sum('P0S1','genesectDrawRoot')+
        sum('P1S1','genesectDrawRoot'),
      sourcePrimaryEvolutionsInBothS1:
        sum('P0S1','ordinaryEvolutionToPrimaryAttacker')+
        sum('P1S1','ordinaryEvolutionToPrimaryAttacker'),
      sourceChangedFirstRootWithoutPivot:
        sourceFirstChanged('sourceChallengerFirstDifferenceWithoutPivot'),
      sourceChangedFirstRootWithPivot:
        sourceFirstChanged('sourceChallengerFirstDifferenceWithPivot')
    },
    sourceNativeActionReceipts:sourceActions,
    phaseSummaries:summaries,rawNativeRows
  };
  return details;
}

if(require.main===module){
  const result=run();
  save(process.env.AGENT8_SOURCE_CHALLENGER_V3_OUTPUT??
    'artifacts/agent8-source-challenger-v3.json',result);
  const condensed=result.pairs.map(p=>({
    id:p.id,matched:p.physicallyMatchedAcrossFour,
    firstSourceChange:p.sourceChallengerFirstDifferenceWithoutPivot?.ordinal??null,
    status:PHASES.map(ph=>p[ph.id].status),
    winners:PHASES.map(ph=>p[ph.id].winner)
  }));
  console.log('AGENT8_SOURCE_ABILITY_EVOLUTION_V3',
    JSON.stringify({totals:result.totals,condensed}));
  if(result.status!=='PHYSICAL-MATCHED-DEVELOPMENT-ONLY')process.exitCode=1;
}
module.exports={
  VERSION,PHASES,registered,options,runPhase,sourceNativeActions,run
};
