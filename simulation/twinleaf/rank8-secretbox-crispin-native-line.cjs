'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const boardNames=()=>['Mega Absol ex','Mega Absol EX'];

/**
 * Check source-player own hand and public Active Spot at the actual post-search
 * decision point. Do not consult hidden deck order or opponent hidden cards.
 * @param {object} state Real current Store state
 * @param {object} owner Acting source player
 * @returns {boolean}
 */
function canAttemptCrispin(state,owner){
  const pending=state.prompts.some(prompt=>prompt.result===undefined);
  return state.turn===7 && state.activePlayer===0 && !pending &&
    owner?.id===101 && owner.supporterTurn===0 &&
    owner.hand.cards.some(card=>card.name==='Crispin') &&
    boardNames().includes(owner.active.getPokemonCard()?.name);
}

/**
 * Select two different printed Basic Energy names inside the actual
 * owner-deck Crispin search prompt. Native validator and reducer remain
 * authoritative. This is deliberately a fixed source-line experiment.
 * @param {object} prompt Genuine ChooseCardsPrompt
 * @param {object} owner Source owner
 * @returns {{cards:object[],eligible:boolean,hasDarkness:boolean,hasLightning:boolean,nativeValid:boolean}}
 */
function selectCrispinEnergies(prompt,owner){
  assert.equal(prompt.cards,owner.deck,'Crispin search must expose own deck');
  const dark=prompt.cards.cards.find(card=>card.name==='Darkness Energy');
  const lightning=prompt.cards.cards.find(card=>card.name==='Lightning Energy');
  const cards=dark&&lightning?[dark,lightning]:[];
  const nativeValid=cards.length===2 && prompt.validate(cards)===true;
  return {cards,eligible:nativeValid,hasDarkness:Boolean(dark),
    hasLightning:Boolean(lightning),nativeValid};
}

/**
 * Assign searched Darkness to own Active Mega Absol in the native
 * AttachEnergyPrompt, keeping the other Energy in hand under Crispin text.
 * @param {object} prompt Native AttachEnergyPrompt
 * @param {number} ownPlayerType Native PlayerType.BOTTOM_PLAYER
 * @param {number} activeSlot Native SlotType.ACTIVE
 * @returns {{assignments:object[],eligible:boolean}}
 */
function selectCrispinDarknessAttachment(prompt,ownPlayerType,activeSlot){
  const card=prompt.cardList.cards.find(c=>c.name==='Darkness Energy');
  const assignments=card?[{card,to:{player:ownPlayerType,
    slot:activeSlot,index:0}}]:[];
  return {assignments,eligible:assignments.length===1 &&
    prompt.validate(assignments)===true};
}

/**
 * Perform real owner-side Crispin play after the full legitimate four-category
 * Secret Box search and before the original quick-ball/boost-shake script.
 * Selections are never supplied without native prompts. The original bot
 * handles ShowCards, ShuffleDeck and any unclaimed prompts.
 * @template T
 * @param {()=>T} execute Synchronous already source-dealt runner
 * @returns {{result:T,policyAudit:object}}
 */
function withRank8NativeCrispinBeforeShake(execute){
  const load=name=>require(path.join(root,name));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const {GamePhase}=load('game/store/state/state');
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const physicalBoard={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  let stage=0,attempted=false,abort=null;
  let postCrispin=null,nextSourceTurn=null;
  const events=[];
  const snapshot=player=>({
    active:player.active.getPokemonCard()?.fullName??null,
    attached:player.active.energies.cards.map(card=>card.fullName),
    hand:player.hand.cards.map(card=>card.fullName),
    supporterTurn:player.supporterTurn,
    equippedGarbodor:player.bench.some(slot=>
      slot.getPokemonCard()?.name==='Garbodor'&&
      slot.tools.some(card=>card.name==='Float Stone'))
  });
  const issue=(state,reason,action)=>{
    events.push({stage,turn:state.turn,reason,action:action.constructor.name});
    stage++;
    return action;
  };
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const owner=state.players.find(p=>p.id===this.client?.id);
    if(owner?.id!==101)return previous.call(this,state);
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if(stage===3&&!pending&&!postCrispin){
      postCrispin=snapshot(owner);
      events.push({stage,turn:state.turn,kind:'after-native-attachment',
        attached:postCrispin.attached,hand:postCrispin.hand});
    }
    if(state.turn>=9 && state.activePlayer===0 && !pending &&
       !nextSourceTurn){
      nextSourceTurn={turn:state.turn,...snapshot(owner)};
    }
    if(abort||stage===3)return previous.call(this,state);
    if(stage===0 && state.phase===GamePhase.PLAYER_TURN &&
       canAttemptCrispin(state,owner)){
      const index=owner.hand.cards.findIndex(card=>card.name==='Crispin');
      const action=new PlayCardAction(owner.id,index,physicalBoard);
      if(this.isValidAction(state,action)){
        attempted=true;
        return issue(state,'play genuine source-held Crispin',action);
      }
      abort='owner-held Crispin failed native isValidAction';
      events.push({stage,kind:'abort',reason:abort});
      return previous.call(this,state);
    }
    if(!attempted)return previous.call(this,state);
    if(stage===1 && pending?.constructor.name==='ChooseCardsPrompt' &&
       pending.cards===owner.deck){
      const choice=selectCrispinEnergies(pending,owner);
      events.push({stage,turn:state.turn,kind:'native-energy-options',
        darknessAvailable:choice.hasDarkness,
        lightningAvailable:choice.hasLightning,nativeValid:choice.nativeValid});
      if(choice.eligible){
        return issue(state,'choose real Darkness + Lightning Basic Energy',
          new ResolvePromptAction(pending.id,choice.cards));
      }
      abort='Darkness and Lightning pair absent or native Crispin prompt rejects pair';
      events.push({stage,kind:'abort',reason:abort});
      return previous.call(this,state);
    }
    if(stage===2 && pending?.constructor.name==='AttachEnergyPrompt'){
      const choice=selectCrispinDarknessAttachment(
        pending,PlayerType.BOTTOM_PLAYER,SlotType.ACTIVE);
      events.push({stage,turn:state.turn,kind:'native-attach-options',
        nativeValid:choice.eligible});
      if(choice.eligible) {
        return issue(state,'attach source searched Darkness to Active Absol',
          new ResolvePromptAction(pending.id,choice.assignments));
      }
      abort='Native Crispin AttachEnergyPrompt rejected Active Darkness transfer';
      events.push({stage,kind:'abort',reason:abort});
      return previous.call(this,state);
    }
    return previous.call(this,state);
  };
  try{
    const result=execute();
    return {result,policyAudit:{
      schema:'rank8-native-crispin-before-boost-shake-v1',
      attempted,completed:stage===3,abort,stage,events,
      postCrispin,nextSourceTurn,
      nativePromptsWereUsed:stage===3,
      noHiddenSearchBeforeOwnerPrompt:true,
      competitiveQualified:false
    }};
  }finally{
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

/** Actual historic source-60 experiment with original and Crispin branches. */
function run(){
  const {runMatch,initializeCards}=require('./headless.cjs');
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {withRank8BoostShakeFork}=
    require('./rank8-boostshake-source-fork.cjs');
  const {withRank8OwnerSearchExpansion}=
    require('./rank8-secretbox-owner-category-audit.cjs');
  const {withStoreDispatchTranscript}=
    require('./store-dispatch-transcript.cjs');
  const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(row=>row.rank===8);
  assert.equal(opponent?.status,'ready');
  initializeCards();
  const request={deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:1260748957,maxActions:200,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true,captureDecisionTrace:true,
    capturePublicAttackTransitions:true,captureFinalPublicBoard:true};
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const trace=execute=>withStoreDispatchTranscript(Store,execute,{
    liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true});
  const control=trace(()=>runMatch(request));
  const expanded=trace(()=>withRank8BoostShakeFork(()=>
    withRank8OwnerSearchExpansion(()=>runMatch(request))));
  const crispin=trace(()=>withRank8BoostShakeFork(()=>
    withRank8OwnerSearchExpansion(()=>
      withRank8NativeCrispinBeforeShake(()=>runMatch(request)))));
  const base=expanded.result;
  const source=crispin.result;
  const step=source.result.result;
  const policy=step.policyAudit;
  assert.equal(base.stage,11);
  assert.equal(source.stage,11,
    'Crispin detour did not preserve original Boost Shake Garbodor setup');
  assert.deepEqual(control.actionTrace.slice(0,86),
    expanded.actionTrace.slice(0,86));
  assert.deepEqual(control.actionTrace.slice(0,86),
    crispin.actionTrace.slice(0,86));
  assert.equal(base.result.searchAudit.acceptedExtraCategories,2);
  assert.equal(source.result.searchAudit.acceptedExtraCategories,2);
  assert.deepEqual(base.result.searchAudit.selectedPrintings,
    source.result.searchAudit.selectedPrintings);
  assert.ok(source.turn8.board[0].bench.some(slot=>
    slot.name==='Garbodor' && slot.tools.includes('Float Stone')));
  const restored=trace(()=>runMatch(request));
  assert.deepEqual(restored.actionTrace,control.actionTrace,
    'Crispin wrapper contaminated after-run baseline');
  const simplified=board=>board?.map(player=>({
    active:player.active?{
      name:player.active.name,damage:player.active.damage,
      energyCards:player.active.energyCards,
      toolCards:player.active.toolCards
    }:null,
    bench:player.bench.map(card=>card.name)
  }))??null;
  const realSourceClawTransitions=(step.result.publicAttackTransitions??[])
    .filter(event=>event.triggerPlayerSlot===0 &&
      event.declarations?.some(row=>row.attackName==='Claw of Darkness'))
    .map(event=>({
      turn:event.turnBefore,rootOrdinal:event.actionOrdinal,
      declaration:event.declarations,
      prizesBefore:event.beforePrizesRemaining,
      boardBefore:simplified(event.before),
      boardAfter:simplified(event.settled?.after),
      settledRootOrdinal:event.settled?.completionRootActionOrdinal??null,
      prizesAfter:event.settled?.prizesRemaining??null,
      sourcePrizesTaken:event.settled?.prizesRemaining?
        event.beforePrizesRemaining[0]-event.settled.prizesRemaining[0]:null
    }));
  assert.equal(step.result.publicAttackTransitionsProtocol,
    'actual-store-public-attack-transitions-v1');
  return {
    schema:'rank8-four-category-secretbox-native-crispin-line-v2',
    sourceSeed:1260748957,originalSourceRootPrefix:86,
    originalSource60:true,originalHood60:true,
    crispenSourceActuallyFirst:control.result.firstTurnSlot===0,
    fourCategoryNativeSearch:source.result.searchAudit,
    crispinPolicy:policy,
    originalGarbodorStillEquipped:true,
    realSourceClawTransitions,
    originalPrefixPreserved:true,hookRestorationReplayed:true,
    noCrispinNextSourceHand:base.turn8.board[0].hand,
    attemptedCrispinNextSourceHand:source.turn8.board[0].hand,
    baselineGame:{actions:base.result.result.actions,finished:base.result.result.finished,
      prizes:base.result.result.prizesRemaining},
    crispinGame:{actions:step.result.actions,finished:step.result.finished,
      prizes:step.result.prizesRemaining,
      sourceNextAttacks:(step.result.decisionTrace??[])
        .filter(row=>row.playerSlot===0&&row.turnBefore>=9&&
          row.action==='AttackAction').slice(0,6).map(row=>({
            turn:row.turnBefore,attack:row.attack??null,
            active:row.publicBoardBefore?.actor?.active?.name??null
          }))},
    qualifiedCompetitiveGames:0,
    note:'One retro-selected source physical deal and two correlated capped generic-policy continuations; real prompt legality only.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={canAttemptCrispin,selectCrispinEnergies,
  selectCrispinDarknessAttachment,withRank8NativeCrispinBeforeShake,run};
