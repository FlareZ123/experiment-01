'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./agent1-prize-failure-budget.cjs');
const {
  selections,agent5OriginalCandidateGroups
}=require('./agent1-adp-t1-core-access.cjs');
const {
  firstSevenMulliganProbability,loadRegisteredStartingBasicCounts
}=require('./agent1-original-field-mulligan-bonus.cjs');

/**
 * Aggregate exact initial-seven + Prize-six physical worlds by the
 * non-Basic first-turn access information required for subsequent draws.
 * ADP MUST already be in the first seven and may be chosen Active.
 *
 * @param {{adp:number,doubleDragon:number,guzmaHala:number,tagCall:number,other:number,basics:number,handSize?:number,prizeSize?:number}} input
 * @returns {{pool:number,baseDenominator:bigint,initialAdpBase:bigint,groups:Map<string,{handD:boolean,handG:boolean,handT:boolean,deckD:number,deckG:number,deckT:number,ways:bigint}>}}
 */
function buildAdpPreDrawWorlds(input) {
  const {adp,doubleDragon,guzmaHala,tagCall,other,basics,
    handSize=7,prizeSize=6}=input;
  const stock=[adp,doubleDragon,guzmaHala,tagCall,other];
  assert.ok(stock.every(x=>Number.isSafeInteger(x)&&x>=0));
  const population=stock.reduce((a,b)=>a+b,0);
  assert.ok(Number.isSafeInteger(basics)&&basics>=adp&&basics<=adp+other);
  const pool=population-handSize-prizeSize;
  assert.ok(pool>=1);
  const baseDenominator=(choose(population,handSize)-
    choose(population-basics,handSize))*
    choose(population-handSize,prizeSize);
  assert.ok(baseDenominator>0n);
  const initialAdpBase=(choose(population,handSize)-
    choose(population-adp,handSize))*
    choose(population-handSize,prizeSize);
  const groups=new Map();
  for(const hand of selections(stock,handSize)) {
    if(hand.counts[0]<1)continue;
    const afterHand=stock.map((n,i)=>n-hand.counts[i]);
    for(const prize of selections(afterHand,prizeSize)) {
      const afterPrize=afterHand.map((n,i)=>n-prize.counts[i]);
      const row={
        handD:hand.counts[1]>0,
        handG:hand.counts[2]>0,
        handT:hand.counts[3]>0,
        deckD:afterPrize[1],deckG:afterPrize[2],deckT:afterPrize[3]
      };
      const key=JSON.stringify(row);
      const existing=groups.get(key);
      const ways=hand.ways*prize.ways;
      if(existing)existing.ways+=ways;
      else groups.set(key,{...row,ways});
    }
  }
  const actual=Array.from(groups.values()).reduce((s,x)=>s+x.ways,0n);
  assert.equal(actual,initialAdpBase,'Every physical initial ADP world audited');
  return {pool,baseDenominator,initialAdpBase,groups};
}

/**
 * Exact category partition for seeing m uniform physical cards out of
 * remaining deck after 7+6, regardless of their random order. m=1 is
 * a single normal turn draw. When the opponent mulligans k times and
 * every optional bonus card is accepted, m=k+1, barring deck exhaustion.
 *
 * Each category is named after the resource route that becomes available
 * first: direct DDE, then held G&H, then Tag Call finding G&H in deck.
 * Discard two for G&H, Item lock, opponent threat, and other pathways
 * are deliberately omitted. This is NOT any full turn or game policy.
 *
 * @param {ReturnType<typeof buildAdpPreDrawWorlds>} worlds
 * @param {number} observedDraws
 * @returns {object}
 */
function exactRoutesAfterObservedDraws(worlds,observedDraws) {
  const {pool,baseDenominator,initialAdpBase,groups}=worlds;
  assert.ok(Number.isSafeInteger(observedDraws)&&
    observedDraws>=1&&observedDraws<=pool);
  const totalDrawSelections=choose(pool,observedDraws);
  const denominator=baseDenominator*totalDrawSelections;
  const marginalAdp=initialAdpBase*totalDrawSelections;
  const routes={
    directDoubleDragon:0n,heldGuzmaHala:0n,
    tagCallToGuzmaHala:0n
  };
  for(const r of groups.values()) {
    const noD=choose(pool-r.deckD,observedDraws);
    let direct=0n,supporter=0n,tag=0n;
    if(r.handD)direct=totalDrawSelections;
    else if(r.deckD>0) {
      direct=totalDrawSelections-noD;
      if(r.handG)supporter=noD;
      else if(r.deckG>0) {
        const noDG=choose(pool-r.deckD-r.deckG,observedDraws);
        supporter=noD-noDG;
        if(r.handT)tag=noDG;
        else tag=noDG-choose(pool-r.deckD-r.deckG-r.deckT,observedDraws);
      }
    }
    assert.ok(direct>=0n&&supporter>=0n&&tag>=0n);
    assert.ok(direct+supporter+tag<=totalDrawSelections);
    routes.directDoubleDragon+=r.ways*direct;
    routes.heldGuzmaHala+=r.ways*supporter;
    routes.tagCallToGuzmaHala+=r.ways*tag;
  }
  const combinedCoreAccess=Object.values(routes).reduce((s,n)=>s+n,0n);
  assert.ok(combinedCoreAccess<=marginalAdp);
  const probabilities=Object.fromEntries(Object.entries({
    ...routes,combinedCoreAccess,initialAdp:marginalAdp
  }).map(([name,n])=>[name,Number(n)/Number(denominator)]));
  return {
    observedDraws,
    numerator:Object.fromEntries(Object.entries({
      ...routes,combinedCoreAccess,initialAdp:marginalAdp
    }).map(([key,n])=>[key,n.toString()])),
    denominator:denominator.toString(),
    probabilities
  };
}

/**
 * Opponent first-seven mulligans are independent of a candidate's
 * Basic-valid seven containing ADP. With independent full deck reshuffles,
 * its failure count K has P(K=k) = (1-p)*p^k.
 *
 * Assume every bonus card is taken, then include one normal draw. The tail
 * for K >= pool is bounded rather than inventing a deck-out outcome. Upper
 * interval uses the independent probability that ADP started in hand.
 *
 * @param {ReturnType<typeof buildAdpPreDrawWorlds>} worlds
 * @param {number} opponentBasics
 * @param {object[]} [drawCurve] Cached draw curve.
 * @returns {object}
 */
function opponentMulliganMaxBonusCoreBounds(worlds,opponentBasics,drawCurve) {
  const p=firstSevenMulliganProbability(opponentBasics);
  const curve=drawCurve??Array.from({length:worlds.pool},
    (_,i)=>exactRoutesAfterObservedDraws(worlds,i+1));
  assert.equal(curve.length,worlds.pool);
  const names=['directDoubleDragon','heldGuzmaHala','tagCallToGuzmaHala',
    'combinedCoreAccess'];
  const accumulated=Object.fromEntries(names.map(x=>[x,0]));
  let mass=0,weight=1-p;
  for(let k=0;k<worlds.pool;k++) {
    mass+=weight;
    for(const name of names)
      accumulated[name]+=weight*curve[k].probabilities[name];
    weight*=p;
  }
  const tail=Math.pow(p,worlds.pool);
  const startAdp=Number(worlds.initialAdpBase)/
    Number(worlds.baseDenominator);
  assert.ok(Math.abs(mass+tail-1)<1e-10);
  return {
    opponentBasics,opponentFirstSevenMulligan:p,
    bonusPolicy:'accept-all-up-to-one-normal-draw',
    coveredMulliganCount:worlds.pool-1,
    unmodelledExcessMulliganTailProbability:tail,
    lowerCoreProbability:accumulated.combinedCoreAccess,
    upperCoreProbability:accumulated.combinedCoreAccess+tail*startAdp,
    routeLowerProbabilities:accumulated
  };
}

/**
 * Frozen ADP proposal against 29 original Aichi Basic inventories.
 * Preserves missing 23/25/28 exactly as unknown and uses no full game data.
 * @returns {object}
 */
function original29AdpBonusCoreScreen() {
  const input=agent5OriginalCandidateGroups();
  const originals=loadRegisteredStartingBasicCounts();
  const worlds=buildAdpPreDrawWorlds(input);
  const curve=Array.from({length:worlds.pool},
    (_,i)=>exactRoutesAfterObservedDraws(worlds,i+1));
  const rows=originals.originals.map(x=>({
    rank:x.rank,archetype:x.archetype,
    ...opponentMulliganMaxBonusCoreBounds(worlds,x.basics,curve)
  }));
  assert.equal(rows.length,29);
  return {
    candidate:'results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json',
    assumptions:'ADP in starting seven and selected Active; always accept available optional opponent-mulligan bonuses; one normal draw; best-case no lock/discard friction; no alternate pivots',
    baselineNoBonus:curve[0].probabilities.combinedCoreAccess,
    fieldMeanLower:rows.reduce((s,x)=>s+x.lowerCoreProbability,0)/29,
    fieldMeanUpper:rows.reduce((s,x)=>s+x.upperCoreProbability,0)/29,
    rows,missingRanks:originals.missingRanks
  };
}

module.exports={
  buildAdpPreDrawWorlds,exactRoutesAfterObservedDraws,
  opponentMulliganMaxBonusCoreBounds,original29AdpBonusCoreScreen
};
