'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {budewShakeFork,sourceReport}=
  require('../scripts/aichi-absol-budew-shake-fork.cjs');

/**
 * An independent physical-card enumerator. Select the initial seven,
 * all Prize cards and the first normal draw in their actual sequence.
 * The target remains in the true deck after those placements.
 * @param {string[]} cards
 * @param {number} handSize
 * @param {number} prizeCount
 */
function brute(cards,handSize,prizeCount){
  /** @param {number[]} pool @param {number} k */
  function* subsets(pool,k,start=0,prefix=[]){
    if(prefix.length===k){yield prefix.slice();return;}
    for(let i=start;i<=pool.length-(k-prefix.length);i++){
      prefix.push(pool[i]);
      yield* subsets(pool,k,i+1,prefix);
      prefix.pop();
    }
  }
  const ids=cards.map((_,i)=>i);
  let success=0,valid=0;
  for(const hand of subsets(ids,handSize)){
    if(!hand.some(id=>['Budew','Trubbish','OtherBasic'].includes(cards[id])))
      continue;
    const handSet=new Set(hand);
    const outside=ids.filter(id=>!handSet.has(id));
    for(const prizes of subsets(outside,prizeCount)){
      const prizeSet=new Set(prizes);
      const remaining=outside.filter(id=>!prizeSet.has(id));
      for(const drawn of remaining){
        valid++;
        const visible=[...hand,drawn].map(id=>cards[id]);
        const initialBudew=hand.some(id=>cards[id]==='Budew');
        const other=outside.filter(id=>!prizeSet.has(id)&&id!==drawn);
        if(initialBudew&&visible.includes('Trubbish')&&
          visible.includes('FloatStone')&&visible.includes('BoostShake')&&
          other.some(id=>cards[id]==='Garbodor'))success++;
      }
    }
  }
  return {success,valid};
}

test('four distinct printed Absol/Garbodor original 60s preserve exact direct fork',()=>{
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const result=sourceReport(source);
  assert.deepEqual(result.ranks.map(row=>row.rank),[8,11,16,22]);
  assert.deepEqual(result.ranks.map(row=>row.budew),[1,0,2,1]);
  assert.deepEqual(result.ranks.map(row=>row.boostShake),[1,2,2,0]);
  assert.deepEqual(result.ranks.map(row=>row.garbodor),[2,2,3,2]);
  assert.deepEqual(result.ranks.map(row=>
    [row.directBudewVersusShakeFork.numerator,
      row.directBudewVersusShakeFork.denominator]),[
    ['2539354951','2235797117840'],['0','1'],
    ['111430883','26892110960'],['0','1']]);
  assert.equal(result.qualification.includes('no selected actions'),true);
  assert.equal(result.ranks[1].directBudewVersusShakeFork.probability,0);
  assert.equal(result.ranks[3].directBudewVersusShakeFork.probability,0);
});

test('coaccessible fork is a proper subevent of direct Boost Shake window',()=>{
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  for(const row of sourceReport(source).ranks){
    assert.ok(row.directBudewVersusShakeFork.probability<=
      row.directShakeWindow.probability);
  }
  assert.ok(budewShakeFork({basics:11,budew:2,trubbish:2,
    garbodor:3,floatStone:4,boostShake:2}).probability>
    budewShakeFork({basics:10,budew:1,trubbish:2,
      garbodor:2,floatStone:4,boostShake:1}).probability);
});

test('every physical miniature deal agrees with independent brute enumeration',()=>{
  const cards=['Budew','Trubbish','OtherBasic','OtherBasic',
    'Garbodor','FloatStone','BoostShake',
    'Other','Other','Other','Other'];
  const exact=brute(cards,3,2);
  const model=budewShakeFork({basics:4,budew:1,trubbish:1,
    garbodor:1,floatStone:1,boostShake:1},
    {deckSize:11,openingSize:3,prizeCount:2});
  assert.equal(exact.success>0,true);
  assert.equal(exact.success*1456,exact.valid*3);
  assert.equal(model.numerator,'3');
  assert.equal(model.denominator,'1456');
  assert.equal(model.probability,exact.success/exact.valid);
});

test('missing Budew, searched Evolution, Tool or Shake makes the fork impossible',()=>{
  const base={basics:11,budew:2,trubbish:2,
    garbodor:3,floatStone:4,boostShake:2};
  for(const key of ['budew','trubbish','garbodor','floatStone','boostShake']){
    const modified={...base,[key]:0};
    assert.equal(budewShakeFork(modified).probability,0,key);
  }
  assert.throws(()=>budewShakeFork({...base,budew:12}));
  assert.throws(()=>budewShakeFork({...base,floatStone:-1}));
});
