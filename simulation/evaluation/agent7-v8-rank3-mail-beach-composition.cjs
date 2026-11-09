'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {randomUUID}=require('node:crypto');
const {run:runV8,SEED,ENGINE_PIN}=
  require('./agent2-v8-common-first-owner-root-canary.cjs');
const {traceBeachNativeRun}=
  require('./agent7-v8-rank3-early-beach-native.cjs');
const {withBilateralOwnerMail}=
  require('../twinleaf/agent38-v8-four-arm-owner-mail-native.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent7-native-rank3-owner-mail-then-beach-control-treatment-v1';
const TRIAL_IDS=['3:0:A:agent2-original-rank13-v8-common',
  '3:0:B:agent2-original-rank13-v8-common'];
const FLAGS=['AGENT7_EARLY_BEACH_DEV',
  'AGENT7_EARLY_BEACH_DEFER_MAIL_DEV'];

/** Compare unchanged actual first-eligible Mail before optional Beach fallback. */
function runBranch(earlyBeach,followArven=false,{mysteriousTreasureRoot=false,ownerConfirm=false,arvenNest=false}={}){
  const base=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
  const native=relative=>require(path.join(base,relative));
  const headless=require('../twinleaf/headless.cjs');
  const before=Object.fromEntries(FLAGS.map(flag=>[flag,process.env[flag]]));
  try{
    if(earlyBeach){
      process.env.AGENT7_EARLY_BEACH_DEV='true';
      process.env.AGENT7_EARLY_BEACH_DEFER_MAIL_DEV='true';
    }else for(const flag of FLAGS)delete process.env[flag];
    let mail=null;
    const traced=traceBeachNativeRun(()=>{
      mail=withBilateralOwnerMail(
        ()=>runV8({ownerMailFollowupFrame:true,mysteriousTreasureRoot}),{
        headless,
        SimpleTacticsAi:native('simple-bot/simple-tactics-ai').SimpleTacticsAi,
        Store:native('game/store/store').Store,
        PlayCardAction:native('game/store/actions/play-card-action').PlayCardAction,
        ResolvePromptAction:
          native('game/store/actions/resolve-prompt-action').ResolvePromptAction,
        types:native('game/store/card/card-types'),
        trialIds:TRIAL_IDS,
        followMailArven:followArven,
        followOwnerConfirm:ownerConfirm,
        followArvenNestBall:arvenNest,
        preferSinglePrizeNestBasic:arvenNest,
        playCardEnums:native('game/store/actions/play-card-action')
      });
      return mail.result;
    });
    const output=traced.output;
    assert.deepEqual(output.rows.map(row=>row.trialId),TRIAL_IDS);
    return {
      earlyBeach,followArven,mysteriousTreasureRoot,ownerConfirm,arvenNest,
      output,beachEvents:traced.events,
      mailAudit:mail.audit
    };
  }finally{
    for(const flag of FLAGS){
      if(before[flag]===undefined)delete process.env[flag];
      else process.env[flag]=before[flag];
    }
  }
}

function pairedMailBeachEvidence(treatment){
  const mailEvents=treatment.mailAudit.actualMailEvents;
  const selected=treatment.mailAudit.revealedTrainers;
  const beachEvents=treatment.beachEvents.filter(e=>e.nativeStoreAccepted);
  return beachEvents.flatMap(play=>{
    if(play.action!=='PlayCardAction'||!play.ownerAfter?.stadium?.
      some(card=>card.startsWith('Tropical Beach ')))return [];
    const use=beachEvents.find(e=>
      e.action==='UseStadiumAction'&&
      e.seat===play.seat&&e.globalTurnBefore===play.globalTurnBefore&&
      e.ownerBefore?.handCount===play.ownerAfter.handCount&&
      e.ownerAfter?.handCount===7&&
      e.ownerBefore?.deckCount>e.ownerAfter?.deckCount);
    if(!use)return [];
    const mail=mailEvents.find(e=>e.seat===play.seat&&
      e.turnBefore===play.globalTurnBefore);
    if(!mail)return [];
    const chosen=selected.filter(e=>
      e.seat===play.seat&&e.trialId===mail.trialId);
    if(!chosen.length)return [];
    return [{
      trialId:mail.trialId,sourceSeat:mail.seat,
      globalTurn:play.globalTurnBefore,
      mailHandIndex:mail.actionHandIndex,
      mailPromptId:mail.pendingPromptId,
      mailTrainerSelected:chosen.map(x=>x.printing),
      nativeBeachPlayPrinting:play.heldPrinting,
      handBeforeBeach:play.ownerBefore.handCount,
      handAfterBeachPlace:play.ownerAfter.handCount,
      handAfterBeachUse:use.ownerAfter.handCount,
      deckBeforeBeachUse:use.ownerBefore.deckCount,
      deckAfterBeachUse:use.ownerAfter.deckCount,
      nativeMailRootAccepted:true,
      nativeTrainerTransferred:true,
      nativeBeachPlaceAndUseAccepted:true,
      nextTurnAfterBeach:use.nativeGlobalTurnAfter
    }];
  });
}

function run(){
  const control=runBranch(false);
  const treatment=runBranch(true);
  assert.equal(control.mailAudit.attempts,2);
  assert.equal(treatment.mailAudit.attempts,2);
  const pairs=pairedMailBeachEvidence(treatment);
  const physicalMail=branch=>branch.mailAudit.physicalTrainerToHandBySeat.
    reduce((n,v)=>n+v,0);
  return {
    schema:VERSION,enginePin:ENGINE_PIN,seed:SEED,
    frozenOriginalRank13AndRank3Sixties:true,
    trialIds:TRIAL_IDS,nativeActionLimit:128,
    pairedFirstEligibleMailPolicy:'agent38-v8-owner-mail-four-arm-native-v1',
    experimentalEarlyBeachOnlyAfterMailDeclinedRoot:true,
    control:{
      physicallySelectedTrainers:physicalMail(control),
      mailRootEvents:control.mailAudit.actualMailEvents,
      nativeBeachEvents:control.beachEvents,
      trialStatuses:control.output.rows.map(r=>({
        id:r.trialId,status:r.status,
        nativeFirstRoots:r.nativeAbortEvidence?.initialAcceptedRootPrefix??[]
      }))
    },
    treatment:{
      physicallySelectedTrainers:physicalMail(treatment),
      mailRootEvents:treatment.mailAudit.actualMailEvents,
      nativeBeachEvents:treatment.beachEvents,
      selectedTrainers:treatment.mailAudit.revealedTrainers,
      trialStatuses:treatment.output.rows.map(r=>({
        id:r.trialId,status:r.status,
        nativeFirstRoots:r.nativeAbortEvidence?.initialAcceptedRootPrefix??[]
      }))
    },
    mailThenBeachConfirmedPairs:pairs,
    nativeJointSequenceConfirmed:pairs.length>0,
    nativeMailPromptSettlementsUnresolved:
      control.mailAudit.unsettledPromptActions+
      treatment.mailAudit.unsettledPromptActions,
    competitiveGamesQualified:0,estimatedWinRate:null
  };
}

/** Atomic report with an exclusive per-path lock. */
function save(report){
  const dir=path.join(ROOT,'artifacts/agent7-v8-rank3-mail-beach');
  fs.mkdirSync(dir,{recursive:true});
  const dest=path.join(dir,'paired-native.json');
  const lock=dest+'.lock',fd=fs.openSync(lock,'wx');
  const temp=dest+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,dest);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
  return dest;
}

if(require.main===module){
  const report=run();
  const artifact=save(report);
  process.stdout.write(JSON.stringify({
    schema:report.schema,artifact,
    exactOriginalTrialIds:report.trialIds,
    controlPhysicalMailTrainers:report.control.physicallySelectedTrainers,
    treatmentPhysicalMailTrainers:report.treatment.physicallySelectedTrainers,
    mailThenBeachConfirmedPairs:report.mailThenBeachConfirmedPairs,
    nativeJointSequenceConfirmed:report.nativeJointSequenceConfirmed,
    noUnsettledMailPrompts:report.nativeMailPromptSettlementsUnresolved===0,
    competitiveGamesQualified:0
  },null,2)+'\n');
  if(!report.nativeJointSequenceConfirmed||
     report.nativeMailPromptSettlementsUnresolved>0)process.exitCode=1;
}

module.exports={VERSION,TRIAL_IDS,runBranch,pairedMailBeachEvidence,run,save};
