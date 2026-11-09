'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('../actor-observation-contract.cjs');
const {chooseOwnerCursedBlastPrizeConversion:choose} =
  require('./owner-cursed-blast-prize-policy.cjs');
const {ACE,chooseOwnerCursedBlastAceTrainerOpportunity:chooseAce} =
  require('./owner-cursed-blast-ace-option.cjs');

const VERSION = 'agent15-two-seat-real-store-cursed-blast-after-pass-v1';
const OUTPUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const RULES = Object.freeze({
  'Shadow Rider Calyrex V CRE':2,
  'Shadow Rider Calyrex VMAX CRE':3,
  'Oranguru V ASR':2,
  'Regidrago V SIT':2,
  'Regidrago VSTAR SIT':2,
  'Mew V FST':2,
  'Mew VMAX FST':3,
  'Mega Absol ex MEG':3
});

/**
 * Owner-only opt-in at the actual in-process native bot boundary. Each
 * acting owner gets an identical opportunity to replace the next otherwise
 * PassTurnAction with a Prize-positive printed Cursed Blast. The exact
 * selected target is answered only when that owner actually receives the
 * native target ChoosePokemonPrompt.
 *
 * Store acceptance is recorded as a development observation, without a
 * game-win or paper-legal certificate. Unknown target Prize values are
 * intentionally excluded. This hook must remain off in baseline policies.
 *
 * @template T
 * @param {()=>T} execute Synchronous runner using headless.runMatch.
 * @param {object} [deps] Native or synthetic test adapters.
 * @returns {{result:T,audit:object}}
 */
function withOwnerCursedBlastAfterPass(execute,deps={}){
  assert.equal(typeof execute,'function');
  const headless=deps.headless??require('../headless.cjs');
  const native=deps.native??(name=>require(path.join(OUTPUT,name)));
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {Store}=native('game/store/store');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const originalRun=headless.runMatch;
  assert.equal(typeof originalRun,'function');
  const awards=deps.awards??RULES;
  const allowAceEnable=deps.allowAceEnable===true;
  const observeOwner=deps.observeOwner??actorObservation;
  assert.equal(typeof observeOwner,'function');
  const audit={version:VERSION,twoSeatOwnerOnly:true,enabled:true,
    games:0,ownerPassObservations:0,actionProposals:0,
    acceptedAbilityRoots:0,acceptedTargetReplies:0,
    aceEnableOptIn:allowAceEnable,acceptedAceSupporters:0,
    nativeErrors:[],acceptedRootReceipts:[],
    qualifiedCompetitiveGames:0};
  function wrappedRun(request){
    assert.ok(Array.isArray(request?.deckA)&&request.deckA.length===60);
    assert.ok(Array.isArray(request?.deckB)&&request.deckB.length===60);
    const bot=SimpleTacticsAi.prototype,st=Store.prototype;
    const priorBot=Object.getOwnPropertyDescriptor(bot,'decodeNextAction');
    const priorDispatch=Object.getOwnPropertyDescriptor(st,'dispatch');
    assert.equal(typeof priorBot?.value,'function');
    assert.equal(typeof priorDispatch?.value,'function');
    const proposed=new WeakMap();
    const steps=new Map();
    let live=null;
    audit.games++;

    function decode(state){
      if(state!==live?.state)return priorBot.value.call(this,state);
      const seat=state.players.findIndex(player=>player.id===this.client?.id);
      if(seat!==0&&seat!==1)return priorBot.value.call(this,state);
      const owner=state.players[seat];
      const step=steps.get(owner.id);
      const pending=state.prompts?.find(p=>p.result===undefined);
      if(pending){
        if(step?.stage==='target'&&step.turn===state.turn&&
          pending.playerId===owner.id&&
          pending.constructor.name==='ChoosePokemonPrompt'){
          const targetPlayer=state.players[1-seat];
          const slot=step.targetSlot==='ACTIVE'?targetPlayer.active:
            targetPlayer.bench[step.targetIndex];
          // Public active/bench card identity, no opponent hidden cards.
          if(slot?.getPokemonCard()?.fullName===step.targetPrinting&&
             pending.validate([slot],state)===true){
            const action=new ResolvePromptAction(pending.id,[slot]);
            proposed.set(action,{kind:'native-target',seat,ownerId:owner.id,
              turn:state.turn,plan:step,promptId:pending.id});
            return action;
          }
          steps.delete(owner.id);
        }
        return priorBot.value.call(this,state);
      }
      if(state.activePlayer!==seat)return priorBot.value.call(this,state);
      if(step?.stage==='play-ace'&&step.turn===state.turn){
        const view=observeOwner(state,seat);
        const index=owner.hand?.cards?.findIndex(c=>c.fullName===ACE)??-1;
        if(index>=0&&view.ownPublic.prizeCount>
            view.opponentPublic.prizeCount&&
           view.ownTurnResources?.supporterPlayedTurn===0&&
           view.ownTurnResources?.supporterPlayLocked!==true&&
           owner.hand.cards[index].canPlay?.(live,state,owner)===true){
          const action=new PlayCardAction(owner.id,index,{
            player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BOARD,index:0
          });
          proposed.set(action,{kind:'native-ace',seat,ownerId:owner.id,
            turn:state.turn,plan:step});
          return action;
        }
        steps.delete(owner.id);
      }
      // The upstream bot can do valuable work. Its choice remains priority.
      const ordinary=priorBot.value.call(this,state);
      if(ordinary?.constructor?.name!=='PassTurnAction')return ordinary;
      audit.ownerPassObservations++;
      if(step?.turn===state.turn)return ordinary;
      const view=observeOwner(state,seat);
      const plan=choose(view,awards)??
        (allowAceEnable?chooseAce(view):null);
      if(!plan)return ordinary;
      const ability=new UseAbilityAction(owner.id,plan.abilityName,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:plan.sourceBenchIndex
      });
      proposed.set(ability,{kind:'native-ability',seat,ownerId:owner.id,
        turn:state.turn,plan});
      audit.actionProposals++;
      return ability;
    }
    function dispatch(action,...args){
      if(action?.constructor?.name==='AddPlayerAction'&&!live)live=this;
      const selected=this===live?proposed.get(action):null;
      if(!selected)return priorDispatch.value.call(this,action,...args);
      let value;
      try{value=priorDispatch.value.call(this,action,...args);}
      catch(error){
        if(audit.nativeErrors.length<25)audit.nativeErrors.push({
          kind:selected.kind,seat:selected.seat,turn:selected.turn,
          error:String(error?.message??error)});
        steps.delete(selected.ownerId);
        throw error;
      }
      const receipt={trialLabel:request.label??null,
        kind:selected.kind,seat:selected.seat,
        turn:selected.turn,source:selected.plan.sourcePrinting,
        sourceBenchIndex:selected.plan.sourceBenchIndex,
        target:selected.plan.targetPrinting,
        targetSlot:selected.plan.targetSlot,
        targetIndex:selected.plan.targetIndex,
        prizeAward:selected.plan.printedTargetPrizeAward};
      if(selected.kind==='native-ability'){
        audit.acceptedAbilityRoots++;
        steps.set(selected.ownerId,{...selected.plan,stage:'target',
          turn:selected.turn});
      }else if(selected.kind==='native-target'){
        audit.acceptedTargetReplies++;
        if(selected.plan.mode==='ace-enable')
          steps.set(selected.ownerId,{...selected.plan,stage:'play-ace',
            turn:selected.turn});
        else steps.delete(selected.ownerId);
      }else if(selected.kind==='native-ace'){
        audit.acceptedAceSupporters++;
        steps.delete(selected.ownerId);
      }
      if(audit.acceptedRootReceipts.length<100)
        audit.acceptedRootReceipts.push(receipt);
      return value;
    }
    Object.defineProperty(bot,'decodeNextAction',{
      ...priorBot,value:decode
    });
    Object.defineProperty(st,'dispatch',{
      ...priorDispatch,value:dispatch
    });
    try{return originalRun(request);}
    finally{
      assert.strictEqual(bot.decodeNextAction,decode);
      assert.strictEqual(st.dispatch,dispatch);
      Object.defineProperty(st,'dispatch',priorDispatch);
      Object.defineProperty(bot,'decodeNextAction',priorBot);
    }
  }
  headless.runMatch=wrappedRun;
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.agent15CursedBlastNativeAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(headless.runMatch,wrappedRun);
    headless.runMatch=originalRun;
  }
}

module.exports={VERSION,RULES,withOwnerCursedBlastAfterPass};
