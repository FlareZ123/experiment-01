'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {nativeDispatchAbortEvidence,VERSION} =
  require('../simulation/twinleaf/native-dispatch-abort-evidence.cjs');

const digest = '1'.repeat(64);
function sample() {
  return {
    actionOrdinal:2,actionName:'AttackAction',turnBefore:9,
    phaseBefore:2,actingSeat:1,attackName:'Call for Family',
    attackingPokemon:'Trubbish FST',errorMessage:'NO_BENCH_SLOTS_AVAILABLE',
    sourceDeal:{seat:0,digestSha256:digest},
    rootActionLedger:[
      {actionOrdinal:0,turnBefore:1,playerSlot:0,action:'PlayCardAction',card:'Ultra Ball'},
      {actionOrdinal:1,turnBefore:1,playerSlot:1,action:'ResolvePromptAction'}
    ],
    preDispatchPublic:{turn:9,players:[{handSize:2},{handSize:5}]},
    preDispatchBoard:[{active:{name:'Mega Absol ex'},bench:[]},
      {active:{name:'Trubbish'},bench:Array.from({length:5},(_,i)=>({name:'X'+i}))]
  };
}

test('preserves accepted native root chronology and source-deal digest after a failed attack',()=>{
  const input=sample();
  const output=nativeDispatchAbortEvidence(input);
  assert.equal(output.schema,VERSION);
  assert.equal(output.rootActionCount,2);
  assert.deepEqual(output.rootActionLedger,input.rootActionLedger);
  assert.equal(output.sourceDealFingerprint.digestSha256,digest);
  assert.equal(output.rootActionLedgerSha256,
    createHash('sha256').update(JSON.stringify(input.rootActionLedger)).digest('hex'));
  assert.equal(output.attackingPokemon,'Trubbish FST');
  assert.equal(output.attackName,'Call for Family');
  assert.equal(output.legacyLedgerOmitsPhysicalTargets,true);
  assert.equal(output.physicalActionParityCertified,false);
  assert.equal(output.competitiveGameQualified,false);
});

test('detaches snapshots before any engine mutation and retains only public fields',()=>{
  const input=sample();
  const output=nativeDispatchAbortEvidence(input);
  input.preDispatchBoard[1].bench[0].name='mutated after throw';
  input.rootActionLedger[0].card='changed';
  assert.equal(output.preDispatchBoard[1].bench[0].name,'X0');
  assert.equal(output.rootActionLedger[0].card,'Ultra Ball');
  for(const forbidden of ['handPrintings','deckPrintings','prizePrintings',
    'opponentHand','privateSourcePositions']) {
    assert.equal(Object.hasOwn(output,forbidden),false);
  }
});

test('never fabricates a source deal or accepted roots when their observers were disabled',()=>{
  const input=sample();
  input.actionOrdinal=0;
  input.sourceDeal=null;
  input.rootActionLedger=null;
  const output=nativeDispatchAbortEvidence(input);
  assert.equal(output.sourceDealFingerprint,null);
  assert.equal(output.rootActionCount,null);
  assert.equal(output.rootActionLedgerSha256,null);
  assert.equal(output.rootActionLedger,null);
});

test('rejects dishonest root counts and invalid digest types',()=>{
  const input=sample();
  input.actionOrdinal=3;
  assert.throws(()=>nativeDispatchAbortEvidence(input),/2 !== 3/);
  input.actionOrdinal=2;
  input.sourceDeal.digestSha256='not-a-digest';
  assert.throws(()=>nativeDispatchAbortEvidence(input));
});

test('non-AttackAction failures do not inherit a stale attack label',()=>{
  const input=sample();
  input.actionName='PlayCardAction';
  const output=nativeDispatchAbortEvidence(input);
  assert.equal(output.attackName,null);
  assert.equal(output.attackingPokemon,null);
});
