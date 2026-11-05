'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {nativePublicCatalog}=
  require('./agent2-bilateral-multi-basic-retreat-bot.cjs');
const {chooseOwnerSkylinerFundedBenchRetreat}=require(
  './agent2-owner-skyliner-funded-bench-frontier.cjs');
const VERSION='agent2-symmetric-owner-skyliner-free-retreat-original-pass-v1';
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/**
 * At a genuine SimpleTacticsAi Pass, allow a single legal-fee native free
 * Retreat proposal into an already owner-public funded printed attack.
 * The same algorithm applies to both seats with no rank or seed dispatch.
 * @template T
 * @param {()=>T} execute Exact native match action execution.
 * @param {{choose?:Function,observe?:Function,catalog?:object,
 *   SimpleTacticsAi?:Function,RetreatAction?:Function,
 *   Store?:Function,CheckRetreatCostEffect?:Function}} [deps] Test seams.
 * @returns {{result:T,audit:object}} Native result and candidate receipts.
 */
function withBilateralSkylinerFreeRetreat(execute,deps={}){
  assert.equal(typeof execute,'function');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const RetreatAction=deps.RetreatAction??
    native('game/store/actions/game-actions').RetreatAction;
  const Store=deps.Store??native('game/store/store').Store;
  const CheckRetreatCostEffect=deps.CheckRetreatCostEffect??
    native('game/store/effects/check-effects').CheckRetreatCostEffect;
  const catalog=deps.catalog??nativePublicCatalog();
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseOwnerSkylinerFundedBenchRetreat;
  const old=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof old?.value,'function');
  const audit={
    version:VERSION,sameAlgorithmBothSeats:true,
    actorOnlySelection:true,nativeCostPreflight:true,
    originalPassesBySeat:[0,0],
    nominalOffersBySeat:[0,0],nativeZeroCostBySeat:[0,0],
    nativeNonzeroCostVetoBySeat:[0,0],typedRetreatProposalsBySeat:[0,0],
    proposals:[],competitivelyQualifiedGames:0
  };
  function decoder(state,...args){
    const original=old.value.call(this,state,...args);
    if(original?.constructor?.name!=='PassTurnAction'||
       !Number.isSafeInteger(state?.turn)||state.turn<=1||
       (state.activePlayer!==0&&state.activePlayer!==1)||
       state.prompts?.some(p=>p.result===undefined))
      return original;
    const seat=state.activePlayer;
    audit.originalPassesBySeat[seat]++;
    const view=observe(state,seat);
    const offer=choose(view,catalog);
    if(!offer)return original;
    assert.equal(offer.kind,'skyliner-free-retreat');
    assert.ok(Number.isSafeInteger(offer.benchIndex)&&
      offer.benchIndex>=0&&offer.benchIndex<5);
    audit.nominalOffersBySeat[seat]++;
    const before=JSON.stringify(view);
    const checker=new Store({onStateChange(){}});
    checker.state=state;
    const effect=new CheckRetreatCostEffect(state.players[seat]);
    checker.reduceEffect(state,effect);
    assert.equal(JSON.stringify(observe(state,seat)),before,
      'Native Cost Effect changed the actor's source observation');
    const row={
      actorSeat:seat,globalTurn:state.turn,
      active:view.ownPublic.active?.printing??null,
      actualNativeCost:[...effect.cost],
      nativePreflightZero:effect.cost.length===0,
      offer:{...offer},
      outcome:'veto-native-nonzero-cost'
    };
    if(effect.cost.length!==0){
      audit.nativeNonzeroCostVetoBySeat[seat]++;
      audit.proposals.push(row);
      return original;
    }
    audit.nativeZeroCostBySeat[seat]++;
    audit.typedRetreatProposalsBySeat[seat]++;
    row.outcome='typed-retreat-action-pending-Store';
    audit.proposals.push(row);
    return new RetreatAction(state.players[seat].id,offer.benchIndex);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...old,value:decoder
  });
  try{
    return {result:execute(),audit};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decoder);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',old);
  }
}
module.exports={VERSION,withBilateralSkylinerFreeRetreat};
