'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {installApexPrizeWindowPolicy}=
  require('../simulation/twinleaf/apex-prize-headless-policy.cjs');
const {runMatch} = require('../simulation/twinleaf/headless.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {allPromptResolvers}=require(path.join(output,
  'simple-bot/simple-bot-definitions'));

test('coupled Apex policy installs and restores both prompt factories',()=>{
  const a=allPromptResolvers.findIndex(x=>x.name==='ChooseAttackPromptResolver');
  const b=allPromptResolvers.findIndex(x=>x.name==='PutDamagePromptResolver');
  assert.ok(a>=0&&b>=0);
  const originals=[allPromptResolvers[a],allPromptResolvers[b]];
  const restore=installApexPrizeWindowPolicy();
  try {
    assert.equal(allPromptResolvers[a].name,'SpreadAwareCopyResolver');
    assert.equal(allPromptResolvers[b].name,'PrizeWindowPutDamageResolver');
    assert.notStrictEqual(allPromptResolvers[a],originals[0]);
    assert.notStrictEqual(allPromptResolvers[b],originals[1]);
  } finally {
    restore();
  }
  assert.strictEqual(allPromptResolvers[a],originals[0]);
  assert.strictEqual(allPromptResolvers[b],originals[1]);
});

test('default-off Apex policy preserves an unrelated frozen headless match',()=>{
  const deck=[
    ...Array(4).fill('Shadow Rider Calyrex V CRE'),
    ...Array(56).fill('Psychic Energy MEE')
  ];
  const request={
    deckA:deck,deckB:deck,seed:1881,maxActions:5,
    isolatePolicyRandomness:true,label:'Apex-policy-no-Regidrago-control'
  };
  const before=allPromptResolvers.slice();
  const baseline=runMatch(request);
  assert.deepEqual(allPromptResolvers,before);
  assert.equal(Object.hasOwn(baseline,'apexSpreadPrizeWindowPolicy'),false);
  const fixed=runMatch({...request,apexSpreadPrizeWindowPolicy:true});
  assert.equal(fixed.apexSpreadPrizeWindowPolicy,true);
  assert.equal(fixed.policy,baseline.policy+'+ApexSpreadPrizeWindow-v1');
  assert.deepEqual(allPromptResolvers,before);
  const {apexSpreadPrizeWindowPolicy,policy,...actual}=fixed;
  const {policy:ignored,...expected}=baseline;
  assert.deepEqual(actual,expected,
    'Without a Regidrago copy prompt, this option must preserve the match');
  const repeated=runMatch(request);
  assert.deepEqual(repeated,baseline);
  assert.deepEqual(allPromptResolvers,before);
});
