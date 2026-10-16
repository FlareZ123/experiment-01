'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {exactGateNaturalUnion,sourceScenarios}=require('../scripts/agent38-natural-gate-union.cjs');
function close(actual,expected) {
  assert.ok(Math.abs(actual-expected)<1e-12,
    'expected '+expected+', got '+actual);
}
/** @param {number[]} groups */
function brute(groups) {
  const symbols=['R','S','H','M','V','O','W','X'];
  const cards=groups.flatMap((n,i)=>Array(n).fill(symbols[i]));
  const count={valid:0,gate:0,natural:0,overlap:0,union:0};
  function enumerate(i) {
    if(i===cards.length) {
      const opener=cards.slice(0,2),prize=cards[2],
        seen=[...opener,cards[3]],later=[...seen,cards[4]],
        deck=cards.slice(4);
      if(!opener.some(x=>['R','V','O','W'].includes(x))) return;
      count.valid++;
      const gate=(opener.includes('V')||opener.includes('O'))&&
        (seen.includes('R')||(deck.includes('R')&&seen.includes('S'))||
        (prize==='R'&&seen.includes('H')))&&
        deck.filter(x=>x==='M').length>=2;
      const natural=seen.includes('V')&&later.includes('M');
      if(gate) count.gate++;
      if(natural) count.natural++;
      if(gate&&natural) count.overlap++;
      if(gate||natural) count.union++;
      return;
    }
    for(let j=i;j<cards.length;j++) {
      [cards[i],cards[j]]=[cards[j],cards[i]];
      enumerate(i+1);
      [cards[i],cards[j]]=[cards[j],cards[i]];
    }
  }
  enumerate(0);
  return Object.fromEntries(['gate','natural','overlap','union']
    .map(k=>[k,count[k]/count.valid]));
}
test('independent eight-card physical permutations reproduce overlap',()=>{
  for(const groups of [[1,1,1,2,1,1,1,0],[1,1,1,2,1,1,0,1]]) {
    const actual=exactGateNaturalUnion({groups,openingSize:2,prizeCount:1});
    const expected=brute(groups);
    for(const key of Object.keys(expected)) close(actual.probabilities[key],expected[key]);
  }
});
test('source-counted candidates match independent component oracles',()=>{
  const cases=[
    ['champion-reference',[1,5,1,4,3,10,0,36],
      0.5065943762478146,0.18257322356953012,0.6067819926140124],
    ['hood-shield-v1',[1,5,1,4,4,9,0,36],
      0.5065943762478146,0.23014369326185377,0.6323447364326876],
    ['temple-v1',[1,5,1,3,4,9,1,36],
      0.4497159760609984,0.1799202878540783,0.5663593104831307]
  ];
  assert.deepEqual(sourceScenarios(),cases.map(row=>({name:row[0],groups:row[1]})));
  for(const [name,groups,gate,natural,union] of cases) {
    const result=exactGateNaturalUnion({groups});
    close(result.probabilities.gate,gate);
    close(result.probabilities.natural,natural);
    close(result.probabilities.union,union);
    close(result.probabilities.union,
      result.probabilities.gate+result.probabilities.natural-result.probabilities.overlap);
    assert.ok(result.probabilities.overlap>0,name);
  }
});
test('reject invalid category counts',()=>{
  assert.throws(()=>exactGateNaturalUnion({groups:[1,5,1]}),RangeError);
  assert.throws(()=>exactGateNaturalUnion({groups:[0,5,1,4,3,10,0,37]}),RangeError);
  assert.throws(()=>exactGateNaturalUnion({groups:[1,5,1,1,3,10,0,39]}),RangeError);
});
