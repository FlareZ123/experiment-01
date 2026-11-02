'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose,allocations,countsForOriginal,countSourceAttackLine} =
  require('./agent11-thorns-tagcall-first-attack.cjs');

/**
 * Full original 60 printing-disjoint categories: Basic Thorns, G&H, Tag Call,
 * Thunder Mountain Prism, Double Colorless, Trainers' Mail, remaining.
 * @param {object} deck
 * @returns {number[]}
 */
function sourceCounts(deck) {
  const withoutMail=countsForOriginal(deck);
  const mail=deck.cards.filter(c=>c.name==="Trainers' Mail" &&
    c.printing.set==='ROS' && c.printing.number==='92')
    .reduce((sum,c)=>sum+c.count,0);
  assert.ok([2,3,4].includes(mail));
  assert.ok(withoutMail[5]>=mail);
  return [...withoutMail.slice(0,5),mail,withoutMail[5]-mail];
}

/**
 * Count each valid opening seven + Prize six + ordinary draw + top-four Mail
 * selection exactly. Direct-resources/GH/Tag paths form the baseline. The
 * added subset holds at least one Mail, sees GH or Tag in the next four deck
 * cards, and can fetch both energy and stadium when missing from hand.
 * Once Mail selects a TAG TEAM Supporter, Tag can fetch an unprized G&H.
 * One Mail only: this is not a full multi-Mail or all-Trainer optimizer.
 *
 * @param {number[]} counts Disjoint categories B,GH,Tag,Mountain,DCE,Mail,other.
 * @param {number} [handSize]
 * @param {number} [prizeSize]
 * @param {number} [lookSize]
 * @returns {{baseline:bigint,additional:bigint,denominator:bigint,baselineProbability:number,oneMailProbability:number,incrementProbability:number}}
 */
function countOneMailAccess(counts,handSize=7,prizeSize=6,lookSize=4) {
  assert.equal(counts.length,7);
  assert.ok(counts.every(n=>Number.isSafeInteger(n)&&n>=0));
  const total=counts.reduce((a,b)=>a+b,0);
  const deckAfterDraw=total-handSize-prizeSize-1;
  assert.ok(handSize>=4 && prizeSize>=0 && lookSize>=0 &&
    deckAfterDraw>=lookSize);
  const validHands=choose(total,handSize)-choose(total-counts[0],handSize);
  const lookWays=choose(deckAfterDraw,lookSize);
  const denominator=validHands*choose(total-handSize,prizeSize)*
    BigInt(total-handSize-prizeSize)*lookWays;
  let baseline=0n,additional=0n;
  for(const hand of allocations(counts,handSize)) {
    if(hand[0]===0)continue;
    const handWays=hand.reduce((p,n,i)=>p*choose(counts[i],n),1n);
    const beforePrizes=counts.map((n,i)=>n-hand[i]);
    for(const prizes of allocations(beforePrizes,prizeSize)) {
      const deckBeforeDraw=beforePrizes.map((n,i)=>n-prizes[i]);
      const prizeWays=prizes.reduce((p,n,i)=>p*choose(beforePrizes[i],n),1n);
      for(let draw=0;draw<counts.length;draw++) {
        if(deckBeforeDraw[draw]===0)continue;
        const held=hand.map((n,i)=>n+Number(i===draw));
        const deck=deckBeforeDraw.map((n,i)=>n-Number(i===draw));
        const physicalWays=handWays*prizeWays*BigInt(deckBeforeDraw[draw]);
        const directGH=held[1]>0 || (held[2]>0 && deck[1]>0);
        const mReady=held[3]>0 || (directGH && deck[3]>0);
        const dReady=held[4]>0 || (directGH && deck[4]>0);
        if(mReady && dReady) {
          baseline += physicalWays*lookWays;
          continue;
        }
        const possibleResources=(held[3]+deck[3])>0 &&
          (held[4]+deck[4])>0;
        if(held[5]===0 || deck[1]===0 || !possibleResources)continue;
        const connectorCount=deck[1]+deck[2];
        const hittingLook=lookWays-choose(deckAfterDraw-connectorCount,lookSize);
        additional += physicalWays*hittingLook;
      }
    }
  }
  return {baseline,additional,denominator,
    baselineProbability:Number(baseline)/Number(denominator),
    incrementProbability:Number(additional)/Number(denominator),
    oneMailProbability:Number(baseline+additional)/Number(denominator)};
}

/** @returns {object[]} */
function fromRepo() {
  const root=path.resolve(__dirname,'..');
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  return [6,24,29].map(rank=>{
    const deck=roster.decks.find(d=>d.rank===rank);
    assert.ok(deck);
    const counts=sourceCounts(deck);
    const r=countOneMailAccess(counts);
    const old=countSourceAttackLine([...counts.slice(0,5),counts[5]+counts[6]]);
    assert.ok(Math.abs(r.baselineProbability-old.broaderProbability)<1e-15);
    return {rank,counts,
      baselineProbability:r.baselineProbability,
      newOneMailIncrement:r.incrementProbability,
      baselinePlusOneMail:r.oneMailProbability,
      baseline:r.baseline.toString(),
      mailAdditional:r.additional.toString(),
      denominator:r.denominator.toString(),
      description:'direct connector and one held Trainers Mail top-four hit subset'};
  });
}

if(require.main===module)process.stdout.write(JSON.stringify(fromRepo(),null,2)+'\n');
module.exports={sourceCounts,countOneMailAccess,fromRepo};
