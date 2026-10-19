'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=relative=>require(path.join(OUTPUT,relative));

/**
 * Pure source-owner and public-board decision rule.
 * `PlayCardAction` is already chosen by the unmodified bot; only its Tool
 * target may change. Nothing in opponent hidden zones or the source deck is read.
 *
 * @param {object} state Current pinned Store state.
 * @param {object} ordinary Bot-selected PlayCardAction.
 * @param {0|1} sourceSeat Physical rank11 side.
 * @param {{ACTIVE:number,BENCH:number}} slotType
 * @param {{BOTTOM_PLAYER:number}} playerType
 * @returns {number} Existing source Bench index, or -1 when ineligible.
 */
function eligibleGarbodorTarget(state,ordinary,sourceSeat,slotType,playerType) {
  if(ordinary?.type!=='PLAY_CARD_ACTION' ||
      ordinary.target?.player!==playerType.BOTTOM_PLAYER ||
      ordinary.target?.slot!==slotType.ACTIVE ||
      state.activePlayer!==sourceSeat ||
      state.prompts.some(prompt=>prompt.result===undefined)) return -1;
  const owner=state.players[sourceSeat];
  const opposing=state.players[1-sourceSeat];
  if(owner.hand.cards[ordinary.handIndex]?.name!=='Float Stone' ||
      owner.active.getPokemonCard()?.name!=='Mega Absol ex' ||
      opposing.active.getPokemonCard()?.name!=='Mewtwo & Mew-GX') return -1;
  const attached=owner.active.energies.cards;
  if(attached.length>1 || attached.some(card=>card.name!=='Darkness Energy'))
    return -1;
  return owner.bench.findIndex(slot=>
    slot.getPokemonCard()?.name==='Garbodor' && slot.tools.length===0);
}

/**
 * Temporarily retarget rank11's bot-chosen Float Stone from an unpowered
 * Mega Absol ex to the owner's existing Tool-less Benched Garbodor.
 * Full source/candidate decks and all other decisions remain unchanged.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @returns {{result:T,audit:object}}
 */
function withRank11GarbodorToolMaintenance(sourceSeat,execute) {
  if(![0,1].includes(sourceSeat))throw new Error('Invalid source seat');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {GamePhase}=engine('game/store/state/state');
  const previous=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  const audit={attempted:0,events:[],eligibleDecisions:0,sourceSeat};
  const wrapper=function rank11OwnerToolMaintenance(state) {
    const ordinary=previous.value.call(this,state);
    if(state.phase!==GamePhase.PLAYER_TURN ||
        state.players[sourceSeat].id!==this.client?.id ||
        !(ordinary instanceof PlayCardAction)) return ordinary;
    const targetIndex=eligibleGarbodorTarget(
      state,ordinary,sourceSeat,SlotType,PlayerType);
    if(targetIndex<0)return ordinary;
    audit.eligibleDecisions++;
    const owner=state.players[sourceSeat];
    const opponent=state.players[1-sourceSeat];
    const changed=new PlayCardAction(owner.id,ordinary.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:targetIndex
    });
    audit.attempted++;
    audit.events.push({
      globalTurn:state.turn,
      sourceSeat,
      sourcePlayerId:owner.id,
      originalTarget:{...ordinary.target},
      newTarget:{...changed.target},
      card:owner.hand.cards[ordinary.handIndex].fullName,
      sourceActive:owner.active.getPokemonCard()?.fullName??null,
      sourceActiveEnergy:owner.active.energies.cards.map(c=>c.fullName),
      sourceGarbodor:owner.bench[targetIndex].getPokemonCard()?.fullName??null,
      opponentActive:opponent.active.getPokemonCard()?.fullName??null,
      informationBoundary:'acting owner hand + public Active/Bench/Energy/Tool state'
    });
    return changed;
  };
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...previous,value:wrapper});
  try {
    const result=execute();
    return {result,audit};
  }finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,wrapper,
      'Maintenance hook ownership must remain intact through restoration');
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',previous);
  }
}

module.exports={
  eligibleGarbodorTarget,
  withRank11GarbodorToolMaintenance
};
