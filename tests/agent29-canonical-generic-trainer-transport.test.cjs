'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withCanonicalActorOnlyPolicy
}=require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');

function fake(name,events,audit={}){
  return function(execute){
    events.push('install:'+name);
    const result=execute();
    events.push('restore:'+name);
    return {result,audit:{version:name,...audit}};
  };
}

function adapters(events){
  return {
    root:fake('root',events,{acceptedActorRoots:1}),
    fog:fake('fog',events,{}),
    select:fake('select',events,{}),
    option:fake('option',events,{}),
    attack:fake('attack',events,{}),
    trainerFrontier:fake('trainer',events,{
      summary:{bySeat:{0:{observedRoots:3},1:{observedRoots:4}},
        independentCompetitiveGames:0},
      roots:[]
    })
  };
}

test('default core does not enable additional generic Trainer census',()=>{
  const events=[],original={finished:false};
  const out=withCanonicalActorOnlyPolicy(()=>{
    events.push('native');return original;
  },adapters(events));
  assert.strictEqual(out.result,original);
  assert.equal(out.audit.ownerGenericTrainerFrontierOptIn,false);
  assert.equal(out.audit.ownerTrainerFrontierAudit,null);
  assert.equal(out.audit.detailedComponentAudits.ownerGenericTrainerFrontier,
    undefined);
  assert.ok(!events.includes('install:trainer'));
});

test('opt-in runs generic two-seat observer closest to native game, after all decision adapters',()=>{
  const events=[],original={attempted:1,competitiveQualifiedGames:0};
  const out=withCanonicalActorOnlyPolicy(()=>{
    events.push('native');return original;
  },adapters(events),{ownerGenericTrainerFrontier:true});
  assert.strictEqual(out.result,original);
  assert.deepEqual(events,[
    'install:root','install:fog','install:select',
    'install:option','install:attack','install:trainer','native',
    'restore:trainer','restore:attack','restore:option',
    'restore:select','restore:fog','restore:root'
  ]);
  assert.equal(out.audit.ownerGenericTrainerFrontierOptIn,true);
  assert.equal(out.audit.ownerTrainerFrontierAudit.summary.bySeat[1].observedRoots,4);
  assert.strictEqual(out.audit.detailedComponentAudits.ownerGenericTrainerFrontier,
    out.audit.ownerTrainerFrontierAudit);
  assert.equal(out.audit.qualification.sourcePolicyCompetenceEstablished,false);
  assert.equal(out.audit.qualification.competitiveGames,0);
  assert.ok(out.audit.version.includes('agent29-bilateral-generic-trainer-frontier'));
});


test('optional own-registered sixties are transported intact and only under enabled observer',()=>{
  const events=[],deckA=Object.freeze(Array(60).fill('Own A')),
    deckB=Object.freeze(Array(60).fill('Own B'));
  let witnessed=0;
  const adaptersLocal=adapters(events);
  adaptersLocal.trainerFrontier=(execute,options)=>{
    witnessed++;
    assert.strictEqual(options.ownRegisteredSixties[0],deckA);
    assert.strictEqual(options.ownRegisteredSixties[1],deckB);
    return fake('trainer',events,{roots:[],summary:{
      independentCompetitiveGames:0
    }})(execute);
  };
  const control=withCanonicalActorOnlyPolicy(()=>35,adaptersLocal,{
    ownerTrainerRegisteredSixties:[deckA,deckB]
  });
  assert.equal(control.result,35);
  assert.equal(witnessed,0);
  const observed=withCanonicalActorOnlyPolicy(()=>36,adaptersLocal,{
    ownerGenericTrainerFrontier:true,
    ownerTrainerRegisteredSixties:[deckA,deckB]
  });
  assert.equal(observed.result,36);
  assert.equal(witnessed,1);
  assert.equal(observed.audit.ownerTrainerFrontierAudit.summary
    .independentCompetitiveGames,0);
});
