'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseConservativeShuffleSupporter,VERSION:CHOOSER_VERSION}=
  require('./agent2-conservative-shuffle-supporter.cjs');

const VERSION='agent2-actor-only-shuffle-supporter-after-pass-native-v1';

/**
 * Both-seat actor-only post-Pass shuffle Supporter policy.
 * The underlying Store remains the only action authority. The caller's
 * existing policy runs first and may consume all legal root actions.
 *
 * @template T
 * @param {()=>T} execute Synchronous canonical native game.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,cardActions?:object,
 *   observe?:Function,choose?:Function}} [deps] Injection seams.
 * @returns {{result:T,audit:object}}
 */
function withActorOnlyShuffleSupporterAfterPass(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??require(path.join(base,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require(path.join(base,'game/store/actions/play-card-action'));
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseConservativeShuffleSupporter;
  const priorDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const priorDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof priorDecode?.value,'function');
  assert.equal(typeof priorDispatch?.value,'function');
  const attempts=new WeakMap();
  let realStore=null;
  const audit={version:VERSION,chooserVersion:CHOOSER_VERSION,
    bothSeats:true,ownerInformationSetOnly:true,
    passRootsObserved:0,eligibleDrawIntents:0,
    attemptedRoots:0,acceptedRoots:0,rejectedRoots:0,
    acceptedByFamily:{},passExclusionCounts:{},
    selected:[],nativeRootOutcomes:[],
    promptSettlementsCertified:false,
    policyEffectOnWinsNotQualified:true,competitiveGameQualified:false};
  function decode(state){
    const proposed=priorDecode.value.call(this,state);
    if(proposed?.constructor?.name!=='PassTurnAction')return proposed;
    const seat=state.players?.findIndex(p=>p.id===this.client?.id);
    if((seat!==0&&seat!==1)||state.activePlayer!==seat||
       state.prompts?.some(p=>p.result===undefined))return proposed;
    const owner=state.players[seat];
    const view=observe(state,seat);
    audit.passRootsObserved++;
    const intent=choose(view);
    if(!intent){
      const key=view.globalTurn===1?'opening-turn-excluded':
        (view.ownTurnResources.supporterPlayedTurn!==0?
          'quota-spent':'no-qualifying-shuffle-supporter');
      audit.passExclusionCounts[key]=(audit.passExclusionCounts[key]??0)+1;
      return proposed;
    }
    assert.equal(view.ownHand[intent.handIndex],intent.printing);
    audit.eligibleDrawIntents++;
    const card=new PlayCardAction(owner.id,intent.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    attempts.set(card,{seat,turn:view.globalTurn,printing:intent.printing,
      family:intent.family,handIndex:intent.handIndex,
      ownerHandCount:view.ownHand.length,
      opponentHandCount:view.opponentPublic.handCount,
      ownDeckCount:view.ownPublic.deckCount,
      ownPrizeCount:view.ownPublic.prizeCount,
      score:intent.score,drawEstimate:intent.drawEstimate});
    audit.attemptedRoots++;
    if(audit.selected.length<128)
      audit.selected.push({seat,turn:view.globalTurn,
        printing:intent.printing,family:intent.family,
        reason:'actor-owned-conservative-shuffle-supporter-after-pass'});
    return card;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&realStore===null)
      realStore=this;
    const proposed=this===realStore?attempts.get(action):null;
    try{
      const result=priorDispatch.value.call(this,action,...args);
      if(proposed){
        const owner=this.state.players[proposed.seat];
        const physical=owner.hand.cards.some(c=>
          c.fullName===proposed.printing);
        const receipt={...proposed,StoreAccepted:true,
          nativeSupporterQuotaAfter:owner.supporterTurn,
          printingRemainsInOwnerHandAfter:physical,
          pendingPromptCount:this.state.prompts.filter(p=>
            p.result===undefined).length,
          effectSettledInSameDispatch:false};
        audit.acceptedRoots++;
        audit.acceptedByFamily[proposed.family]=
          (audit.acceptedByFamily[proposed.family]??0)+1;
        if(audit.nativeRootOutcomes.length<256)
          audit.nativeRootOutcomes.push(receipt);
      }
      return result;
    }catch(error){
      if(proposed){
        audit.rejectedRoots++;
        if(audit.nativeRootOutcomes.length<256)
          audit.nativeRootOutcomes.push({
            ...proposed,StoreAccepted:false,error:String(error?.message??error)
          });
      }
      throw error;
    }
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...priorDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...priorDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent2ShuffleSupporterEvidence=audit;
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',priorDispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',priorDecode);
  }
}

module.exports={VERSION,withActorOnlyShuffleSupporterAfterPass};
