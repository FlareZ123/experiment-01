'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent2-rank1-dialga-three-psychic-actual-paid-retreat-v1';
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/**
 * One intentionally narrow owner-public mechanistic experiment.
 * Replace a genuinely selected PassTurnAction, never a hypothetical action,
 * with one RetreatAction iff the native cost evaluator and the visible
 * physical cards support a three-Basic-Psychic payment. Do not alter later
 * bot decisions, and verify physical effect settlement after any prompts.
 *
 * @template T
 * @param {()=>T} execute Genuine frozen full match.
 * @param {{treatment:boolean,ownerSeat?:0|1,targetTurn?:number,deps?:object}} config
 * @returns {{result:T,audit:object}}
 */
function withRank1DialgaPaidRetreatOnPass(execute,config){
  assert.equal(typeof execute,'function');
  assert.equal(typeof config?.treatment,'boolean');
  const ownerSeat=config.ownerSeat??1;
  const targetTurn=config.targetTurn??33;
  assert.ok(ownerSeat===0||ownerSeat===1);
  assert.ok(Number.isSafeInteger(targetTurn)&&targetTurn>1);

  const deps=config.deps??{};
  const {Store}=deps.store??native('game/store/store');
  const {RetreatAction}=deps.actions??native('game/store/actions/game-actions');
  const {CheckRetreatCostEffect}=deps.checks??native(
    'game/store/effects/check-effects');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');

  const audit={
    version:VERSION,treatment:config.treatment,ownerSeat,targetTurn,
    genuineOwnerPasses:0,paperConditionalOffers:0,
    replacedPasses:0,retreatSubmitted:0,physicalSettlements:[],
    eligibleWindows:[],errors:[],noOpSettlementCount:0,
    exactThreeCardPaidRetreats:0,pendingAtEnd:0,
    readsOpponentConcealedZones:false,qualifiedGames:0
  };
  const pending=new WeakMap();
  let selected=false;

  /** @param {object} store */
  function settle(store){
    const before=pending.get(store);
    if(!before||store.state?.prompts?.some(p=>p.result===undefined))
      return;
    const owner=store.state.players[ownerSeat];
    const nowDiscard=owner.discard.cards;
    const extra=nowDiscard.filter(card=>!before.discard.includes(card));
    const allPaid=before.payment.every(card=>nowDiscard.includes(card));
    const exactCost=allPaid&&extra.length===3&&
      extra.every(card=>before.payment.includes(card));
    const promotion=owner.active===before.targetSlot&&
      owner.bench[before.benchIndex]===before.activeSlot;
    const targetEnergyRetained=before.targetEnergy.every(card=>
      owner.active.energies.cards.includes(card));
    const sourceEnergyGone=before.payment.every(card=>
      !before.activeSlot.energies.cards.includes(card));
    const quota=owner.retreatedTurn===before.turn;
    const settled=exactCost&&promotion&&targetEnergyRetained&&
      sourceEnergyGone&&quota;
    if(settled)audit.exactThreeCardPaidRetreats++;
    else audit.noOpSettlementCount++;
    audit.physicalSettlements.push({
      turn:before.turn,ownerSeat,benchIndex:before.benchIndex,
      status:settled?'THREE_PHYSICAL_PSYCHIC_ENERGIES_PAID':
        'PHYSICAL_SETTLEMENT_UNVERIFIED',
      exactThreeNewDiscardCards:exactCost,
      bothPhysicalSlotsSwapped:promotion,
      originalBenchEnergyRetained:targetEnergyRetained,
      sourceEnergyRemoved:sourceEnergyGone,retreatQuotaUsed:quota,
      beforeActivePrinting:before.activePrinting,
      afterActivePrinting:owner.active.getPokemonCard()?.fullName??null,
      paidPrintings:before.payment.map(c=>c.fullName),
      beforeTargetPrinting:before.targetPrinting,
      afterTurn:store.state.turn
    });
    pending.delete(store);
  }

  /** @param {object} action */
  function dispatch(action,...args){
    const state=this.state,owner=state?.players?.[ownerSeat];
    const kind=action?.constructor?.name;
    const actionOwner=action?.clientId??action?.id??action?.playerId;
    let selectedAction=action;
    const ownerPass=!selected&&
      state?.turn===targetTurn&&state.activePlayer===ownerSeat&&
      owner?.id===actionOwner&&kind==='PassTurnAction'&&
      !state.prompts?.some(p=>p.result===undefined);
    if(ownerPass){
      audit.genuineOwnerPasses++;
      const active=owner.active?.getPokemonCard?.();
      const opponentActive=state.players[1-ownerSeat]?.active
        ?.getPokemonCard?.();
      const payment=owner.active?.energies?.cards??[];
      const bench=owner.bench?.flatMap((slot,index)=>{
        const card=slot.getPokemonCard?.();
        if(card?.fullName!=='Shadow Rider Calyrex V CRE')return [];
        const usable=slot.energies?.cards?.filter(c=>
          c.fullName.startsWith('Psychic Energy ')).length??0;
        return usable>=1?[{index,slot,card,usable}]:[];
      })??[];
      const printedMatch=active?.fullName==='Dialga-GX UPR'&&
        opponentActive?.fullName==='Bunnelby PRC'&&
        payment.length===3&&payment.every(c=>
          c.fullName.startsWith('Psychic Energy '))&&bench.length>0&&
        owner.retreatedTurn!==state.turn&&
        !owner.cannotRetreat&&!owner.active.specialConditions?.length;
      if(printedMatch){
        const check=new CheckRetreatCostEffect(owner);
        this.reduceEffect(state,check);
        const cost=check.cost?.length??null;
        const window={
          turn:state.turn,ownerSeat,actualChosenRoot:kind,
          activePrinting:active.fullName,
          activePaymentCards:payment.map(c=>c.fullName),
          nativeRetreatCostUnits:cost,
          sourceActivePrinting:opponentActive.fullName,
          targetPrinting:bench[0].card.fullName,
          targetEnergy:bench[0].slot.energies.cards.map(c=>c.fullName),
          targetBenchIndex:bench[0].index,
          nativeRetreatQuotaUsed:owner.retreatedTurn===state.turn,
          activeSpecialConditions:[...(owner.active.specialConditions??[])],
          cannotRetreat:owner.cannotRetreat??null
        };
        audit.eligibleWindows.push(window);
        if(cost===3){
          audit.paperConditionalOffers++;
          if(config.treatment){
            selected=true;
            audit.replacedPasses++;
            const target=bench[0];
            pending.set(this,{
              turn:state.turn,benchIndex:target.index,
              activePrinting:active.fullName,
              targetPrinting:target.card.fullName,
              activeSlot:owner.active,targetSlot:target.slot,
              payment:[...payment],
              targetEnergy:[...target.slot.energies.cards],
              discard:[...owner.discard.cards]
            });
            selectedAction=new RetreatAction(owner.id,target.index);
            audit.retreatSubmitted++;
          }
        }
      }
    }
    try{
      const result=descriptor.value.apply(this,[selectedAction,...args]);
      settle(this);
      return result;
    }catch(error){
      if(pending.has(this)){
        audit.errors.push({turn:state?.turn??null,kind:selectedAction
          ?.constructor?.name??null,message:String(error?.message??error)});
        pending.delete(this);
      }
      throw error;
    }
  }

  Object.defineProperty(Store.prototype,'dispatch',
    {...descriptor,value:dispatch});
  try{
    const result=execute();
    audit.pendingAtEnd=audit.retreatSubmitted-
      audit.physicalSettlements.length-audit.errors.length;
    return {result,audit};
  }catch(error){
    error.agent2Rank1RetreatAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={VERSION,withRank1DialgaPaidRetreatOnPass};
