'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {exactProtectedHood,weightedHood,allHoodBonuses,sourceHoodGroups}=
  require('../scripts/agent38-hood-protected-bonus.cjs');
function close(a,b) {
  assert.ok(Math.abs(a-b)<1e-12,'expected '+b+', got '+a);
}
/**
 * Independently exhaust 8! physical mini-deck orders including Prizes,
 * bonus cards, two normal draws, and distinct Arven rescue eligibility.
 * @param {number[]} counts
 * @param {number} prizes
 * @param {number} bonuses
 */
function brute(counts,prizes,bonuses) {
  const names=['V','M','H','A','B','O'];
  const cards=counts.flatMap((n,i)=>Array(n).fill(names[i]));
  const sums={valid:0,ready:0,direct:0,arven:0,available:0};
  function walk(i) {
    if(i===cards.length) {
      const opening=cards.slice(0,2);
      if(!opening.includes('V')&&!opening.includes('B'))return;
      sums.valid++;
      const turnOne=[...opening,...cards.slice(2+prizes,3+prizes+bonuses)];
      const turnTwo=[...turnOne,cards[3+prizes+bonuses]];
      const laterDeck=cards.slice(4+prizes+bonuses);
      const ready=turnOne.includes('V')&&turnTwo.includes('M');
      const direct=turnTwo.includes('H');
      const arven=turnTwo.includes('A')&&laterDeck.includes('H');
      if(ready) {
        sums.ready++;
        if(direct) {
          sums.direct++;
          sums.available++;
        } else if(arven) {
          sums.arven++;
          sums.available++;
        }
      }
      return;
    }
    for(let j=i;j<cards.length;j++) {
      [cards[i],cards[j]]=[cards[j],cards[i]];
      walk(i+1);
      [cards[i],cards[j]]=[cards[j],cards[i]];
    }
  }
  walk(0);
  return Object.fromEntries(Object.entries(sums)
    .filter(([k])=>k!=='valid').map(([k,n])=>[k,n/sums.valid]));
}
test('exhaustive physical shuffles reproduce both Hood access paths',()=>{
  for(const [groups,prizeCount] of [
    [[1,1,2,1,1,2],2],
    [[1,2,1,1,1,2],1]
  ]) {
    const cap=8-2-prizeCount-2;
    for(let bonusDraws=0;bonusDraws<=cap;bonusDraws++) {
      const actual=exactProtectedHood({
        groups,openingSize:2,prizeCount,bonusDraws
      });
      const expected=brute(groups,prizeCount,bonusDraws);
      for(const [key,value] of Object.entries(expected)) {
        close(actual.probabilities[key],value);
      }
    }
    assert.equal(allHoodBonuses(groups,2,prizeCount).length,cap+1);
  }
});
test('source-derived Hood inventory and exact prior values agree',()=>{
  const groups=[4,4,2,1,10,39];
  assert.deepEqual(sourceHoodGroups(),groups);
  const zero=exactProtectedHood({groups,bonusDraws:0});
  close(zero.probabilities.ready,0.23014369326185377);
  close(zero.probabilities.direct,0.054569787828435135);
  close(zero.probabilities.arven,0.02257357232861647);
  close(zero.probabilities.available,0.0771433601570516);
  const byBonus=allHoodBonuses(groups);
  assert.equal(byBonus.length,46);
  const thorns=weightedHood(4,14,byBonus);
  close(thorns.ready,0.2873317621793535);
  close(thorns.direct,0.08431433769333352);
  close(thorns.arven,0.03225569430294343);
  close(thorns.available,0.11657003199627698);
});
test('reject extra bonuses beyond available turn draws',()=>{
  assert.throws(()=>exactProtectedHood({
    groups:[1,1,2,1,1,2],openingSize:2,prizeCount:2,bonusDraws:3
  }),RangeError);
  assert.throws(()=>exactProtectedHood({groups:[4,4,2],bonusDraws:0}),RangeError);
});
