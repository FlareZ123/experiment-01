'use strict';

const ABORT_STATUSES = new Set([
  'engine-error', 'engine-physical-invalid', 'paper-supporter-quota-veto',
  'engine-exception', 'native-abort'
]);
const REJECTION_STATUSES = new Set([
  'registration-rejected', 'preflight-rejected', 'precheck-rejected'
]);

/**
 * Classify a canonical bilateral runner row without assuming successful
 * rows carry status. Native end disposition never proves a paper game win.
 * @param {unknown} row Native runner row.
 * @returns {{kind:string,rawStatus:string|null,finished:boolean|null,
 *   endReason:string|null,winner:number|null,reason:string,
 *   competitivelyQualified:boolean}}
 */
function classifyNativeAttempt(row) {
  if (row === null || row === undefined) return {
    kind:'MISSING_ROW',rawStatus:null,finished:null,endReason:null,
    winner:null,reason:'No native runner row exists',competitivelyQualified:false
  };
  if (typeof row !== 'object' || Array.isArray(row)) return {
    kind:'INVALID_ROW',rawStatus:null,finished:null,endReason:null,
    winner:null,reason:'Native row has invalid shape',competitivelyQualified:false
  };
  const rawStatus=typeof row.status==='string'?row.status:null;
  const finished=typeof row.finished==='boolean'?row.finished:null;
  const endReason=typeof row.endReason==='string'?row.endReason:null;
  const winner=Number.isInteger(row.winner)&&[0,1].includes(row.winner)?
    row.winner:null;
  const hasError=row.error!==null&&row.error!==undefined&&
    String(row.error).length>0;
  const isAbort=ABORT_STATUSES.has(rawStatus)||hasError;
  const isRejected=REJECTION_STATUSES.has(rawStatus);
  const terminalLabel=rawStatus==='engine-terminal';
  const capLabel=rawStatus==='action-cap';
  /** @param {string} kind @param {string} reason */
  const result=(kind,reason)=>({kind,rawStatus,finished,endReason,
    winner:kind==='ENGINE_TERMINAL'?winner:null,
    reason,competitivelyQualified:false});

  if ((isAbort||isRejected)&&finished!==null ||
      (isAbort||isRejected)&&endReason!==null ||
      finished===true&&(endReason==='action-limit'||capLabel) ||
      finished===false&&(terminalLabel||endReason==='engine-game-end') ||
      finished===false&&winner!==null ||
      terminalLabel&&finished!==true ||
      capLabel&&finished===true) {
    return result('CONFLICTING_NATIVE_FIELDS',
      'Native row status, completion, error or end reason disagree');
  }
  if (isRejected)return result('PRECHECK_REJECTED',
    'Explicit registration/precheck rejection');
  if (isAbort)return result('NATIVE_ABORT',
    'Explicit runner abort/error; ordinary run outcomes have no status');
  if (finished===true&&endReason!==null)return result('ENGINE_TERMINAL',
    'Runner finished with an explicit native end reason');
  if (finished===true)return result('UNVERIFIED',
    'Finished flag exists but native end reason is missing');
  if (finished===false&&endReason==='action-limit')return result('ACTION_CAP',
    'Runner stopped at the registered native action limit');
  if (finished===false)return result('NATIVE_INCOMPLETE',
    'Runner did not finish and did not report the action-limit end reason');
  return result('UNVERIFIED',
    'No authoritative finished/endReason pair or explicit abort');
}

/**
 * Summarize every archived attempt, including unknown/conflicting rows.
 * @param {unknown[]} rows Full registered native attempt records.
 * @returns {{total:number,counts:Record<string,number>,
 *   classified:Array<{trialId:string|null,kind:string}>,
 *   competitivelyQualifiedGames:number}}
 */
function summarizeNativeAttempts(rows) {
  if (!Array.isArray(rows))throw new TypeError('Native rows must be an array');
  const counts={};
  const classified=rows.map(row=>{
    const kind=classifyNativeAttempt(row).kind;
    counts[kind]=(counts[kind]??0)+1;
    return {trialId:typeof row?.trial?.id==='string'?row.trial.id:null,kind};
  });
  return {total:rows.length,counts,classified,competitivelyQualifiedGames:0};
}

/** Independent source-chain qualification phases in chronological order. */
const SOURCE_CHAIN_PHASES = [
  ['OWNER_OPPORTUNITY_OBSERVED','ownerOpportunityObserved'],
  ['CHARACTERISTIC_ROOT_SELECTED','characteristicRootSelected'],
  ['PROMPTS_PAPER_VALID','promptsPaperValid'],
  ['PAYMENT_PAPER_VALID','paymentPaperValid'],
  ['EFFECT_AND_PRIZE_SETTLED','effectAndPrizeSettled'],
  ['CONSEQUENTIAL_OPPONENT_REPLY','consequentialOpponentReply'],
  ['OFFICIAL_CLOCK_AND_GAME_ADJUDICATED','officialClockAndGameAdjudicated']
];

/**
 * A later opponent root alone cannot satisfy consequentialOpponentReply.
 * Every positive phase must be independently verified on the same lineage.
 * @param {Record<string,unknown>} evidence Same-lineage phase evidence.
 * @returns {{firstMissingPhase:string|null,passedPhases:string[],
 *   allSuppliedPhasesVerified:boolean,competitivelyQualified:boolean}}
 */
function classifySourceChain(evidence={}) {
  const passedPhases=[];
  for(const [phase,key] of SOURCE_CHAIN_PHASES){
    if(evidence[key]!==true)return {firstMissingPhase:phase,passedPhases,
      allSuppliedPhasesVerified:false,competitivelyQualified:false};
    passedPhases.push(phase);
  }
  return {firstMissingPhase:null,passedPhases,
    allSuppliedPhasesVerified:true,competitivelyQualified:false};
}

module.exports={classifyNativeAttempt,summarizeNativeAttempts,
  classifySourceChain,SOURCE_CHAIN_PHASES};
