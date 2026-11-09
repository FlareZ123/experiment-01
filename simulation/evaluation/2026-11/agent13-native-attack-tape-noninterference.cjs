'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {arm,firstDifference,firstPhysicalDivergence}=
  require('./agent20-rank5-gengar-tempo-aba.cjs');
const {originalNegativeTrial}=
  require('./agent36-gengar-v3-original-regression-native.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const OUTPUT=path.join(ROOT,
  'artifacts/agent13-native-attack-tape-noninterference-50703.json');
const digest=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/** Atomic, locked output from one process, retaining all accepted native roots. */
function save(output){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(output,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(tmp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

/**
 * One exact native Store pair tests observer side effects, not game strength.
 * Owner policy, original source printings, seed, root cap, and script stay
 * fixed. The only variable is postgame read-only physical receipt capture.
 */
function main(){
  const {trial}=originalNegativeTrial();
  const registration={
    caseId:'agent13-native-postgame-attack-tape-noninterference-50703',
    rootCap:320,registeredTrials:[trial]
  };
  const options={
    ownerLillieAfterPass:true,
    minOpponentHandCount:6,
    resourceV3:true
  };
  const base=arm('A-observer-off',false,registration,{
    ...options,captureNativeAttackPhysicalTape:false
  });
  const sampled=arm('B-observer-on',false,registration,{
    ...options,captureNativeAttackPhysicalTape:true
  });
  assert.equal(base.nativeAttackModalityLedger?.physicalTapeAvailable,false);
  assert.equal(sampled.nativeAttackModalityLedger?.physicalTapeAvailable,true);
  assert.equal(base.nativeAttackPhysicalTape,null);
  assert.equal(sampled.nativeAttackPhysicalTape?.capturesFullDeckCustody,false);
  assert.equal(sampled.nativeAttackPhysicalTape?.postAcceptedRoots.length,
    sampled.rootCount);
  assert.equal(sampled.rootPhysicalLinked,true);
  assert.deepEqual(firstDifference(base,sampled),null,
    'Read-only Store tape must never alter an accepted root');
  assert.deepEqual(firstPhysicalDivergence(base,sampled),null,
    'Read-only Store tape must never alter physical card zones');
  assert.equal(base.rootLedgerSha256,sampled.rootLedgerSha256);
  assert.equal(base.sourceFingerprint,sampled.sourceFingerprint);
  assert.equal(base.fullFingerprint,sampled.fullFingerprint);
  assert.equal(base.nativeWinner,sampled.nativeWinner);
  assert.equal(base.nativeFinished,sampled.nativeFinished);
  assert.deepEqual(base.candidatePerfectionPrizeReceipts,
    sampled.candidatePerfectionPrizeReceipts);
  const oldCounter=sampled.roots.filter(root=>
    root.playerSlot===sampled.candidateSeat&&
    root.action==='AttackAction').length;
  const actorEvents=sampled.nativeAttackModalityLedger.events.filter(event=>
    event.ownerSeat===sampled.candidateSeat&&
    event.modality==='perfection-copied-attack-initiation');
  const expected=sampled.candidatePerfectionPrizeReceipts;
  assert.deepEqual(actorEvents.map(e=>e.initiatingRootOrdinal),
    expected.map(e=>e.initiatingRoot));
  assert.deepEqual(actorEvents.map(e=>e.observedSameTurnPrizeDelta),
    expected.map(e=>e.actualPrizesTaken));
  assert.equal(sampled.nativeAttackModalityLedger.paperPaymentCertified,false);
  assert.equal(sampled.nativeAttackModalityLedger.competitiveGameQualified,false);
  const outcome={
    schema:'agent13-native-observer-on-off-50703-v1',
    trial,posthocFixture:true,
    paperQualifiedGames:0,
    sameFullPhysicalInitialDeal:true,
    identicalAcceptedRootSha256:base.rootLedgerSha256,
    identicalFullPhysicalStoreTapeSha256:digest(sampled.physicalTape),
    winnerUnchanged:sampled.nativeWinner,
    oldCandidateRootClassAttackCount:oldCounter,
    recoveredCandidatePerfectionRootCount:actorEvents.length,
    recoveredPerfectionPrizeChanges:actorEvents.map(e=>
      e.observedSameTurnPrizeDelta),
    rootCount:sampled.rootCount,
    physicalRootsObserved:
      sampled.nativeAttackPhysicalTape.postAcceptedRoots.length,
    nativeAttackModalityLedger:sampled.nativeAttackModalityLedger,
    previousNativePhysicalReceipt:sampled.candidatePerfectionPrizeReceipts,
    originalDeckListUnmodified:true,
    sampleType:'historical mechanism smoke, not prospective'
  };
  save(outcome);
  process.stdout.write('AGENT13_ACTUAL_STORE_POSTGAME_ATTACK_CAPTURE '+
    JSON.stringify({rootCount:outcome.rootCount,
      ordinaryCandidateAttackAction:oldCounter,
      perfectionRoots:actorEvents.map(e=>e.initiatingRootOrdinal),
      physicalPrizeDeltas:outcome.recoveredPerfectionPrizeChanges,
      sameWinner:base.nativeWinner===sampled.nativeWinner,
      identicalNativeRootAndPhysical:true,
      qualified:0})+'\n');
  return outcome;
}
if(require.main===module)main();
module.exports={main,OUTPUT};
