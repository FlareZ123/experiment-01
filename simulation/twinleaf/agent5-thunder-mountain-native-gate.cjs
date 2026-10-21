'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {actorObservation} = require('./actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent} =
  require('./agent34-actor-only-root-policy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness} =
  require('./agent5-owner-root-slice.cjs');

const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const native = file => require(path.join(output,file));

/**
 * Validate the owner-visible Thunder Mountain direct-line decision through a
 * genuine pinned Store. The position is deliberately injected, and the printed
 * rank-6 cards used do not imply that this setup was naturally drawn.
 *
 * @param {0|1} actorSeat Physical source-owner seat.
 * @returns {object} Public-zone pre/post snapshot and Store settlement proof.
 */
function actualNativeStadiumRoot(actorSeat){
  const manager=initializeCards();
  let nextId=1;
  /** @param {string} printing */
  const card=printing=>{
    const found=manager.getCardByName(printing);
    assert.ok(found,'Pinned printing missing: '+printing);
    found.id=nextId++;
    return found;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const source=new Player();
  source.id=101;source.name='Published rank-6 Iron Thorns root';
  source.active.cards.push(card('Iron Thorns ex TWM'));
  const mountain=card('Thunder Mountain Prism Star LOT');
  source.hand.cards.push(mountain);
  const opponent=new Player();
  opponent.id=202;opponent.name='Staged public opponent';
  opponent.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  for(const p of [source,opponent]){
    p.deck.cards.push(card('Psychic Energy SVE'));
    for(let j=0;j<6;j++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=actorSeat===0?[source,opponent]:[opponent,source];
  state.activePlayer=actorSeat;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;

  const nativeTypes={
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType
  };
  const catalog=buildActorCardCatalog(manager.getAllCards(),nativeTypes);
  const view=actorObservation(state,actorSeat);
  const oldIntent=chooseActorRootIntent(view,catalog,{
    thornsDirectLine:false
  });
  const intent=chooseActorRootIntent(view,catalog,{
    thornsDirectLine:true
  });
  assert.equal(intent.kind,'play-thunder-mountain');
  assert.equal(intent.printing,mountain.fullName);
  const before=rootPhysicalSnapshot(store.state,actorSeat,intent);
  const noChange=rootPhysicalWitness(intent,before,before,GamePhase);
  assert.equal(noChange,'no-confirmed-public-effect');
  assert.equal(before.stadiumPrintings.includes(mountain.fullName),false);
  let nativeError=null;
  try {
    store.dispatch(new PlayCardAction(source.id,intent.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  }catch(error){
    nativeError={name:error.name,message:error.message};
  }
  assert.equal(nativeError,null,
    'Native Store rejected known printed Stadium root '+JSON.stringify(nativeError));
  const after=rootPhysicalSnapshot(store.state,actorSeat,intent);
  const effect=rootPhysicalWitness(intent,before,after,GamePhase);
  assert.equal(effect,'confirmed-public-effect',
    'Actual Store did not show the intended public Stadium transition');
  assert.ok(store.state.players[actorSeat].stadium.cards.some(c=>
    c.fullName===mountain.fullName));
  return {
    actorSeat,printedActor:'Iron Thorns ex TWM',
    printedStadium:mountain.fullName,
    originalPolicyChoice:oldIntent.kind,
    optedInChoice:intent.kind,
    nativeRootAccepted:true,
    publicWitness:effect,noOpWitness:noChange,
    before,after,
    privateZonesReadForDecision:false,
    originalPhysicalDeal:false
  };
}

/** @returns {object} */
function run(){
  const records=[actualNativeStadiumRoot(0),actualNativeStadiumRoot(1)];
  assert.equal(records.every(x=>x.publicWitness==='confirmed-public-effect'),true);
  return {
    schema:'agent5-thunder-mountain-pinned-native-root-gate-v1',
    pinnedEngineCommit:PIN,
    stagedPosition:true,
    competitiveQualifiedGames:0,
    records,
    caveat:'Genuine Store Stadium settlement in two injected physical seats; not an authentic source hand/deal, opponent response, completed game, or matchup result.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={PIN,actualNativeStadiumRoot,run};
