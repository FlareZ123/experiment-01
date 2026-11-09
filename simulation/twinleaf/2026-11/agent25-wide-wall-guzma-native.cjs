'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../headless.cjs');
const OUT = path.resolve(__dirname, '../../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUT, name));

/**
 * Conditioned midgame, native-Store Guzma counteraction against Vileplume.
 * The visible board is artificial and does not represent a natural game.
 * The test checks a paper-necessary tactical interaction and physical
 * action settlement on both actual physical seats.
 * @param {{candidateSeat:0|1,wideWall:boolean}} options
 * @returns {object}
 */
function probe({candidateSeat, wideWall}) {
  const {Store} = native('game/store/store');
  const {Player} = native('game/store/state/player');
  const {PokemonCardList} = native('game/store/state/pokemon-card-list');
  const {CardList} = native('game/store/state/card-list');
  const {GamePhase} = native('game/store/state/state');
  const {Format} = native('game/store/card/card-types');
  const {PlayCardAction, PlayerType, SlotType} =
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    native('game/store/actions/resolve-prompt-action');

  const manager = initializeCards();
  let serial = 895000 + 1000 * candidateSeat + Number(wideWall) * 100;
  const make = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Pinned native Store lacks '+name);
    card.id = serial++;
    return card;
  };
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const candidate = new Player(), opponent = new Player();
  candidate.id = 501;
  candidate.name = 'Wide Wall Sentinel';
  opponent.id = 502;
  opponent.name = 'Original rank1 conditional counteraction';
  state.players = candidateSeat === 0 ?
    [candidate, opponent] : [opponent, candidate];
  state.activePlayer = 1 - candidateSeat;
  state.turn = 5;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  candidate.active.cards.push(make('Rhyhorn SCR'), make('Rhydon SCR'));
  if (wideWall) candidate.active.cards.push(make('Rhyperior SCR'));
  candidate.active.pokemonPlayedTurn = 1;

  const vile = new PokemonCardList();
  vile.cards.push(make('Oddish UNB'), make('Gloom UNB'),
    make('Vileplume AOR'));
  vile.pokemonPlayedTurn = 1;
  candidate.bench.push(vile);
  opponent.active.cards.push(make('Shadow Rider Calyrex V CRE'));
  opponent.active.pokemonPlayedTurn = 1;
  const mimikyu = new PokemonCardList();
  mimikyu.cards.push(make('Mimikyu GRI'));
  mimikyu.pokemonPlayedTurn = 1;
  opponent.bench.push(mimikyu);
  opponent.hand.cards.push(make('Guzma BUS'));
  for (const player of [candidate, opponent]) {
    for (let i = 0; i < 6; i++) {
      const zone = new CardList();
      zone.cards.push(make('Psychic Energy SVE'));
      player.prizes.push(zone);
    }
    for (let i = 0; i < 8; i++)
      player.deck.cards.push(make('Psychic Energy SVE'));
  }

  assert.equal(candidate.active.getPokemonCard().fullName,
    wideWall ? 'Rhyperior SCR' : 'Rhydon SCR');
  assert.equal(candidate.bench[0].getPokemonCard().fullName,'Vileplume AOR');
  assert.equal(opponent.active.getPokemonCard().fullName,
    'Shadow Rider Calyrex V CRE');
  assert.equal(opponent.hand.cards[0].fullName,'Guzma BUS');

  let playError = null, promptError = null;
  try {
    store.dispatch(new PlayCardAction(opponent.id, 0,
      {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0}));
  } catch (error) {
    playError = String(error.message);
  }

  let firstPrompt = store.state.prompts.find(p => p.result === undefined);
  const firstPromptType = firstPrompt?.constructor.name ?? null;
  let vileOffered = false;
  if (firstPromptType === 'ChoosePokemonPrompt') {
    const newCandidate = store.state.players[candidateSeat];
    const target = newCandidate.bench.find(b =>
      b.getPokemonCard()?.fullName === 'Vileplume AOR');
    if (target) {
      vileOffered = firstPrompt.validate([target], store.state) === true;
      if (vileOffered) {
        try {
          store.dispatch(new ResolvePromptAction(firstPrompt.id, [target]));
        } catch (error) {
          promptError = String(error.message);
        }
      }
    }
  }
  const latest = store.state;
  let secondPrompt = latest.prompts.find(p => p.result === undefined);
  if (secondPrompt?.constructor.name === 'ChoosePokemonPrompt' &&
    latest.players[candidateSeat].active.getPokemonCard()?.fullName ===
      'Vileplume AOR') {
    const ownMimikyu = latest.players[1-candidateSeat].bench.find(b =>
      b.getPokemonCard()?.fullName === 'Mimikyu GRI');
    assert.ok(ownMimikyu);
    assert.equal(secondPrompt.validate([ownMimikyu],latest),true);
    store.dispatch(new ResolvePromptAction(secondPrompt.id,[ownMimikyu]));
  }
  const now = store.state;
  const after = {
    candidateActive: now.players[candidateSeat].active.getPokemonCard()?.fullName,
    candidateVileplumeStillBenched: now.players[candidateSeat].bench.some(b =>
      b.getPokemonCard()?.fullName === 'Vileplume AOR'),
    opponentActive: now.players[1-candidateSeat].active.getPokemonCard()?.fullName,
    supporterPlayedTurn: now.players[1-candidateSeat].supporterTurn,
    opponentHeldGuzma: now.players[1-candidateSeat].hand.cards.some(c =>
      c.fullName === 'Guzma BUS')
  };
  const settledGust = after.candidateActive === 'Vileplume AOR' &&
    after.opponentActive === 'Mimikyu GRI';
  if (wideWall) {
    assert.equal(settledGust,false,
      'Rhyperior Wide Wall must prevent the Guzma-forced Vileplume activation');
    assert.equal(after.candidateActive,'Rhyperior SCR');
    assert.equal(after.candidateVileplumeStillBenched,true);
  } else {
    assert.equal(settledGust,true,
      'No-Wide-Wall native negative control must complete genuine Guzma gust');
    assert.equal(after.candidateVileplumeStillBenched,false);
  }
  return {
    candidateSeat,wideWall,playError,promptError,
    firstPromptType,vileOffered,settledGust,after,
    actualNativeStore:true,
    completePrintedSixties:false,
    competitivelyQualifiedGames:0
  };
}

/** @returns {object} */
function run() {
  const rows=[];
  for (const seat of [0,1]) {
    for (const wideWall of [false,true])
      rows.push(probe({candidateSeat:seat,wideWall}));
  }
  assert.equal(rows.length,4);
  return {
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    fixture:'synthetic, deliberately staged, actual pinned Store actions',
    rows,competitivelyQualifiedGames:0
  };
}

module.exports={probe,run};
if (require.main === module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
