'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {jointWithBonuses,weightedJoint,allBonusScenarios}=
  require('../scripts/agent38-joint-bonus.cjs');
const {exactGateNaturalUnion}=require('../scripts/agent38-natural-gate-union.cjs');
function close(a,b) {
  assert.ok(Math.abs(a-b)<1e-12,'expected '+b+', got '+a);
}
/**
 * Independently exhaust all 8! physical orders including optional bonuses.
 * Setup: two opening cards, one Prize, K bonuses, first and second turn draws.
 * @param {number[]} groups
 * @param {number} d
 */
function brute(groups,d) {
  const names=['R','S','H','M','V','O','W','X'];
  const cards=groups.flatMap((n,i)=>Array(n).fill(names[i]));
  const sum={valid:0,gate:0,natural:0,overlap:0,union:0};
  function go(at) {
    if(at===cards.length) {
      const opening=cards.slice(0,2);
      if(!opening.some(x=>['R','V','O','W'].includes(x))) return;
      sum.valid++;
      const prizes=cards.slice(2,3);
      const seen=[...opening,...cards.slice(3,4+d)];
      const inDeck=cards.slice(4+d);
      const onT2=[...seen,cards[4+d]];
      const gate=(opening.includes('V')||opening.includes('O'))&&
        (seen.includes('R')||(inDeck.includes('R')&&seen.includes('S'))||
          (prizes.includes('R')&&seen.includes('H')))&&
        inDeck.filter(x=>x==='M').length>=2;
      const natural=seen.includes('V')&&onT2.includes('M');
      if(gate) sum.gate++;
      if(natural) sum.natural++;
      if(gate&&natural) sum.overlap++;
      if(gate||natural) sum.union++;
      return;
    }
    for(let j=at;j<cards.length;j++) {
      [cards[at],cards[j]]=[cards[j],cards[at]];
      go(at+1);
      [cards[at],cards[j]]=[cards[j],cards[at]];
    }
  }
  go(0);
  return Object.fromEntries(['gate','natural','overlap','union']
    .map(k=>[k,sum[k]/sum.valid]));
}
test('each bonus count agrees with full eight-card physical enumeration',()=>{
  for(const groups of [
    [1,1,1,2,1,1,1,0],
    [1,1,1,2,1,1,0,1]
  ]) {
    for(let d=0;d<=3;d++) {
      const model=jointWithBonuses({
        groups,openingSize:2,prizeCount:1,bonusDraws:d
      });
      const physical=brute(groups,d);
      for(const key of Object.keys(physical))
        close(model.probabilities[key],physical[key]);
    }
    assert.equal(allBonusScenarios(groups,2,1).length,4);
  }
});
test('zero bonuses recover independently calculated fixed-deck overlap',()=>{
  for(const [groups,union] of [
    [[1,5,1,4,3,10,0,36],0.6067819926140124],
    [[1,5,1,4,4,9,0,36],0.6323447364326876],
    [[1,5,1,3,4,9,1,36],0.5663593104831307]
  ]) {
    const joint=jointWithBonuses({groups,bonusDraws:0});
    const prior=exactGateNaturalUnion({groups});
    close(joint.probabilities.union,union);
    for(const key of ['gate','natural','overlap','union'])
      close(joint.probabilities[key],prior.probabilities[key]);
  }
});
test('weighted capped tail preserves constant event probability',()=>{
  const cells=Array.from({length:4},()=>({
    gate:0.5,natural:0.6,overlap:0.3,union:0.8
  }));
  const observed=weightedJoint(4,14,cells);
  for(const [key,value] of Object.entries(cells[0]))
    close(observed[key],value);
});
test('reject extra bonus counts that remove an ordinary turn draw',()=>{
  assert.throws(()=>jointWithBonuses({
    groups:[1,1,1,2,1,1,1,0],openingSize:2,prizeCount:1,bonusDraws:4
  }),RangeError);
  assert.throws(()=>jointWithBonuses({groups:[1,1,1],bonusDraws:0}),RangeError);
});
