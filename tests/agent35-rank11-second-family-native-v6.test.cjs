'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {VERSION,sourceSecondFamily,checkOriginalPrefix,run,write} =
  require('../simulation/evaluation/agent35-rank11-second-family-native-v6.cjs');

const ID='11:102:A:champion-reference';
const root=(i,turn,player,action,extra={})=>({
  actionOrdinal:i,turnBefore:turn,playerSlot:player,action,...extra
});
const prefix=[
  root(17,2,1,'AttackAction',
    {attack:'Call for Family',pendingPrompt:null}),
  root(18,2,1,'ResolvePromptAction',
    {pendingPrompt:'ChooseCardsPrompt'}),
  root(19,2,1,'ResolvePromptAction',
    {pendingPrompt:'ShuffleDeckPrompt'}),
  root(20,2,1,'ResolvePromptAction',
    {pendingPrompt:'WaitPrompt'}),
  root(21,2,1,'ResolvePromptAction',
    {pendingPrompt:'WaitPrompt'}),
  root(22,2,1,'ResolvePromptAction',
    {pendingPrompt:'WaitPrompt'}),
  root(23,3,0,'ResolvePromptAction',
    {pendingPrompt:'WaitPrompt'}),
  root(24,3,0,'PlayCardAction',
    {card:'Psychic Energy',pendingPrompt:null}),
  root(25,3,0,'PassTurnAction',
    {pendingPrompt:null}),
  root(26,3,0,'ResolvePromptAction',
    {pendingPrompt:'WaitPrompt'}),
  root(27,4,1,'ResolvePromptAction',
    {pendingPrompt:'WaitPrompt'}),
  root(28,4,1,'PlayCardAction',
    {card:'Darkness Energy',pendingPrompt:null}),
  root(29,4,1,'AttackAction',
    {attack:'Call for Family',pendingPrompt:null})
];

function nativeReport(addition=[]) {
  return {
    sourceOriginalId: ID,
    exactOriginalDeal:true,
    originalNativeAttackRoot17AndPhysicalBasicBench:true,
    sourceAttackRoot:prefix[0],
    postAttackAcceptedPublicRoots:[...prefix.slice(1),...addition],
    nativeAbort:{failureStage:'bot-decoder',actionOrdinal:41},
    selectedNativeStatus:'engine-error',
    failureInclusiveEight:Array.from({length:8},
      (_,i)=>({id:i,status:i===4?'engine-error':null}))
  };
}

function audit() {
  return {
    sourceTurnWindow:{start:2,end:4},
    sourceAttackTurns:[2,4],
    physicalBasicMovesByTurn:[
      {turn:2,card:'Trubbish FST'},
      {turn:4,card:'Mega Absol ex MEG'}
    ],
    ownerBasicPromptAnswersNativeAccepted:2,
    oneOriginalBasicMovedToBench:2,
    physicalBenchTransferFailures:0,
    opponentHiddenZoneInspected:false
  };
}

test('original source-to-second-attack roots17 through29 exactly match archived v5 SHA',()=>{
  const r=checkOriginalPrefix(nativeReport());
  assert.equal(r.roots,13);
  assert.equal(r.sha256,
    'ecb279a402f9dd6e89493509a174255912f28339be719d1d1017326d561c8ee5');
  const mutated=nativeReport();
  mutated.postAttackAcceptedPublicRoots[6]={
    ...mutated.postAttackAcceptedPublicRoots[6],
    card:'Other Energy'
  };
  assert.throws(()=>checkOriginalPrefix(mutated),
    /public root trajectory changed/);
});

test('all-turn source Family wrapper explicitly sets source turn4 only',()=>{
  let seen=null;
  const wrapper=(next,opts)=>{
    seen=opts;
    return {result:next(),audit:audit()};
  };
  const actual=sourceSecondFamily(()=>42,
    {registration:{selectedOriginalId:ID}},wrapper);
  assert.equal(seen.sourceEndTurn,4);
  assert.equal(actual.result,42);
  assert.equal(actual.audit.oneOriginalBasicMovedToBench,2);
  assert.throws(()=>sourceSecondFamily(()=>0,
    {registration:{selectedOriginalId:'wrong'}},wrapper), /Expected values/);
});

test('valid two-source-turn physical transfers and opponent reply stay developmental',()=>{
  const after=[
    root(30,4,1,'ResolvePromptAction',
      {pendingPrompt:'ChooseCardsPrompt'}),
    root(31,4,1,'ResolvePromptAction',
      {pendingPrompt:'ShuffleDeckPrompt'}),
    root(32,5,0,'PlayCardAction',
      {card:'Psychic Energy',pendingPrompt:null})
  ];
  let exactWrapper=null;
  const value=run({
    postattack:({runV4})=>{
      runV4({observe:()=>null});
      return nativeReport(after);
    },
    firstFamily:({family})=>{
      const wrapped=family(()=>11,{registration:{selectedOriginalId:ID}});
      return wrapped.result;
    },
    family:(next,options)=>{
      exactWrapper=options.sourceEndTurn;
      return {result:next(),audit:audit()};
    }
  });
  assert.equal(exactWrapper,4);
  assert.equal(value.twoSourceFamilyPhysicalBenchSettlements,true);
  assert.equal(value.sourceSecondTurnBasicMovedToBench,true);
  assert.equal(value.sourceSecondAttackCompletedToOpponentNextTurn,true);
  assert.equal(value.opponentAfterSecondFamilyVoluntaryRoots.length,1);
  assert.equal(value.opponentStrategicResponseIndependentlyQualified,false);
  assert.equal(value.competitivelyQualifiedGames,0);
  assert.equal(value.fieldWinRate,null);
});

test('missing second physical Bench transfer never reports a successful second payoff',()=>{
  const value=run({
    postattack:({runV4})=>{
      runV4({observe:()=>null});
      return nativeReport();
    },
    firstFamily:({family})=>
      family(()=>0,{registration:{selectedOriginalId:ID}}).result,
    family:(next)=>({result:next(),
      audit:{...audit(),
        physicalBasicMovesByTurn:[{turn:2,card:'Trubbish FST'}],
        oneOriginalBasicMovedToBench:1,
        ownerBasicPromptAnswersNativeAccepted:1}})
  });
  assert.equal(value.twoSourceFamilyPhysicalBenchSettlements,false);
  assert.equal(value.sourceSecondTurnBasicMovedToBench,false);
  assert.equal(value.competitivelyQualifiedGames,0);
});

test('locked atomic v6 output is complete or refused',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent35-second-family-'));
  const file=path.join(dir,'receipt.json');
  try{
    const record={schema:VERSION,sourceOriginalId:ID,
      fieldWinRate:null,competitivelyQualifiedGames:0};
    const saved=write(file,record);
    assert.ok(saved.bytes>0);
    assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')),record);
    const fd=fs.openSync(file+'.lock','wx');
    try{assert.throws(()=>write(file,record),/EEXIST/);}
    finally{fs.closeSync(fd);fs.unlinkSync(file+'.lock');}
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});


test('strictly classified native archive loss preserves only proven physical moves',()=>{
  const err=new Error('The expression evaluated to a falsy value: assert.ok(Array.isArray(rawRoots))');
  err.code='ERR_ASSERTION';
  err.agent49FamilyOwnerPromptAudit={
    ...audit(),selectedSourceId:ID,
    nativeSourceAttackAccepted:2,genuineOwnerBasicDeckPrompts:2
  };
  const r=run({postattack:()=>{throw err;}});
  assert.equal(r.nativeDisposition,'CENSORED-postgame-root-archive-unavailable');
  assert.equal(r.secondTurnSourceOwnerBasicPhysicalBenchSettled,true);
  assert.equal(r.actualOriginalPhysicalOpeningRevalidatedInThisArm,false);
  assert.equal(r.nativeRootArchiveAvailable,false);
  assert.equal(r.registeredUntreatedPriorActionPrefix,null);
  assert.equal(r.originalEight,null);
  assert.equal(r.opponentAfterSecondFamilyVoluntaryRoots,null);
  assert.equal(r.competitivelyQualifiedGames,0);
});
test('a missing native root ledger cannot excuse unproven physical transfers',()=>{
  const err=new Error('assert.ok(Array.isArray(rawRoots))');
  err.code='ERR_ASSERTION';
  err.agent49FamilyOwnerPromptAudit={
    ...audit(),selectedSourceId:ID,
    nativeSourceAttackAccepted:2,genuineOwnerBasicDeckPrompts:2,
    physicalBenchTransferFailures:1
  };
  assert.throws(()=>run({postattack:()=>{throw err;}}), /Array.isArray/);
});
