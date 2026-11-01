'use strict';

/**
 * Exact, conditional paper model for the two Lusamine/one Handiwork resource
 * loop in original Aichi rank 6. No card access, lock, opponent or clock.
 */
const SOURCE_RANK6={lusamine:2,handiwork:1,vsSeeker:3};

/**
 * Enumerate consecutive owner Supporter turns, beginning with L1 in hand,
 * and L2 plus H in discard. Distinct names represent physical card copies.
 * @param {number} ownTurns Number of owner turns, from 0 through 256.
 * @returns {Array<{turn:number,play:string,hand:string[],discard:string[],handiworkUses:number}>}
 */
function supporterCycle(ownTurns){
  if(!Number.isSafeInteger(ownTurns)||ownTurns<0||ownTurns>256)
    throw new RangeError('ownTurns must be an integer in [0,256]');
  const hand=['L1'];
  const discard=['L2','H'];
  const rows=[];
  let handiworkUses=0;
  for(let turn=1;turn<=ownTurns;turn++){
    const play=hand.includes('H')?'H':hand[0];
    hand.splice(hand.indexOf(play),1);
    if(play==='H'){
      discard.push('H');
      handiworkUses++;
    }else{
      const other=play==='L1'?'L2':'L1';
      for(const pick of ['H',other]){
        const i=discard.indexOf(pick);
        if(i<0)throw new Error('Loop invariant broken');
        hand.push(discard.splice(i,1)[0]);
      }
      discard.push(play);
    }
    rows.push({turn,play,hand:[...hand],discard:[...discard],handiworkUses});
  }
  return rows;
}

/**
 * Exact numbers of sequences with h heads over 2k fair coin flips.
 * Handiwork mills two cards per heads, capped by the opposing deck.
 * @param {number} uses
 * @returns {bigint[]}
 */
function coinWays(uses){
  if(!Number.isSafeInteger(uses)||uses<0||uses>128)
    throw new RangeError('uses must be an integer in [0,128]');
  let ways=[1n];
  for(let i=0;i<2*uses;i++){
    const next=Array(ways.length+1).fill(0n);
    for(let j=0;j<ways.length;j++){
      next[j]+=ways[j];
      next[j+1]+=ways[j];
    }
    ways=next;
  }
  return ways;
}

/**
 * Exact conditional chance to mill at least atLeast cards after uses plays.
 * @param {number} uses
 * @param {number} atLeast
 * @returns {{numerator:bigint,denominator:bigint,probability:number}}
 */
function millTail(uses,atLeast){
  if(!Number.isSafeInteger(atLeast)||atLeast<0)
    throw new RangeError('atLeast must be a nonnegative integer');
  const ways=coinWays(uses);
  const denominator=1n<<BigInt(2*uses);
  const minHeads=Math.ceil(atLeast/2);
  let numerator=0n;
  for(let heads=minHeads;heads<ways.length;heads++)numerator+=ways[heads];
  return {numerator,denominator,
    probability:Number(numerator)/Number(denominator)};
}

/**
 * Resource depletion by opponent's next attempted draw after kth Handiwork.
 * Exactly 2k-1 ordinary opponent turns separate the starting owner turn
 * from the kth Handiwork. Assumes one natural draw per turn and zero other
 * deck movements or interactions. This is never a game-win probability.
 * @param {number} uses Positive number of Handiwork uses.
 * @param {number} deckBeforeCycle Opponent deck stock before starting turn.
 */
function depletionByNextOpponentDraw(uses,deckBeforeCycle){
  if(!Number.isSafeInteger(uses)||uses<1)
    throw new RangeError('uses must be a positive integer');
  if(!Number.isSafeInteger(deckBeforeCycle)||deckBeforeCycle<1)
    throw new RangeError('deckBeforeCycle must be positive');
  const opponentDrawsBefore=2*uses-1;
  return {opponentDrawsBefore,handiworkUses:uses,
    ...millTail(uses,Math.max(0,deckBeforeCycle-opponentDrawsBefore))};
}

module.exports={SOURCE_RANK6,supporterCycle,coinWays,millTail,
  depletionByNextOpponentDraw};
