'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {expectedRedealWindowValue}=
  require('../simulation/twinleaf/redeal-window-value.cjs');

/** Independently enumerate physical permutations of both card blocks. */
function brute(input) {
  let sum=0,count=0;
  const {knownFormerTop,unknownFormerDeck,oldPrizes,window,missValue,
    rewardByName}=input;
  /** @param {string[]} pool @param {string[]} chosen @param {Function} callback */
  function arrangements(pool,chosen,callback) {
    if(!pool.length) {callback(chosen);return;}
    for(let i=0;i<pool.length;i++)arrangements(
      [...pool.slice(0,i),...pool.slice(i+1)],
      [...chosen,pool[i]],callback);
  }
  arrangements(unknownFormerDeck,[],former=>{
    const postPrizes=[...knownFormerTop,...former].slice(oldPrizes.length);
    arrangements(oldPrizes,[],bottom=>{
      const search=[...postPrizes,...bottom].slice(0,window);
      sum+=search.reduce((best,name)=>Math.max(best,
        Object.hasOwn(rewardByName,name)?rewardByName[name]:missValue),
      missValue);
      count++;
    });
  });
  return sum/count;
}
const assumptions={uniformUnknownFormerOrder:true,
  uniformReturnedBottomOrder:true,noShuffleSinceRedeal:true};
const value=input=>expectedRedealWindowValue({...assumptions,...input});

test('redeal old Prized singleton becomes inaccessible before known bottom block',()=>{
  const base={knownFormerTop:[],unknownFormerDeck:Array(46).fill('E'),
    oldPrizes:['A',...Array(5).fill('E')],rewardByName:{A:1},missValue:0};
  assert.equal(value({...base,window:40}).expectedValue,0);
  assert.ok(Math.abs(value({...base,window:41}).expectedValue-1/6)<1e-12);
  assert.equal(value({...base,window:46}).expectedValue,1);
  const deckTarget={...base,unknownFormerDeck:['A',...Array(45).fill('E')],
    oldPrizes:Array(6).fill('E'),window:7};
  assert.ok(Math.abs(value(deckTarget).expectedValue-7/46)<1e-12);
});

test('known original top cards are either newly Prized or known next draws',()=>{
  const base={knownFormerTop:['A',...Array(5).fill('E')],
    unknownFormerDeck:Array(5).fill('E'),oldPrizes:Array(3).fill('E'),
    rewardByName:{A:5},missValue:0,window:6};
  assert.equal(value(base).expectedValue,0);
  const knownRemaining={...base,knownFormerTop:['E','E','E','A','E','E']};
  assert.equal(value({...knownRemaining,window:1}).expectedValue,5);
});

test('multi-tier probabilities agree with independent exhaustive permutations',()=>{
  for(const input of [
    {knownFormerTop:[],unknownFormerDeck:['A','B','C','D'],
      oldPrizes:['E','A'],window:2},
    {knownFormerTop:['C'],unknownFormerDeck:['A','B','D'],
      oldPrizes:['E','A'],window:3},
    {knownFormerTop:['C','A','B'],unknownFormerDeck:['D','E'],
      oldPrizes:['A','D'],window:4},
    {knownFormerTop:['C','A','B'],unknownFormerDeck:['D','E'],
      oldPrizes:['A','D'],window:0}
  ]) {
    const observation={...input,missValue:-3,rewardByName:{A:8,B:3,C:-1,E:1}};
    const exact=value(observation).expectedValue;
    assert.ok(Math.abs(exact-brute(observation))<1e-12,
      JSON.stringify({input,exact}));
  }
});

test('unobserved physical ordering does not change the conditional result',()=>{
  const base={knownFormerTop:[],unknownFormerDeck:['A','B','E','C','A'],
    oldPrizes:['E','A','C'],rewardByName:{A:7,B:3,C:1},
    missValue:-1,window:5};
  assert.deepEqual(value(base),value({...base,
    unknownFormerDeck:[...base.unknownFormerDeck].reverse(),
    oldPrizes:[...base.oldPrizes].reverse()}));
  assert.throws(()=>expectedRedealWindowValue({...assumptions,...base,
    noShuffleSinceRedeal:false}),/assumptions/);
  assert.throws(()=>value({...base,oldPrizes:Array(100).fill('E')}),
    /capacity/);
});
