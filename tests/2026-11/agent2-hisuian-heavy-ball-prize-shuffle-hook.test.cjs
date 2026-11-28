'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {
 HOOK_ID,PIN,SOURCE_BLOB,verifiedSourceCard,
 repairShuffleInPlace,installPinnedHisuianHeavyBallShuffleHook
}=require('../../simulation/twinleaf/agent2-hisuian-heavy-ball-prize-shuffle-hook.cjs');
function pinnedClass(){
 return class HisuianHeavyBall {
  constructor(){
   this.name='Hisuian Heavy Ball';
   this.fullName='Hisuian Heavy Ball ASR';
   this.set='ASR';this.setNumber='146';
  }
  // Faithful source structure: only a detached list is shuffled.
  shuffleFaceDownPrizeCards(array){
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
   return prizePositions; // upstream caller discards this return.
  }
 };
}
function prizeCard(name){return {name,id:name+'-physical-copy'};}
function prize(name,secret=true){return {
 cards:name?[prizeCard(name)]:[],
 isSecret:secret,faceUpPrize:!secret,slotMark:'fixed-location'
};}
function names(slots){return slots.map(p=>p.cards[0]?.name??null);}
test('source pin and exact ASR146 type fingerprint are mandatory',()=>{
 assert.equal(PIN,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
 assert.equal(SOURCE_BLOB,'894450a28fe12cb6291b14f301d7ea05e7b1f1b3');
 assert.equal(HOOK_ID,'agent2-pinned-asr146-prize-shuffle-v1');
 const Card=pinnedClass();
 assert.equal(verifiedSourceCard(Card),true);
 assert.throws(()=>installPinnedHisuianHeavyBallShuffleHook({
  CardClass:Card,enginePin:'unverified',rng:()=>0
 }),x=>x.code==='ASR146_WRONG_ENGINE_PIN');
 assert.equal(Card.prototype.shuffleFaceDownPrizeCards.name,
  'shuffleFaceDownPrizeCards');
});
test('pinned ignored-return behavior leaves all actual Prize slots unmoved',()=>{
 const Card=pinnedClass(),item=new Card();
 const slots=[prize('A'),prize('B'),prize('C'),prize('D')];
 const originals=slots.map(p=>p.cards[0]);
 const returnValue=item.shuffleFaceDownPrizeCards(slots);
 assert.equal(Array.isArray(returnValue),true);
 // Even if returnValue has a new shuffled order, each *physical slot*
 // still holds the original card because caller ignores this return.
 for(let i=0;i<slots.length;i++)
  assert.equal(slots[i].cards[0],originals[i]);
});
test('hook performs real uniform in-place slot-payload permutation',()=>{
 const Card=pinnedClass(),item=new Card();
 const originalMethod=Card.prototype.shuffleFaceDownPrizeCards;
 const api=installPinnedHisuianHeavyBallShuffleHook({
  CardClass:Card,enginePin:PIN,rng:()=>0
 });
 assert.equal(api.id,HOOK_ID);
 const slots=[prize('A'),prize('B'),prize('C'),prize('D')];
 const refs=slots.slice(),cardRefs=slots.map(x=>x.cards.slice());
 const originalIds=new Set(slots.flatMap(p=>p.cards).map(c=>c.id));
 const returned=item.shuffleFaceDownPrizeCards(slots);
 assert.equal(returned,slots);
 assert.deepEqual(names(slots),['B','C','D','A']);
 assert.deepEqual(new Set(slots.flatMap(p=>p.cards).map(c=>c.id)),originalIds);
 for(let i=0;i<slots.length;i++){
  assert.equal(slots[i],refs[i]);
  assert.equal(slots[i].isSecret,true);
  assert.equal(slots[i].faceUpPrize,false);
  assert.equal(slots[i].slotMark,'fixed-location');
  assert.notEqual(slots[i].cards,cardRefs[i]);
  assert.equal(slots[i].cards.length,1);
 }
 assert.equal(api.uninstall(),true);
 assert.equal(Card.prototype.shuffleFaceDownPrizeCards,originalMethod);
});
test('face-up and empty Prize slots stay fixed, only hidden occupied slots move',()=>{
 const slots=[
  prize('A'),prize('X',false),prize('B'),prize(null),
  prize('C'),prize('Y',false),prize('D')
 ];
 const beforeRefs=slots.map(p=>p);
 const out=repairShuffleInPlace(slots,()=>0);
 assert.equal(out,slots);
 assert.deepEqual(names(slots),['B','X','C',null,'D','Y','A']);
 assert.equal(slots[1].isSecret,false);
 assert.equal(slots[5].isSecret,false);
 assert.equal(slots[3].cards.length,0);
 assert.ok(slots.every((p,i)=>p===beforeRefs[i]));
});
test('original source class identity, unknown version, implementation drift fail',()=>{
 const Card=pinnedClass();
 class Impostor extends Card{}
 assert.equal(verifiedSourceCard(Impostor),false);
 assert.throws(()=>installPinnedHisuianHeavyBallShuffleHook({
  CardClass:Impostor,enginePin:PIN,rng:()=>0
 }),x=>x.code==='ASR146_WRONG_SOURCE_CLASS');
 const Other=pinnedClass();
 Other.prototype.shuffleFaceDownPrizeCards=function(array){return array;};
 assert.throws(()=>installPinnedHisuianHeavyBallShuffleHook({
  CardClass:Other,enginePin:PIN,rng:()=>0
 }),x=>x.code==='ASR146_UNKNOWN_SHUFFLE_BODY');
});
test('idempotent install and safe uninstall never stack extra shuffles',()=>{
 const Card=pinnedClass();
 const api=installPinnedHisuianHeavyBallShuffleHook({
  CardClass:Card,enginePin:PIN,rng:()=>0
 });
 const next=installPinnedHisuianHeavyBallShuffleHook({
  CardClass:Card,enginePin:PIN,rng:()=>0.5
 });
 assert.equal(api,next);
 const slots=[prize('A'),prize('B'),prize('C')];
 new Card().shuffleFaceDownPrizeCards(slots);
 assert.deepEqual(names(slots),['B','C','A']);
 assert.equal(api.uninstall(),true);
 assert.throws(()=>api.uninstall(),x=>x.code==='ASR146_HOOK_CONFLICT');
});
test('reject duplicate/multi-card/malformed hidden slots before mutating',()=>{
 const a=prize('A'),b=prize('B');
 assert.throws(()=>repairShuffleInPlace([a,a,b],()=>0),
  x=>x.code==='ASR146_DUPLICATE_SLOT');
 assert.deepEqual(names([a,b]),['A','B']);
 b.cards.push(prizeCard('C'));
 assert.throws(()=>repairShuffleInPlace([a,b],()=>0),
  x=>x.code==='ASR146_MULTI_CARD_PRIZE');
 assert.deepEqual(names([a,b]),['A','B']);
 assert.throws(()=>repairShuffleInPlace([a,{}],()=>0),
  x=>x.code==='ASR146_BAD_PRIZE_SLOT');
 assert.throws(()=>repairShuffleInPlace({},()=>0),
  x=>x.code==='ASR146_BAD_PRIZE_ARRAY');
});
test('reject out-of-range RNG without mutating live slots',()=>{
 for(const value of [-0.1,1,NaN,Infinity]){
  const slots=[prize('A'),prize('B'),prize('C')];
  assert.throws(()=>repairShuffleInPlace(slots,()=>value),
   x=>x.code==='ASR146_BAD_RNG_VALUE');
  assert.deepEqual(names(slots),['A','B','C']);
 }
});
test('zero or one face-down prizes do not consume random draws',()=>{
 let draws=0;
 const rng=()=>{draws++;return 0;};
 const a=[prize('A',false),prize(null),prize('B',true)];
 repairShuffleInPlace(a,rng);
 assert.equal(draws,0);
 assert.deepEqual(names(a),['A',null,'B']);
});
