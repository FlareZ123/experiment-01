'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent32-original-rank6-thunder-dce-physical-gate-v1';
const SOURCE = Object.freeze({basic:4,guzmaHala:2,tagCall:2,thunderMountain:1,doubleColorless:1,other:50});
const {choose} = require('./agent32-source-special-energy-exposure.cjs');

/**
 * Enumerate mutually exclusive card groups for a uniform, unordered hand.
 * The sixth category is the filler count fixed by the requested hand size.
 * @param {number[]} counts Six disjoint population counts.
 * @param {number} size Number of cards sampled.
 * @returns {Array<{cards:number[],ways:number}>}
 */
function allocations(counts, size) {
  const rows=[];
  for(let b=0;b<=counts[0];b++)
    for(let g=0;g<=counts[1];g++)
      for(let t=0;t<=counts[2];t++)
        for(let s=0;s<=counts[3];s++)
          for(let d=0;d<=counts[4];d++) {
            const o=size-b-g-t-s-d;
            if(o<0||o>counts[5])continue;
            const cards=[b,g,t,s,d,o];
            rows.push({cards,ways:cards.reduce((p,v,i)=>p*choose(counts[i],v),1)});
          }
  return rows;
}

/**
 * Probability over six undisclosed Prize cards, conditional on a specific
 * initial hand plus bonus/draw hand. Search cards are assumed unspent;
 * strategically acceptable discards are outside the model.
 * @param {number[]} held Six category counts in playable hand + Active.
 * @param {number} cardsRemaining Cards not in any drawn hand (includes Prizes).
 * @param {number} prizes Prize-card count.
 * @param {number} guzmaCopies Physical source copies of Guzma & Hala.
 * @returns {number}
 */
function routeGivenHand(held,cardsRemaining,prizes,guzmaCopies=2) {
  const gh=held[1]>0,tag=held[2]>0,thunder=held[3]>0,dce=held[4]>0;
  if(thunder&&dce)return 1;
  if(!gh&&!tag)return 0;
  const missingTargets=Number(!thunder)+Number(!dce);
  const divisor=choose(cardsRemaining,prizes);
  const targetUnprized=choose(cardsRemaining-missingTargets,prizes)/divisor;
  if(gh)return targetUnprized;
  const unheldGH=guzmaCopies-held[1];
  const allGHPrized=choose(cardsRemaining-missingTargets-unheldGH,
    prizes-unheldGH)/divisor;
  return targetUnprized-allGHPrized;
}

/**
 * Exact multivariate hypergeometric sum (evaluated in IEEE doubles) for one
 * specifically stated resource route conditional on a Basic-valid source 7:
 *  - Thunder Mountain and DCE held or searchable (neither Prized);
 *  - held Guzma & Hala, or held Tag Call with a searchable Guzma & Hala;
 *  - alternatively both target cards already held, no Supporter needed.
 * At most one manual Energy attachment is assumed, on the source's first
 * turn going second, after one ordinary draw. No tactical/opponent assertion.
 * @param {number} bonus Optional opponent-mulligan draws source elects to take.
 * @param {{ordinaryDraw?:0|1,opening?:number,prizes?:number,source?:object}} [opt]
 * @returns {number}
 */
function routeProbabilityGivenBonus(bonus,opt={}) {
  const {ordinaryDraw=1,opening=7,prizes=6,source=SOURCE}=opt;
  assert.ok(Number.isSafeInteger(bonus)&&bonus>=0);
  assert.ok(ordinaryDraw===0||ordinaryDraw===1);
  const counts=[source.basic,source.guzmaHala,source.tagCall,
    source.thunderMountain,source.doubleColorless,source.other];
  const total=counts.reduce((a,b)=>a+b,0);
  assert.ok(opening>0&&prizes>=0&&opening+prizes+bonus+ordinaryDraw<=total);
  const k=bonus+ordinaryDraw;
  const validOpening=choose(total,opening)-choose(total-source.basic,opening);
  const subsequent=choose(total-opening,k);
  let favourable=0;
  for(const a of allocations(counts,opening)) {
    if(a.cards[0]===0)continue;
    const remaining=counts.map((v,i)=>v-a.cards[i]);
    for(const b of allocations(remaining,k)) {
      const held=a.cards.map((v,i)=>v+b.cards[i]);
      const probability=routeGivenHand(held,total-opening-k,prizes,source.guzmaHala);
      favourable+=a.ways*b.ways*probability;
    }
  }
  return favourable/(validOpening*subsequent);
}

/**
 * Mix a candidate's geometric mulligan-offer distribution over the source's
 * Basic-valid opening. Simultaneous mulligans are redrawn without bonus.
 * No after-treatment hands are filtered, and the candidate's list is fixed.
 * @param {number} contenderBasics Physical Basic Pokemon in contender 60.
 * @param {number} [maxBonus=30] Truncation with an explicit probability bound.
 * @returns {object}
 */
function bilateralRank6Gate(contenderBasics,maxBonus=30) {
  assert.ok(Number.isSafeInteger(contenderBasics)&&contenderBasics>0&&contenderBasics<=60);
  assert.ok(Number.isSafeInteger(maxBonus)&&maxBonus>=0&&maxBonus<=46);
  const sourceMulligan=choose(56,7)/choose(60,7);
  const contenderMulligan=choose(60-contenderBasics,7)/choose(60,7);
  const bonusPositive=contenderMulligan*(1-sourceMulligan)/
    (1-contenderMulligan*sourceMulligan);
  const massZero=1-bonusPositive;
  let lower=massZero*routeProbabilityGivenBonus(0);
  const conditionalValues=[routeProbabilityGivenBonus(0)];
  for(let m=1;m<=maxBonus;m++) {
    const pm=bonusPositive*(1-contenderMulligan)*contenderMulligan**(m-1);
    const value=routeProbabilityGivenBonus(m);
    conditionalValues.push(value);
    lower+=pm*value;
  }
  const unknownTail=bonusPositive*contenderMulligan**maxBonus;
  return {version:VERSION,sourceRank:6,sourceBasics:4,contenderBasics,
    maxBonus,probabilityBonusPositive:bonusPositive,unknownTail,
    routeProbabilityLower:lower,routeProbabilityUpper:lower+unknownTail,
    noBonusRouteProbability:conditionalValues[0],conditionalValues,
    paperGamesQualified:0};
}

function main(){
  const src=require('../../results/aichi-2026/full-decklists.json');
  const deck=src.decks.find(x=>x.rank===6);
  assert.equal(src.published_deck_count,29);
  assert.equal(deck.cards.reduce((sum,c)=>sum+c.count,0),60);
  const cardCount=name=>deck.cards.find(c=>c.name===name)?.count??0;
  assert.deepEqual([cardCount('Iron Thorns ex'),cardCount('Guzma & Hala'),
    cardCount('Tag Call'),cardCount('Thunder Mountain ♢'),
    cardCount('Double Colorless Energy')],[4,2,2,1,1]);
  return {version:VERSION,sourceRank:6,sourcePrinting:'TWM 77 / CEC 193, 206 / LOT 191 / SUM 136',
    definition:'Original rank6 Basic-valid first seven, plus elected contender mulligan bonus and one ordinary draw. Direct DCE+Thunder or held G&H / Tag-call G&H route, both targets unprized; paper-payment and opponent-state unspecified.',
    vsSeven:bilateralRank6Gate(7),vsFourteen:bilateralRank6Gate(14),
    competitiveGamesQualified:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,SOURCE,allocations,routeGivenHand,
  routeProbabilityGivenBonus,bilateralRank6Gate,main};
