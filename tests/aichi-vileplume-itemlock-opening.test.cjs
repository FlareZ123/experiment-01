'use strict';

const assert=require('node:assert/strict');
const { KEYS, classify, exactItemLockOpportunity }=
  require('../scripts/aichi-vileplume-itemlock-opening.cjs');

/**
 * Enumerate every fully ordered miniature game resource sequence: seven card
 * types have distinct identities here, and we use physical permutations to
 * independently validate the Prize survival/search constraints.
 * @param {Record<string,number>} counts
 * @param {number} opening
 * @param {number} prizes
 */
function brute(counts,opening,prizes) {
  const deck=KEYS.flatMap(key=>Array(counts[key]).fill(key));
  const used=Array(deck.length).fill(false),order=[];
  let seen=0,accepted=0,direct=0,found=0;
  const count=(cards,key)=>cards.reduce((sum,c)=>sum+(c===key),0);
  function visit() {
    if(order.length===deck.length) {
      seen++;
      const init=order.slice(0,opening);
      if(!['b','q','e','o'].some(key=>count(init,key)>0)) return;
      accepted++;
      const hand=[...init,order[opening+prizes]];
      const unseen=order.slice(opening+prizes+1);
      if(!count(hand,'b')||!count(hand,'q')||
        !count(unseen,'u')||!count(unseen,'v')) return;
      const started=count(init,'b')>0;
      const tool=count(hand,'m')>0;
      const energy=started?
        ['j','s','g'].some(key=>count(hand,key)>0):
        count(hand,'j')>0;
      const ready=tool&&energy;
      const searched=(
        count(hand,'h')>0 ||
        count(hand,'t')>0&&count(unseen,'h')>0
      ) &&
      (tool||count(unseen,'m')>0) &&
      (energy||(started?
        ['j','s'].some(key=>count(unseen,key)>0):
        count(unseen,'j')>0));
      if(ready)direct++;
      if(ready||searched)found++;
      return;
    }
    for(let i=0;i<deck.length;i++) {
      if(used[i]) continue;
      used[i]=true;order.push(deck[i]);visit();order.pop();used[i]=false;
    }
  }
  visit();
  return {
    physicalOrders:seen,
    validOpeningProbability:accepted/seen,
    directStageChainConditional:direct/accepted,
    stageChainResourceConditional:found/accepted
  };
}

const miniature={
  b:1,q:1,e:0,o:1,h:1,t:0,m:1,j:1,s:0,g:0,u:1,v:1,x:1
};
const bruteResult=brute(miniature,3,2);
const exact=exactItemLockOpportunity(miniature,{opening:3,prizes:2});
for(const key of ['validOpeningProbability','directStageChainConditional',
  'stageChainResourceConditional']) {
  assert.ok(Math.abs(bruteResult[key]-exact[key])<1e-12,
    key+': '+bruteResult[key]+' vs '+exact[key]);
}
assert.equal(bruteResult.physicalOrders,362880);

const source=require('../results/aichi-2026/full-decklists.json');
const rank2=source.decks.find(deck=>deck.rank===2);
assert.equal(rank2.archetype,'Vileplume Control');
const reported=exactItemLockOpportunity(classify(rank2.cards));
assert.ok(Math.abs(reported.validOpeningProbability-0.8614093191287199)<1e-12);
assert.ok(Math.abs(reported.stageChainResourceConditional-0.039810662132692035)<1e-12);
assert.ok(Math.abs(reported.directStageChainConditional-0.005174655932347844)<1e-12);
assert.ok(Math.abs(reported.stageChainByBunnelby.initial.stageReady+
 reported.stageChainByBunnelby.firstDraw.stageReady-
 reported.stageChainResourceConditional)<1e-12);
console.log(JSON.stringify({test:'Source 60 and 362880-permutation independent stage-chain oracle',
  bruteResult, reported,passed:true},null,2));
