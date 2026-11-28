'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const worker=require('../../simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {resolveWorkerConfig}=require('../../simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs');
const {evidenceBundleSha256}=require('../../simulation/evaluation/canonical-evidence-json.cjs');
const profiles=[
  {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
  {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
const init=(config,seat=0,role='candidate',policyVersion=worker.POLICY_VERSION)=>({
  schema:protocol.INIT_SCHEMA,type:'init',role,seat,policyVersion,bundleSha256:'a'.repeat(64),config
});
const factory=(config,seat)=>worker.createPolicy(init(config,seat));
const card=(printing,index)=>({kind:'card',token:'card-'+index,printing,label:printing,publicMetadata:{
  selectionIndex:index,selectedCount:1,sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true
}});
const empty={kind:'empty-selection',token:'empty',label:'Choose no items'};
const slot=printing=>({printing});
function setup(seat, printings, {extra=false,active=null,bench=[],ownHand=[],
  turnSeat=null,max=extra?printings.length:6}={}) {
  const choices=printings.map(card);
  if(extra)choices.push(empty);
  return {role:'candidate',seat,observation:{actorSeat:seat,phase:1,decisionKind:'owner-prompt',
    ...(turnSeat===null?{}:{turnSeat}),
    ownHand,ownPublic:{active:active?slot(active):null,bench:bench.map(slot)}},
    prompt:{actingSeat:seat,promptType:'ChooseCardsPrompt',description:'CHOOSE_STARTING_POKEMONS',
      source:{classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,effectName:'CHOOSE_STARTING_POKEMONS'},
      choices,publicMetadata:{selectionType:'card-combination',sourceZone:'hand',ownerSeat:'actor',isOwnerVisible:true,
        isSecret:false,allowCancel:false,minimumCount:extra?0:1,maximumCount:max}},
    publicEventReceipt:null};
}
const choose=(profile,req)=>{
  const decision=factory(profile,req.seat).decide(req);
  return protocol.validateDecision(decision,req.prompt,new Set());
};
const V='Shadow Rider Calyrex V CRE', R='Radiant Eternatus CRZ', L='Tapu Lele-GX GRI',
  W='Wobbuffet PHF', D='Dialga-GX UPR', A='Latias ex SSP';
const multi=(...tokens)=>({kind:'select-choices',tokens});
const none={kind:'select-choice',token:'empty'};
test('exact profile schemas at both worker and protocol boundaries; legacy remains empty',()=>{
  for(const profile of profiles){
    for(const seat of [0,1]){protocol.validateInit(init(profile,seat));factory(profile,seat);}
    for(const bad of [{},{...profile,extra:true},{...profile,profileId:'unknown'},{...profile,deckSha256:'0'.repeat(64)}]){
      assert.throws(()=>protocol.validateInit(init(bad)));
      assert.throws(()=>factory(bad,0));
    }
    assert.throws(()=>protocol.validateInit(init(profile,0,'opponent')));
  }
  protocol.validateInit(init({},0,'opponent','legacy'));
  assert.throws(()=>protocol.validateInit(init(profiles[0],0,'opponent','legacy')));
});
test('host options are bound to exact role/deck/definition hash and cannot be silently substituted',()=>{
  for(const profile of profiles){
    const definition={policyVersion:worker.POLICY_VERSION,deckSha256:profile.deckSha256,policyOptions:profile};
    const identity={role:'candidate-policy',policyVersion:worker.POLICY_VERSION,deckSha256:profile.deckSha256,
      policyDefinition:definition,policyOptionsSha256:evidenceBundleSha256(profile),policySha256:evidenceBundleSha256(definition)};
    const args={role:'candidate',policyVersion:worker.POLICY_VERSION,policyIdentity:identity};
    assert.deepEqual(resolveWorkerConfig(args),profile);
    assert.ok(Object.isFrozen(resolveWorkerConfig(args)));
    assert.throws(()=>resolveWorkerConfig({...args,config:profiles.find(p=>p!==profile)}));
    assert.throws(()=>resolveWorkerConfig({...args,policyIdentity:{...identity,deckSha256:'0'.repeat(64)}}));
    assert.throws(()=>resolveWorkerConfig({...args,policyIdentity:{...identity,policyOptionsSha256:'0'.repeat(64)}}));
    assert.throws(()=>resolveWorkerConfig({...args,policyIdentity:{...identity,policySha256:'0'.repeat(64)}}));
    assert.throws(()=>resolveWorkerConfig({...args,policyIdentity:undefined}));
  }
  assert.deepEqual(resolveWorkerConfig({role:'opponent',policyVersion:'legacy'}),{});
});
test('initial Active choice preserves triggers unless a lone Shadow Rider needs a legal backup',()=>{
  for(const profile of profiles)for(const seat of [0,1]){
    assert.deepEqual(choose(profile,setup(seat,[D,R,L,V,V,V,A])),multi('card-3','card-4','card-5'));
    assert.deepEqual(choose(profile,setup(seat,[R])),multi('card-0'));
    assert.deepEqual(choose(profile,setup(seat,[D,V])),multi('card-1','card-0'));
    assert.deepEqual(choose(profile,setup(seat,[V,L])),multi('card-0','card-1'));
    assert.deepEqual(choose(profile,setup(seat,[V,R])),multi('card-0','card-1'));
    assert.deepEqual(choose(profile,setup(seat,[V,D,L,R])),multi('card-0','card-1'));
    assert.deepEqual(choose(profile,setup(seat,[V,'Mimikyu GRI',D,L,R])),multi('card-0','card-1'));
  }
});
test('Lockbridge Wobbuffet/Gate fork changes with observed pivot and Radiant',()=>{
  for(const seat of [0,1]){
    assert.deepEqual(choose(profiles[1],setup(seat,[W,V,R])),multi('card-1','card-0'));
    assert.deepEqual(choose(profiles[1],setup(seat,[W,V,R,A])),multi('card-0','card-3','card-1'));
    assert.deepEqual(choose(profiles[1],setup(seat,[W,V])),multi('card-0','card-1'));
  }
});
test('post-bonus placement has actual capacity, retains triggers, and can decline all',()=>{
  for(const profile of profiles)for(const seat of [0,1]){
    const o={extra:true,active:V};
    assert.deepEqual(choose(profile,setup(seat,[R,L],o)),multi('card-1'));
    assert.deepEqual(choose(profile,setup(seat,[R],o)),multi('card-0'));
    assert.deepEqual(choose(profile,setup(seat,[L],o)),multi('card-0'));
    assert.deepEqual(choose(profile,setup(seat,[D,R,L],o)),multi('card-0'));
    assert.deepEqual(choose(profile,setup(seat,[],o)),none);
    assert.deepEqual(choose(profile,setup(seat,[R,L,V],o)),multi('card-2'));
    assert.deepEqual(choose(profile,setup(seat,[R,L,V],{...o,bench:[V,V]})),none);
    assert.deepEqual(choose(profile,setup(seat,[R,L],{...o,bench:['Mimikyu GRI']})),none);
    assert.deepEqual(choose(profile,setup(seat,[V],{...o,bench:[V,V,V,V,V]})),none);
    assert.deepEqual(choose(profile,setup(seat,[L],{...o,active:'Girafarig LOT'})),multi('card-0'));
  }
});
test('pre-deal GO_FIRST chooses second in either seat without reading a future hand',()=>{
  for(const profile of profiles)for(const seat of [0,1]){
    const req={role:'candidate',seat,observation:{actorSeat:seat,phase:1,decisionKind:'owner-prompt'},
      prompt:{actingSeat:seat,promptType:'ConfirmPrompt',description:'GO_FIRST',
        source:{classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,effectName:'GO_FIRST'},
        choices:[{kind:'confirm',token:'yes',label:'Yes'},{kind:'confirm',token:'no',label:'No'}],
        publicMetadata:{selectionType:'confirm'}}};
    assert.deepEqual(choose(profile,req),{kind:'select-choice',token:'no'});
  }
});

test('Lockbridge opening recognizes a paid tutor Gate without a held pivot',()=>{
  for(const seat of [0,1]){
    assert.deepEqual(choose(profiles[1],setup(seat,[W,V],{ownHand:[W,V,'Mysterious Treasure FLI','Psychic Energy SVE']})),multi('card-1','card-0'));
    assert.deepEqual(choose(profiles[1],setup(seat,[W,V],{ownHand:[W,V,'Mysterious Treasure FLI','Psychic Energy SVE','Float Stone BKT']})),multi('card-0','card-1'));
  }
});

test('paper Astral target capability is exact, optional at worker boundary, and protocol-bound when present',()=>{
  for(const profile of profiles)for(const seat of [0,1]){
    const hooked={...profile,paperAstralBarrageTargets:'agent4-cre74-hook-v1'};
    protocol.validateInit(init(hooked,seat));
    factory(hooked,seat);
    const wrong={...profile,paperAstralBarrageTargets:'agent4-cre74-hook-v2'};
    assert.throws(()=>factory(wrong,seat));
  }
});

test('going-first initial setup preserves hand-entry triggers while going-second insurance survives',()=>{
  const cases=[
    {hand:[V,R],first:multi('card-0'),second:multi('card-0','card-1')},
    {hand:[V,L],first:multi('card-0'),second:multi('card-0','card-1')},
    {hand:['Girafarig LOT',L],first:multi('card-0'),second:multi('card-0','card-1')},
    {hand:['Mimikyu GRI',L],first:multi('card-0'),second:multi('card-0','card-1')},
    {hand:['Marshadow UNB',L],first:multi('card-0'),second:multi('card-0','card-1')},
    {hand:[V,D],first:multi('card-0','card-1'),second:multi('card-0','card-1')},
    {hand:[V,V],first:multi('card-0','card-1'),second:multi('card-0','card-1')},
    {hand:[V,R,A],first:multi('card-0','card-2'),second:multi('card-0','card-2')}
  ];
  for(const profile of profiles)for(const seat of [0,1]){
    for(const row of cases){
      // Turn ownership is a public fact established by GO_FIRST before setup.
      assert.deepEqual(choose(profile,setup(seat,row.hand,{turnSeat:seat})),row.first,
        profile.profileId+' first seat '+seat+' '+row.hand.join('/'));
      assert.deepEqual(choose(profile,setup(seat,row.hand,{turnSeat:1-seat})),row.second,
        profile.profileId+' second seat '+seat+' '+row.hand.join('/'));
    }
    // An unknown starting orientation retains the original insurance policy.
    assert.deepEqual(choose(profile,setup(seat,[V,R])),multi('card-0','card-1'));
    assert.deepEqual(choose(profile,setup(seat,['Girafarig LOT',L])),multi('card-0','card-1'));
  }
});
