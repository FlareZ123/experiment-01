'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const VERSION='agent9-retro-owner-held-palacebook-to-next-turn-v1';
const TARGET='6:101:B:champion-reference';
const ITEM='Palace Book SMP';
const THORNS='Iron Thorns ex TWM';
const DCE='Double Colorless Energy SUM';
const THUNDER='Thunder Mountain Prism Star LOT';

/**
 * Owner-visible native root eligibility. The drawn cards are unknown at the
 * decision and may only be observed after native Store executes the Item.
 * @param {object} view Detached actor-owned observation.
 * @returns {{ok:boolean,reasons:string[],handIndex:number}} Candidate only.
 */
function palaceBookOpportunity(view){
  assert.equal(view?.decisionKind,'owner-root');
  const r=view.ownTurnResources,own=view.ownPublic,opp=view.opponentPublic;
  const handIndex=view.ownHand.indexOf(ITEM);
  const reasons=[];
  if(view.actorSeat!==0||view.globalTurn!==4)reasons.push('wrong-source-root');
  if(handIndex<0)reasons.push('item-not-in-owner-hand');
  if(r.itemPlayLocked!==false||
     own.publicTurnRestrictions.itemPlayLocked!==false)
    reasons.push('item-locked');
  if(own.deckCount<3)reasons.push('fewer-than-three-deck-cards');
  if(own.active?.printing!==THORNS||own.active.energies.length!==0)
    reasons.push('wrong-active');
  if(!own.bench.some(p=>p?.printing===THORNS&&p.energies.includes(DCE)))
    reasons.push('no-funded-thorns-bench');
  if(![...own.stadium,...opp.stadium].includes(THUNDER))
    reasons.push('thunder-absent');
  if(!opp.bench.some(Boolean))reasons.push('opponent-bench-empty');
  return {ok:reasons.length===0,reasons,handIndex};
}

/**
 * Exactly one retrospective original source turn4 original-Pass alternative:
 * a physically held Palace Book Item. No concealed opponent/private deck
 * identities are read, no other opponent actions are modified, and the
 * genuine Store is the only authority for the Item and turn settlement.
 * @template T
 * @param {()=>T} execute Original synchronous v10 native match.
 * @param {{trialId:string,Store?:Function,SimpleTacticsAi?:Function,
 *  PlayCardAction?:Function,PlayerType?:object,SlotType?:object,
 *  observe?:Function}} deps
 * @returns {{result:T,audit:object}}
 */
function withSourceTurn4PalaceBook(execute,deps){
  assert.equal(typeof execute,'function');
  assert.equal(deps?.trialId,TARGET);
  const native=p=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',p));
  const Store=deps.Store??native('game/store/store').Store;
  const Ai=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const PlayCardAction=deps.PlayCardAction??
    native('game/store/actions/play-card-action').PlayCardAction;
  const targetTypes=deps.PlayerType&&deps.SlotType?{}:
    native('game/store/actions/play-card-action');
  const PlayerType=deps.PlayerType??targetTypes.PlayerType;
  const SlotType=deps.SlotType??targetTypes.SlotType;
  const observe=deps.observe??actorObservation;
  const oldAi=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const oldStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldAi?.value,'function');
  assert.equal(typeof oldStore?.value,'function');
  const offered=new WeakMap();
  const audit={schema:VERSION,trialId:deps.trialId,actualStores:0,
    sourceOriginalTurn4Passes:0,eligibleBookOffers:0,
    selectedBookActions:0,nativeAcceptedBookRoot:0,
    storeRejectedBookActions:0,
    sourceTurn6NativeDecisions:[],proposalRecords:[],
    physicalBookSettlement:null,changedOtherActions:false,
    competitiveQualifiedGames:0};
  let live=null;
  function dispatch(action,...rest){
    const type=action?.constructor?.name;
    if(type==='AddPlayerAction'&&!live){
      live=this;
      audit.actualStores++;
    }
    const genuine=this===live;
    const token=genuine?offered.get(action):null;
    const source=token?this.state.players[0]:null;
    const physical=token?.physical??null;
    const handBefore=token?source.hand.cards.length:null;
    const deckBefore=token?source.deck.cards.length:null;
    const turnBefore=token?this.state.turn:null;
    const beforeHand=token?source.hand.cards.map(c=>c.fullName):null;
    let output;
    try{output=oldStore.value.call(this,action,...rest);}
    catch(error){
      if(token){
        audit.storeRejectedBookActions++;
        audit.physicalBookSettlement={
          nativeAccepted:false,error:String(error?.message??error),
          turnBefore,handBefore,deckBefore,ownerHandBefore:beforeHand
        };
      }
      throw error;
    }
    if(!token)return output;
    const after=this.state,owner=after.players[0];
    const handAfter=owner.hand.cards.length;
    const deckAfter=owner.deck.cards.length;
    const physicallyDiscarded=owner.discard.cards.includes(physical);
    const leftOriginalHand=!owner.hand.cards.includes(physical);
    audit.nativeAcceptedBookRoot++;
    audit.physicalBookSettlement={
      originalTurn4NativeChoice:'PassTurnAction',
      selected:'PlayCardAction',printing:physical.fullName,
      actualPhysicalHandIndex:token.handIndex,
      nativeDispatchReturned:true,
      cardLeftOwnerHand:leftOriginalHand,
      exactPhysicalCardEnteredDiscard:physicallyDiscarded,
      handBefore,handAfter,deckBefore,deckAfter,
      observedPhysicalDrawCount:deckBefore-deckAfter,
      handNetCardDelta:handAfter-handBefore,
      threeCardDrawPhysicallyObserved:deckBefore-deckAfter===3&&
        handAfter-handBefore===2&&leftOriginalHand&&physicallyDiscarded,
      turnBefore,turnAfter:after.turn,
      activePlayerAfter:after.activePlayer,
      nativeImmediateEndTurn:after.turn>turnBefore&&
        after.activePlayer===1,
      ownerHandBefore:beforeHand,
      ownerHandAfter:owner.hand.cards.map(c=>c.fullName),
      ownerDeckIdentitiesInspected:false,
      ownerPrizeIdentitiesInspected:false,
      opponentConcealedZoneInspected:false,
      paperFullLegalityCertified:false
    };
    return output;
  }
  function decode(state,...args){
    if(state!==live?.state||state?.activePlayer!==0||
      state.players?.[0]?.id!==this.client?.id||
      !Number.isSafeInteger(state.turn)||
      state.prompts?.some(p=>p.result===undefined))
      return oldAi.value.call(this,state,...args);
    const source=state.players[0];
    if(audit.nativeAcceptedBookRoot>0&&state.turn===6){
      const observation=observe(state,0);
      const original=oldAi.value.call(this,state,...args);
      if(audit.sourceTurn6NativeDecisions.length<12){
        audit.sourceTurn6NativeDecisions.push({
          globalTurn:6,actorSeat:0,
          ownerHand:[...observation.ownHand],
          ownerGuzmaInHand:observation.ownHand.includes('Guzma BUS'),
          ownerVsSeekerInHand:observation.ownHand.includes('VS Seeker PHF'),
          sourceActive:observation.ownPublic.active?.printing??null,
          sourceActiveEnergy:
            observation.ownPublic.active?.energies??null,
          fundableBench:observation.ownPublic.bench.filter(p=>
            p?.printing===THORNS&&p.energies.includes(DCE)).length,
          opponentBench:observation.opponentPublic.bench.filter(Boolean).length,
          chosenNativeAction:original?.constructor?.name??null
        });
      }
      return original;
    }
    if(state.turn!==4||audit.selectedBookActions>0)
      return oldAi.value.call(this,state,...args);
    const original=oldAi.value.call(this,state,...args);
    if(original?.constructor?.name!=='PassTurnAction')return original;
    audit.sourceOriginalTurn4Passes++;
    const view=observe(state,0);
    const offer=palaceBookOpportunity(view);
    audit.proposalRecords.push({turn:4,sourceSeat:0,
      originalAction:'PassTurnAction',...offer,
      sourceDeckCount:view.ownPublic.deckCount,
      originalOwnerHand:[...view.ownHand]});
    if(!offer.ok)return original;
    const physical=source.hand.cards[offer.handIndex];
    assert.equal(physical.fullName,ITEM);
    const candidate=new PlayCardAction(source.id,offer.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    offered.set(candidate,{physical,handIndex:offer.handIndex});
    audit.eligibleBookOffers++;
    audit.selectedBookActions++;
    return candidate;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...oldStore,value:dispatch});
  Object.defineProperty(Ai.prototype,'decodeNextAction',{...oldAi,value:decode});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent9Turn4PalaceBookAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldAi);
    Object.defineProperty(Store.prototype,'dispatch',oldStore);
  }
}
module.exports={VERSION,TARGET,ITEM,THORNS,DCE,THUNDER,
  palaceBookOpportunity,withSourceTurn4PalaceBook};
