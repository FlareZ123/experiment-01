'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const registry=require('../results/aichi-2026/registrations/agent18-original-source-fork-overlap-registry-v1.json');
const {findSourceForkOverlap:check}=
  require('../simulation/evaluation/agent18-original-source-fork-overlap-preflight.cjs');

const root={...registry.entries[0]};
test('an actually previously tested same-source root is identified',()=>{
  const x=check(root,registry);
  assert.equal(x.status,'EXACT_PRIOR_ROOT_ACTION');
  assert.equal(x.matches.length,1);
  assert.equal(x.matches[0].key,root.key);
  assert.equal(x.automaticExperimentVeto,false);
  assert.equal(x.competitivelyQualifiedGames,0);
});
test('same physical source root with another action is a distinct fork',()=>{
  const x=check({...registry.entries[1],card:'Professors Letter BKT',
    recipient:'item-from-source-hand'},registry);
  assert.equal(x.status,'EXACT_PRIOR_ROOT_ACTION');
  assert.equal(x.matches.filter(z=>z.overlap==='EXACT_PRIOR_ROOT_ACTION').length,1);
  assert.equal(x.matches.filter(z=>z.overlap==='DIFFERENT_ACTION').length,1);
});
test('physical deal difference cannot silently reuse prior proof',()=>{
  const x=check({...root,fullPhysicalDealSha256:'f'.repeat(64)},registry);
  assert.equal(x.status,'RELATED_ORIGINAL_ROOT');
  assert.equal(x.matches[0].overlap,'DIFFERENT_DEAL');
});
test('pre-root divergent accepted history is separately labelled',()=>{
  const x=check({...root,preRootSha256:'f'.repeat(64)},registry);
  assert.equal(x.matches[0].overlap,'DIFFERENT_PREFIX');
});
test('engine revision difference is explicitly non-equivalent',()=>{
  const x=check({...root,enginePin:'f'.repeat(64)},registry);
  assert.equal(x.matches[0].overlap,'DIFFERENT_ENGINE');
});
test('unknown registered root is never certified as unseen worldwide',()=>{
  const x=check({...root,sourcePassRootOrdinal:9999},registry);
  assert.equal(x.status,'NO_MATCH_IN_PARTIAL_REGISTRY');
  assert.equal(x.registryIsComplete,false);
});
test('source seat and source identity are strict discriminator fields',()=>{
  for(const mutated of [{...root,sourceSeat:1},
    {...root,sourceRegistration:'6:100:A:champion-reference'}]){
    const x=check(mutated,registry);
    assert.equal(x.status,'NO_MATCH_IN_PARTIAL_REGISTRY');
  }
});
test('incomplete registration does not return an optimistic novel result',()=>{
  const x=check({sourceRegistration:root.sourceRegistration},registry);
  assert.equal(x.status,'INSUFFICIENT_CUSTODY');
  assert.ok(x.missing.includes('fullPhysicalDealSha256'));
  assert.equal(x.competitivelyQualifiedGames,0);
});
