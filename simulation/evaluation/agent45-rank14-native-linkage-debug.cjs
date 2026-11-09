'use strict';

const assert=require('node:assert/strict');
const registration=require(
  '../../results/aichi-2026/registrations/agent32-prospective-29rank-116native-20261109.json');
const {runNativeBatch}=require('./agent32-fresh-perfection-field.cjs');

const VERSION='agent45-rank14-original-deal-native-linkage-isolation-v1';
const FROZEN_TRIAL='14:3029:B:new-moon-lockbreaker-v1';

/**
 * Reproduce the already-published original 29-rank rank14-B native abort in
 * the identical frozen physical deal, without creating a new sample or
 * changing either registered 60. Emit only postgame source/target evidence.
 * @param {{batch?:Function}} [deps] Injectable exact native batch executor.
 * @returns {object} Read-only developer diagnostic, never a match result.
 */
function run(deps={}){
  const group=registration.groups.find(x=>x.id===FROZEN_TRIAL);
  assert.ok(group&&group.rank===14&&group.candidateSlot==='B');
  const execute=deps.batch??runNativeBatch;
  const shared={
    registeredTrials:[{...group}],
    registeredFrameName:registration.schema,
    nativeRootActionLimit:registration.nativeRootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true
  };
  const arms=[{name:'frozen-control',extra:shared},
    {name:'frozen-funded-pivot',extra:{...shared,perfectionTransition:true}}];
  const rows=arms.map(arm=>{
    const {selected}=execute(true,undefined,arm.extra);
    assert.equal(selected.rawDevelopment.rows.length,1);
    const row=selected.rawDevelopment.rows[0];
    assert.equal(row.trial?.id,FROZEN_TRIAL);
    const side=row.nativeAcceptedTargetSidecarAbort??null;
    const failure=side?.rootOrdinalLinkageFailure??null;
    const targets=side?.events??[];
    const rootLedger=row.nativePublicRootArchive?.rootActionLedger??
      row.rootActionLedger??[];
    return {
      arm:arm.name,trialId:FROZEN_TRIAL,seed:group.seed,
      candidateSeat:1,sourceSeat:0,
      nativeError:row.error?String(row.error).slice(0,600):null,
      rowStatus:row.status??null,
      finished:row.finished??null,
      nativeTargetObserverObservedLiveStore:side?.observedLiveStore??null,
      nativeTargetObserverLinked:side?.rootOrdinalLinked??null,
      acceptedStoreTargetDispatches:side?.acceptedTargetDispatches??null,
      targetFailure:failure,
      rootLedgerLength:rootLedger.length,
      retainedNativeTargetCount:targets.length,
      targetActionSummary:targets.slice(0,12).map(x=>({
        action:x.action,
        seat:x.playerSlot,
        turn:x.turnBefore,
        physicalPrinting:x.declared?.ownerHandPrinting??null
      })),
      fullPhysicalDealFingerprintSha256:
        row.fullPhysicalDealFingerprint?.digestSha256??null,
      originalSourceDealFingerprintSha256:
        row.sourceDealFingerprint?.digestSha256??null,
      developmentOnly:true,competitiveGameQualified:false
    };
  });
  const result={version:VERSION,originalRegistration:registration.schema,
    frozenGroup:FROZEN_TRIAL,enginePin:registration.enginePin,
    retrospectiveDebugOnly:true,rows,competitiveGamesQualified:0};
  process.stdout.write('AGENT45_RANK14_LINKAGE '+JSON.stringify(result)+'\n');
  return result;
}

if(require.main===module)run();
module.exports={VERSION,FROZEN_TRIAL,run};
