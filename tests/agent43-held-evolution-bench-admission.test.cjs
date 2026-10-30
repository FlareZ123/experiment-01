'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseHeldEvolutionBench}=require(
  '../simulation/twinleaf/agent43-held-evolution-bench-admission.cjs');

const D='Dedenne GX UNB';
const V='Regidrago V SIT';
const S='Regidrago VSTAR SIT';

/** Real printed families, detached owner information only. */
function fixture(){
  return {
    view:{
      decisionKind:'owner-root',globalTurn:2,
      ownHand:[D,V,S],
      ownPublic:{bench:[{name:'Budew'},{name:'Regidrago'},
        {name:'Latias'},{name:'Marshadow'},null]},
      ownTurnResources:{pokemonPlayLocked:false,abilityPokemonPlayLocked:false},
      opponentPrivate:{hand:['sealed-secret'],prizes:['unknown']}
    },
    catalog:{
      basics:new Set([D,V]),
      abilityBasics:new Set([D]),
      basicNames:new Map([[D,'Dedenne GX'],[V,'Regidrago V']]),
      evolutions:new Map([[S,{stage:4,evolvesFrom:'Regidrago V'}]])
    },
    first:{kind:'bench-basic',handIndex:0,benchIndex:4,printing:D}
  };
}

test('one last slot favors exactly held VSTAR line over hand-earliest Basic',()=>{
  const {view,catalog,first}=fixture();
  const result=chooseHeldEvolutionBench(view,catalog,first);
  assert.deepEqual(result.intent,{kind:'bench-basic',handIndex:1,
    benchIndex:4,printing:V});
  assert.equal(result.receipt.previous,D);
  assert.equal(result.receipt.preferred,V);
  assert.deepEqual(result.receipt.evolutionPrintings,[S]);
  assert.equal(result.receipt.nativeAccepted,'unverified');
  assert.equal(result.receipt.competitiveQualified,false);
});

test('no change when the chosen Basic already has a directly held evolution',()=>{
  const {view,catalog}=fixture();
  assert.equal(chooseHeldEvolutionBench(view,catalog,
    {kind:'bench-basic',handIndex:1,benchIndex:4,printing:V}),null);
});

test('no speculative last-slot choice outside the narrow conflict',()=>{
  const {view,catalog,first}=fixture();
  assert.equal(chooseHeldEvolutionBench({...view,ownPublic:{
    bench:[null,null,{name:'P'},{name:'Q'},{name:'R'}]}},catalog,first),null);
  assert.equal(chooseHeldEvolutionBench({...view,ownHand:[D,V]},catalog,first),null);
  assert.equal(chooseHeldEvolutionBench({...view,ownTurnResources:{
    pokemonPlayLocked:true}},catalog,first),null);
  assert.equal(chooseHeldEvolutionBench(view,catalog,{kind:'attack'}),null);
});

test('respects explicit Ability Basic play lock while preserving next eligible Basic',()=>{
  const {view,catalog,first}=fixture();
  const restricted={...view,ownTurnResources:{abilityPokemonPlayLocked:true}};
  assert.equal(chooseHeldEvolutionBench(restricted,catalog,first),null);
  const validFirst={kind:'bench-basic',handIndex:1,benchIndex:4,printing:V};
  assert.equal(chooseHeldEvolutionBench(restricted,catalog,validFirst),null);
});

test('hidden opponent and own unknown deck/Prize changes cannot alter detached choice',()=>{
  const {view,catalog,first}=fixture();
  const a=chooseHeldEvolutionBench(view,catalog,first);
  const variant={...view,opponentPrivate:{hand:['secret-two']},
    ownDeck:['entire unseen contents'],prizes:[D,V]};
  assert.deepEqual(chooseHeldEvolutionBench(variant,catalog,first),a);
});

test('does not match prefix-confusable Basic names or nonmatching evolutions',()=>{
  const {view,catalog,first}=fixture();
  const wrong=new Map([[S,{evolvesFrom:'Regidrago'}]]);
  assert.equal(chooseHeldEvolutionBench(view,{
    ...catalog,evolutions:wrong},first),null);
});

const {chooseActorRootIntent}=require(
  '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

test('real shared actor-root selector preserves default and changes only the opt-in',()=>{
  const {view,catalog,first}=fixture();
  assert.deepEqual(chooseActorRootIntent(view,catalog,{}),first);
  const changed=chooseActorRootIntent(view,catalog,{lastBenchHeldEvolution:true});
  assert.deepEqual(changed,{kind:'bench-basic',handIndex:1,
    benchIndex:4,printing:V});
  assert.deepEqual(chooseActorRootIntent(view,catalog,{}),first);
});

test('shared policy opt-in leaves no-conflict root unchanged',()=>{
  const {view,catalog}=fixture();
  const single={...view,ownHand:[D]};
  const expected={kind:'bench-basic',handIndex:0,benchIndex:4,printing:D};
  assert.deepEqual(chooseActorRootIntent(single,catalog,{}),expected);
  assert.deepEqual(chooseActorRootIntent(single,catalog,
    {lastBenchHeldEvolution:true}),expected);
});
