'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose,gcd}=require('./agent18-exeggutor-opener-risk.cjs');

const VERSION='agent18-exeggutor-vileplume-joint-prize-full-stage-access-v1';

/**
 * Exact probability that at least one entire named physical group is among
 * unordered face-down Prize cards. Groups must be disjoint physical copies.
 * A fully prized group blocks this particular unassisted full-stage line,
 * but a recovery effect or an evolution bypass may still complete the game.
 *
 * @param {number[]} groups Disjoint physical stage group sizes.
 * @param {number} n Physical deck size.
 * @param {number} prizes Number of hidden Prizes.
 * @returns {{blocked:string,available:string,blockedProbability:number,availableProbability:number}}
 */
function fullStagePrizeSupply(groups,n=60,prizes=6) {
  assert.ok(Number.isSafeInteger(n)&&n>0);
  assert.ok(Number.isSafeInteger(prizes)&&prizes>=0&&prizes<=n);
  assert.ok(Array.isArray(groups)&&groups.length>0&&groups.length<=20);
  assert.ok(groups.every(v=>Number.isSafeInteger(v)&&v>0));
  assert.ok(groups.reduce((a,b)=>a+b,0)<=n);
  const total=choose(n,prizes);
  let bad=0n;
  for(let mask=1;mask<2**groups.length;mask++){
    let k=0,sum=0;
    for(let i=0;i<groups.length;i++)if(mask&(2**i)){k++;sum+=groups[i];}
    const count=sum<=prizes?choose(n-sum,prizes-sum):0n;
    bad+=(k%2?count:-count);
  }
  assert.ok(bad>=0n&&bad<=total);
  const d=gcd(bad,total);
  const a=gcd(total-bad,total);
  return {blocked:String(bad/d)+'/'+String(total/d),
    available:String((total-bad)/a)+'/'+String(total/a),
    blockedProbability:Number(bad)/Number(total),
    availableProbability:Number(total-bad)/Number(total)};
}

/** @param {object} deck Source-manifest deck. @param {string} name @returns {number} */
function physicalNameCount(deck,name) {
  return deck.cards.filter(card=>card.name===name&&card.category==='Pokémon')
    .reduce((sum,card)=>sum+card.count,0);
}

/** @param {object} original Exact rank2 original; @param {object} challenger Frozen v1. */
function rank2JointSupply(original,challenger) {
  assert.equal(original.rank,2);
  assert.equal(challenger.sourceDeckRank,2);
  const base=['Oddish','Gloom','Vileplume'].map(name=>physicalNameCount(original,name));
  const still=['Oddish','Gloom','Vileplume'].map(name=>physicalNameCount(challenger,name));
  assert.deepEqual(base,[2,2,2]);
  assert.deepEqual(still,[2,2,2]);
  const stout=['Lillipup','Herdier','Stoutland'].map(name=>physicalNameCount(original,name));
  const exegg=['Exeggcute','Exeggutor'].map(name=>physicalNameCount(challenger,name));
  assert.deepEqual(stout,[2,2,1]);
  assert.deepEqual(exegg,[2,2]);
  const oldSupporterLock=fullStagePrizeSupply(stout);
  const newSupporterLock=fullStagePrizeSupply(exegg);
  const oldJoint=fullStagePrizeSupply([...base,...stout]);
  const newJoint=fullStagePrizeSupply([...still,...exegg]);
  return {
    schema:VERSION,
    originalRank:2,
    originalSourceCardNameGroups:{vileplume:base,stoutland:stout},
    challengerCardNameGroups:{vileplume:still,exeggutor:exegg},
    oldSupporterLock,newSupporterLock,oldJoint,newJoint,
    jointBlockedDeltaPercentagePoints:
      (oldJoint.blockedProbability-newJoint.blockedProbability)*100,
    competitiveQualifiedGames:0,
    caveat:'Uniform six hidden Prizes from 60; requires at least one copy of every named stage unprized. Grand Tree may bypass Stage1, Gladion/Peonia can retrieve Prizes. Counts are only a no-recovery whole-stage presence test, not legal action/win-rate or literal line impossibility.'
  };
}

/** @returns {object} Run against exact published source and frozen challenger. */
function main() {
  const root=path.resolve(__dirname,'..');
  const original=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8')).decks.find(d=>d.rank===2);
  const candidate=JSON.parse(fs.readFileSync(path.join(root,
    'results/als/agent18-exeggutor-vileplume-source-v1.json'),'utf8'));
  const result=rank2JointSupply(original,candidate);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={VERSION,fullStagePrizeSupply,physicalNameCount,rank2JointSupply,main};
