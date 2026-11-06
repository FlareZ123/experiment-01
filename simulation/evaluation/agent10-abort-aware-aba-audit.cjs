'use strict';

/**
 * Audit three historically registered A/B/A native phases without upgrading
 * action-root equality into competitive-game evidence.
 *
 * This module deliberately does not read hidden game state, decide moves,
 * infer paper legality, or infer live policy activation from request flags.
 */

const VERSION = 'agent10-abort-aware-aba-audit-v1';

/** @param {object} row @returns {{kind:string,ledger:object[]|null}} */
function evidenceLedger(row) {
  const full = row?.rootActionLedger;
  const abort = row?.nativeAbortEvidence?.rootActionLedger;
  if (Array.isArray(full) && Array.isArray(abort) &&
      JSON.stringify(full) !== JSON.stringify(abort))
    return {kind:'CONFLICTING_LEDGER_COPIES',ledger:null};
  if (Array.isArray(full))
    return {kind:'TOP_LEVEL',ledger:full};
  if (Array.isArray(abort))
    return {kind:'ABORT_PRESERVED',ledger:abort};
  return {kind:'MISSING',ledger:null};
}

/** @param {object[]} a @param {object[]} b */
function firstDifference(a,b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return null;
  const count=Math.min(a.length,b.length);
  for(let index=0;index<count;index++){
    if(JSON.stringify(a[index])!==JSON.stringify(b[index]))
      return {index,kind:'ACTION_MISMATCH',
        control:a[index],treatment:b[index]};
  }
  if(a.length!==b.length)
    return {index:count,kind:'LENGTH_MISMATCH',
      control:a[count]??null,treatment:b[count]??null};
  return null;
}

/** @param {object} row */
function outcome(row) {
  return JSON.stringify({
    status:row?.status??null,
    finished:row?.finished??false,
    winner:row?.winner??null,
    error:row?.error??null,
    nativeError:row?.nativeError??null,
    finalPrizes:row?.finalPrizes??null
  });
}

/**
 * An identical raw accepted-root tape can still be a truncated error prefix.
 * @param {object} row
 * @param {string} ledgerOrigin
 */
function isCensored(row,ledgerOrigin) {
  return ledgerOrigin==='ABORT_PRESERVED' ||
    row?.nativeAbortEvidence!=null ||
    row?.error!=null || row?.nativeError!=null ||
    /abort|error|quarantin|censor/i.test(String(row?.status??''));
}

/** @param {object} a @param {object} b */
function physicalDealEqual(a,b) {
  const fields=['sourceDealFingerprint','fullPhysicalDealFingerprint'];
  if(!fields.every(field=>typeof a?.[field]==='string' &&
      a[field].length>0 && a[field]===b?.[field]))return false;
  if((a?.actualStarterSeat!==0 && a?.actualStarterSeat!==1) ||
     a.actualStarterSeat!==b?.actualStarterSeat)return false;
  if((a?.sourceSeat!==0 && a?.sourceSeat!==1) ||
     a?.candidateSeat!==1-a.sourceSeat)return false;
  return a?.sourceSeat===b?.sourceSeat &&
    a?.candidateSeat===b?.candidateSeat;
}

/** @param {object} phase */
function byTrial(phase) {
  const rawRows=phase?.rawDevelopment?.rows;
  const summaryRows=phase?.rows;
  const rows=rawRows??summaryRows;
  if(!Array.isArray(rows))throw new TypeError('Phase rows required');
  const summaries=new Map();
  if(Array.isArray(rawRows)&&Array.isArray(summaryRows)){
    for(const summary of summaryRows){
      const id=summary?.id??summary?.trial?.id;
      if(typeof id!=='string'||!id||summaries.has(id))
        throw new Error('Missing or duplicate phase summary trial');
      summaries.set(id,summary);
    }
  }
  const out=new Map();
  for(const raw of rows){
    const id=raw?.trial?.id??raw?.id;
    if(typeof id!=='string'||!id||out.has(id))
      throw new Error('Missing or duplicate trial identity');
    const compact=summaries.get(id);
    if(summaries.size&&!compact)
      throw new Error('Raw trial missing matching compact summary');
    const normalized={...compact,...raw};
    for(const key of [
      'sourceDealFingerprint','fullPhysicalDealFingerprint',
      'actualStarterSeat','sourceSeat','candidateSeat','status'
    ]){
      const left=compact?.[key],right=raw?.[key];
      if(left!=null&&right!=null&&
         JSON.stringify(left)!==JSON.stringify(right))
        throw new Error('Conflicting raw/summary custody field '+key);
      normalized[key]=right??left??null;
    }
    out.set(id,normalized);
  }
  if(summaries.size&&summaries.size!==out.size)
    throw new Error('Compact summary missing matching raw trial');
  return out;
}

/**
 * Require a receipt produced at the live root-wrapper installation branch.
 * Absence, a mere requested opt-in, or incomplete receipts are not proof.
 * @param {object[]} phases
 */
function activation(phases) {
  const rowReceipts=phases.map(phase=>{
    const rows=phase?.rawDevelopment?.rows??phase?.rows;
    if(!Array.isArray(rows)||rows.length===0)return null;
    const hasField=rows.some(row=>Object.prototype.hasOwnProperty.call(
      row,'twoUnitPaidRetreatRootWrapperSelected'));
    if(!hasField)return null;
    if(!rows.every(row=>
      typeof row.twoUnitPaidRetreatRootOptIn==='boolean' &&
      typeof row.twoUnitPaidRetreatRootV2OptIn==='boolean' &&
      typeof row.twoUnitPaidRetreatRootWrapperSelected==='boolean' &&
      typeof row.twoUnitPaidRetreatRootOptionPassed==='boolean'))
      return 'INCOMPLETE';
    const tuples=rows.map(row=>[
      row.twoUnitPaidRetreatRootOptIn||
        row.twoUnitPaidRetreatRootV2OptIn,
      row.twoUnitPaidRetreatRootOptionPassed,
      row.twoUnitPaidRetreatRootWrapperSelected
    ]);
    if(!tuples.every(x=>JSON.stringify(x)===JSON.stringify(tuples[0])))
      return 'INCONSISTENT';
    return {optIn:tuples[0][0],optionPassed:tuples[0][1],
      installed:tuples[0][2]};
  });
  if(rowReceipts.some(x=>x==='INCOMPLETE'||x==='INCONSISTENT'))
    return 'INVALID_ABA_WRAPPER_ACTIVATION';
  const allNative=rowReceipts.every(x=>x!==null);
  // A partial live receipt cannot be laundered by a phase-supplied claim.
  if(!allNative&&rowReceipts.some(x=>x!==null))
    return 'INVALID_ABA_WRAPPER_ACTIVATION';
  const explicit=phases.map(phase=>phase?.runtimeWrapperReceipt);
  const allExplicit=explicit.every(r=>
    r?.origin==='live-scopedRoot-predicate' &&
    typeof r.installed==='boolean');
  if(!allNative&&!allExplicit)return 'ACTIVATION_UNVERIFIED';
  if(allNative) {
    const optIns=rowReceipts.map(x=>x.optIn);
    const options=rowReceipts.map(x=>x.optionPassed);
    const installed=rowReceipts.map(x=>x.installed);
    const active=JSON.stringify(optIns)===JSON.stringify([false,true,false]) &&
      JSON.stringify(options)===JSON.stringify([false,true,false]) &&
      JSON.stringify(installed)===JSON.stringify([false,true,false]);
    const inactive=optIns.every(x=>x===false)&&
      options.every(x=>x===false)&&installed.every(x=>x===false);
    if(allExplicit&&explicit.some((r,i)=>r.installed!==installed[i]))
      return 'INVALID_ABA_WRAPPER_ACTIVATION';
    return active?'B_WRAPPER_INSTALLATION_RECORDED':
      inactive?'NO_TREATMENT_APPLIED':'INVALID_ABA_WRAPPER_ACTIVATION';
  }
  const installed=explicit.map(r=>r.installed);
  if(installed.every(x=>x===false))return 'NO_TREATMENT_APPLIED';
  if(JSON.stringify(installed)===JSON.stringify([false,true,false]))
    return 'B_WRAPPER_INSTALLATION_RECORDED';
  return 'INVALID_ABA_WRAPPER_ACTIVATION';
}

/**
 * @param {{trials:Array<{id:string,sourceSeat:0|1}>, phases:object[]}} config
 * @returns {object}
 */
function audit(config) {
  const trials=config?.trials,phases=config?.phases;
  if(!Array.isArray(trials)||trials.length===0||
     !Array.isArray(phases)||phases.length!==3)
    throw new TypeError('Need registered trials and three A/B/A phases');
  const known=new Set();
  for(const t of trials){
    if(typeof t?.id!=='string'||!t.id||known.has(t.id)||
       (t.sourceSeat!==0&&t.sourceSeat!==1))
      throw new Error('Invalid registered trial or source seat');
    known.add(t.id);
  }
  const indexed=phases.map(byTrial);
  if(indexed.some(map=>map.size!==known.size||
      [...map.keys()].some(id=>!known.has(id))))
    throw new Error('A/B/A must retain every registered attempt');
  const activationStatus=activation(phases);
  const rows=trials.map(trial=>{
    const [a,b,a2]=indexed.map(map=>map.get(trial.id));
    const [la,lb,la2]=[a,b,a2].map(evidenceLedger);
    const hasAll=[la,lb,la2].every(x=>Array.isArray(x.ledger));
    const openingMatched=physicalDealEqual(a,b)&&physicalDealEqual(a,a2)&&
      a.sourceSeat===trial.sourceSeat;
    const controlDifference=firstDifference(la.ledger,la2.ledger);
    const controlReplay= !Array.isArray(la.ledger)||!Array.isArray(la2.ledger)?
      'MISSING_OR_CONFLICTING_CONTROL_LEDGER':
      controlDifference!==null?'ROOT_HISTORY_MISMATCH':
      outcome(a)!==outcome(a2)?'OUTCOME_MISMATCH':
      isCensored(a,la.kind)||isCensored(a2,la2.kind)?
        'CENSORED_PREFIX_REPLAY':'BOUNDED_ROOT_REPLAY';
    const treatmentDifference=firstDifference(la.ledger,lb.ledger);
    let treatmentWitness='NOT_A_VALID_TREATMENT_WITNESS';
    if(!hasAll)treatmentWitness='MISSING_OR_CONFLICTING_LEDGER';
    else if(!openingMatched)treatmentWitness='PHYSICAL_OPENING_MISMATCH';
    else if(!['BOUNDED_ROOT_REPLAY','CENSORED_PREFIX_REPLAY']
      .includes(controlReplay))
      treatmentWitness='CONTROL_REPLAY_UNREPRODUCIBLE';
    else if(activationStatus!=='B_WRAPPER_INSTALLATION_RECORDED')
      treatmentWitness=activationStatus;
    else if(treatmentDifference===null)treatmentWitness='ACTIVE_NO_DIVERGENCE';
    else if(treatmentDifference.control===null)
      treatmentWitness='CONTROL_ENDED_BEFORE_DIVERGENCE';
    else if(treatmentDifference.treatment?.action==='RetreatAction' &&
      treatmentDifference.treatment?.playerSlot===trial.sourceSeat &&
      Number.isSafeInteger(treatmentDifference.treatment?.actionOrdinal))
      treatmentWitness='SOURCE_RETREAT_DIVERGENCE_NEEDS_STORE_CUSTODY';
    else treatmentWitness='WRONG_ACTION_OR_SEAT_OR_ORDINAL';
    return {
      id:trial.id,sourceSeat:trial.sourceSeat,openingMatched,
      ledgerOrigins:[la.kind,lb.kind,la2.kind],
      acceptedRoots:[la,lb,la2].map(x=>x.ledger?.length??null),
      controlReplay,controlDifference,treatmentDifference,
      treatmentWitness,paperQualifiedGame:false
    };
  });
  return {
    version:VERSION,activationStatus,
    registeredTrialCount:trials.length,
    allOpeningsMatched:rows.every(row=>row.openingMatched),
    completedControlReplays:rows.filter(row=>
      row.controlReplay==='BOUNDED_ROOT_REPLAY').length,
    censoredControlPrefixReplays:rows.filter(row=>
      row.controlReplay==='CENSORED_PREFIX_REPLAY').length,
    sourceRetreatDivergenceCandidates:rows.filter(row=>
      row.treatmentWitness==='SOURCE_RETREAT_DIVERGENCE_NEEDS_STORE_CUSTODY').length,
    verifiedStoreCustody:false,
    competitivelyQualifiedGames:0,
    rows
  };
}

/**
 * Audit the actual exported three-phase archival envelope, whose condensed
 * phase rows retain opening/seat metadata and rawDevelopment contains
 * complete or abort-preserved root evidence.
 * @param {object} archive
 * @returns {object}
 */
function auditArchive(archive){
  const phases=archive?.phases;
  const registered=archive?.registration?.trials;
  if(!Array.isArray(phases)||!Array.isArray(registered))
    throw new TypeError('Expected registered three-phase native archive');
  const first=byTrial(phases[0]);
  const trials=registered.map(trial=>{
    const recorded=first.get(trial.id);
    return {id:trial.id,sourceSeat:recorded?.sourceSeat};
  });
  return audit({trials,phases});
}

module.exports={VERSION,evidenceLedger,firstDifference,isCensored,activation,audit,auditArchive};
