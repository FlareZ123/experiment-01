'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const registration=require('../../../results/aichi-2026/registrations/agent3-prospective-all29-celestial-paper-v2-20261109.json');
const {runArm}=require('./portable-champion-all29-20261109.cjs');
const {installUnderworldDoorPsychicRecipientHook}=
  require('../../twinleaf/underworld-door-psychic-recipient-hook.cjs');
const {installRegidragoCelestialRoarPaperCustodyHook}=
  require('../../twinleaf/regidrago-celestial-roar-paper-custody-hook.cjs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-rank7-original-guzma-prompt-custody-diagnostic-v1';
const TARGET='7:6213:B:champion-reference';
const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');

/**
 * Inspect only prompt-item existence, sources, and metadata after native
 * actions. Never expose hidden card names, hand, deck, Prize contents, or
 * Store objects to an acting decision policy.
 */
function installPromptCustodyObserver(Store){
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const originalCalculate=Object.getOwnPropertyDescriptor(
    Store.prototype,'calculatePlayability');
  assert.equal(typeof originalDispatch?.value,'function');
  assert.equal(typeof originalCalculate?.value,'function');
  const records=[];
  const summary={calculateCalls:0,createdDuringCalculate:0,
    orphanAfterCalculate:0,promptDispatches:0,orphanBeforeDispatch:0,
    orphanAfterDispatch:0};
  const bounded=record=>{
    if(records.length<160)records.push(record);
  };
  function pendingView(state,prompt){
    const seat=state.players.findIndex(p=>p.id===prompt.playerId);
    return {id:prompt.id,type:prompt.constructor?.name??null,seat,
      message:String(prompt.message??''),source:prompt.sourceCard?.name??null,
      perspectiveOwner:state.players.findIndex(p=>
        p.id===prompt.getPerspectivePlayerId?.()),
      registered:this.promptItems?.some(x=>x.ids.includes(prompt.id))??false};
  }
  function calculate(state,...args){
    const before=new Set(state.prompts.map(p=>p.id));
    summary.calculateCalls++;
    const result=originalCalculate.value.apply(this,[state,...args]);
    const added=state.prompts.filter(p=>!before.has(p.id));
    if(added.length){
      summary.createdDuringCalculate+=added.length;
      const orphans=added.filter(p=>
        !this.promptItems.some(x=>x.ids.includes(p.id)));
      summary.orphanAfterCalculate+=orphans.length;
      bounded({step:'calculate-added-prompts',turn:state.turn,
        created:added.length,orphan:orphans.length,
        prompts:added.map(p=>pendingView.call(this,state,p))});
    }
    return result;
  }
  function dispatch(action,...args){
    const promptAction=action?.constructor?.name==='ResolvePromptAction';
    const state=this.state;
    let capture=null;
    if(promptAction){
      summary.promptDispatches++;
      const physical=state.prompts.find(p=>p.id===action.id);
      const item=this.promptItems?.find(x=>x.ids.includes(action.id));
      capture={step:'before-prompt-dispatch',turn:state.turn,
        actionId:action.id,hasMatchingPrompt:!!physical,
        hasRegisteredPromptItem:!!item,actionResultType:
          action.result===null?'null':Array.isArray(action.result)?
          'array':'other',pending:state.prompts
            .filter(p=>p.result===undefined)
            .map(p=>pendingView.call(this,state,p)),
        promptItemsCount:this.promptItems?.length??null};
      if(!item)summary.orphanBeforeDispatch++;
    }
    let outcome,error;
    try{outcome=originalDispatch.value.apply(this,[action,...args]);}
    catch(e){error=e;}
    if(capture&&(capture.turn>=18||!capture.hasRegisteredPromptItem||error)){
      const physical=this.state.prompts.find(p=>p.id===action.id);
      const nowItem=this.promptItems?.find(x=>x.ids.includes(action.id));
      if(physical?.result===undefined)summary.orphanAfterDispatch++;
      bounded({...capture,step:'prompt-dispatch-after',
        resultPersisted:physical?.result!==undefined,
        registrationStillPresent:!!nowItem,
        thrown:error?String(error.message):null});
    }
    if(error)throw error;
    return outcome;
  }
  Object.defineProperty(Store.prototype,'calculatePlayability',
    {...originalCalculate,value:calculate});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:dispatch});
  return {
    summary,records,
    restore(){
      assert.strictEqual(Store.prototype.calculatePlayability,calculate);
      assert.strictEqual(Store.prototype.dispatch,dispatch);
      Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
      Object.defineProperty(Store.prototype,'calculatePlayability',
        originalCalculate);
    }
  };
}

/** Replay the preexisting offending source deal, without changing either bot. */
function run(){
  const group=registration.groups.find(x=>x.id===TARGET);
  const companion=registration.groups.find(x=>
    x.rank===7 && x.candidateSlot==='A');
  assert.ok(group&&companion);
  // The common bilateral runner requires at least two source groups.
  // Replay the originally failed B deal first, then its already-seen A pair.
  const groups=[group,companion];
  const {Store}=require(path.join(OUTPUT,'game/store/store'));
  const observer=installPromptCustodyObserver(Store);
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  const restoreDoor=installUnderworldDoorPsychicRecipientHook();
  let restoreRoar=null,control;
  try{
    restoreRoar=installRegidragoCelestialRoarPaperCustodyHook();
    control=runArm(false,groups);
  }finally{
    if(restoreRoar)restoreRoar();
    restoreDoor();
    observer.restore();
    if(prior===undefined)delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
  }
  const row=control.rows[0];
  return {schema:VERSION,originalNativeRun:42556056635,
    registeredHistoricalDeal:group,
    nativeEngine:registration.pinnedTwinleafCommit,
    originalStatus:row.error?String(row.error).split('\n')[0]:
      row.finished?'native-terminal':'censored',
    failedRoot:row.nativeAbortEvidence?.actionOrdinal??null,
    summary:observer.summary,records:observer.records,
    paperQualifiedGames:0};
}

if(require.main===module){
  const result=run();
  if(process.env.AGENT3_RANK7_PROMPT_DIAGNOSTIC_OUTPUT)
    save(process.env.AGENT3_RANK7_PROMPT_DIAGNOSTIC_OUTPUT,result);
  process.stdout.write('AGENT3_RANK7_GUZMA_ORPHAN_PROMPT '+JSON.stringify(result)+'\n');
}
module.exports={VERSION,installPromptCustodyObserver,run};
