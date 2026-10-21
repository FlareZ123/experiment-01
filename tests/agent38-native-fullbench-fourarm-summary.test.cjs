'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {summarizePublicFullBenchReplay,VERSION}=
  require('../simulation/evaluation/agent38-native-fullbench-fourarm-summary.cjs');

test('prefix hashes exclude later roots; public focal digest is reproducible',()=>{
  const ledger=[
    {actionOrdinal:244,turnBefore:48,playerSlot:0,action:'PlayCardAction',card:'N'},
    {actionOrdinal:245,turnBefore:48,playerSlot:0,action:'ResolvePromptAction'},
    {actionOrdinal:246,turnBefore:48,playerSlot:0,action:'AttackAction',attack:'Call for Family'},
    {actionOrdinal:247,turnBefore:49,playerSlot:1,action:'PassTurnAction'}
  ];
  const root={enginePin:'a9905a76',paperFullBenchCallForFamilyOptIn:true,
    attempted:1,errors:0,rows:[{trial:{id:'rank11:champion',rank:11,
      candidateId:'champion-reference'},rootActionLedger:ledger,
      sourceDealFingerprint:'source-digest',finished:false,
      paperFullBenchCallForFamilyAudit:{skippedSearches:1},
      finalPrizes:[6,3],privateDeck:['must','not','leak']}]};
  const out=summarizePublicFullBenchReplay(root);
  assert.equal(out.version,VERSION);
  assert.equal(out.rows[0].skippedSearches,1);
  assert.equal(out.rows[0].roots244to249.length,4);
  assert.equal(out.rows[0].roots244to249[2].attack,'Call for Family');
  assert.equal(out.rows[0].roots244to249[3].turn,49);
  assert.equal(out.rows[0].competitiveQualified,false);
  assert.equal(JSON.stringify(out).includes('must'),false);
  const second=structuredClone(root);
  second.rows[0].rootActionLedger[3].action='AttackAction';
  const after=summarizePublicFullBenchReplay(second);
  assert.equal(out.rows[0].through245Sha256,after.rows[0].through245Sha256);
  assert.equal(out.rows[0].through246Sha256,after.rows[0].through246Sha256);
});

test('aborted attempt with no root archive stays censored',()=>{
  const out=summarizePublicFullBenchReplay({enginePin:'a',attempted:1,errors:1,
    paperFullBenchCallForFamilyOptIn:false,rows:[{
      trial:{id:'x',rank:11,candidateId:'champion-reference'},
      status:'engine-error',error:'Error: game broke\nprivate stack',
      privateHand:['hidden']} ]});
  assert.equal(out.rows[0].status,'engine-error');
  assert.equal(out.rows[0].rootActionCount,0);
  assert.equal(out.rows[0].through245Sha256,null);
  assert.equal(out.rows[0].errorHead,'Error: game broke | private stack');
  assert.equal(out.rows[0].competitiveQualified,false);
});
