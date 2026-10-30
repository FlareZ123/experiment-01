'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {choose,directFirstEight,main}=
  require('../scripts/agent24-ace-nullifier-opening-frontier.cjs');

test('BigInt combinations retain complete 60-card physical sample space',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(60,-1),0n);
  assert.equal(choose(60,61),0n);
  assert.equal(choose(60,0),1n);
});

test('all four one-to-four-copy access chances agree with independent exact enumeration',()=>{
  const table=[
    {g:1,s:['10135117','66788480'],z:['44967809','734673280']},
    {g:2,s:['4760927','16697120'],z:['85052887','734673280']},
    {g:3,s:['5370531','13357696'],z:['362083123','2204019840']},
    {g:4,s:['306161','607168'],z:['152299223','734673280']}
  ];
  for(const x of table){
    const spirit=directFirstEight({lockCopies:x.g,totalBasics:14});
    const genesect=directFirstEight({lockCopies:x.g,totalBasics:14,
      toolCopies:4,requiresTool:true});
    assert.deepEqual(Object.values(spirit.exactProbability),x.s);
    assert.deepEqual(Object.values(genesect.exactProbability),x.z);
    assert.ok(spirit.conditionedDirectOpportunity>
      genesect.conditionedDirectOpportunity);
    assert.ok(spirit.conditionedDirectOpportunity<=1);
    assert.ok(genesect.conditionedDirectOpportunity<=1);
  }
});

test('ordinary setup before opponent first turn favors Tool-free Spiritomb',()=>{
  const expected=[
    ['682689','5040640'],
    ['80997','315040'],
    ['922887','2520320'],
    ['5313','11456']
  ];
  for(let i=0;i<4;i++){
    const g=i+1;
    const s=directFirstEight({lockCopies:g,totalBasics:14});
    const t=directFirstEight({lockCopies:g,totalBasics:14,
      toolCopies:4,requiresTool:true});
    assert.deepEqual(Object.values(s.exactSetupBasicProbability),
      expected[i]);
    assert.deepEqual(t.exactSetupBasicProbability,
      s.exactSetupBasicProbability);
    assert.equal(s.conditionedSetupLockReadyChance,
      s.conditionedSetupBasicChance);
    assert.equal(t.conditionedSetupLockReadyChance,0);
  }
});

test('no lock copies or missing Tool cannot satisfy the respective event',()=>{
  assert.equal(directFirstEight({
    lockCopies:0,totalBasics:14}).conditionedDirectOpportunity,0);
  assert.equal(directFirstEight({
    lockCopies:1,totalBasics:14,requiresTool:true,toolCopies:0})
      .conditionedDirectOpportunity,0);
  assert.throws(()=>directFirstEight({
    lockCopies:1,totalBasics:14,requiresTool:true,toolCopies:60}));
});

test('guard impossible deck recipes and report hypothetical nature',()=>{
  assert.throws(()=>directFirstEight({
    lockCopies:15,totalBasics:14}));
  assert.throws(()=>directFirstEight({
    lockCopies:1,totalBasics:14,toolCopies:50}));
  const report=main();
  assert.equal(report.scenarios.length,4);
  assert.equal(report.competitiveQualifiedGames,0);
  assert.match(report.caveat,/Hypothetical/);
});
