'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {discardSensitiveSearchAccess,aichiDiscardSensitivity}=
  require('../scripts/regidrago-temple-discard-sensitivity.cjs');
const {aichiSearchAccess}=require('../scripts/regidrago-temple-search.cjs');

/**
 * Independent finite enumeration: distinguish every physical opening hand,
 * six-Prize analogue and unprized eighth-card draw in a miniature deck.
 * U direct answer, R Resetting Hole, Q searcher, B other Basic, D spendable.
 *
 * @param {string[]} cards Physical miniature deck.
 * @param {number} opening Opening hand size.
 * @param {number} prizes Face-down Prize count.
 * @returns {number}
 */
function brute(cards,opening,prizes) {
  const choose=(source,n,index=0,selected=[],out=[])=>{
    if(selected.length===n){out.push(selected);return out;}
    for(let i=index;i<source.length;i++)
      choose(source,n,i+1,[...selected,source[i]],out);
    return out;
  };
  const ids=cards.map((_,i)=>i);
  let good=0,total=0;
  for(const hand of choose(ids,opening)) {
    const h=hand.map(i=>cards[i]);
    if(!h.includes('R')&&!h.includes('B'))continue;
    const left=ids.filter(i=>!hand.includes(i));
    for(const chosen of choose(left,prizes))
      for(const next of left.filter(i=>!chosen.includes(i))) {
        const seen=[...h,cards[next]];
        const direct=seen.includes('U')||
          (h.includes('R')&&h.includes('B'))||cards[next]==='R';
        const q=seen.filter(x=>x==='Q').length;
        const d=seen.filter(x=>x==='D').length;
        const rIndex=cards.findIndex(x=>x==='R');
        const searchable=rIndex>=0&&!hand.includes(rIndex)&&
          !chosen.includes(rIndex)&&next!==rIndex&&q>=1&&(q>=2||d>=1);
        total++;
        if(direct||searchable)good++;
      }
  }
  return good/total;
}

test('exact six-category enumeration agrees with physical-deal exhaustive oracle',()=>{
  const arrays=[
    ['U','R','Q','Q','B','D','N','N','N'],
    ['R','Q','B','D','D','N','N','N','N'],
    ['R','Q','Q','B','N','N','N','N','N'],
    ['U','Q','B','D','N','N','N','N','N'],
    ['U','R','Q','B','N','N','N','N','N']
  ];
  for(const cards of arrays) {
    const get=c=>cards.filter(x=>x===c).length;
    const actual=discardSensitiveSearchAccess({
      size:cards.length,opening:3,prizes:2,
      basics:get('R')+get('B'),outs:get('U'),marshadow:get('R'),
      searchers:get('Q'),spendable:get('D')
    }).probability;
    assert.ok(Math.abs(actual-brute(cards,3,2))<1e-12,
      JSON.stringify({cards,actual,brute:brute(cards,3,2)}));
  }
});

test('all source-printed Regidrago energy and search inventories are preserved',()=>{
  const rows=aichiDiscardSensitivity();
  assert.deepEqual(rows.map(x=>x.rank),[10,12,13,14,18,20,21,27,32]);
  assert.deepEqual(rows.map(x=>x.searchers),[6,8,7,8,7,7,8,8,7]);
  assert.deepEqual(rows.map(x=>x.basicEnergy),[6,6,7,6,4,6,7,6,6]);
  assert.deepEqual(rows.map(x=>x.allEnergy),[10,10,10,10,8,10,10,10,10]);
  const ideal=aichiSearchAccess();
  for(const row of rows) {
    const optimistic=ideal.find(x=>x.rank===row.rank).idealAccess;
    assert.ok(row.direct-1e-12<=row.duplicatedSearchersOnly);
    assert.ok(row.duplicatedSearchersOnly<=row.basicEnergySpendable+1e-12);
    assert.ok(row.basicEnergySpendable<=row.allEnergySpendable+1e-12);
    assert.ok(row.allEnergySpendable<=optimistic+1e-12);
  }
  for(const rank of [13,32]) {
    const row=rows.find(x=>x.rank===rank);
    assert.ok(Math.abs(row.direct-row.allEnergySpendable)<1e-12);
  }
});

test('invalid disjoint counts are rejected',()=>{
  assert.throws(()=>discardSensitiveSearchAccess({
    size:9,opening:3,prizes:2,basics:4,outs:2,
    marshadow:1,searchers:2,spendable:2
  }),RangeError);
});
