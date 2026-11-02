'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,classifyNativeAttempt,sourceWitness,physicalPairStatus,runRelease}=
  require('../simulation/evaluation/agent13-v3-rank5-original-release.cjs');

test('external registration, selected profile and pinned code bytes agree',()=>{
  const {registration,profile}=preflight();
  assert.equal(profile.sourceRank,5);
  assert.equal(registration.plannedPhysicalNativeArms,8);
  assert.equal(profile.policyModes.frozenV2Control.options
    .actorMewGenesectTechnoBlast,undefined);
  assert.equal(profile.policyModes.integratedV3.options
    .actorMewGenesectTechnoBlast,true);
  assert.equal(profile.policyModes.integratedV3.options
    .actorNaturalEvolutionRoot,true);
});

test('source witness belongs to original physical seat and never self-qualifies',()=>{
  const row={trial:{candidateSlot:'B'},status:'engine-capped',
    sourceDealFingerprint:'physical-source-A',
    rootActionLedger:[{playerSlot:0,action:'PlayCardAction',
      card:'Mew VMAX FST',actionOrdinal:5},
      {playerSlot:1,action:'PlayCardAction',card:'Mew VMAX FST'}],
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      chooseAttack:{selections:[
        {seat:0,printing:'Genesect V FST',attack:'Techno Blast',turn:5},
        {seat:1,printing:'Genesect V FST',attack:'Techno Blast',turn:6}
      ]}
    }},attackDeclarations:{source:1}};
  const s=sourceWitness(row);
  assert.equal(s.sourceSeat,0);
  assert.equal(s.sourceMewVMAXPlayRoots.length,1);
  assert.equal(s.ownerSourceGenesectCopiedSelections.length,1);
  assert.equal(s.originalSourceAttackDeclarations,1);
  assert.equal(s.paperActionQualified,false);
  assert.equal(s.competitiveGameQualified,false);
});

test('actual engine dispositions classify every rank5 native attempt without claiming paper wins',()=>{
  const terminal={trial:{candidateSlot:'A'},finished:true,
    endReason:'engine-game-end',actionCount:115,winner:1};
  const capped={trial:{candidateSlot:'B'},finished:false,
    endReason:'action-limit',actionCount:260};
  const errored={trial:{candidateSlot:'B'},error:'Native Store failed',
    finished:false,endReason:null};
  const unknown={trial:{candidateSlot:'A'},finished:false,
    endReason:'nonstandard-procedure'};
  assert.equal(classifyNativeAttempt(terminal),'ENGINE_TERMINAL_UNQUALIFIED');
  assert.equal(classifyNativeAttempt(capped),'CENSORED');
  assert.equal(classifyNativeAttempt(errored),'NATIVE_ERROR');
  assert.equal(classifyNativeAttempt(unknown),'UNVERIFIED');
  const t=sourceWitness(terminal);
  assert.equal(t.status,'ENGINE_TERMINAL_UNQUALIFIED');
  assert.equal(t.rawNativeFinished,true);
  assert.equal(t.rawNativeEndReason,'engine-game-end');
  assert.equal(t.rawNativeActionCount,115);
  assert.equal(t.competitiveGameQualified,false);
  assert.equal(sourceWitness(capped).status,'CENSORED');
  assert.equal(sourceWitness(errored).status,'NATIVE_ERROR');
  assert.equal(sourceWitness(unknown).status,'UNVERIFIED');
});

test('only exact native source physical fingerprints authorize controlled labels',()=>{
  assert.equal(physicalPairStatus({sourceDealFingerprint:'x'},
    {sourceDealFingerprint:'x'}),'EXACT_SOURCE_DEAL_MATCH');
  assert.equal(physicalPairStatus({sourceDealFingerprint:'x'},
    {sourceDealFingerprint:'y'}),'SOURCE_DEAL_DIFFERENT');
  assert.equal(physicalPairStatus({},{}),'UNVERIFIED');
});

test('two policy modes retain all four authentic registered arms including native errors',()=>{
  const orders=[];
  let mode=0;
  const result=runRelease({pinNative:false,runDevelopment:opts=>{
    mode++;
    assert.equal(opts.registeredTrials.length,4);
    assert.equal(opts.actorOnlyComposition,true);
    if(mode===1)assert.equal(opts.actorMewGenesectTechnoBlast,undefined);
    else assert.equal(opts.actorMewGenesectTechnoBlast,true);
    orders.push(opts.registeredFrameName);
    const rows=opts.registeredTrials.map((trial,i)=>({
      trial,status:i===3?'native-error':'action-cap',
      sourceDealFingerprint:i===2&&mode===2?'mismatch':'source-'+i,
      attackDeclarations:{source:mode===2?1:0},
      actorOnlyDecisionCoverage:{detailedComponentAudits:{
        chooseAttack:{selections:[]}
      }}
    }));
    return {attempted:4,rows};
  }});
  assert.equal(result.attempted,8);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.comparisons.length,4);
  assert.equal(result.comparisons[0].controlledSameSourceDeal,
    'EXACT_SOURCE_DEAL_MATCH');
  assert.equal(result.comparisons[2].controlledSameSourceDeal,
    'SOURCE_DEAL_DIFFERENT');
  assert.equal(result.comparisons[2].observedAttackDelta,null);
  assert.equal(result.comparisons[3].baseline.status,'native-error');
  assert.equal(result.modes.integratedV3.attempts.length,4);
  assert.equal(orders.length,2);
});
