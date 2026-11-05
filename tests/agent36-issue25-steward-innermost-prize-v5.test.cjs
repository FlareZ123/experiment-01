'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {VERSION,withStewardInnermostOwnerPrompts,
  runStewardInnermostPrizeV5}=
  require('../simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs');

test('the inner native match wraps Prize inside owner Pokémon and restores export',()=>{
  const calls=[];
  const headless={runMatch:request=>{
    calls.push('native:'+request.label);
    return {state:'native-return'};
  }};
  const original=headless.runMatch;
  const outcome=withStewardInnermostOwnerPrompts(
    ()=>headless.runMatch({label:'registered:1'}),{
      headless,
      prize:next=>{
        calls.push('prize:enter');
        const result=next();
        calls.push('prize:exit');
        return {result,audit:{ownerPrizeChoiceSubmitted:1}};
      },
      pokemon:(next,opts)=>{
        calls.push('pokemon:enter');
        assert.equal(typeof opts.choose,'function');
        const result=next();
        calls.push('pokemon:exit');
        return {result,audit:{selected:1,accepted:1}};
      }
    });
  assert.deepEqual(calls,[
    'pokemon:enter','prize:enter','native:registered:1',
    'prize:exit','pokemon:exit'
  ]);
  assert.strictEqual(headless.runMatch,original);
  assert.equal(outcome.audit.nativeMatchCalls,1);
  assert.equal(outcome.audit.nativeMatchAttempts[0].status,'returned-unqualified');
  assert.equal(outcome.audit.nativeMatchAttempts[0].ownerPrizeAudit
    .ownerPrizeChoiceSubmitted,1);
  assert.equal(outcome.audit.nativeMatchAttempts[0].ownerPokemonAudit.accepted,1);
  assert.equal(outcome.audit.competitiveGamesQualified,0);
});

test('native throw keeps its attempted game and restores runMatch',()=>{
  const headless={runMatch:()=>{throw new Error('native decoder abort');}};
  const original=headless.runMatch;
  let captured=null;
  assert.throws(()=>withStewardInnermostOwnerPrompts(
    ()=>headless.runMatch({label:'registered-error'}),{
      headless,
      prize:next=>next(),
      pokemon:next=>next()
    }),/native decoder abort/);
  assert.strictEqual(headless.runMatch,original);
});

test('v5 uses exact eight selected v4 arms and remains unqualified',()=>{
  const layers=Object.fromEntries(
    SELECTED_OUTER_TO_INNER.slice(0,-1).map(name=>[
      name,next=>({result:next(),audit:{name}})
    ]));
  let actual=null;
  const selected=runStewardInnermostPrizeV5({
    innerLayer:next=>({result:next(),audit:{
      version:VERSION,nativeMatchCalls:8,nativeMatchAttempts:[],
      competitiveGamesQualified:0
    }}),
    layers,
    attackLayer:next=>({result:next(),audit:{}}),
    runner:options=>{
      actual=options;
      return {
        sourceIndependentCommonPolicyOptIn:true,
        rows:options.registeredTrials.map(trial=>({
          trial,status:'censored',
          sourceSeat:trial.candidateSlot==='A'?1:0,
          bilateralSpecialEnergyProfile:{mode:'both'}
        }))
      };
    }
  });
  assert.equal(actual.nativeRootActionLimit,48);
  assert.equal(actual.sourceIndependentCommonPolicy,true);
  assert.equal(actual.bilateralSpecialEnergyRoot,true);
  assert.equal(actual.registeredTrials.length,8);
  assert.equal(selected.manifest.version,VERSION);
  assert.equal(selected.diagnostic.selectedNativeAttempts.length,8);
  assert.equal(selected.diagnostic.completeRegisteredAttemptReconciliation,true);
  assert.equal(selected.diagnostic.innerNativeOwnerPromptAudit.nativeMatchCalls,8);
  assert.equal(selected.diagnostic.competitiveGamesQualified,0);
  assert.equal(selected.manifest.releaseQualified,false);
});
