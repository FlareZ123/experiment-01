'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {crossjoinNativePhysicalPrizeExits}=require(
  '../simulation/evaluation/agent24-v8-prize-physical-crossjoin.cjs');

/** @returns {{v8:object,physical:object}} */
function fixture() {
  const roots=[
    {actionOrdinal:0,turnBefore:4,playerSlot:0,action:'AttackAction'},
    {actionOrdinal:1,turnBefore:4,playerSlot:0,action:'ResolvePromptAction'}
  ];
  const digest=createHash('sha256').update(JSON.stringify(roots)).digest('hex');
  const v8={provenance:{observedTwinleafCommit:'vendorpin'},attempts:[{
    id:'a',status:'root-cap-unqualified',originalSourceSeat:0,candidateSeat:1,
    sourceDealFingerprint:'source',fullPhysicalDealFingerprint:'full',
    publicRootActions:roots,publicRootActionsTruncated:false,
    publicRootActionCount:2,publicRootLedgerSha256Computed:digest,
    publicRootLedgerSha256Reported:digest,finalPrizes:[5,6],
    actualSourceAttackSettlement:{declarations:1,settled:1,attacks:[{settledPromptChain:true,
      actionOrdinal:0,completionRootOrdinal:1,turnBefore:4,
      attackName:'Test',prizesBefore:[6,6],prizesAfter:[5,6]}]},
    candidateAttackSettlement:{attacks:[]}
  }]};
  const physical={vendor:'vendorpin',callbackTrialJoinPassed:true,
    actualHeadlessRootCallbacks:1,
    physicalExitObserver:{registeredRootStores:1,hiddenPrizeFacesRead:false,
      omittedRecords:0,rootsWithPrizeCardExit:1,exactPhysicalPrizeCardsExited:1},
    actualOriginalDispositionRows:[{
      id:'a',status:'root-cap-unqualified',sourceSeat:0,candidateSeat:1,
      sourceDealFingerprint:'source',fullPhysicalDealFingerprint:'full',
      rootActionCount:2,finalPrizes:[5,6],
      actualDeclaredSourceAttacks:1,completedSettledSourceAttacks:1
    }],exactTrialLinkedEveryPhysicalPrizeExit:[{
      registeredTrialId:'a',ownerSeat:0,turn:4,
      prePrizeCards:6,postPrizeCards:5,exactExitedCards:1,
      actionType:'ResolvePromptAction',byDestination:{hand:1}
    }]};
  return {v8,physical};
}

test('matches settled attack to physical Prize object hand transfer',()=>{
  const {v8,physical}=fixture();
  const r=crossjoinNativePhysicalPrizeExits(v8,physical);
  assert.equal(r.registeredTrials,1);
  assert.equal(r.sourcePrizeAttackEvents,1);
  assert.equal(r.contenderPrizeAttackEvents,0);
  assert.equal(r.uniquelyJoinedEvents,1);
  assert.equal(r.physicallyMovedPrizeCards,1);
  assert.equal(r.rows[0].exactRootOrdinalIndependentJoin,false);
  assert.equal(r.paperQualifiedGames,0);
});

test('wrong physical source deal invalidates replay pairing',()=>{
  const {v8,physical}=fixture();
  physical.actualOriginalDispositionRows[0].sourceDealFingerprint='different';
  assert.throws(()=>crossjoinNativePhysicalPrizeExits(v8,physical));
});

test('wrong actor identity is not a matching Prize exit',()=>{
  const {v8,physical}=fixture();
  physical.exactTrialLinkedEveryPhysicalPrizeExit[0].ownerSeat=1;
  assert.throws(()=>crossjoinNativePhysicalPrizeExits(v8,physical));
});

test('wrong turn cannot be silently matched to another event',()=>{
  const {v8,physical}=fixture();
  physical.exactTrialLinkedEveryPhysicalPrizeExit[0].turn=5;
  assert.throws(()=>crossjoinNativePhysicalPrizeExits(v8,physical));
});

test('duplicate physical records cannot be used as ambiguous evidence',()=>{
  const {v8,physical}=fixture();
  physical.exactTrialLinkedEveryPhysicalPrizeExit.push(
    {...physical.exactTrialLinkedEveryPhysicalPrizeExit[0]});
  physical.physicalExitObserver.rootsWithPrizeCardExit=2;
  physical.physicalExitObserver.exactPhysicalPrizeCardsExited=2;
  assert.throws(()=>crossjoinNativePhysicalPrizeExits(v8,physical));
});

test('capped uncompleted attacks are not counted as settled Prize awards',()=>{
  const {v8,physical}=fixture();
  v8.attempts[0].actualSourceAttackSettlement.attacks[0].settledPromptChain=false;
  assert.throws(()=>crossjoinNativePhysicalPrizeExits(v8,physical),
    /Unattributed physical Prize exits/);
});

test('physical Prize face inspection is a hard evidence veto',()=>{
  const {v8,physical}=fixture();
  physical.physicalExitObserver.hiddenPrizeFacesRead=true;
  assert.throws(()=>crossjoinNativePhysicalPrizeExits(v8,physical));
});

test('digest alteration fails before source Prize interpretation',()=>{
  const {v8,physical}=fixture();
  v8.attempts[0].publicRootActions[0].action='PassTurnAction';
  assert.throws(()=>crossjoinNativePhysicalPrizeExits(v8,physical));
});
