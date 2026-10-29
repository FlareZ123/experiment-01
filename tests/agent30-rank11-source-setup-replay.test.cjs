'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  originalSource,replay,firstOwnTurnHand
}=require('../simulation/evaluation/agent30-rank11-source-setup-replay.cjs');

// Frozen original setup-owner SHA256 receipts from the 29 October native scout,
// artifact 12917901362, agent41-prospective-canonical-32.json.
// Each distinct source deal was repeated against two candidate sixties.
const receipts=[
  [3149897025,1,'7315041abec1599ffb88b98a9addaf4cfc6cf14ebe8ef4367fff4a5c368af976'],
  [24941728,1,'ffb2c2e6c108aa55d79fe1b93b3aac2fdb56be7971054bbef7706a152443dd73'],
  [340754762,1,'b89d0ea85f8c7f0fe3feafa6b8eda00719dc84f032492bc5bd81ade6ed3d5a06'],
  [2307728896,1,'3fdd3da86ad13250027d49ee30b49b01b6f752fa787af34c78af3a0eebae993a'],
  [2246176619,0,'1259ec27ff5a2866b45a5334e1d1d89ffb52ea08f51172d8202271adca981b43'],
  [3403930699,0,'d27aadaea48baf4121fc0be009ef3bfe2e4278decb1878f4dc1c1ec821000096'],
  [2147808079,0,'b74eb42d1fe616c75f18c21603a4fb3ca33e9f8cfb46865e855ce431340e7650'],
  [1254634394,0,'e63cf37ce60623aa62d76c9a1ad898933c6da335421cc12e6f9b3b7ca6a528ba']
];

test('full fixed rank11 printed source contains sixty physical cards',()=>{
  const cards=originalSource();
  assert.equal(cards.length,60);
  assert.equal(cards.filter(name=>name==='Boost Shake EVS').length,2);
  assert.equal(cards.filter(name=>name==='Trubbish FST').length,2);
  assert.equal(cards.filter(name=>name==='Garbodor BKP').length,2);
});

test('all eight source setup deals reproduce unmodified native SHA receipts',()=>{
  for(const [seed,seat,sha] of receipts){
    const deal=replay(seed,seat);
    assert.equal(deal.setupSevenSha256,sha,'Physical source deal: '+seed);
    assert.equal(deal.initialSeven.length,7);
    assert.equal(deal.prizeSix.length,6);
  }
});

test('seed 2307728896 has a pregame held-Seal + VIP + Float route',()=>{
  const deal=replay(2307728896,1);
  assert.deepEqual(deal.initialSeven,[
    'Dark Patch ASR','Float Stone BKT','Battle VIP Pass FST',
    'Oranguru V ASR','Escape Rope BST','Carmine TWM','Mega Absol ex M1L'
  ]);
  assert.equal(deal.firstNaturalDraw,'Forest Seal Stone SIT');
  assert.deepEqual(deal.prizeSix,[
    'Darkness Energy MEE','Darkness Energy MEE','Mega Absol ex M1L',
    'Battle VIP Pass FST','Latias ex SSP','Muscle Band XY'
  ]);
  const hand=firstOwnTurnHand(deal,['Oranguru V ASR','Mega Absol ex M1L']);
  for(const name of ['Battle VIP Pass FST','Float Stone BKT','Forest Seal Stone SIT'])
    assert.ok(hand.includes(name),name);
  assert.equal(hand.some(name=>name.startsWith('Boost Shake ')),false);
  const unavailable=[...deal.initialSeven,...deal.prizeSix,deal.firstNaturalDraw];
  for(const name of ['Trubbish FST','Garbodor BKP','Boost Shake EVS']){
    assert.equal(originalSource().filter(card=>card===name).length,2);
    assert.equal(unavailable.filter(card=>card===name).length,0,
      name+' must have both original copies available outside these zones');
  }
});

test('the setup audit rejects ungrounded seed, seat and chosen Basic',()=>{
  assert.throws(()=>replay(-1,1));
  assert.throws(()=>replay(1,3));
  assert.throws(()=>firstOwnTurnHand(replay(2307728896,1),
    ['Trubbish FST']));
});
