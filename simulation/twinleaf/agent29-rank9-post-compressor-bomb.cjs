'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {sourceEnergy}=require('./agent29-rank9-compressor-owner-bridge.cjs');

const VERSION='agent29-rank9-post-compressor-owner-bomb-v4';
const SOURCE_ITEM='Battle Compressor PHF';
const ELECTRODE='Electrode-GX CES';
const MEGA='Mega Absol ex M1L';

/**
 * Owner-only, public/discard-paid line. An exact original-source Compressor
 * shuffle must have settled on the genuine Store this turn. It is a
 * source-specific experimental intervention, not a generic bot policy.
 *
 * @param {object} state Actual native state.
 * @param {0|1} sourceSeat
 * @param {object} ready Source-stamped successful shuffle record.
 * @returns {{electrode:object,recipientBenchIndex:number}|null}
 */
function chooseOwnerBombAfterCompressor(state,sourceSeat,ready){
  if(!ready||ready.turn!==state.turn||
    state.activePlayer!==sourceSeat||state.prompts?.some(p=>p.result===undefined))
    return null;
  const owner=state.players[sourceSeat],opponent=state.players[1-sourceSeat];
  if(!owner||!opponent||opponent.getPrizeLeft()<=2)return null;
  const active=owner.active.getPokemonCard();
  if(active?.fullName!==ELECTRODE)return null;
  const index=owner.bench.findIndex(b=>b.getPokemonCard()?.fullName===MEGA);
  if(index<0)return null;
  if(!owner.discard.cards.some(c=>sourceEnergy(c.fullName)))return null;
  return {electrode:active,recipientBenchIndex:index};
}

/**
 * Separate v4 wrapper, installed OUTSIDE the existing original rank9 source
 * after-Pass Compressor wrapper. It hears only the real Store recorded by an
 * AddPlayerAction, and intercepts actual owner prompt continuation.
 *
 * @template T
 * @param {()=>T} run Native same-deal runner.
 * @param {0|1} sourceSeat Exact printed source seat for the registered trial.
 * @param {object} [deps] Test-only native constructor injection.
 * @returns {{result:T,audit:object}}
 */
function withOwnerBombAfterSourceCompressor(run,sourceSeat,deps={}){
  assert.equal(typeof run,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=name=>require(path.join(output,name));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const GamePhase=deps.GamePhase??native('game/store/state/state').GamePhase;
  const {UseAbilityAction}=deps.abilityActions??
    native('game/store/actions/game-actions');
  const {PlayerType,SlotType}=deps.cardActions??
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=deps.promptActions??
    native('game/store/actions/resolve-prompt-action');
  const originalDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof originalDecode?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  let liveStore=null;
  const readyByOwner=new Map();
  const bombByOwner=new Map();
  const proposed=new WeakMap(),attachment=new WeakMap();
  const audit={version:VERSION,sourceSeat,sourceOnly:true,
    sourceStampedCompressorShuffles:0,
    afterItemBombEligiblePasses:0,proposedBombs:0,
    nativeAcceptedBombs:0,nativeRejectedBombs:0,
    ownerEnergyPromptDecisions:0,physicallyAttachedEnergyCards:0,
    physicalElectrodeSelfKosWithTwoPrizes:0,
    sourceAbilityPayoffNotAssumed:true,
    qualifiedCompetitiveGames:0,events:[]};

  function selected(state){
    const owner=state.players?.[sourceSeat];
    if(!owner||this.client?.id!==owner.id||
      state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN||
      state.activePlayer!==sourceSeat)
      return originalDecode.value.call(this,state);
    const pending=state.prompts?.find(p=>p.result===undefined);
    const bomb=bombByOwner.get(owner.id);
    if(bomb&&pending?.constructor?.name==='AttachEnergyPrompt'&&
      pending.playerId===owner.id&&
      pending.cardList===owner.discard&&
      pending.message==='ATTACH_ENERGY_CARDS'){
      const targetIndex=owner.bench.findIndex(b=>
        b.getPokemonCard()?.fullName===MEGA);
      assert.ok(targetIndex>=0,
        'Original Mega recipient must still be benched when Bomb is paid');
      const energy=pending.cardList.cards.filter(c=>
        sourceEnergy(c.fullName)).slice(0,5);
      assert.ok(energy.length>=1&&energy.length<=5);
      const to={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:targetIndex};
      const chosen=energy.map(card=>({card,to}));
      assert.equal(pending.validate(chosen,state),true,
        'Printed source CES48 must accept all available Energy');
      const action=new ResolvePromptAction(pending.id,chosen);
      attachment.set(action,{bomb,energy});
      audit.ownerEnergyPromptDecisions++;
      return action;
    }
    const prior=originalDecode.value.call(this,state);
    if(prior?.constructor?.name!=='PassTurnAction'||pending)return prior;
    const ready=readyByOwner.get(owner.id);
    const available=chooseOwnerBombAfterCompressor(state,sourceSeat,ready);
    if(!available)return prior;
    audit.afterItemBombEligiblePasses++;
    readyByOwner.delete(owner.id);
    const action=new UseAbilityAction(owner.id,'Extra Energy Bomb',
      {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
    const opponent=state.players[1-sourceSeat];
    const event={sourceSeat,turn:state.turn,
      ownerActive:available.electrode.fullName,
      recipientBenchIndex:available.recipientBenchIndex,
      discardedEnergyBefore:owner.discard.cards.filter(c=>
        sourceEnergy(c.fullName)).length,
      opponentPrizesBefore:opponent.getPrizeLeft(),
      nativeAccepted:null,attachedPhysicalEnergy:0,
      twoPrizeSelfKoSettled:false};
    proposed.set(action,{event,electrode:available.electrode});
    audit.proposedBombs++;audit.events.push(event);
    return action;
  }

  function dispatched(action,...args){
    if(action?.constructor?.name==='AddPlayerAction')liveStore=this;
    const real=this===liveStore;
    const state=this.state;
    const owner=state.players?.[sourceSeat];
    const opponent=state.players?.[1-sourceSeat];
    const proposal=real?proposed.get(action):null;
    const payment=real?attachment.get(action):null;
    const waiting=real&&action?.constructor?.name==='ResolvePromptAction'?
      state.prompts?.find(p=>p.result===undefined&&p.id===action.id):null;
    const stamped=waiting?.constructor?.name==='ShuffleDeckPrompt'&&
      waiting.playerId===owner?.id&&
      waiting.sourceCard?.fullName===SOURCE_ITEM;
    try{
      const result=originalDispatch.value.call(this,action,...args);
      if(stamped&&owner){
        audit.sourceStampedCompressorShuffles++;
        readyByOwner.set(owner.id,{turn:state.turn});
      }
      if(proposal){
        proposal.event.nativeAccepted=true;
        audit.nativeAcceptedBombs++;
        bombByOwner.set(owner.id,proposal);
      }
      if(payment&&owner){
        const attached=payment.energy.filter(card=>
          !owner.discard.cards.includes(card)&&
          [owner.active,...owner.bench].some(slot=>
            slot.energies.cards.includes(card))).length;
        payment.bomb.event.attachedPhysicalEnergy=attached;
        audit.physicallyAttachedEnergyCards+=attached;
      }
      if(owner&&opponent){
        const bomb=bombByOwner.get(owner.id);
        if(bomb&&!bomb.event.twoPrizeSelfKoSettled&&
          owner.discard.cards.includes(bomb.electrode)&&
          bomb.event.opponentPrizesBefore-opponent.getPrizeLeft()===2){
          bomb.event.twoPrizeSelfKoSettled=true;
          audit.physicalElectrodeSelfKosWithTwoPrizes++;
          bombByOwner.delete(owner.id);
        }
      }
      return result;
    }catch(error){
      if(proposal){
        proposal.event.nativeAccepted=false;
        audit.nativeRejectedBombs++;
      }
      if(error&&typeof error==='object')
        error.agent29Rank9AutoBombAudit=audit;
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...originalDecode,value:selected});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:dispatched});
  try{return {result:run(),audit};}
  finally{
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',originalDecode);
  }
}

module.exports={VERSION,chooseOwnerBombAfterCompressor,
  withOwnerBombAfterSourceCompressor};
