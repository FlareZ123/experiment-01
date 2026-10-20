'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceFirstNativePressureVerified,sourceFirstNativeExposureKind}=require(
  '../simulation/evaluation/agent3-source-first-pressure-kind.cjs');

function rank6(){
  const pressure={pressureKind:'passive-ability-suppression',
    rootActionOrdinal:4,completionOrdinal:4,
    actorSeat:0,turnBefore:1,completionTurnBefore:1};
  return {rank:6,sourcePressure:pressure,
    rank6PassivePressure:{
      schema:'agent41-rank6-passive-initialization-root-classification-v1',
      status:'native-capability-suppression-with-rooted-turn-continuity',
      sourceSeat:0,candidateSeat:1,sourceActuallyFirst:true,
      sourceActiveContinuity:true,nativeCapabilitySuppressed:true,
      rootedReplyAndReturn:true,
      sourceTurnOneEndRoot:{ordinal:4,seat:0,turn:1,
        action:'PassTurnAction'}
    },rootActionLedger:[
      {},{},{},{},{action:'PassTurnAction',turnBefore:1,playerSlot:0}]
  };
}
function rank11(){
  return {rank:11,sourcePressure:{
    pressureKind:'item-enabled-ability-lock',actorSeat:0,
    rootActionOrdinal:3,completionOrdinal:3,
    turnBefore:1,completionTurnBefore:1
  },garbotoxinWindowAudit:{
    schema:'agent41-authentic-rank11-garbotoxin-ability-window-v1',
    sourceSeat:0,candidateSeat:1,turn:2,realStoreOnly:true,
    before:{globalTurn:2,sourceGarbodorHasTool:true,
      candidatePrintedPowerNames:['New Moon'],
      candidatePrintedNewMoonBlocked:true}
  },rootActionLedger:[{},{},{},
    {action:'PlayCardAction',card:'Boost Shake',turnBefore:1,
      playerSlot:0}]};
}

test('rank6 native passive lock passes its typed, rooted evidence preflight',()=>{
  assert.equal(sourceFirstNativePressureVerified(rank6()),true);
});
test('rank6 cannot substitute a first-turn attack for passive suppression',()=>{
  const x=rank6();
  x.sourcePressure.pressureKind='attack-settlement';
  assert.equal(sourceFirstNativePressureVerified(x),false);
  x.sourcePressure.pressureKind='passive-ability-suppression';
  x.rootActionLedger[4].action='AttackAction';
  assert.equal(sourceFirstNativePressureVerified(x),false);
});
test('rank6 demands printed native suppression and an actual source-return',()=>{
  const x=rank6();
  x.rank6PassivePressure.nativeCapabilitySuppressed=false;
  assert.equal(sourceFirstNativePressureVerified(x),false);
  x.rank6PassivePressure.nativeCapabilitySuppressed=true;
  x.rank6PassivePressure.rootedReplyAndReturn=false;
  assert.equal(sourceFirstNativePressureVerified(x),false);
});
test('rank11 requires both the paid Boost Shake root and blocked printed Ability',()=>{
  const x=rank11();
  assert.equal(sourceFirstNativePressureVerified(x),true);
  x.garbotoxinWindowAudit.before.candidatePrintedNewMoonBlocked=false;
  assert.equal(sourceFirstNativePressureVerified(x),false);
  x.garbotoxinWindowAudit.before.candidatePrintedNewMoonBlocked=true;
  x.rootActionLedger[3].card='Research';
  assert.equal(sourceFirstNativePressureVerified(x),false);
});
test('unobserved native pressure must fail closed without throwing',()=>{
  for(const x of [rank6(),rank11()]){
    delete x.rank6PassivePressure;
    delete x.garbotoxinWindowAudit;
    assert.equal(sourceFirstNativePressureVerified(x),false);
    delete x.rootActionLedger;
    assert.equal(sourceFirstNativePressureVerified(x),false);
  }
});
test('later pressure or any other rank cannot satisfy first-turn hard-pressure preflight',()=>{
  const x=rank6();
  x.sourcePressure.turnBefore=2;
  assert.equal(sourceFirstNativePressureVerified(x),false);
  x.sourcePressure.turnBefore=1;
  x.rank=7;
  assert.equal(sourceFirstNativePressureVerified(x),false);
});

test('generic-only native check stays insufficient',()=>{
 const x=rank11();
 x.garbotoxinWindowAudit.before.candidatePrintedPowerNames=['Underworld Door'];
 x.garbotoxinWindowAudit.before.candidateGenericAbilityBlocked=true;
 assert.equal(sourceFirstNativePressureVerified(x),false);
});

test('rank11 named other Power accepted only if block matches',()=>{
 const x=rank11();
 x.garbotoxinWindowAudit.before.candidatePrintedPowerNames=['Underworld Door'];
 x.garbotoxinWindowAudit.before.candidatePrintedPowerChecks=[{name:'Underworld Door',blocked:true}];
 assert.equal(sourceFirstNativePressureVerified(x),true);
 x.garbotoxinWindowAudit.before.candidatePrintedPowerChecks=[{name:'Wrong Power',blocked:true}];
 assert.equal(sourceFirstNativePressureVerified(x),false);
});


test('rank11 accepts a native Benched-only printed Power block',()=>{
  const x=rank11();
  const before=x.garbotoxinWindowAudit.before;
  before.candidatePrintedPowerNames=[];
  before.candidatePrintedPowerChecks=[];
  before.candidateInPlayPrintedPowerChecks=[{
    zone:'Bench',benchIndex:0,printing:'Shadow Rider Calyrex VMAX CRE',
    name:'Underworld Door',blocked:true
  }];
  assert.equal(sourceFirstNativePressureVerified(x),true);
  before.candidateInPlayPrintedPowerChecks[0].blocked=false;
  assert.equal(sourceFirstNativePressureVerified(x),false);
  before.candidateInPlayPrintedPowerChecks[0].blocked=true;
  before.candidateInPlayPrintedPowerChecks[0].printing='';
  assert.equal(sourceFirstNativePressureVerified(x),false);
});

test('rank11 full in-play audit overrides stale historical Active-only positives',()=>{
  const x=rank11();
  x.garbotoxinWindowAudit.before.candidateInPlayPrintedPowerChecks=[];
  assert.equal(sourceFirstNativePressureVerified(x),false);
});

test('rank6 genuine no-target is recorded as exposed without claiming a suppressed Power',()=>{
  const x=rank6(),e=x.rank6PassivePressure;
  e.status='no-eligible-visible-power';
  e.nativeCapabilitySuppressed=false;
  e.observedBoundaryActors=true;
  e.examinedPrintedPowerCount=0;
  e.sourceTurnOneSnapshotPresent=true;
  e.candidateTurnTwoSnapshotPresent=true;
  e.sourceReturnSnapshotPresent=true;
  e.targetPrinting=null;
  e.targetPowerName=null;
  assert.equal(sourceFirstNativePressureVerified(x),false);
  assert.equal(sourceFirstNativeExposureKind(x),'no-eligible-power-present');
  e.candidateTurnTwoSnapshotPresent=false;
  assert.equal(sourceFirstNativeExposureKind(x),'unverified');
  e.candidateTurnTwoSnapshotPresent=true;
  e.examinedPrintedPowerCount=1;
  assert.equal(sourceFirstNativeExposureKind(x),'unverified');
  e.examinedPrintedPowerCount=0;
  x.rootActionLedger[4].action='AttackAction';
  assert.equal(sourceFirstNativeExposureKind(x),'unverified');
});

test('native blocked control remains distinct from exempt, missing and other-rank claims',()=>{
  const x=rank6();
  assert.equal(sourceFirstNativeExposureKind(x),'native-blocked-eligible-power');
  x.rank6PassivePressure.nativeCapabilitySuppressed=false;
  assert.equal(sourceFirstNativeExposureKind(x),'unverified');
  assert.equal(sourceFirstNativeExposureKind(rank11()),'native-blocked-eligible-power');
  const missing=rank11();
  delete missing.garbotoxinWindowAudit;
  assert.equal(sourceFirstNativeExposureKind(missing),'unverified');
});

test('rank11 no-target requires the entire authentic in-play Power inventory and tooled source',()=>{
  const x=rank11(),before=x.garbotoxinWindowAudit.before;
  before.candidatePrintedPowerNames=[];
  before.candidatePrintedPowerChecks=[];
  before.candidateInPlayPrintedPowerChecks=[];
  assert.equal(sourceFirstNativePressureVerified(x),false);
  assert.equal(sourceFirstNativeExposureKind(x),'no-eligible-power-present');
  delete before.candidateInPlayPrintedPowerChecks;
  assert.equal(sourceFirstNativeExposureKind(x),'unverified');
  before.candidateInPlayPrintedPowerChecks=[];
  before.sourceGarbodorHasTool=false;
  assert.equal(sourceFirstNativeExposureKind(x),'unverified');
  before.sourceGarbodorHasTool=true;
  x.rootActionLedger[3].card='Professor Research';
  assert.equal(sourceFirstNativeExposureKind(x),'unverified');
});
