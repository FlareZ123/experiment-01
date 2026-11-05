'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createHash}=require('node:crypto');
const {auditActualSetupRow,auditActualMirroredV6Setup}=
  require('../simulation/evaluation/agent48-v6-public-mulligan-census.cjs');

const A='a'.repeat(64),B='b'.repeat(64),C='c'.repeat(64);
const VENDOR='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const names=['champion-reference','new-moon-lockbreaker-v1'];
const ids=[
  [6,100,'A'],[6,101,'B'],[11,102,'A'],[11,103,'B']
];
const trials=ids.flatMap(([rank,repeat,candidateSlot])=>
  names.map(candidateId=>({
    rank,repeat,candidateSlot,candidateId,seed:repeat,
    id:[rank,repeat,candidateSlot,candidateId].join(':')
  })));
const stamp=actions=>createHash('sha256')
  .update(JSON.stringify(actions)).digest('hex');
const root=(i,seat,prompt)=>({
  actionOrdinal:i,turnBefore:0,turnAfter:0,playerSlot:seat,
  action:'ResolvePromptAction',pendingPrompt:prompt
});
const early=(candidateSeat,sourceMulligans,candidateMulligans,bonusSeat=null)=>{
  const sourceSeat=1-candidateSeat;
  const p=[
    root(0,0,'CoinFlipPrompt'),root(1,0,'ConfirmPrompt')
  ];
  for(let index=0;index<=Math.max(sourceMulligans,candidateMulligans);index++){
    if(index<=sourceMulligans)p.push(root(p.length,sourceSeat,'ShuffleDeckPrompt'));
    if(index<=candidateMulligans)p.push(root(p.length,candidateSeat,'ShuffleDeckPrompt'));
  }
  p.push(root(p.length,sourceSeat,'ChooseCardsPrompt'));
  p.push(root(p.length,candidateSeat,'ChooseCardsPrompt'));
  if(bonusSeat!==null)p.push(root(p.length,bonusSeat,'SelectPrompt'));
  return p;
};
const row=(t,options={})=>{
  const actions=options.actions??early(t.candidateSlot==='A'?0:1,0,0);
  const sourceSeat=t.candidateSlot==='A'?1:0;
  return {
    id:t.id,status:options.status??'returned-unqualified',
    originalSourceSeat:options.aborted?null:sourceSeat,
    nativeAbortProvenance:options.aborted?{
      sourceSeat,sourceDealStatus:'VERIFIED'
    }:null,
    publicRootActions:actions,
    publicRootActionsTruncated:false,
    nativeRootActionCount:actions.length,
    publicRootLedgerSha256Computed:stamp(actions),
    publicRootLedgerDigestConsistent:true,
    sourceDealFingerprint:options.source??A,
    fullPhysicalDealFingerprint:options.full??B,
    verifiedFirstTurn:true,actualStarterSeat:options.starter??0
  };
};
const manifest=()=>({
  schema:'agent1-issue25-mirrored-original-source-r6-r11-v1',
  trialCount:8,trials
});
const archive=rows=>({
  registration:{
    registeredReconciliation:{exactUniqueMatch:true},
    rawRowReconciliation:{exactlyReconciled:true}
  },
  provenance:{githubRunId:'test',githubCommit:'test',
    observedTwinleafCommit:VENDOR},
  attempts:rows
});

test('actual first-setup ShuffleDeck prompts infer mulligans by seat',()=>{
  const t=trials[2],actions=early(1,1,2,0);
  const result=auditActualSetupRow(row(t,{actions}),t);
  assert.deepEqual(result.inferredMulliganCounts,[1,2]);
  assert.deepEqual(result.mechanicallyOfferedBonusCounts,[1,0]);
  assert.deepEqual(result.observedBareSelectPromptSeats,[0]);
  assert.equal(result.bonusChoiceAndPhysicalDrawVerified,false);
});

test('first setup bonus SelectPrompt does not claim actual bonus draw',()=>{
  const t=trials[0],actions=early(0,3,0,0);
  const result=auditActualSetupRow(row(t,{actions}),t);
  assert.deepEqual(result.inferredMulliganCounts,[0,3]);
  assert.deepEqual(result.mechanicallyOfferedBonusCounts,[3,0]);
  assert.equal(result.bonusChoiceAndPhysicalDrawVerified,false);
});

test('all eight registered attempts remain in natural sample despite one source mismatch',()=>{
  const rows=trials.map(t=>row(t));
  rows[3].sourceDealFingerprint=C;
  rows[3].fullPhysicalDealFingerprint=C;
  rows[4].status='engine-error';
  rows[4].originalSourceSeat=null;
  rows[4].nativeAbortProvenance={
    sourceSeat:1,sourceDealStatus:'VERIFIED'
  };
  const census=auditActualMirroredV6Setup(manifest(),archive(rows));
  assert.equal(census.primaryNaturalGamePopulationRetained,8);
  assert.equal(census.actualOriginalSourceDealMismatches,1);
  assert.equal(census.comparisonGroups.length,4);
  assert.equal(census.comparisonGroups[1].sourceDealParity,'MISMATCHED');
  assert.equal(census.attempted.filter(x=>x.nativeStatus==='engine-error').length,1);
  assert.equal(census.competitivelyQualifiedGames,0);
});

test('public tape spoof with unchanged SHA fails',()=>{
  const t=trials[0],r=row(t);
  r.publicRootActions[2].pendingPrompt='AnotherPrompt';
  assert.throws(()=>auditActualSetupRow(r,t),/hash mismatch/);
});

test('truncated public tape fails without silently guessing mulligan rate',()=>{
  const t=trials[0],r=row(t);
  r.publicRootActionsTruncated=true;
  assert.throws(()=>auditActualSetupRow(r,t),/truncated/);
});

test('original Store versus archive digest disagreement fails',()=>{
  const t=trials[0],r=row(t);
  r.publicRootLedgerDigestConsistent=false;
  assert.throws(()=>auditActualSetupRow(r,t),/disagree/);
});

test('unverified abort provenance never establishes source physical seat',()=>{
  const t=trials[4],r=row(t,{aborted:true});
  r.nativeAbortProvenance.sourceDealStatus='UNKNOWN';
  assert.equal(auditActualSetupRow(r,t).sourceSeat,null);
});

test('verified abort-side source physical seat can be recovered without game win',()=>{
  const t=trials[4],r=row(t,{aborted:true,status:'engine-error'});
  const s=auditActualSetupRow(r,t);
  assert.equal(s.sourceSeat,1);
  assert.equal(s.gameQualified,false);
});

test('missing source digest fails the custody gate',()=>{
  const t=trials[0],r=row(t);
  r.sourceDealFingerprint=null;
  assert.throws(()=>auditActualSetupRow(r,t),/source first-stable/);
});

test('missing initial shuffle cannot be interpreted as zero mulligans',()=>{
  const t=trials[0],r=row(t,{actions:[root(0,0,'ShuffleDeckPrompt')]});
  assert.throws(()=>auditActualSetupRow(r,t),/Missing initial player shuffle/);
});

test('frozen missing or unregistered attempt rejects entire census',()=>{
  const rows=trials.map(t=>row(t));
  assert.throws(()=>auditActualMirroredV6Setup(manifest(),archive(rows.slice(1))),
    /Expected values to be strictly equal|length|size/);
  const other=rows.slice();other[0]={...other[0],id:'unregistered'};
  assert.throws(()=>auditActualMirroredV6Setup(manifest(),archive(other)),
    /Unregistered native result/);
});

test('wrong actual vendor revision fails',()=>{
  const rows=trials.map(t=>row(t));
  const packet=archive(rows);
  packet.provenance.observedTwinleafCommit='f'.repeat(40);
  assert.throws(()=>auditActualMirroredV6Setup(manifest(),packet),
    /Expected values to be strictly equal|equal/);
});

test('changed candidate label in the manifest fails pair recognition',()=>{
  const rows=trials.map(t=>row(t));
  const fake=manifest();
  fake.trials=[...trials];
  fake.trials[0]={...trials[0],candidateId:'unknown'};
  assert.throws(()=>auditActualMirroredV6Setup(fake,archive(rows)),
    /Expected values|equal/);
});
