'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  VERSION, withCanonicalActorOnlyPolicy
} = require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');

/** @param {string} name @param {object} audit @param {string[]} order */
function fakeAdapter(name, audit, order) {
  return execute => {
    order.push('install:' + name);
    const result = execute();
    order.push('restore:' + name);
    return {result, audit: {version: name, ...audit}};
  };
}

test('canonical composition dispatch order preserves the exact execution result', () => {
  const order = [];
  const expected = {rows: [{trial: 'rank6'}], competitiveQualifiedGames: 0};
  const adapters = {
    root: fakeAdapter('root', {
      selectedRootDecisions: 5, acceptedActorRoots: 5,
      rejectedActorRoots: 0, unsupportedPromptFallbacks: 3
    }, order),
    fog: fakeAdapter('fog', {
      fogItemRootNativeAccepted: 2, fogPromptNativeAccepted: 2,
      unsupportedPrompts: 5
    }, order),
    select: fakeAdapter('select', {selected: 2, accepted: 2,
      unsupportedPromptFallbacks: 4
    }, order),
    option: fakeAdapter('option', {
      acceptedPromptActions: 1, unsupportedPromptDelegations: 6
    }, order),
    attack: fakeAdapter('attack', {
      accepted: 1, nativeFallbacks: 7
    }, order)
  };
  const observed = withCanonicalActorOnlyPolicy(() => {
    order.push('native:canonical');
    return expected;
  }, adapters);
  assert.strictEqual(observed.result, expected);
  assert.deepEqual(order, [
    'install:root', 'install:fog', 'install:select', 'install:option', 'install:attack',
    'native:canonical',
    'restore:attack', 'restore:option', 'restore:select', 'restore:fog', 'restore:root'
  ]);
  assert.equal(observed.audit.version, VERSION);
  assert.deepEqual(observed.audit.selectedHandlerPriority, [
    'ChooseAttackPrompt', 'SelectOptionPrompt', 'SelectPrompt',
    'FogCrystalRootAndOwnerDeckSearch', 'ActorOnlyRoot'
  ]);
  assert.equal(observed.audit.nativeDecisionCounts.actorRootsAccepted, 5);
  assert.equal(observed.audit.nativeDecisionCounts.fogOwnerPromptAccepted, 2);
  assert.equal(observed.audit.nativeDecisionCounts.chooseAttackAccepted, 1);
  assert.equal(observed.audit.nativeDecisionCounts.selectOptionAccepted, 1);
  assert.equal(observed.audit.nativeDecisionCounts.selectAccepted, 2);
});

test('nested prompt delegates are overlapping observations, not extra successes', () => {
  const order = [];
  const make = (name, audit) => fakeAdapter(name, audit, order);
  const observed = withCanonicalActorOnlyPolicy(() => 'native',
    {
      root: make('root', {unsupportedPromptFallbacks: 2}),
      fog: make('fog', {unsupportedPrompts: 4}),
      select: make('select', {unsupportedPromptFallbacks: 6}),
      option: make('option', {unsupportedPromptDelegations: 5}),
      attack: make('attack', {nativeFallbacks: 9})
    });
  assert.equal(observed.audit.nativeDecisionCounts.lastChanceGenericPromptFallbacks, 2);
  assert.deepEqual(observed.audit.overlappingDelegationObservations, {
    chooseAttack: 9, selectOption: 5, select: 6, fog: 4, lastChanceRoot: 2,
    warning: 'Nested delegation counters overlap. The root is the final fallback.'
  });
  assert.equal(observed.audit.qualification.fullyActorOnly, false);
  assert.equal(observed.audit.qualification.competitiveGames, 0);
  assert.equal(observed.audit.qualification.paperClockQualified, false);
});

test('composing a partially implemented actor policy cannot self-certify games', () => {
  const wrap = name => fakeAdapter(name, {}, []);
  const observed = withCanonicalActorOnlyPolicy(
    () => ({rows: [{finished: true, winner: 0}], competitiveQualifiedGames: 0}),
    {root: wrap('root'), fog: wrap('fog'), select: wrap('select'),
      option: wrap('option'), attack: wrap('attack')}
  );
  assert.equal(observed.audit.nativeDecisionCounts.lastChanceGenericPromptFallbacks,
    null);
  assert.equal(observed.audit.qualification.competitiveGames, 0);
  assert.equal(observed.audit.qualification.sourcePolicyCompetenceEstablished, false);
  assert.equal(observed.result.rows[0].finished, true);
});

test('opt-in sixth owner search sits below Fog and above generic roots',()=>{
  const order=[],add=(name,audit)=>fakeAdapter(name,audit,order);
  const adapters={
    root:add('root',{selectedRootDecisions:2,acceptedActorRoots:2,
      unsupportedPromptFallbacks:1}),
    ownerSearch:add('ownerSearch',{accepted:3,
      nativePromptPostconditionsConfirmed:3,
      nativePromptPostconditionsUnverified:0,nativeFallbacks:5}),
    fog:add('fog',{fogItemRootNativeAccepted:1,fogPromptNativeAccepted:1}),
    select:add('select',{accepted:1}),
    option:add('option',{acceptedPromptActions:1}),
    attack:add('attack',{accepted:1})
  };
  const observed=withCanonicalActorOnlyPolicy(()=>17,adapters,
    {ownerSingleSearch:true});
  assert.equal(observed.result,17);
  assert.deepEqual(order,[
    'install:root','install:ownerSearch','install:fog',
    'install:select','install:option','install:attack',
    'restore:attack','restore:option','restore:select',
    'restore:fog','restore:ownerSearch','restore:root'
  ]);
  assert.equal(observed.audit.nativeDecisionCounts.ownerSearchAccepted,3);
  assert.equal(observed.audit.nativeDecisionCounts.ownerSearchSettled,3);
  assert.equal(observed.audit.componentVersions.ownerSearch,'ownerSearch');
  assert.equal(observed.audit.qualification.competitiveGames,0);
  assert.deepEqual(observed.audit.selectedHandlerPriority,[
    'ChooseAttackPrompt','SelectOptionPrompt','SelectPrompt',
    'FogCrystalRootAndOwnerDeckSearch','ActorOwnerSingleSearchPrompt',
    'ActorOnlyRoot'
  ]);
});

test('opt-in outer native decoder ledger retains canonical hook order and disaggregates seats',()=>{
  const order=[];
  const make=(name,audit)=>fakeAdapter(name,audit,order);
  const observed=withCanonicalActorOnlyPolicy(()=>29,{
    genericFallback:make('genericFallback',{
      liveGenericDecodes:5,
      bySeat:{0:{'owner-prompt':2},1:{'owner-prompt':3}},
      byOwnerPromptType:{0:{ChooseCardsPrompt:2},1:{WaitPrompt:3}}
    }),
    root:make('root',{unsupportedPromptFallbacks:5}),
    fog:make('fog',{}),select:make('select',{}),
    option:make('option',{}),attack:make('attack',{})
  },{genericFallbackAttribution:true});
  assert.equal(observed.result,29);
  assert.deepEqual(order,[
    'install:genericFallback','install:root','install:fog',
    'install:select','install:option','install:attack',
    'restore:attack','restore:option','restore:select',
    'restore:fog','restore:root','restore:genericFallback'
  ]);
  assert.equal(observed.audit.genericFallbackAttributionOptIn,true);
  assert.equal(observed.audit.nativeDecisionCounts.nativeGenericDecoderCalls,5);
  assert.equal(observed.audit.nativeDecisionCounts.nativeGenericDecoderBySeat[1]['owner-prompt'],3);
  assert.equal(observed.audit.nativeDecisionCounts.nativeGenericPromptBySeat[0].ChooseCardsPrompt,2);
  assert.equal(observed.audit.qualification.competitiveGames,0);
});


test('opt-in actor ChoosePokemon runs inside the one existing canonical composition',()=>{
  const order=[],make=(name,audit)=>fakeAdapter(name,audit,order);
  const observed=withCanonicalActorOnlyPolicy(()=>42,{
    root:make('root',{acceptedActorRoots:4}),
    fog:make('fog',{}),
    select:make('select',{}),
    option:make('option',{}),
    attack:make('attack',{}),
    pokemon:make('pokemon',{
      accepted:2,postconditionsConfirmed:2,
      bySeat:{0:1,1:1},unsupportedNativeFallbacks:1
    })
  },{actorChoosePokemon:true});
  assert.equal(observed.result,42);
  assert.deepEqual(order,[
    'install:root','install:fog','install:select',
    'install:option','install:attack','install:pokemon',
    'restore:pokemon','restore:attack','restore:option',
    'restore:select','restore:fog','restore:root'
  ]);
  assert.equal(observed.audit.actorChoosePokemonOptIn,true);
  assert.ok(observed.audit.version.includes('agent8-canonical-actor-choose-pokemon-v7'));
  assert.equal(observed.audit.nativeDecisionCounts.choosePokemonAccepted,2);
  assert.equal(observed.audit.nativeDecisionCounts.choosePokemonSettled,2);
  assert.deepEqual(observed.audit.nativeDecisionCounts.choosePokemonBySeat,{0:1,1:1});
  assert.equal(observed.audit.componentVersions.choosePokemon,'pokemon');
  assert.equal(observed.audit.selectedHandlerPriority[0],'ChoosePokemonPrompt');
  assert.equal(observed.audit.qualification.competitiveGames,0);
});


test('read-only owner Supporter audit sits closest to native action source',()=>{
  const order=[],make=(name,audit)=>fakeAdapter(name,audit,order);
  const observed=withCanonicalActorOnlyPolicy(()=>37,{
    root:make('root',{selectedRootDecisions:1,acceptedActorRoots:1}),
    fog:make('fog',{}),select:make('select',{}),
    option:make('option',{}),attack:make('attack',{}),
    supporterOpportunity:make('supporter',{
      bySeat:{0:{firstTurnHeld:2,firstTurnStructurallyOpen:1},
        1:{firstTurnHeld:1,firstTurnStructurallyOpen:0}},
      actualStoreSeen:true,decisionsSeen:8
    })
  },{ownerSupporterOpportunity:true});
  assert.equal(observed.result,37);
  assert.deepEqual(order,[
    'install:root','install:fog','install:select','install:option',
    'install:attack','install:supporter',
    'restore:supporter','restore:attack','restore:option',
    'restore:select','restore:fog','restore:root'
  ]);
  assert.equal(observed.audit.ownerSupporterOpportunityOptIn,true);
  assert.equal(observed.audit.nativeDecisionCounts
    .ownerSupporterOpportunitiesBySeat[0].firstTurnHeld,2);
  assert.equal(observed.audit
    .ownerSupporterOpportunityAudit.actualStoreSeen,true);
  assert.equal(observed.audit.qualification.competitiveGames,0);
});


test('opt-in VIP bridge intercepts root Pass while preserving both-seat audit',()=>{
  const order=[],make=(name,audit)=>fakeAdapter(name,audit,order);
  const observed=withCanonicalActorOnlyPolicy(()=>73,{
    root:make('root',{selectedRootDecisions:1,acceptedActorRoots:1}),
    vipAfterPass:make('vip',{
      acceptedItems:2,acceptedSearches:2,nativeBenchConfirmed:2,
      bySeat:{0:{items:1,searches:1,benchConfirmed:1},
        1:{items:1,searches:1,benchConfirmed:1}}
    }),
    fog:make('fog',{}),select:make('select',{}),
    option:make('option',{}),attack:make('attack',{})
  },{ownerVipAfterPass:true});
  assert.equal(observed.result,73);
  assert.deepEqual(order,[
    'install:root','install:vip','install:fog','install:select',
    'install:option','install:attack','native:canonical',
    'restore:attack','restore:option','restore:select',
    'restore:fog','restore:vip','restore:root'
  ].filter(x=>x!=='native:canonical').map(x=>x==='restore:attack'?x:x));
  assert.equal(observed.audit.ownerVipAfterPassOptIn,true);
  assert.equal(observed.audit.nativeDecisionCounts.vipItemAccepted,2);
  assert.equal(observed.audit.nativeDecisionCounts.vipSearchAccepted,2);
  assert.equal(observed.audit.nativeDecisionCounts.vipBenchConfirmed,2);
  assert.equal(observed.audit.nativeDecisionCounts.vipBySeat[1].benchConfirmed,1);
  assert.equal(observed.audit.componentVersions.vipAfterPass,'vip');
  assert.equal(observed.audit.qualification.competitiveGames,0);
});

test('optional read-only Plumeria observer preserves canonical composition and native audit ownership',()=>{
  const order=[],make=(name,audit)=>fakeAdapter(name,audit,order);
  const observed=withCanonicalActorOnlyPolicy(()=>61,{
    root:make('root',{selectedRootDecisions:1,acceptedActorRoots:1}),
    fog:make('fog',{}),select:make('select',{}),
    option:make('option',{}),attack:make('attack',{}),
    plumeriaOpportunity:make('plumeria',{
      firstTurnNativePlayable:3,acceptedPassWithPlayable:2,
      acceptedPlumeria:1,settledEnergyDiscards:1
    }),
    supporterOpportunity:make('supporter',{bySeat:{0:{},1:{}}})
  },{ownerPlumeriaOpportunity:true,ownerSupporterOpportunity:true});
  assert.equal(observed.result,61);
  assert.deepEqual(order,[
    'install:root','install:fog','install:select','install:option',
    'install:attack','install:supporter','install:plumeria',
    'restore:plumeria','restore:supporter','restore:attack',
    'restore:option','restore:select','restore:fog','restore:root'
  ]);
  assert.equal(observed.audit.ownerPlumeriaOpportunityOptIn,true);
  assert.equal(observed.audit.nativeDecisionCounts.plumeriaNativePlayableFirstOwnerTurns,3);
  assert.equal(observed.audit.nativeDecisionCounts.plumeriaAcceptedPassWithPlayable,2);
  assert.equal(observed.audit.nativeDecisionCounts.plumeriaNativeRootAccepted,1);
  assert.equal(observed.audit.nativeDecisionCounts.plumeriaSettledEnergyDiscards,1);
  assert.equal(observed.audit.ownerPlumeriaOpportunityAudit.version,'plumeria');
  assert.equal(observed.audit.qualification.competitiveGames,0);
});

require('./agent4-plumeria-opportunity.test.cjs');

require('./agent4-plumeria-after-pass.test.cjs');

test('Plumeria after-Pass installs after terminal root and changes only opted-in owner Pass',()=>{
  const events=[];
  let decode=()=>({kind:'generic'});
  const wrap=(name,make,audit={})=>execute=>{
    const previous=decode;
    decode=make(previous);
    events.push('install:'+name);
    try{return {result:execute(),audit:{version:name,...audit}};}
    finally{decode=previous;events.push('restore:'+name);}
  };
  const root=wrap('root',()=>()=>({kind:'pass'}),
    {selectedRootDecisions:1,acceptedActorRoots:1});
  const plumeria=wrap('plumeria',previous=>()=>{
    const baseline=previous();
    return baseline.kind==='pass'?{kind:'play-plumeria',actorSeat:1}:baseline;
  },{proposedPlumeria:1,acceptedPlumeria:1,settledEnergyDiscards:1,
    bySeat:{0:{accepted:0,settled:0},1:{accepted:1,settled:1}}});
  const delegate=name=>fakeAdapter(name,{},events);
  const adapters={root,plumeriaAfterPass:plumeria,
    fog:delegate('fog'),select:delegate('select'),
    option:delegate('option'),attack:delegate('attack')};
  const control=withCanonicalActorOnlyPolicy(()=>decode(),adapters);
  assert.equal(control.result.kind,'pass');
  assert.equal(control.audit.ownerPlumeriaAfterPassOptIn,false);
  assert.equal(control.audit.ownerPlumeriaAfterPassAudit,null);
  assert.equal(events.includes('install:plumeria'),false);
  events.length=0;
  const treated=withCanonicalActorOnlyPolicy(()=>decode(),adapters,
    {ownerPlumeriaAfterPass:true});
  assert.deepEqual(treated.result,{kind:'play-plumeria',actorSeat:1});
  assert.deepEqual(events.slice(0,3),[
    'install:root','install:plumeria','install:fog'
  ]);
  assert.equal(treated.audit.ownerPlumeriaAfterPassOptIn,true);
  assert.equal(treated.audit.nativeDecisionCounts.plumeriaAfterPassAccepted,1);
  assert.equal(treated.audit.nativeDecisionCounts.plumeriaAfterPassSettled,1);
  assert.equal(treated.audit.nativeDecisionCounts.plumeriaAfterPassBySeat[1].settled,1);
  assert.equal(treated.audit.componentVersions.plumeriaAfterPass,'plumeria');
  assert.equal(treated.audit.detailedComponentAudits.ownerPlumeriaAfterPass.version,
    'plumeria');
  assert.equal(treated.audit.qualification.competitiveGames,0);
  assert.equal(treated.audit.qualification.sourcePolicyCompetenceEstablished,false);
});
