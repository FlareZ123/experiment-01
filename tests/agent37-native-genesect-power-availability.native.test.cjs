'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=
  require('../simulation/twinleaf/headless.cjs');
const {nativeGenesectPowerAvailability}=
  require('../simulation/twinleaf/agent37/native-genesect-power-availability.cjs');
const {chooseGenesectFusionDraw}=
  require('../simulation/twinleaf/agent37-genesect-public-fusion-draw.cjs');

const engine=p=>require(path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output',p));

/** @param {{seat:0|1,active:string,removeLock?:boolean}} options */
function nativeBoard(options){
  const catalog=initializeCards();
  let id=1000;
  const printing=name=>{
    const c=catalog.getCardByName(name);
    assert.ok(c,'Missing native printed '+name);
    c.id=++id;
    return c;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=101;
  opponent.id=202;
  owner.active.cards.push(printing('Mew V FST'));
  const genesect=printing('Genesect V FST');
  const bench=new PokemonCardList();
  bench.cards.push(genesect);
  owner.bench.push(bench);
  opponent.active.cards.push(printing(options.active));
  const state=store.state;
  state.players=options.seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=options.seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const ownerView={
    decisionKind:'owner-root',actorSeat:options.seat,globalTurn:4,ownHand:[],
    ownPublic:{deckCount:16,active:{printing:'Mew V FST',abilities:[]},
      bench:[{printing:'Genesect V FST',abilities:['Fusion Strike System']}]
    },opponentPublic:{active:{printing:options.active}}
  };
  return {store,state,owner,opponent,genesect,ownerView,printing};
}

test('native Genesect available in unlocked positions, both physical seats',()=>{
  for(const seat of [0,1]){
    const board=nativeBoard({seat,active:'Pidgey MEW'});
    const slots=nativeGenesectPowerAvailability(board.state,board.store,seat);
    assert.deepEqual(slots,[{position:'bench',benchIndex:0}]);
    const choice=chooseGenesectFusionDraw(board.ownerView,{
      availableNativeSlots:slots
    });
    assert.equal(choice?.kind,'use-genesect-fusion-draw');
    assert.equal(choice.benchIndex,0);
  }
});

test('native Klefki Mischievous Lock removes Genesect power and owner proposal',()=>{
  for(const seat of [0,1]){
    const board=nativeBoard({seat,active:'Klefki SVI'});
    const slots=nativeGenesectPowerAvailability(board.state,board.store,seat);
    assert.deepEqual(slots,[]);
    assert.equal(chooseGenesectFusionDraw(board.ownerView,{
      availableNativeSlots:slots
    }),null);
    assert.equal(chooseGenesectFusionDraw(board.ownerView)?.kind,
      'use-genesect-fusion-draw',
      'Old naive printing-only selection reproduced the locked power proposal');
  }
});

test('real native Cologne removes Klefki lock and Genesect becomes usable',()=>{
  const board=nativeBoard({seat:0,active:'Klefki SVI'});
  assert.deepEqual(nativeGenesectPowerAvailability(
    board.state,board.store,0),[]);
  const card=board.printing('Canceling Cologne ASR');
  assert.ok(card);
  card.id=41200;
  board.owner.hand.cards.push(card);
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const action=new PlayCardAction(board.owner.id,0,
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  board.store.dispatch(action);
  assert.equal(board.opponent.marker.hasMarker('CANCELING_COLOGNE_MARKER',card),true,
    'Native Cologne must mark the actual opponent player');
  assert.deepEqual(nativeGenesectPowerAvailability(
    board.state,board.store,0),[{position:'bench',benchIndex:0}]);
});

test('power availability exact physical Bench location prevents stale option reuse',()=>{
  const board=nativeBoard({seat:1,active:'Pidgey MEW'});
  const nativeSlots=nativeGenesectPowerAvailability(
    board.state,board.store,1);
  assert.deepEqual(nativeSlots,[{position:'bench',benchIndex:0}]);
  assert.equal(chooseGenesectFusionDraw(board.ownerView,{
    availableNativeSlots:[{position:'bench',benchIndex:1}]
  }),null);
});
