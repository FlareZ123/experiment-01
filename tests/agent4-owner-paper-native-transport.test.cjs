'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withBilateralOwnerTrainerFrontier}=
  require('../simulation/twinleaf/agent29-bilateral-owner-trainer-frontier.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');

function fixtureAudit(){
  return {
    roots:[],rootsOmittedDueToCap:0,
    nativePrintedTrainerClasses:0,k0GuaranteedVipPassCount:0,
    ownerPaperNecessityOptIn:true,ownerPaperNecessaryFailures:0,
    ownerPaperUncertainTemporalDeclines:0
  };
}
function stage(name,events){
  return execute=>{
    events.push('enter:'+name);
    const result=execute();
    events.push('leave:'+name);
    return {result,audit:{version:name,acceptedActorRoots:0}};
  };
}

test('two-seat transport passes opt-in provenance without enabling it by default',()=>{
  const deps=[];
  const observer=(work,options)=>{
    deps.push(options);
    return {result:work(),audit:fixtureAudit()};
  };
  const first=withBilateralOwnerTrainerFrontier(()=>123,{
    observer,nativeDeps:{mock:true}});
  const second=withBilateralOwnerTrainerFrontier(()=>456,{
    observer,nativeDeps:{mock:true},ownerPaperNecessity:true});
  assert.equal(first.result,123);
  assert.equal(second.result,456);
  assert.deepEqual(deps[0].seats,[0,1]);
  assert.equal('ownerPaperNecessityOptIn' in deps[0],false);
  assert.equal(deps[1].ownerPaperNecessityOptIn,true);
  assert.equal(second.audit.summary.independentCompetitiveGames,0);
});

test('canonical opt-in paper screen reaches innermost native observer',()=>{
  const events=[],given=[];
  const adapters={
    root:stage('root',events),fog:stage('fog',events),
    select:stage('select',events),option:stage('option',events),
    attack:stage('attack',events),
    trainerFrontier:(work,options)=>{
      given.push(options);
      events.push('enter:paperObserver');
      const result=work();
      events.push('leave:paperObserver');
      return {result,audit:fixtureAudit()};
    }
  };
  const v=withCanonicalActorOnlyPolicy(
    ()=>{events.push('native');return 42},adapters,{
      ownerGenericTrainerFrontier:true,ownerPaperNecessity:true
    });
  assert.equal(v.result,42);
  assert.equal(given.length,1);
  assert.equal(given[0].ownerPaperNecessity,true);
  assert.ok(events.indexOf('enter:paperObserver')<
    events.indexOf('native'));
  assert.ok(events.indexOf('leave:paperObserver')>
    events.indexOf('native'));
  assert.equal(v.audit.qualification.competitiveGames,0);
  assert.equal(v.audit.ownerTrainerFrontierAudit.ownerPaperNecessityOptIn,true);
});

test('no native paper screen selected when generic frontier is disabled',()=>{
  const events=[],given=[];
  const adapters={
    root:stage('root',events),fog:stage('fog',events),
    select:stage('select',events),option:stage('option',events),
    attack:stage('attack',events),
    trainerFrontier:(work,options)=>{
      given.push(options);return {result:work(),audit:fixtureAudit()};
    }
  };
  const out=withCanonicalActorOnlyPolicy(()=>78,adapters,{
    ownerPaperNecessity:true
  });
  assert.equal(out.result,78);
  assert.deepEqual(given,[]);
  assert.equal(out.audit.ownerGenericTrainerFrontierOptIn,false);
});
