'use strict';

const assert=require('node:assert/strict');
const reg=require('../../../results/aichi-2026/registrations/agent8-source-mew-combat-v5-20261109.json');
const v4=require('./agent8-source-evolution-2x2-v4.cjs');
const v3=require('./agent8-source-challenger-2x2-v3.cjs');
const {analyze,save}=require('./agent8-source-challenger-2x2.cjs');
const {runNativeBatch,summarizeRow}=require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');

const VERSION='agent8-source-mew-combat-prospective-v5';
const PHASES=v4.PHASES;

/** @returns {object[]} Frozen independent physical source/candidate assignments. */
function registered(){
  assert.equal(reg.schema,'agent8-source-mew-combat-v5-prospective');
  assert.equal(reg.physicalGroups,8);
  assert.equal(reg.expectedAttempts,32);
  assert.equal(reg.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(reg.groups.length,8);
  assert.equal(new Set(reg.groups.map(x=>x.seed)).size,8);
  assert.equal(new Set(reg.groups.map(x=>x.id)).size,8);
  for(const row of reg.groups){
    assert.ok(row.rank===5||row.rank===13);
    assert.ok(row.candidateSlot==='A'||row.candidateSlot==='B');
    assert.equal(row.candidateId,reg.candidate);
    assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':'));
  }
  for(const rank of reg.originalSourceRanks)
    for(const seat of ['A','B'])
      assert.equal(reg.groups.filter(row=>
        row.rank===rank&&row.candidateSlot===seat).length,2);
  return reg.groups.map(row=>({...row}));
}

/**
 * Every arm gets source-only ordinary evolution, Quick Ball and Trainers Mail.
 * The only S0/S1 difference is the original player's Mew combat continuity.
 * @param {boolean} combat
 * @returns {object}
 */
function options(combat){
  assert.equal(typeof combat,'boolean');
  return {
    ...v4.options(true),
    actorDceMewMobilityRoot:combat,
    actorDceMewMobilitySourceOnly:combat,
    actorMewGenesectTechnoBlast:combat,
    actorMewGenesectTechnoBlastSourceOnly:combat
  };
}

/** @param {object} phase @param {Function} [runner] */
function runPhase(phase,runner=runDevelopment){
  assert.ok(PHASES.some(x=>x.id===phase.id));
  return runNativeBatch(true,base=>runner({
    ...base,...options(phase.sourceChallenge)
  }),{
    registeredTrials:registered(),
    registeredFrameName:reg.schema+'-'+phase.id,
    nativeRootActionLimit:reg.rootLimit,
    vipAfterPass:true,
    vipPreferMewtwoDonor:true,
    perfectionTransition:phase.pivot
  });
}

/** @param {object} row @returns {object} */
function sourceActions(row){
  const source=v3.sourceNativeActions(row);
  const owned=(row.rootActionLedger??[])
    .filter(root=>root.playerSlot===source.seat);
  return {
    ...source,
    paidRetreatRoots:owned.filter(root=>root.action==='RetreatAction').length,
    crossFusionStrikeRoots:owned.filter(root=>
      root.action==='AttackAction'&&root.attack==='Cross Fusion Strike').length
  };
}

/** @param {{runPhase?:Function}} [deps] */
function run(deps={}){
  const groups=registered(),summaries={},rawNativeRows={},sourceReceipts={};
  for(const phase of PHASES){
    const output=(deps.runPhase??runPhase)(phase);
    const rows=output?.selected?.rawDevelopment?.rows;
    assert.ok(Array.isArray(rows)&&rows.length===groups.length);
    rawNativeRows[phase.id]=rows;
    summaries[phase.id]=rows.map(row=>summarizeRow(row,true));
    sourceReceipts[phase.id]=rows.map(sourceActions);
  }
  const compared=analyze(summaries,groups);
  const sum=(phase,key)=>sourceReceipts[phase]
    .reduce((acc,x)=>acc+(x[key]??0),0);
  const both=key=>({
    control:sum('P0S0',key)+sum('P1S0',key),
    sourceCombat:sum('P0S1',key)+sum('P1S1',key)
  });
  return {
    ...compared,version:VERSION,registration:reg.schema,
    enginePin:reg.enginePin,
    phaseOrder:PHASES,
    originalSourceSixtiesUnchanged:true,
    contenderSixtyUnchanged:true,
    sourceOnlyCombatOwnerSeatRequired:true,
    paperCompetitiveGames:0,
    optionsS0:options(false),optionsS1:options(true),
    totals:{
      ...compared.totals,
      sourcePrimaryEvolutions:both('ordinaryEvolutionToPrimaryAttacker'),
      sourceAttacks:both('attacks'),
      sourcePaidRetreats:both('paidRetreatRoots'),
      sourceCrossFusionStrikes:both('crossFusionStrikeRoots')
    },
    sourceReceipts,phaseSummaries:summaries,rawNativeRows
  };
}

if(require.main===module){
  const result=run();
  save(process.env.AGENT8_SOURCE_MEW_COMBAT_V5_OUTPUT??
    'artifacts/agent8-source-mew-combat-v5.json',result);
  console.log('AGENT8_SOURCE_MEW_COMBAT_V5',JSON.stringify({
    totals:result.totals,
    pairs:result.pairs.map(p=>({
      id:p.id,matched:p.physicallyMatchedAcrossFour,
      statuses:PHASES.map(x=>p[x.id].status),
      winners:PHASES.map(x=>p[x.id].winner)
    }))
  }));
  if(result.status!=='PHYSICAL-MATCHED-DEVELOPMENT-ONLY')
    process.exitCode=1;
}

module.exports={VERSION,PHASES,registered,options,runPhase,sourceActions,run};
