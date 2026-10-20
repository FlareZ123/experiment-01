'use strict';

const {APPLICABILITY_CELLS} = require('./agent2-rank6-applicability.cjs');

/**
 * Describe which native printed candidate Powers the rank-11 Tool Garbodor
 * window could affect. A source-first no-target board is still counted.
 * The observation is producer-reported; this does not certify live root,
 * paper rules, a denied owner action, or competitive game performance.
 *
 * @param {object|undefined} row Registered candidate observation.
 * @param {0|1} sourceSeat Physical rank-11 source seat.
 * @returns {string} One descriptive applicability cell.
 */
function rank11CandidateApplicability(row,sourceSeat){
  if(row?.rank!==11||![0,1].includes(sourceSeat))return 'unverified';
  const first=row.actualStarterSeat;
  if(row.verifiedFirstTurn!==true||![0,1].includes(first)||
    row.firstTurnPlayerId!==(first===0?101:202)||
    row.firstTurnPlayerName!==(first===0?'research-A':'research-B')||
    row.firstDrawLogName!==row.firstTurnPlayerName)return 'unverified';
  if(first!==sourceSeat)return 'candidate-first';

  const window=row.garbotoxinWindowAudit;
  const before=window?.before;
  const checks=before?.candidateInPlayPrintedPowerChecks;
  if(window?.schema!=='agent41-authentic-rank11-garbotoxin-ability-window-v1'||
    window.sourceSeat!==sourceSeat||window.candidateSeat!==1-sourceSeat||
    window.turn!==2||window.realStoreOnly!==true||
    before?.globalTurn!==2||before.sourceGarbodorHasTool!==true||
    typeof before.candidateActive!=='string'||!before.candidateActive||
    !Array.isArray(before.candidatePrintedPowerNames)||
    !Array.isArray(before.candidatePrintedPowerChecks)||
    !Array.isArray(checks))return 'unverified';

  const valid=power=>power&&typeof power.printing==='string'&&
    power.printing.length>0&&typeof power.name==='string'&&power.name.length>0&&
    typeof power.blocked==='boolean'&&
    (power.zone==='Active'&&power.benchIndex===null||
      power.zone==='Bench'&&Number.isSafeInteger(power.benchIndex)&&
      power.benchIndex>=0&&power.benchIndex<5);
  if(!checks.every(valid))return 'unverified';

  // Legacy Active-only fields are preserved by the native observer. They
  // must not contradict its complete Active/Bench Power inventory.
  const active=checks.filter(power=>power.zone==='Active');
  if(active.length!==before.candidatePrintedPowerNames.length||
    active.length!==before.candidatePrintedPowerChecks.length||
    active.some((power,i)=>power.name!==before.candidatePrintedPowerNames[i]||
      power.printing!==before.candidateActive||
      power.name!==before.candidatePrintedPowerChecks[i]?.name||
      power.blocked!==before.candidatePrintedPowerChecks[i]?.blocked)){
    return 'unverified';
  }
  if(checks.some(power=>power.blocked))return 'blocked-eligible-target';
  if(checks.length===0)return 'no-eligible-target';
  return 'eligible-no-block-observed';
}

module.exports={APPLICABILITY_CELLS,rank11CandidateApplicability};
