'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:run96}=require('./agent4-mail-postsetup-96root-opportunity-v3.cjs');
const {runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-96root-volt-abort-readout-20261105.json');

const VERSION='agent4-native-aftersetup-original-volt-abort-readout-v1';
const TARGET=REG.registeredTrial;
const CHAMPION=REG.pairedChampionTrial;
const PHASES=['legacy','A-control','B-source-Mail','A-repeat'];

/**
 * Read only a completed native row. Never attach result to an active bot.
 * Preserve actual accepted public root chronology and safe public zone state.
 * Bot-decoder/strict-prompt exception text is already redacted upstream.
 * @param {object} row
 */
function originalPublicAbortReadout(row){
  assert.ok(row&&typeof row==='object');
  const evidence=row.nativeAbortEvidence??null;
  const ledger=row.rootActionLedger??evidence?.rootActionLedger??[];
  assert.ok(Array.isArray(ledger));
  const compact=root=>({
    ordinal:root.actionOrdinal??null,
    turn:root.turnBefore??null,
    seat:root.playerSlot??null,
    action:root.action??null,
    card:root.card??null,
    attack:root.attack??null,
    pendingPrompt:root.pendingPrompt??null
  });
  const accepted=ledger.map(compact);
  const volt=accepted.filter(root=>
    root.action==='AttackAction'&&root.attack==='Volt Cyclone');
  const afterAttack=volt.length?accepted.filter(root=>
    root.ordinal>volt[volt.length-1].ordinal):[];
  const nextCandidateRoot=volt.length?
    (afterAttack.find(root=>root.seat===0&&
      ['AttackAction','PlayCardAction','PassTurnAction','UseAbilityAction',
        'RetreatAction'].includes(root.action))??null):null;
  const stage=evidence?.failureStage??null;
  const diagnostics={
    failureStage:stage,
    failedActionOrdinal:evidence?.actionOrdinal??null,
    failedActionName:evidence?.actionName??null,
    failedTurn:evidence?.turnBefore??null,
    failedActingSeat:evidence?.actingSeat??null,
    failedPendingPrompt:evidence?.pendingPrompt??null,
    lastAcceptedRootOrdinal:accepted.at(-1)?.ordinal??null,
    decoderFrameAttribution:evidence?.decoderFrameAttribution??null,
    nativeStoreSourceLocations:
      String(row.nativeStoreCauseStack??'').split('\n')
        .map(s=>s.match(/(?:[\\/]|^)([A-Za-z0-9_.-]+\.(?:js|cjs|ts)):(\d+):(\d+)/))
        .filter(Boolean).slice(0,8)
        .map(m=>({file:m[1],line:Number(m[2]),column:Number(m[3])})),
    nativeErrorMessageSha256:row.error?
      createHash('sha256').update(String(row.error)).digest('hex'):null,
    // The next real Store action can be a pending prompt; a declaration
    // alone must never be promoted to a resolved physical attack.
    preFailurePublicBoard:evidence?.preDispatchBoard??null,
    preFailurePublicCounts:evidence?.preDispatchPublic??null
  };
  return {
    id:row.trial?.id??row.id,
    nativeStatus:row.status??(row.finished===true?
      'native-terminal-unqualified':'nonterminal-unqualified'),
    sourceSeat:row.sourceSeat??row.nativeAbortProvenance?.sourceSeat??null,
    acceptedRootCount:accepted.length,
    acceptedLast12PublicRoots:accepted.slice(-12),
    allVoltCycloneAcceptedPublicRoots:volt,
    rootsAfterSourceVoltCyclone:afterAttack,
    firstCandidateMeaningfulResponseAfterVoltCyclone:nextCandidateRoot,
    candidateResponseConfirmed:nextCandidateRoot!==null,
    ...diagnostics,
    physicalPaperDamageOrPaymentProven:false,
    competitiveGameQualified:false
  };
}

/** @param {{incumbent?:Function,runner?:Function}} [deps] */
function run(deps={}){
  const messages=[];
  let completedPhases=0;
  const base=deps.incumbent??(()=>runStewardInnermostPrizeV5({
    runner:options=>runDevelopment({
      ...options,nativeRootActionLimit:96
    })
  }));
  const incumbent=()=>{
    const value=base();
    const rows=value.rawDevelopment?.rows??[];
    assert.equal(rows.length,8);
    const phase=PHASES[completedPhases++];
    assert.ok(phase,'Unexpected extra native phase');
    const selected=[TARGET,CHAMPION].map(id=>{
      const row=rows.find(x=>(x.trial?.id??x.id)===id);
      assert.ok(row,'Missing original target source ID: '+id);
      return originalPublicAbortReadout(row);
    });
    messages.push({phase,selected});
    return value;
  };
  const prior=(deps.runner??run96)({incumbent});
  assert.equal(completedPhases,4);
  assert.equal(messages.length,4);
  assert.ok(Object.values(prior.gates).every(Boolean),
    'Existing frozen 96root gates must remain true');
  const treatment=messages[2].selected.find(row=>row.id===TARGET);
  const previousAttackCount=prior.sourceAndCandidateOpportunitySummary
    .sourceSelectedAttackDeclarationsTreatment;
  assert.ok(previousAttackCount>=1);
  return {schema:VERSION,readoutRegistration:REG.schema,
    originalNativeRun:REG.sourceRun,
    exactAll32RegisteredGamesReexecuted:true,
    v3Gates:prior.gates,
    targetNativeEvent:treatment,
    allPhaseTargetAndChampionPublicAbortReadouts:messages,
    registeredSourceVoltCycloneCountFromV3:previousAttackCount,
    controlledNativeQualification:0,winRate:null,
    conservativeInterpretation:
      'Native accepted root and pending subsequent actions are developmental only; no full paper effect or opponent response is assumed'};
}
if(require.main===module){
  const file=process.env.AGENT4_VOLT_ABORT_READOUT_OUTPUT;
  assert.ok(file,'Require atomic native output filename');
  const output=run(),bytes=JSON.stringify(output,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,bytes);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+'  '+
    path.basename(file)+'\n');
  process.stdout.write('AGENT4_VOLT_ABORT_READOUT '+JSON.stringify({
    gates:output.v3Gates,
    phases:output.allPhaseTargetAndChampionPublicAbortReadouts
      .map(x=>({phase:x.phase,
        target:x.selected.find(y=>y.id===TARGET)&&
          (({id,nativeStatus,acceptedRootCount,allVoltCycloneAcceptedPublicRoots,
            candidateResponseConfirmed,failureStage,failedActionOrdinal,
            failedActionName,failedTurn,failedActingSeat,failedPendingPrompt,
            decoderFrameAttribution,nativeStoreSourceLocations,
            acceptedLast12PublicRoots,preFailurePublicBoard})=>({
              id,nativeStatus,acceptedRootCount,allVoltCycloneAcceptedPublicRoots,
              candidateResponseConfirmed,failureStage,failedActionOrdinal,
              failedActionName,failedTurn,failedActingSeat,failedPendingPrompt,
              decoderFrameAttribution,nativeStoreSourceLocations,
              acceptedLast12PublicRoots,preFailurePublicBoard}))(x.selected.find(y=>y.id===TARGET))
      })),
    qualifiedGames:0
  })+'\n');
}
module.exports={VERSION,originalPublicAbortReadout,run};
