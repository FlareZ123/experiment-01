'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const base = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const native = location => require(path.join(base, location));
const {Store} = native('game/store/store');
const {State,GamePhase} = native('game/store/state/state');
const {Player} = native('game/store/state/player');
const {PokemonCardList} = native('game/store/state/pokemon-card-list');
const {CardList} = native('game/store/state/card-list');
const {GameSettings} = native('game/core/game-settings');
const {PlayCardAction,PlayerType,SlotType} =
  native('game/store/actions/play-card-action');
const {ResolvePromptAction} =
  native('game/store/actions/resolve-prompt-action');

const VERSION = 'agent48-double-initial-grimer-bench-shake-v1';

/**
 * A staged source-valid original seven with both physical Grimer, choosing
 * one Active and the other Benched. Exercise the pinned native Store's real
 * Boost Shake search, target, shuffle and end-turn process in both seats.
 *
 * The test is a constructed board, not a random-source-dealt full match.
 * @param {0|1} seat The physical candidate seat.
 * @returns {object} Physical card custody and genuine prompt settlement.
 */
function runCase(seat, options = {}) {
  assert.ok(seat === 0 || seat === 1);
  const catalog = initializeCards();
  let nextId = 94000 + seat * 100;
  /** @param {string} fullName @returns {object} */
  const card = fullName => {
    const value = catalog.getCardByName(fullName);
    assert.ok(value, 'Missing pinned printing: ' + fullName);
    value.id = ++nextId;
    return value;
  };
  const candidate = new Player(), source = new Player();
  candidate.id = 2041;source.id = 2042;
  const activeGrimer = card('Alolan Grimer SUM');
  const benchedGrimer = card('Alolan Grimer SUM');
  const muk = card('Alolan Muk SUM');
  const shake = card('Boost Shake EVS');
  candidate.active.cards.push(activeGrimer);
  candidate.active.pokemonPlayedTurn = 1;
  const grimerSlot = new PokemonCardList();
  grimerSlot.cards.push(benchedGrimer);
  grimerSlot.pokemonPlayedTurn = 1;
  candidate.bench.push(grimerSlot);
  let alternativeBench=null;
  if (options.escapeRope && options.extraBench) {
    alternativeBench=new PokemonCardList();
    alternativeBench.cards.push(card('Regidrago V SIT'));
    candidate.bench.push(alternativeBench);
  }
  candidate.hand.cards.push(shake);
  candidate.deck.cards.push(muk,card('Psychic Energy SVE'));
  source.active.cards.push(card('Iron Thorns ex TWM'));
  let sourceRope=null,sourceBench=null;
  if(options.escapeRope){
    sourceRope=card('Escape Rope BST');
    source.hand.cards.push(sourceRope);
    sourceBench=new PokemonCardList();
    sourceBench.cards.push(card('Regidrago V SIT'));
    source.bench.push(sourceBench);
  }
  for(const player of [candidate,source]) {
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let n = 0; n < 6; n++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state = new State(), settings = new GameSettings();
  state.gameSettings = settings;state.rules = settings.rules;
  state.phase = GamePhase.PLAYER_TURN;state.turn = 1;
  state.activePlayer = seat;
  state.players = seat === 0 ? [candidate,source] : [source,candidate];
  const store = new Store({onStateChange(){}});
  store.state = state;
  assert.strictEqual(candidate.active.getPokemonCard(), activeGrimer);
  assert.strictEqual(grimerSlot.getPokemonCard(), benchedGrimer);
  const steps = [];
  store.dispatch(new PlayCardAction(candidate.id,0,
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  steps.push('physical-Boost-Shake-play');
  const search = state.prompts.find(p => p.result === undefined);
  assert.equal(search?.constructor.name, 'ChooseCardsPrompt');
  assert.strictEqual(search.cards, candidate.deck);
  assert.equal(search.validate([muk],state),true);
  store.dispatch(new ResolvePromptAction(search.id,[muk]));
  steps.push('owner-deck-search-native-settled');
  const target = state.prompts.find(p => p.result === undefined);
  assert.equal(target?.constructor.name, 'ChoosePokemonPrompt');
  assert.equal(target.playerId,candidate.id);
  assert.equal(target.validate([grimerSlot],state),true);
  store.dispatch(new ResolvePromptAction(target.id,[grimerSlot]));
  steps.push('benched-Grimer-target-native-settled');
  const shuffle = state.prompts.find(p => p.result === undefined);
  assert.equal(shuffle?.constructor.name,'ShuffleDeckPrompt');
  const sequence = candidate.deck.cards.map((_,i)=>i);
  assert.equal(shuffle.validate(sequence,state),true);
  store.dispatch(new ResolvePromptAction(shuffle.id,sequence));
  steps.push('owner-deck-native-shuffle');
  for(let i=0;i<8;i++) {
    const prompt=state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    assert.equal(prompt.constructor.name,'WaitPrompt');
    assert.equal(prompt.validate(null,state),true);
    store.dispatch(new ResolvePromptAction(prompt.id,null));
    steps.push('native-turn-transition');
  }
  const beforeRope={active:candidate.active.getPokemonCard(),
    benchMuk:grimerSlot.getPokemonCard()};
  const ropePrompts=[];
  if(options.escapeRope){
    assert.equal(state.activePlayer,seat===0?1:0);
    store.dispatch(new PlayCardAction(source.id,0,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    for(let i=0;i<12;i++){
      const pending=state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      if(pending.constructor.name==='WaitPrompt'){
        store.dispatch(new ResolvePromptAction(pending.id,null));
        ropePrompts.push({kind:'WaitPrompt'});
        continue;
      }
      assert.equal(pending.constructor.name,'ChoosePokemonPrompt');
      const selected=pending.playerId===candidate.id?
        (alternativeBench??grimerSlot):sourceBench;
      assert.equal(pending.validate([selected],state),true,
        'Actual source-owned Rope should permit physically selected Bench target');
      store.dispatch(new ResolvePromptAction(pending.id,[selected]));
      ropePrompts.push({kind:'ChoosePokemonPrompt',playerId:pending.playerId,
        selected: selected.getPokemonCard()?.fullName??null});
    }
    assert.equal(source.discard.cards.includes(sourceRope),true);
    assert.deepEqual(state.prompts.filter(p=>p.result===undefined),[]);
  }
  const outcome={
    seat,version:VERSION,initialGrimerInPlay:2,
    activeIsOriginalGrimer: candidate.active.getPokemonCard()===activeGrimer,
    benchedGrimerBecameMuk: grimerSlot.getPokemonCard()===muk,
    activeOriginalGrimerStillPresent: candidate.active.cards.includes(activeGrimer),
    originalBenchedGrimerStillUnderMuk: grimerSlot.cards.includes(benchedGrimer),
    physicalMukLeftDeck:!candidate.deck.cards.includes(muk),
    shakeMovedFromHandToDiscard:
      !candidate.hand.cards.includes(shake)&&candidate.discard.cards.includes(shake),
    ropeTest: options.escapeRope?{
      extraBench: Boolean(options.extraBench),
      nativePromptResponses:ropePrompts,
      preRopeActiveGrimer:beforeRope.active===activeGrimer,
      preRopeBenchedMuk:beforeRope.benchMuk===muk,
      activeAfterRope:candidate.active.getPokemonCard()?.fullName??null,
      keptMukBenched:grimerSlot.getPokemonCard()===muk&&
        candidate.bench.includes(grimerSlot),
      mukForcedActive:candidate.active.getPokemonCard()===muk,
      sourcePhysicalRopeSpent:source.discard.cards.includes(sourceRope)
    }:null,
    pendingPromptClasses:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    steps,turnAfter:state.turn,activeSeatAfter:state.activePlayer,
    stagedPhysicalPosition:true,fullGame:false,paperQualifiedGames:0
  };
  if(options.escapeRope){
    assert.equal(outcome.ropeTest.mukForcedActive,!options.extraBench);
    assert.equal(outcome.ropeTest.keptMukBenched,Boolean(options.extraBench));
  }else assert.equal(outcome.activeIsOriginalGrimer,true);
  assert.equal(outcome.benchedGrimerBecameMuk,true);
  if(!options.escapeRope)
    assert.equal(outcome.activeOriginalGrimerStillPresent,true);
  assert.equal(outcome.originalBenchedGrimerStillUnderMuk,true);
  assert.equal(outcome.physicalMukLeftDeck,true);
  assert.equal(outcome.shakeMovedFromHandToDiscard,true);
  assert.deepEqual(outcome.pendingPromptClasses,[]);
  return outcome;
}

/** @returns {object} */
function run() {
  const rows=[runCase(0),runCase(1)];
  const rope=[
    runCase(0,{escapeRope:true,extraBench:false}),
    runCase(0,{escapeRope:true,extraBench:true}),
    runCase(1,{escapeRope:true,extraBench:false}),
    runCase(1,{escapeRope:true,extraBench:true})
  ];
  return {version:VERSION,attempts:rows.length+rope.length,
    passes:rows.length+rope.length,rows,rope,
    decision:'TWO_BENCH_OPTION_PROTECTS_MUK_FROM_SOURCE_ESCAPE_ROPE',
    paperQualifiedGames:0};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,runCase,run};
