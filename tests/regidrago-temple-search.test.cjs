'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {optimisticSearchAccess,aichiSearchAccess}=
  require('../scripts/regidrago-temple-search.cjs');

/** Brute-force small deck: all hands, all Prize subsets, all turn draws. */
function brute(cards,handCount,prizeCount) {
  const combinations=(ids,k,start=0,prefix=[],result=[])=>{
    if(prefix.length===k){result.push(prefix);return result;}
    for(let i=start;i<ids.length;i++)
      combinations(ids,k,i+1,[...prefix,ids[i]],result);
    return result;
  };
  const indices=cards.map((_,i)=>i);
  let good=0,total=0;
  for(const hand of combinations(indices,handCount)) {
    const h=hand.map(i=>cards[i]);
    if(!h.includes('R')&&!h.includes('B'))continue;
    const leftover=indices.filter(i=>!hand.includes(i));
    for(const prizes of combinations(leftover,prizeCount)) {
      for(const next of leftover.filter(i=>!prizes.includes(i))) {
        const nextCard=cards[next];
        const direct=h.includes('U')||nextCard==='U'||
          (h.includes('R')&&h.includes('B'))||nextCard==='R';
        const searchable=(h.includes('Q')||nextCard==='Q')&&
          !h.includes('R')&&nextCard!=='R'&&
          cards.some((c,i)=>c==='R'&&!hand.includes(i)&&
            !prizes.includes(i)&&i!==next);
        total++;
        if(direct||searchable)good++;
      }
    }
  }
  return good/total;
}

test('exhaustive prize/first-eight search agreement in small decks',()=>{
  for(const cards of [
    ['U','R','Q','B','B','N','N','N','N'],
    ['R','Q','Q','B','B','N','N','N','N'],
    ['U','Q','Q','B','B','N','N','N','N'],
    ['R','Q','B','N','N','N','N','N','N']
  ]) {
    const model=optimisticSearchAccess({
      size:cards.length,opening:3,prizes:2,
      basics:cards.filter(x=>x==='R'||x==='B').length,
      outs:cards.filter(x=>x==='U').length,
      marshadow:cards.filter(x=>x==='R').length,
      searchers:cards.filter(x=>x==='Q').length
    });
    assert.ok(Math.abs(model.probability-brute(cards,3,2))<1e-12,
      JSON.stringify(cards));
  }
});

test('all nine printed Regidrago searcher counts and exact reference values',()=>{
  const rows=aichiSearchAccess();
  assert.deepEqual(rows.map(x=>x.rank),[10,12,13,14,18,20,21,27,32]);
  assert.deepEqual(rows.map(x=>x.searchers),[6,8,7,8,7,7,8,8,7]);
  const find=rank=>rows.find(row=>row.rank===rank);
  assert.ok(Math.abs(find(10).idealAccess-0.6272006)<1e-6);
  assert.ok(Math.abs(find(12).idealAccess-0.7843018)<1e-6);
  assert.ok(Math.abs(find(18).idealAccess-0.7613296)<1e-6);
  assert.ok(Math.abs(find(13).idealAccess-find(13).includingBenchMarshadow)<1e-12);
  assert.ok(Math.abs(find(32).idealAccess-find(32).includingBenchMarshadow)<1e-12);
  for(const row of rows) {
    assert.ok(row.idealAccess+1e-12>=row.includingBenchMarshadow);
    assert.ok(row.idealWithFaba+1e-12>=row.idealAccess);
  }
});
