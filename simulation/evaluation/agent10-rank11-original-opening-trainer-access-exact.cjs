'use strict';

const assert = require('node:assert/strict');
const roster = require('../../results/aichi-2026/full-decklists.json');
const original = roster.decks.find(d => d.rank === 11);
assert.ok(original);
assert.equal(original.cards.reduce((n,c)=>n+c.count,0),60);

const SOURCES = Object.freeze({
  supporters:['Carmine','Marnie','Guzma'],
  items:['Battle VIP Pass','Quick Ball',"Professor's Letter",'Dark Patch',
    'Boost Shake','Escape Rope','Super Rod','VS Seeker','Secret Box'],
  basics:['Mega Absol ex','Trubbish','Oranguru V','Latias ex',
    'Tapu Lele-GX','Crobat V','Squawkabilly ex'],
  stageOne:['Garbodor']
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  assert.ok(Number.isSafeInteger(n) && n>=0);
  assert.ok(Number.isSafeInteger(k) && k>=0);
  if(k>n) return 0n;
  let product=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    product=product*BigInt(n-i+1)/BigInt(i);
  return product;
}

/** @param {string[]} names */
function cardCount(names) {
  return names.reduce((sum,name)=>{
    const matches=original.cards.filter(c=>c.name===name);
    assert.equal(matches.length,1,'Each original named card should have one printing '+name);
    return sum+matches[0].count;
  },0);
}

/**
 * Exact multivariate-hypergeometric probability after repeatedly drawing
 * seven until at least one Basic is present. This is a hand-access predicate:
 * never infer legal playability, tactical value or actual accepted action.
 */
function exactOpeningTrainerAccess() {
  const N=60,k=7;
  const nSupporter=cardCount(SOURCES.supporters);
  const nItem=cardCount(SOURCES.items);
  const nBasic=cardCount(SOURCES.basics);
  const nStageOne=cardCount(SOURCES.stageOne);
  assert.equal(nSupporter,8);
  assert.equal(nItem,21);
  assert.equal(nBasic,11);
  assert.equal(nStageOne,2);
  assert.equal(nBasic+nStageOne+
    nSupporter+nItem+cardCount(['Float Stone','Forest Seal Stone',
      'Muscle Band','Shopping Center','Temple of Sinnoh','Darkness Energy']),60);
  const nItemOrSupporter=nItem+nSupporter;
  const total=choose(N,k);
  const legal=total-choose(N-nBasic,k);
  const noItemOrSupporterAndLegal=
    choose(N-nItemOrSupporter,k)-
    choose(N-nItemOrSupporter-nBasic,k);
  const includesItemOrSupporterAndLegal=legal-noItemOrSupporterAndLegal;
  assert.ok(legal>0n&&noItemOrSupporterAndLegal>=0n);
  const noAccess=Number(noItemOrSupporterAndLegal)/Number(legal);
  return {
    schema:'agent10-original-rank11-seven-uniform-legal-opening-item-supporter-v1',
    originalRank:11,
    population:N,
    sevenCardOpening:k,
    basicCardCopies:nBasic,
    stageOneCardCopies:nStageOne,
    itemCopies:nItem,
    supporterCopies:nSupporter,
    itemOrSupporterCopies:nItemOrSupporter,
    exactLegalOpeningCombinations:String(legal),
    exactNoItemOrSupporterAndLegalCombinations:
      String(noItemOrSupporterAndLegal),
    exactItemOrSupporterAndLegalCombinations:
      String(includesItemOrSupporterAndLegal),
    conditionalNoItemOrSupporterProbability:noAccess,
    conditionalAtLeastOneItemOrSupporterProbability:1-noAccess,
    hypothesisFourIndependentLegalHandsAllNoItemOrSupporterProbability:
      noAccess**4,
    disclaimer:'Only initial 7 after Basic-valid mulligan conditioning, uniform shuffle. Presence is not payability, a good play, owner-hand data in actual native seed, a deck win estimate or evidence that all four observed hands contained Trainer. Other player mulligans/extra draws ignored.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(exactOpeningTrainerAccess(),null,2)+'\n');

module.exports={SOURCES,choose,cardCount,exactOpeningTrainerAccess};
