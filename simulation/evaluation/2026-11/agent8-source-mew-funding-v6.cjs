'use strict';

const assert=require('node:assert/strict');
const reg=require('../../../results/aichi-2026/registrations/agent8-source-mew-funding-v6-20261109.json');
const v5=require('./agent8-source-mew-combat-v5.cjs');
const {analyze,save}=require('./agent8-source-challenger-2x2.cjs');
const {runNativeBatch,summarizeRow}=require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');

const VERSION='agent8-source-mew-dce-recipient-prospective-v6';
const PHASES=v5.PHASES;

/** @returns {object[]} Eight sealed original physical rank5/13 games in both seats. */
function registered(){
  assert.equal(reg.schema,'agent8-source-mew-dce-funding-v6-prospective');
  assert.equal(reg.expectedAttempts,32);
  assert.equal(reg.physicalGroups,8);
  assert.equal(reg.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(reg.groups.length,8);
  assert.equal(new Set(reg.groups.map(x=>x.id)).size,8);
  assert.equal(new Set(reg.groups.map(x=>x.seed)).size,8);
  for(const row of reg.groups){
    assert.ok([5,13].includes(row.rank));
    assert.ok(['A','B'].includes(row.candidateSlot));
    assert.equal(row.candidateId,reg.candidate);
    assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':'));
  }
  for(const rank of reg.originalSourceRanks)
    for(const seat of ['A','B'])
      assert.equal(reg.groups.filter(row=>
        row.rank===rank&&row.candidateSlot===seat).length,2);
  return reg.groups.map(x=>({...x}));
}

/**
 * All prior source capabilities are common. The only new S0/S1 factor
 * is source-owned early Double Colorless Energy attachment to Mew V/VMAX.
 * @param {boolean} funded
 * @returns {object}
 */
function options(funded){
  assert.equal(typeof funded,'boolean');
  return {
    ...v5.options(true),
    actorMewDceRecipientRoot:funded,
    actorMewDceRecipientSourceOnly:funded
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
    vipAfterPass:true,vipPreferMewtwoDonor:true,
    perfectionTransition:phase.pivot
  });
}

/**
 * Source-owned genuine native root action counts, including every actual
 * Special Energy attachment without assuming its recipient from card name.
 * @param {object} row
 * @returns {object}
 */
function sourceActions(row){
  const source=v5.sourceActions(row);
  const owned=(row.rootActionLedger??[])
    .filter(root=>root.playerSlot===source.seat);
  return {
    ...source,
    sourceDoubleColorlessPlays:owned.filter(root=>
      root.action==='PlayCardAction'&&
      typeof root.card==='string'&&
      root.card.startsWith('Double Colorless Energy')).length
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
    .reduce((n,x)=>n+(x[key]??0),0);
  const both=key=>({
    control:sum('P0S0',key)+sum('P1S0',key),
    sourceFunding:sum('P0S1',key)+sum('P1S1',key)
  });
  return {
    ...compared,version:VERSION,registration:reg.schema,
    enginePin:reg.enginePin,phaseOrder:PHASES,
    originalSourceSixtiesUnchanged:true,contenderSixtyUnchanged:true,
    commonMewCombatPolicy:true,sourceOnlyFundingOwnerSeatRequired:true,
    paperCompetitiveGames:0,
    optionsS0:options(false),optionsS1:options(true),
    totals:{
      ...compared.totals,
      sourceDcePlays:both('sourceDoubleColorlessPlays'),
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
  save(process.env.AGENT8_SOURCE_MEW_FUNDING_V6_OUTPUT??
    'artifacts/agent8-source-mew-funding-v6.json',result);
  console.log('AGENT8_SOURCE_MEW_FUNDING_V6',JSON.stringify({
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
