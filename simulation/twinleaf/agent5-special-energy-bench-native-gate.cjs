'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('./agent5-owner-root-slice.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));
const SPECIAL='Double Dragon Energy ROS';
const TARGET='Regidrago V SIT';

/**
 * Staged physical setup for a real Store root in each seat. It demonstrates
 * that an owner-visible Bench Energy choice produces the specific native
 * physical Bench transition. It is deliberately not a natural source deal.
 * @param {0|1} seat Physical acting-owner seat.
 * @returns {object} Native root receipt and bounded public-zone snapshots.
 */
function verifyNativeBenchSpecial(seat){
  assert.ok(seat===0||seat===1);
  const manager=initializeCards();
  let nextId=1;
  const card=printing=>{
    const found=manager.getCardByName(printing);
    assert.ok(found,'Missing pinned card printing '+printing);
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
  const owner=new Player();
  owner.id=101;owner.name='staged Special Energy owner';
  owner.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  owner.bench[1].cards.push(card(TARGET));
  owner.hand.cards.push(card(SPECIAL));
  const opponent=new Player();
  opponent.id=202;opponent.name='staged public opponent';
  opponent.active.cards.push(card('Pidgey MEW'));
  for(const p of [owner,opponent]){
    p.deck.cards.push(card('Psychic Energy SVE'));
    for(let j=0;j<6;j++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const types={
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType
  };
  const catalog=buildActorCardCatalog(manager.getAllCards(),types);
  const observation=actorObservation(state,seat);
  const baseline=chooseActorRootIntent(observation,catalog);
  const intent=chooseActorRootIntent(observation,catalog,{
    publicContextSpecialEnergy:true
  });
  assert.deepEqual(intent,{
    kind:'attach-special-energy',printing:SPECIAL,handIndex:0,
    slot:'bench',index:1
  },'Owner observation must select printed Double Dragon on Regidrago Bench');
  const before=rootPhysicalSnapshot(state,seat,intent);
  assert.equal(rootPhysicalWitness(intent,before,before,GamePhase),
    'no-confirmed-public-effect');
  const activeBefore=owner.active.energies.cards.length;
  store.dispatch(new PlayCardAction(owner.id,intent.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:intent.index
  }));
  const after=rootPhysicalSnapshot(store.state,seat,intent);
  assert.equal(rootPhysicalWitness(intent,before,after,GamePhase),
    'confirmed-public-effect','True Store Bench attachment must be witnessed');
  assert.equal(owner.bench[1].energies.cards.length,1);
  assert.equal(owner.bench[1].energies.cards[0].fullName,SPECIAL);
  assert.equal(owner.active.energies.cards.length,activeBefore);
  assert.equal(owner.hand.cards.some(c=>c.fullName===SPECIAL),false);
  assert.equal(store.state.turn,2,'Attachment does not terminate owner turn');
  assert.equal(store.state.activePlayer,seat);
  assert.equal(store.hasPrompts(),false,
    'Printed Double Dragon should not introduce a search prompt');
  return {
    seat,pinnedEngineCommit:PIN,stagedPhysicalPosition:true,
    nativeStoreAction:'PlayCardAction',nativeAccepted:true,
    baselineChoice:baseline.kind,optInChoice:intent.kind,
    intent,physicalWitness:'confirmed-public-effect',
    activeEnergyUnchanged:true,
    intendedBenchEnergy:owner.bench[1].energies.cards.map(c=>c.fullName),
    before,after
  };
}

/** @returns {object} */
function run(){
  const records=[verifyNativeBenchSpecial(0),verifyNativeBenchSpecial(1)];
  return {schema:'agent5-pinned-native-bench-special-energy-receipt-v1',
    pinnedEngineCommit:PIN,ownerSeats:[0,1],records,
    competitiveQualifiedGames:0,
    limitations:'Staged genuine Store attachment and public target witness. No natural field deal, opponent reply, settled competitive game or demonstrated win rate.'};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={PIN,SPECIAL,TARGET,verifyNativeBenchSpecial,run};
