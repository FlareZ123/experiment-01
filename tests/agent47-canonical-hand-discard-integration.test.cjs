'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withCanonicalActorOnlyPolicy,HAND_DISCARD_VERSION}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
const fake=(name,details,order)=>fn=>{
  order.push('install '+name);
  const result=fn();
  order.push('restore '+name);
  return {result,audit:{version:name,...details}};
};

test('opt-in seventh hand-discard component executes in existing chain and attributes native seat',()=>{
  const order=[],adapters={
    root:fake('root',{acceptedActorRoots:1,unsupportedPromptFallbacks:1},order),
    fog:fake('fog',{},order),select:fake('select',{},order),
    option:fake('option',{},order),attack:fake('attack',{},order),
    handDiscard:fake('discard',{
      accepted:2,bySeat:{0:1,1:1},nativePromptPostconditionsConfirmed:2,
      nativeFallbacks:1
    },order)
  };
  const packet=withCanonicalActorOnlyPolicy(()=>{order.push('native');return 3;},
    adapters,{actorHandDiscard:true});
  assert.equal(packet.result,3);
  assert.equal(packet.audit.version,HAND_DISCARD_VERSION);
  assert.equal(packet.audit.actorHandDiscardOptIn,true);
  assert.equal(packet.audit.componentVersions.handDiscard,'discard');
  assert.equal(packet.audit.nativeDecisionCounts.handDiscardAccepted,2);
  assert.equal(packet.audit.nativeDecisionCounts.handDiscardSettled,2);
  assert.deepEqual(packet.audit.nativeDecisionCounts.handDiscardBySeat,{0:1,1:1});
  assert.equal(packet.audit.detailedComponentAudits.handDiscard.version,'discard');
  assert.equal(packet.audit.qualification.competitiveGames,0);
  assert.deepEqual(order,[
    'install root','install fog','install select','install option',
    'install attack','install discard','native','restore discard',
    'restore attack','restore option','restore select','restore fog',
    'restore root'
  ]);
});

test('default canonical composition does not install seventh component',()=>{
  const order=[],make=n=>fake(n,{},order);
  const adapters={root:make('root'),fog:make('fog'),select:make('select'),
    option:make('option'),attack:make('attack'),
    handDiscard:()=>{throw new Error('must remain opt-in');}};
  const result=withCanonicalActorOnlyPolicy(()=>42,adapters);
  assert.equal(result.result,42);
  assert.equal(result.audit.actorHandDiscardOptIn,false);
  assert.equal(Object.hasOwn(result.audit.detailedComponentAudits,'handDiscard'),false);
});
