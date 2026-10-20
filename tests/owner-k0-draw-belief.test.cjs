'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerK0NextDrawBelief}=require('../simulation/twinleaf/owner-k0-draw-belief.cjs');

const registered60=[{printing:'A',copies:20},{printing:'B',copies:20},
  {printing:'C',copies:20}];
const view=()=>({ownerK1:null,ownHand:['A','A','B'],ownPublic:{
  active:{evolutionPrintings:['A','B'],energies:['B'],tools:[]},
  bench:[null,null,null,null,null],
  stadium:[],discard:['C','C','C','C'],lostZone:[],resolvingSupporter:[],
  deckCount:45,prizeCount:6
}});
const assumptions={
  assumeFullyExchangeableUnseenCards:true,
  ownerKnowledgeEpoch:{
    exactMembership:false,liveSearches:0,
    fullPrizeReviews:0,hiddenPrizeRedeals:0
  }
};

test('attached Energy is counted once although present in two views',()=>{
  const result=ownerK0NextDrawBelief(view(),registered60,assumptions);
  assert.equal(result.unknownTotal,51);
  assert.deepEqual(result.distribution.map(x=>[x.printing,x.copies]),
    [['A',17],['B',18],['C',16]]);
  assert.equal(result.distribution.reduce((n,x)=>n+x.numerator,0),51);
});

test('forbidden concealed fields do not affect next-draw distribution',()=>{
  const a=view(),b=view();
  a.opponentHand=['A'];
  b.opponentHand=['B'];
  a.deckOrder=['A','B'];
  b.deckOrder=['B','A'];
  a.prizeContents=['A'];
  b.prizeContents=['C'];
  assert.deepEqual(ownerK0NextDrawBelief(a,registered60,assumptions),
    ownerK0NextDrawBelief(b,registered60,assumptions));
});

test('explicit hidden-order premise and K1 authenticity are mandatory',()=>{
  assert.throws(()=>ownerK0NextDrawBelief(view(),registered60),
    /exchangeable/);
  const known=view();
  known.ownerK1={epoch:2,exactMembershipKnown:true};
  assert.throws(()=>ownerK0NextDrawBelief(known,registered60,assumptions),
    /K1 owner/);
});

test('source accounting refuses incompatible public zones',()=>{
  const wrong=view();
  wrong.ownPublic.deckCount=44;
  assert.throws(()=>ownerK0NextDrawBelief(wrong,registered60,assumptions),
    /do not account/);
});


test('a searched deck or unauthenticated K0 epoch fails closed',()=>{
  const unverified={assumeFullyExchangeableUnseenCards:true};
  assert.throws(()=>ownerK0NextDrawBelief(view(),registered60,unverified),
    /authenticated owner K0/);
  const searched={
    ...assumptions,
    ownerKnowledgeEpoch:{...assumptions.ownerKnowledgeEpoch,liveSearches:1}
  };
  assert.throws(()=>ownerK0NextDrawBelief(view(),registered60,searched),
    /authenticated owner K0/);
});
