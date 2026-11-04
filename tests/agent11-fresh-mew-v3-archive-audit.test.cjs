'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {test}=require('node:test');
const {audit}=require('../scripts/agent11-fresh-mew-v3-archive-audit.cjs');

test('fresh preregistered rank5/rank11 64-arm Store artifact matches independent payoff and abort audit',()=>{
  const root=path.resolve(__dirname,'..');
  const registration=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/registrations/agent11-owner-resource-tutor-bilateral-v3.json'),'utf8'));
  const result=JSON.parse(fs.readFileSync(path.join(root,
    'agent11-owner-tutor-native-v3.json'),'utf8'));
  const observed=audit(result,registration);
  assert.equal(observed.initialFullPhysicalPairsProven,32);
  assert.equal(observed.separatelyRecoveredAbortPair,1);
  assert.equal(observed.sourceMewCopiedAttackCounts.declared,35);
  assert.equal(observed.sourceMewCopiedAttackCounts.noDonorSettledWithoutBoardChange,10);
  assert.equal(observed.sourceRank11TerminalPeriod.declared,66);
  assert.equal(observed.sourceRank11TerminalPeriod.settled,64);
  assert.equal(observed.nativeQualifiedGames,0);
  process.stdout.write('AGENT11_FRESH_NATIVE_AUDIT '+JSON.stringify(observed)+'\n');
});
