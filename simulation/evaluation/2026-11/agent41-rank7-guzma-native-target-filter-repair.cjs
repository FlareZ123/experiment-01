'use strict';

const assert=require('node:assert/strict');
const {frozenGroups}=
  require('../agent3/prospective-all29-celestial-paper-v2.cjs');
const {runArm,summarize}=
  require('../agent3/portable-champion-all29-20261109.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook}=
  require('../../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');

const VERSION='agent41-original-rank7-Guzma-protected-target-native-replay-v1';

/**
 * Native replay of the published source rank7 A/B physical seeds. This
 * regression compares against archived pre-patch CI 42558419012, not a new
 * prospective win-rate sample. No deck, policy toggles, or seed changes.
 */
function run() {
  const trials=frozenGroups().filter(t=>t.rank===7);
  assert.deepEqual(trials.map(t=>t.candidateSlot),['A','B']);
  const oldEnv=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let restoreRoar=null,output;
  try{
    restoreRoar=installRegidragoCelestialRoarPaperCustodyHook();
    output=runArm(false,trials,options=>runDevelopment({
      ...options,registeredFrameName:VERSION
    }));
  }finally{
    try{if(restoreRoar)restoreRoar();}
    finally{
      restoreDoor();
      if(oldEnv===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
      else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=oldEnv;
    }
  }
  const rows=output.rows.map((row,index)=>{
    const native=summarize(row);
    const counts=row.actorOnlyDecisionCoverage?.nativeDecisionCounts??{};
    return {
      trialId:trials[index].id,seed:trials[index].seed,
      candidateSeat:trials[index].candidateSlot,
      initialStarterSeat:row.actualStarterSeat,
      sourceDealFingerprint:row.sourceDealFingerprint,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
      status:native.status,rootCount:native.rootCount,
      winner:native.winner,finalPrizes:native.finalPrizes,
      error:native.error,
      choosePokemonAccepted:counts.choosePokemonAccepted??null,
      choosePokemonSettled:counts.choosePokemonSettled??null,
      choosePokemonNativeFiltered:counts.choosePokemonNativeFiltered??null
    };
  });
  const rank7SeatB=rows.find(r=>r.candidateSeat==='B');
  assert.ok(rank7SeatB);
  // Both seats had an independently audited original printed 60. A native
  // protected-target result must stop being misclassified as an unresolved
  // Store prompt. More play/clock proof is still required for qualification.
  assert.ok(!rank7SeatB.error?.includes(
    'ChoosePokemon Store returned without resolving the prompt'),
    'Known historical protected-target false abort still present');
  return {schema:VERSION,enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalSourceRank:7,candidate:'champion-reference',
    nativeAttempts:2,paperQualifiedGames:0,rows};
}

if(require.main===module)
  process.stdout.write('AGENT41_RANK7_PROTECTED_GUZMA_NATIVE '+
    JSON.stringify(run())+'\n');

module.exports={VERSION,run};
