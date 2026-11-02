'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  nativeDevelopmentDisposition,sourceWitness,physicalPairStatus
}=require('../simulation/evaluation/agent13-v31-rank5-corrected-root-release.cjs');

const nativeTerminal={finished:true,endReason:'engine-game-end',
  actionCount:197,winner:1};
const nativeCap={finished:false,endReason:'action-limit',
  actionCount:260,winner:null};

test('published v3.1 terminal/cap distinction survives summary projection',()=>{
  assert.equal(nativeDevelopmentDisposition(nativeTerminal),
    'ENGINE_TERMINAL_UNQUALIFIED');
  assert.equal(nativeDevelopmentDisposition(nativeCap),'CENSORED');
  assert.equal(sourceWitness({...nativeTerminal,
    trial:{candidateSlot:'A'}}).status,'ENGINE_TERMINAL_UNQUALIFIED');
  assert.equal(sourceWitness({...nativeCap,
    trial:{candidateSlot:'B'}}).status,'CENSORED');
});

test('native Store and physical validity aborts remain errors, not censors',()=>{
  for(const row of [
    {status:'engine-physical-invalid',error:'missing zone'},
    {status:'native-Store-error'},
    {error:'prompt dispatch failure',finished:false,endReason:'action-limit'},
    {status:'actor-bot-abort',finished:true,endReason:'engine-game-end'}
  ]) {
    assert.equal(nativeDevelopmentDisposition(row),'NATIVE_ERROR');
  }
  const evidence=sourceWitness({
    trial:{candidateSlot:'B'},status:'engine-physical-invalid',
    error:'native zero payment',actionCount:83
  });
  assert.equal(evidence.status,'NATIVE_ERROR');
  assert.equal(evidence.nativeRawStatus,'engine-physical-invalid');
  assert.equal(evidence.nativeError,'native zero payment');
  assert.equal(evidence.nativeActionCount,83);
  assert.equal(evidence.competitiveGameQualified,false);
});

test('unrecognized outcomes remain unverified instead of fabricated wins',()=>{
  for(const row of [
    {finished:true,endReason:'sudden-death'},
    {finished:false,endReason:'unexpected-stop'},
    {finished:false},
    {}
  ]) {
    assert.equal(nativeDevelopmentDisposition(row),'UNVERIFIED');
  }
});

test('winner, source seat and source deal are retained but never certified',()=>{
  const evidence=sourceWitness({
    ...nativeTerminal,trial:{candidateSlot:'A'},sourceDealFingerprint:'deal-a',
    fullPhysicalDealFingerprint:'full-a',
    rootActionLedger:[
      {playerSlot:1,action:'PlayCardAction',card:'Mew VMAX FST',
        actionOrdinal:20,turnBefore:10},
      {playerSlot:0,action:'PlayCardAction',card:'Mew VMAX FST',
        actionOrdinal:21,turnBefore:11}
    ],
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      chooseAttack:{selections:[
        {seat:1,printing:'Genesect V FST',attack:'Techno Blast',
          turn:12,sourceIndex:1,attackIndex:0},
        {seat:0,printing:'Genesect V FST',attack:'Techno Blast',
          turn:13,sourceIndex:0,attackIndex:0}
      ]}
    }}
  });
  assert.equal(evidence.status,'ENGINE_TERMINAL_UNQUALIFIED');
  assert.equal(evidence.nativeWinnerUnqualified,1);
  assert.equal(evidence.sourceSeat,1);
  assert.equal(evidence.actualSourceDealFingerprint,'deal-a');
  assert.equal(evidence.fullPhysicalDealFingerprint,'full-a');
  assert.equal(evidence.sourceMewVMAXPlayRoots.length,1);
  assert.equal(evidence.ownerSourceGenesectCopiedSelections.length,1);
  assert.equal(evidence.paperActionQualified,false);
  assert.equal(evidence.competitiveGameQualified,false);
});

test('independent source-deal fingerprint is mandatory for same-deal label',()=>{
  assert.equal(physicalPairStatus(
    {sourceDealFingerprint:'same'},{sourceDealFingerprint:'same'}),
  'EXACT_SOURCE_DEAL_MATCH');
  assert.equal(physicalPairStatus(
    {sourceDealFingerprint:'one'},{sourceDealFingerprint:'two'}),
  'SOURCE_DEAL_DIFFERENT');
  assert.equal(physicalPairStatus(
    {sourceDealFingerprint:'one'},{}),'UNVERIFIED');
});

test('native status correction matches archived reported 2/6 and 4/4 counts',()=>{
  const counts=rows=>rows.reduce((acc,row)=>{
    const status=nativeDevelopmentDisposition(row);
    acc[status]=(acc[status]??0)+1;
    return acc;
  },{});
  const frozen=Array.from({length:8},(_,i)=>
    i<2?{...nativeTerminal}:{...nativeCap});
  const integrated=Array.from({length:8},(_,i)=>
    i<4?{...nativeTerminal}:{...nativeCap});
  assert.deepEqual(counts(frozen),{
    ENGINE_TERMINAL_UNQUALIFIED:2,CENSORED:6
  });
  assert.deepEqual(counts(integrated),{
    ENGINE_TERMINAL_UNQUALIFIED:4,CENSORED:4
  });
});
