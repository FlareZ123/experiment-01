'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=
  require('../twinleaf/headless.cjs');
const {originals}=
  require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');

const VERSION='agent1-rank3-owner-deck-prompt-cause-audit-v1';
const SOURCE_SEAT=0;
const OWNER_SEAT=1;
const SEED=290134;
const ACTION_LIMIT=260;
const EXPECTED_FULL_DEAL=
  'e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const EXPECTED_SOURCE_DEAL=
  'ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

function safePromptSummary(prompt,players){
  const playerId=prompt?.player?.id??prompt?.playerId??
    prompt?.ownerId??null;
  const found=players.findIndex(player=>player.id===playerId);
  const safeFields={};
  for(const key of ['type','promptType','title']){
    const value=prompt?.[key];
    if(typeof value==='string'||typeof value==='number'||
       typeof value==='boolean')
      safeFields[key]=value;
  }
  return {
    className:prompt?.constructor?.name??null,
    ownerSeat:found>=0?found:null,
    safeFields
  };
}

function summarizeAction(action,seat,state){
  const owner=state.players[seat];
  const handCards=owner?.hand?.cards??[];
  let ownerHandCardName=null;
  for(const key of ['card','item','supporter','stadium','pokemon']){
    const candidate=action?.[key];
    if(candidate&&handCards.includes(candidate)){
      ownerHandCardName=candidate.fullName??candidate.name??null;
      break;
    }
  }
  return {
    actionClass:action?.constructor?.name??null,
    actionName:typeof action?.name==='string'?action.name:null,
    ownerHandCardName,
    keys:action&&typeof action==='object'?Object.keys(action).sort():[]
  };
}

/**
 * Observe only public deck counts and the acting owner's own hand reference.
 * The optional Store dependency makes the wrapper independently testable.
 *
 * @template T
 * @param {()=>T} execute Synchronous Store workload.
 * @param {{Store?:Function}} [deps]
 * @returns {{result:T,events:object[],dispatchCount:number}}
 */
function withReadOnlyDeckDispatchAudit(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const original=Store.prototype.dispatch;
  assert.equal(typeof original,'function');
  const events=[];
  const lastNonPromptBySeat=[null,null];
  let dispatchCount=0;
  const patched=function observeOwnerDeckCause(action,...args){
    const state=this.state;
    if(!Array.isArray(state?.players)||state.players.length!==2)
      return original.call(this,action,...args);

    const activeSeat=state.activePlayer;
    const turnBefore=state.turn;
    const deckBefore=state.players.map(player=>player.deck.cards.length);
    const actionSummary=summarizeAction(action,activeSeat,state);
    const pendingPromptsBefore=(Array.isArray(state.prompts)?
      state.prompts.filter(prompt=>prompt&&prompt.result===undefined):[])
      .map(prompt=>safePromptSummary(prompt,state.players));
    const previousOwnerAction=
      activeSeat===0||activeSeat===1?
        lastNonPromptBySeat[activeSeat]:null;

    const result=original.call(this,action,...args);
    const deckAfter=this.state.players.map(player=>player.deck.cards.length);
    const deckDelta=deckAfter.map((count,seat)=>count-deckBefore[seat]);
    if(deckDelta.some(delta=>delta!==0)){
      events.push({
        actionOrdinal:dispatchCount,
        turnBefore,
        activeSeat,
        action:actionSummary,
        previousOwnerAction,
        pendingPromptsBefore,
        deckBefore,
        deckAfter,
        deckDelta
      });
    }

    const className=actionSummary.actionClass??'';
    if(!className.toLowerCase().includes('prompt')&&
       (activeSeat===0||activeSeat===1)){
      lastNonPromptBySeat[activeSeat]={
        actionOrdinal:dispatchCount,
        turnBefore,
        seat:activeSeat,
        ...actionSummary
      };
    }
    dispatchCount++;
    return result;
  };

  Store.prototype.dispatch=patched;
  try{
    return {result:execute(),events,dispatchCount};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,patched);
    Store.prototype.dispatch=original;
  }
}

function writeReceipt(receipt){
  const directory=process.env.AGENT1_RANK3_OWNER_DECK_CAUSE_DIR;
  if(!directory)return null;
  const fs=require('node:fs');
  fs.mkdirSync(directory,{recursive:true});
  const target=path.join(directory,
    'agent1-rank3-owner-deck-cause-audit.json');
  const temporary=target+'.tmp-'+process.pid;
  const fd=fs.openSync(temporary,'wx');
  try{
    fs.writeFileSync(fd,JSON.stringify(receipt,null,2)+'\n');
    fs.fsyncSync(fd);
  }finally{
    fs.closeSync(fd);
  }
  fs.renameSync(temporary,target);
  return target;
}

/**
 * Reproduce the frozen rank-3/rank-1 native deal with a read-only observer.
 * @returns {object} Frozen-control and owner-visible prompt evidence.
 */
function run(){
  initializeCards();
  const cards=originals();
  const request={
    deckA:cards.source,
    deckB:cards.candidate,
    seed:SEED,
    maxActions:ACTION_LIMIT,
    label:'agent1-rank3-owner-deck-prompt-cause-audit',
    strictPromptValidation:true,
    mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialFullPhysicalDeal:true,
    captureInitialSourceDealFingerprintSeat:SOURCE_SEAT,
    captureDecisionTrace:true,
    captureNativeAbortEvidence:true,
    capturePublicAttackTransitions:true,
    captureFinalPublicBoard:true
  };
  const envNames=[
    'AGENT8_ACTOR_QUICK_BALL_DEV',
    'AGENT41_OWNER_TERMINAL_ARBITRATION_DEV'
  ];
  const previousEnv=new Map(envNames.map(name=>[name,process.env[name]]));
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>
        withReadOnlyDeckDispatchAudit(()=>
          withSameTargetAttachEnergySelection(()=>
            runMatch(request)).result
        ),{
          root:work=>withActorOnlyRootPolicy(work,{
            publicContextSpecialEnergy:true,
            specialEnergyRoot:true
          })
        },{
          ownerSingleSearch:true,
          genericFallbackAttribution:true
        })
    );
    const observed=guarded.result.result;
    const game=observed.result;
    const events=observed.events;
    const fullDeal=
      game.initialFullPhysicalDealFingerprint?.digestSha256??null;
    const sourceDeal=
      game.initialSourceDealFingerprint?.digestSha256??null;
    const burrowEvents=events.filter(event=>
      event.activeSeat===SOURCE_SEAT&&
      event.action.actionClass==='AttackAction'&&
      event.action.actionName==='Burrow');
    const filchEvents=events.filter(event=>
      event.activeSeat===OWNER_SEAT&&
      event.action.actionClass==='AttackAction'&&
      event.action.actionName==='Filch');
    const turn15Extra=events.find(event=>
      event.turnBefore===15&&event.activeSeat===OWNER_SEAT&&
      event.action.actionClass==='ResolvePromptAction'&&
      event.deckBefore[OWNER_SEAT]===20&&
      event.deckAfter[OWNER_SEAT]===19);
    const controls={
      exactFullPhysicalDeal:fullDeal===EXPECTED_FULL_DEAL,
      exactSourcePhysicalDeal:sourceDeal===EXPECTED_SOURCE_DEAL,
      nativeFinished:game.finished===true,
      originalSourceWon:game.winner===SOURCE_SEAT,
      originalActionCount:game.actions===133,
      twelveBurrowAttackDispatches:burrowEvents.length===12,
      everyBurrowMillsExactlyOne:burrowEvents.every(event=>
        event.deckDelta[OWNER_SEAT]===-1),
      elevenFilchAttackDispatches:filchEvents.length===11,
      everyFilchDrawsExactlyTwo:filchEvents.every(event=>
        event.deckDelta[OWNER_SEAT]===-2),
      turn15ExtraOwnerLossFound:turn15Extra!==undefined
    };
    const receipt={
      schema:VERSION,
      seed:SEED,
      sourceRank:3,
      ownerRank:1,
      sourceSeat:SOURCE_SEAT,
      ownerSeat:OWNER_SEAT,
      actionLimit:ACTION_LIMIT,
      nativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      sourceOriginal60Sha256:digest(cards.source),
      ownerOriginal60Sha256:digest(cards.candidate),
      fullPhysicalDealFingerprint:fullDeal,
      sourcePhysicalDealFingerprint:sourceDeal,
      nativeFinished:game.finished,
      winner:game.winner,
      actions:game.actions,
      turns:game.turns,
      rootLedgerSha256:digest(game.rootActionLedger??[]),
      burrowAttackCount:burrowEvents.length,
      filchAttackCount:filchEvents.length,
      burrowAttackEvents:burrowEvents,
      filchAttackEvents:filchEvents,
      deckChangingEventsAroundTurn15:events.filter(event=>
        event.turnBefore>=14&&event.turnBefore<=15),
      turn15ExtraOwnerDeckLoss:turn15Extra??null,
      terminalTransition:game.terminalTransition??null,
      finalPublicBoard:game.finalPublicBoard??null,
      controls,
      controlsPass:Object.values(controls).every(Boolean),
      competitiveGamesQualified:0,
      ownerInformationBoundary:'An action card name is emitted only when its exact object is present in the acting owner hand. No deck identities, Prize identities, or other-player concealed hand contents are emitted.',
      interpretation:'One retrospective read-only replay. A prompt/action attribution is not a competitive matchup result.'
    };
    receipt.artifactPath=writeReceipt(receipt);
    return receipt;
  }finally{
    for(const [name,value] of previousEnv){
      if(value===undefined)delete process.env[name];
      else process.env[name]=value;
    }
  }
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.controlsPass)process.exitCode=1;
}
module.exports={
  VERSION,
  safePromptSummary,
  summarizeAction,
  withReadOnlyDeckDispatchAudit,
  run
};
