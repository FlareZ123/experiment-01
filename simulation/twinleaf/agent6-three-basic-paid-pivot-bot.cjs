'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {nativePublicCatalog}=
  require('./agent2-bilateral-multi-basic-retreat-bot.cjs');
const {paidRetreatPublic}=
  require('./agent6-paid-reserve-recipient-hook.cjs');

const VERSION='agent6-owner-only-three-basic-paid-pivot-original-pass-v1';
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/**
 * Same decision rules on both physical seats; only genuine preexisting
 * bot Pass roots are considered. Native RetreatCostEffect is used as a
 * read-only safety veto and never passed into independent owner policy.
 * @template T
 * @param {()=>T} execute Synchronous native game.
 * @param {{SimpleTacticsAi?:Function,RetreatAction?:Function,Store?:Function,
 *   CheckRetreatCostEffect?:Function,observe?:Function,catalog?:object}} deps
 * @returns {{result:T,audit:object}}
 */
function withThreeBasicPaidPivot(execute,deps={}){
  assert.equal(typeof execute,'function');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const RetreatAction=deps.RetreatAction??
    native('game/store/actions/game-actions').RetreatAction;
  const Store=deps.Store??native('game/store/store').Store;
  const CheckRetreatCostEffect=deps.CheckRetreatCostEffect??
    native('game/store/effects/check-effects').CheckRetreatCostEffect;
  const observe=deps.observe??actorObservation;
  const catalog=deps.catalog??nativePublicCatalog();
  const previous=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  const audit={
    version:VERSION,originalPassesBySeat:[0,0],
    ownerNominalOffersBySeat:[0,0],
    nativeExactFeeBySeat:[0,0],
    typedRetreatsBySeat:[0,0],
    proposals:[],sameAlgorithmBothSeats:true,
    competitivelyQualifiedGames:0
  };
  function decode(state,...args){
    const original=previous.value.call(this,state,...args);
    if(original?.constructor?.name!=='PassTurnAction'||
       !Number.isSafeInteger(state?.turn)||state.turn<=1||
       (state.activePlayer!==0&&state.activePlayer!==1)||
       state.prompts?.some(p=>p.result===undefined))
      return original;
    const seat=state.activePlayer;
    audit.originalPassesBySeat[seat]++;
    const view=observe(state,seat);
    const eligible=paidRetreatPublic(view,catalog,3);
    if(!eligible)return original;
    audit.ownerNominalOffersBySeat[seat]++;
    const before=JSON.stringify(view);
    const checker=new Store({onStateChange(){}});
    checker.state=state;
    const effect=new CheckRetreatCostEffect(state.players[seat]);
    checker.reduceEffect(state,effect);
    assert.equal(JSON.stringify(observe(state,seat)),before,
      'native fee calculation altered owner view');
    const cost=effect.cost??[];
    const exact=Array.isArray(cost)&&cost.length===3&&
      cost.every(unit=>unit===catalog.colorlessEnergyType);
    audit.proposals.push({
      seat,turn:state.turn,owner:eligible,
      actualNativeFee:[...cost],exactNativeFee:exact,
      status:exact?'typed-pending-Store':'veto-effective-fee'
    });
    if(!exact)return original;
    audit.nativeExactFeeBySeat[seat]++;
    audit.typedRetreatsBySeat[seat]++;
    return new RetreatAction(
      state.players[seat].id,eligible.fundedBench.benchIndex);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...previous,value:decode});
  try{
    return {result:execute(),audit};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      previous);
  }
}
module.exports={VERSION,withThreeBasicPaidPivot};
