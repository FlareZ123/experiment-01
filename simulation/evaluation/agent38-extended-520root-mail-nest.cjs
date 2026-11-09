'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {randomUUID,createHash} = require('node:crypto');
const {run: runNative} =
  require('./agent43-v8-snaptrap-exact-prompt-blocker.cjs');
const REG = require('../../results/aichi-2026/registrations/agent38-extended-520root-mail-nest-20261109.json');

const VERSION = 'agent38-extended-520root-mail-nest-v1';
const OUTPUT = path.resolve(__dirname,
  '../../artifacts/agent43-v8-snaptrap-owner-root/agent38-extended-520root-mail-nest.json');

/**
 * Compare only the actor/action/turn/prompt structural prefix.
 * The actual Nest selected Pokemon identity is attested separately by
 * native post-Store physical card-movement receipts.
 * @param {object[]} early
 * @param {object[]} extended
 * @returns {object}
 */
function rootPrefixComparison(early,extended) {
  const key=x=>JSON.stringify([x.trialId,x.ordinal,x.action,
    x.seat,x.turn,x.promptId,x.responseType,
    x.ownerMailAfterPassAction,x.previouslyMailSelectedTrainerPlayed]);
  const n=Math.min(early.length,extended.length);
  const mismatch=Array.from({length:n},(_,i)=>i)
    .find(i=>key(early[i])!==key(extended[i]));
  return {compared:n,
    identicalPrefix:mismatch===undefined,
    firstMismatchIndex:mismatch??null,
    originalN:early.length,extendedN:extended.length};
}

/** @param {object} result Native result for the exact registered arm. */
function outcome(result,id) {
  const a=result.attempts.find(x=>x.id===id);
  assert.ok(a, 'all registered original-source trials must appear');
  const counts=a.nativeRootActionMix??{};
  const sourceSeat=a.sourceSeat;
  return {
    sourceSeat,seed:a.seed,
    status:a.nativeStatus,finished:a.nativeFinished,
    winner:a.nativeWinner,endReason:a.nativeEndReason,
    actionCount:a.nativeActionCount,turnCount:a.nativeTurnCount,
    finalPrizes:a.nativeFinalPrizes,
    blockedStage:a.nativeFailureStage,
    sourceRootActions:Object.fromEntries(
      Object.entries(counts).filter(([key])=>key.startsWith(sourceSeat+':'))),
    opponentRootActions:Object.fromEntries(
      Object.entries(counts).filter(([key])=>key.startsWith((1-sourceSeat)+':'))),
    sourceAttackActions:counts[sourceSeat+':AttackAction']??0,
    sourcePassActions:counts[sourceSeat+':PassTurnAction']??0,
    opponentAttackActions:counts[(1-sourceSeat)+':AttackAction']??0,
    publicFinalBoard:a.nativeFinalPublicBoard
  };
}

/** Exact original-source A260, A520, B520 paired study. */
function run() {
  assert.equal(REG.schema, VERSION);
  assert.equal(REG.status,'FROZEN_BEFORE_EXECUTION');
  assert.equal(REG.newNativeRootActionCap,520);
  assert.equal(REG.previousNativeCap,260);
  const a260=runNative({...REG.baseline,nativeRootCap:260});
  const a520=runNative(REG.baseline);
  const b520=runNative(REG.treatment);
  const settings=[a260,a520,b520];
  for(const [i,result] of settings.entries()){
    assert.deepEqual(result.exactOriginalTrialIds,REG.exactOriginalTrialIds);
    assert.equal(result.preservedNativeRootCap,i===0?260:520);
    assert.ok(result.ownerMailAudit);
    assert.equal(result.ownerMailAudit.rejectedPromptActions,0);
    assert.equal(result.ownerMailAudit.unsettledPromptActions,0);
    assert.equal(result.ownerMailAudit.opponentPrivateZonesRead,false);
  }
  const panel=REG.exactOriginalTrialIds.map(id=>{
    const tape=result=>result.publicRootTape.filter(row=>row.trialId===id);
    const baseline=outcome(a260,id);
    const extended=outcome(a520,id);
    const treatment=outcome(b520,id);
    assert.equal(baseline.seed,extended.seed);
    assert.equal(extended.seed,treatment.seed);
    assert.equal(baseline.sourceSeat,extended.sourceSeat);
    assert.equal(extended.sourceSeat,treatment.sourceSeat);
    const bNest=a520.ownerMailAudit.nestFromMailBenchEvents
      .filter(x=>x.trialId===id);
    const tNest=b520.ownerMailAudit.nestFromMailBenchEvents
      .filter(x=>x.trialId===id);
    return {
      id,sourceSeat:baseline.sourceSeat,
      prefix260to520:rootPrefixComparison(tape(a260),tape(a520)),
      a260:baseline,a520:extended,b520:treatment,
      a520Nest:bNest,b520Nest:tNest,
      nameCountByArm:{a260:tape(a260).length,
        a520:tape(a520).length,b520:tape(b520).length}
    };
  });
  const prefixPassed=panel.every(row=>row.prefix260to520.identicalPrefix);
  const extendedTerminals=panel.reduce((n,row)=>
    n+Number(row.a520.finished===true),0);
  const treatmentTerminals=panel.reduce((n,row)=>
    n+Number(row.b520.finished===true),0);
  return {
    schema:VERSION,registration:REG,
    runnerHead:process.env.GITHUB_SHA??null,
    audit:{
      baseline260:a260.ownerMailAudit,
      baseline520:a520.ownerMailAudit,
      treatment520:b520.ownerMailAudit
    },
    panel,
    summary:{
      originalCapTerminals:panel.reduce((n,row)=>
        n+Number(row.a260.finished===true),0),
      extendedCapTerminals:extendedTerminals,
      treatmentCapTerminals:treatmentTerminals,
      allOriginalPrefixesPreserved:prefixPassed,
      totalSourceAttacks260:panel.reduce((n,row)=>n+row.a260.sourceAttackActions,0),
      totalSourceAttacks520:panel.reduce((n,row)=>n+row.a520.sourceAttackActions,0),
      treatmentSourceAttacks520:panel.reduce((n,row)=>n+row.b520.sourceAttackActions,0),
      anyWinnerChange:panel.some(row=>row.a520.finished===true&&
        row.b520.finished===true&&row.a520.winner!==row.b520.winner),
      status:prefixPassed?'REGISTERED_EXTENDED_NATIVE_HORIZON_EXECUTED':
        'ROOT_PREFIX_DRIFT'
    },
    competitivelyQualifiedGames:0,
    estimatedWinRate:null,selectedFinalDeck:false
  };
}

function save(value) {
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');
  const digest=createHash('sha256').update(bytes).digest('hex');
  const fd=fs.openSync(OUTPUT+'.lock','wx');
  const temp=OUTPUT+'.'+process.pid+'.'+randomUUID()+'.tmp';
  const side=OUTPUT+'.sha256';
  const sideTemp=side+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    fs.renameSync(temp,OUTPUT);
    fs.writeFileSync(sideTemp,digest+'  '+path.basename(OUTPUT)+'\n',{flag:'wx'});
    fs.renameSync(sideTemp,side);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    if(fs.existsSync(sideTemp))fs.unlinkSync(sideTemp);
    fs.closeSync(fd);fs.unlinkSync(OUTPUT+'.lock');
  }
  return OUTPUT;
}

if(require.main===module) {
  let report;
  try{report=run();}
  catch(error){
    report={schema:VERSION,status:'NATIVE_ERROR',
      failure:{name:error.name,message:error.message},
      competitivelyQualifiedGames:0};
    process.exitCode=1;
  }
  const output=save(report);
  process.stdout.write(JSON.stringify({
    output,status:report.summary?.status??report.status,
    summary:report.summary,
    cases:report.panel?.map(row=>({
      trial:row.id,sourceSeat:row.sourceSeat,
      prefix:row.prefix260to520,
      caps:[row.a260.endReason,row.a520.endReason,row.b520.endReason],
      finals:[row.a260.finalPrizes,row.a520.finalPrizes,row.b520.finalPrizes],
      winners:[row.a260.winner,row.a520.winner,row.b520.winner],
      sourceAttacks:[row.a260.sourceAttackActions,
        row.a520.sourceAttackActions,row.b520.sourceAttackActions],
      sourcePasses:[row.a260.sourcePassActions,
        row.a520.sourcePassActions,row.b520.sourcePassActions],
      lastActionCounts:[row.a260.actionCount,
        row.a520.actionCount,row.b520.actionCount],
      a520Selected:row.a520Nest.map(x=>x.selectedPokemonPrinting),
      b520Selected:row.b520Nest.map(x=>x.selectedPokemonPrinting)
    }))??null,
    error:report.failure??null
  },null,2)+'\n');
}
module.exports={VERSION,REG,rootPrefixComparison,outcome,run,save};
