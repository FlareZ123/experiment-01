'use strict';

/**
 * Read-only count of actual successful Cologne PlayCardAction Store roots.
 * A Store ledger omits rejected attempts, so zero duplicated accepted roots
 * cannot prove that no illegal proposal was attempted by the bot.
 * @param {object[]} rootLedger
 * @returns {{accepted:number,bySeat:object,duplicateAcceptedBySeatTurn:object[],
 *    acceptedOncePerSeatTurn:boolean,scope:string}}
 */
function auditAcceptedCologneRoots(rootLedger) {
  if(!Array.isArray(rootLedger))throw new TypeError('Store ledger array required');
  const count=new Map();
  for(const root of rootLedger){
    if(root?.action!=='PlayCardAction'||root.card!=='Canceling Cologne')continue;
    if(![0,1].includes(root.playerSlot)||
      !Number.isSafeInteger(root.turnBefore)||root.turnBefore<1){
      throw new Error('Cologne Store root lacks real seat or turn');
    }
    const key=JSON.stringify([root.playerSlot,root.turnBefore]);
    count.set(key,(count.get(key)||0)+1);
  }
  const bySeat={'0':0,'1':0};
  const duplicateAcceptedBySeatTurn=[];
  for(const [key,n] of count){
    const [seat,turn]=JSON.parse(key);
    bySeat[String(seat)]+=n;
    if(n>1)duplicateAcceptedBySeatTurn.push({seat,turn,count:n});
  }
  return {
    accepted:bySeat['0']+bySeat['1'],bySeat,
    duplicateAcceptedBySeatTurn,
    acceptedOncePerSeatTurn:duplicateAcceptedBySeatTurn.length===0,
    scope:'Accepted native Store PlayCardAction roots only. Missing rejected proposals and hidden policy decisions.'
  };
}
module.exports={auditAcceptedCologneRoots};
