'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,sourceAttackCount,witness,runTransport}=
  require('../simulation/evaluation/agent13-rank5-joint-transport-20261103.cjs');

test('pinned joint profile preregisters exactly four rank5 trials and sixteen attempts',()=>{
  const {design,base,trials}=preflight();
  assert.equal(design.registeredAttempts,16);
  assert.equal(trials.length,4);
  assert.equal(base.policyOptions.actorOnlyComposition,true);
});

test('source attack declarations have explicit supported number/array representations',()=>{
  assert.equal(sourceAttackCount({attackDeclarations:{source:2}}),2);
  assert.equal(sourceAttackCount({attackDeclarations:{source:[{},{}]}}),2);
  assert.equal(sourceAttackCount({attackDeclarations:{}}),null);
});

test('owner-specific witness includes copy and evolution without certifying payment',()=>{
  const row={rootActionLedger:[
    {playerSlot:1,action:'PlayCardAction',card:'Mew VMAX FST',actionOrdinal:5,turnBefore:4},
    {playerSlot:0,action:'PlayCardAction',card:'Mew VMAX FST',actionOrdinal:6,turnBefore:4},
    {playerSlot:1,action:'PassTurnAction',actionOrdinal:7,turnBefore:4}
  ],attackDeclarations:{source:1},actorOnlyDecisionCoverage:{
    detailedComponentAudits:{chooseAttack:{selections:[
      {seat:1,printing:'Genesect V FST',attack:'Techno Blast',turn:4}
    ]}}}};
  const x=witness(row,'A');
  assert.equal(x.sourceMewVmaxRoots.length,1);
  assert.equal(x.sourceOwnerTechnoBlastCopies.length,1);
  assert.equal(x.sourceRootPassCount,1);
  assert.equal(x.paperPaymentCertified,false);
  assert.equal(x.qualifiedGame,false);
});

test('same-deal modes remain separate, raw native rows retained and no wins certified',()=>{
  const calls=[];
  const output=runTransport(options=>{
    calls.push(options);
    return {attempted:4,rows:options.registeredTrials.map((trial,i)=>({
      trial,finished:false,endReason:'action-limit',
      sourceDealFingerprint:'deal-'+trial.id,
      attackDeclarations:{source:
        options.actorOnlySingleSearch&&options.actorHandDiscard?2:0},
      rootActionLedger:[]
    }))};
  });
  assert.equal(calls.length,4);
  assert.deepEqual(calls.map(x=>[x.actorOnlySingleSearch,x.actorHandDiscard]),[
    [false,false],[true,false],[false,true],[true,true]
  ]);
  assert.equal(output.attempts,16);
  assert.equal(output.physicalVerifiedComparisons,4);
  assert.ok(output.comparisons.every(x=>
    x.evidence.map(y=>y.sourceAttackDeclarations).join(',')==='0,0,0,2'));
  assert.equal(output.modes[0].native.rows.length,4);
  assert.equal(output.paperCompetitiveGamesQualified,0);
});

test('identical native seeds with differing source physical fingerprints cannot pair',()=>{
  const output=runTransport(options=>({
    attempted:4,rows:options.registeredTrials.map((trial,i)=>({
      trial,sourceDealFingerprint:
        (options.actorHandDiscard?'changed-':'original-')+trial.id,
      finished:false,endReason:'action-limit',rootActionLedger:[]
    }))
  }));
  assert.equal(output.physicalVerifiedComparisons,0);
  assert.ok(output.comparisons.every(x=>
    x.physicalStatus==='UNVERIFIED_OR_DIFFERENT'));
});
