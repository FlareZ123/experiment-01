'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const base = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(base, name));

/**
 * Attempt one ordinary from-hand native evolution with a Basic that has
 * already survived a complete owner turn. No injected PlayPokemonEffect.
 * This is a paper-fidelity diagnostic, never a competitive match.
 * @param {{basic:string,evolution:string,expectedStage:number,turn?:number,playedTurn?:number,evolutionLocked?:boolean}} choice
 * @returns {object} Native Store outcome and actual public board transition.
 */
function probeNativeHandEvolution(choice) {
  const manager = initializeCards();
  const card = name => {
    const result = manager.getCardByName(name);
    assert.ok(result, 'Missing pinned printing '+name);
    return result;
  };
  const {Store} = engine('game/store/store');
  const {State,GamePhase} = engine('game/store/state/state');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');

  const basic = card(choice.basic);
  const evolution = card(choice.evolution);
  assert.equal(evolution.stage, choice.expectedStage,
    'Pinned class stage unexpectedly changed');
  assert.equal(evolution.evolvesFrom,basic.name,
    'Pinned card does not print this evolutionary predecessor');
  const p0 = new Player(),p1 = new Player();
  p0.id=101;p0.name='Evolution probe';
  p1.id=202;p1.name='Passive rival';
  p0.active.cards.push(basic);
  p0.active.pokemonPlayedTurn=choice.playedTurn??1;
  p0.cannotEvolvePokemonCards=choice.evolutionLocked===true;
  p0.hand.cards.push(evolution);
  p1.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  p1.active.pokemonPlayedTurn=1;
  for(const player of [p0,p1]){
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state = new State();
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=choice.turn??3;
  state.activePlayer=0;
  state.players=[p0,p1];
  const store = new Store({onStateChange(){}});
  store.state=state;
  let error=null;
  try {
    store.dispatch(new PlayCardAction(p0.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
  } catch(e) {
    error={name:e.name,message:String(e.message)};
  }
  return {
    basic:choice.basic,evolution:choice.evolution,
    globalTurn:state.turn,playedTurn:p0.active.pokemonPlayedTurn,
    evolutionLocked:choice.evolutionLocked===true,
    basicStage:basic.stage,evolutionStage:evolution.stage,
    printedEvolvesFrom:evolution.evolvesFrom,
    nativeAccepted:error===null,
    evolved:p0.active.getPokemonCard()?.fullName===evolution.fullName,
    handStillContainsEvolution:p0.hand.cards.some(c=>c.fullName===evolution.fullName),
    error
  };
}

/**
 * Distinguish the ordinary from-hand evolution reducer from effects that
 * put Evolution cards into play by another route.
 * @returns {object}
 */
function run() {
  const {Stage}=engine('game/store/card/card-types');
  const choices=[
    {basic:'Shadow Rider Calyrex V CRE',
      evolution:'Shadow Rider Calyrex VMAX CRE',expectedStage:Stage.VMAX},
    {basic:'Regidrago V SIT',
      evolution:'Regidrago VSTAR SIT',expectedStage:Stage.VSTAR},
    {basic:'Trubbish FST',
      evolution:'Garbodor BKP',expectedStage:Stage.STAGE_1}
  ];
  const observed=choices.map(probeNativeHandEvolution);
  for(const row of observed){
    assert.equal(row.evolved,true,'A known legal evolved action failed: '+JSON.stringify(row));
    assert.equal(row.handStillContainsEvolution,false,
      'Successful evolution retained the card in hand');
  }
  return {
    schema:'agent1-pinned-native-hand-evolution-fidelity-v1',
    engineCommit:PIN,
    scope:'actual printed hand PlayCardAction on turn three; no win inference',
    observed,
    allNativeLegal:observed.every(row=>row.nativeAccepted&&row.evolved)
  };
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={PIN,probeNativeHandEvolution,run};
