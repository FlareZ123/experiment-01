'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {protectedTempleAccess,aichiProtectedTempleAccess}=
  require('../scripts/regidrago-temple-protected-energy.cjs');
const {aichiDiscardSensitivity}=require('../scripts/regidrago-temple-discard-sensitivity.cjs');
const {aichiSearchAccess}=require('../scripts/regidrago-temple-search.cjs');

/** Enumerate every opening, Prize choice and next draw on tiny physical decks. */
function brute(cards,opening,prizes,spareDde) {
  const comb=(items,k,from=0,b=[],out=[])=>{
    if(b.length===k){out.push(b);return out;}
    for(let i=from;i<items.length;i++)comb(items,k,i+1,[...b,items[i]],out);
    return out;
  };
  const ids=cards.map((_,i)=>i);
  let yes=0,total=0;
  for(const hand of comb(ids,opening)){
    const h=hand.map(i=>cards[i]);
    if(!h.includes('R')&&!h.includes('B'))continue;
    const remaining=ids.filter(i=>!hand.includes(i));
    for(const prize of comb(remaining,prizes))
      for(const next of remaining.filter(i=>!prize.includes(i))){
        const eight=[...h,cards[next]];
        const n=x=>eight.filter(c=>c===x).length;
        const direct=eight.includes('U')||
          (h.includes('R')&&h.includes('B'))||cards[next]==='R';
        const marshadow=cards.findIndex(c=>c==='R');
        const available=marshadow>=0&&!hand.includes(marshadow)&&
          !prize.includes(marshadow)&&next!==marshadow;
        const payable=n('Q')>=2||n('G')>=2||n('F')>=2||
          (spareDde&&n('E')>=2);
        total++;
        if(direct||(available&&n('Q')>=1&&payable))yes++;
      }
  }
  return yes/total;
}

test('physical-deal oracle: protect Grass/Fire and optional DDE',()=>{
  const examples=[
    ['R','B','Q','G','G','F','F','E','E','N','N'],
    ['U','R','B','Q','Q','G','F','E','N','N','N'],
    ['R','B','Q','Q','G','G','F','E','E','N','N'],
    ['B','Q','Q','G','G','F','F','E','N','N','N']
  ];
  for(const cards of examples)for(const allowSpareDde of [false,true]){
    const n=x=>cards.filter(y=>y===x).length;
    const p=protectedTempleAccess({size:cards.length,opening:3,prizes:2,
      basics:n('R')+n('B'),outs:n('U'),marshadow:n('R'),
      searchers:n('Q'),grass:n('G'),fire:n('F'),dde:n('E'),
      allowSpareDde}).probability;
    assert.ok(Math.abs(p-brute(cards,3,2,allowSpareDde))<1e-12,
      JSON.stringify({cards,p,allowSpareDde}));
  }
});

test('all nine printed Regidrago inventory and monotone discard policy',()=>{
  const rows=aichiProtectedTempleAccess();
  const old=aichiDiscardSensitivity();
  const ideal=aichiSearchAccess();
  assert.deepEqual(rows.map(x=>x.rank),[10,12,13,14,18,20,21,27,32]);
  assert.deepEqual(rows.map(x=>x.grass),[4,4,4,4,2,4,4,4,4]);
  assert.deepEqual(rows.map(x=>x.fire),[2,2,3,2,2,2,3,2,2]);
  assert.deepEqual(rows.map(x=>x.dde),[4,4,3,4,4,4,3,4,4]);
  for(const row of rows){
    const baseline=old.find(x=>x.rank===row.rank);
    const upper=ideal.find(x=>x.rank===row.rank);
    assert.ok(baseline.duplicatedSearchersOnly<=row.protectEveryDde+1e-12);
    assert.ok(row.protectEveryDde<=row.protectOneDde+1e-12);
    assert.ok(row.protectOneDde<=baseline.allEnergySpendable+1e-12);
    assert.ok(row.protectOneDde<=upper.idealAccess+1e-12);
  }
});
