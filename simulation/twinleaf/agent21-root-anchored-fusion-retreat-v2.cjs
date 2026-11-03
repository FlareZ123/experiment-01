'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {chooseStrandedFusionMewRetreat} =
  require('./agent21-owner-stranded-fusion-mew-retreat.cjs');
const {chooseCrobatDceMewRetreat} =
  require('./agent9-crobat-dce-mew-retreat.cjs');

const VERSION = 'agent21-live-addplayer-anchored-dce-fusion-retreat-v2';
const DCE = 'Double Colorless Energy SUM';

/**
 * A pass-only, symmetric, owner-observation developmental policy.
 * No deck, opponent identity, seed, or candidate label is consulted.
 * Successful native action dispatch is kept distinct from physical fee proof.
 *
 * Every genuine game Store is provisionally anchored by its first
 * AddPlayerAction, matching the existing Agent34 live-instance observer.
 * The hook never substitutes actions on unanchored Store objects. A future
 * selected release must additionally verify the root-action-ledger join.
 *
 * @template T
 * @param {() => T} execute Synchronous game runner, possibly several games.
 * @param {object} [deps] Pinned native classes or bounded test injection.
 * @returns {{result:T,audit:object}}
 */
function withRootAnchoredFusionMewRetreat(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {PassTurnAction,RetreatAction}=deps.actions??
    require(path.join(base,'game/store/actions/game-actions'));
  const {GamePhase}=deps.phase??
    require(path.join(base,'game/store/state/state'));
  const types=deps.types??
    require(path.join(base,'game/store/card/card-types'));
  const catalog=deps.catalog??{
    colorlessEnergyType:types.CardType.COLORLESS,
    specialConditions:types.SpecialCondition
  };
  const observe=deps.observe??
    require('./actor-observation-contract.cjs').actorObservation;
  const choose=deps.choose??((view,known)=>
    chooseStrandedFusionMewRetreat(view,known)??
    chooseCrobatDceMewRetreat(view,known));
  assert.ok(Number.isSafeInteger(catalog.colorlessEnergyType));
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');

  const anchored=new WeakSet();
  const gameOrdinal=new WeakMap();
  const pending=new WeakMap();
  let nextGame=0;
  const audit={
    version:VERSION,developmentOnly:true,ownerNeutral:true,
    anchoredStores:0,auxiliaryPassesUnchanged:0,
    anchoredPassesSeen:0,eligibleOffers:0,
    nativeReplacementReturns:0,nativeRejectedReplacements:0,
    exactPhysicalFeeAndPromotion:0,unverifiedPhysicalFees:0,
    pendingAtEnd:0,records:[],
    verifiedSelectedRootLedgerJoin:false,
    paperEffectComplete:false,officialClockVerified:false,
    competitivelyQualifiedGames:0
  };
  const add = receipt => {
    if(audit.records.length<120)audit.records.push(receipt);
  };
  const allSlots=owner=>[owner.active,...(owner.bench??[])];

  /** Retain exact native object references privately, not in the actor view. */
  function capture(owner,index,store) {
    const old=owner.active, target=owner.bench?.[index];
    const fee=old?.energies?.cards?.filter(c=>c.fullName===DCE)??[];
    if(!target||fee.length!==1||target===old||
      owner.discard?.cards?.includes(fee[0]))return null;
    const fromPokemon=old.getPokemonCard?.();
    const toPokemon=target.getPokemonCard?.();
    if(!fromPokemon||!toPokemon)return null;
    return {store,owner,seat:store.state.activePlayer,
      turn:store.state.turn,index,
      fromPokemon,toPokemon,feeCard:fee[0]};
  }

  function settle(store) {
    const before=pending.get(store);
    if(!before)return;
    if(store.state?.prompts?.some(p=>p.result===undefined))return;
    pending.delete(store);
    const owner=store.state?.players?.[before.seat];
    const ownerIdentity=owner===before.owner;
    const promoted=ownerIdentity &&
      owner.active?.getPokemonCard?.()===before.toPokemon;
    const outgoingBenched=ownerIdentity &&
      owner.bench?.some(b=>b.getPokemonCard?.()===before.fromPokemon)===true;
    const feeInDiscard=ownerIdentity &&
      owner.discard?.cards?.includes(before.feeCard)===true;
    const feeOnBoard=ownerIdentity &&
      allSlots(owner).some(s=>
        s?.cards?.includes(before.feeCard)||
        s?.energies?.cards?.includes(before.feeCard))===true;
    const quotaUsed=ownerIdentity&&owner.retreatedTurn===before.turn;
    const verified=promoted&&outgoingBenched&&feeInDiscard&&
      !feeOnBoard&&quotaUsed;
    const receipt={
      stage:'post-settlement',game:gameOrdinal.get(store),
      seat:before.seat,turn:before.turn,
      status:verified?'EXACT_FEE_AND_PROMOTION':
        'PHYSICAL_FEE_OR_POSITION_UNVERIFIED',
      ownerIdentity,promoted,outgoingBenched,feeInDiscard,
      paidCardAbsentFromBoard:ownerIdentity&&!feeOnBoard,quotaUsed,
      paperEffectVerified:false,selectedRootLedgerJoinVerified:false
    };
    add(receipt);
    if(verified)audit.exactPhysicalFeeAndPromotion++;
    else audit.unverifiedPhysicalFees++;
  }

  function intercept(action,...args) {
    const name=action?.constructor?.name;
    if(name==='AddPlayerAction'&&!anchored.has(this)){
      anchored.add(this);
      gameOrdinal.set(this,++nextGame);
      audit.anchoredStores++;
    }
    if(!anchored.has(this)){
      if(name==='PassTurnAction')audit.auxiliaryPassesUnchanged++;
      return descriptor.value.apply(this,[action,...args]);
    }
    const s=this.state;
    const isPass=action instanceof PassTurnAction||
      name==='PassTurnAction';
    if(isPass&&s?.phase===GamePhase.PLAYER_TURN &&
      [0,1].includes(s.activePlayer)&&
      !s.prompts?.some(p=>p.result===undefined)) {
      audit.anchoredPassesSeen++;
      const seat=s.activePlayer,owner=s.players?.[seat];
      const actorId=action.playerId??action.clientId;
      if(owner&&(actorId===undefined||actorId===owner.id)) {
        const view=observe(s,seat);
        const intent=choose(view,catalog);
        if(intent) {
          assert.equal(intent.kind,'paid-retreat');
          assert.ok(Number.isSafeInteger(intent.benchIndex));
          const before=capture(owner,intent.benchIndex,this);
          if(before) {
            const replacement=new RetreatAction(owner.id,intent.benchIndex);
            audit.eligibleOffers++;
            add({stage:'selected-proposal',game:gameOrdinal.get(this),
              seat,turn:s.turn,from:before.fromPokemon.fullName,
              to:before.toPokemon.fullName,
              paymentPrinting:before.feeCard.fullName,
              selectedRootLedgerJoinVerified:false});
            pending.set(this,before);
            try {
              const result=descriptor.value.call(this,replacement,...args);
              audit.nativeReplacementReturns++;
              settle(this);
              return result;
            }catch(error) {
              pending.delete(this);
              audit.nativeRejectedReplacements++;
              add({stage:'native-rejected',game:gameOrdinal.get(this),
                seat,turn:s.turn,error:String(error?.message??error)});
              throw error;
            }
          }
        }
      }
    }
    const result=descriptor.value.apply(this,[action,...args]);
    settle(this);
    return result;
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...descriptor,value:intercept
  });
  try {
    const result=execute();
    audit.pendingAtEnd=audit.eligibleOffers-
      audit.exactPhysicalFeeAndPromotion-
      audit.unverifiedPhysicalFees-audit.nativeRejectedReplacements;
    assert.ok(audit.pendingAtEnd>=0);
    return {result,audit};
  }catch(error){
    if(error && typeof error==='object'){
      error.agent21RootAnchoredAudit={...audit,
        pendingAtFailure:audit.eligibleOffers-
          audit.exactPhysicalFeeAndPromotion-
          audit.unverifiedPhysicalFees-audit.nativeRejectedReplacements};
    }
    throw error;
  }finally {
    assert.strictEqual(Store.prototype.dispatch,intercept);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={VERSION,DCE,withRootAnchoredFusionMewRetreat};
