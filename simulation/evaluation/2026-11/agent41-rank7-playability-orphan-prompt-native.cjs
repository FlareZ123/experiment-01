'use strict';

const assert = require('node:assert/strict');
const {
  frozenGroups
} = require('../agent3/prospective-all29-celestial-paper-v2.cjs');
const {runArm,summarize} =
  require('../agent3/portable-champion-all29-20261109.cjs');
const {runDevelopment} =
  require('../agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook} =
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook} =
  require('../../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');
const {installPlayabilityOrphanPromptCleanupHook,VERSION} =
  require('../../twinleaf/playability-orphan-prompt-cleanup-hook.cjs');

const SCHEMA='agent41-rank7-original-physical-orphan-prompt-a-b-native-v1';

/**
 * Replay the already-published rank7 physical seeds under the same candidate
 * 60, same canonical two-owner policy, same paper compatibility hooks, and
 * same game root limit. Only the reversible Store cleanup changes.
 * Retrospective engine regression, NOT an independent strength experiment.
 */
function run() {
  const selected=frozenGroups().filter(g=>g.rank===7);
  assert.deepEqual(selected.map(g=>g.candidateSlot),['A','B']);
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let restoreRoar=null,control,repaired,audit=null;
  try {
    restoreRoar=installRegidragoCelestialRoarPaperCustodyHook();
    const runner=name=>runArm(false,selected,options=>runDevelopment({
      ...options,registeredFrameName:SCHEMA+'-'+name
    }));
    control=runner('baseline');
    const hook=installPlayabilityOrphanPromptCleanupHook();
    try {
      repaired=runner('cleanup');
      audit=hook.audit;
    } finally {
      hook.restore();
    }
  } finally {
    try {if(restoreRoar)restoreRoar();}
    finally {
      restoreDoor();
      if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
      else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
    }
  }
  const pairs=control.rows.map((row,index)=>{
    const baseline=summarize(row),changed=summarize(repaired.rows[index]);
    assert.equal(baseline.id,changed.id);
    const sourceDealMatched=JSON.stringify(baseline.sourceDealFingerprint)===
      JSON.stringify(changed.sourceDealFingerprint);
    const fullDealMatched=JSON.stringify(baseline.fullPhysicalDealFingerprint)===
      JSON.stringify(changed.fullPhysicalDealFingerprint);
    assert.equal(sourceDealMatched,true,'Original source physical deal drift');
    assert.equal(fullDealMatched,true,'Both-actor physical deal drift');
    assert.equal(row.actualStarterSeat,repaired.rows[index].actualStarterSeat,
      'Initial turn order drift');
    return {
      id:baseline.id,rank:baseline.rank,seed:baseline.seed,
      sourceSeat:selected[index].candidateSlot==='A'?1:0,
      candidateSeat:baseline.candidateSeat,sourceDealMatched,fullDealMatched,
      actualStarterSeat:row.actualStarterSeat,
      baseline:{status:baseline.status,winner:baseline.winner,
        rootCount:baseline.rootCount,error:baseline.error},
      cleanup:{status:changed.status,winner:changed.winner,
        rootCount:changed.rootCount,error:changed.error},
      rootLedgerUnchanged:baseline.rootLedgerSha256===
        changed.rootLedgerSha256,
      rootDivergenceFirstIndex:baseline.rootActionLedger&&
        changed.rootActionLedger?
        baseline.rootActionLedger.findIndex((root,i)=>
          JSON.stringify(root)!==
          JSON.stringify(changed.rootActionLedger[i])):null
    };
  });
  return {schema:SCHEMA,enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    candidate:'champion-reference',originalRank:7,
    originalPhysicalGames:2,nativeAttempts:4,exactPaperGames:0,
    cleanupHook:VERSION,hookAudit:audit,pairs};
}

if(require.main===module) {
  const result=run();
  process.stdout.write('AGENT41_RANK7_ORPHAN_NATIVE '+JSON.stringify(result)+'\n');
}

module.exports={SCHEMA,run};
