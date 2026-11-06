'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseOwnerVsSeekerGuzmaRoot}=require('./agent48-owner-vs-seeker-guzma-root.cjs');
const {selectOwnerVsSeekerSupporterPrompt}=require('./agent48-owner-vs-seeker-supporter.cjs');

const VERSION='agent48-owner-vs-seeker-guzma-layer-v1';

/**
 * @param {()=>any} run Synchronous match runner.
 * @param {object} [deps] Twinleaf classes and injectable helpers.
 * @returns {{result:any,audit:object}}
 */
function withOwnerVsSeekerGuzmaLayer(run,deps={}){
  assert.equal(typeof run,'function');
  const base=deps.base??path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Bot=deps.SimpleTacticsAi??require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const cardActions=deps.cardActions??deps.actionTypes??
    require(path.join(base,'game/store/actions/play-card-action'));
  const PlayCardAction=deps.PlayCardAction??cardActions.PlayCardAction;
  const PlayerType=deps.PlayerType??cardActions.PlayerType;
  const SlotType=deps.SlotType??cardActions.SlotType;
  const ResolvePromptAction=deps.ResolvePromptAction??require(path.join(base,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const observe=deps.actorObservation??actorObservation;
  const chooseRoot=deps.chooseOwnerVsSeekerGuzmaRoot??chooseOwnerVsSeekerGuzmaRoot;
  const selectPrompt=deps.selectOwnerVsSeekerSupporterPrompt??selectOwnerVsSeekerSupporterPrompt;
  const oldBot=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.ok(oldBot&&typeof oldBot.value==='function');
  assert.ok(oldDispatch&&typeof oldDispatch.value==='function');
  let nativeStore=null;
  const pending=new Map(),roots=new WeakMap(),replies=new WeakMap();
  const audit={version:VERSION,actualGamesSeen:0,rootsProposed:0,
    rootsAccepted:0,rootsRejected:0,promptsProposed:0,promptsAccepted:0,
    receipts:[]};
  function decode(state,...rest){
    const playerId=this?.client?.id;
    const seat=state?.players?.findIndex(p=>p.id===playerId)??-1;
    if(nativeStore&&state===nativeStore.state&&seat!==-1){
      const prompt=state.prompts?.find(p=>p.result===undefined)??null;
      const token=pending.get(playerId);
      if(token){
        assert.ok(prompt&&prompt.id===token.promptId);
        const selection=selectPrompt(state,seat,prompt,ResolvePromptAction,token.target);
        assert.strictEqual(selection.card,token.card);
        replies.set(selection.action,{...selection,
          supportItemPrinting:token.root.supportItemPrinting,
          supportItemCard:token.supportItemCard});
        audit.promptsProposed++;
        return selection.action;
      }
      if(!prompt){
        const root=chooseRoot(observe(state,seat));
        if(root){
          const owner=state.players[seat];
          const card=owner.discard.cards.find(c=>c.fullName===root.target);
          const supportItemCard=owner.hand.cards[root.handIndex];
          assert.ok(card&&supportItemCard?.fullName===root.supportItemPrinting);
          const action=new PlayCardAction(playerId,root.handIndex,{
            player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BOARD,index:0
          });
          roots.set(action,{seat,ownerId:playerId,target:root.target,card,
            supportItemCard,root});
          audit.rootsProposed++;
          return action;
        }
      }
    }
    return oldBot.value.apply(this,[state,...rest]);
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==nativeStore){
      nativeStore=this;
      pending.clear();
      audit.actualGamesSeen++;
    }
    const root=this===nativeStore?roots.get(action):undefined;
    if(root){
      try{
        const owner=this.state.players[root.seat];
        assert.strictEqual(owner.id,root.ownerId);
        assert.ok(owner.discard.cards.includes(root.card));
        assert.strictEqual(owner.hand.cards[root.root.handIndex],root.supportItemCard);
        const result=oldDispatch.value.apply(this,[action,...args]);
        assert.notEqual(result,false);
        const prompt=this.state.prompts?.find(p=>p.result===undefined);
        assert.ok(prompt&&prompt.constructor?.name==='ChooseCardsPrompt'&&
          prompt.playerId===owner.id&&prompt.cards===owner.discard,
          'Native VS Seeker did not create the authenticated owner-discard prompt');
        const supportItemInHandAtPrompt=owner.hand.cards.includes(root.supportItemCard);
        const supportItemInDiscardAtPrompt=owner.discard.cards.includes(root.supportItemCard);
        pending.set(root.ownerId,{...root,promptId:prompt.id,
          supportItemInHandAtPrompt,supportItemInDiscardAtPrompt});
        audit.rootsAccepted++;
        return result;
      }catch(error){
        audit.rootsRejected++;
        throw error;
      }
    }
    const reply=this===nativeStore?replies.get(action):undefined;
    if(reply){
      const owner=this.state.players[reply.seat];
      assert.strictEqual(owner.id,reply.ownerId);
      assert.strictEqual(action.id,reply.promptId);
      assert.ok(owner.discard.cards.includes(reply.card));
      assert.ok(owner.discard.cards.includes(reply.supportItemCard));
      const beforeHand=owner.hand.cards.filter(c=>c.fullName===reply.targetPrinting).length;
      const beforeDiscard=owner.discard.cards.filter(c=>c.fullName===reply.targetPrinting).length;
      const result=oldDispatch.value.apply(this,[action,...args]);
      assert.notEqual(result,false);
      const after=this.state.players[reply.seat];
      const afterHand=after.hand.cards.filter(c=>c.fullName===reply.targetPrinting).length;
      const afterDiscard=after.discard.cards.filter(c=>c.fullName===reply.targetPrinting).length;
      assert.equal(afterHand,beforeHand+1);
      assert.equal(afterDiscard,beforeDiscard-1);
      assert.ok(after.hand.cards.includes(reply.card));
      assert.ok(!after.discard.cards.includes(reply.card));
      assert.ok(after.discard.cards.includes(reply.supportItemCard));
      assert.ok(!after.hand.cards.includes(reply.supportItemCard));
      pending.delete(reply.ownerId);
      audit.promptsAccepted++;
      audit.receipts.push({seat:reply.seat,ownerId:reply.ownerId,
        promptId:reply.promptId,targetPrinting:reply.targetPrinting,
        beforeHand,beforeDiscard,afterHand,afterDiscard,
        supportItemPrinting:reply.supportItemPrinting,
        supportItemMovedToDiscard:true,exactPhysicalCardMoved:true});
      return result;
    }
    return oldDispatch.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...oldBot,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',{...oldDispatch,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    Object.defineProperty(Bot.prototype,'decodeNextAction',oldBot);
  }
}

module.exports={VERSION,withOwnerVsSeekerGuzmaLayer};
