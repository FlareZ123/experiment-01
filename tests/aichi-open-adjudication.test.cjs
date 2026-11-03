'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  adjudicateAichiOpenAfterLastTurn:adjudicate,
  aichiOpenClockMinutes
}=require('../simulation/evaluation/aichi-open-adjudication.cjs');

test('official Open stage durations: Swiss and Top32 25, final 35',()=>{
  assert.equal(aichiOpenClockMinutes('swiss'),25);
  assert.equal(aichiOpenClockMinutes('top32'),25);
  assert.equal(aichiOpenClockMinutes('final'),35);
  assert.throws(()=>aichiOpenClockMinutes('master'),/stage/);
});

test('Swiss has a double loss when unresolved after the correct last turn',()=>{
  for(const normal of ['in-progress','tie']){
    assert.equal(adjudicate({stage:'swiss',normal}).status,'double-loss');
  }
  assert.equal(adjudicate({stage:'swiss',normal:'player-0-win'}).status,'player-0-win');
  assert.equal(adjudicate({stage:'swiss',normal:'player-1-win'}).status,'player-1-win');
});

test('Top32 and final compare lower Prize-needed score if either is at most two',()=>{
  for(const stage of ['top32','final']){
    assert.equal(adjudicate({stage,normal:'in-progress',prizesNeeded:[2,5]}).status,'player-0-win');
    assert.equal(adjudicate({stage,normal:'in-progress',prizesNeeded:[3,1]}).status,'player-1-win');
    assert.equal(adjudicate({stage,normal:'in-progress',prizesNeeded:[1,2]}).status,'player-0-win');
  }
});

test('Tied low scores and any two high scores need overtime',()=>{
  for(const stage of ['top32','final']){
    for(const prizesNeeded of [[1,1],[2,2],[3,3],[4,6],[6,4]]){
      assert.equal(adjudicate({stage,normal:'in-progress',prizesNeeded}).status,'overtime');
    }
  }
});

test('Ordinary drawn knockout result triggers independent six-Prize tiebreaker',()=>{
  for(const stage of ['top32','final']){
    assert.equal(adjudicate({stage,normal:'tie'}).status,'tiebreaker');
  }
});

test('Reject malformed game results or missing knockout Prize counts',()=>{
  assert.throws(()=>adjudicate({stage:'master',normal:'in-progress'}),/stage/);
  assert.throws(()=>adjudicate({stage:'top32',normal:'never-played'}),/result/);
  assert.throws(()=>adjudicate({stage:'top32',normal:'in-progress'}),/Prize counts/);
  assert.throws(()=>adjudicate({stage:'top32',normal:'in-progress',prizesNeeded:[0,1]}),/Prize counts/);
  assert.throws(()=>adjudicate({stage:'top32',normal:'in-progress',prizesNeeded:[2]}),/Prize counts/);
  assert.throws(()=>adjudicate({stage:'top32',normal:'in-progress',prizesNeeded:[7,4]}),/Prize counts/);
  assert.throws(()=>adjudicate({stage:'final',normal:'in-progress',prizesNeeded:[1,7]}),/Prize counts/);
});
