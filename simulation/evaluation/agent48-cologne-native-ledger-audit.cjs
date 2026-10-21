'use strict';

/**
 * Audit actual accepted Cologne Store roots, segmenting real sudden-death
 * restarts into distinct game episodes. One turn number in two independent
 * episodes must never appear as an illegal same-turn second Item.
 *
 * A clock rewind can create a new epoch only with the native headless
 * restart witness. Unsupported backwards transitions fail closed.
 * This audits accepted native roots and does not establish legality of other
 * decisions, source policy competence, or the tournament-clock model.
 *
 * @param {object[]} rootLedger Complete native successful Store root list.
 * @param {object[]} [suddenDeathClockResets] Actual native reset observations.
 * @returns {object} Read-only accepted-root audit and reset attribution.
 */
function auditAcceptedCologneRoots(rootLedger,suddenDeathClockResets=[]) {
  if(!Array.isArray(rootLedger)||!Array.isArray(suddenDeathClockResets)){
    throw new TypeError('Native Store ledger and clock reset arrays required');
  }
  const resets=new Map();
  for(const reset of suddenDeathClockResets){
    const n=reset?.actionOrdinal;
    if(!Number.isSafeInteger(n)||n<0||n>=rootLedger.length||
      resets.has(n)){
      throw new Error('Invalid or duplicate native reset root ordinal');
    }
    const root=rootLedger[n];
    if(root?.turnBefore!==reset.fromTurn||
      root?.turnAfter!==reset.toTurn||
      !(reset.fromTurn>reset.toTurn)||
      reset.afterSuddenDeath!==true||
      reset.enteredSetup!==true||
      reset.action!==root.action){
      throw new Error('Unauthenticated native sudden-death reset');
    }
    resets.set(n,reset);
  }

  const count=new Map();
  let epoch=0,previousTurn=null;
  for(let i=0;i<rootLedger.length;i++){
    const root=rootLedger[i];
    if(root?.actionOrdinal!==undefined&&root.actionOrdinal!==i){
      throw new Error('Nonconsecutive native Store root ordinal');
    }
    if(!Number.isSafeInteger(root?.turnBefore)||root.turnBefore<0){
      throw new Error('Native Store root lacks turn');
    }
    if(previousTurn!==null&&root.turnBefore<previousTurn){
      throw new Error('Clock reversal without authenticated native game epoch');
    }
    if(root.action==='PlayCardAction'&&root.card==='Canceling Cologne'){
      if(![0,1].includes(root.playerSlot)||root.turnBefore<1){
        throw new Error('Cologne Store root lacks real seat or turn');
      }
      const key=JSON.stringify([epoch,root.playerSlot,root.turnBefore]);
      count.set(key,(count.get(key)||0)+1);
    }
    if(Number.isSafeInteger(root.turnAfter)&&root.turnAfter<root.turnBefore){
      if(!resets.has(i)){
        throw new Error('Unverified backwards turn transition in Store ledger');
      }
      epoch++;
      previousTurn=null;
    }else{
      if(resets.has(i)){
        throw new Error('Restart witness without backwards Store turn transition');
      }
      previousTurn=root.turnBefore;
    }
  }
  const bySeat={'0':0,'1':0};
  const duplicateAcceptedBySeatTurn=[];
  for(const [key,n] of count){
    const [gameEpoch,seat,turn]=JSON.parse(key);
    bySeat[String(seat)]+=n;
    if(n>1){
      duplicateAcceptedBySeatTurn.push({epoch:gameEpoch,seat,turn,count:n});
    }
  }
  return {
    accepted:bySeat['0']+bySeat['1'],bySeat,
    episodes:epoch+1,authenticatedRestarts:resets.size,
    duplicateAcceptedBySeatTurn,
    acceptedOncePerSeatTurn:duplicateAcceptedBySeatTurn.length===0,
    scope:'Accepted native Store PlayCardAction roots only, segmented by authenticated native game epochs. Missing rejected proposals and unqualified game rules remain.'
  };
}
module.exports={auditAcceptedCologneRoots};
