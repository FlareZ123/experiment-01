'use strict';

const {evidenceBundleSha256}=require('../canonical-evidence-json.cjs');

const SHA256=/^[a-f0-9]{64}$/;
const SETUP_PROMPTS={
  CHOOSE_STARTING_POKEMONS:{kind:'starting-basics',promptType:'ChooseCardsPrompt'},
  GO_FIRST:{kind:'go-first',promptType:'ConfirmPrompt'},
  WANT_TO_DRAW_CARDS:{kind:'want-to-draw-cards',promptType:'SelectPrompt'}
};
const ROLE_NAMES=['candidate','opponent'];

function nonNegativeInteger(value) {
  return Number.isSafeInteger(value)&&value>=0;
}

function digestMatches(value,digest) {
  if(typeof digest!=='string'||!SHA256.test(digest))return false;
  try{return evidenceBundleSha256(value)===digest;}
  catch{return false;}
}

function sameDigest(left,right) {
  try{return evidenceBundleSha256(left)===evidenceBundleSha256(right);}
  catch{return false;}
}

/**
 * Project the V3 worker/native setup-prompt decisions into the encrypted-full
 * artifact. This deliberately uses the production V3 decisionTrace, worker
 * validation receipt, native action ledger, and recorder public-board step;
 * it does not depend on the legacy SimpleTacticsAi role composer.
 */
function buildSetupPromptAudit({
  candidateSeat,opponentSeat,decisionTrace,rootActionLedger,
  workerExecutionAudit,fullStateTraceSteps
}={}) {
  const failures=[];
  const decisionRows=Array.isArray(decisionTrace)?decisionTrace:[];
  const ledgerRows=Array.isArray(rootActionLedger)?rootActionLedger:[];
  const steps=Array.isArray(fullStateTraceSteps)?fullStateTraceSteps:[];
  const expectedSeats={candidate:candidateSeat,opponent:opponentSeat};
  const roleResults={};
  const setupRows=[];
  const usedOrdinals=new Set();

  if(!(candidateSeat===0||candidateSeat===1)||
     !(opponentSeat===0||opponentSeat===1)||candidateSeat===opponentSeat)
    failures.push('role-seat-map-invalid');
  if(!Array.isArray(decisionTrace))failures.push('native-decision-trace-missing');
  if(!Array.isArray(rootActionLedger))failures.push('native-root-action-ledger-missing');
  if(!Array.isArray(fullStateTraceSteps))failures.push('full-state-trace-steps-missing');
  if(!workerExecutionAudit||typeof workerExecutionAudit!=='object'||
     !workerExecutionAudit.roles)
    failures.push('worker-execution-audit-missing');

  for(const row of decisionRows) {
    if(row?.turnBefore!==0||row?.phaseBefore!==1)continue;
    const trace=row?.workerDecisionTrace;
    const projection=trace?.promptProjection;
    const message=row?.promptResolverContext?.message??
      projection?.description??projection?.source?.effectName??null;
    const spec=typeof message==='string'?SETUP_PROMPTS[message]:null;
    const promptClassIsSetup=['ChooseCardsPrompt','ConfirmPrompt','SelectPrompt']
      .includes(row?.pendingPromptType);
    if(spec) {
      setupRows.push({row,spec,message});
      if(row.decisionKind!=='owner-prompt')
        failures.push('setup-prompt-not-worker-owned:'+String(row.pendingPromptId));
      if(row.pendingPromptType!==spec.promptType)
        failures.push('setup-prompt-type-message-mismatch:'+String(row.pendingPromptId));
    } else if(row?.decisionKind==='owner-prompt'&&promptClassIsSetup) {
      failures.push('unclassified-setup-owner-prompt:'+String(row.pendingPromptId));
    }
  }

  const allWorkerRows=decisionRows.filter(row=>
    row?.decisionKind==='owner-root'||row?.decisionKind==='owner-prompt');
  if(!nonNegativeInteger(workerExecutionAudit?.totalWorkerDecisions)||
     workerExecutionAudit.totalWorkerDecisions!==allWorkerRows.length)
    failures.push('total-worker-decision-count-mismatch');

  const setupCountsBySeat=[
    {seat:0,startingBasics:0,goFirst:0,wantToDrawCards:0},
    {seat:1,startingBasics:0,goFirst:0,wantToDrawCards:0}
  ];
  let totalGoFirst=0;

  for(const role of ROLE_NAMES) {
    const seat=expectedSeats[role];
    const roleFailures=[];
    const roleAudit=workerExecutionAudit?.roles?.[role];
    if(!roleAudit||typeof roleAudit!=='object')
      roleFailures.push('worker-role-audit-missing');
    if(roleAudit?.seat!==seat)roleFailures.push('worker-role-seat-mismatch');

    const roleRows=decisionRows.filter(row=>
      row?.actingSeat===seat&&
      (row?.decisionKind==='owner-root'||row?.decisionKind==='owner-prompt'));
    const ownerRootRows=roleRows.filter(row=>row.decisionKind==='owner-root');
    const ownerPromptRows=roleRows.filter(row=>row.decisionKind==='owner-prompt');
    for(const [field,expected] of [
      ['decisionCount',roleRows.length],
      ['rootDecisionCount',ownerRootRows.length],
      ['promptDecisionCount',ownerPromptRows.length]
    ]) {
      if(!nonNegativeInteger(roleAudit?.[field])||roleAudit[field]!==expected)
        roleFailures.push(field+'-does-not-reconcile-to-native-trace');
    }

    const roleSetupRows=setupRows.filter(item=>item.row.actingSeat===seat);
    const counts={startingBasics:0,goFirst:0,wantToDrawCards:0};
    const projectedRows=[];
    for(const item of roleSetupRows) {
      const {row,spec,message}=item;
      const trace=row.workerDecisionTrace;
      const receipt=row.validationReceipt;
      const projection=trace?.promptProjection;
      const promptContext=row.promptResolverContext;
      const ordinal=row.actionOrdinal;
      const receiptFailures=[];

      if(!nonNegativeInteger(ordinal))receiptFailures.push('action-ordinal-invalid');
      else if(usedOrdinals.has(ordinal))receiptFailures.push('action-ordinal-reused');
      else usedOrdinals.add(ordinal);
      if(row.turnBefore!==0||row.phaseBefore!==1)
        receiptFailures.push('not-a-turn-zero-setup-prompt');
      if(row.actingSeat!==seat||row.actingPlayerId===null||
         row.actingPlayerId===undefined)
        receiptFailures.push('physical-actor-identity-invalid');
      if(row.pendingPromptId===null||row.pendingPromptId===undefined)
        receiptFailures.push('pending-prompt-id-missing');
      if(promptContext?.promptId!==row.pendingPromptId||
         promptContext?.promptType!==spec.promptType||
         promptContext?.actingSeat!==seat||
         promptContext?.message!==message)
        receiptFailures.push('native-prompt-context-mismatch');
      if(row.actionName!=='ResolvePromptAction'||
         row.policyInputKind!=='native-owner-prompt'||
         row.isRootDecision!==false||
         row.promptResolution?.kind!=='worker-choice'||
         row.dispatchStatus!=='succeeded')
        receiptFailures.push('native-prompt-dispatch-not-accepted');

      if(trace?.schema!=='agent6-worker-decision-trace-v1'||
         trace?.traceStatus!=='validated'||trace?.failureCode!==null||
         trace?.decisionKind!=='owner-prompt'||
         trace?.actionOrdinal!==ordinal||trace?.seat!==seat||
         trace?.role!==role)
        receiptFailures.push('worker-decision-trace-identity-invalid');
      if(projection?.promptType!==spec.promptType||
         projection?.description!==message||
         projection?.actingSeat!==seat||
         projection?.source?.sourceKind!=='engine'||
         projection?.source?.effectName!==message||
         !digestMatches(projection,trace?.promptProjectionSha256))
        receiptFailures.push('worker-prompt-projection-invalid');

      if(!receipt||receipt.schema!=='agent6-cloned-store-prompt-validation-v1'||
         receipt.promptDecodeValidated!==true||
         receipt.promptId!==row.pendingPromptId||
         receipt.actorSeat!==seat||
         receipt.clonedPromptResolved!==true||
         receipt.nativeValidationStoreMode!=='cloned-store'||
         receipt.fullOriginalStoreStateUnchanged!==true||
         receipt.promptProjectionSha256!==trace?.promptProjectionSha256||
         !Array.isArray(receipt.selectedTokens)||
         JSON.stringify(receipt.selectedTokens)!==JSON.stringify(trace?.selectedTokens)||
         receipt.selectedItemsSha256!==trace?.selectedItemsSha256)
        receiptFailures.push('cloned-prompt-validation-receipt-invalid');

      if(!digestMatches(receipt,trace?.validationReceiptSha256)||
         trace?.validationReceiptSha256!==row.validationReceiptSha256||
         !digestMatches(receipt,row.validationReceiptSha256)||
         !digestMatches(trace,row.workerDecisionTraceSha256)||
         !digestMatches(row.actionPayload,row.actionPayloadSha256))
        receiptFailures.push('worker-or-action-payload-digest-invalid');
      if(!Array.isArray(trace?.selectedItems)||
         !digestMatches(trace.selectedItems,trace.selectedItemsSha256))
        receiptFailures.push('worker-selected-items-digest-invalid');

      const ledgerMatches=ledgerRows.filter(item=>item?.actionOrdinal===ordinal);
      let ledger=null;
      let ledgerJoinVerified=false;
      if(ledgerMatches.length!==1) {
        receiptFailures.push(ledgerMatches.length===0?
          'native-ledger-row-missing':'native-ledger-row-ambiguous');
      } else {
        ledger=ledgerMatches[0];
        ledgerJoinVerified=
          ledger.actorSeat===seat&&
          ledger.playerId===row.actingPlayerId&&
          ledger.turnBefore===row.turnBefore&&
          ledger.action==='ResolvePromptAction'&&
          ledger.pendingPrompt===spec.promptType&&
          ledger.actionPayloadSha256===row.actionPayloadSha256&&
          ledger.isRootDecision===false&&
          ledger.policyInputKind==='native-owner-prompt'&&
          ledger.decisionKind==='owner-prompt'&&
          ledger.workerDecisionTraceSha256===row.workerDecisionTraceSha256&&
          ledger.validationReceiptSha256===row.validationReceiptSha256&&
          ledger.dispatchStatus==='succeeded'&&
          sameDigest(ledger.promptResolverContext,row.promptResolverContext)&&
          sameDigest(ledger.promptResolution,row.promptResolution);
        if(!ledgerJoinVerified)receiptFailures.push('native-ledger-join-invalid');
      }

      const stepMatches=steps.filter(step=>step?.actionOrdinal===ordinal+1);
      let recorderJoinVerified=false;
      let publicBoardSha256=null;
      if(stepMatches.length!==1) {
        receiptFailures.push(stepMatches.length===0?
          'recorder-step-missing':'recorder-step-ambiguous');
      } else {
        const step=stepMatches[0];
        const publicPlayers=row.publicStateAfter?.players;
        publicBoardSha256=Array.isArray(step.publicBoard)?
          evidenceBundleSha256(step.publicBoard):null;
        recorderJoinVerified=Array.isArray(publicPlayers)&&
          Array.isArray(step.publicBoard)&&
          evidenceBundleSha256(publicPlayers)===publicBoardSha256;
        if(!recorderJoinVerified)receiptFailures.push('recorder-public-board-join-invalid');
      }

      counts[spec.kind==='starting-basics'?'startingBasics':
        spec.kind==='go-first'?'goFirst':'wantToDrawCards']++;
      setupCountsBySeat[seat][spec.kind==='starting-basics'?'startingBasics':
        spec.kind==='go-first'?'goFirst':'wantToDrawCards']++;
      if(spec.kind==='go-first')totalGoFirst++;

      projectedRows.push({
        role,kind:spec.kind,seat,playerId:row.actingPlayerId,
        turn:row.turnBefore,promptId:row.pendingPromptId,
        promptType:spec.promptType,promptMessage:message,
        actionOrdinal:ordinal,recorderStepOrdinal:nonNegativeInteger(ordinal)?ordinal+1:null,
        actionName:row.actionName,actionPayloadSha256:row.actionPayloadSha256??null,
        workerDecisionTraceSha256:row.workerDecisionTraceSha256??null,
        validationReceiptSha256:row.validationReceiptSha256??null,
        promptProjectionSha256:trace?.promptProjectionSha256??null,
        selectedTokenCount:Array.isArray(trace?.selectedTokens)?trace.selectedTokens.length:0,
        dispatchStatus:row.dispatchStatus,
        ledgerJoinVerified,recorderJoinVerified,publicBoardSha256,
        accepted:receiptFailures.length===0,failures:receiptFailures
      });
      for(const failure of receiptFailures)
        roleFailures.push('prompt-'+String(row.pendingPromptId)+':'+failure);
    }

    if(counts.startingBasics===0)
      roleFailures.push('required-starting-basic-prompt-missing');
    roleResults[role]={
      role,seat,
      workerDecisionCount:roleAudit?.decisionCount??null,
      workerRootDecisionCount:roleAudit?.rootDecisionCount??null,
      workerPromptDecisionCount:roleAudit?.promptDecisionCount??null,
      hostOnlyPromptCount:roleAudit?.hostOnlyPromptCount??null,
      setupPromptDecisionCount:projectedRows.length,
      counts,
      setupPromptRows:projectedRows,
      complete:roleFailures.length===0,
      failures:roleFailures
    };
    for(const failure of roleFailures)failures.push(role+':'+failure);
  }

  if(totalGoFirst===0)failures.push('required-go-first-prompt-missing');
  const complete=failures.length===0&&
    roleResults.candidate?.complete===true&&roleResults.opponent?.complete===true;
  const totalSetupPromptDecisions=setupRows.length;
  return {
    schema:'agent19-agent36-v3-native-setup-prompt-audit-v1',
    visibility:'encrypted-full-only',
    candidateSeat,opponentSeat,
    setupPromptTypes:Object.fromEntries(Object.entries(SETUP_PROMPTS)
      .map(([message,spec])=>[spec.kind,{promptType:spec.promptType,message}])),
    roles:roleResults,
    setupPromptDecisions:totalSetupPromptDecisions,
    setupCountsBySeat,
    complete,
    accepted:complete,
    failures
  };
}

module.exports={buildSetupPromptAudit};
