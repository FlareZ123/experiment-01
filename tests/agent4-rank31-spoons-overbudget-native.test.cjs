'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {probePainfulSpoonsCounterBudget}=require(
  '../simulation/twinleaf/agent4-rank31-spoons-overbudget-native.cjs');

test('source rank31 contains physical printed Radiant Alakazam SIT59 Ability',()=>{
  const document=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const source=document.decks.find(x=>x.rank===31);
  assert.equal(source.player,'Yuhi Yokoyama');
  const c=source.cards.find(x=>x.name==='Radiant Alakazam');
  assert.deepEqual([c.count,c.printing.set,c.printing.number],
    [1,'SIT','59']);
});

test('native rank31 genuine Painful Spoons 0 to 3 same-source counter replies and two-Prize consequences are recorded on both seats',()=>{
  for(const seat of [0,1]){
    for(const count of [0,1,2,3]){
      const nativeResult=probePainfulSpoonsCounterBudget({
        seat,count,guarded:false
      });
      const paperResult=probePainfulSpoonsCounterBudget({
        seat,count,guarded:true
      });
      console.log('AGENT4_RANK31_SPOONS_COUNT_NATIVE '+
        JSON.stringify({nativeResult,paperResult}));
      assert.equal(nativeResult.seat,seat);
      assert.equal(paperResult.seat,seat);
      assert.equal(nativeResult.count,count);
      assert.equal(paperResult.count,count);
      assert.equal(nativeResult.ownerPrinted,'Radiant Alakazam SIT59 rank31');
      assert.equal(paperResult.ownerPrinted,nativeResult.ownerPrinted);
      assert.equal(nativeResult.nativeOptions.max,2);
      assert.equal(paperResult.nativeOptions.max,2);
      assert.equal(paperResult.guarded,true);
      assert.equal(nativeResult.guarded,false);
    }
  }
});
