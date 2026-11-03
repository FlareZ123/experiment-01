'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const SCHEMA='agent4-selected-v3-paper-owner-floatstone-source-a-b-a-v1';
const TOOL='Float Stone BKT';
const SELECTED='selected-v3-paper-plus-funded-mobility';
const CONTROL='corrected-bilateral-control-a';

/**
 * Retrospectively audit the archived selected-v3 actual authenticated Store
 * frontier. A native offer and a held Tool are necessary evidence only;
 * neither establishes print-legal attachment, retreat, or attack payoff.
 *
 * @param {object} archive Frozen Agent4 A/B/A archive as decoded JSON.
 * @returns {object} Read-only per-root activation-denominator evidence.
 */
function auditArtifact(archive) {
  assert.equal(archive?.schema,SCHEMA);
  assert.ok(Array.isArray(archive.modes));
  const mode=archive.modes.find(x=>x.id===SELECTED);
  const control=archive.modes.find(x=>x.id===CONTROL);
  assert.ok(mode&&control);
  assert.ok(Array.isArray(mode.fullNative?.rows));
  assert.ok(Array.isArray(mode.rows));
  const controlRows=new Map(control.rows.map(x=>[x.trialId,x]));
  const summaries=[];
  const totals={
    registeredContexts:mode.rows.length,
    intactContexts:0,
    abortedContexts:0,
    candidateOwnerFrames:0,
    candidatePassFrames:0,
    heldToolCandidateFrames:0,
    nativeOfferedToolCandidateFrames:0,
    heldToolCandidatePassFrames:0,
    nativeOfferedToolCandidatePassFrames:0,
    nativeSelectedFundedToolIntents:0,
    identicalIntactControlLedgers:0
  };
  const summaryRows=new Map(mode.rows.map(x=>[x.trialId,x]));
  for(const row of mode.fullNative.rows) {
    const trial=row.trial;
    assert.equal(typeof trial?.id,'string');
    const s=summaryRows.get(trial.id);
    const c=controlRows.get(trial.id);
    assert.ok(s&&c,'Each native row must have both summary and control');
    const traceMatched=Boolean(s.rootLedgerHash)&&
      s.rootLedgerHash===c.rootLedgerHash;
    const info={
      trialId:trial.id,rank:trial.rank,sourceSeat:null,
      candidateSeat:null,rootStatus:row.status??'native-returned',
      controlLedgerMatched:traceMatched,
      candidateOwnerFrames:0,candidatePassFrames:0,
      heldToolFrames:0,nativeOfferedToolFrames:0,
      heldToolPassFrames:0,nativeOfferedToolPassFrames:0,
      selectedIntents:s.selectedFundedFloatStoneIntents??0,
      positivePaperEligibilityCertified:false,
      candidatePassToolWindows:[]
    };
    totals.nativeSelectedFundedToolIntents+=info.selectedIntents;
    if(!row.actorOnlyDecisionCoverage){
      assert.equal(typeof row.error,'string',
        'Incomplete row without actor coverage must retain native error');
      totals.abortedContexts++;
      summaries.push(info);
      continue;
    }
    totals.intactContexts++;
    if(traceMatched)totals.identicalIntactControlLedgers++;
    const frontier=row.actorOnlyDecisionCoverage.ownerTrainerFrontierAudit;
    assert.equal(frontier.observedAuthenticStore,true);
    assert.ok(Array.isArray(frontier.roots));
    info.sourceSeat=row.sourceSeat;
    info.candidateSeat=row.candidateSeat;
    for(const frame of frontier.roots){
      if(frame.seat!==row.candidateSeat)continue;
      totals.candidateOwnerFrames++;
      info.candidateOwnerFrames++;
      const pass=frame.chosen?.action==='PassTurnAction';
      if(pass){
        totals.candidatePassFrames++;
        info.candidatePassFrames++;
      }
      const tools=frame.trainers.filter(x=>x.printing===TOOL);
      if(!tools.length)continue;
      totals.heldToolCandidateFrames++;
      info.heldToolFrames++;
      const offered=tools.some(x=>x.nativeEnumeratorOffered===true);
      if(offered){
        totals.nativeOfferedToolCandidateFrames++;
        info.nativeOfferedToolFrames++;
      }
      if(!pass)continue;
      totals.heldToolCandidatePassFrames++;
      info.heldToolPassFrames++;
      if(offered){
        totals.nativeOfferedToolCandidatePassFrames++;
        info.nativeOfferedToolPassFrames++;
      }
      info.candidatePassToolWindows.push({
        globalTurn:frame.turn,ownerFrontierOrdinal:frame.ordinal,
        physicalHeldCopies:tools.length,nativeOffered:offered,
        publiclyKnownBlockers:tools.map(t=>t.publicBlocker),
        paperEligibility:tools.map(t=>t.paperEligibility),
        chosenAction:frame.chosen.action
      });
    }
    summaries.push(info);
  }
  assert.equal(summaries.length,mode.rows.length);
  assert.equal(totals.intactContexts+totals.abortedContexts,
    totals.registeredContexts);
  return {
    version:'agent8-selected-v3-floatstone-offer-vs-paper-denominator-v1',
    sourceArchiveSchema:SCHEMA,selectedMode:SELECTED,
    controlMode:CONTROL,totals,summaries,
    importantBoundary:'Repeated owner decision frames in only the registered games; native offered != paper-valid; no independent game-win evidence, complete future root selection, or verified attack payoff.'
  };
}

/** @param {string[]} argv File path to decoded immutable native JSON. */
function main(argv) {
  assert.equal(argv.length,1,'Supply one decoded immutable Agent4 v3 JSON path');
  const archive=JSON.parse(fs.readFileSync(argv[0],'utf8'));
  return auditArtifact(archive);
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(process.argv.slice(2)),null,2)+'\n');
module.exports={SCHEMA,TOOL,SELECTED,CONTROL,auditArtifact,main};
