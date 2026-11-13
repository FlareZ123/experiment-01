'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sampleHiddenPartition,sampleDecklistPrior}=require('../../simulation/twinleaf/2026-11/agent5-hidden-partition-sampler.cjs');
const {seededRandom}=require('../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs');

function registered(){return [
  ...Array(4).fill('A'),...Array(4).fill('B'),...Array(4).fill('C'),
  ...Array(4).fill('D'),...Array(4).fill('E'),...Array(4).fill('F'),
  ...Array(4).fill('G'),...Array(4).fill('H'),...Array(4).fill('I'),
  ...Array(4).fill('J'),...Array(4).fill('K'),...Array(4).fill('L'),
  ...Array(4).fill('M'),...Array(4).fill('N'),...Array(4).fill('O')
];}
function counts(xs){const m=new Map();for(const x of xs)m.set(x,(m.get(x)||0)+1);return m;}

test('K0 samples hidden hand, deck and face-down Prizes from one unseen multiset',()=>{
  const result=sampleHiddenPartition({
    registered60:registered(),knownPublic:['A','A','B','C','D','E'],
    knownHand:['D','D','E'],hiddenHandCount:0,deckCount:45,
    prizeSlots:Array.from({length:6},(_,index)=>({index})),
    random:seededRandom(123)
  });
  assert.equal(result.hand.length,3);
  assert.equal(result.deck.length,45);
  assert.equal(result.prizes.length,6);
  assert.equal(result.audit.unknownPoolCount,51);
  const all=[...result.hand,...result.deck,...result.prizes.map(x=>x.printing),
    'A','A','B','C','D','E'];
  assert.deepEqual(counts(all),counts(registered()));
});

test('K1 preserves exact Prize membership while sampling unknown positions and deck order',()=>{
  const deck=registered();
  const result=sampleHiddenPartition({
    registered60:deck,knownPublic:['A','B','C','D'],
    knownHand:['E','F'],hiddenHandCount:0,deckCount:48,
    prizeSlots:Array.from({length:6},(_,index)=>({index})),
    exactPrizeMembership:true,knownPrizeCards:['G','H','I','J','K','L'],
    random:seededRandom(77)
  });
  assert.deepEqual(counts(result.prizes.map(x=>x.printing)),
    counts(['G','H','I','J','K','L']));
  assert.equal(result.deck.length,48);
  assert.equal(result.audit.exactPrizeMembership,true);
});

test('partial Prize observations preserve known positions and sample only unknown slots',()=>{
  const result=sampleHiddenPartition({
    registered60:registered(),knownPublic:['A','B'],knownHand:['C'],
    hiddenHandCount:0,deckCount:51,
    prizeSlots:[{index:0,printing:'D'},{index:1},{index:2},{index:3},{index:4},{index:5}],
    random:seededRandom(9)
  });
  assert.equal(result.prizes.find(x=>x.index===0).printing,'D');
  assert.equal(new Set(result.prizes.map(x=>x.index)).size,6);
  assert.equal(result.audit.knownPrizeCount,1);
  assert.equal(result.audit.hiddenPrizeCount,5);
});

test('verified top prefix and known bottom multiset are preserved',()=>{
  const result=sampleHiddenPartition({
    registered60:registered(),knownPublic:['A','B'],knownHand:['C'],
    hiddenHandCount:0,deckCount:51,
    prizeSlots:Array.from({length:6},(_,index)=>({index})),
    knownTopDeck:['D','E'],knownBottomDeck:['F','G'],
    random:seededRandom(55)
  });
  assert.deepEqual(result.deck.slice(0,2),['D','E']);
  assert.deepEqual(counts(result.deck.slice(-2)),counts(['F','G']));
  assert.equal(result.deck.length,51);
});

test('rejects impossible card counts and invalid K1 membership',()=>{
  const base={registered60:registered(),knownPublic:[],knownHand:[],
    hiddenHandCount:0,deckCount:54,
    prizeSlots:Array.from({length:6},(_,index)=>({index})),
    random:seededRandom(1)};
  assert.throws(()=>sampleHiddenPartition({...base,deckCount:53}),/do not reconcile/);
  assert.throws(()=>sampleHiddenPartition({...base,exactPrizeMembership:true,
    knownPrizeCards:['A']}),/identify every current Prize/);
});

test('K1 Prize redeal preserves returned old Prizes at deck bottom while resampling new Prizes',()=>{
  const oldPrizes=['G','H','I','J','K','L'];
  const result=sampleHiddenPartition({
    registered60:registered(),knownPublic:['A','B','C','D'],
    knownHand:['E','F'],hiddenHandCount:0,deckCount:48,
    prizeSlots:Array.from({length:6},(_,index)=>({index})),
    exactPrizeMembership:false,knownBottomDeck:oldPrizes,
    random:seededRandom(2026)
  });
  assert.deepEqual(counts(result.deck.slice(-6)),counts(oldPrizes));
  // Identical printings may have multiple physical copies; membership is a
  // multiset, so only the returned copy is guaranteed to be in the bottom.
  assert.equal(result.deck.length,48);
  assert.equal(result.audit.exactPrizeMembership,false);
});

test('concealed opponent hand is sampled and partially visible hand cards are preserved',()=>{
  const result=sampleHiddenPartition({
    registered60:registered(),knownPublic:['A','B','C'],knownHand:null,
    hiddenHandCount:4,deckCount:47,
    prizeSlots:Array.from({length:6},(_,index)=>({index})),
    random:seededRandom(13)
  });
  assert.equal(result.hand.length,4);
  assert.equal(result.deck.length,47);
  assert.equal(result.prizes.length,6);
  const partial=sampleHiddenPartition({
    registered60:registered(),knownPublic:['A'],knownHand:['B'],
    hiddenHandCount:2,deckCount:50,
    prizeSlots:Array.from({length:6},(_,index)=>({index})),
    random:seededRandom(14)
  });
  assert.equal(partial.hand.length,3);
  assert.equal(partial.hand[0],'B');
  const canonical=sampleHiddenPartition({
    registered60:registered(),knownPublic:['A','B'],knownHand:null,
    hiddenHandCount:3,deckCount:49,
    prizeSlots:Array.from({length:6},(_,index)=>({index})),
    canonicalHandOrder:true,random:seededRandom(15)
  });
  assert.deepEqual(canonical.hand,canonical.hand.slice().sort());
});

test('samples an opponent decklist only from priors consistent with public cards',()=>{
  const prior=[
    {id:'red',cards:[...Array(60).fill('A')],weight:1},
    {id:'blue',cards:[...Array(60).fill('B')],weight:1},
    {id:'mixed',cards:[...Array(30).fill('A'),...Array(30).fill('B')],weight:2}
  ];
  assert.equal(sampleDecklistPrior(prior,['B','B'],()=>0).id,'blue');
  assert.equal(sampleDecklistPrior(prior,['A','B'],()=>0).id,'mixed');
  assert.throws(()=>sampleDecklistPrior(prior,['C'],()=>0),/No opponent decklist prior/);
});

test('identical public knowledge and seed produce identical worlds without hidden partition input',()=>{
  const input={registered60:registered(),knownPublic:['A','B'],knownHand:null,
    hiddenHandCount:2,deckCount:50,
    prizeSlots:Array.from({length:6},(_,index)=>({index})),
    random:seededRandom(101)};
  const a=sampleHiddenPartition(input);
  const b=sampleHiddenPartition({...input,random:seededRandom(101)});
  assert.deepEqual(a,b);
});
