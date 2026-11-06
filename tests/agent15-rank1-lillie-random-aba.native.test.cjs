'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {TARGET}=require('../simulation/twinleaf/agent15-rank1-mirror-lillie-aba.cjs');
const {VERSION,ENTROPY_SEED,runOriginalRank1RandomNightWatchLillieABA}=
  require('../simulation/twinleaf/agent15-rank1-lillie-random-aba.cjs');

const ORIGINAL_SHA='3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a';
const id=x=>x.trial?.id??x.id;
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const rootSha=x=>x.rootActionLedgerSha256??sha(x.rootActionLedger??[]);
const byId=(phase,target)=>{
  const row=phase.execution.rawDevelopment.rows.find(x=>id(x)===target);
  assert.ok(row);return row;
};

test('original rank1 Lillie A/B/A with independent direct Night Watch random resolver',()=>{
  const r=runOriginalRank1RandomNightWatchLillieABA();
  assert.equal(r.schema,VERSION);
  assert.deepEqual(r.phases.map(x=>x.phase),['A','B','A-repeat']);
  const A=byId(r.phases[0],TARGET),B=byId(r.phases[1],TARGET),
    A1=byId(r.phases[2],TARGET);
  assert.equal(rootSha(A),ORIGINAL_SHA);
  assert.equal(rootSha(A1),ORIGINAL_SHA);
  const sourceAudit=r.phases[1].audit;
  assert.equal(sourceAudit.actualTypedProposals,1);
  const random=sourceAudit.directNightWatchPaperRandom;
  assert.equal(random.seed,ENTROPY_SEED);
  assert.equal(random.restored,true);
  assert.ok(random.samples.length>=1,
    'genuine source Night Watch must reach uniform physical-index sampler');
  assert.ok(random.samples.every(x=>
    x.ownerHiddenCardNamesReadForDecision===false&&
    x.nativePromptValidated===true&&x.seat===0&&
    x.sampledIndices.length===x.count&&
    new Set(x.sampledIndices).size===x.count));
  const original=A.rootActionLedger,treated=B.rootActionLedger;
  const fork=original.findIndex(x=>x.playerSlot===0&&
    x.turnBefore===20&&x.action==='PassTurnAction');
  assert.ok(fork>0);
  assert.deepEqual(treated.slice(0,fork),original.slice(0,fork));
  assert.equal(treated[fork].action,'PlayCardAction');
  assert.match(String(treated[fork].card),/Lillie/i);
  for(const a of r.phases[0].execution.rawDevelopment.rows){
    const key=id(a),b=byId(r.phases[1],key),ar=byId(r.phases[2],key);
    assert.deepEqual(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
    assert.deepEqual(a.fullPhysicalDealFingerprint,ar.fullPhysicalDealFingerprint);
    assert.equal(rootSha(a),rootSha(ar));
    if(key!==TARGET)assert.equal(rootSha(a),rootSha(b));
  }
  const info=x=>({status:x.status??null,finished:x.finished??false,
    remainingPrizes:x.finalPrizes??null,rootCount:x.rootActionLedger?.length??null,
    publicRootSHA:rootSha(x),
    sourceAttackSettlement:x.sourceAttackSettlement??null,
    candidateAttackSettlement:x.candidateAttackSettlement??null});
  const report={
    schema:VERSION,originalTrial:TARGET,baselineSeed:1084952875,
    randomCorrectionSeed:ENTROPY_SEED,originalSourceSeat:0,
    samePrinted60BothSides:true,fullPhysicalDealMatched8of8:true,
    allEightUnchangedControlsEqual:true,originalPrefixMatched:true,
    forkOrdinal:fork,actualNativeLillieAction:treated[fork],
    sourceTreatmentAudit:sourceAudit,controlA:info(A),
    treatmentB:info(B),controlARepeat:info(A1),
    uncorrectedLillieSourceBRootSha256:
      '13ab25c071544c887a1226ebfea909798e73eb7c6f2b92a4c0',
    allRegisteredArms:r.phases.map(p=>({
      phase:p.phase,rows:p.execution.rawDevelopment.rows.map(x=>({
        id:id(x),rootSHA:rootSha(x),actionCount:x.actionCount??null,
        finished:x.finished??false,prizes:x.finalPrizes??null
      }))
    })),
    treatmentPublicRootLedger:treated,
    paperQualifiedGames:0,officialClockQualified:false,
    opponentCompetenceQualified:false};
  console.log('AGENT15_LILLIE_RANDOM_NIGHTWATCH_NATIVE',JSON.stringify({
    sampleCount:random.samples.length,
    sampledTurnIndices:random.samples.map(x=>({
      turn:x.turn,indices:x.sampledIndices,hand:x.physicalHandSize
    })),
    correctedPrizes:B.finalPrizes,correctedNativeFinished:B.finished,
    correctedRootCount:treated.length,
    sourceAttacks:treated.filter(x=>x.playerSlot===0&&
      x.action==='AttackAction').map(x=>({turn:x.turnBefore,attack:x.attack})),
    sourceSettlement:B.sourceAttackSettlement??null
  }));
  const dir=process.env.AGENT15_LILLIE_RANDOM_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const name='agent15-original-rank1-lillie-nightwatch-random-aba.json';
    const bytes=JSON.stringify(report,null,2)+'\n';
    writeAtomicLocked(path.join(dir,name),bytes);
    writeAtomicLocked(path.join(dir,name+'.sha256'),sha(bytes)+'  '+name+'\n');
  }
});
