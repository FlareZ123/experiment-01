'use strict';

const {evidenceBundleSha256}=require('../canonical-evidence-json.cjs');

const SHA256=/^[a-f0-9]{64}$/;
const SETUP_PROMPTS={
  CHOOSE_STARTING_POKEMONS:{kind:'starting-pokemon-choice',promptType:'ChooseCardsPrompt'},
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
      let classifiedSpec=spec;
      let minimumCount=null;
      if(message==='CHOOSE_STARTING_POKEMONS') {
        minimumCount=projection?.publicMetadata?.minimumCount;
        if(!nonNegativeInteger(minimumCount)) {
          failures.push('starting-pokemon-minimum-count-invalid:'+String(row.pendingPromptId));
          classifiedSpec={...spec,kind:'unclassified-starting-pokemon-choice'};
        } else {
          classifiedSpec={...spec,kind:minimumCount>=1?
            'starting-basics':'optional-extra-bench-placement'};
        }
      }
      setupRows.push({row,spec:classifiedSpec,message,minimumCount});
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
    {seat:0,startingBasics:0,optionalExtraBenchPlacements:0,goFirst:0,wantToDrawCards:0},
    {seat:1,startingBasics:0,optionalExtraBenchPlacements:0,goFirst:0,wantToDrawCards:0}
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
    const counts={startingBasics:0,optionalExtraBenchPlacements:0,goFirst:0,wantToDrawCards:0};
    const projectedRows=[];
    for(const item of roleSetupRows) {
      const {row,spec,message,minimumCount}=item;
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
         (promptContext?.message!==null&&promptContext?.message!==undefined&&
          promptContext.message!==message))
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
         receipt.actionFrontierSha256!==trace?.actionFrontierSha256||
         !Array.isArray(receipt.selectedTokens)||
         JSON.stringify(receipt.selectedTokens)!==JSON.stringify(trace?.selectedTokens)||
         receipt.selectedItemsSha256!==trace?.selectedItemsSha256)
        receiptFailures.push('cloned-prompt-validation-receipt-invalid');
      if(!Array.isArray(trace?.actionFrontier?.items)||
         trace.actionFrontier.items.length!==0||
         !digestMatches(trace.actionFrontier,trace.actionFrontierSha256))
        receiptFailures.push('owner-prompt-action-frontier-invalid');
      if(!digestMatches(trace?.validationReceipt,trace?.validationReceiptSha256)||
         !sameDigest(trace?.validationReceipt,receipt))
        receiptFailures.push('worker-trace-validation-receipt-mismatch');

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
      let recorderPromptSnapshotVerified=false;
      let publicBoardSha256=null;
      if(stepMatches.length!==1) {
        receiptFailures.push(stepMatches.length===0?
          'recorder-step-missing':'recorder-step-ambiguous');
      } else {
        const step=stepMatches[0];
        const publicPlayers=row.publicStateAfter?.players;
        publicBoardSha256=Array.isArray(step.publicBoard)?
          evidenceBundleSha256(step.publicBoard):null;
        const recorderBoardJoinVerified=Array.isArray(publicPlayers)&&
          Array.isArray(step.publicBoard)&&
          evidenceBundleSha256(publicPlayers)===publicBoardSha256;
        if(!recorderBoardJoinVerified)
          receiptFailures.push('recorder-public-board-join-invalid');

        const promptSnapshot=step.pendingPrompt;
        const promptSnapshotRoot=promptSnapshot?.snapshot;
        const promptProperties=promptSnapshotRoot?.properties;
        const promptOptionsProperties=promptProperties?.options?.properties;
        if(!promptSnapshot) {
          receiptFailures.push('recorder-prompt-snapshot-missing');
        } else if(promptSnapshot.schema!=='twinleaf-native-state-snapshot-v1'||
                  promptSnapshot.truncated!==false) {
          receiptFailures.push('recorder-prompt-snapshot-incomplete');
        } else if(promptSnapshotRoot?.$type!==row.pendingPromptType||
                  promptProperties?.id!==row.pendingPromptId||
                  promptProperties?.playerId!==row.actingPlayerId||
                  promptProperties?.message!==message) {
          receiptFailures.push('recorder-prompt-snapshot-identity-mismatch');
        } else if(message==='CHOOSE_STARTING_POKEMONS'&&
                  (!nonNegativeInteger(promptContext?.availableOptions?.min)||
                   promptOptionsProperties?.min!==promptContext.availableOptions.min)) {
          receiptFailures.push('recorder-prompt-minimum-count-mismatch');
        } else {
          recorderPromptSnapshotVerified=true;
        }
        recorderJoinVerified=recorderBoardJoinVerified&&recorderPromptSnapshotVerified;
      }

      const countKey=spec.kind==='starting-basics'?'startingBasics':
        spec.kind==='optional-extra-bench-placement'?'optionalExtraBenchPlacements':
        spec.kind==='go-first'?'goFirst':
        spec.kind==='want-to-draw-cards'?'wantToDrawCards':null;
      if(countKey) {
        counts[countKey]++;
        setupCountsBySeat[seat][countKey]++;
      } else {
        receiptFailures.push('setup-prompt-kind-unclassified');
      }
      if(spec.kind==='go-first')totalGoFirst++;

      projectedRows.push({
        role,kind:spec.kind,seat,playerId:row.actingPlayerId,
        turn:row.turnBefore,promptId:row.pendingPromptId,
        promptType:spec.promptType,promptMessage:message,
        minimumCount,
        actionOrdinal:ordinal,recorderStepOrdinal:nonNegativeInteger(ordinal)?ordinal+1:null,
        actionName:row.actionName,actionPayloadSha256:row.actionPayloadSha256??null,
        workerDecisionTraceSha256:row.workerDecisionTraceSha256??null,
        validationReceiptSha256:row.validationReceiptSha256??null,
        promptProjectionSha256:trace?.promptProjectionSha256??null,
        selectedTokenCount:Array.isArray(trace?.selectedTokens)?trace.selectedTokens.length:0,
        dispatchStatus:row.dispatchStatus,
        ledgerJoinVerified,recorderJoinVerified,recorderPromptSnapshotVerified,publicBoardSha256,
        accepted:receiptFailures.length===0,failures:receiptFailures
      });
      for(const failure of receiptFailures)
        roleFailures.push('prompt-'+String(row.pendingPromptId)+':'+failure);
    }

    if(counts.startingBasics!==1)
      roleFailures.push('required-starting-basic-prompt-count-not-one');
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

  if(totalGoFirst!==1)failures.push('required-go-first-prompt-count-not-one');
  const drawChoiceRows=setupRows.filter(item=>item.spec.kind==='want-to-draw-cards');
  const optionalBenchRows=setupRows.filter(item=>item.spec.kind==='optional-extra-bench-placement');
  if(drawChoiceRows.length>1)
    failures.push('want-to-draw-cards-prompt-count-exceeds-one');
  if(optionalBenchRows.length>1)
    failures.push('optional-extra-bench-prompt-count-exceeds-one');
  if(optionalBenchRows.length===1) {
    if(drawChoiceRows.length!==1) {
      failures.push('optional-extra-bench-requires-one-draw-choice');
    } else {
      const drawChoice=drawChoiceRows[0].row;
      const optionalBench=optionalBenchRows[0].row;
      if(drawChoice.actingSeat!==optionalBench.actingSeat||
         drawChoice.actionOrdinal>=optionalBench.actionOrdinal)
        failures.push('optional-extra-bench-must-follow-same-actor-draw-choice');
    }
  }
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

function projectV3WorkerExecutionBoundaryToTrial(workerExecutionAudit,{
  candidateSeat,opponentSeat,setupPromptAudit
}={}) {
  const failures=[];
  const roles={};
  const expectedSeats={candidate:candidateSeat,opponent:opponentSeat};
  const expectedScope='actor-observation-v3+actor-prompt-projection+public-event-receipt-v3+typed-action-frontier-v1';
  if(workerExecutionAudit?.schema!=='agent49-v3-worker-execution-audit-v1')
    failures.push('worker-execution-audit-schema-invalid');
  if(workerExecutionAudit?.workerProcessPerRole!==true)
    failures.push('worker-process-per-role-not-verified');
  if(workerExecutionAudit?.workerInputScope!==expectedScope)
    failures.push('worker-input-scope-mismatch');
  for(const field of [
    'physicalSeedDisclosedToWorker','policySeedDisclosedToWorker',
    'nativeStateDisclosedToWorker','opponentPrivateZonesDisclosedToWorker'
  ]) {
    if(workerExecutionAudit?.[field]!==false)
      failures.push(field+'-must-be-false');
  }
  if(workerExecutionAudit?.cleanupVerified!==true)
    failures.push('worker-cleanup-not-verified');
  if(workerExecutionAudit?.cleanupFailureCount!==0)
    failures.push('worker-cleanup-failure-count-nonzero');
  if(workerExecutionAudit?.replayableEvidence!==true)
    failures.push('worker-evidence-not-replayable');
  if(workerExecutionAudit?.policyRngViolations!==0)
    failures.push('policy-rng-violations-nonzero');
  if(workerExecutionAudit?.totalFailures!==0)
    failures.push('worker-failures-nonzero');
  if(workerExecutionAudit?.totalAbstentions!==0)
    failures.push('worker-abstentions-nonzero');
  if(!nonNegativeInteger(workerExecutionAudit?.totalWorkerDecisions)||
     workerExecutionAudit.totalWorkerDecisions===0)
    failures.push('worker-decision-total-missing-or-zero');
  if(setupPromptAudit?.schema!=='agent19-agent36-v3-native-setup-prompt-audit-v1')
    failures.push('setup-prompt-audit-schema-invalid');
  if(setupPromptAudit?.accepted!==true)
    failures.push('setup-prompt-audit-not-accepted');

  let roleDecisionTotal=0;
  let roleHostOnlyPromptTotal=0;
  let roleAbstentionTotal=0;
  let roleFailureTotal=0;
  let roleRngViolationTotal=0;
  for(const role of ROLE_NAMES) {
    const seat=expectedSeats[role];
    const row=workerExecutionAudit?.roles?.[role];
    const roleFailures=[];
    if(!(seat===0||seat===1))roleFailures.push('physical-seat-invalid');
    if(row?.role!==role||row?.seat!==seat)
      roleFailures.push('worker-role-seat-map-mismatch');
    if(typeof row?.policyVersion!=='string'||row.policyVersion.length===0)
      roleFailures.push('policy-version-missing');
    if(typeof row?.bundleSha256!=='string'||!SHA256.test(row.bundleSha256))
      roleFailures.push('worker-bundle-digest-invalid');
    if(typeof row?.policySha256!=='string'||!SHA256.test(row.policySha256))
      roleFailures.push('policy-digest-invalid');
    for(const field of ['decisionCount','rootDecisionCount','promptDecisionCount',
      'hostOnlyPromptCount','abstentionCount','failureCount','timeoutCount',
      'policyDrawViolationCount','actionFrontierAdmissionFailureCount']) {
      if(!nonNegativeInteger(row?.[field]))roleFailures.push(field+'-missing-or-invalid');
    }
    if(row?.decisionCount!==row?.rootDecisionCount+row?.promptDecisionCount)
      roleFailures.push('worker-decision-counts-do-not-reconcile');
    if(row?.promptDecisionCount<1)
      roleFailures.push('worker-role-has-no-owner-prompt-decisions');
    if(row?.rootDecisionCount<1)
      roleFailures.push('worker-role-has-no-owner-root-decisions');
    if(row?.abstentionCount!==0||row?.failureCount!==0||row?.timeoutCount!==0)
      roleFailures.push('worker-role-has-failure-or-abstention');
    if(row?.policyDrawViolationCount!==0||row?.policyRngReplayable!==true)
      roleFailures.push('worker-role-policy-rng-not-replayable');
    if(row?.actionFrontierAdmissionFailureCount!==0)
      roleFailures.push('worker-role-frontier-admission-failed');
    if(row?.workerProcessClosed!==true||row?.containerRemoved!==true||
       row?.policyBundleRemoved!==true)
      roleFailures.push('worker-role-process-or-bundle-cleanup-unverified');

    roleDecisionTotal+=nonNegativeInteger(row?.decisionCount)?row.decisionCount:0;
    roleHostOnlyPromptTotal+=nonNegativeInteger(row?.hostOnlyPromptCount)?row.hostOnlyPromptCount:0;
    roleAbstentionTotal+=nonNegativeInteger(row?.abstentionCount)?row.abstentionCount:0;
    roleFailureTotal+=nonNegativeInteger(row?.failureCount)?row.failureCount:0;
    roleRngViolationTotal+=nonNegativeInteger(row?.policyDrawViolationCount)?
      row.policyDrawViolationCount:0;
    roles[role]={
      role,seat,
      policyVersion:row?.policyVersion??null,
      bundleSha256:row?.bundleSha256??null,
      policySha256:row?.policySha256??null,
      decisionCount:row?.decisionCount??null,
      rootDecisionCount:row?.rootDecisionCount??null,
      promptDecisionCount:row?.promptDecisionCount??null,
      hostOnlyPromptCount:row?.hostOnlyPromptCount??null,
      workerProcessClosed:row?.workerProcessClosed===true,
      containerRemoved:row?.containerRemoved===true,
      policyBundleRemoved:row?.policyBundleRemoved===true,
      policyRngReplayable:row?.policyRngReplayable===true,
      policyDrawViolationCount:row?.policyDrawViolationCount??null,
      valid:roleFailures.length===0,
      failures:roleFailures
    };
    for(const failure of roleFailures)failures.push(role+':'+failure);
  }

  if(workerExecutionAudit?.totalWorkerDecisions!==roleDecisionTotal)
    failures.push('worker-decision-total-does-not-match-role-sum');
  if(workerExecutionAudit?.totalHostOnlyPrompts!==roleHostOnlyPromptTotal)
    failures.push('host-only-prompt-total-does-not-match-role-sum');
  if(workerExecutionAudit?.totalAbstentions!==roleAbstentionTotal)
    failures.push('worker-abstention-total-does-not-match-role-sum');
  if(workerExecutionAudit?.totalFailures!==roleFailureTotal)
    failures.push('worker-failure-total-does-not-match-role-sum');
  if(workerExecutionAudit?.policyRngViolations!==roleRngViolationTotal)
    failures.push('policy-rng-violation-total-does-not-match-role-sum');

  const cleanupReceipts=Array.isArray(workerExecutionAudit?.cleanupReceipts)?
    workerExecutionAudit.cleanupReceipts:[];
  if(cleanupReceipts.length!==2||
     !ROLE_NAMES.every(role=>cleanupReceipts.some(receipt=>
       receipt?.role===role&&receipt.processClosed===true&&receipt.containerRemoved===true)))
    failures.push('per-role-cleanup-receipts-incomplete');

  let workerExecutionAuditSha256=null;
  let setupPromptAuditSha256=null;
  try {
    if(workerExecutionAudit)workerExecutionAuditSha256=evidenceBundleSha256(workerExecutionAudit);
    if(setupPromptAudit)setupPromptAuditSha256=evidenceBundleSha256(setupPromptAudit);
  } catch {
    failures.push('worker-boundary-source-digest-failed');
  }
  return {
    schema:'agent19-agent49-v3-worker-execution-boundary-v1',
    visibility:'encrypted-full-only',
    candidateSeat,opponentSeat,
    workerExecutionAuditSha256,
    setupPromptAuditSha256,
    setupPromptAuditAccepted:setupPromptAudit?.accepted===true,
    workerProcessPerRole:workerExecutionAudit?.workerProcessPerRole===true,
    workerInputScope:workerExecutionAudit?.workerInputScope??null,
    physicalSeedDisclosedToWorker:workerExecutionAudit?.physicalSeedDisclosedToWorker??null,
    policySeedDisclosedToWorker:workerExecutionAudit?.policySeedDisclosedToWorker??null,
    nativeStateDisclosedToWorker:workerExecutionAudit?.nativeStateDisclosedToWorker??null,
    opponentPrivateZonesDisclosedToWorker:workerExecutionAudit?.opponentPrivateZonesDisclosedToWorker??null,
    roles,
    totalWorkerDecisions:workerExecutionAudit?.totalWorkerDecisions??null,
    totalHostOnlyPrompts:workerExecutionAudit?.totalHostOnlyPrompts??null,
    totalAbstentions:workerExecutionAudit?.totalAbstentions??null,
    totalFailures:workerExecutionAudit?.totalFailures??null,
    policyRngViolations:workerExecutionAudit?.policyRngViolations??null,
    replayableEvidence:workerExecutionAudit?.replayableEvidence===true,
    cleanupVerified:workerExecutionAudit?.cleanupVerified===true,
    cleanupFailureCount:workerExecutionAudit?.cleanupFailureCount??null,
    valid:failures.length===0,
    failures
  };
}

module.exports={
  buildSetupPromptAudit,
  projectV3WorkerExecutionBoundaryToTrial
};
