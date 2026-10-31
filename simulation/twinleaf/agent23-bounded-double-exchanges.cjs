'use strict';

const assert=require('node:assert/strict');
const {cardKind}=
  require('./opponent-hidden-live-root-probe.cjs');

/**
 * Choose a bounded set of two disjoint physical hand/deck swaps. Both swaps
 * are applied to the SAME detached world; neither is a live action. This
 * exposes two-card thresholds missed by every one-card counterfactual.
 *
 * A "path" is an unordered pair of disjoint (hand index, deck index)
 * exchanges. Distinct paths may produce identical printing multisets if
 * the hand or deck contains repeated printings; preserve the exact
 * path-denominator interpretation and do not call it unique-world coverage.
 * Selection reads concealed printings only after an authentic game ends.
 *
 * @param {object[]} hand Opponent hidden hand physical instances.
 * @param {object[]} deck Opponent hidden deck physical instances.
 * @param {number} [limit] Number of disjoint double-swap paths to test.
 * @returns {{available:number,exchanges:object[],exhaustive:boolean}}
 */
function selectBoundedDoubleExchanges(hand,deck,limit=16){
  assert.ok(Array.isArray(hand)&&Array.isArray(deck));
  assert.ok(Number.isSafeInteger(limit)&&limit>=1&&limit<=64);
  const singles=[];
  for(let hi=0;hi<hand.length;hi++){
    for(let di=0;di<deck.length;di++){
      if(hand[hi].fullName===deck[di].fullName)continue;
      const a=cardKind(hand[hi]),b=cardKind(deck[di]);
      singles.push({
        handIndex:hi,deckIndex:di,kindPair:a+'-vs-'+b,
        crossKind:a!==b
      });
    }
  }
  const paths=[];
  for(let i=0;i<singles.length;i++){
    const a=singles[i];
    for(let j=i+1;j<singles.length;j++){
      const b=singles[j];
      if(a.handIndex===b.handIndex||a.deckIndex===b.deckIndex)continue;
      paths.push({
        swaps:[a,b],
        exchangeKind:[a.kindPair,b.kindPair].sort().join(' + '),
        crossKindCount:Number(a.crossKind)+Number(b.crossKind)
      });
    }
  }
  // Deliberately favor contrasts of visible card categories, without
  // inspecting the candidate policy's action or the value of any printing.
  paths.sort((a,b)=>b.crossKindCount-a.crossKindCount||
    a.swaps[0].handIndex-b.swaps[0].handIndex||
    a.swaps[1].handIndex-b.swaps[1].handIndex||
    a.swaps[0].deckIndex-b.swaps[0].deckIndex||
    a.swaps[1].deckIndex-b.swaps[1].deckIndex);
  const selected=[],chosen=new Set(),seenKinds=new Set();
  for(let i=0;i<paths.length&&selected.length<limit;i++){
    if(seenKinds.has(paths[i].exchangeKind))continue;
    chosen.add(i);
    seenKinds.add(paths[i].exchangeKind);
    selected.push(paths[i]);
  }
  const seenHandIndices=new Set(),seenDeckIndices=new Set();
  for(const path of selected){
    for(const s of path.swaps){
      seenHandIndices.add(s.handIndex);
      seenDeckIndices.add(s.deckIndex);
    }
  }
  while(selected.length<limit&&selected.length<paths.length){
    let best=-1,bestValue=-1;
    for(let i=0;i<paths.length;i++){
      if(chosen.has(i))continue;
      const candidate=paths[i];
      let novelty=0;
      for(const s of candidate.swaps){
        if(!seenHandIndices.has(s.handIndex))novelty+=2;
        if(!seenDeckIndices.has(s.deckIndex))novelty++;
      }
      if(novelty>bestValue){best=i;bestValue=novelty;}
    }
    assert.ok(best>=0);
    chosen.add(best);
    const current=paths[best];
    selected.push(current);
    for(const s of current.swaps){
      seenHandIndices.add(s.handIndex);
      seenDeckIndices.add(s.deckIndex);
    }
  }
  return {available:paths.length,exchanges:selected,
    exhaustive:selected.length===paths.length};
}

module.exports={selectBoundedDoubleExchanges};
