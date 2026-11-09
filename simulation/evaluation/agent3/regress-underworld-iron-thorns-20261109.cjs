'use strict';

const assert=require('node:assert/strict');
const registration=
  require('../../../results/aichi-2026/registrations/agent3-portable-champion-all29-ab-20261109.json');
const {runArm}=require('./portable-champion-all29-20261109.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-original-thorns-underworld-owner-lock-native-v1';
const historicalUnknownPowerIds=[
  '6:6111:B:champion-reference',
  '24:6145:B:champion-reference',
  '29:6150:A:champion-reference'
];

/**
 * Reexecute only three original prospective source/seat/seed games previously
 * aborted with UNKNOWN_POWER when an active Iron Thorns ex suppressed the
 * shadow-rider owner's Underworld Door. Both tactical policies retain the
 * identical fixed printed deck and otherwise identical native run options.
 */
function run(){
  const groups=historicalUnknownPowerIds.map(id=>{
    const group=registration.groups.find(g=>g.id===id);
    assert.ok(group,'missing historical original seed '+id);
    return {...group};
  });
  const prev=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let control,treatment;
  try{
    control=runArm(false,groups);
    treatment=runArm(true,groups);
  }finally{
    restoreDoor();
    if(prev===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prev;
  }
  const compact=(row)=>({
    id:row.trial.id,
    winner:row.winner??null,finished:row.finished===true,
    nativeActionCount:row.rootActionLedger?.length??row.actionCount??null,
    status:row.status??null,errorCategory:row.error?
      String(row.error).split('\n')[0]:null,
    nativeSourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    nativeUnqualified:true
  });
  const rows=groups.map((g,i)=>{
    const a=compact(control.rows[i]),b=compact(treatment.rows[i]);
    assert.equal(a.id,g.id);assert.equal(b.id,g.id);
    return {rank:g.rank,originalSeed:g.seed,id:g.id,
      control:a,treatment:b};
  });
  const all=rows.flatMap(r=>[r.control,r.treatment]);
  const unknownPowerErrors=all.filter(r=>
    r.errorCategory?.includes('UNKNOWN_POWER')).length;
  return {schema:VERSION,originalRunId:42552656722,
    frozenOriginalRanks:[6,24,29],frozenSourceDeals:3,
    nativeAttempts:6,fixedSixty:'champion-reference',
    noOtherPaperOrPolicyChanges:true,paperQualifiedGames:0,
    summary:{
      originalControlUnknownPowerErrors:3,
      originalTreatmentUnknownPowerErrors:3,
      remainingUnknownPowerErrors:unknownPowerErrors,
      nativeTerminalCount:all.filter(r=>r.finished).length,
      newOtherErrors:all.filter(r=>r.errorCategory&&
        !r.errorCategory.includes('UNKNOWN_POWER')).length
    },rows,
    scope:'A targeted technical replay of previously observed aborts; not fresh game-win-rate data.'};
}

if(require.main===module){
  const result=run();
  if(process.env.AGENT3_THORNS_UNDERWORLD_OUTPUT)
    save(process.env.AGENT3_THORNS_UNDERWORLD_OUTPUT,result);
  process.stdout.write('AGENT3_THORNS_UNDERWORLD_LOCK '+JSON.stringify(result)+'\n');
  if(result.summary.remainingUnknownPowerErrors>0)process.exitCode=1;
}

module.exports={VERSION,historicalUnknownPowerIds,run};
