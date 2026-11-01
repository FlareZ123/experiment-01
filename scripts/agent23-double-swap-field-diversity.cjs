'use strict';

const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const {selectBoundedDoubleExchanges}=
  require('../simulation/twinleaf/agent23-bounded-double-exchanges.cjs');

/** Exact historical baseline from parent commit e18cecce, selection only. */
function historicalPhysicalSelector(hand,deck,limit=16){
  const singles=[];
  for(let hi=0;hi<hand.length;hi++){
    for(let di=0;di<deck.length;di++){
      if(hand[hi].fullName===deck[di].fullName)continue;
      const a=hand[hi].kind,b=deck[di].kind;
      singles.push({handIndex:hi,deckIndex:di,kindPair:a+'-vs-'+b,
        crossKind:a!==b});
    }
  }
  const paths=[];
  for(let i=0;i<singles.length;i++){
    for(let j=i+1;j<singles.length;j++){
      const a=singles[i],b=singles[j];
      if(a.handIndex===b.handIndex||a.deckIndex===b.deckIndex)continue;
      paths.push({swaps:[a,b],
        exchangeKind:[a.kindPair,b.kindPair].sort().join(' + '),
        crossKindCount:Number(a.crossKind)+Number(b.crossKind)});
    }
  }
  paths.sort((a,b)=>b.crossKindCount-a.crossKindCount||
    a.swaps[0].handIndex-b.swaps[0].handIndex||
    a.swaps[1].handIndex-b.swaps[1].handIndex||
    a.swaps[0].deckIndex-b.swaps[0].deckIndex||
    a.swaps[1].deckIndex-b.swaps[1].deckIndex);
  const selected=[],chosen=new Set(),seenKinds=new Set();
  for(let i=0;i<paths.length&&selected.length<limit;i++){
    if(seenKinds.has(paths[i].exchangeKind))continue;
    chosen.add(i);seenKinds.add(paths[i].exchangeKind);
    selected.push(paths[i]);
  }
  const seenHand=new Set(),seenDeck=new Set();
  for(const p of selected){
    for(const s of p.swaps){
      seenHand.add(s.handIndex);seenDeck.add(s.deckIndex);
    }
  }
  while(selected.length<limit&&selected.length<paths.length){
    let best=-1,bestValue=-1;
    for(let i=0;i<paths.length;i++){
      if(chosen.has(i))continue;
      const p=paths[i];let novelty=0;
      for(const s of p.swaps){
        if(!seenHand.has(s.handIndex))novelty+=2;
        if(!seenDeck.has(s.deckIndex))novelty++;
      }
      if(novelty>bestValue){best=i;bestValue=novelty;}
    }
    if(best<0)break;
    chosen.add(best);
    const p=paths[best];selected.push(p);
    for(const s of p.swaps){
      seenHand.add(s.handIndex);seenDeck.add(s.deckIndex);
    }
  }
  return {available:paths.length,exchanges:selected};
}

/** Stable deterministic xorshift32, a sampling mechanism only. */
function xorshift32(seed){
  let value=seed>>>0;
  return ()=>{
    value^=value<<13;
    value^=value>>>17;
    value^=value<<5;
    return (value>>>0)/4294967296;
  };
}

/** @param {object} source Original published 60-card source registry entry. */
function openingSplit(source){
  const cards=[];
  for(const entry of source.cards){
    const fullName=entry.printing?.set+'-'+entry.printing?.number+
      '|'+entry.name;
    const kind=entry.category==='Trainer'?'trainer':
      entry.category==='Energy'?'energy':'pokemon';
    for(let copy=0;copy<entry.count;copy++){
      cards.push({fullName,kind,
        ...(kind==='trainer'?{trainerType:1}:
          kind==='energy'?{energyType:1}:{stage:0})});
    }
  }
  assert.equal(cards.length,60,'Original source 60 is required');
  const random=xorshift32((0xA23BC7E1^source.rank)>>>0);
  for(let i=cards.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [cards[i],cards[j]]=[cards[j],cards[i]];
  }
  return {hand:cards.slice(0,7),prizes:cards.slice(7,13),
    deck:cards.slice(13)};
}

/** Resulting hand multiset independent of a selector's composition key. */
function handMultiset(hand,deck,path){
  const finalHand=hand.map(card=>card.fullName);
  for(const {handIndex,deckIndex} of path.swaps){
    finalHand[handIndex]=deck[deckIndex].fullName;
  }
  return JSON.stringify(finalHand.sort());
}

function run(){
  const rows=[];
  for(const source of field.decks){
    const {hand,deck}=openingSplit(source);
    const previous=historicalPhysicalSelector(hand,deck,16);
    const current=selectBoundedDoubleExchanges(hand,deck,16);
    assert.equal(previous.available,current.available);
    const oldCount=new Set(previous.exchanges.map(p=>
      handMultiset(hand,deck,p))).size;
    const newCount=new Set(current.exchanges.map(p=>
      handMultiset(hand,deck,p))).size;
    assert.equal(newCount,current.testedDistinctHandCompositions);
    rows.push({rank:source.rank,archetype:source.archetype,
      oldDistinctHands:oldCount,newDistinctHands:newCount,
      allEligibleDistinctHands:current.eligibleDistinctHandCompositions,
      eligiblePhysicalPaths:current.available});
  }
  const sum=key=>rows.reduce((n,r)=>n+r[key],0);
  return {
    schema:'agent23-unconditioned-29-source-one-opening-double-world-diversity-v1',
    rng:'xorshift32(0xA23BC7E1 XOR rank), Fisher-Yates',
    setup:'7 unconditioned opening hand, 6 prize, 47 deck',
    samplePerSource:1,physicalPathBudget:16,
    originalPrintedSources:rows.length,
    oldDistinctTotal:sum('oldDistinctHands'),
    newDistinctTotal:sum('newDistinctHands'),
    improved:rows.filter(r=>r.newDistinctHands>r.oldDistinctHands).length,
    tied:rows.filter(r=>r.newDistinctHands===r.oldDistinctHands).length,
    worsened:rows.filter(r=>r.newDistinctHands<r.oldDistinctHands).length,
    gameplayQualified:false,rows
  };
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,openingSplit,historicalPhysicalSelector,handMultiset};
