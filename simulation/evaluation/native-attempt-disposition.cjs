'use strict';
const assert=require('node:assert/strict');

const SCHEMA='aichi-canonical-native-attempt-disposition-v1';
const ABORT_STATUSES=new Set([
  'engine-error','engine-physical-invalid','paper-supporter-quota-veto'
]);
const PRECHECK_STATUSES=new Set([
  'registration-rejected','preflight-rejected','precheck-rejected'
]);
const KINDS=Object.freeze([
  'engine-terminal','action-cap','native-abort','precheck-rejection',
  'unknown','missing-attempt'
]);

/**
 * Conservative native-engine attempt classification. This labels only
 * native completion, never paper correctness or competitive match results.
 * Real successful agent41 development rows have no "status" field: they
 * carry finished/endReason/actionCount. Error rows instead have status.
 * If those signals disagree, classify as unknown.
 *
 * @param {object|null|undefined} row Native development row or missing row.
 * @returns {{kind:string,reason:string,rawStatus:string|null,
 *   endReason:string|null,finished:boolean|null,actionCount:number|null,
 *   engineReportedWinner:number|null,competitiveQualifiedByReader:false}}
 */
function classifyNativeAttempt(row){
  if(row==null)return {
    kind:'missing-attempt',reason:'scheduled row absent',rawStatus:null,
    endReason:null,finished:null,actionCount:null,
    engineReportedWinner:null,competitiveQualifiedByReader:false
  };
  assert.equal(typeof row,'object','Native attempt must be an object');
  const rawStatus=typeof row.status==='string'&&row.status.length>0?
    row.status:null;
  const endReason=typeof row.endReason==='string'?row.endReason:null;
  const finished=typeof row.finished==='boolean'?row.finished:null;
  const actionCount=Number.isSafeInteger(row.actionCount)&&
    row.actionCount>=0?row.actionCount:null;
  const winner=row.winner===0||row.winner===1?row.winner:null;
  const errorPresent=Boolean(row.error);
  let kind='unknown',reason='native disposition not established';
  if(rawStatus!==null&&PRECHECK_STATUSES.has(rawStatus)){
    if(finished===null&&!errorPresent){
      kind='precheck-rejection';reason=rawStatus;
    }else reason='conflicting precheck and native outcome';
  }else if((rawStatus!==null&&ABORT_STATUSES.has(rawStatus))||
           errorPresent){
    if(finished!==true){
      kind='native-abort';
      reason=rawStatus??'unclassified native error';
    }else reason='conflicting engine terminal and native error';
  }else if(rawStatus!==null){
    reason='unknown explicit native status';
  }else if(finished===true&&endReason==='engine-game-end'){
    kind='engine-terminal';reason='engine-reported terminal only';
  }else if(finished===false&&endReason==='action-limit'){
    kind='action-cap';reason='native action budget exhausted';
  }else if(finished!==null&&endReason!==null){
    reason='finished flag disagrees with native endReason';
  }
  return {kind,reason,rawStatus,endReason,finished,actionCount,
    engineReportedWinner:kind==='engine-terminal'?winner:null,
    competitiveQualifiedByReader:false};
}

/**
 * One reporting contract for a frozen registered cohort. Preserve missing,
 * duplicate and extraneous attempts, instead of silently removing them or
 * imputing results. Each scheduled trial identifier is unique.
 *
 * @param {object[]} rows Actual unchanged native rows.
 * @param {string[]} registeredIds Entire preregistered trial schedule.
 * @returns {{schema:string,registered:number,observed:number,
 *   classified:number,counts:object,missingIds:string[],
 *   unregisteredIds:string[],attempts:object[],
 *   competitiveQualifiedByReader:false}}
 */
function summarizeNativeAttempts(rows,registeredIds){
  assert.ok(Array.isArray(rows));
  assert.ok(Array.isArray(registeredIds));
  assert.ok(registeredIds.every(x=>typeof x==='string'&&x.length>0));
  const scheduled=new Set(registeredIds);
  assert.equal(scheduled.size,registeredIds.length,
    'Duplicate preregistered native trial IDs');
  const seen=new Map();
  for(const row of rows){
    assert.ok(row&&typeof row==='object');
    const id=row.trial?.id;
    assert.ok(typeof id==='string'&&id.length>0,
      'Missing real trial ID; cannot assign an attempt to a registered deal');
    assert.ok(!seen.has(id),
      'Duplicate real native trial ID: '+id);
    seen.set(id,row);
  }
  const counts=Object.fromEntries(KINDS.map(kind=>[kind,0]));
  const attempts=registeredIds.map(id=>{
    const source=seen.get(id);
    const disposition=classifyNativeAttempt(source);
    counts[disposition.kind]++;
    return {trialId:id,...disposition};
  });
  const missingIds=registeredIds.filter(id=>!seen.has(id));
  const unregisteredIds=[...seen.keys()].filter(id=>!scheduled.has(id));
  return {schema:SCHEMA,registered:registeredIds.length,
    observed:rows.length,classified:attempts.length,
    counts,missingIds,unregisteredIds,attempts,
    competitiveQualifiedByReader:false};
}
module.exports={SCHEMA,KINDS,classifyNativeAttempt,summarizeNativeAttempts};
