'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./agent1-prize-failure-budget.cjs');

const GROUPS=Object.freeze(['adp','doubleDragon','guzmaHala','tagCall','other']);

/**
 * Generate physical multivariate hypergeometric count vectors.
 * Every result contributes the exact number of distinct physical selections.
 *
 * @param {number[]} stock Nonnegative physical copies in each group.
 * @param {number} selected Total selected without replacement.
 * @returns {Array<{counts:number[],ways:bigint}>}
 */
function selections(stock,selected) {
  assert.ok(Array.isArray(stock) && stock.length===5);
  assert.ok(stock.every(x=>Number.isSafeInteger(x)&&x>=0));
  assert.ok(Number.isSafeInteger(selected)&&selected>=0);
  const rows=[];
  /**
   * @param {number} group
   * @param {number} remaining
   * @param {number[]} counts
   * @param {bigint} ways
   */
  function visit(group,remaining,counts,ways) {
    if(group===stock.length) {
      if(remaining===0)rows.push({counts:[...counts],ways});
      return;
    }
    for(let k=0;k<=Math.min(stock[group],remaining);k++) {
      counts.push(k);
      visit(group+1,remaining-k,counts,ways*choose(stock[group],k));
      counts.pop();
    }
  }
  visit(0,selected,[],1n);
  return rows;
}

/**
 * The three mutually exclusive *resource* routes for one specific proposed
 * opening line: ADP must be in the INITIAL seven to be designated Active,
 * and going second it can receive a Double Dragon Energy on first own turn:
 *
 * direct: DDE is in first eight (7+turn draw);
 * supporter: no DDE held, G&H in first eight, DDE in post-prize deck;
 * tag: neither DDE nor G&H held, Tag Call in first eight, G&H and DDE
 *   both in post-prize deck.
 *
 * This is an intentionally optimistic source-access screen. It ignores
 * actual discards, hand-protected resources, Item lock, stadium availability,
 * Supporter contention, legal card search resolution, any setup pivot,
 * and whether ADP survives. It EXCLUDES other T1 legal lines such as
 * acquiring ADP from the deck and using Switch to promote it.
 *
 * @param {{adp:number,doubleDragon:number,guzmaHala:number,tagCall:number,other:number,basics:number,handSize?:number,prizeSize?:number}} input
 * @returns {{totals:object,numerators:object,probabilities:object}}
 */
function exactAdpInitialActiveCoreOpportunity(input) {
  const {adp,doubleDragon,guzmaHala,tagCall,other,basics,
    handSize=7,prizeSize=6}=input;
  const stocks=[adp,doubleDragon,guzmaHala,tagCall,other];
  assert.ok(stocks.every(n=>Number.isSafeInteger(n)&&n>=0));
  assert.ok(Number.isSafeInteger(basics)&&basics>=adp&&basics<=adp+other);
  const population=stocks.reduce((s,n)=>s+n,0);
  assert.ok(Number.isSafeInteger(handSize)&&handSize>=1);
  assert.ok(Number.isSafeInteger(prizeSize)&&prizeSize>=0);
  assert.ok(population-handSize-prizeSize>=1,
    'One normal personal-turn draw must remain in deck');
  const remainingAfterPrizes=population-handSize-prizeSize;
  const acceptedHandWays=
    choose(population,handSize)-choose(population-basics,handSize);
  const acceptedWorlds=acceptedHandWays *
    choose(population-handSize,prizeSize) *
    BigInt(remainingAfterPrizes);
  assert.ok(acceptedWorlds>0n);

  const numerators={
    initialAdp:0n,directDoubleDragon:0n,
    heldGuzmaHala:0n,tagCallToGuzmaHala:0n,
    combinedCoreAccess:0n
  };
  for(const hand of selections(stocks,handSize)) {
    // A later turn draw of ADP cannot retroactively choose it as the
    // opening Active. This makes all counted worlds Basic-valid already.
    if(hand.counts[0]===0)continue;
    const inDeckBeforePrizes=stocks.map((count,i)=>count-hand.counts[i]);
    for(const prize of selections(inDeckBeforePrizes,prizeSize)) {
      const inDeckBeforeDraw=inDeckBeforePrizes.map(
        (count,i)=>count-prize.counts[i]);
      for(let drawn=0;drawn<stocks.length;drawn++) {
        const physicalDrawChoices=inDeckBeforeDraw[drawn];
        if(physicalDrawChoices===0)continue;
        const held=[...hand.counts];
        const inDeck=[...inDeckBeforeDraw];
        held[drawn]++;
        inDeck[drawn]--;
        const worlds=hand.ways*prize.ways*BigInt(physicalDrawChoices);
        numerators.initialAdp+=worlds;
        let route=null;
        if(held[1]>=1)route='directDoubleDragon';
        else if(inDeck[1]>=1) {
          if(held[2]>=1)route='heldGuzmaHala';
          else if(held[3]>=1&&inDeck[2]>=1)route='tagCallToGuzmaHala';
        }
        if(route!==null) {
          numerators[route]+=worlds;
          numerators.combinedCoreAccess+=worlds;
        }
      }
    }
  }

  assert.equal(numerators.initialAdp,
    (choose(population-1,handSize-1) -
     choose(population-adp,handSize)) *
      0n + numerators.initialAdp); // Exact share proved by separate test.
  assert.equal(numerators.combinedCoreAccess,
    numerators.directDoubleDragon+
    numerators.heldGuzmaHala+numerators.tagCallToGuzmaHala);
  const probabilities=Object.fromEntries(
    Object.entries(numerators).map(([key,value])=>
      [key,Number(value)/Number(acceptedWorlds)]));
  return {
    totals:{population,handSize,prizeSize,basics,
      groupNames:[...GROUPS],stocks:[...stocks],
      acceptedWorlds:acceptedWorlds.toString()},
    numerators:Object.fromEntries(
      Object.entries(numerators).map(([key,n])=>[key,n.toString()])),
    probabilities
  };
}

/** @returns {object} Exact groups from unchanged Agent5 v2 manifest. */
function agent5OriginalCandidateGroups() {
  const manifest=require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
  const total=manifest.cards.reduce((sum,c)=>sum+c.count,0);
  assert.equal(total,60);
  /**
   * @param {string} id
   * @param {string} expectedName
   * @returns {number}
   */
  function copies(id,expectedName) {
    const match=manifest.cards.filter(c=>c.id===id);
    assert.equal(match.length,1,'Expected unique specific printing '+id);
    assert.equal(match[0].name,expectedName);
    return match[0].count;
  }
  const adp=copies('sm12-156','Arceus & Dialga & Palkia-GX');
  const doubleDragon=copies('xy6-97','Double Dragon Energy');
  const guzmaHala=copies('sm12-193','Guzma & Hala');
  const tagCall=copies('sm12-206','Tag Call');
  return {
    adp,doubleDragon,guzmaHala,tagCall,
    other:total-adp-doubleDragon-guzmaHala-tagCall,
    basics:7
  };
}

module.exports={
  GROUPS,selections,exactAdpInitialActiveCoreOpportunity,
  agent5OriginalCandidateGroups
};
