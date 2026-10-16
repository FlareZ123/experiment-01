'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {withExpandedActionOptions,runWithResearchProfile,EXPANDED_PROFILE,
  DEFAULT_PROFILE,ALLOWED_PROFILES}=require('../simulation/twinleaf/policy-profiles.cjs');
const {upstreamSmokeDeck}=require('../simulation/twinleaf/headless.cjs');
const defs=require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output/simple-bot/simple-bot-definitions'));

test('Expanded composite is separately named and restores unmodified defaults',()=>{
  assert.ok(ALLOWED_PROFILES.includes(DEFAULT_PROFILE));
  assert.ok(ALLOWED_PROFILES.includes(EXPANDED_PROFILE));
  const before=defs.allSimpleTactics.slice(),prompts=defs.allPromptResolvers.slice();
  const inside=withExpandedActionOptions(()=>{
    const a=defs.allSimpleTactics.map(x=>x.name);
    const b=defs.allPromptResolvers.map(x=>x.name);
    assert.ok(a.indexOf('TempleUnlockTactic')<a.indexOf('AttachEnergyTactic'));
    assert.ok(a.indexOf('BunnelbyEvolutionTactic')<a.indexOf('ToolAwareAttackTactic'));
    assert.ok(a.indexOf('ToolAwareAttackTactic')<a.indexOf('AttackTactic'));
    assert.ok(b.indexOf('MandatoryOptionResolver')<b.indexOf('ChooseCardsPromptResolver'));
    assert.ok(b.indexOf('BarrageEvolutionResolver')<b.indexOf('ChooseAttackPromptResolver'));
    return {a,b};
  });
  assert.ok(inside.a.length>before.length);
  assert.ok(inside.b.length>prompts.length);
  assert.deepEqual(defs.allSimpleTactics,before);
  assert.deepEqual(defs.allPromptResolvers,prompts);
  assert.throws(()=>withExpandedActionOptions(()=>{throw Error('test error');}),/test error/);
  assert.deepEqual(defs.allSimpleTactics,before);
  assert.deepEqual(defs.allPromptResolvers,prompts);
});

test('bounded engine smoke labels Expanded policy capabilities independently',()=>{
  const deck=upstreamSmokeDeck();
  const run=runWithResearchProfile({
    deckA:deck,deckB:deck,seed:20261017,maxActions:80,
    label:'bounded experimental policy capability smoke'
  },EXPANDED_PROFILE);
  assert.equal(run.researchPolicyProfile,EXPANDED_PROFILE);
  assert.equal(run.supporterDecisionCorrection,true);
  assert.equal(run.doubleDragonRecovery,true);
  assert.equal(run.policyRandomIsolation,true);
  assert.ok(run.experimentalTactics.includes('BarrageEvolutionResolver-v1'));
  assert.match(run.policy,/MandatoryOptionResolver-v1/);
  assert.ok(run.actions<=80);
});
