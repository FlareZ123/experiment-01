'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,withPrizeShuffleIgnoredReturnHook:hook
}=require('../simulation/twinleaf/agent3-prize-shuffle-ignored-return-hook.cjs');

/**
 * Exact control/data structure of the pinned helper shared by Hisuian Heavy
 * Ball and Beast Ball. Both card reducers call with a filtered COPY of Prize
 * slots and discard this returned new array.
 * @param {object[]} array Prize slot references.
 * @returns {object[]} New reordered array without original slot mutations.
 */
function originalIgnoredReturnShuffle(array){
  const faceDownPrizeCards=array.filter(p=>p.isSecret&&p.cards.length>0);
  for(let i=faceDownPrizeCards.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    const temp=faceDownPrizeCards[i];
    faceDownPrizeCards[i]=faceDownPrizeCards[j];
    faceDownPrizeCards[j]=temp;
  }
  const prizePositions=[];
  for(let i=0;i<array.length;i++){
    if(array[i].cards.length===0||!array[i].isSecret){
      prizePositions.push(array[i]);continue;
    }
    prizePositions.push(faceDownPrizeCards.splice(0,1)[0]);
  }
  return prizePositions;
}
class HisuianHeavyBall {
  shuffleFaceDownPrizeCards(array){
    return originalIgnoredReturnShuffle(array);
  }
}
class BeastBall {
  shuffleFaceDownPrizeCards(array){
    return originalIgnoredReturnShuffle(array);
  }
}
const deps={HisuianHeavyBall,BeastBall,random:()=>0};
function card(label){
  const obj={id:label};
  Object.defineProperties(obj,{
    name:{get(){throw Error('Hidden card name was read')}},
    fullName:{get(){throw Error('Hidden card printing was read')}}
  });
  return obj;
}
const slots=()=>['a','b','c'].map(name=>({
  isSecret:true,cards:[card(name)]
}));
for(const [Card,label] of [
  [HisuianHeavyBall,'Hisuian Heavy Ball ASR'],
  [BeastBall,'Beast Ball CES']
]){
  test('pinned ignored return cannot reorder original physical Prizes: '+label,()=>{
    const original=slots();
    const previous=original.map(p=>p.cards[0]);
    const filtered=original.filter(p=>p.isSecret);
    const result=new Card().shuffleFaceDownPrizeCards(filtered);
    assert.notStrictEqual(result,filtered);
    assert.deepEqual(original.map(p=>p.cards[0]),previous);
  });
  test('hook shuffles physical Prize contents despite ignored return: '+label,()=>{
    const original=slots();
    const previous=original.map(p=>p.cards[0]);
    const method=Card.prototype.shuffleFaceDownPrizeCards;
    const wrapped=hook(()=>{
      const filtered=original.filter(p=>p.isSecret);
      const result=new Card().shuffleFaceDownPrizeCards(filtered);
      assert.strictEqual(result,filtered);
      return original.map(p=>p.cards[0]);
    },deps);
    assert.deepEqual(wrapped.result,[previous[1],previous[2],previous[0]]);
    assert.equal(wrapped.audit.version,VERSION);
    assert.equal(wrapped.audit.callsByCard[label],1);
    assert.equal(wrapped.audit.shuffledEligibleSlots,3);
    assert.equal(wrapped.audit.physicalSlotsChanged,3);
    assert.equal(wrapped.audit.concealedCardFacesRead,false);
    assert.strictEqual(Card.prototype.shuffleFaceDownPrizeCards,method);
  });
}
test('face-up and vacant slots stay in place while concealed cards shuffle',()=>{
  const own=slots();
  const shown=card('face-up');
  own.splice(1,0,{isSecret:false,cards:[shown]});
  const empty={isSecret:true,cards:[]};
  own.splice(2,0,empty);
  const old=own.map(p=>p.cards[0]);
  const watched=hook(()=>{
    new HisuianHeavyBall().shuffleFaceDownPrizeCards(
      own.filter(p=>p.isSecret));
  },deps);
  assert.strictEqual(own[1].cards[0],shown);
  assert.strictEqual(own[2],empty);
  assert.equal(own[2].cards.length,0);
  assert.notStrictEqual(own[0].cards[0],old[0]);
  assert.equal(watched.audit.shuffledEligibleSlots,3);
  assert.equal(watched.audit.physicalSlotsChanged,3);
});
test('full physical Prize card multiset is conserved, including 2-card packets',()=>{
  const a=[card('a0'),card('a1')],b=[card('b0')],c=[card('c0')];
  const field=[{isSecret:true,cards:a.slice()},
    {isSecret:true,cards:b.slice()},{isSecret:true,cards:c.slice()}];
  const all=field.flatMap(p=>p.cards);
  hook(()=>new BeastBall().shuffleFaceDownPrizeCards(field),deps);
  assert.deepEqual(field.flatMap(p=>p.cards).sort((x,y)=>x.id.localeCompare(y.id)),
    all.sort((x,y)=>x.id.localeCompare(y.id)));
  assert.deepEqual(field.map(p=>p.cards.length),[1,1,2]);
});
test('hook restores both original class methods after native exception',()=>{
  const a=HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards;
  const b=BeastBall.prototype.shuffleFaceDownPrizeCards;
  assert.throws(()=>hook(()=>{
    new BeastBall().shuffleFaceDownPrizeCards(slots());
    throw new Error('native experiment failed');
  },deps),/native experiment failed/);
  assert.strictEqual(HisuianHeavyBall.prototype.shuffleFaceDownPrizeCards,a);
  assert.strictEqual(BeastBall.prototype.shuffleFaceDownPrizeCards,b);
});
test('zero or single face-down Prize is unchanged and calls are counted',()=>{
  const only={isSecret:true,cards:[card('single')]};
  const f=[only,{isSecret:true,cards:[]}];
  const before=only.cards[0];
  const watched=hook(()=>{
    new BeastBall().shuffleFaceDownPrizeCards(f);
  },deps);
  assert.strictEqual(only.cards[0],before);
  assert.equal(watched.audit.physicalSlotsChanged,0);
  assert.equal(watched.audit.shuffledEligibleSlots,1);
});
