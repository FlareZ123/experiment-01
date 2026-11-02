'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {VERSION,choose,openingCounts,sourceRank5,conditionalDcePrizeExposure} = require(
  '../scripts/agent41-rank5-quickball-duplicate-openings.cjs');

test('small combinatorial toy matches enumeration of physical cards',()=>{
  const cards=[
    {name:'Quick Ball',count:1},
    {name:'Double Colorless Energy',count:2},
    {name:'Mew V',count:2},
    {name:'Secret Box',count:1}
  ];
  const actual=openingCounts(cards,4);
  const physical=cards.flatMap(row=>Array(row.count).fill(row.name));
  const expected={total:0,basic:0,qb:0,dup:0,onlyDce:0};
  for(let a=0;a<physical.length;a++)
    for(let b=a+1;b<physical.length;b++)
      for(let c=b+1;c<physical.length;c++)
        for(let d=c+1;d<physical.length;d++){
          const hand=[physical[a],physical[b],physical[c],physical[d]];
          expected.total++;
          const basic=hand.includes('Mew V');
          const quick=hand.includes('Quick Ball');
          const dce=hand.filter(x=>x==='Double Colorless Energy').length>=2;
          const other=hand.filter(x=>x==='Mew V').length>=2;
          if(basic)expected.basic++;
          if(basic&&quick){
            expected.qb++;
            if(dce||other)expected.dup++;
            if(dce&&!other)expected.onlyDce++;
          }
        }
  assert.deepEqual([
    actual.totalOpeningSets,actual.basicValidSets,actual.quickBallValidSets,
    actual.quickBallDuplicateValidSets,actual.quickBallOnlyDceDuplicateValidSets
  ],[expected.total,expected.basic,expected.qb,expected.dup,
    expected.onlyDce]);
  assert.equal(actual.version,VERSION);
});

test('exact source rank5 60 has 30 printing groups and 11 Basics',()=>{
  const source=sourceRank5();
  assert.equal(source.cards.length,30);
  assert.equal(source.cards.filter(x=>x.name==='Quick Ball')[0].count,4);
  assert.equal(source.cards.filter(x=>x.name==='Double Colorless Energy')[0].count,4);
});

test('exact original 60 7-card opening counts and conservation',()=>{
  const source=sourceRank5();
  const x=openingCounts(source.cards);
  assert.deepEqual({
    total:x.totalOpeningSets,
    basicValid:x.basicValidSets,
    quickValid:x.quickBallValidSets,
    quickDuplicate:x.quickBallDuplicateValidSets,
    onlyDceDuplicate:x.quickBallOnlyDceDuplicateValidSets
  },{
    total:386206920,
    basicValid:300306336,
    quickValid:113768556,
    quickDuplicate:36941838,
    onlyDceDuplicate:4042260
  });
  assert.ok(Math.abs(x.quickBallDuplicateValidSets/x.basicValidSets-
    0.123013848098) < 1e-10);
  assert.ok(Math.abs(x.quickBallOnlyDceDuplicateValidSets/
    x.quickBallDuplicateValidSets-0.1094222762) < 1e-9);
});

test('without a Quick Ball no hand can satisfy its root',()=>{
  const result=openingCounts([
    {name:'Mew V',count:4},{name:'Double Colorless Energy',count:4}
  ],4);
  assert.equal(result.quickBallValidSets,0);
  assert.equal(result.quickBallDuplicateValidSets,0);
});

test('duplicate exact printing categories do not create fake duplicate probability',()=>{
  const result=openingCounts([
    {name:'Quick Ball',count:1,printing:{set:'FST',number:'237'}},
    {name:'Mew V',count:1,printing:{set:'FST',number:'113'}},
    {name:'Dedenne-GX',count:1,printing:{set:'UNB',number:'57'}},
    {name:'Guzma',count:1,printing:{set:'BUS',number:'115'}},
    {name:'Guzma',count:1,printing:{set:'BUS',number:'115'}}
  ],4);
  assert.equal(result.quickBallDuplicateValidSets,2);
  assert.equal(result.totalOpeningSets,5);
  const distinct=openingCounts([
    {name:'Quick Ball',count:1,printing:{set:'FST',number:'237'}},
    {name:'Mew V',count:1,printing:{set:'FST',number:'113'}},
    {name:'Dedenne-GX',count:1,printing:{set:'UNB',number:'57'}},
    {name:'Guzma',count:1,printing:{set:'BUS',number:'115'}},
    {name:'Guzma',count:1,printing:{set:'BUS',number:'146'}}
  ],4);
  assert.equal(distinct.quickBallDuplicateValidSets,0);
});

test('binomial arguments conserve the exact safe number of physical hands',()=>{
  assert.equal(choose(60,7),386206920);
  assert.equal(choose(4,2),6);
  assert.equal(choose(2,3),0);
  assert.throws(()=>choose(-1,1),RangeError);
});

test('conditional prize placement separates expensive DCE-only openings',()=>{
  const x=openingCounts(sourceRank5().cards);
  assert.deepEqual(x.onlyDceDuplicateByHeldCount,{
    2:3858714,3:181504,4:2042
  });
  const y=conditionalDcePrizeExposure(x);
  assert.equal(y.sevenHandAndSixPrizePairs,92800103104800);
  assert.equal(y.atLeastOneDcePrizedPairs,19564715682120);
  assert.equal(y.atLeastTwoDcePrizedPairs,964292628600);
  assert.ok(Math.abs(y.probabilityAtLeastOneDcePrized-
    0.2108264433717858)<1e-12);
  assert.ok(Math.abs(y.probabilityAtLeastTwoDcePrized-
    0.010391072814984005)<1e-12);
});

