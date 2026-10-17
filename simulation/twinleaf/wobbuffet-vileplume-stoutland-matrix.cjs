'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(root, modulePath));

/**
 * Construct a source-print-aware but deliberately staged Aichi rank-10
 * Wobbuffet/Latias versus rank-2 Vileplume/Stoutland board.
 * This is a mechanical effect witness, not a proof the position is reachable.
 * @param {{vileplumeHood:boolean,stoutlandHood:boolean}} options
 */
function board(options) {
  const cards = initializeCards();
  let nextId = 1;
  /** @param {string} printing */
  const card = printing => {
    const result = cards.getCardByName(printing);
    assert.ok(result, 'Missing pinned engine printing: ' + printing);
    result.id = nextId++;
    return result;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const regidrago = new Player();
  regidrago.id = 101;
  regidrago.name = 'Aichi rank 10 Regidrago';
  const vileplume = new Player();
  vileplume.id = 202;
  vileplume.name = 'Aichi rank 2 Vileplume';
  state.players = [regidrago, vileplume];
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = 0;
  state.gameSettings.format = Format.EXPANDED;

  const wobbuffet = card('Wobbuffet PHF');
  const latias = card('Latias ex SSP');
  regidrago.active.cards.push(wobbuffet);
  const latiasSlot = new PokemonCardList();
  latiasSlot.cards.push(latias);
  regidrago.bench.push(latiasSlot);

  const stoutland = card('Stoutland BCR');
  vileplume.active.cards.push(card('Lillipup CEC'), card('Herdier SUM'), stoutland);
  if (options.stoutlandHood) vileplume.active.tools.push(card('Stealthy Hood UNB'));

  const flower = new PokemonCardList();
  const vileplumeCard = card('Vileplume AOR');
  flower.cards.push(card('Oddish UNB'), card('Gloom UNB'), vileplumeCard);
  if (options.vileplumeHood) flower.tools.push(card('Stealthy Hood UNB'));
  vileplume.bench.push(flower);

  for (const player of state.players) {
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
    for (let i = 0; i < 12; i++) player.deck.cards.push(card('Psychic Energy MEE'));
  }
  return {store,state,regidrago,vileplume,wobbuffet,latias,stoutland,
    vileplumeCard,card};
}

/**
 * Query actual pinned reducer's Ability visibility for the four relevant cards.
 * @param {ReturnType<typeof board>} scenario
 */
function abilities(scenario) {
  const {CheckPokemonPowersEffect} = engine('game/store/effects/check-effects');
  const show = (player,pokemon,name) => {
    const effect = new CheckPokemonPowersEffect(player,pokemon);
    scenario.store.reduceEffect(scenario.state,effect);
    return effect.powers.some(power => power.name === name);
  };
  return {
    bideBarricade:show(scenario.regidrago,scenario.wobbuffet,'Bide Barricade'),
    skyliner:show(scenario.regidrago,scenario.latias,'Skyliner'),
    sentinel:show(scenario.vileplume,scenario.stoutland,'Sentinel'),
    irritatingPollen:show(scenario.vileplume,scenario.vileplumeCard,'Irritating Pollen')
  };
}

/**
 * Test genuine attempted Trainer dispatch on an otherwise identical board.
 * Each attempt has a separate fresh Store because Palace Book ends the turn.
 * @param {{vileplumeHood:boolean,stoutlandHood:boolean}} options
 * @param {string} printing
 */
function attempt(options,printing) {
  const sample = board(options);
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const trainer = sample.card(printing);
  sample.regidrago.hand.cards.push(trainer);
  const priorHand = sample.regidrago.hand.cards.length;
  const priorDeck = sample.regidrago.deck.cards.length;
  try {
    sample.store.dispatch(new PlayCardAction(sample.regidrago.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    return {accepted:true,priorHand,priorDeck,
      hand:sample.regidrago.hand.cards.length,
      deck:sample.regidrago.deck.cards.length};
  } catch(error) {
    assert.ok(sample.regidrago.hand.cards.includes(trainer),
      'Rejected Trainer play must leave the played card in hand');
    return {accepted:false,error:String(error.message)};
  }
}

/** Four-configuration lock matrix with real pinned-engine reducer checks. */
function runMatrix() {
  const rows = [];
  for (const vileplumeHood of [false,true]) {
    for (const stoutlandHood of [false,true]) {
      const options = {vileplumeHood,stoutlandHood};
      const effects = abilities(board(options));
      const item = attempt(options,'Palace Book SMP');
      const supporter = attempt(options,"Professor's Research JTG");
      const expected = {
        bideBarricade:true,
        skyliner:true,
        sentinel:stoutlandHood,
        irritatingPollen:vileplumeHood
      };
      assert.deepEqual(effects,expected,
        'Aichi dual-lock Wobbuffet/Hood reducer discrepancy: '+JSON.stringify(options));
      assert.equal(item.accepted,!vileplumeHood,
        'Item lock response differs from protected Vileplume status');
      assert.equal(supporter.accepted,!stoutlandHood,
        'Supporter lock response differs from protected Stoutland status');
      rows.push({...options,abilities:effects,item,supporter});
    }
  }
  return {
    schema:'aichi-2-vs-10-staged-wobbuffet-hood-lock-v1',
    sourcePrintings:'published ranks 2 and 10, except generic Palace Book Item probe',
    scope:'staged midgame real Store; no setup, policies or completed games',
    qualifiedForCompetitiveInference:false,rows
  };
}

/**
 * Demonstrate the temporary nature of the Bide Barricade escape window.
 * With zero Energy attached, an actual RetreatAction must rely on Psychic
 * Latias ex's Skyliner, then restore the opponent's unprotected locks.
 */
function retreatWindow() {
  const sample = board({vileplumeHood:false,stoutlandHood:false});
  const before = abilities(sample);
  assert.equal(before.sentinel,false);
  assert.equal(before.irritatingPollen,false);
  assert.equal(sample.regidrago.active.energies.cards.length,0);
  const {RetreatAction} = engine('game/store/actions/game-actions');
  sample.store.dispatch(new RetreatAction(sample.regidrago.id,0));
  assert.equal(sample.regidrago.active.getPokemonCard()?.name,'Latias ex');
  assert.equal(sample.regidrago.bench[0].getPokemonCard()?.name,'Wobbuffet');
  const after = abilities(sample);
  assert.equal(after.sentinel,true);
  assert.equal(after.irritatingPollen,true);
  assert.equal(after.skyliner,true);
  return {before,after,
    formerActive:'Wobbuffet PHF',newActive:'Latias ex SSP',
    energyCardsDiscarded:0,
    scope:'real staged Store retreat, no source-dealt turn'};
}

if (require.main === module) process.stdout.write(JSON.stringify(runMatrix(),null,2)+'\n');
module.exports = {board,abilities,attempt,runMatrix,retreatWindow};
