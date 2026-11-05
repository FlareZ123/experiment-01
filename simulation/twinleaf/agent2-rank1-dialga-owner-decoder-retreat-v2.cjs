'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));
const VERSION='agent2-owner-decoder-dialga-paid-retreat-v2';

/**
 * Owner chooses one genuine typed RetreatAction at global turn33 before
 * the headless root ledger records the decision. Observe the native Store
 * passively and certify three physical Psychic payments and exact promotion.
 *
 * @template T
 * @param {()=>T} execute Native match.
 * @param {{treatment:boolean,ownerSeat?:0|1,targetTurn?:number,deps?:object}} config
 * @returns {{result:T,audit:object}}
 */
function withOwnerSelectedDialgaPaidRetreat(execute,config){
  assert.equal(typeof execute,'function');
  assert.equal(typeof config?.treatment,'boolean');
  const seat=config.ownerSeat??1,turn=config.targetTurn??33;
  const deps=config.deps??{};
  const {SimpleTacticsAi}=deps.ai??native('simple-bot/simple-tactics-ai');
  const {Store}=deps.store??native('game/store/store');
  const {RetreatAction}=deps.actions??native('game/store/actions/game-actions');
  const decoder=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const store=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof decoder?.value,'function');
  assert.equal(typeof store?.value,'function');
  const pending=new WeakMap();
  let selected=false;
  const audit={version:VERSION,seat,turn,treatment:config.treatment,
    eligiblePasses:0,typedRetreatChoices:0,storeRetreatDispatches:0,
    verifiedPayments:0,unverifiedReturns:0,receipts:[],errors:[],
    noHiddenOpponentZones:true,qualifiedGames:0};

  /** @param {object} state */
  function opportunity(state){
    if(state?.turn!==turn||state.activePlayer!==seat||
       state.prompts?.some(p=>p.result===undefined))return null;
    const own=state.players[seat],other=state.players[1-seat];
    if(own.active.getPokemonCard()?.fullName!=='Dialga-GX UPR'||
       other.active.getPokemonCard()?.fullName!=='Bunnelby PRC'||
       own.retreatedTurn===turn||own.cannotRetreat===true||
       own.active.specialConditions?.length>0)return null;
    const cost=own.active.energies.cards;
    if(cost.length!==3||cost.some(c=>c.fullName!=='Psychic Energy MEE'))
      return null;
    const index=own.bench.findIndex(slot=>
      slot.getPokemonCard()?.fullName==='Shadow Rider Calyrex V CRE'&&
      slot.energies.cards.some(c=>c.fullName==='Psychic Energy MEE'));
    return index<0?null:{own,index,cost};
  }
  function choose(state,...args){
    const proposed=decoder.value.call(this,state,...args);
    if(selected||proposed?.constructor?.name!=='PassTurnAction')return proposed;
    const w=opportunity(state);
    if(!w)return proposed;
    audit.eligiblePasses++;
    if(!config.treatment)return proposed;
    selected=true;
    audit.typedRetreatChoices++;
    return new RetreatAction(w.own.id,w.index);
  }
  function settle(realStore){
    const pre=pending.get(realStore);
    if(!pre||realStore.state.prompts?.some(p=>p.result===undefined))return;
    const own=realStore.state.players[seat];
    const added=own.discard.cards.filter(c=>!pre.discard.includes(c));
    const paid=added.length===3&&added.every(c=>pre.cost.includes(c))&&
      pre.cost.every(c=>own.discard.cards.includes(c));
    const promoted=own.active===pre.target&&
      own.bench[pre.index]===pre.source;
    const retained=pre.targetEnergy.every(c=>
      own.active.energies.cards.includes(c));
    const removed=pre.cost.every(c=>!pre.source.energies.cards.includes(c));
    const quota=own.retreatedTurn===turn;
    const valid=paid&&promoted&&retained&&removed&&quota;
    if(valid)audit.verifiedPayments++;else audit.unverifiedReturns++;
    audit.receipts.push({turn,seat,valid,payment:paid,promotion:promoted,
      retainedEnergy:retained,removedEnergy:removed,retreatQuota:quota,
      afterActive:own.active.getPokemonCard()?.fullName});
    pending.delete(realStore);
  }
  function observe(action,...args){
    const state=this.state,own=state?.players?.[seat];
    const w=action?.constructor?.name==='RetreatAction'&&
      (action.clientId??action.id)===own?.id?opportunity(state):null;
    if(w&&action.benchIndex===w.index){
      audit.storeRetreatDispatches++;
      pending.set(this,{index:w.index,source:own.active,
        target:own.bench[w.index],cost:[...w.cost],
        targetEnergy:[...own.bench[w.index].energies.cards],
        discard:[...own.discard.cards]});
    }
    try{
      const result=store.value.call(this,action,...args);
      settle(this);
      return result;
    }catch(error){
      if(pending.has(this)){
        audit.errors.push(String(error?.message??error));
        pending.delete(this);
      }
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...decoder,value:choose});
  Object.defineProperty(Store.prototype,'dispatch',{...store,value:observe});
  try{
    const result=execute();
    return {result,audit:{...audit,
      pendingAtEnd:audit.storeRetreatDispatches-audit.receipts.length-
        audit.errors.length}};
  }catch(error){
    error.agent2PaidRetreatV2Audit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observe);
    Object.defineProperty(Store.prototype,'dispatch',store);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,choose);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',decoder);
  }
}
module.exports={VERSION,withOwnerSelectedDialgaPaidRetreat};
