'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {VERSION,TARGET,describeTrial} =
  require('../simulation/evaluation/agent25-crushing-before-plumeria-native.cjs');

test('the retrospective native target is immutable and scoped to rank6 T3',()=>{
  assert.match(VERSION,/source-t3-crushing-before-plumeria/);
  assert.equal(TARGET,'6:3:B:champion-reference');
});

test('genuine source T3 roots and next opponent actions remain distinguished',()=>{
  const a=describeTrial({rows:[{
    trial:{id:TARGET},sourceSeat:0,actualStarterSeat:0,
    sourceDealFingerprint:'source',fullPhysicalDealFingerprint:'full',
    finished:false,status:'action-limit',winner:null,
    rootActionLedger:[
      {playerSlot:1,turnBefore:2,pendingPrompt:null,
        actionOrdinal:4,action:'PlayCardAction',card:'Fog Crystal'},
      {playerSlot:0,turnBefore:3,pendingPrompt:null,
        actionOrdinal:29,action:'PlayCardAction',card:'Plumeria'},
      {playerSlot:0,turnBefore:3,pendingPrompt:'ChooseCardsPrompt',
        actionOrdinal:30,action:'ResolvePromptAction'},
      {playerSlot:1,turnBefore:4,pendingPrompt:null,
        actionOrdinal:35,action:'PassTurnAction'}
    ],
    actorOnlyDecisionCoverage:{ownerPlumeriaAfterPassAudit:{
      acceptedPlumeria:1}}
  }]});
  assert.equal(a.length,1);
  assert.deepEqual(a[0].sourceT3,[{
    ordinal:29,kind:'PlayCardAction',card:'Plumeria',attack:null
  }]);
  assert.deepEqual(a[0].opponentContinuation,[{
    ordinal:35,turn:4,kind:'PassTurnAction',card:null,attack:null
  }]);
  assert.equal(a[0].qualified,false);
  assert.equal(a[0].plumeriaAccepted,1);
  assert.equal(a[0].hammerAccepted,null);
});

test('missing native root cannot manufacture a settled Hammer claim',()=>{
  const rows=describeTrial({rows:[{
    trial:{id:TARGET},sourceSeat:0,
    rootActionLedger:[],sourceDealFingerprint:null,
    status:'engine-error',finished:false,
    actorOnlyDecisionCoverage:null
  }]});
  assert.deepEqual(rows[0].sourceT3,[]);
  assert.deepEqual(rows[0].opponentContinuation,[]);
  assert.equal(rows[0].hammerAccepted,null);
  assert.equal(rows[0].plumeriaAccepted,null);
  assert.equal(rows[0].qualified,false);
});
