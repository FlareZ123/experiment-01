'use strict';
const assert=require('node:assert/strict');

/**
 * Plan a paper-legal optional count for an authenticated owner's Peonia
 * Prize prompt using only occupied Prize indices and an own-event ledger.
 * The caller supplies the number of source-own hand cards it can safely
 * place back as Prizes. No face-down Prize identities or opponent secrets.
 *
 * The visited array must have been updated only after accepted genuine
 * Peonia replacements and invalidated after any untracked Prize movement,
 * reordering, shuffle or other card that changes source-owned knowledge.
 *
 * @param {{
 *   occupiedIndices:number[],
 *   visitedIndices:number[],
 *   safeReplacementCount:number
 * }} frame
 * @returns {{indices:number[],unvisitedSelected:number}|null}
 */
function chooseOwnerPeoniaSlots(frame){
  assert.ok(frame&&Array.isArray(frame.occupiedIndices)&&
    Array.isArray(frame.visitedIndices));
  const {occupiedIndices,visitedIndices,safeReplacementCount}=frame;
  const sorted=a=>[...a].sort((x,y)=>x-y);
  const valid=a=>a.every(i=>Number.isSafeInteger(i)&&i>=0&&i<6)&&
    new Set(a).size===a.length;
  assert.ok(valid(occupiedIndices)&&valid(visitedIndices),
    'Peonia owner Prize ledger requires unique indices in [0,5]');
  assert.ok(Number.isSafeInteger(safeReplacementCount)&&
    safeReplacementCount>=0,'Must determine safe owner hand replacements');
  const occupied=sorted(occupiedIndices);
  const visited=new Set(visitedIndices);
  const size=Math.min(3,occupied.length,safeReplacementCount);
  if(size===0)return null;
  const fresh=occupied.filter(i=>!visited.has(i));
  const old=occupied.filter(i=>visited.has(i));
  const indices=[...fresh,...old].slice(0,size);
  return {indices,
    unvisitedSelected:indices.filter(i=>!visited.has(i)).length};
}

/**
 * Update own-visited physical Prize positions after a genuinely accepted
 * full Peonia payment and replacement. This does not read card identities.
 * @param {number[]} previouslyVisited
 * @param {number[]} acceptedIndices
 * @returns {number[]}
 */
function recordAcceptedPeoniaPositions(previouslyVisited,acceptedIndices){
  assert.ok(Array.isArray(previouslyVisited)&&
    Array.isArray(acceptedIndices));
  const indices=[...new Set([...previouslyVisited,...acceptedIndices])];
  assert.ok(indices.every(i=>Number.isSafeInteger(i)&&i>=0&&i<6));
  return indices.sort((a,b)=>a-b);
}

module.exports={chooseOwnerPeoniaSlots,recordAcceptedPeoniaPositions};
