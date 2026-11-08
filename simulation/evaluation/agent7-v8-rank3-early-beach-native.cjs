'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {run:runV8Canary,SEED,ENGINE_PIN}=
  require('./agent2-v8-common-first-owner-root-canary.cjs');
const {publicPlayer}=require('../twinleaf/actor-observation-contract.cjs');

const VERSION='agent7-rank3-first-cycle-beach-real-store-control-treatment-v1';
const ROOT=path.resolve(__dirname,'../..');
const FLAG='AGENT7_EARLY_BEACH_DEV';

/** Owner-visible, public hand/deck/Stadium movement at an accepted native root. */
function movement(state,seat){
  const player=state?.players?.[seat];
  if(!player)return null;
  const view=publicPlayer(player);
  return {
    handCount:view.handCount,deckCount:view.deckCount,
    stadium:view.stadium,prizeCount:view.prizeCount,
    activePrinting:view.active?.printing??null
  };
}

/**
 * Reversible Store hook used for only these exact native canary executions.
 * A card is characterized only from its acting owner's actual held printing.
 * No opposing hand, unknown deck contents or face-down Prize identities read.
 */
function traceBeachNativeRun(run){
  const base=path.resolve(ROOT,'vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(base,'game/store/store'));
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  const events=[];
  function dispatch(action,...args){
    const before=this.state;
    const name=action?.constructor?.name??null;
    const seat=before?.players?.findIndex(p=>p.id===action?.id)??-1;
    const isOwner=seat===0||seat===1;
    const handPrinting=isOwner&&name==='PlayCardAction'?
      before.players[seat].hand.cards[action.handIndex]?.fullName??null:null;
    const playBeach=name==='PlayCardAction'&&
      handPrinting?.startsWith('Tropical Beach ')===true;
    const beachUp=isOwner&&name==='UseStadiumAction'&&
      [...(movement(before,seat)?.stadium??[])].some(card=>
        card.startsWith('Tropical Beach '));
    const target=isOwner&&(playBeach||beachUp)&&
      Number.isSafeInteger(before.turn)&&before.turn<=2;
    const observed=target?{
      action:name,seat,globalTurnBefore:before.turn,
      heldPrinting:playBeach?handPrinting:null,
      ownerBefore:movement(before,seat)
    }:null;
    let result;
    try{result=prior.value.call(this,action,...args);}
    catch(error){
      if(observed)events.push({...observed,nativeStoreAccepted:false,
        nativeError:String(error?.message??error)});
      throw error;
    }
    if(observed){
      const after=movement(this.state,seat);
      events.push({...observed,nativeStoreAccepted:true,
        ownerAfter:after,
        nativeGlobalTurnAfter:this.state?.turn??null,
        pendingPromptCount:(this.state?.prompts??[])
          .filter(p=>p.result===undefined).length});
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:dispatch});
  try{return {output:run(),events};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}

/**
 * The original deterministic native canary is the control. Experimental
 * action selection is enabled only within the second invocation.
 * @returns {object} Development evidence, no field-win-rate inference.
 */
function runTreatment(){
  const inherited=process.env[FLAG];
  try{
    delete process.env[FLAG];
    const control=traceBeachNativeRun(runV8Canary);
    process.env[FLAG]='true';
    const treatment=traceBeachNativeRun(runV8Canary);
    const ids=control.output.rows.map(row=>row.trialId);
    assert.deepEqual(treatment.output.rows.map(row=>row.trialId),ids);
    const treatedBeach=treatment.events.filter(e=>e.nativeStoreAccepted);
    const settledSequence=treatedBeach.flatMap(play=>{
      if(play.action!=='PlayCardAction'||!play.ownerAfter?.stadium?.some(
        card=>card.startsWith('Tropical Beach ')))return [];
      const use=treatedBeach.find(e=>e.action==='UseStadiumAction'&&
        e.seat===play.seat&&e.globalTurnBefore===play.globalTurnBefore&&
        e.ownerBefore?.handCount===play.ownerAfter.handCount&&
        e.ownerAfter?.handCount===7&&
        e.ownerBefore?.deckCount-e.ownerAfter?.deckCount>0);
      return use?[{
        sourceSeat:play.seat,globalTurn:play.globalTurnBefore,
        printedStadium:play.heldPrinting,
        handBeforePlace:play.ownerBefore.handCount,
        handAfterPlace:play.ownerAfter.handCount,
        handAfterUse:use.ownerAfter.handCount,
        deckBeforeUse:use.ownerBefore.deckCount,
        deckAfterUse:use.ownerAfter.deckCount,
        nativePlayAccepted:true,nativeUseAccepted:true,
        sourceGameTurnAfterUse:use.nativeGlobalTurnAfter
      }]:[];
    });
    return {
      schema:VERSION,enginePin:ENGINE_PIN,seed:SEED,
      originalTrialIds:ids,originalFixedSixtiesUnchanged:true,
      nativeActionCap:128,commonPolicyRunner:'runDevelopment',
      treatmentFlag:FLAG,baselineRootFlagOff:true,
      changedPolicyOnlyAfterExistingOwnerRootWouldPass:true,
      nativeStoreBeachEvents:treatedBeach,
      nativeStoreBeachRejected:treatment.events.filter(e=>!e.nativeStoreAccepted),
      baselineNativeBeachEvents:control.events,
      controlRows:control.output.rows.map(row=>({
        id:row.trialId,status:row.status,
        firstOwnerPass:row.firstRootProvenance,
        firstOwnerRootPrinting:row.firstUnsupportedOwnerRoot?.ownerView?.
          ownHand?.includes('Tropical Beach BWP')===true,
        nativeInitialRoots:row.nativeAbortEvidence?.initialAcceptedRootPrefix??[]
      })),
      treatmentRows:treatment.output.rows.map(row=>({
        id:row.trialId,status:row.status,
        firstOwnerPassAfterTreatment:row.firstRootProvenance,
        nativeInitialRoots:row.nativeAbortEvidence?.initialAcceptedRootPrefix??[],
        nativeAbort:row.selectedV0?.thrownCode??null,
        selectedV8RunDevelopmentRegistrationValid:
          row.activeRunDevelopmentRegistrationValid===true
      })),
      earlyBeachNativeAcceptanceObserved:treatedBeach.length>0,
      firstCyclePlayUseAndDrawSettled: settledSequence.length>0,
      settledSequences:settledSequence,
      fullyQualifiedPaperGames:0,competitiveGamesQualified:0,
      winRateReported:false
    };
  }finally{
    if(inherited===undefined)delete process.env[FLAG];
    else process.env[FLAG]=inherited;
  }
}

/** Atomic archive protected against concurrent native-workflow writers. */
function writeReport(report){
  const dir=path.join(ROOT,'artifacts/agent7-v8-rank3-early-beach');
  fs.mkdirSync(dir,{recursive:true});
  const target=path.join(dir,'paired-native.json');
  const lock=target+'.lock';
  const fd=fs.openSync(lock,'wx');
  const temp=target+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,target);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return target;
}

if(require.main===module){
  const report=runTreatment();
  const file=writeReport(report);
  process.stdout.write(JSON.stringify({
    schema:report.schema,file,
    originalTrialIds:report.originalTrialIds,
    baselineEarlyOwnerPasses:report.controlRows.map(row=>({
      id:row.id,hasHeldBeach:row.firstOwnerRootPrinting
    })),
    nativeBeachEvents:report.nativeStoreBeachEvents,
    settledSequences:report.settledSequences,
    firstCyclePlayUseAndDrawSettled:report.firstCyclePlayUseAndDrawSettled,
    treatmentStatuses:report.treatmentRows.map(row=>({
      id:row.id,status:row.status,
      initialRoots:row.nativeInitialRoots
    })),
    competitiveGamesQualified:0
  },null,2)+'\n');
  if(!report.firstCyclePlayUseAndDrawSettled)process.exitCode=1;
}

module.exports={VERSION,movement,traceBeachNativeRun,runTreatment,writeReport};
