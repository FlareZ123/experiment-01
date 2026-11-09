'use strict';
const assert=require('node:assert/strict');

/**
 * Independent postgame public-state diagnostic. This deliberately does not
 * infer a specific official Pokémon win condition from Twinleaf's generic
 * engine-game-end label. In particular, living opponents plus remaining
 * Prizes strongly suggest draw exhaustion, but deck counts and a verified
 * official clock are absent from the native artifact.
 *
 * @param {object} row One completed native development result.
 * @returns {{category:string,turns:number|null,winningSeat:number|null}}
 */
function classifyNativeTerminal(row){
  const turns=Number.isSafeInteger(row?.turns)?row.turns:null;
  const winningSeat=row?.winner;
  if(row?.finished!==true||row?.error||
     (winningSeat!==0&&winningSeat!==1))
    return {category:'nonbinary-or-native-abort',turns,winningSeat:null};
  const prizes=row.finalPrizes;
  if(!Array.isArray(prizes)||prizes.length!==2||
     !prizes.every(n=>Number.isSafeInteger(n)&&n>=0))
    return {category:'insufficient-final-prize-evidence',turns,winningSeat};
  if(prizes[winningSeat]===0)
    return {category:'native-win-with-zero-prizes',turns,winningSeat};
  const loser=1-winningSeat;
  const board=row.finalBoard;
  if(!Array.isArray(board)||board.length!==2)
    return {category:'insufficient-final-board-evidence',turns,winningSeat};
  const loserBoard=board[loser];
  if(!loserBoard||typeof loserBoard!=='object')
    return {category:'insufficient-final-board-evidence',turns,winningSeat};
  const alive=Boolean(loserBoard.active)||(
    Array.isArray(loserBoard.bench)&&
    loserBoard.bench.some(p=>p&&typeof p==='object'));
  return {category:alive?
    'native-win-with-prizes-and-opponent-pokemon':
    'native-win-opponent-without-pokemon',turns,winningSeat};
}

/**
 * Audit exactly all registered trial rows with zero imputation.
 * @param {object[]} rows Recorded actual Store games and engine-abort sidecars.
 * @returns {object}
 */
function summarizeNativeTerminals(rows){
  assert.ok(Array.isArray(rows));
  const categories={};
  const turnsByCategory={};
  for(const row of rows){
    const {category,turns}=classifyNativeTerminal(row);
    categories[category]=(categories[category]??0)+1;
    if(!turnsByCategory[category])turnsByCategory[category]=[];
    if(turns!==null)turnsByCategory[category].push(turns);
  }
  const turnRange={};
  for(const [category,turns] of Object.entries(turnsByCategory))
    turnRange[category]=turns.length?
      {min:Math.min(...turns),max:Math.max(...turns),
       median:median(turns)}:null;
  return {attempts:rows.length,categories,turnRange,
    clockCertified:false,competitiveGameQualified:false};
}
function median(numbers){
  const sorted=numbers.slice().sort((a,b)=>a-b);
  const i=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[i]:(sorted[i-1]+sorted[i])/2;
}

/** Posthoc summary of the expected archived CI artifact shape. */
function summarizeArchive(payload){
  assert.ok(payload&&typeof payload==='object');
  const batches=payload.rawNativeBatches??payload.actualNativeRuns;
  assert.ok(Array.isArray(batches)&&batches.length===2);
  return {schema:'agent12-native-terminal-decomposition-v1',
    artifactsCompared:batches.length,
    arms:batches.map(batch=>summarizeNativeTerminals(batch.rows)),
    objective:'Native terminal cause decomposition, no clock calibration'};
}
module.exports={classifyNativeTerminal,summarizeNativeTerminals,summarizeArchive};
