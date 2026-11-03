'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditOriginalSelectedV3Blower,VERSION}=
  require('../scripts/agent6-selected-v3-fieldblower-root-audit.cjs');

const PRINT='Field Blower GRI';

/** @param {string} status @param {object[]} targets */
function held(status,targets){
  return {handIndex:2,printing:PRINT,
    removalTargetCertificate:{
      printing:PRINT,printedRuleKnown:true,publicItemLocked:false,
      paperPlayableCertified:false,status,
      eligibleTargetCount:targets.length,targets
    }};
}
/** @param {number} ordinal @param {number} turn @param {string} action @param {object} item */
function root(ordinal,turn,action,item){
  return {ordinal,turn,seat:0,chosen:{action},
    ownerPaperNecessity:{rows:[item]}};
}
/** @param {object[]} frontiers */
function fixture(frontiers){
  return {schema:'original-native-schema',pinnedEngineRevision:'engine-sha',
    originalSourceRanks:[1,5,6,11],
    modes:[{id:'selected-v3-paper-plus-funded-mobility',
      selectedObserver:true,fundedFloatStone:true,
      decisionPolicySha256:'policy-sha',
      fullNative:{rows:[{
        trial:{id:'11:401:A:fixed',rank:11},sourceSeat:1,
        sourceDealFingerprint:'source-deal-sha',
        fullPhysicalDealFingerprint:'full-deal-sha',
        actorOnlyDecisionCoverage:{
          ownerTrainerFrontierAudit:{roots:frontiers}
        },
        rootActionLedger:[
          {actionOrdinal:0,action:'ResolvePromptAction',turnBefore:0},
          ...frontiers.map((x,i)=>({
            actionOrdinal:i+7,action:x.chosen.action,
            turnBefore:x.turn,playerSlot:x.seat
          }))
        ]
      },{trial:{id:'6:401:A:fixed',rank:6},
        error:'Error: UNKNOWN_POWER\n  stack'}]}}
    ]};
}

test('native owner-root bijection and distinct game, turn, root/copy denominators',()=>{
  const target={side:'opponent',zone:'active',slotIndex:0,toolIndex:0,
    printing:'Muscle Band XY',targetClass:'tool'};
  const pass='PassTurnAction';
  const before=fixture([
    root(0,2,pass,held('public-target-and-physical-cost-present-unresolved',[target])),
    root(1,2,pass,held('public-target-and-physical-cost-present-unresolved',[target])),
    root(2,4,'AttackAction',held('necessary-condition-failed',[]))
  ]);
  const snapshot=JSON.stringify(before);
  const result=auditOriginalSelectedV3Blower(before);
  assert.equal(JSON.stringify(before),snapshot);
  assert.equal(result.version,VERSION);
  assert.deepEqual(result.totals,{
    originalAttemptRows:2,rowsWithLiveRootLedger:1,
    rowsWithoutLiveRootLedger:1,nativeOwnerRootsChecked:3,
    heldPhysicalCopyRootObservations:3,
    missingPublicTargetCopyRoots:1,
    positivePublicTargetCopyRoots:2,
    positiveDistinctNativeRoots:2,
    positiveDistinctOwnerTurns:1,
    positiveDistinctTrials:1,
    positiveActorSelectedFieldBlower:0,
    nativeFieldBlowerPlaysAllIntactTrials:0
  });
  assert.equal(result.firstPositiveRoots[0].realNativeActionOrdinal,7);
  assert.equal(result.firstPositiveRoots[0].actorSeat,0);
  assert.equal(result.positivePublicTargetIdentities[0].printing,'Muscle Band XY');
  assert.equal(result.unobservedAttempts[0].nativeError,'Error: UNKNOWN_POWER');
  assert.equal(result.competitiveQualifiedGames,0);
});

test('changing real source action while keeping observer Pass is detected',()=>{
  const f=fixture([root(0,2,'PassTurnAction',
    held('necessary-condition-failed',[]))]);
  f.modes[0].fullNative.rows[0].rootActionLedger[1].action='PlayCardAction';
  assert.throws(()=>auditOriginalSelectedV3Blower(f),
    /Native root-action mismatch/);
});

test('printed target certificate cannot become a paper-legality claim',()=>{
  const f=fixture([root(0,2,'PassTurnAction',
    held('public-target-and-physical-cost-present-unresolved',[
      {side:'opponent',zone:'active',printing:'Muscle Band XY'}
    ]))]);
  f.modes[0].fullNative.rows[0].actorOnlyDecisionCoverage
    .ownerTrainerFrontierAudit.roots[0].ownerPaperNecessity
    .rows[0].removalTargetCertificate.paperPlayableCertified=true;
  assert.throws(()=>auditOriginalSelectedV3Blower(f));
});

test('selected mode identity and source audit must exist',()=>{
  const f=fixture([]);
  f.modes[0].fundedFloatStone=false;
  assert.throws(()=>auditOriginalSelectedV3Blower(f),
    /Expected exact selected-v3 source-mode evidence/);
});
