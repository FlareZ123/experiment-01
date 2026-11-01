'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  runRank31RoxieSpoons,probeRoxieChoiceIndexShift,
  probeRoxieForbiddenGXPayment
}=require('../simulation/twinleaf/agent4-rank31-roxie-koffing-spoons-native.cjs');

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
  assert.equal(a.roxieDrawnThree,true);
  assert.equal(b.roxieDrawnThree,true);
  for(const result of [a,b]){
    const prompts=result.evidence.filter(e=>e.phase==='Roxie'&&
      e.type==='ChooseCardsPrompt');
    assert.equal(prompts.length,1);
    assert.deepEqual(prompts[0].blocked,[1]);
    assert.equal(prompts[0].nativeValidatorAccepted,true,
      'The triad uses the paper-valid Roxie-last hand order');
  }
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

test('rank31 physical Roxie-Koffing-Alakazam native Prize veto also holds when source is in seat 1',()=>{
  const original=runRank31RoxieSpoons(false,1);
  const paper=runRank31RoxieSpoons(true,1);
  assert.equal(original.seat,1);
  assert.equal(paper.seat,1);
  assert.deepEqual(original.afterBomb,[10,10,190]);
  assert.deepEqual(paper.afterBomb,original.afterBomb);
  assert.equal(original.physicalKoffingDiscarded,true);
  assert.equal(paper.physicalKoffingDiscarded,true);
  assert.equal(original.roxieDrawnThree,true);
  assert.equal(paper.roxieDrawnThree,true);
  assert.equal(original.allowed,true);
  assert.equal(original.rejected,null);
  assert.equal(original.victimInDiscard,true);
  assert.equal(original.prizesTaken,2);
  assert.equal(paper.allowed,false);
  assert.match(paper.rejected,/PAPER_PAINFUL_SPOONS_REJECTED/);
  assert.equal(paper.victimInDiscard,false);
  assert.equal(paper.prizesTaken,0);
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

test('preregistered real rank31 Roxie forbidden-GX Store reply is observed on both physical seats',()=>{
  for(const seat of [0,1]){
    const result=probeRoxieForbiddenGXPayment(seat);
    console.log('AGENT4_ROXIE_GX_NATIVE '+JSON.stringify(result));
    assert.equal(result.seat,seat);
    assert.equal(result.selectedPrinting,'Tapu Lele-GX GRI');
    assert.equal(result.printedRoxieDisallowsPokemonGX,true);
    assert.equal(result.validatorAccepted,false);
    assert.ok(result.blocked.length>=1);
    assert.ok(result.physicalCardsDrawn>=0);
  }
});
