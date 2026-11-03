'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  paperRootCensus,matchingAbortPrefix,auditRelease
}=require('../simulation/evaluation/agent4-selected-v3-offline-audit.cjs');

test('negative paper census counts exact blocker families and unknown held copies',()=>{
  const certificate={
    ownerPaperNecessityOptIn:true,
    roots:[{
      chosen:{action:'PassTurnAction'},
      ownerPaperNecessity:{
        heldTrainerCopies:3,provenNecessaryConditionFailures:2,
        remainingUnresolvedCopies:1,rows:[
          {printing:'Counter Catcher PAR',
            necessaryBlockers:['printed-prize:prerequisite-failed']},
          {printing:'Field Blower GRI',
            necessaryBlockers:['printed-removal-target:no-target']},
          {printing:'Quick Ball SSH',necessaryBlockers:[]}
        ]
      }
    }]
  };
  assert.deepEqual(paperRootCensus(certificate),{
    decisionFrames:1,framesWithNecessaryFailure:1,
    framesWithPrintedFailure:1,passFrames:1,passWithBlockedHeldCard:1,
    heldCopies:3,necessaryFailures:2,unresolvedCopies:1,
    blockerCounts:{'printed-prize':1,'printed-removal-target':1}
  });
  assert.equal(paperRootCensus(null).decisionFrames,0);
  assert.throws(()=>paperRootCensus({
    ...certificate,roots:[{ownerPaperNecessity:{
      ...certificate.roots[0].ownerPaperNecessity,
      remainingUnresolvedCopies:2
    }}]
  }),{name:'AssertionError'});
});

/** @param {string} sha */
function aborted(sha){
  return {status:'engine-error',trial:{id:'6:0:A:champion-reference',seed:1},
    nativeAbortEvidence:{
      actionOrdinal:27,actionName:'UseAbilityAction',turnBefore:8,
      actingSeat:0,errorMessage:'UNKNOWN_POWER',rootActionCount:27,
      rootActionLedgerSha256:sha,
      sourceDealFingerprint:{digestSha256:'public-source-deal'}
    }
  };
}

test('three equal aborts prove identical preabort roots, never full physical deals',()=>{
  const a=aborted('matching-root');
  assert.deepEqual(matchingAbortPrefix([a,a,a]),{
    sameFailure:true,fullPhysicalVerified:false,
    identity:{
      trialId:'6:0:A:champion-reference',seed:1,
      actionOrdinal:27,actionName:'UseAbilityAction',
      turnBefore:8,actingSeat:0,errorMessage:'UNKNOWN_POWER',
      rootActionCount:27,rootActionLedgerSha256:'matching-root',
      sourceDealSha256:'public-source-deal'
    }
  });
  assert.equal(matchingAbortPrefix([a,a,aborted('new-root')]).sameFailure,false);
  assert.equal(matchingAbortPrefix([a,{...a,status:'not-run'},a]).sameFailure,false);
});

function mockArchive({withAbort=false,divergentSelected=false}={}){
  const names=[
    'corrected-bilateral-control-a',
    'selected-v3-paper-plus-funded-mobility',
    'corrected-bilateral-control-b'
  ];
  return {
    schema:'agent4-selected-v3-paper-owner-floatstone-source-a-b-a-v1',
    manifestBlobSha:'5a6c877ceee571f2f48bfbba83d50c913d7da9b2',
    pinnedEngineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    modes:names.map((id,modeIndex)=>{
      const selected=modeIndex===1;
      const rows=Array.from({length:16},(_,i)=>{
        const trial={
          id:'1:'+i+':'+(i%2?'B':'A')+':champion-reference',
          rank:1,seed:i+100,candidateSlot:i%2?'B':'A',
          candidateId:'champion-reference'
        };
        if(withAbort&&i===8)return {
          ...aborted('matching-root'),trial
        };
        const actorVersion='mock-actor'+(selected?'-frontier':'');
        const actor={
          version:actorVersion,
          selectedHandlerPriority:['search','trainer','attack'],
          componentVersions:{actor:'v1'},
          ownerVipAfterPassOptIn:true,
          ownerTrainerFrontierAudit:selected?{
            ownerPaperNecessityOptIn:true,roots:[{
              ownerPaperNecessity:{
                heldTrainerCopies:2,provenNecessaryConditionFailures:1,
                remainingUnresolvedCopies:1,rows:[{
                  necessaryBlockers:['printed-temporal:expired']
                },{necessaryBlockers:[]}]
              }
            }]
          }:null
        };
        return {
          trial,sourceSeat:i%2?0:1,candidateSeat:i%2?1:0,
          status:null,finished:true,endReason:'engine-game-end',
          sourceDealFingerprint:'source:'+trial.id,
          fullPhysicalDealFingerprint:'all:'+trial.id,
          actualStarterSeat:i%2,
          rootActionLedgerSha256:'control-root:'+i+
            (selected&&divergentSelected&&i===2?':treatment':''),
          actorOnlyPolicyVersion:actorVersion,
          actorOnlyDecisionCoverage:actor
        };
      });
      return {
        id,selectedObserver:selected,
        rows:rows.map(row=>({
          selectedFundedFloatStoneIntents:selected?1:0,
          sourceFloatStonePlays:0
        })),
        fullNative:{
          actorOnlyCompositionOptIn:true,
          ownerGenericTrainerFrontierOptIn:selected,
          actorOnlyCompositionVersion:'mock-actor'+
            (selected?'-frontier':''),
          rows
        }
      };
    })
  };
}

test('all-intact A/B/A actually executing actor attestation qualifies development only',()=>{
  const out=auditRelease(mockArchive({divergentSelected:true}));
  assert.equal(out.releaseQualified,true);
  assert.equal(out.intactRootComparisons,16);
  assert.equal(out.exactControlRepeatIntactTraces,16);
  assert.equal(out.exactSelectedAndControlIntactTraces,15);
  assert.equal(out.firstDifferingIntactRoot.trialId,
    '1:2:A:champion-reference');
  assert.equal(out.paperCensus.necessaryFailures,16);
  assert.equal(out.paperCensus.unresolvedCopies,16);
  assert.equal(out.paperCensus.decisionFrames,16);
  assert.equal(out.paperCensus.framesWithNecessaryFailure,16);
  assert.equal(out.paperCensus.framesWithPrintedFailure,16);
  assert.equal(out.paperCensus.passFrames,0);
  assert.equal(out.paperCensus.passWithBlockedHeldCard,0);
  assert.equal(out.paperCensus.blockerCounts['printed-temporal'],16);
  assert.ok(out.modes.every(x=>x.runtimePolicyStatus===
    'OBSERVED_CLOSURE_CONSISTENT'));
  assert.equal(out.modes[0].runtimeObservedDigest,
    out.modes[2].runtimeObservedDigest);
  assert.notEqual(out.modes[0].runtimeObservedDigest,
    out.modes[1].runtimeObservedDigest);
  assert.equal(out.competitivePaperGamesQualified,0);
});

test('matching identical UNKNOWN_POWER aborts remain nonqualified',()=>{
  const out=auditRelease(mockArchive({withAbort:true}));
  assert.equal(out.releaseQualified,false);
  assert.equal(out.intactRootComparisons,15);
  assert.equal(out.abortsWithIdenticalSourceAndAcceptedTrace,1);
  assert.equal(out.aborts[0].fullPhysicalVerified,false);
  assert.equal(out.modes[1].runtimeMissingRows,1);
  assert.equal(out.modes[1].runtimePolicyStatus,'PARTIAL_RUNTIME_COVERAGE');
  assert.equal(out.paperAuditAllAttemptedRoots,false);
  assert.equal(out.competitivePaperGamesQualified,0);
});
