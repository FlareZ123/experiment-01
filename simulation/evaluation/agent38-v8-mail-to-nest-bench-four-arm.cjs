'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID, createHash} = require('node:crypto');
const {run: native} = require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');
const {firstDivergence, mailContinuation} =
  require('./agent38-v8-owner-mail-pass-four-arm.cjs');
const REG = require('../../results/aichi-2026/registrations/agent38-v8-mail-to-nest-physical-bench-four-arm-20261108.json');
const VERSION = REG.schema;
const OUTPUT = path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent38-mail-to-nest-bench.json');

function save(value) {
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  const bytes = Buffer.from(JSON.stringify(value, null, 2) + '\n');
  const digest = createHash('sha256').update(bytes).digest('hex');
  const fd = fs.openSync(OUTPUT + '.lock', 'wx');
  const temporary = OUTPUT + '.' + process.pid + '.' + randomUUID() + '.tmp';
  const signature = OUTPUT + '.sha256';
  const signatureTmp = signature + '.' + process.pid + '.' +
    randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temporary, bytes, {flag:'wx'});
    fs.renameSync(temporary, OUTPUT);
    fs.writeFileSync(signatureTmp, digest + '  ' +
      path.basename(OUTPUT) + '\n', {flag:'wx'});
    fs.renameSync(signatureTmp, signature);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    if (fs.existsSync(signatureTmp)) fs.unlinkSync(signatureTmp);
    fs.closeSync(fd);
    fs.unlinkSync(OUTPUT + '.lock');
  }
  return OUTPUT;
}

function run() {
  assert.equal(REG.status, 'FROZEN_BEFORE_EXECUTION');
  assert.equal(REG.nativeRootCap, 260);
  assert.equal(REG.exactOriginalTrialIds.length, 4);
  const opts = {ownerAbilityConfirm:true,ownerMailAfterPass:true,
    captureRootTape:true};
  const before=native(opts);
  const after=native({...opts,followMailNestBall:true});
  assert.deepEqual(before.exactOriginalTrialIds,REG.exactOriginalTrialIds);
  assert.deepEqual(after.exactOriginalTrialIds,REG.exactOriginalTrialIds);
  assert.equal(before.preservedNativeRootCap, REG.nativeRootCap);
  assert.equal(after.preservedNativeRootCap, REG.nativeRootCap);
  assert.ok(before.ownerMailAudit && after.ownerMailAudit);
  const panel=REG.exactOriginalTrialIds.map(id=>{
    const b=before.attempts.find(a=>a.id===id);
    const a=after.attempts.find(a=>a.id===id);
    assert.ok(b&&a);
    const baseTape=before.publicRootTape.filter(row=>row.trialId===id);
    const treatmentTape=after.publicRootTape.filter(row=>row.trialId===id);
    const nest=after.ownerMailAudit.nestFromMailBenchEvents.filter(
      row=>row.trialId===id);
    const actualNestTrainers=after.ownerMailAudit.selectedTrainerLaterPlayed.filter(
      row=>row.trialId===id && row.printing==='Nest Ball SVI');
    const first=firstDivergence(baseTape,treatmentTape);
    const downstream=after.ownerMailAudit.actualMailEvents
      .filter(row=>row.trialId===id)
      .map(row=>treatmentTape.find(root=>
        root.ownerMailAfterPassAction===true &&
        root.turn===row.turnBefore &&
        root.seat===row.seat))
      .filter(Boolean);
    const subsequent=downstream.map(mail=>mailContinuation(mail,treatmentTape));
    return {
      id,firstChangedNativeRoot:first,
      ownerMailSelectedNestPlays:actualNestTrainers,
      physicalNestBasicToBench:nest,
      baseline:{status:b.nativeStatus,finished:b.nativeFinished,
        winner:b.nativeWinner,endReason:b.nativeEndReason,
        finalPrizes:b.nativeFinalPrizes,actionCount:b.nativeActionCount},
      treatment:{status:a.nativeStatus,finished:a.nativeFinished,
        winner:a.nativeWinner,endReason:a.nativeEndReason,
        finalPrizes:a.nativeFinalPrizes,actionCount:a.nativeActionCount},
      downstreamMeaningfulOpponentAndNextOwnTurn:
        subsequent.some(row=>row.continuityPassed)
    };
  });
  const physicalBench=panel.reduce((n,p)=>n+p.physicalNestBasicToBench.length,0);
  const actualNest=panel.reduce((n,p)=>n+p.ownerMailSelectedNestPlays.length,0);
  const chosen=after.ownerMailAudit;
  return {schema:VERSION,sourceRegistration:REG.sourceRegistration,
    sourceOriginalSixtiesUnchanged:true,
    allOriginalTrialIds:REG.exactOriginalTrialIds,
    nativeRootCap:REG.nativeRootCap,
    controlOptions:opts,treatmentOptions:{...opts,followMailNestBall:true},
    control:before,treatment:after,panel,
    summary:{actualNestFromMailPlays:actualNest,
      realBasicPokemonBenchedFromNest:physicalBench,
      nativeNestOffers:chosen.nestFromMailOffers,
      actualNativeNestPlays:chosen.nestFromMailActualPlays,
      continuationAfterMailPresent:
        panel.some(row=>row.downstreamMeaningfulOpponentAndNextOwnTurn),
      status:physicalBench>0?'MAIL_TO_NEST_TO_BENCH_NATIVE_SETTLED':
        'NO_PHYSICAL_NEST_TO_BENCH_WITNESS'},
    competitiveGamesQualified:0,estimatedWinRate:null};
}

if (require.main===module) {
  let report;
  try{report=run();}
  catch(error){
    report={schema:VERSION,summary:{status:'EXPERIMENT_ERROR'},
      error:{name:error.name,message:error.message},
      competitiveGamesQualified:0,estimatedWinRate:null};
    process.exitCode=1;
  }
  save(report);
  console.log(JSON.stringify({
    schema:VERSION,
    summary:report.summary,
    perArm:report.panel?.map(row=>({
      id:row.id,
      firstChangedRoot:row.firstChangedNativeRoot?.control?.action??null,
      firstTreatmentRoot:row.firstChangedNativeRoot?.treatment?.action??null,
      ownerMailSelectedNestPlays:row.ownerMailSelectedNestPlays,
      physicalNestBasicToBench:row.physicalNestBasicToBench,
      baselineEnd:row.baseline.endReason,
      treatmentEnd:row.treatment.endReason,
      baselinePrizes:row.baseline.finalPrizes,
      treatmentPrizes:row.treatment.finalPrizes,
      downstreamContinuation:row.downstreamMeaningfulOpponentAndNextOwnTurn
    }))??null,
    error:report.error??null
  },null,2));
  if(report.summary?.status!=='MAIL_TO_NEST_TO_BENCH_NATIVE_SETTLED')
    process.exitCode=1;
}

module.exports={VERSION,REG,run,save};
