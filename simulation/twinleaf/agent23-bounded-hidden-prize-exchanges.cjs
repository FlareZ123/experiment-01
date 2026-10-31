'use strict';

const assert=require('node:assert/strict');
const {cardKind}=
  require('./opponent-hidden-live-root-probe.cjs');

/**
 * A Prize position is eligible only when its CardList has exactly one
 * physically concealed card. No inferred access to the identity of a
 * previously revealed Prize is claimed. The native observer must still
 * check the actor's current publicly accessible observation separately.
 *
 * @param {object[]} hand Current opponent concealed hand physical cards.
 * @param {object[]} prizes Opponent physical face-down Prize CardLists.
 * @param {number} [limit] Bounded unique-composition-first sample size.
 * @returns {object} Physical swap-path and unique hand-printing counts.
 */
function selectBoundedHandPrizeExchanges(hand,prizes,limit=16){
  assert.ok(Array.isArray(hand)&&Array.isArray(prizes));
  assert.ok(Number.isSafeInteger(limit)&&limit>=1&&limit<=64);
  const candidates=[];
  for(let hi=0;hi<hand.length;hi++){
    for(let pi=0;pi<prizes.length;pi++){
      if(prizes[pi]?.cards?.length!==1)continue;
      const h=hand[hi],p=prizes[pi].cards[0];
      if(h.fullName===p.fullName)continue;
      const hKind=cardKind(h),pKind=cardKind(p);
      candidates.push({
        handIndex:hi,prizeIndex:pi,
        kindPair:hKind+'-vs-'+pKind,
        crossKind:hKind!==pKind,
        printingPair:JSON.stringify([h.fullName,p.fullName])
      });
    }
  }
  candidates.sort((a,b)=>Number(b.crossKind)-Number(a.crossKind)||
    a.handIndex-b.handIndex||a.prizeIndex-b.prizeIndex);
  const chosen=new Set(),exchanges=[],seenKinds=new Set();
  for(let i=0;i<candidates.length&&exchanges.length<limit;i++){
    if(seenKinds.has(candidates[i].kindPair))continue;
    chosen.add(i);seenKinds.add(candidates[i].kindPair);
    exchanges.push(candidates[i]);
  }
  const seenCompositions=new Set(exchanges.map(x=>x.printingPair));
  const seenHandIndices=new Set(exchanges.map(x=>x.handIndex));
  const seenPrizeIndices=new Set(exchanges.map(x=>x.prizeIndex));
  while(exchanges.length<limit&&exchanges.length<candidates.length){
    let winner=-1,best=-1;
    for(let i=0;i<candidates.length;i++){
      if(chosen.has(i)||seenCompositions.has(candidates[i].printingPair))
        continue;
      const c=candidates[i];
      const novelty=(seenHandIndices.has(c.handIndex)?0:2)+
        (seenPrizeIndices.has(c.prizeIndex)?0:1);
      if(novelty>best){best=novelty;winner=i;}
    }
    if(winner<0)break;
    const c=candidates[winner];
    chosen.add(winner);exchanges.push(c);
    seenCompositions.add(c.printingPair);
    seenHandIndices.add(c.handIndex);
    seenPrizeIndices.add(c.prizeIndex);
  }
  while(exchanges.length<limit&&exchanges.length<candidates.length){
    let winner=-1,best=-1;
    for(let i=0;i<candidates.length;i++){
      if(chosen.has(i))continue;
      const c=candidates[i];
      const novelty=(seenHandIndices.has(c.handIndex)?0:2)+
        (seenPrizeIndices.has(c.prizeIndex)?0:1);
      if(novelty>best){best=novelty;winner=i;}
    }
    assert.ok(winner>=0);
    const c=candidates[winner];
    chosen.add(winner);exchanges.push(c);
    seenCompositions.add(c.printingPair);
    seenHandIndices.add(c.handIndex);
    seenPrizeIndices.add(c.prizeIndex);
  }
  return {
    available:candidates.length,
    eligibleDistinctHandCompositions:
      new Set(candidates.map(x=>x.printingPair)).size,
    testedDistinctHandCompositions:seenCompositions.size,
    exchanges:exchanges.map(({printingPair,...rest})=>rest),
    exhaustive:exchanges.length===candidates.length,
    sourceZone:'opponent-face-down-prizes',
    completeRevealedHistoryVerified:false
  };
}

module.exports={selectBoundedHandPrizeExchanges};
