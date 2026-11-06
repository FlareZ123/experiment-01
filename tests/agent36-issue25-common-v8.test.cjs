'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {SELECTED_OUTER_TO_INNER}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {ROOT_FLAG}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');
const {ROOT_LIMIT,VERSION,trials,summarizeNativeAttempt,
  runStewardBroaderV8}=
  require('../simulation/evaluation/agent36-issue25-common-v8.cjs');

/** @returns {Record<string,Function>} */
function inertLayers(){
  return Object.fromEntries(SELECTED_OUTER_TO_INNER.slice(0,-1)
    .map(name=>[name,next=>({result:next(),audit:{name}})]));
}
test('prospective registered four independent ranks retain eight unique dual printed candidate decks',()=>{
  const list=trials();
  assert.equal(list.length,8);
  assert.deepEqual([...new Set(list.map(t=>t.rank))],[6,11,1,3]);
  assert.equal(new Set(list.map(t=>t.id)).size,8);
  assert.equal(new Set(list.map(t=>t.seed)).size,4);
  assert.equal(ROOT_LIMIT,128);
});
test('v8 passes unchanged both-seat owner algorithms to registered 128-root native runner',()=>{
  const env={};
  let seen=null;
  const output=runStewardBroaderV8({
    env,layers:inertLayers(),
    attackLayer:next=>({result:next(),audit:{ownerAttack:true}}),
    ownerLayer:next=>({result:next(),audit:{ownerPrize:true}}),
    globalVoltLayer:next=>({result:next(),audit:{commonBothSeats:true}}),
    runner:options=>{
      assert.equal(env[ROOT_FLAG],'true');
      seen=options;
      return {
        sourceIndependentCommonPolicyOptIn:true,
        rows:options.registeredTrials.map(trial=>({
          trial,status:'native-capped-128',
          rootActionLedger:Array.from({length:128},(_,n)=>({
            actionOrdinal:n,playerSlot:0,action:'PassTurnAction'
          })),
          sourceSeat:trial.candidateSlot==='A'?1:0,
          candidateSeat:trial.candidateSlot==='A'?0:1,
          sourceDealFingerprint:'fresh-source-'+trial.id,
          fullPhysicalDealFingerprint:'fresh-entire-'+trial.id,
          sourceAttackSettlement:{attacks:[]}
        }))
      };
    }
  });
  assert.equal(Object.hasOwn(env,ROOT_FLAG),false);
  assert.equal(seen.nativeRootActionLimit,128);
  assert.equal(seen.actorOnlyComposition,true);
  assert.equal(seen.sourceIndependentCommonPolicy,true);
  assert.equal(seen.allowAdditionalOriginalSourceRanks,true);
  assert.equal(seen.bilateralSpecialEnergyRoot,true);
  assert.equal(seen.nativeAcceptedTargets,true);
  assert.equal(seen.registeredFrameName,
    'agent36-issue25-broader-prospective-common-v8-128root-v1');
  assert.deepEqual(seen.registeredTrials.map(t=>t.rank),[6,6,11,11,1,1,3,3]);
  assert.equal(output.manifest.version,VERSION);
  assert.equal(output.manifest.nativeRootActionLimit,128);
  assert.equal(output.diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(output.diagnostic.actualAttemptRows.length,8);
  assert.ok(output.diagnostic.actualAttemptRows.every(x=>
    x.acceptedNativeRootCount===128&&
    x.completedSettledSourceAttacks===0));
  assert.equal(output.manifest.releaseQualified,false);
  assert.equal(output.diagnostic.competitiveGamesQualified,0);
  assert.ok(output.manifest.resolvedSourceAndPolicyHashes
    .every(x=>/^[a-f0-9]{64}$/.test(x.sha256)));
});

test('v8 native outcome summary distinguishes natural terminals, root caps and errors',()=>{
  const terminal=summarizeNativeAttempt({
    id:'terminal',candidateSeat:1,sourceSeat:0,winner:1,
    finished:true,endReason:'prizes',actionCount:110,rootActionCount:110,
    rootActionLedger:Array.from({length:110},(_,n)=>({actionOrdinal:n})),
    finalPrizes:[0,0],finalBoard:{active:['A','B']}
  },{id:'terminal',status:'returned-unqualified',candidateSeat:1});
  assert.equal(terminal.status,'native-terminal-unqualified');
  assert.equal(terminal.nativeOutcome,'native-terminal');
  assert.equal(terminal.actionCount,110);
  assert.equal(terminal.acceptedNativeRootCount,110);
  assert.equal(terminal.finished,true);
  assert.equal(terminal.winner,1);
  assert.equal(terminal.endReason,'prizes');
  assert.equal(terminal.terminalWinnerMatchesCandidate,true);
  assert.deepEqual(terminal.finalPrizes,[0,0]);
  assert.deepEqual(terminal.finalBoard,{active:['A','B']});

  const capped=summarizeNativeAttempt({
    id:'capped',candidateSeat:0,finished:false,actionCount:128,
    rootActionCount:128,
    rootActionLedger:Array.from({length:128},(_,n)=>({actionOrdinal:n}))
  },{id:'capped',status:'returned-unqualified',candidateSeat:0});
  assert.equal(capped.status,'root-cap-unqualified');
  assert.equal(capped.nativeOutcome,'action-cap');

  const aborted=summarizeNativeAttempt({
    id:'aborted',rootActionLedger:[],
    nativeAbortProvenance:{aborted:true}
  },{id:'aborted',status:'engine-error'});
  assert.equal(aborted.status,'engine-error');
  assert.equal(aborted.nativeOutcome,'engine-error');
});
