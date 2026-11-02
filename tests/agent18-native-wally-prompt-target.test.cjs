'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,seededRandom,deckPermutation}=require('../simulation/twinleaf/headless.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(OUTPUT,name));

/**
 * Staged full native Wally first-turn-going-second and target-prompt check.
 * This is a deliberately disclosed fake game board, never a match or
 * evidence of a naturally drawn candidate attack.
 * @param {0|1} ownerSeat
 * @returns {{selectedEvolution:string,illegalTargetPassedNativePrompt:boolean,legalTargetPassedNativePrompt:boolean,sourceSeat:number}}
 */
function inspectNativeWally(ownerSeat,selection='legal'){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {GamePhase}=native('game/store/state/state');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {Format,CardTag}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=901;opponent.id=902;
  const card=fullName=>{
    const found=manager.getCardByName(fullName);
    assert.ok(found,'Pinned named card is not implemented: '+fullName);
    return found;
  };
  let serial=1000;
  const put=(zone,fullName)=>{
    const found=card(fullName);
    found.id=serial++;
    zone.cards.push(found);
    return found;
  };
  const legalEgg=put(owner.active,'Exeggcute VIV');
  const wrong=new PokemonCardList();
  const illegalEx=put(wrong,'Mewtwo-EX BKT');
  owner.bench.push(wrong);
  put(opponent.active,'Shadow Rider Calyrex V CRE');
  const wally=put(owner.hand,'Wally ROS');
  const evolution=put(owner.deck,'Exeggutor PLF');
  for(let i=0;i<10;i++){
    put(owner.deck,'Psychic Energy SVE');
    put(opponent.deck,'Psychic Energy SVE');
  }
  state.players=ownerSeat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=ownerSeat;
  state.turn=2; // source's first turn going second, after opponent turn 1
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  assert.equal(owner.hand.cards[0],wally);
  assert.equal(owner.active.getPokemonCard(),legalEgg);
  assert.equal(owner.bench[0].getPokemonCard(),illegalEx);
  assert.equal(illegalEx.hasTag(CardTag.POKEMON_EX),true);
  store.dispatch(new PlayCardAction(owner.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const first=state.prompts.find(p=>p.result===undefined);
  assert.equal(first?.constructor.name,'ChooseCardsPrompt',
    'Wally must search its source deck for one evolution');
  assert.equal(first.playerId,owner.id);
  assert.equal(first.validate([evolution],state),true);
  store.dispatch(new ResolvePromptAction(first.id,[evolution]));
  const second=state.prompts.find(p=>p.result===undefined);
  assert.equal(second?.constructor.name,'ChoosePokemonPrompt',
    'Wally must choose actual physical evolution recipient');
  assert.equal(second.playerId,owner.id);
  const legalTargetPassedNativePrompt=second.validate([owner.active],state);
  const illegalTargetPassedNativePrompt=second.validate([owner.bench[0]],state);
  assert.equal(legalTargetPassedNativePrompt,true,
    'Legal physical Exeggcute VIV must be a valid Wally recipient');
  assert.equal(illegalTargetPassedNativePrompt,true,
    'Pinned Wally target filter unexpectedly repaired; revisit the source-code diagnosis');
  // Staged physical target resolution is assessed before unrelated end-turn
  // checker prompts. Do not treat later CoinFlipPrompt as part of Wally.
  assert.ok(selection==='legal'||selection==='illegal');
  const chosen=selection==='legal'?owner.active:owner.bench[0];
  store.dispatch(new ResolvePromptAction(second.id,[chosen]));
  assert.equal(chosen.getPokemonCard()?.fullName,'Exeggutor PLF',
    'Actual Wally target must receive the selected physical evolution');
  assert.ok(chosen.cards.includes(evolution));
  if(selection==='legal'){
    assert.ok(owner.active.cards.includes(legalEgg));
    assert.equal(owner.bench[0].getPokemonCard()?.fullName,'Mewtwo-EX BKT');
  }else{
    assert.equal(owner.active.getPokemonCard()?.fullName,'Exeggcute VIV');
    assert.ok(owner.bench[0].cards.includes(illegalEx),
      'Actual Store has put Exeggutor above unrelated Mewtwo-EX');
  }
  return {
    sourceSeat:ownerSeat,selection,
    selectedEvolution:'Exeggutor PLF',
    ownerFirstTurnGoingSecond:true,
    legalRecipient:'Exeggcute VIV',
    illegallyStackedExOnWrongPokemon:selection==='illegal',
    invalidRecipient:'Mewtwo-EX BKT',
    legalTargetPassedNativePrompt,illegalTargetPassedNativePrompt,
    disclaimer:'Staged physical native source turn; exact prompt bug witness only, zero competitive matches'
  };
}

test('pinned Wally native accepts legal evolution and also paper-illegal EX target, both seats',()=>{
  for(const seat of [0,1])for(const selection of ['legal','illegal']){
    const row=inspectNativeWally(seat,selection);
    assert.equal(row.illegalTargetPassedNativePrompt,true);
    assert.equal(row.illegallyStackedExOnWrongPokemon,selection==='illegal');
    console.log('AGENT18_WALLY_NATIVE_PROMPT',JSON.stringify(row));
  }
});
