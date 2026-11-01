'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {reconcileNightWatchNonceRoots}=require(
  '../simulation/evaluation/agent12-nightwatch-native-nonce-reconcile.cjs');

/** @returns {object} One authentic-shaped named-root/native-sampler receipt. */
function fixture(){
  return {uniform:[{trial:{id:'11:2:A:new-moon-lockbreaker-v1'},
    nightWatchPromptReceipts:[{
      ordinal:70,turn:46,actorSeat:0,ownerSeat:1,
      opponentHandSizeBefore:23,selectedCount:2,
      nativePromptMin:2,nativePromptMax:2
    }]}],randomHookAudit:{structuralCandidates:1,events:[{
      promptId:147,turn:46,actorId:101,
      opponentHandCount:23,selectedCount:2,
      positions:[17,5],nonce:'[46,"101","147"]'
    }]}};
}

test('original native source root joins one stable actor prompt without revealing hidden cards',()=>{
  const evidence=reconcileNightWatchNonceRoots(fixture());
  assert.equal(evidence.genuineNightWatchRoots,1);
  assert.equal(evidence.matchedSourceRoots,1);
  assert.equal(evidence.uniqueObservedRandomNonces,1);
  assert.equal(evidence.matches[0].rootOrdinal,70);
  assert.equal(evidence.actualNativePromptIdToRootOrdinalVerified,false);
  assert.equal(evidence.independentPrintedPaperRandomnessCertified,false);
  assert.equal(JSON.stringify(evidence).includes('positions'),false);
});

test('postgame sampled physical printings must match Store accepted physical cards',()=>{
  const x=fixture();
  x.uniform[0].nightWatchPromptReceipts[0].selectedNames=['A','B'];
  x.randomHookAudit.events[0].postGameSelectedPrintings=['B','A'];
  const valid=reconcileNightWatchNonceRoots(x);
  assert.equal(valid.exactPostgamePhysicalPairsMatched,1);
  assert.equal(valid.allActualPhysicalPairsMatched,true);
  x.randomHookAudit.events[0].postGameSelectedPrintings=['A','C'];
  assert.throws(()=>reconcileNightWatchNonceRoots(x),
    /physical objects differ from actual accepted/);
});

test('speculative extra structural prompt cannot masquerade as accepted live root',()=>{
  const x=fixture();
  x.randomHookAudit.structuralCandidates=2;
  x.randomHookAudit.events.push({...x.randomHookAudit.events[0],
    promptId:148,nonce:'[46,"101","148"]'});
  assert.throws(()=>reconcileNightWatchNonceRoots(x),
    /does not equal genuine named roots/);
});

test('wrong source player and unmatched turn reject false prompt attribution',()=>{
  const x=fixture();
  x.uniform[0].nightWatchPromptReceipts[0].ownerSeat=0;
  assert.throws(()=>reconcileNightWatchNonceRoots(x),/opposing player hand/);
  const y=fixture();
  y.randomHookAudit.events[0].turn=45;
  y.randomHookAudit.events[0].nonce='[45,"101","147"]';
  assert.throws(()=>reconcileNightWatchNonceRoots(y),/No unique matching live root/);
});

test('duplicate or malformed sampling nonce cannot qualify physical random selection',()=>{
  const x=fixture();
  x.randomHookAudit.events[0].nonce='7|0';
  assert.throws(()=>reconcileNightWatchNonceRoots(x),/stable prompt signature/);
  const y=fixture();
  y.randomHookAudit.events[0].positions=[5,5];
  assert.throws(()=>reconcileNightWatchNonceRoots(y),/Expected values to be strictly equal/);
});

test('same turn and seat ambiguous two genuine root candidates must fail closed',()=>{
  const x=fixture();
  const additional={...x.uniform[0].nightWatchPromptReceipts[0],ordinal:71};
  x.uniform[0].nightWatchPromptReceipts.push(additional);
  x.randomHookAudit.structuralCandidates=2;
  x.randomHookAudit.events.push({...x.randomHookAudit.events[0],
    promptId:148,nonce:'[46,"101","148"]'});
  assert.throws(()=>reconcileNightWatchNonceRoots(x),
    /No unique matching live root/);
});
