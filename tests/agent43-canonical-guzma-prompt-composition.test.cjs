'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withCanonicalActorOnlyPolicy,VERSION}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');

/**
 * Record a reversible adapter without loading the compiled native engine.
 * @param {string} name Adapter name.
 * @param {object} audit Named native-receipt fixture.
 * @param {string[]} order Ordered synchronous installation ledger.
 * @returns {(execute:()=>unknown)=>{result:unknown,audit:object}}
 */
function adapter(name,audit,order){
  return execute=>{
    order.push('install:'+name);
    const result=execute();
    order.push('restore:'+name);
    return {result,audit:{version:name,...audit}};
  };
}

/**
 * Canonical actor composition's full five default delegates.
 * @param {string[]} order
 * @returns {object}
 */
function base(order){
  const empty=name=>adapter(name,{},order);
  return {root:empty('root'),fog:empty('fog'),select:empty('select'),
    option:empty('option'),attack:empty('attack')};
}

test('default canonical run never installs Guzma bridge or changes version',()=>{
  const order=[],adapters=base(order),result={fixed60:'unchanged'};
  adapters.guzma=()=>{throw new Error('Disabled bridge must never run');};
  const done=withCanonicalActorOnlyPolicy(()=>result,adapters);
  assert.strictEqual(done.result,result);
  assert.equal(done.audit.version,VERSION);
  assert.equal(done.audit.guzmaOwnerPromptContinuationOptIn,false);
  assert.equal(done.audit.guzmaPromptAudit,null);
  assert.equal(done.audit.nativeDecisionCounts.guzmaRootsAccepted,undefined);
  assert.equal(order.filter(x=>x.includes('guzma')).length,0);
  assert.equal(done.audit.qualification.competitiveGames,0);
});

test('optional Guzma recipient bridge runs after generic ChoosePokemon and captures both seats',()=>{
  const order=[],adapters=base(order);
  adapters.pokemon=adapter('pokemon',{accepted:1,postconditionsConfirmed:1,
    bySeat:{0:1,1:0}},order);
  adapters.guzma=adapter('guzma',{
    acceptedGuzmaRoots:2,
    ownTargetAcceptances:2,
    ownTargetPhysicalConfirmations:2,
    ownTargetPhysicalMismatches:0,
    nonLiveFallbacks:1,
    bySeat:{0:1,1:1},
    competitiveGameQualified:false
  },order);
  const expected={actionCount:8};
  const done=withCanonicalActorOnlyPolicy(()=>{
    order.push('native:Store');
    return expected;
  },adapters,{actorChoosePokemon:true,
    guzmaOwnerPromptContinuation:true});
  assert.strictEqual(done.result,expected);
  assert.deepEqual(order,[
    'install:root','install:fog','install:select',
    'install:option','install:attack','install:pokemon','install:guzma',
    'native:Store',
    'restore:guzma','restore:pokemon','restore:attack',
    'restore:option','restore:select','restore:fog','restore:root'
  ]);
  assert.equal(done.audit.guzmaOwnerPromptContinuationOptIn,true);
  assert.equal(done.audit.guzmaPromptAudit.version,'guzma');
  assert.equal(done.audit.componentVersions.guzmaOwnBench,'guzma');
  assert.equal(done.audit.nativeDecisionCounts.guzmaRootsAccepted,2);
  assert.equal(done.audit.nativeDecisionCounts.guzmaOwnTargetAccepted,2);
  assert.equal(done.audit.nativeDecisionCounts.guzmaOwnTargetConfirmed,2);
  assert.equal(done.audit.nativeDecisionCounts.guzmaOwnTargetMismatched,0);
  assert.deepEqual(done.audit.nativeDecisionCounts.guzmaBySeat,{0:1,1:1});
  assert.deepEqual(done.audit.selectedHandlerPriority.slice(0,2),[
    'GuzmaOwnBenchPrompt','ChoosePokemonPrompt'
  ]);
  assert.equal(done.audit.qualification.competitiveGames,0);
  assert.equal(done.audit.qualification.fullyActorOnly,false);
});

test('optional Guzma bridge works without generic ChoosePokemon and rejects missing receipts',()=>{
  const order=[],adapters=base(order);
  adapters.guzma=adapter('guzma',{acceptedGuzmaRoots:0,
    ownTargetAcceptances:0,bySeat:{0:0,1:0}},order);
  const ok=withCanonicalActorOnlyPolicy(()=>42,adapters,
    {guzmaOwnerPromptContinuation:true});
  assert.equal(ok.result,42);
  assert.ok(ok.audit.version.includes(
    'agent43-owner-guzma-native-prompt-continuation-v1'));
  assert.ok(ok.audit.selectedHandlerPriority.includes('GuzmaOwnBenchPrompt'));
  assert.deepEqual(order.slice(-2),['restore:fog','restore:root']);
  adapters.guzma=()=>({result:42,audit:null});
  assert.throws(()=>withCanonicalActorOnlyPolicy(()=>42,adapters,
    {guzmaOwnerPromptContinuation:true}),/must report a native audit/);
});
