'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseOwnerFloatStoneMobility}=
  require('../../simulation/twinleaf/agent1-owner-float-stone-mobility.cjs');
const {publicCatalog}=
  require('../../simulation/twinleaf/agent43-guzma-prompt-continuation.cjs');
const {wouldLoseActivePositionAbility}=
  require('../../simulation/twinleaf/agent47-active-position-retreat-veto.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(output,p));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {RetreatAction}=native('game/store/actions/game-actions');
const {CheckRetreatCostEffect}=native('game/store/effects/check-effects');
const {IS_ABILITY_BLOCKED}=native('game/store/prefabs/prefabs');

/**
 * A physically typed, staged Store root, explicitly NOT a tournament draw.
 * All printed cards are real; only the opening arrangement is constructed.
 * @param {0|1} seat Actual acting seat.
 * @param {boolean} sameLock Whether owner replacement is another Iron Thorns.
 */
function stage(seat,sameLock){
  const manager=initializeCards();
  let id=470000+seat*10000+Number(sameLock)*1000;
  const card=printing=>{
    const found=manager.getCardByName(printing);
    assert.ok(found,'Unimplemented exact printed card '+printing);
    found.id=id++;
    return found;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=731;opponent.id=732;
  const thorns='Iron Thorns ex TWM';
  owner.active.cards.push(card(thorns));
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.bench[0].cards.push(card(sameLock?thorns:'Dedenne-GX UNB'));
  const energy=card('Double Colorless Energy SUM');
  owner.bench[0].cards.push(energy);
  owner.bench[0].energies.cards.push(energy);
  owner.hand.cards.push(card('Float Stone BKT'));
  opponent.active.cards.push(card('Lunatone OBF'));
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  const lele=card('Tapu Lele-GX GRI');
  opponent.bench[0].cards.push(lele);
  for(const player of [owner,opponent]){
    for(let i=0;i<15;i++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;state.turn=5;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,opponent,lele,seat,sameLock,thorns};
}

for(const seat of [0,1])for(const sameLock of [true,false])
test('native Iron Thorns Active-lock handoff seat '+seat+' matching='+sameLock,()=>{
  const x=stage(seat,sameLock);
  const {store,state,owner,opponent,lele,thorns}=x;
  const blockedBefore=IS_ABILITY_BLOCKED(store,state,opponent,lele);
  assert.equal(blockedBefore,true);
  const tool=owner.hand.cards[0];
  store.dispatch(new PlayCardAction(owner.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.ok(owner.active.tools.includes(tool));
  const before=actorObservation(state,seat);
  assert.equal(wouldLoseActivePositionAbility(before,0),!sameLock);
  const catalog=publicCatalog();
  const intent=chooseOwnerFloatStoneMobility(before,catalog);
  assert.equal(intent?.kind??null,
    sameLock?'retreat-emergency-floatstone':null);
  const fee=new CheckRetreatCostEffect(owner);
  store.reduceEffect(state,fee);
  assert.equal(fee.cost.length,0);
  const original=owner.active.getPokemonCard();
  store.dispatch(new RetreatAction(owner.id,0));
  assert.notStrictEqual(owner.active.getPokemonCard(),original);
  assert.strictEqual(owner.bench[0].getPokemonCard(),original);
  assert.ok(owner.bench[0].tools.includes(tool));
  const blockedAfter=IS_ABILITY_BLOCKED(store,state,opponent,lele);
  assert.equal(blockedAfter,sameLock);
  assert.equal(owner.active.getPokemonCard().fullName,
    sameLock?thorns:'Dedenne-GX UNB');
  console.log('AGENT47_NATIVE_LOCK_HANDOFF',JSON.stringify({
    seat,sameLock,blockedBefore,blockedAfter,
    originalActivePrinting:thorns,
    replacementPrinting:owner.active.getPokemonCard().fullName,
    costUnitsAfterFloatStone:fee.cost.length,
    ownerPolicyIntent:intent?.kind??null,
    acceptedRetreat:true,attachedFloatStoneRemainsOnBench:true,
    fakeShuffle:true,competitiveQualifiedGames:0
  }));
});
