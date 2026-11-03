'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,effectiveOptions,runRelease}=
  require('../simulation/evaluation/agent4-selected-v3-paper-funded-release.cjs');

test('immutable new v3 registration is eight independent two-seat original-source groups',()=>{
  const m=preflight();
  assert.equal(m.groups.length,8);
  assert.equal(m.registeredTrials.length,16);
  assert.equal(m.expectedNativeAttempts,48);
  assert.equal(new Set(m.groups.map(x=>x.seed)).size,8);
  assert.deepEqual(new Set(m.groups.map(x=>x.rank)),
    new Set([1,5,6,11]));
  assert.deepEqual(new Set(m.groups.map(x=>x.candidateSlot)),
    new Set(['A','B']));
  const base=effectiveOptions(m,m.modes[0]);
  const selected=effectiveOptions(m,m.modes[1]);
  const repeat=effectiveOptions(m,m.modes[2]);
  assert.deepEqual(base,repeat);
  assert.equal(base.actorUnderworldDoorPromptOwner,true);
  assert.equal(base.ownerGenericTrainerFrontier,false);
  assert.equal(selected.ownerGenericTrainerFrontier,true);
  assert.equal(selected.actorFundedShadowRiderFloatStoneRoot,true);
  assert.equal(base.nativeRootActionLimit,180);
  assert.equal(selected.registeredTrials.length,16);
  assert.equal(Object.keys(selected).length,Object.keys(base).length);
});

/**
 * @param {{disagreeFullDeal?:boolean,removePaperAudit?:boolean}} [options]
 * @returns {Function}
 */
function fakeNative(options={}){
  return function runner(policy){
    const paper=policy.ownerGenericTrainerFrontier;
    return {
      attempted:16,
      rows:policy.registeredTrials.map((trial,i)=>({
        trial,sourceSeat:trial.candidateSlot==='A'?1:0,
        sourceDealFingerprint:'source:'+trial.id,
        fullPhysicalDealFingerprint:'full:'+trial.id+
          (paper&&options.disagreeFullDeal&&i===0?':changed':''),
        actualStarterSeat:i%2,
        rootActionLedgerSha256:'root:'+trial.id+(paper?':treatment':''),
        rootActionLedger:[{
          playerSlot:trial.candidateSlot==='A'?1:0,
          action:'AttackAction',attack:'Max Geist'
        }],
        status:'action-capped',finished:false,error:null,
        actorOnlyDecisionCoverage:{
          ownerTrainerFrontierAudit:paper&&!options.removePaperAudit?
            {ownerPaperNecessityOptIn:true,roots:[]}:null,
          detailedComponentAudits:{root:{
            fundedVmaxFloatStoneRootSelected:paper?1:0
          }}
        }
      }))
    };
  };
}

test('registered A/B/A preserves distinct effective policy hashes and true paper audit',()=>{
  const r=runRelease({runner:fakeNative(),withRuntime:work=>work()});
  assert.equal(r.verdict.acceptedDevelopmentRelease,true);
  assert.equal(r.verdict.allPhysical,true);
  assert.equal(r.verdict.controlsIdentical,true);
  assert.equal(r.verdict.selectedPaperAudited,true);
  assert.equal(r.verdict.matchingPhysicalContextPairs,16);
  assert.equal(r.verdict.matchingControlReplays,16);
  assert.equal(r.verdict.attempts,48);
  assert.equal(r.modes[0].effectiveOptionSha256,
    r.modes[2].effectiveOptionSha256.replace(
      r.modes[2].effectiveOptionSha256,
      r.modes[0].effectiveOptionSha256));
  assert.equal(r.modes[1].rows[0].selectedFundedFloatStoneIntents,1);
  assert.equal(r.verdict.competitivelyQualifiedGames,0);
});

test('unmatched source deal fails closed and retains all 48 raw rows',()=>{
  const r=runRelease({runner:fakeNative({disagreeFullDeal:true}),
    withRuntime:work=>work()});
  assert.equal(r.verdict.acceptedDevelopmentRelease,false);
  assert.equal(r.verdict.allPhysical,false);
  assert.equal(r.verdict.matchingPhysicalContextPairs,15);
  assert.equal(r.modes.reduce((n,m)=>n+m.fullNative.rows.length,0),48);
});

test('selected paper observer missing is an admission failure',()=>{
  const r=runRelease({runner:fakeNative({removePaperAudit:true}),
    withRuntime:work=>work()});
  assert.equal(r.verdict.selectedPaperAudited,false);
  assert.equal(r.verdict.acceptedDevelopmentRelease,false);
  assert.equal(r.modes[1].mismatchedOwnerPaperAuditRows,16);
});
