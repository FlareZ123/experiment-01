'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent3-prize-shuffle-ignored-return-hook-v1';

/**
 * A narrow research-side hook for two pinned Twinleaf card classes.
 *
 * Hisuian Heavy Ball ASR and Beast Ball CES call shuffleFaceDownPrizeCards()
 * with a FILTERED COPY of the Prize-slot array, then ignore its return value.
 * Their original method only returns a rearranged array of slot references.
 * This hook instead shuffles the concealed physical card packets among the
 * eligible existing CardList slot objects, so ignored returns remain effective.
 * Pinned Gladion's correct return assignment is not patched.
 *
 * Use a preregistered common per-game random source when comparing match arms.
 * Default Math.random is provided only for standalone gameplay experiments.
 *
 * @template T
 * @param {()=>T} execute Synchronous native Store research.
 * @param {{HisuianHeavyBall?:Function,BeastBall?:Function,random?:()=>number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPrizeShuffleIgnoredReturnHook(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const HisuianHeavyBall=deps.HisuianHeavyBall ??
    require(path.join(output,
      'sets/09-sword-and-shield/set-astral-radiance/hisuian-heavy-ball'))
      .HisuianHeavyBall;
  const BeastBall=deps.BeastBall ??
    require(path.join(output,
      'sets/08-sun-and-moon/set-celestial-storm/beast-ball'))
      .BeastBall;
  const random=deps.random??Math.random;
  assert.equal(typeof random,'function');
  const targets=[
    {label:'Hisuian Heavy Ball ASR',Card:HisuianHeavyBall},
    {label:'Beast Ball CES',Card:BeastBall}
  ];
  const originals=[];
  const audit={
    version:VERSION,
    affectedCardClasses:targets.map(t=>t.label),
    callsByCard:{'Hisuian Heavy Ball ASR':0,'Beast Ball CES':0},
    shuffledEligibleSlots:0,
    physicalSlotsChanged:0,
    returnedArrayIdentityPreserved:true,
    concealedCardFacesRead:false,
    nativePaperFidelityCertified:false,
    competitiveGamesCertified:0
  };
  function makePatched(label){
    return function shuffleFaceDownPrizeCards(array) {
      assert.ok(Array.isArray(array));
      audit.callsByCard[label]++;
      const eligible=array.filter(slot =>
        slot.isSecret===true && slot.cards.length>0);
      const packets=eligible.map(slot=>slot.cards.slice());
      const previous=packets.map(packet=>packet.slice());
      audit.shuffledEligibleSlots+=eligible.length;
      for(let i=packets.length-1;i>0;i--){
        const j=Math.floor(random()*(i+1));
        const temp=packets[i];
        packets[i]=packets[j];
        packets[j]=temp;
      }
      for(let i=0;i<eligible.length;i++){
        if(packets[i].length!==previous[i].length ||
          packets[i].some((card,k)=>card!==previous[i][k]))
          audit.physicalSlotsChanged++;
        eligible[i].cards.splice(0,eligible[i].cards.length,...packets[i]);
      }
      return array;
    };
  }
  try {
    for(const target of targets){
      const old=Object.getOwnPropertyDescriptor(
        target.Card.prototype,'shuffleFaceDownPrizeCards');
      assert.equal(typeof old?.value,'function');
      assert.equal(old.configurable,true);
      originals.push({Card:target.Card,old});
      Object.defineProperty(target.Card.prototype,'shuffleFaceDownPrizeCards',
        {...old,value:makePatched(target.label)});
    }
    return {result:execute(),audit};
  } finally {
    for(let i=originals.length-1;i>=0;i--){
      const {Card,old}=originals[i];
      Object.defineProperty(Card.prototype,'shuffleFaceDownPrizeCards',old);
    }
  }
}

module.exports={VERSION,withPrizeShuffleIgnoredReturnHook};
