'use strict';

const assert=require('node:assert/strict');

/**
 * Classify a physical Store attempt independently of the runner's
 * "settled" transport label, which also covers capped unfinished games.
 * @param {object} row The original, uncensored native runner row.
 * @param {number} maximumRootActions Registered action limit.
 * @returns {'engine-terminal'|'action-cap'|'unresolved'|string}
 */
function classifyGameDisposition(row,maximumRootActions){
  assert.ok(row&&typeof row==='object');
  assert.ok(Number.isInteger(maximumRootActions)&&maximumRootActions>0);
  if(row.capped===true||row.status==='capped'||
     row.status==='action-cap')return 'action-cap';
  if(row.status&&row.status!=='settled')return row.status;
  if(row.finished===true)return 'engine-terminal';
  if(Number.isInteger(row.actionCount)&&
     row.actionCount>=maximumRootActions)return 'action-cap';
  return 'unresolved';
}

/**
 * Retain every physical attempt, including both policy branches of a
 * paired trial. This counts game attempts, not independent source deals.
 * @param {object[]} rows Raw original Store rows.
 * @param {number} maximumRootActions Registered action limit.
 * @returns {object} Failure-inclusive summary.
 */
function censusGameDispositions(rows,maximumRootActions){
  assert.ok(Array.isArray(rows));
  const dispositions=rows.map(row=>
    classifyGameDisposition(row,maximumRootActions));
  const count=value=>dispositions.filter(x=>x===value).length;
  const engineTerminalCases=count('engine-terminal');
  const actionCapCases=count('action-cap');
  const unresolvedCases=count('unresolved');
  const nativeFailureCases=dispositions.length-engineTerminalCases-
    actionCapCases-unresolvedCases;
  return {
    attemptedGames:rows.length,
    engineTerminalCases,
    actionCapCases,
    unresolvedCases,
    nativeFailureCases,
    nativeAbortOrCapCases:rows.length-engineTerminalCases,
    allAttemptsAccountedFor:true
  };
}

module.exports={classifyGameDisposition,censusGameDispositions};
