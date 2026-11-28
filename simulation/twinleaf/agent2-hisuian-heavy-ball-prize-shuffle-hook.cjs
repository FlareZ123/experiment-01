'use strict';
/*
 * Research-owned, explicitly opt-in patch for pinned Twinleaf ASR146
 * HisuianHeavyBall.shuffleFaceDownPrizeCards.
 *
 * Pinned TS blob 894450a28fe12cb6291b14f301d7ea05e7b1f1b3
 * (ptcg-server/src/sets/09-sword-and-shield/set-astral-radiance/
 * hisuian-heavy-ball.ts at a9905a76).
 *
 * BUG: caller discards shuffleFaceDownPrizeCards(...)'s returned new
 * array, so reordering faceDownPrizeCards (a local filtered array) never
 * changes player.prizes. Patch swaps *card payloads in original slot lists*
 * instead, preserving all list object identities/slot flags and randomizing
 * the actual face-down Prize locations. Do not alter vendor source.
 */
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SOURCE_BLOB='894450a28fe12cb6291b14f301d7ea05e7b1f1b3';
const HOOK_ID='agent2-pinned-asr146-prize-shuffle-v1';
const HOOK_MARK=Symbol.for('experiment-01/'+HOOK_ID);
function fail(code,msg){throw Object.assign(new Error(msg),{code});}
function verifiedSourceCard(CardClass){
 if(typeof CardClass!=='function'||CardClass.name!=='HisuianHeavyBall')
  return false;
 try{
  const card=new CardClass();
  return card?.name==='Hisuian Heavy Ball'&&
    card?.fullName==='Hisuian Heavy Ball ASR'&&
    card?.set==='ASR'&&String(card?.setNumber)==='146';
 }catch{return false;}
}
function repairShuffleInPlace(array,rng){
 if(!Array.isArray(array))
  fail('ASR146_BAD_PRIZE_ARRAY','The Shuffle target is not the caller Prize list array');
 if(typeof rng!=='function')
  fail('ASR146_BAD_RNG','An explicit RNG function is required');
 // Use only currently face-down, occupied single-card Prize slots. A
 // multi-card Prize stack indicates an unsupported game-state invariant,
 // not a condition to silently shuffle only its first card.
 const selected=[];
 for(const list of array){
  if(!list||!Array.isArray(list.cards)||typeof list.isSecret!=='boolean')
   fail('ASR146_BAD_PRIZE_SLOT','Malformed Prize slot CardList');
  if(list.isSecret===true&&list.cards.length>0){
   if(list.cards.length!==1)
    fail('ASR146_MULTI_CARD_PRIZE','Face-down Prize slot unexpectedly contains >1 card');
   selected.push(list);
  }
 }
 if(new Set(selected).size!==selected.length)
  fail('ASR146_DUPLICATE_SLOT','One Prize CardList was passed twice');
 const shuffled=selected.map(p=>p.cards[0]);
 for(let i=shuffled.length-1;i>0;i--){
  const r=rng();
  if(!Number.isFinite(r)||r<0||r>=1)
   fail('ASR146_BAD_RNG_VALUE','RNG must return finite floats in [0,1)');
  const j=Math.floor(r*(i+1));
  [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
 }
 // Mutate only the original physical Prize CardLists; do not overwrite
 // CardList instances, isSecret/faceUpPrize, or the array of slot refs.
 selected.forEach((list,index)=>{list.cards[0]=shuffled[index];});
 return array;
}
function installPinnedHisuianHeavyBallShuffleHook({
 CardClass,enginePin,rng=Math.random
}={}){
 if(enginePin!==PIN)
  fail('ASR146_WRONG_ENGINE_PIN','Refuse hook on unverified Twinleaf revision');
 if(!verifiedSourceCard(CardClass))
  fail('ASR146_WRONG_SOURCE_CLASS','Not exact pinned ASR146 class');
 const proto=CardClass.prototype;
 const existing=proto[HOOK_MARK];
 if(existing){
  if(proto.shuffleFaceDownPrizeCards!==existing.wrapper)
   fail('ASR146_HOOK_CONFLICT','A later override conflicts with installed patch');
  return existing.publicApi;
 }
 const descriptor=Object.getOwnPropertyDescriptor(proto,'shuffleFaceDownPrizeCards');
 const original=descriptor?.value;
 if(typeof original!=='function'||!descriptor.writable)
  fail('ASR146_BAD_SOURCE_METHOD','No writable native shuffle method');
 const body=Function.prototype.toString.call(original);
 // The source signature is a compatibility check, not cryptographic
 // verification; the fixed engine commit and source blob provide that.
 if(!body.includes('faceDownPrizeCards')||!body.includes('prizePositions')||
    !body.includes('splice'))
  fail('ASR146_UNKNOWN_SHUFFLE_BODY','Pinned ignored-return implementation changed');
 const wrapped=function(array){
  if(this?.name!=='Hisuian Heavy Ball'||
     this?.fullName!=='Hisuian Heavy Ball ASR')
   fail('ASR146_WRONG_INVOCATION_SOURCE','Wrong Item invoked native hook');
  return repairShuffleInPlace(array,rng);
 };
 Object.defineProperty(proto,'shuffleFaceDownPrizeCards',{
  ...descriptor,value:wrapped
 });
 const publicApi=Object.freeze({
  id:HOOK_ID,enginePin:PIN,sourceBlob:SOURCE_BLOB,
  uninstall(){
   if(proto[HOOK_MARK]?.wrapper!==wrapped||
      proto.shuffleFaceDownPrizeCards!==wrapped)
    fail('ASR146_HOOK_CONFLICT','Cannot restore after third-party patch');
   Object.defineProperty(proto,'shuffleFaceDownPrizeCards',descriptor);
   delete proto[HOOK_MARK];
   return true;
  }
 });
 Object.defineProperty(proto,HOOK_MARK,{
  configurable:true,enumerable:false,writable:false,
  value:{wrapper:wrapped,publicApi}
 });
 return publicApi;
}
module.exports={HOOK_ID,PIN,SOURCE_BLOB,
 verifiedSourceCard,repairShuffleInPlace,
 installPinnedHisuianHeavyBallShuffleHook};
