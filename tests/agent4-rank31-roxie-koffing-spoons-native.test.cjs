'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {runRank31RoxieSpoons,probeRoxieChoiceIndexShift}=require(
  '../simulation/twinleaf/agent4-rank31-roxie-koffing-spoons-native.cjs');

test('the authenticated published rank31 source physically plays all three required printing families',()=>{
  const d=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'))
    .decks.find(x=>x.rank===31);
  for(const [name,count,set,number] of [
    ['Roxie',4,'CEC','205'],['Koffing',3,'CEC','76'],
    ['Radiant Alakazam',1,'SIT','59']]){
    const row=d.cards.find(x=>x.name===name);
    assert.deepEqual(
      [row.count,row.printing.set,row.printing.number],
      [count,set,number]);
  }
});

test('one native Roxie-Koffing Bomb sets up the printed single-source veto before Radiant Alakazam',()=>{
  const a=runRank31RoxieSpoons(false);
  const b=runRank31RoxieSpoons(true);
  assert.deepEqual(a.afterBomb,[10,10,190]);
  assert.deepEqual(b.afterBomb,a.afterBomb);
  assert.equal(a.physicalKoffingDiscarded,true);
  assert.equal(b.physicalKoffingDiscarded,true);
  assert.equal(a.roxieDiscarded,true);
  assert.equal(b.roxieDiscarded,true);
  assert.equal(a.allowed,true);
  assert.equal(a.rejected,null);
  assert.equal(a.victimInDiscard,true);
  assert.equal(a.prizesTaken,2);
  assert.equal(b.allowed,false);
  assert.match(b.rejected,/PAPER_PAINFUL_SPOONS_REJECTED/);
  assert.equal(b.promptPending,true);
  assert.equal(b.victimInDiscard,false);
  assert.equal(b.prizesTaken,0);
});

test('pinned Roxie ChooseCards treats identical genuine Koffing differently by original hand position',()=>{
  const first=probeRoxieChoiceIndexShift(true);
  const last=probeRoxieChoiceIndexShift(false);
  assert.deepEqual(first.hand,['Koffing CEC']);
  assert.deepEqual(last.hand,['Koffing CEC']);
  assert.deepEqual(first.blocked,[0]);
  assert.equal(first.validatorAccepted,false);
  assert.equal(last.validatorAccepted,true);
  assert.equal(first.nativeStoreError,null,
    'Original Store bypasses prompt.validate despite blocked Koffing');
  assert.equal(last.nativeStoreError,null);
  assert.equal(first.promptSettled,true);
  assert.equal(last.promptSettled,true);
});
