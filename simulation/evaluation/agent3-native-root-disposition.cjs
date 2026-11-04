'use strict';
const VERSION='agent3-native-root-disposition-v1';

/**
 * Fail-closed description of a historical native Store attempt's 48-root
 * development horizon. Explicit native engine error status always wins.
 * Terminal means the engine finished, never that paper/field won.
 *
 * @param {object} row Raw development row.
 * @param {number} rootLimit Registered maximum accepted native actions.
 * @returns {{schema:string,kind:string,observedRootCount:number|null,
 *   finished:boolean|null,paperQualified:false}}
 */
function describeRootDisposition(row,rootLimit){
  if(!row||typeof row!=='object'||Array.isArray(row)){
    throw new TypeError('Raw attempt row required');
  }
  if(!Number.isSafeInteger(rootLimit)||rootLimit<1){
    throw new RangeError('Registered positive root limit required');
  }
  const rawCount=row.nativeRootActionCount??row.rootActionCount;
  const count=Number.isSafeInteger(rawCount)&&rawCount>=0?rawCount:null;
  const finished=typeof row.finished==='boolean'?row.finished:null;
  let kind;
  if(typeof row.status==='string'&&row.status.length>0){
    kind=row.status;
  }else if(count===null||finished===null){
    kind='native-disposition-unobserved';
  }else if(count>rootLimit){
    kind='native-root-limit-overrun-anomaly';
  }else if(finished){
    kind='native-terminal-unqualified';
  }else if(count===rootLimit){
    kind='native-root-horizon-exhausted-unqualified';
  }else{
    kind='native-nonterminal-early-return-unqualified';
  }
  return {schema:VERSION,kind,observedRootCount:count,
    finished,paperQualified:false};
}
module.exports={VERSION,describeRootDisposition};
