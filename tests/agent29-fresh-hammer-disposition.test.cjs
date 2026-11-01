'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {classifyGameDisposition,censusGameDispositions}=
  require('../simulation/evaluation/agent29-fresh-hammer-disposition.cjs');
const MAX=260;
// Physical outcome projections of original GitHub artifact 12943618821;
// ZIP SHA256 48227ba48f48deb42f5a90af74ccef6a830f986e2c75a6a98b78857fa235aa3a.
const pairs=[
  [68,70,true,true],[106,110,true,true],[260,260,false,false],
  [260,260,false,false],[26,26,true,true],[260,260,false,false],
  [260,260,false,false],[251,250,true,true]
];
test('transport settlement does not mean engine terminal',()=>{
  assert.equal(classifyGameDisposition({status:'settled',finished:false,actionCount:260},MAX),'action-cap');
  assert.equal(classifyGameDisposition({finished:false,actionCount:259},MAX),'unresolved');
  assert.equal(classifyGameDisposition({finished:true,actionCount:260},MAX),'engine-terminal');
});
test('eight frozen pairs count all eight censored physical attempts',()=>{
  const rows=pairs.flatMap(([a,b,x,y])=>[
    {status:'settled',finished:x,actionCount:a},
    {status:'settled',finished:y,actionCount:b}
  ]);
  assert.deepEqual(censusGameDispositions(rows,MAX),{
    attemptedGames:16,engineTerminalCases:8,actionCapCases:8,
    unresolvedCases:0,nativeFailureCases:0,nativeAbortOrCapCases:8,
    allAttemptsAccountedFor:true
  });
});
test('errors, caps, and short unfinished games remain distinct',()=>{
  const rows=[
    {status:'engine-error',actionCount:21,finished:false},
    {status:'paper-supporter-quota-veto',actionCount:12,finished:false},
    {status:'settled',actionCount:260,finished:false},
    {status:'settled',actionCount:12,finished:false},
    {status:'settled',actionCount:15,finished:true}
  ];
  assert.deepEqual(censusGameDispositions(rows,MAX),{
    attemptedGames:5,engineTerminalCases:1,actionCapCases:1,
    unresolvedCases:1,nativeFailureCases:2,nativeAbortOrCapCases:4,
    allAttemptsAccountedFor:true
  });
});
