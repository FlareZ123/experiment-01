'use strict';
function strictK0Unknown(registered,known){
 const counts=new Map();
 for(const name of registered)counts.set(name,(counts.get(name)||0)+1);
 for(const name of known){const n=counts.get(name)||0;
  if(n===0)throw new Error('Known card absent from registered inventory');
  counts.set(name,n-1);
 }
 return [...counts].flatMap(([name,count])=>Array(count).fill(name)).sort();
}
module.exports={strictK0Unknown};

/** @param {{registered:string[],known:string[],deckCount:number,unseenPrizeCount:number}} input */
function strictK0Belief(input){
 const pool=strictK0Unknown(input.registered,input.known);
 if(!Number.isSafeInteger(input.deckCount)||input.deckCount<0||
    !Number.isSafeInteger(input.unseenPrizeCount)||input.unseenPrizeCount<0||
    pool.length!==input.deckCount+input.unseenPrizeCount)
  throw new Error('Unknown deck and Prize counts must reconcile');
 return {pool,deckCount:input.deckCount,prizeCount:input.unseenPrizeCount};
}
module.exports.strictK0Belief=strictK0Belief;
