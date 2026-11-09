'use strict';

const assert=require('node:assert/strict');
const registration=require('../../../results/aichi-2026/registrations/agent3-prospective-all29-celestial-paper-v2-20261109.json');
const {runArm}=require('./portable-champion-all29-20261109.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook}=
  require('../../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-iron-thorns-owner-underworld-fresh-six-deal-retro-v1';
const RANKS=[6,24,29];

/** Reuse only already-seen, independently frozen second original field deals. */
function run(){
  const groups=registration.groups.filter(x=>RANKS.includes(x.rank));
  assert.equal(groups.length,6);
  const old=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let restoreRoar=null,control,treatment;
  try{
    restoreRoar=installRegidragoCelestialRoarPaperCustodyHook();
    control=runArm(false,groups);
    treatment=runArm(true,groups);
  }finally{
    if(restoreRoar)restoreRoar();
    restoreDoor();
    if(old===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=old;
  }
  const compact=row=>({
    id:row.trial.id,finished:row.finished===true,
    winner:row.winner??null,
    status:row.physicalZoneQualification?.status??null,
    rootActions:row.rootActionLedger?.length??row.actionCount??null,
    error:row.error?String(row.error).split('\n')[0]:null,
    fullDeal:row.fullPhysicalDealFingerprint??null,
    sourceDeal:row.sourceDealFingerprint??null
  });
  const rows=groups.map((g,i)=>({
    id:g.id,rank:g.rank,
    control:compact(control.rows[i]),
    treatment:compact(treatment.rows[i])
  }));
  const all=rows.flatMap(x=>[x.control,x.treatment]);
  return {
    schema:VERSION,
    originalFreshProspectiveRunId:42556056635,
    usedSeenFreshFieldSeedsNotNewProspectiveEvidence:true,
    fixedDeck60:'champion-reference',
    originalSpecificHistoricalUnknownPowerErrors:10,
    attempts:12,paperQualifiedGames:0,
    summary:{
      originalSourceRankRegistered:3,registeredPhysicalDeals:6,
      remainingUnknownPowerErrors:all.filter(x=>
        x.error?.includes('UNKNOWN_POWER')).length,
      newlyTerminalNativeGames:all.filter(x=>x.finished).length,
      remainingEngineErrors:all.filter(x=>x.error).length,
      rootCaps:all.filter(x=>!x.finished&&!x.error).length
    },rows
  };
}
if(require.main===module){
  const report=run();
  if(process.env.AGENT3_FRESH_THORNS_GUARD_OUTPUT)
    save(process.env.AGENT3_FRESH_THORNS_GUARD_OUTPUT,report);
  process.stdout.write('AGENT3_FRESH_THORNS_GUARD_REPLAY '+JSON.stringify(report)+'\n');
  if(report.summary.remainingUnknownPowerErrors)process.exitCode=1;
}
module.exports={VERSION,run};
