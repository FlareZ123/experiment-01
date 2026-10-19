'use strict';
const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const CORE_FIELDS=Object.freeze(['label','seed','actions','turns','firstTurnSlot','firstTurnPlayerId','firstTurnPlayerName','firstDrawLogName','verifiedByDrawLog','finished','endReason','winner','actionCounts','actionsBySeat','cardsPlayedBySeat','terminalTransition','finalState','deckHashes','rules','prizesRemaining','phase']);
/** @param {Record<string,unknown>} actual @param {Record<string,unknown>} archived */
function verifyHistoricalMatchProjection(actual,archived) {
  assert.ok(actual && typeof actual==='object' && !Array.isArray(actual));
  assert.ok(archived && typeof archived==='object' && !Array.isArray(archived));
  const selected=value=>Object.fromEntries(CORE_FIELDS.map(key=>{
    assert.ok(Object.hasOwn(value,key),'Missing historical core field '+key);
    return [key,value[key]];
  }));
  assert.deepEqual(selected(actual),selected(archived),'Archived replay differs in a selected gameplay/outcome field');
  const otherKeys=value=>Object.keys(value).filter(key=>!CORE_FIELDS.includes(key)).sort();
  const oldKeys=otherKeys(archived),newKeys=otherKeys(actual);
  const originalSet=new Set(oldKeys),currentSet=new Set(newKeys);
  return {
    schema:'rank10-historical-match-outcome-projection-v1',matched:true,fields:CORE_FIELDS.slice(),
    entireRunMatchObjectEqual:isDeepStrictEqual(actual,archived),
    fieldsOnlyInCurrent:newKeys.filter(key=>!originalSet.has(key)),
    fieldsOnlyInArchive:oldKeys.filter(key=>!currentSet.has(key)),
    existingUncomparedFieldDifferences:oldKeys.filter(key=>currentSet.has(key)&&!isDeepStrictEqual(actual[key],archived[key])),
    knownLimitation:'Uncompared diagnostic fields may contain meaningful differences; Store root graph/action replay is the independent fidelity gate.'
  };
}
module.exports={CORE_FIELDS,verifyHistoricalMatchProjection};
