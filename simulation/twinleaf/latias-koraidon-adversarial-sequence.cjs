'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
function load(name) { return require(path.join(compiled, name)); }

/**
 * Source-card-accurate, prepared-board response from the rank-10 matchup:
 * Latias ex with exactly three Psychic attached uses Eon Blade onto undamaged
 * Koraidon ex with one Double Dragon Energy and Muscle Band. Koraidon, if
 * still active, then uses Retribution Strike against Latias the next turn.
 * This bypasses setup/search and actual bot decisions; it is a rule fixture.
 * @returns {object} Real Store actions, prompts, KO and Prize observations.
 */
function latiasKoraidonResponseContract() {
  const cards = initializeCards();
  /** @param {string} fullName */
  function card(fullName) {
    const result = cards.getCardByName(fullName);
    assert.ok(result, 'Missing exact engine printing ' + fullName);
    return result;
  }
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { CardList } = load('game/store/state/card-list');
  const { PokemonCardList } = load('game/store/state/pokemon-card-list');
  const { GamePhase } = load('game/store/state/state');
  const { Format } = load('game/store/card/card-types');
  const { PlayerType, SlotType, PlayCardAction } = load('game/store/actions/play-card-action');
  const { AttackAction } = load('game/store/actions/game-actions');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const candidate = new Player();
  candidate.id = 101;
  candidate.name = 'Temple candidate';
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'Source rank-10 Regidrago';
  state.players = [candidate, opponent];
  state.activePlayer = 0;
  state.turn = 6;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  for (const side of state.players) {
    side.prizes = Array.from({length:6}, () => {
      const prize = new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
    side.deck.cards.push(card('Psychic Energy MEE'), card('Grass Energy SVE'));
  }

  const latias = card('Latias ex SSP');
  candidate.active.cards.push(latias);
  for (let i = 0; i < 2; i++) {
    const psychic = card('Psychic Energy MEE');
    candidate.active.cards.push(psychic);
    candidate.active.energies.cards.push(psychic);
  }
  candidate.hand.cards.push(card('Psychic Energy MEE'));
  const spare = new PokemonCardList();
  const lele = card('Tapu Lele-GX GRI');
  spare.cards.push(lele);
  candidate.bench.push(spare);
  candidate.stadium.cards.push(card('Sky Field ROS'));

  const koraidon = card('Koraidon ex TEF');
  opponent.active.cards.push(koraidon);
  const dragonEnergy = card('Double Dragon Energy ROS');
  opponent.active.cards.push(dragonEnergy);
  opponent.active.energies.cards.push(dragonEnergy);
  opponent.active.tools.push(card('Muscle Band XY'));
  const oppSpare = new PokemonCardList();
  oppSpare.cards.push(card('Dratini OBF'));
  opponent.bench.push(oppSpare);

  const energyAction = new PlayCardAction(candidate.id, 0, {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
  });
  store.dispatch(energyAction);
  assert.equal(candidate.active.energies.cards.length, 3);

  /** @returns {string[]} Resolved real pending reducer prompts. */
  function settle() {
    const trace = [];
    for (let i = 0; i < 30; i++) {
      const pending = state.prompts.find(p => p.result === undefined);
      if (!pending) return trace;
      const type = pending.constructor.name;
      let answer;
      if (type === 'WaitPrompt') {
        answer = null;
      } else if (type === 'ChoosePrizePrompt') {
        const side = state.players.find(p => p.id === pending.playerId);
        assert.ok(side);
        answer = side.prizes.filter(p => p.cards.length)
          .slice(0,pending.options.count);
      } else if (type === 'ChoosePokemonPrompt') {
        const side = state.players.find(p => p.id === pending.playerId);
        const replacement = side.bench.find(slot => slot.getPokemonCard());
        assert.ok(replacement, 'Knocked Out Active requires a Bench promotion');
        answer = [replacement];
      } else {
        throw new Error('Unexpected prompt type: '+type);
      }
      assert.ok(pending.validate(answer, state), 'Invalid response to '+type);
      trace.push(type);
      store.dispatch(new ResolvePromptAction(pending.id,answer));
    }
    throw new Error('Unsettled Store prompts after 30 actions');
  }

  const initialCandidatePrizes = candidate.getPrizeLeft();
  const initialOpponentPrizes = opponent.getPrizeLeft();
  store.dispatch(new AttackAction(candidate.id,'Eon Blade'));
  // The engine defers Eon Blade damage until a real WaitPrompt resolves.
  const candidatePrompts = settle();
  const koraidonDamage = opponent.active.damage;
  assert.equal(koraidonDamage,200,'Eon Blade must deal printed 200 to Koraidon ex');
  assert.equal(state.activePlayer,1,'Attack should advance the turn to Koraidon player');
  assert.equal(opponent.active.getPokemonCard(),koraidon);
  assert.equal(opponent.active.damage,200,'Koraidon should survive Eon Blade at 30 HP');

  store.dispatch(new AttackAction(opponent.id,'Retribution Strike'));
  const opponentPrompts = settle();
  // The attacking Koraidon has twenty damage counters. Card-text calculation
  // is 20 base + 200 counter bonus + 20 Muscle Band, or 240 pre-Weakness.
  // The actual reducer assertion below is the complete Knock Out and Prize
  // sequence, avoiding an incomplete pre-Wait snapshot.
  const predictedRetaliationDamage = 240;
  assert.equal(candidate.discard.cards.includes(latias),true,
    '240 damage should Knock Out printed-HP Latias ex');
  assert.equal(candidate.active.getPokemonCard(),lele,
    'Opponent KO should promote the candidate Bench Pokémon');
  assert.equal(opponent.getPrizeLeft(),initialOpponentPrizes-2,
    'Opponent takes exactly two Prizes for Latias ex');
  assert.equal(candidate.getPrizeLeft(),initialCandidatePrizes);

  return {
    evidenceType:'conditioned-pinned-store-two-declared-attacks-v1',
    sourceOpponentRank:10,
    printedCards:['Latias ex SSP 76','Koraidon ex TEF 120',
      'Double Dragon Energy ROS 97','Muscle Band XY 121'],
    firstAttack:{
      name:'Eon Blade',
      directDamageToKoraidon:koraidonDamage,
      KoraidonHpAfter:230-koraidonDamage,
      deferredPrompts:candidatePrompts
    },
    secondAttack:{
      name:'Retribution Strike',
      cardTextPredictedDamageToLatias:predictedRetaliationDamage,
      latiasKnockedOut:true,
      opponentPrizesTaken:initialOpponentPrizes-opponent.getPrizeLeft(),
      candidatePromoted:'Tapu Lele-GX',
      deferredPrompts:opponentPrompts
    },
    sourceQualification:'Prepared resource and board state; no recorded source match-state rewind, opening probability or qualified policy.'
  };
}

if (require.main === module)
  process.stdout.write(JSON.stringify(latiasKoraidonResponseContract(),null,2)+'\n');
module.exports={latiasKoraidonResponseContract};
