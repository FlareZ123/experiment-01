'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {evaluateDetachedDeckSamples}=
  require('../simulation/twinleaf/detached-deck-sampling.cjs');
const random=seed=>{let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}};
const permutation=(n,rng)=>{const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const opts={seed:77,samples:8,random,permutation,
  isCard:x=>'fullName' in x||'damageTakenLastTurn' in x};
function setup(reverse=false){const cards=[{id:3,fullName:'A'},{id:5,fullName:'B'},{id:7,fullName:'C'}];const focus={id:31,damageTakenLastTurn:0};return {turn:2,players:[{id:1,deck:{cards:reverse?cards.reverse():cards},active:{cards:[focus]}}]};}
test('same multiset, different hidden order, no live mutation from speculative damage',()=>{
  const a=setup(), b=setup(true);
  const evalFn=state=>{state.players[0].active.cards[0].damageTakenLastTurn=280;state.players[0].deck.cards[0].id+=200;return state.players[0].deck.cards[1].id};
  const score=s=>evaluateDetachedDeckSamples(s,1,{},0,evalFn,null,structuredClone,opts);
  const aBefore=structuredClone(a),bBefore=structuredClone(b);
  assert.equal(score(a),score(b));
  assert.deepEqual(a,aBefore);
  assert.deepEqual(b,bBefore);
});
test('evaluation exception does not touch original state',()=>{
  const state=setup(),snapshot=structuredClone(state);
  assert.throws(()=>evaluateDetachedDeckSamples(state,1,{},0,s=>{s.players[0].active.cards[0].damageTakenLastTurn=250;throw Error('probe')},null,structuredClone,opts),/probe/);
  assert.deepEqual(state,snapshot);
});
test('shallow or Card-alias-preserving clone is rejected before scoring',()=>{
  const state=setup();let called=0;
  assert.throws(()=>evaluateDetachedDeckSamples(state,1,{},0,()=>{called++;return 0},null,s=>({...s,players:s.players.map(p=>({...p,deck:{cards:p.deck.cards.slice()}}))}),opts),/live Card reference/);
  assert.equal(called,0);
});
test('clone with detached deck but shared active card is rejected before speculative action',()=>{
  const state=setup();let called=0;
  const shallowCardClone=s=>{
    const copied=structuredClone(s);
    copied.players[0].active.cards[0]=s.players[0].active.cards[0];
    return copied;
  };
  assert.throws(()=>evaluateDetachedDeckSamples(state,1,{},0,()=>{called++;return 0},null,shallowCardClone,opts),/live Card reference/);
  assert.equal(called,0);
});

test('symbol-keyed hidden Card aliases are rejected',()=>{
  const state=setup();let called=0;const secret=Symbol('hiddenCard');
  const stealth=s=>{const clone=structuredClone(s);clone[secret]=s.players[0].active.cards[0];return clone};
  assert.throws(()=>evaluateDetachedDeckSamples(state,1,{},0,()=>{called++;return 1},null,stealth,opts),/live Card reference/);
  assert.equal(called,0);
});

test('known card at deck top survives speculative shuffle',()=>{
  const original=setup();
  const seen=[];
  const options={...opts,knownTopCount:1,knownTopVerified:true};
  evaluateDetachedDeckSamples(original,1,{},0,state=>{
    const names=state.players[0].deck.cards.map(card=>card.fullName);
    seen.push(names);
    assert.equal(names[0],'A');
    return 1;
  },null,structuredClone,options);
  assert.equal(seen.length,options.samples);
  assert.equal(original.players[0].deck.cards[0].fullName,'A');
});

test('known top requires observation evidence',()=>{
  assert.throws(()=>evaluateDetachedDeckSamples(
    setup(),1,{},0,()=>1,null,structuredClone,
    {...opts,knownTopCount:1}),/verified observed prefix/);
});

test('reordering unobserved suffix leaves every sampled score unchanged',()=>{
  const a=setup(),b=setup();
  b.players[0].deck.cards.reverse();
  b.players[0].deck.cards.unshift(b.players[0].deck.cards.pop());
  const options={...opts,knownTopCount:1,knownTopVerified:true};
  const score=state=>evaluateDetachedDeckSamples(
    state,1,{},0,
    sample=>sample.players[0].deck.cards[1].id,
    null,structuredClone,options);
  assert.equal(score(a),score(b));
  assert.equal(a.players[0].deck.cards[0].fullName,'A');
  assert.equal(b.players[0].deck.cards[0].fullName,'A');
});
test('known prefix cannot exceed remaining deck',()=>{
  assert.throws(()=>evaluateDetachedDeckSamples(
    setup(),1,{},0,()=>1,null,structuredClone,
    {...opts,knownTopCount:4,knownTopVerified:true}),/exceeds deck length/);
});

test('K0 pooled deck and hidden Prize partitions give identical sample scores',()=>{
  const a=setup(),b=setup();
  const prizeA={id:11,fullName:'D'};
  const prizeB={id:13,fullName:'E'};
  a.players[0].prizes=[{cards:[prizeA]},{cards:[prizeB]}];
  b.players[0].prizes=[{cards:[{id:5,fullName:'B'}]},{cards:[prizeB]}];
  b.players[0].deck.cards[1]={id:11,fullName:'D'};
  const options={...opts,sampleUnknownPrizes:true,prizesUnobservedVerified:true,
    knownTopCount:1,knownTopVerified:true};
  const evaluator=sample=>{
    const deck=sample.players[0].deck.cards;
    const prized=sample.players[0].prizes.flatMap(p=>p.cards);
    assert.equal(deck[0].fullName,'A');
    assert.equal(prized.length,2);
    return deck[1].fullName==='B'?5:0;
  };
  const score=state=>evaluateDetachedDeckSamples(
    state,1,{},0,evaluator,null,structuredClone,options);
  const beforeA=structuredClone(a),beforeB=structuredClone(b);
  assert.equal(score(a),score(b));
  assert.deepEqual(a,beforeA);
  assert.deepEqual(b,beforeB);
});

test('K0 unknown-Prize sampling rejects missing observation proof',()=>{
  assert.throws(()=>evaluateDetachedDeckSamples(
    setup(),1,{},0,()=>1,null,structuredClone,
    {...opts,sampleUnknownPrizes:true}),/verified absence of Prize observations/);
});

test('K0 exhaustive four-card redeals reproduce finite-population probabilities',()=>{
  const source=setup();
  source.players[0].deck.cards.length=3;
  source.players[0].prizes=[
    {cards:[{id:11,fullName:'D'}]},
    {cards:[{id:13,fullName:'E'}]}
  ];
  const permutations=[];
  for(let a=0;a<4;a++)for(let b=0;b<4;b++)
    for(let c=0;c<4;c++)for(let d=0;d<4;d++)
      if(new Set([a,b,c,d]).size===4)permutations.push([a,b,c,d]);
  let next=0;
  let prizedHit=0;
  const options={...opts,samples:permutations.length,
    permutation:n=>{assert.equal(n,4);return permutations[next++]},
    sampleUnknownPrizes:true,prizesUnobservedVerified:true,
    knownTopCount:1,knownTopVerified:true};
  const expected= evaluateDetachedDeckSamples(
    source,1,{},0,state=>{
      const player=state.players[0];
      if(player.prizes.some(prize=>prize.cards[0].fullName==='B'))prizedHit++;
      return player.deck.cards[1].fullName==='B'?1:0;
    },null,structuredClone,options);
  assert.equal(permutations.length,24);
  assert.equal(expected,1/4);
  assert.equal(prizedHit,12);
  assert.equal(source.players[0].prizes[0].cards[0].fullName,'D');
});

test('partial hypothetical evaluation abstains instead of selecting favourable worlds',()=>{
  const state=setup(),original=structuredClone(state);
  let evaluated=0;
  const speculative=(sample)=>{
    sample.players[0].deck.cards[0].id+=100;
    evaluated++;
    return evaluated===8?undefined:100;
  };
  const partial=evaluateDetachedDeckSamples(
    state,1,{},0,speculative,null,structuredClone,{...opts,samples:8});
  assert.equal(partial,undefined);
  assert.equal(evaluated,8);
  const alternative=evaluateDetachedDeckSamples(
    state,1,{},0,()=>60,null,structuredClone,{...opts,samples:8});
  assert.equal(alternative,60);
  assert.deepEqual(state,original);
});

test('complete finite world scores are averaged while invalid values fail closed',()=>{
  const state=setup();
  let index=0;
  const scores=[10,20,30,40];
  const result=evaluateDetachedDeckSamples(
    state,1,{},0,()=>scores[index++],null,structuredClone,
    {...opts,samples:4});
  assert.equal(result,25);
  assert.equal(index,4);
  assert.throws(()=>evaluateDetachedDeckSamples(
    state,1,{},0,()=>NaN,null,structuredClone,opts),/finite score/);
  assert.throws(()=>evaluateDetachedDeckSamples(
    state,1,{},0,()=>Infinity,null,structuredClone,opts),/finite score/);
});

test('invalid sampling preconditions reject missing players and zero samples',()=>{
  const state=setup();
  assert.throws(()=>evaluateDetachedDeckSamples(
    state,999,{},0,()=>100,null,structuredClone,opts),
    /requires an acting player/);
  assert.throws(()=>evaluateDetachedDeckSamples(
    state,1,{},0,()=>100,null,structuredClone,
    {...opts,samples:0}),/positive integer sample count/);
});

test('K1 known Prize membership permits position-only hidden permutations',()=>{
  const source=setup();
  const prizeCards=[
    {id:11,fullName:'D'},{id:13,fullName:'E'},{id:17,fullName:'F'}
  ];
  const a=structuredClone(source),b=structuredClone(source);
  a.players[0].prizes=prizeCards.map(card=>({isSecret:true,cards:[card]}));
  b.players[0].prizes=prizeCards.slice().reverse().map(
    card=>({isSecret:true,cards:[card]}));
  const options={...opts,shuffleKnownPrizePositions:true,
    prizeCompositionKnownVerified:true,prizePositionsUnobservedVerified:true,
    knownTopCount:1,knownTopVerified:true};
  const score=state=>evaluateDetachedDeckSamples(
    state,1,{},0,sampled=>{
      const p=sampled.players[0];
      assert.deepEqual(
        p.prizes.flatMap(slot=>slot.cards).map(card=>card.fullName).sort(),
        ['D','E','F']);
      assert.deepEqual(
        p.deck.cards.map(card=>card.fullName).sort(),['A','B','C']);
      assert.equal(p.deck.cards[0].fullName,'A');
      return p.prizes[0].cards[0].id;
    },null,structuredClone,options);
  const beforeA=structuredClone(a),beforeB=structuredClone(b);
  assert.equal(score(a),score(b));
  assert.deepEqual(a,beforeA);
  assert.deepEqual(b,beforeB);
});

test('known unlocated Prize slots exhaust exactly to uniform target probability',()=>{
  const state=setup();
  state.players[0].prizes=['D','E','F'].map((name,i)=>({
    isSecret:true,cards:[{id:i+11,fullName:name}]
  }));
  const permutations=[
    [0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]
  ];
  let k=0;
  const options={...opts,samples:6,knownTopCount:1,knownTopVerified:true,
    shuffleKnownPrizePositions:true,prizeCompositionKnownVerified:true,
    prizePositionsUnobservedVerified:true,
    permutation:n=>{
      if(n===2)return [0,1];
      assert.equal(n,3);
      return permutations[k++];
    }};
  const proportion=evaluateDetachedDeckSamples(
    state,1,{},0,s=>s.players[0].prizes[0].cards[0].fullName==='E'?1:0,
    null,structuredClone,options);
  assert.equal(k,6);
  assert.equal(proportion,1/3);
  assert.equal(state.players[0].prizes[0].cards[0].fullName,'D');
});

test('Prize position-only sampling rejects unproven or incompatible knowledge',()=>{
  const state=setup();
  state.players[0].prizes=[{
    isSecret:true,cards:[{id:41,fullName:'KnownPrize'}]
  }];
  const valid={...opts,shuffleKnownPrizePositions:true,
    prizeCompositionKnownVerified:true,prizePositionsUnobservedVerified:true};
  const score=options=>evaluateDetachedDeckSamples(
    state,1,{},0,()=>1,null,structuredClone,options);
  assert.throws(()=>score({...valid,prizeCompositionKnownVerified:false}),
    /verified observations/);
  assert.throws(()=>score({...valid,prizePositionsUnobservedVerified:false}),
    /verified observations/);
  assert.throws(()=>score({...valid,sampleUnknownPrizes:true}),
    /samplers are exclusive/);
  assert.throws(()=>score({...valid,observedPrizeSlots:[
    {prizeIndex:0,cardIndex:0,fullName:'KnownPrize'}]}),
    /complete observation ledger/);
  state.players[0].prizes[0].isSecret=false;
  assert.throws(()=>score(valid),/Unobserved Prize positions must be face down/);
});


test('shared non-Card metadata object is rejected before evaluation',()=>{
  const state=setup(),before=structuredClone(state);
  state.metadata={publicTick:0};
  let calls=0;
  const clone=value=>{
    const copy=structuredClone(value);
    if(value===state)copy.metadata=state.metadata;
    return copy;
  };
  assert.throws(()=>evaluateDetachedDeckSamples(
    state,1,{},0,()=>{calls++;state.metadata.publicTick++;return 1},
    null,clone,opts),/live State object/);
  assert.equal(calls,0);
  assert.equal(state.metadata.publicTick,0);
  assert.deepEqual(state.players,before.players);
});

test('each hypothetical evaluation receives a private action instance',()=>{
  const state=setup(),action={target:{index:1},attempts:0};
  const seen=[];
  const mean=evaluateDetachedDeckSamples(
    state,1,action,0,(world,id,sampledAction)=>{
      assert.equal(id,1);
      assert.equal(sampledAction.target.index,1);
      assert.equal(sampledAction.attempts,0);
      seen.push(sampledAction);
      sampledAction.target.index=99;
      sampledAction.attempts++;
      return world.players[0].deck.cards.length;
    },null,structuredClone,opts);
  assert.equal(mean,3);
  assert.equal(seen.length,opts.samples);
  assert.equal(new Set(seen).size,opts.samples);
  assert.deepEqual(action,{target:{index:1},attempts:0});
});

test('an action referencing source State is rejected as non-index-based',()=>{
  const state=setup(),action={target:state.players[0].deck};
  let calls=0;
  assert.throws(()=>evaluateDetachedDeckSamples(
    state,1,action,0,()=>{calls++;return 1},
    null,structuredClone,opts),/action must not reference live State objects/);
  assert.equal(calls,0);
});

test('a clone retaining an original action subobject is rejected',()=>{
  const state=setup(),action={target:{index:1}},before=structuredClone(action);
  let calls=0;
  const clone=value=>{
    if(value===action)return {target:action.target};
    return structuredClone(value);
  };
  assert.throws(()=>evaluateDetachedDeckSamples(
    state,1,action,0,()=>{calls++;return 1},
    null,clone,opts),/action clone retained a live action/);
  assert.equal(calls,0);
  assert.deepEqual(action,before);
});


test('vendor-style original-State prototype links are rejected',()=>{
  const state=setup();state.metadata={counter:0};
  let called=0;
  const clone=value=>{
    const copy=structuredClone(value);
    if(value===state)Object.setPrototypeOf(copy.metadata,state.metadata);
    return copy;
  };
  assert.throws(()=>evaluateDetachedDeckSamples(
    state,1,{},0,()=>{called++;return 1},null,clone,opts),
    /live State object through inherited prototype/);
  assert.equal(called,0);
  assert.equal(state.metadata.counter,0);
});

test('vendor-style original-Action prototype links are rejected',()=>{
  const state=setup(),action={target:{index:1}};
  let called=0;
  const clone=value=>{
    const copy=structuredClone(value);
    if(value===action)Object.setPrototypeOf(copy.target,action.target);
    return copy;
  };
  assert.throws(()=>evaluateDetachedDeckSamples(
    state,1,action,0,()=>{called++;return 1},null,clone,opts),
    /live action or State object through inherited prototype/);
  assert.equal(called,0);
  assert.equal(action.target.index,1);
});

test('partially located K1 Prizes preserve observed slots across hidden rearrangements',()=>{
  const a=setup(),b=setup();
  const prizes=['D','E','F','G'].map((name,i)=>({
    isSecret:true,cards:[{id:110+i,fullName:name}]
  }));
  a.players[0].prizes=structuredClone(prizes);
  b.players[0].prizes=structuredClone(prizes);
  const swapped=b.players[0].prizes;
  [swapped[1].cards[0],swapped[3].cards[0]]=
    [swapped[3].cards[0],swapped[1].cards[0]];
  const options={...opts,knownTopCount:1,knownTopVerified:true,
    shuffleKnownPrizePositions:true,prizeCompositionKnownVerified:true,
    prizePositionsUnobservedVerified:true,prizeObservationLedgerComplete:true,
    observedPrizeSlots:[{prizeIndex:0,cardIndex:0,fullName:'D'}]};
  const score=state=>evaluateDetachedDeckSamples(
    state,1,{},0,world=>{
      const slots=world.players[0].prizes;
      assert.equal(slots[0].cards[0].fullName,'D');
      assert.deepEqual(slots.flatMap(slot=>slot.cards)
        .map(card=>card.fullName).sort(),['D','E','F','G']);
      assert.equal(world.players[0].deck.cards[0].fullName,'A');
      return Number(slots[1].cards[0].fullName==='E');
    },null,structuredClone,options);
  const beforeA=structuredClone(a),beforeB=structuredClone(b);
  assert.equal(score(a),score(b));
  assert.deepEqual(a,beforeA);
  assert.deepEqual(b,beforeB);
  a.players[0].prizes[0].isSecret=false;
  assert.ok(Number.isFinite(score(a)),
    'A face-up known Prize slot can be preserved in the ledger');
  b.players[0].prizes[2].isSecret=false;
  assert.throws(()=>score(b),/Unobserved Prize positions must be face down/);
});

test('observed K1 residual permutations have exact one-third target probability',()=>{
  const state=setup();
  state.players[0].prizes=['D','E','F','G'].map((name,i)=>({
    isSecret:true,cards:[{id:110+i,fullName:name}]
  }));
  const permutations=[
    [0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]
  ];
  let index=0;
  const probability=evaluateDetachedDeckSamples(state,1,{},0,world=>{
    const slots=world.players[0].prizes;
    assert.equal(slots[0].cards[0].fullName,'D');
    return Number(slots[1].cards[0].fullName==='F');
  },null,structuredClone,{
    ...opts,samples:6,knownTopCount:1,knownTopVerified:true,
    shuffleKnownPrizePositions:true,prizeCompositionKnownVerified:true,
    prizePositionsUnobservedVerified:true,prizeObservationLedgerComplete:true,
    observedPrizeSlots:[{prizeIndex:0,cardIndex:0,fullName:'D'}],
    permutation:n=>{
      if(n===2)return [0,1];
      assert.equal(n,3);
      return permutations[index++];
    }
  });
  assert.equal(index,6);
  assert.equal(probability,1/3);
});
