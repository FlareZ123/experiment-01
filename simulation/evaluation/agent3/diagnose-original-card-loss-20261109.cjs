'use strict';

const assert=require('node:assert/strict');
const {registered,runArm}=require('./portable-champion-all29-20261109.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-20261109-regidrago-original-reference-custody-failure-replay-v1';
const ERR='Twinleaf settled original physical 60-card invariant violated';
const TARGETS=new Map([
  ['12:6122:A:champion-reference',191],
  ['12:6123:B:champion-reference',44],
  ['13:6124:A:champion-reference',202],
  ['13:6125:B:champion-reference',61],
  ['27:6148:A:champion-reference',39],
  ['32:6157:B:champion-reference',48]
]);

/**
 * Replay only the six previously observed original Regidrago failures,
 * preserving the registered source/candidate printed sixties and seed/seat.
 * This is a post-result diagnostic, never a new prospective performance test.
 */
function run(){
  const groups=registered().filter(row=>TARGETS.has(row.id));
  assert.equal(groups.length,6);
  const previous=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restore=installUnderworldDoorPsychicRecipientHook();
  let observed;
  try {
    observed=runArm(false,groups);
  }finally{
    restore();
    if(previous===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=previous;
  }
  const rows=observed.rows.map((row,i)=>{
    const witness=row.physicalZoneQualification?.witness??null;
    const custody=witness?.ownership?.originalOwnerCustody??null;
    const errorFirst=String(row.error??'').split('\n')[0];
    const sameFailure=errorFirst.includes(ERR);
    return {
      id:groups[i].id,rank:groups[i].rank,seed:groups[i].seed,
      actualFailureRoot:witness?.actionOrdinal??null,
      oldFailureRoot:TARGETS.get(groups[i].id),
      exactOldFailureRootReproduced:
        witness?.actionOrdinal===TARGETS.get(groups[i].id),
      errorCategory:errorFirst,physicallyInvalidAgain:sameFailure,
      canonicalCounts:witness?.ownership?.canonicalCounts??null,
      lostOriginalCardPrintings:custody?.missingOriginalCards??null,
      missingOriginalCounts:custody?.missingOriginalCounts??null,
      publicAcceptedRootsBeforeFailure:
        witness?.lastAcceptedPublicRootsBeforeFailure??null,
      failureAction:witness?.actionType??null,
      physicalZoneStatus:row.physicalZoneQualification?.status??null
    };
  });
  return {
    schema:VERSION,originalRegistration:
      'results/aichi-2026/registrations/agent3-portable-champion-all29-ab-20261109.json',
    originalFullFieldRunId:42552656722,
    printedSixtiesAndPhysicalSeedsUnchanged:true,
    postResultDiagnostic:true,
    reexecutedArms:6,paperQualifiedGames:0,
    sameNativeFailureCode:rows.filter(r=>r.physicallyInvalidAgain).length,
    sameOriginalFailingRoots:rows.filter(r=>
      r.exactOldFailureRootReproduced).length,
    rows
  };
}

if(require.main===module){
  const result=run();
  if(process.env.AGENT3_REGIDRAGO_LOSS_OUTPUT)
    save(process.env.AGENT3_REGIDRAGO_LOSS_OUTPUT,result);
  process.stdout.write('AGENT3_REGIDRAGO_ORIGINAL_CARD_LOSS '+
    JSON.stringify(result)+'\n');
}
module.exports={VERSION,TARGETS,run};
