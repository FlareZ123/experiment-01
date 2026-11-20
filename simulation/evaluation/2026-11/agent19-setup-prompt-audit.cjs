'use strict';

const {evidenceBundleSha256}=require('../canonical-evidence-json.cjs');

const SHA256=/^[a-f0-9]{64}$/;
const ROLE_NAMES=['candidate','opponent'];

function plainObject(value) {
  return value!==null&&typeof value==='object'&&!Array.isArray(value)&&
    (Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
}

function nonNegativeInteger(value) {
  return Number.isSafeInteger(value)&&value>=0;
}

function validPromptId(value) {
  return (typeof value==='string'&&value.length>0)||
    (Number.isSafeInteger(value)&&value>=0);
}

function cloneReceipt(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return {unserializableReceipt:true};
  }
}

/**
 * Project actor-owned setup prompt receipts into the encrypted-full trace and
 * join them to the exact native driver dispatch/ledger row. The raw receipts
 * contain private hand selections and must never be sent to public witnesses
 * or policy workers.
 */
function buildSetupPromptAudit({
  candidateAudit,opponentAudit,candidateSeat,opponentSeat,
  decisionTrace,rootActionLedger
}={}) {
  const globalFailures=[];
  const roleAudits={candidate:candidateAudit,opponent:opponentAudit};
  const expectedSeats={candidate:candidateSeat,opponent:opponentSeat};
  const decisionRows=Array.isArray(decisionTrace)?decisionTrace:[];
  const ledgerRows=Array.isArray(rootActionLedger)?rootActionLedger:[];
  const usedOrdinals=new Set();
  const roles={};
  let totalReceipts=0;
  let totalRejected=0;

  if(!(candidateSeat===0||candidateSeat===1)||
     !(opponentSeat===0||opponentSeat===1)||candidateSeat===opponentSeat)
    globalFailures.push('role-seat-map-invalid');
  if(!Array.isArray(decisionTrace))globalFailures.push('native-decision-trace-missing');
  if(!Array.isArray(rootActionLedger))globalFailures.push('native-root-action-ledger-missing');

  for(const role of ROLE_NAMES) {
    const audit=roleAudits[role];
    const expectedSeat=expectedSeats[role];
    const failures=[];
    if(!plainObject(audit))failures.push('role-audit-missing-or-invalid');
    if(audit?.policyOwnerSeat!==expectedSeat)failures.push('policy-owner-seat-mismatch');

    const receipts=Array.isArray(audit?.setupPromptDecisions)?
      audit.setupPromptDecisions:null;
    if(receipts===null)failures.push('setup-prompt-decisions-missing-or-invalid');

    const counts={
      setupStartingBasicPromptsHandled:audit?.setupStartingBasicPromptsHandled??null,
      setupStartingBasicPromptsBySeat:audit?.setupStartingBasicPromptsBySeat??null,
      setupGoFirstPromptsHandled:audit?.setupGoFirstPromptsHandled??null,
      setupGoFirstPromptsBySeat:audit?.setupGoFirstPromptsBySeat??null,
      setupPromptActionsSubmitted:audit?.setupPromptActionsSubmitted??null,
      setupPromptActionsRejected:audit?.setupPromptActionsRejected??null
    };
    for(const key of [
      'setupStartingBasicPromptsHandled','setupGoFirstPromptsHandled',
      'setupPromptActionsSubmitted','setupPromptActionsRejected'
    ]) {
      if(!nonNegativeInteger(counts[key]))failures.push(key+'-missing-or-invalid');
    }
    for(const key of [
      'setupStartingBasicPromptsBySeat','setupGoFirstPromptsBySeat'
    ]) {
      const value=counts[key];
      if(!Array.isArray(value)||value.length!==2||!value.every(nonNegativeInteger))
        failures.push(key+'-missing-or-invalid');
    }

    const startingBySeat=[0,0];
    const goFirstBySeat=[0,0];
    let submitted=0;
    let rejected=0;
    let unknownKind=0;
    const joinedReceipts=[];

    for(const [index,receipt] of (receipts??[]).entries()) {
      const receiptFailures=[];
      if(!plainObject(receipt)) {
        receiptFailures.push('receipt-not-plain-object');
      }
      const seat=receipt?.seat;
      const turn=receipt?.turn;
      const promptId=receipt?.promptId;
      const kind=receipt?.kind;
      const expectedPromptType=kind==='starting-basics'?'ChooseCardsPrompt':
        kind==='go-first'?'ConfirmPrompt':null;

      if(seat!==expectedSeat)receiptFailures.push('receipt-seat-mismatch');
      if(!nonNegativeInteger(turn))receiptFailures.push('receipt-turn-invalid');
      if(!validPromptId(promptId))receiptFailures.push('receipt-prompt-id-invalid');
      if(!expectedPromptType) {
        receiptFailures.push('receipt-kind-unsupported');
        unknownKind++;
      } else if(kind==='starting-basics') {
        if(seat===0||seat===1)startingBySeat[seat]++;
        const indices=receipt?.selectedHandIndices;
        const printings=receipt?.selectedPrintings;
        if(!Array.isArray(indices)||indices.length===0||
           !indices.every(nonNegativeInteger)||
           new Set(indices).size!==indices.length)
          receiptFailures.push('starting-basic-hand-indices-invalid');
        if(!Array.isArray(printings)||!Array.isArray(indices)||
           printings.length!==indices.length||
           !printings.every(value=>typeof value==='string'&&value.length>0))
          receiptFailures.push('starting-basic-printings-invalid');
      } else if(kind==='go-first') {
        if(seat===0||seat===1)goFirstBySeat[seat]++;
        if(receipt?.result!==false||receipt?.nativeDefaultEquivalent!==true)
          receiptFailures.push('go-first-default-decision-invalid');
      }

      if(receipt?.nativeDispatch==='dispatch-returned')submitted++;
      else if(receipt?.nativeDispatch==='dispatch-threw')rejected++;
      else receiptFailures.push('receipt-dispatch-not-settled');

      let driverRecord=null;
      let ledgerRecord=null;
      let actionOrdinal=null;
      let actionPayloadSha256=null;
      let payloadDigestVerified=false;
      let ledgerJoinVerified=false;
      const identityMatches=decisionRows.filter(row=>
        row?.pendingPromptId===promptId&&
        row?.actingSeat===seat&&
        row?.turnBefore===turn
      );
      if(identityMatches.length!==1) {
        receiptFailures.push(identityMatches.length===0?
          'native-driver-attempt-not-found':'native-driver-attempt-ambiguous');
      } else {
        driverRecord=identityMatches[0];
        if(driverRecord.actionName!=='ResolvePromptAction')
          receiptFailures.push('native-action-identity-mismatch');
        if(driverRecord.pendingPromptType!==expectedPromptType)
          receiptFailures.push('native-prompt-type-mismatch');
        actionOrdinal=driverRecord.actionOrdinal;
        actionPayloadSha256=driverRecord.actionPayloadSha256??null;
        if(!nonNegativeInteger(actionOrdinal))
          receiptFailures.push('native-action-ordinal-invalid');
        else if(usedOrdinals.has(actionOrdinal))
          receiptFailures.push('native-action-ordinal-reused');
        else usedOrdinals.add(actionOrdinal);

        if(typeof actionPayloadSha256!=='string'||!SHA256.test(actionPayloadSha256)) {
          receiptFailures.push('native-action-payload-digest-invalid');
        } else {
          try {
            payloadDigestVerified=evidenceBundleSha256(driverRecord.actionPayload)===
              actionPayloadSha256;
          } catch {
            payloadDigestVerified=false;
          }
          if(!payloadDigestVerified)
            receiptFailures.push('native-action-payload-digest-mismatch');
        }

        const ledgerMatches=ledgerRows.filter(row=>row?.actionOrdinal===actionOrdinal);
        if(ledgerMatches.length!==1) {
          receiptFailures.push(ledgerMatches.length===0?
            'native-ledger-row-not-found':'native-ledger-row-ambiguous');
        } else {
          ledgerRecord=ledgerMatches[0];
          const expectedDispatch=receipt?.nativeDispatch==='dispatch-returned'?
            'succeeded':receipt?.nativeDispatch==='dispatch-threw'?'failed':null;
          ledgerJoinVerified=
            ledgerRecord.actorSeat===seat&&
            ledgerRecord.turnBefore===turn&&
            ledgerRecord.pendingPrompt===driverRecord.pendingPromptType&&
            ledgerRecord.action==='ResolvePromptAction'&&
            ledgerRecord.actionPayloadSha256===actionPayloadSha256&&
            ledgerRecord.dispatchStatus===driverRecord.dispatchStatus&&
            driverRecord.dispatchStatus===expectedDispatch;
          if(!ledgerJoinVerified)
            receiptFailures.push('native-ledger-identity-or-dispatch-mismatch');
        }
        const expectedDriverDispatch=receipt?.nativeDispatch==='dispatch-returned'?
          'succeeded':receipt?.nativeDispatch==='dispatch-threw'?'failed':null;
        if(driverRecord.dispatchStatus!==expectedDriverDispatch)
          receiptFailures.push('native-driver-dispatch-mismatch');
      }

      const joined=receiptFailures.length===0;
      joinedReceipts.push({
        ...cloneReceipt(receipt),
        actionOrdinal,
        nativeActionName:driverRecord?.actionName??null,
        nativePendingPromptType:driverRecord?.pendingPromptType??null,
        actionPayloadSha256,
        driverDispatchStatus:driverRecord?.dispatchStatus??null,
        ledgerDispatchStatus:ledgerRecord?.dispatchStatus??null,
        payloadDigestVerified,
        ledgerJoinVerified,
        joined,
        joinFailures:receiptFailures
      });
      for(const failure of receiptFailures)
        failures.push('receipt-'+index+':'+failure);
    }

    totalReceipts+=receipts?.length??0;
    totalRejected+=rejected;

    if(receipts!==null) {
      if(unknownKind!==0)failures.push('unsupported-receipt-kind-present');
      if(counts.setupStartingBasicPromptsHandled!==startingBySeat[0]+startingBySeat[1])
        failures.push('starting-basic-total-count-mismatch');
      if(counts.setupGoFirstPromptsHandled!==goFirstBySeat[0]+goFirstBySeat[1])
        failures.push('go-first-total-count-mismatch');
      if(Array.isArray(counts.setupStartingBasicPromptsBySeat)&&
         (counts.setupStartingBasicPromptsBySeat[0]!==startingBySeat[0]||
          counts.setupStartingBasicPromptsBySeat[1]!==startingBySeat[1]))
        failures.push('starting-basic-seat-count-mismatch');
      if(Array.isArray(counts.setupGoFirstPromptsBySeat)&&
         (counts.setupGoFirstPromptsBySeat[0]!==goFirstBySeat[0]||
          counts.setupGoFirstPromptsBySeat[1]!==goFirstBySeat[1]))
        failures.push('go-first-seat-count-mismatch');
      if(counts.setupPromptActionsSubmitted!==submitted)
        failures.push('submitted-action-count-mismatch');
      if(counts.setupPromptActionsRejected!==rejected)
        failures.push('rejected-action-count-mismatch');
      if(submitted+rejected!==receipts.length)
        failures.push('dispatch-total-does-not-match-receipts');
      if(startingBySeat[expectedSeat]===0)
        failures.push('required-starting-basic-receipt-missing');
    }

    roles[role]={
      role,
      policyOwnerSeat:expectedSeat,
      counts,
      receiptCount:receipts?.length??null,
      receipts:joinedReceipts,
      complete:failures.length===0,
      failures
    };
    for(const failure of failures)globalFailures.push(role+':'+failure);
  }

  const complete=globalFailures.length===0&&
    roles.candidate.complete===true&&roles.opponent.complete===true;
  return {
    schema:'agent19-agent34-encrypted-setup-prompt-audit-v1',
    visibility:'encrypted-full-only',
    candidateSeat,
    opponentSeat,
    roles,
    receiptCount:totalReceipts,
    rejectedDispatchCount:totalRejected,
    complete,
    accepted:complete&&totalRejected===0,
    failures:globalFailures
  };
}

module.exports={buildSetupPromptAudit};
