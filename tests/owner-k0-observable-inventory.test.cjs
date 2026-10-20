'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerK0ObservableInventory,observedOwnerZones}=
  require('../simulation/twinleaf/owner-k0-observable-inventory.cjs');

const card=fullName=>({fullName});
const hidden=label=>new Proxy({opaque:label},{
  get(target,property,receiver) {
    if(property==='fullName'||property==='name'||property==='set')
      throw new Error('Illicit concealed identity read: '+label);
    return Reflect.get(target,property,receiver);
  }
});

/** @returns {object} Pinned Player-shaped owner with physical card zones. */
function ownerFixture(deckLabels=['J','K'],prizeLabels=['L','M']) {
  return {
    hand:{cards:[card('A')]},
    discard:{cards:[card('B')]},
    lostzone:{cards:[card('C')]},
    stadium:{cards:[card('D')]},
    supporter:{cards:[card('E')]},
    active:{cards:[card('F'),card('G')]},
    bench:[{cards:[card('H'),card('I')]},{cards:[]}],
    deck:{cards:deckLabels.map(hidden)},
    prizes:prizeLabels.map(name=>({cards:[hidden(name)]}))
  };
}
const registered='ABCDEFGHIJKLM'.split('');

test('K0 public zones count each physical stack, supporter and stadium once',()=>{
  const owner=ownerFixture();
  const zone=observedOwnerZones(owner);
  assert.deepEqual(zone.printings,'ABCDEFGHI'.split(''));
  assert.deepEqual(zone.zoneCounts,{
    hand:1,discard:1,lostzone:1,stadium:1,supporter:1,
    active:2,bench0:2,bench1:0
  });
  const result=ownerK0ObservableInventory({
    owner,registered,deckUnsearched:true
  });
  assert.deepEqual(result.pool,['J','K','L','M']);
  assert.equal(result.deckCount,2);
  assert.equal(result.prizeCount,2);
  assert.equal(result.fullDeckCount,2);
  assert.equal(result.fullPrizeCount,2);
});

test('observable pool invariant under concealed deck/Prize card permutations',()=>{
  const base=ownerK0ObservableInventory({
    owner:ownerFixture(['J','K'],['L','M']),
    registered,deckUnsearched:true
  });
  const changed=ownerK0ObservableInventory({
    owner:ownerFixture(['M','L'],['K','J']),
    registered,deckUnsearched:true
  });
  assert.deepEqual(changed,base);
});

test('previously public but still concealed copies subtract from appropriate unknown channel',()=>{
  const result=ownerK0ObservableInventory({
    owner:ownerFixture(),registered,deckUnsearched:true,
    observedDeckPrintings:['J'],observedPrizePrintings:['L']
  });
  assert.deepEqual(result.pool,['K','M']);
  assert.deepEqual([result.deckCount,result.prizeCount],[1,1]);
  assert.deepEqual(result.observedDeckPrintings,['J']);
  assert.deepEqual(result.observedPrizePrintings,['L']);
});

test('never infer K0 from source cards or accept impossible owner inventory',()=>{
  assert.throws(()=>ownerK0ObservableInventory({
    owner:ownerFixture(),registered
  }),/first-search provenance/);
  assert.throws(()=>ownerK0ObservableInventory({
    owner:ownerFixture(),registered,deckUnsearched:false
  }),/first-search provenance/);
  assert.throws(()=>ownerK0ObservableInventory({
    owner:ownerFixture(),registered,deckUnsearched:true,
    observedDeckPrintings:['L','M','K']
  }),/exceed physical hidden zones/);
  assert.throws(()=>ownerK0ObservableInventory({
    owner:ownerFixture(),registered:['A'],deckUnsearched:true
  }),/Known card absent|reconcile/);
  const owner=ownerFixture();
  delete owner.stadium;
  assert.throws(()=>ownerK0ObservableInventory({
    owner,registered,deckUnsearched:true
  }),/Missing owner-observable zone stadium/);
});

test('source-printed 60-card rank6 inventory reconciles without reading 53 concealed identities',()=>{
  const original=require('../results/aichi-2026/full-decklists.json');
  const source=original.decks.find(deck=>deck.rank===6);
  const keys=source.cards.flatMap(entry=>
    Array(entry.count).fill(entry.name+' '+entry.printing.set));
  assert.equal(keys.length,60);
  // Synthetic owner-visible snapshot for accounting only, not an actual draw.
  const known=keys.slice(0,7);
  const owner={
    hand:{cards:known.map(card)},discard:{cards:[]},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},
    active:{cards:[]},bench:Array.from({length:5},()=>({cards:[]})),
    deck:{cards:Array.from({length:47},(_,i)=>hidden('deck'+i))},
    prizes:Array.from({length:6},(_,i)=>({cards:[hidden('prize'+i)]}))
  };
  const result=ownerK0ObservableInventory({
    owner,registered:keys,deckUnsearched:true
  });
  assert.equal(result.deckCount,47);
  assert.equal(result.prizeCount,6);
  assert.equal(result.pool.length,53);
});

test('authentic owner knowledge epoch prevents false K0 after any search or full review',()=>{
  const {createOwnerDeckKnowledgeEpoch}=
    require('../simulation/twinleaf/owner-deck-knowledge-epoch.cjs');
  const input=()=>({owner:ownerFixture(),registered,deckUnsearched:true});
  const virgin=createOwnerDeckKnowledgeEpoch();
  assert.equal(ownerK0ObservableInventory({
    ...input(),knowledgeEpoch:virgin
  }).pool.length,4);
  const searched=createOwnerDeckKnowledgeEpoch();
  searched.observeOwnerDeckSearch();
  assert.throws(()=>ownerK0ObservableInventory({
    ...input(),knowledgeEpoch:searched
  }),/contradicted by owner epoch/);
  const reviewed=createOwnerDeckKnowledgeEpoch();
  reviewed.observeFullOwnPrizes();
  reviewed.invalidateAfterHiddenPrizeRedeal();
  assert.throws(()=>ownerK0ObservableInventory({
    ...input(),knowledgeEpoch:reviewed
  }),/contradicted by owner epoch/);
  assert.throws(()=>ownerK0ObservableInventory({
    ...input(),knowledgeEpoch:{}
  }),/Authenticated owner knowledge epoch required/);
});

test('Tool-equipped owner K0 counts canonical attached Tools and Energy only once',()=>{
  const owner=ownerFixture();
  owner.active.tools=[card('N')];
  owner.bench[0].tools=[card('O')];
  // Pinned energies.cards is only a secondary index into active.cards.
  owner.active.energies={cards:[owner.active.cards[1]]};
  const result=ownerK0ObservableInventory({
    owner,registered:[...registered,'N','O'],deckUnsearched:true
  });
  assert.deepEqual(result.pool,['J','K','L','M']);
  assert.deepEqual(result.visibleZonePrintings,[...'ABCDEFGHI','N','O'].sort());
  assert.equal(result.zoneCounts.activeTools,1);
  assert.equal(result.zoneCounts.bench0Tools,1);
  assert.equal(result.zoneCounts.active,2);
  assert.equal(result.visibleZonePrintings.filter(x=>x==='G').length,1);
});

test('Tool-equipped K0 is invariant under concealed identity permutations',()=>{
  const prepare=(deck,prizes)=>{
    const owner=ownerFixture(deck,prizes);
    owner.active.tools=[card('N')];
    owner.bench[0].tools=[card('O')];
    return ownerK0ObservableInventory({
      owner,registered:[...registered,'N','O'],deckUnsearched:true
    });
  };
  assert.deepEqual(prepare(['J','K'],['L','M']),
    prepare(['M','L'],['K','J']));
});

test('malformed visible Tool zone is rejected before K0 belief construction',()=>{
  const owner=ownerFixture();
  owner.active.tools={cards:[card('N')]};
  assert.throws(()=>observedOwnerZones(owner),
    /Malformed owner Tool zone active/);
});
