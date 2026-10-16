'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {makePaperPrizeShuffle,installHisuianHeavyBallPrizeShuffleHook}=
  require('../simulation/twinleaf/hisuian-heavy-ball-prize-hook.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {HisuianHeavyBall}=require(path.join(root,
  'sets/09-sword-and-shield/set-astral-radiance/hisuian-heavy-ball'));
const {CardList}=require(path.join(root,'game/store/state/card-list'));

/** @param {string} value @param {boolean} secret */
function prize(value,secret=true) {
  const list=new CardList();
  list.isSecret=secret;
  list.cards=[{name:value}];
  return list;
}

/** @param {CardList[]} lists */
function labels(lists) {
  return lists.map(list=>list.cards.map(card=>card.name).join(','));
}

/** @param {()=>void} action */
function withFixedRandom(action) {
  const previous=Math.random;
  Math.random=()=>0;
  try {action();} finally {Math.random=previous;}
}

test('pinned upstream returns reordered Prize lists but fails to change actual slots',()=>{
  const card=new HisuianHeavyBall();
  const positions=['A','B','C'].map(value=>prize(value));
  const realPrizeSlots=positions.slice();
  withFixedRandom(()=>{
    const returned=card.shuffleFaceDownPrizeCards(realPrizeSlots.filter(x=>x.isSecret));
    assert.deepEqual(labels(returned),['B','C','A']);
    assert.deepEqual(labels(realPrizeSlots),['A','B','C']);
  });
});

test('opt-in hook applies shuffle to existing Prize positions and restores upstream',()=>{
  const original=HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards;
  const restore=installHisuianHeavyBallPrizeShuffleHook();
  try {
    const card=new HisuianHeavyBall();
    const positions=['A','B','C'].map(value=>prize(value));
    const originalSlotReferences=positions.slice();
    withFixedRandom(()=>{
      const returned=card.shuffleFaceDownPrizeCards(positions.filter(x=>x.isSecret));
      assert.deepEqual(labels(returned),['B','C','A']);
    });
    assert.deepEqual(labels(positions),['B','C','A']);
    positions.forEach((position,index)=>{
      assert.strictEqual(position,originalSlotReferences[index]);
      assert.equal(position.isSecret,true);
    });
    assert.throws(()=>installHisuianHeavyBallPrizeShuffleHook(),/already installed/);
  } finally {restore();}
  assert.strictEqual(HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards,original);
});

test('face-up Prize and an empty facedown position retain their slots',()=>{
  const original=HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards;
  const wrapped=makePaperPrizeShuffle(original);
  const card=new HisuianHeavyBall();
  const positions=[prize('A'),prize('PUBLIC',false),prize('B'),prize('C')];
  const empty=new CardList();
  empty.isSecret=true;
  positions.splice(2,0,empty);
  const physical=positions.slice();
  withFixedRandom(()=>{
    wrapped.call(card,positions.filter(p=>p.isSecret));
  });
  assert.deepEqual(labels(positions),['B','PUBLIC','','C','A']);
  assert.equal(positions[1].isSecret,false);
  assert.deepEqual(positions.map((p,i)=>p===physical[i]),Array(5).fill(true));
  const allCards=positions.flatMap(p=>p.cards.map(card=>card.name)).sort();
  assert.deepEqual(allCards,['A','B','C','PUBLIC']);
});
