'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,knownOwnerOutsideDeckAndPrizes,unseenOwnDeckBasicsPosterior}=
  require('../simulation/evaluation/agent26-owner-k0-unseen-basic-posterior.cjs');

const VIP='Battle VIP Pass FST';
const A='Genesect V FST',B='Mew V FST',F='Filler Trainer SET';
const basics=new Set([A,B]);
const deck=[...Array(4).fill(A),...Array(4).fill(B),VIP,
  ...Array(51).fill(F)];
const assumptions={unseenZonesExchangeable:true};

/** @returns {object} */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:1,actorSeat:0,ownerK1:null,
    ownHand:[VIP,A,F,F,F,F],
    ownPublic:{
      active:{evolutionPrintings:[B],energies:[],tools:[]},
      bench:[null,null,null,null,null],
      stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      deckCount:47,prizeCount:6
    },
    opponentPublic:{get concealedHand(){throw new Error('private opponent read');}},
    ownTurnResources:{itemPlayLocked:false}
  };
}

test('exact BigInt choose with impossible cases and 60-card middle',()=>{
  assert.equal(choose(60,30),118264581564861424n);
  assert.equal(choose(53,6),22957480n);
  assert.equal(choose(4,5),0n);
});

test('K0 exact posterior: zero guarantee, overwhelmingly likely actual target',()=>{
  const r=unseenOwnDeckBasicsPosterior(view(),deck,basics,assumptions);
  assert.equal(r.guaranteedMinimumBasicsInDeck,0);
  assert.equal(r.basicUnseen,6);
  assert.equal(r.unseenCards,53);
  assert.equal(r.probabilityNoBasicsInDeck,1/22957480);
  assert.equal(r.probabilityAtLeastOneBasicInDeck,1-1/22957480);
  assert.equal(r.distribution[0].basicsInDeck,0);
  assert.equal(r.distribution.at(-1).basicsInDeck,6);
  assert.ok(Math.abs(r.distribution.reduce((s,x)=>s+x.probability,0)-1)<1e-14);
  assert.ok(Math.abs(r.distribution.reduce((s,x)=>s+
    x.basicsInDeck*x.probability,0)-r.expectedBasicsInDeck)<1e-13);
  assert.equal(r.competitiveGameQualified,false);
});

test('guaranteed Basic if unknown Basic count exceeds Prize capacity',()=>{
  const extra=[...Array(5).fill(A),...Array(4).fill(B),VIP,
    ...Array(50).fill(F)];
  const r=unseenOwnDeckBasicsPosterior(view(),extra,basics,assumptions);
  assert.equal(r.guaranteedMinimumBasicsInDeck,1);
  assert.equal(r.probabilityNoBasicsInDeck,0);
  assert.equal(r.probabilityAtLeastOneBasicInDeck,1);
});

test('zero hidden Basic and no prizes special cases',()=>{
  const d=[A,B,VIP,...Array(57).fill(F)];
  const r=unseenOwnDeckBasicsPosterior(view(),d,basics,assumptions);
  assert.deepEqual(r.distribution,[{basicsInDeck:0,probability:1}]);
  assert.equal(r.probabilityAtLeastOneBasicInDeck,0);
  const v=view();
  v.ownPublic.prizeCount=0;
  v.ownPublic.deckCount=53;
  const allInDeck=unseenOwnDeckBasicsPosterior(v,deck,basics,assumptions);
  assert.equal(allInDeck.probabilityAtLeastOneBasicInDeck,1);
  assert.equal(allInDeck.distribution.length,1);
  assert.equal(allInDeck.distribution[0].basicsInDeck,6);
});

test('owner physical outside deck includes Stadium, attached Energy and Tool',()=>{
  const v=view();
  v.ownPublic.stadium=[F];
  v.ownPublic.active.energies=[F];
  v.ownPublic.bench[0]={
    evolutionPrintings:[F],energies:[],tools:[F]
  };
  v.ownPublic.deckCount=43;
  const result=unseenOwnDeckBasicsPosterior(v,deck,basics,assumptions);
  assert.equal(knownOwnerOutsideDeckAndPrizes(v).length,11);
  assert.equal(result.unseenCards,49);
});

test('incomplete, duplicate, or changed physical inventory fails closed',()=>{
  const v=view();
  v.ownPublic.deckCount=48;
  assert.throws(()=>unseenOwnDeckBasicsPosterior(v,deck,basics,assumptions),
    /inventory is incomplete or duplicated/);
  v.ownPublic.deckCount=47;
  v.ownHand[2]='Unregistered CARD';
  assert.throws(()=>unseenOwnDeckBasicsPosterior(v,deck,basics,assumptions),
    /exceed exact registered/);
});

test('requires explicitly certified exchangeable K0 and no own K1 membership',()=>{
  assert.throws(()=>unseenOwnDeckBasicsPosterior(view(),deck,basics,{}),
    /explicitly certified/);
  const v=view();v.ownerK1={exactMembershipKnown:true};
  assert.throws(()=>unseenOwnDeckBasicsPosterior(v,deck,basics,assumptions),
    /K1 known-membership/);
});

test('every owner-only analysis ignores opponent concealed fields',()=>{
  const v=view();
  const r=unseenOwnDeckBasicsPosterior(v,deck,basics,assumptions);
  assert.equal(JSON.stringify(r).includes('private'),false);
});

test('exact hypergeometric distribution verified by small exhaustive partition',()=>{
  // Toy N=4 unseen, 2 Basics, 2 Prizes, 2 Deck. Real model holds 56
  // other visible registered cards, so all inventory invariants still hold.
  const own=Array(56).fill(F).concat([A,A,F,F]);
  const v={
    decisionKind:'owner-root',ownerK1:null,
    ownHand:[...Array(55).fill(F),F],
    ownPublic:{
      active:null,bench:[null,null,null,null,null],
      stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      deckCount:2,prizeCount:2
    }
  };
  const x=unseenOwnDeckBasicsPosterior(v,own,basics,assumptions);
  assert.deepEqual(x.distribution.map(q=>q.basicsInDeck),[0,1,2]);
  assert.ok(Math.abs(x.distribution[0].probability-1/6)<1e-15);
  assert.ok(Math.abs(x.distribution[1].probability-4/6)<1e-15);
  assert.ok(Math.abs(x.distribution[2].probability-1/6)<1e-15);
  assert.equal(x.probabilityAtLeastOneBasicInDeck,5/6);
});
