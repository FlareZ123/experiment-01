'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const reg=require('../../../results/aichi-2026/registrations/agent23-rank6-owner-volt-fresh-v1-20261109.json');
const profile=require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {withActualOwnerVoltNative}=require('./agent23-rank6-integrated-owner-volt-native-pair.cjs');
const {firstRootDivergence}=require('../agent24-v8-perfection-paired-native.cjs');
const {writeAtomicLocked}=require('../agent20-frozen-rank6-canary-v1.cjs');

const VERSION='agent23-original-rank6-fresh-integrated-owner-volt-v3-paired-v1';
/** @returns {object[]} Precommitted source/candidate physical trials. */
function registered(){
  assert.equal(reg.schema,'agent23-original-rank6-owner-volt-fresh-deal-v1');
  assert.equal(reg.enginePin,profile.pinnedVendorRevision);
  assert.equal(reg.registeredTrials.length,8);
  assert.equal(reg.expectedNativeAttempts,16);
  const ids=reg.registeredTrials.map(x=>x.id);
  assert.equal(new Set(ids).size,8);
  for(const row of reg.registeredTrials){
    assert.equal(row.rank,6);
    assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,
      row.candidateId].join(':'));
    assert.equal(row.seed,reg.seedBySourceCell[
      row.repeat+':'+row.candidateSlot]);
  }
  return reg.registeredTrials.map(x=>({...x}));
}

/** @param {boolean} ownerV3 @param {Function} [nativeRunner] */
function runArm(ownerV3,nativeRunner=runDevelopment){
  const options={
    ...profile.policyOptions,
    registeredTrials:registered(),
    registeredFrameName:VERSION+(ownerV3?'-v3':'-baseline'),
    paperPromptPortfolio:true,
    nativeRootActionLimit:reg.capPerAttempt
  };
  if(!ownerV3)return {development:nativeRunner(options),audit:[]};
  const headless=require('../../twinleaf/headless.cjs');
  const result=withActualOwnerVoltNative(()=>nativeRunner(options),headless);
  return {development:result.result,audit:result.rows};
}

/** @param {object} row */
function sourceSummary(row){
  const sourceSeat=row.sourceSeat??(row.trial.candidateSlot==='A'?1:0);
  const attacks=(row.sourceAttackSettlement?.attacks??[])
    .filter(x=>x.attackName==='Volt Cyclone');
  return {
    trialId:row.trial.id,sourceSeat,starter:row.actualStarterSeat??null,
    printedSourceHash:row.sourcePrintedSixtyHash??null,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
    sourcePhysicalDeal:row.sourceDealFingerprint??null,
    status:row.status??null,
    error:row.error?String(row.error).slice(0,250):null,
    finished:row.gameFinished??row.finished??false,
    winner:row.winner??null,
    remainingPrizes:row.finalPrizes??null,
    rootCount:row.rootActionLedger?.length??null,
    voltTurns:attacks.map(x=>x.turnBefore)
  };
}

function run(deps={}){
  const regTrials=registered();
  const incumbent=(deps.runArm??runArm)(false);
  const v3=(deps.runArm??runArm)(true);
  assert.equal(incumbent.development.rows.length,8);
  assert.equal(v3.development.rows.length,8);
  const controls=new Map(incumbent.development.rows.map(row=>[
    row.trial.id,row]));
  const treatments=new Map(v3.development.rows.map(row=>[row.trial.id,row]));
  assert.equal(controls.size,8);assert.equal(treatments.size,8);
  const pairs=regTrials.map(trial=>{
    const a=controls.get(trial.id),b=treatments.get(trial.id);
    assert.ok(a&&b,'Missing preregistered source game '+trial.id);
    const c=sourceSummary(a),t=sourceSummary(b);
    const sameInitialDeal=
      c.fullPhysicalDeal!==null&&c.sourcePhysicalDeal!==null&&
      JSON.stringify(c.fullPhysicalDeal)===JSON.stringify(t.fullPhysicalDeal)&&
      JSON.stringify(c.sourcePhysicalDeal)===JSON.stringify(t.sourcePhysicalDeal);
    const first=(a.rootActionLedger&&b.rootActionLedger)?
      firstRootDivergence(a.rootActionLedger,b.rootActionLedger):null;
    const sameStarter=c.starter!==null&&c.starter===t.starter;
    return {
      id:trial.id,seed:trial.seed,sourceSeat:c.sourceSeat,
      sameInitialDeal,sameStarter,
      firstChangedRoot:first,control:c,integratedV3:t,
      winnerChanged:c.finished&&t.finished&&c.winner!==t.winner,
      sourcePrizeChange:c.remainingPrizes&&t.remainingPrizes?
        c.remainingPrizes[c.sourceSeat]-t.remainingPrizes[c.sourceSeat]:null,
      sourceVoltChange:t.voltTurns.length-c.voltTurns.length
    };
  });
  return {
    schema:VERSION,registration:reg.schema,
    actuallyPrecommittedFreshSeeds:reg.seedBySourceCell,
    pinnedEngine:reg.enginePin,
    allEightPhysicalDealsMatch:pairs.every(x=>x.sameInitialDeal),
    allEightStartersMatch:pairs.every(x=>x.sameStarter),
    registeredGames:8,nativeAttempts:16,
    actualOwnerPromptSelections:v3.audit.reduce((n,x)=>n+
      (x.sourceOnlyPromptAudit?.ownerPromptChoices??0),0),
    completeSourceAttackCounts:{
      baseline:pairs.reduce((n,x)=>n+x.control.voltTurns.length,0),
      integrated:pairs.reduce((n,x)=>n+x.integratedV3.voltTurns.length,0)
    },
    nativeTerminalCounts:{
      baseline:pairs.filter(x=>x.control.finished).length,
      integrated:pairs.filter(x=>x.integratedV3.finished).length
    },
    sourcePrizeChangedGames:pairs.filter(x=>x.sourcePrizeChange!==0)
      .map(x=>x.id),
    nativeWinnerChangedGames:pairs.filter(x=>x.winnerChanged)
      .map(x=>x.id),
    pairs,baselineRows:incumbent.development.rows,
    integratedRows:v3.development.rows,
    integratedPromptAudits:v3.audit,
    qualifiedPaperGames:0,fieldWinRate:null
  };
}
if(require.main===module){
  const output=process.env.AGENT23_RANK6_FRESH_NATIVE_OUTPUT??
    'artifacts/agent23-rank6-owner-volt-fresh.json';
  const result=run();
  fs.mkdirSync(path.dirname(output),{recursive:true});
  writeAtomicLocked(output,JSON.stringify(result,null,2)+'\n');
  process.stdout.write('AGENT23_RANK6_FRESH_OWNER_VOLT '+JSON.stringify({
    schema:result.schema,matched:result.allEightPhysicalDealsMatch,
    startersMatched:result.allEightStartersMatch,
    ownerV3ActualChoices:result.actualOwnerPromptSelections,
    attackCounts:result.completeSourceAttackCounts,
    terminals:result.nativeTerminalCounts,
    prizeChangeIDs:result.sourcePrizeChangedGames,
    nativeWinnerChangeIDs:result.nativeWinnerChangedGames,
    summaries:result.pairs.map(p=>({
      id:p.id,matched:p.sameInitialDeal,
      different:p.firstChangedRoot?.ordinal!==null,
      first:p.firstChangedRoot?.ordinal??null,
      baseline:{volts:p.control.voltTurns,prizes:p.control.remainingPrizes,
        finished:p.control.finished,winner:p.control.winner,
        error:p.control.error},
      treatment:{volts:p.integratedV3.voltTurns,
        prizes:p.integratedV3.remainingPrizes,
        finished:p.integratedV3.finished,winner:p.integratedV3.winner,
        error:p.integratedV3.error}
    })),qualifiedPaperGames:0
  })+'\n');
  if(!result.allEightPhysicalDealsMatch||
    !result.allEightStartersMatch)process.exitCode=1;
}
module.exports={VERSION,registered,runArm,sourceSummary,run};
