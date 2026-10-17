'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {withExpandedActionOptions,runWithResearchProfile,EXPANDED_PROFILE,
  EXPANDED_SOURCE_PROFILE,EXPANDED_GH_SEARCH_PROFILE,DEFAULT_PROFILE,ALLOWED_PROFILES}=require('../simulation/twinleaf/policy-profiles.cjs');
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

test('K0 alternative defers Bunnelby installation to per-seat source runner',()=>{
  const before=defs.allSimpleTactics.slice(),prompts=defs.allPromptResolvers.slice();
  const inside=withExpandedActionOptions(()=>({
    tactics:defs.allSimpleTactics.map(x=>x.name),
    resolvers:defs.allPromptResolvers.map(x=>x.name)
  }),{sourceK0Bunnelby:true});
  assert.ok(inside.tactics.includes('ToolAwareAttackTactic'));
  assert.ok(inside.resolvers.includes('MandatoryOptionResolver'));
  assert.equal(inside.tactics.includes('BunnelbyEvolutionTactic'),false);
  assert.equal(inside.resolvers.includes('BarrageEvolutionResolver'),false);
  assert.deepEqual(defs.allSimpleTactics,before);
  assert.deepEqual(defs.allPromptResolvers,prompts);
  assert.throws(()=>withExpandedActionOptions(()=>{
    throw Error('source-K0 callback failure');
  },{sourceK0Bunnelby:true}),/source-K0 callback failure/);
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

test('separately versioned source-K0 profile composes both seats without peeking',()=>{
  assert.ok(ALLOWED_PROFILES.includes(EXPANDED_SOURCE_PROFILE));
  const tacticsBefore=defs.allSimpleTactics.slice();
  const resolversBefore=defs.allPromptResolvers.slice();
  const deck=upstreamSmokeDeck();
  const run=runWithResearchProfile({
    deckA:deck,deckB:deck,seed:20261018,maxActions:80,
    label:'bounded source-K0 composite policy test'
  },EXPANDED_SOURCE_PROFILE);
  assert.equal(run.researchPolicyProfile,EXPANDED_SOURCE_PROFILE);
  assert.equal(run.supporterDecisionCorrection,true);
  assert.equal(run.bunnelbyK0SafeEvolution,true);
  assert.equal(run.bunnelbyObservedK1,false);
  assert.equal(run.bunnelbyTargetAwareEvolution,true);
  assert.equal(run.bunnelbyGuzmaHalaMode1,true);
  assert.ok(run.experimentalTactics.includes('BunnelbyGuzmaHalaMode1-v1'));
  assert.ok(run.experimentalTactics.includes('BunnelbyStageTargetResolver-v1'));
  assert.match(run.policy,/BunnelbySourceK0PossibleEvolution-v1/);
  assert.ok(run.actions<=80);
  assert.deepEqual(defs.allSimpleTactics,tacticsBefore);
  assert.deepEqual(defs.allPromptResolvers,resolversBefore);
});

test('separate v3 policy labels root-observed G&H resources',()=>{
 const deck=upstreamSmokeDeck(),old=defs.allPromptResolvers.slice();
 const game=runWithResearchProfile({deckA:deck,deckB:deck,seed:20261019,maxActions:30},EXPANDED_GH_SEARCH_PROFILE);
 assert.equal(game.bunnelbyGuzmaHalaSearch,true);
 assert.equal(game.bunnelbyGuzmaHalaMode1,true);
 assert.equal(game.bunnelbyK0SafeEvolution,true);
 assert.equal(game.bunnelbyObservedK1,false);
 assert.match(game.policy,/BunnelbyGHRootSearch-v1/);
 assert.deepEqual(defs.allPromptResolvers,old);
});
