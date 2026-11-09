'use strict';

const assert=require('node:assert/strict');
const reg=require('../../../results/aichi-2026/registrations/agent8-mew-source-champion-newmoon-v7-20261109.json');
const v6=require('./agent8-source-mew-funding-v6.cjs');
const {save}=require('./agent8-source-challenger-2x2.cjs');
const {runNativeBatch,summarizeRow}=require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');

const VERSION='agent8-two-fixed60-original-mew-dce-funding-prospective-v7';
const STAGES=[{id:'S0',funding:false},{id:'S1',funding:true}];

/** @returns {object[]} The eight frozen two-contender original rank-5 physical groups. */
function registered(){
  assert.equal(reg.schema,'agent8-source-rank5-two-fixed60-mew-funding-v7-prospective');
  assert.equal(reg.expectedAttempts,32);
  assert.equal(reg.physicalGroups,8);
  assert.equal(reg.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(reg.fixedCandidates,['champion-reference','new-moon-lockbreaker-v1']);
  assert.equal(reg.groups.length,8);
  assert.equal(reg.trials.length,16);
  assert.equal(new Set(reg.groups.map(x=>x.seed)).size,8);
  for(const row of reg.groups){
    assert.equal(row.rank,5);
    assert.ok(['A','B'].includes(row.candidateSlot));
    assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot].join(':'));
  }
  for(const g of reg.groups){
    const got=reg.trials.filter(x=>x.seed===g.seed);
    assert.deepEqual(got.map(x=>x.candidateId),reg.fixedCandidates);
    for(const trial of got){
      assert.equal(trial.id,[g.id,trial.candidateId].join(':'));
      assert.equal(trial.candidateSlot,g.candidateSlot);
    }
  }
  return reg.trials.map(x=>({...x}));
}

/**
 * Opponent Mew is an authentic original 60. Both complete candidate 60s use
 * identical native policy settings; the source funding switch affects only
 * the opposing source player's physical seat.
 * @param {boolean} funding
 * @returns {object}
 */
function options(funding){
  return {...v6.options(funding)};
}

/** @param {{id:string,funding:boolean}} stage @param {Function} [runner] */
function runStage(stage,runner=runDevelopment){
  assert.ok(STAGES.some(x=>x.id===stage.id));
  return runNativeBatch(true,base=>runner({
    ...base,...options(stage.funding)
  }),{
    registeredTrials:registered(),
    registeredFrameName:reg.schema+'-'+stage.id,
    nativeRootActionLimit:reg.rootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true,
    perfectionTransition:true
  });
}

/** @param {object} row */
function detail(row){
  const trial=row.trial;
  const summary=summarizeRow(row,true);
  const source=v6.sourceActions(row);
  return {
    ...summary,
    id:trial.id,rank:trial.rank,seed:trial.seed,
    candidateId:trial.candidateId,candidateSlot:trial.candidateSlot,
    sourceSeat:trial.candidateSlot==='A'?1:0,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceAttackCount:source.attacks,
    sourceCrossFusionStrikes:source.crossFusionStrikeRoots,
    sourceDcePlays:source.sourceDoubleColorlessPlays,
    paperQualified:false
  };
}

/** @param {{runStage?:Function}} [deps] */
function run(deps={}){
  const trials=registered(),rowsByStage={},summaries={};
  for(const stage of STAGES){
    const output=(deps.runStage??runStage)(stage);
    const rows=output?.selected?.rawDevelopment?.rows;
    assert.ok(Array.isArray(rows)&&rows.length===trials.length);
    rowsByStage[stage.id]=rows;
    summaries[stage.id]=rows.map(detail);
  }
  const lookup=Object.fromEntries(STAGES.map(stage=>
    [stage.id,new Map(summaries[stage.id].map(x=>[x.id,x]))]));
  const groups=reg.groups.map(g=>{
    const contenders=Object.fromEntries(reg.fixedCandidates.map(id=>{
      const key=g.id+':'+id;
      const S0=lookup.S0.get(key),S1=lookup.S1.get(key);
      assert.ok(S0&&S1,'Missing original group/candidate: '+key);
      const samePhysical=Boolean(S0.fullPhysicalDealFingerprint&&
        S0.fullPhysicalDealFingerprint===S1.fullPhysicalDealFingerprint);
      const sameStarter=S0.actualStarterSeat!==null&&
        S0.actualStarterSeat===S1.actualStarterSeat;
      return [id,{S0,S1,samePhysical,sameStarter,
        bothNaturalTerminal:S0.status==='native-terminal'&&
          S1.status==='native-terminal',
        sourceFundingChangesWinner:S0.status==='native-terminal'&&
          S1.status==='native-terminal'&&S0.winner!==S1.winner}];
    }));
    const all=reg.fixedCandidates.flatMap(id=>
      [contenders[id].S0,contenders[id].S1]);
    const sameSourceOpening=Boolean(all[0].sourceDealFingerprint&&
      all.every(x=>x.sourceDealFingerprint===all[0].sourceDealFingerprint));
    const sameStarter=all[0].actualStarterSeat!==null&&
      all.every(x=>x.actualStarterSeat===all[0].actualStarterSeat);
    const bothCandidatesSamePhysicalWithinStage=STAGES.every(stage=>{
      const a=contenders[reg.fixedCandidates[0]][stage.id];
      const b=contenders[reg.fixedCandidates[1]][stage.id];
      return Boolean(a.sourceDealFingerprint&&
        a.sourceDealFingerprint===b.sourceDealFingerprint&&
        a.actualStarterSeat!==null&&
        a.actualStarterSeat===b.actualStarterSeat);
    });
    const fourNaturalTerminal=all.every(x=>x.status==='native-terminal');
    return {
      id:g.id,seed:g.seed,candidateSlot:g.candidateSlot,
      comparableAcrossFixed60s:sameSourceOpening&&sameStarter&&
        bothCandidatesSamePhysicalWithinStage,
      fullSourceOpeningFourwayMatched:sameSourceOpening,
      actualStarterFourwayMatched:sameStarter,
      fourNaturalTerminal,
      fullFourwayCompetitiveComparison:
        sameSourceOpening&&sameStarter&&fourNaturalTerminal,
      contenders
    };
  });
  const flattened=STAGES.flatMap(s=>summaries[s.id]);
  const counts=(stage,id,key)=>summaries[stage].filter(x=>x.candidateId===id)
    .reduce((sum,x)=>sum+(x[key]??0),0);
  const candidateOutcomes=Object.fromEntries(reg.fixedCandidates.map(id=>[
    id,Object.fromEntries(STAGES.map(stage=>[
      stage.id,{
        nativeTerminals:summaries[stage.id].filter(x=>
          x.candidateId===id&&x.status==='native-terminal').length,
        nativeCandidateWins:summaries[stage.id].filter(x=>
          x.candidateId===id&&x.status==='native-terminal'&&
          x.winner===(x.candidateSlot==='A'?0:1)).length,
        nativeErrors:summaries[stage.id].filter(x=>
          x.candidateId===id&&x.status==='engine-error').length,
        rootCaps:summaries[stage.id].filter(x=>
          x.candidateId===id&&x.status==='root-cap').length,
        sourceCrossFusionStrikes:counts(stage.id,id,'sourceCrossFusionStrikes'),
        sourceDcePlays:counts(stage.id,id,'sourceDcePlays')
      }
    ]))
  ]));
  return {
    schema:VERSION,registration:reg.schema,pinnedEngine:reg.enginePin,
    nativeAttempts:32,originalRank:5,
    fixedCandidates:reg.fixedCandidates,stageOrder:STAGES,
    paperCompetitivelyQualifiedGames:0,
    sourcePhysicalGroups:groups,
    candidateOutcomes,
    summaries,rawNativeRows:rowsByStage,
    totals:{
      attempted:flattened.length,
      fullSourceFourwayMatched:groups.filter(x=>x.fullSourceOpeningFourwayMatched).length,
      comparableAcrossFixed60s:groups.filter(x=>x.comparableAcrossFixed60s).length,
      fourNaturalTerminal:groups.filter(x=>x.fourNaturalTerminal).length,
      qualifiedFourwayNativeComparisons:groups.filter(x=>
        x.fullFourwayCompetitiveComparison).length,
      nativeEngineErrors:flattened.filter(x=>x.status==='engine-error').length,
      nativeRootCaps:flattened.filter(x=>x.status==='root-cap').length,
      actualSourceCrossFusionStrikesS0:summaries.S0.reduce((n,x)=>
        n+x.sourceCrossFusionStrikes,0),
      actualSourceCrossFusionStrikesS1:summaries.S1.reduce((n,x)=>
        n+x.sourceCrossFusionStrikes,0)
    }
  };
}

if(require.main===module){
  const result=run();
  save(process.env.AGENT8_MEW_SOURCE_DUAL_FIXED60_V7_OUTPUT??
    'artifacts/agent8-mew-source-two-fixed60-v7.json',result);
  console.log('AGENT8_MEW_SOURCE_DUAL_FIXED60_V7',JSON.stringify({
    totals:result.totals,candidateOutcomes:result.candidateOutcomes,
    groupStatuses:result.sourcePhysicalGroups.map(g=>({
      id:g.id,sourceMatched:g.fullSourceOpeningFourwayMatched,
      contenderComparable:g.comparableAcrossFixed60s,
      allNatural:g.fourNaturalTerminal,
      cells:Object.fromEntries(result.fixedCandidates.map(id=>[id,{
        S0:[g.contenders[id].S0.status,g.contenders[id].S0.winner],
        S1:[g.contenders[id].S1.status,g.contenders[id].S1.winner]
      }]))
    }))
  }));
}
module.exports={VERSION,STAGES,registered,options,runStage,detail,run};
