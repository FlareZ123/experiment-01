'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {buildActorCardCatalog}=
  require('./agent34-actor-only-root-policy.cjs');
const {chooseMultiBasicPaidRetreatInDeckRace}=
  require('./agent2-actor-multi-basic-paid-retreat-frontier.cjs');

const VERSION='agent2-symmetric-owner-visible-multi-basic-retreat-bot-v1';
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/** @returns {object} Public frozen full printed card catalog metadata. */
function nativePublicCatalog(){
  const {CardManager}=native('game/cards/card-manager');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {Stage,EnergyType,CardType,TrainerType,SpecialCondition}=
    native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  return buildActorCardCatalog(CardManager.getInstance().getAllCards(),{
    PokemonCard,EnergyCard,TrainerCard,Stage,EnergyType,CardType,TrainerType,
    PowerType,SpecialCondition
  });
}

/**
 * Identical decision algorithm for both seats; takes only the owner's
 * detached frozen observation and a public printing catalog.
 * On a genuine existing bot Pass, may produce a typed RetreatAction.
 * No source rank, seed, current turn or card identity is hardcoded.
 *
 * @template T
 * @param {()=>T} execute Native match.
 * @param {{SimpleTacticsAi?:Function,RetreatAction?:Function,
 *   observe?:Function,catalog?:object,choose?:Function}} deps Test seam.
 * @returns {{result:T,audit:object}}
 */
function withBilateralMultiBasicPaidRetreat(execute,deps={}){
  assert.equal(typeof execute,'function');
  const {SimpleTacticsAi}=deps.SimpleTacticsAi?
    {SimpleTacticsAi:deps.SimpleTacticsAi}:
    native('simple-bot/simple-tactics-ai');
  const {RetreatAction}=deps.RetreatAction?
    {RetreatAction:deps.RetreatAction}:
    native('game/store/actions/game-actions');
  const catalog=deps.catalog??nativePublicCatalog();
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseMultiBasicPaidRetreatInDeckRace;
  const old=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof old?.value,'function');
  const audit={
    version:VERSION,algorithmSameForBothSeats:true,
    proposerIdentityIndependent:true,neverReadOpposingConcealedZones:true,
    originalPassesBySeat:[0,0],nominalOffersBySeat:[0,0],
    chosenTypedRetreatsBySeat:[0,0],proposedActions:[],
    nativePhysicalPaymentVerifiedHere:false,competitivelyQualifiedGames:0
  };

  function ownerDecoder(state,...args){
    const original=old.value.call(this,state,...args);
    if(original?.constructor?.name!=='PassTurnAction'||
       !Number.isSafeInteger(state?.turn)||state.turn<=1||
       (state.activePlayer!==0&&state.activePlayer!==1)||
       state.prompts?.some(p=>p.result===undefined))
      return original;
    const seat=state.activePlayer;
    audit.originalPassesBySeat[seat]++;
    const view=observe(state,seat);
    const intent=choose(view,catalog);
    if(!intent)return original;
    assert.equal(intent.kind,'paid-retreat');
    assert.ok(Number.isSafeInteger(intent.benchIndex)&&
      intent.benchIndex>=0&&intent.benchIndex<5);
    audit.nominalOffersBySeat[seat]++;
    audit.chosenTypedRetreatsBySeat[seat]++;
    audit.proposedActions.push({
      actorSeat:seat,globalTurn:state.turn,
      proposal:'PassTurnAction',chosen:'RetreatAction',
      intent:{...intent},
      ownerActive:view.ownPublic.active?.printing??null,
      opponentActive:view.opponentPublic.active?.printing??null,
      ownerDeckCount:view.ownPublic.deckCount,
      opponentDeckCount:view.opponentPublic.deckCount
    });
    return new RetreatAction(state.players[seat].id,intent.benchIndex);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...old,value:ownerDecoder});
  try{
    return {result:execute(),audit};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      ownerDecoder);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',old);
  }
}
module.exports={VERSION,nativePublicCatalog,
  withBilateralMultiBasicPaidRetreat};
