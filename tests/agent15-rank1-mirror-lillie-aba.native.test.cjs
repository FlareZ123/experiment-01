'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {TARGET,VERSION,REGISTRATION,runOriginalRank1HeldLillieABA}=
  require('../simulation/twinleaf/agent15-rank1-mirror-lillie-aba.cjs');
const BASE_SHA='3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a';

const rowId=row=>row.trial?.id??row.id;
const publicRoots=row=>row.rootActionLedger??
  row.nativeAbortEvidence?.rootActionLedger??[];
const outcome=row=>({id:rowId(row),status:row.status??null,
  acceptedRoots:publicRoots(row).length,
  nativeFinished:row.finished??false,
  nativeWinner:row.finished?row.winner:null,
  nativePrizes:row.finalPrizes??null,
  rootSha256:row.rootActionLedgerSha256??
    (publicRoots(row).length?createHash('sha256')
      .update(JSON.stringify(publicRoots(row))).digest('hex'):null),
  sourceDealFingerprint:row.sourceDealFingerprint??null,
  fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
  sourceResolvedDeck:row.sourceDeckFingerprint??null,
  candidateResolvedDeck:row.candidateDeckFingerprint??null});

test('original frozen mirror source owner Lillie turn20: actual native Store A/B/A',()=>{
  const r=runOriginalRank1HeldLillieABA();
  assert.equal(r.schema,VERSION);
  assert.equal(r.registration,REGISTRATION);
  assert.deepEqual(r.phases.map(x=>x.phase),['A','B','A-repeat']);
  const phases=r.phases.map(p=>{
    const rows=p.execution.rawDevelopment?.rows??[];
    assert.equal(rows.length,8);
    const byId=new Map(rows.map(row=>[rowId(row),row]));
    assert.equal(byId.size,8);
    assert.ok(byId.has(TARGET));
    return {phase:p.phase,rows,byId,audit:p.audit};
  });
  const A=phases[0],B=phases[1],A1=phases[2];
  const base=A.byId.get(TARGET),treatment=B.byId.get(TARGET);
  const repeat=A1.byId.get(TARGET);
  assert.equal(base.rootActionLedgerSha256,BASE_SHA);
  assert.equal(repeat.rootActionLedgerSha256,BASE_SHA);
  assert.equal(base.finished,true);
  assert.equal(base.actionCount,110);
  assert.deepEqual(base.finalPrizes,[6,0]);
  assert.equal(base.sourceDeckFingerprint,base.candidateDeckFingerprint);
  assert.equal(B.audit?.actualTypedProposals,1,
    'source held Lillie and had unused Supporter quota in real Store');
  const original=publicRoots(base);
  const fork=original.findIndex(event=>event.action==='PassTurnAction'&&
    event.playerSlot===0&&event.turnBefore===20);
  assert.ok(fork>0,'source turn20 must have original Pass');
  const bRoots=publicRoots(treatment);
  assert.ok(bRoots.length>fork,'treatment must reach original turn20 root');
  assert.deepEqual(bRoots.slice(0,fork),original.slice(0,fork),
    'same authentic source/public accepted action prefix before Lillie fork');
  const forkRoot=bRoots[fork];
  assert.equal(forkRoot.turnBefore,20);
  assert.equal(forkRoot.playerSlot,0);
  assert.equal(forkRoot.action,'PlayCardAction',
    'real Store must accept a replacement Lillie action');
  assert.match(String(forkRoot.card),/Lillie/i);
  for(const row of A.rows){
    const id=rowId(row);
    const x=outcome(row),y=outcome(B.byId.get(id)),z=outcome(A1.byId.get(id));
    assert.deepEqual(x.sourceDealFingerprint,z.sourceDealFingerprint);
    assert.deepEqual(x.fullPhysicalDealFingerprint,z.fullPhysicalDealFingerprint);
    assert.deepEqual(x.fullPhysicalDealFingerprint,y.fullPhysicalDealFingerprint,
      'same seed alone insufficient: require physical full-deal identity');
    assert.equal(x.rootSha256,z.rootSha256,
      'both controls must be exactly identical complete/abort-preserved roots');
    if(id!==TARGET)assert.equal(x.rootSha256,y.rootSha256,
      'no other registered context may be modified by B');
  }
  const report={
    schema:VERSION,registration:REGISTRATION,
    originalTrial:TARGET,
    sourceRank:1,sourceSeat:0,sourceOpponentSamePrintedSixty:true,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    baselineOriginalRootSha256:BASE_SHA,
    sourceTurn20OriginalPassOrdinal:fork,
    matchedPrefixBeforeFork:true,
    nativeAcceptedTurn20LillieRoot:forkRoot,
    decisionAudit:B.audit,
    controlsIdenticalForAllEight:true,
    allRegisteredPhysicalDealsMatched:true,
    outcomesByPhase:phases.map(p=>({phase:p.phase,
      attempts:p.rows.map(outcome)})),
    exactTargetPublicRootsByPhase:phases.map(p=>({
      phase:p.phase,
      roots:publicRoots(p.byId.get(TARGET))
    })),
    noCompetitiveGameQualified:true,
    paperClockUnqualified:true,adversarialOpponentPolicyUnqualified:true
  };
  console.log('AGENT15_RANK1_LILLIE_ABA_NATIVE',JSON.stringify({
    fork,printedSelected:forkRoot.card,
    treatmentStatus:outcome(treatment).status,
    treatmentRoots:outcome(treatment).acceptedRoots,
    treatmentPrizes:outcome(treatment).nativePrizes,
    treatmentFinished:outcome(treatment).nativeFinished,
    nativeBotProposals:B.audit.actualTypedProposals,
    allPhysicalMatched:true,allControlsIdentical:true
  }));
  const dir=process.env.AGENT15_RANK1_LILLIE_ABA_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const filename='agent15-rank1-mirror-lillie-native-aba.json';
    const bytes=JSON.stringify(report,null,2)+'\n';
    const dest=path.join(dir,filename);
    writeAtomicLocked(dest,bytes);
    writeAtomicLocked(dest+'.sha256',createHash('sha256')
      .update(bytes).digest('hex')+'  '+filename+'\n');
  }
});
