'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {scheduledArms,pairs,assertManifest,gitBlobSha} =
  require('../simulation/evaluation/agent41-crossrank-actual-decisions.cjs');

test('frozen exact source inventory and New Moon printing proxy retained',()=>{
  assert.doesNotThrow(assertManifest);
  assert.match(gitBlobSha('results/aichi-2026/full-decklists.json'),/^[a-f0-9]{40}$/);
});

test('48 preregistered pair arms across two distinct hard archetypes',()=>{
  const arms=scheduledArms();
  assert.equal(arms.length,48);
  assert.equal(new Set(arms.map(x=>x.id)).size,48);
  assert.equal(new Set(arms.map(x=>x.seed)).size,24);
  for(const rank of [6,11]) {
    assert.equal(arms.filter(x=>x.rank===rank).length,24);
    for(const seat of ['A','B'])
      assert.equal(arms.filter(x=>x.rank===rank&&x.candidateSlot===seat).length,12);
  }
});

test('paired source-hand comparator rejects seed match without actual source-hand equality',()=>{
  const left={rank:6,repeat:0,candidateSlot:'A',id:'reference',status:'engine-terminal',
    verifiedFirstTurn:true,sourceActuallyFirst:false,
    sourceFirstRecordedOwnHandSha256:'alice',engineFinished:true};
  const right={...left,id:'challenger',engineFinished:false};
  assert.equal(pairs([left,right])[0].sameActualFirstAndSourceOwnHand,true);
  assert.equal(pairs([left,{...right,sourceFirstRecordedOwnHandSha256:'bob'}])[0]
    .sameActualFirstAndSourceOwnHand,false);
  assert.equal(pairs([left,{...right,sourceActuallyFirst:true}])[0]
    .sameActualFirstAndSourceOwnHand,false);
  assert.equal(pairs([left,{...right,status:'engine-error'}])[0]
    .sameActualFirstAndSourceOwnHand,false);
  assert.equal(pairs([left])[0].sameActualFirstAndSourceOwnHand,false);
});
