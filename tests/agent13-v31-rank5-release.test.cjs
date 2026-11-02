'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,sourceWitness,physicalPairStatus,runRelease}=
  require('../simulation/evaluation/agent13-v31-rank5-corrected-root-release.cjs');

test('external registration, selected profile and pinned code bytes agree',()=>{
  const {registration,profile}=preflight();
  assert.equal(profile.sourceRank,5);
  assert.equal(registration.plannedArms,16);
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

test('post-outcome native status evidence separates engine terminals, caps and aborts',()=>{
  const trial={candidateSlot:'A'};
  const terminal=sourceWitness({trial,finished:true,
    endReason:'engine-game-end'});
  assert.equal(terminal.status,'ENGINE_TERMINAL_UNQUALIFIED');
  assert.equal(terminal.statusEvidence,'native-finished-and-endReason');
  assert.equal(terminal.nativeFinished,true);
  assert.equal(terminal.nativeEndReason,'engine-game-end');
  assert.equal(terminal.competitiveGameQualified,false);

  const cap=sourceWitness({trial,finished:false,endReason:'action-limit'});
  assert.equal(cap.status,'CENSORED');
  assert.equal(cap.statusEvidence,'native-finished-and-endReason');
  assert.equal(cap.competitiveGameQualified,false);

  const abort=sourceWitness({trial,status:'engine-physical-invalid',
    error:'native invalid action',finished:false,endReason:'action-limit'});
  assert.equal(abort.status,'engine-physical-invalid');
  assert.equal(abort.statusEvidence,'native-error-status');
  assert.equal(abort.nativeError,'native invalid action');

  const unknown=sourceWitness({trial,finished:true,endReason:'unexpected'});
  assert.equal(unknown.status,'UNVERIFIED');
  assert.equal(unknown.statusEvidence,'unmatched-native-disposition');
});

test('only exact native source physical fingerprints authorize controlled labels',()=>{
  assert.equal(physicalPairStatus({sourceDealFingerprint:'x'},
    {sourceDealFingerprint:'x'}),'EXACT_SOURCE_DEAL_MATCH');
  assert.equal(physicalPairStatus({sourceDealFingerprint:'x'},
    {sourceDealFingerprint:'y'}),'SOURCE_DEAL_DIFFERENT');
  assert.equal(physicalPairStatus({},{}),'UNVERIFIED');
});

test('two policy modes retain all eight authentic registered arms including native errors',()=>{
  const orders=[];
  let mode=0;
  const result=runRelease({pinNative:false,runDevelopment:opts=>{
    mode++;
    assert.equal(opts.registeredTrials.length,8);
    assert.equal(opts.actorOnlyComposition,true);
    if(mode===1)assert.equal(opts.actorMewGenesectTechnoBlast,undefined);
    else assert.equal(opts.actorMewGenesectTechnoBlast,true);
    orders.push(opts.registeredFrameName);
    const rows=opts.registeredTrials.map((trial,i)=>({
      trial,status:i===7?'native-error':'action-cap',
      sourceDealFingerprint:i===2&&mode===2?'mismatch':'source-'+i,
      attackDeclarations:{source:mode===2?1:0},
      actorOnlyDecisionCoverage:{detailedComponentAudits:{
        chooseAttack:{selections:[]}
      }}
    }));
    return {attempted:8,rows};
  }});
  assert.equal(result.attempted,16);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.comparisons.length,8);
  assert.equal(result.comparisons[0].controlledSameSourceDeal,
    'EXACT_SOURCE_DEAL_MATCH');
  assert.equal(result.comparisons[2].controlledSameSourceDeal,
    'SOURCE_DEAL_DIFFERENT');
  assert.equal(result.comparisons[2].observedAttackDelta,null);
  assert.equal(result.comparisons[7].baseline.status,'native-error');
  assert.equal(result.modes.integratedV3.attempts.length,8);
  assert.equal(orders.length,2);
});

 test('corrected release maintains independent printed-source groups across both seats',()=>{
  const {registration,profile}=preflight();
  assert.equal(registration.registeredGroups.length,4);
  assert.deepEqual(registration.registeredGroups.map(x=>x.candidateSlot),
    ['A','B','A','B']);
  assert.equal(new Set(registration.registeredGroups.map(x=>x.seed)).size,4);
  assert.equal(profile.effectiveSelectedCodeBlobShas
    ['simulation/twinleaf/agent34-actor-only-root-policy.cjs'],
    '735ee6728e6b6103bd38374fcef60793be31690d');
});
