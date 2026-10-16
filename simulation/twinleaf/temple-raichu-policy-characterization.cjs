'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu, publishedRaichuEnergies, providedEnergy} =
  require('./temple-raichu-board.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/** @param {string} scenario */
function preparedStadiumResponse(scenario) {
  const {CardList} = load('game/store/state/card-list');
  const fixture = stagedRaichu(['Unit Energy LPM UPR'], 'Temple of Sinnoh ASR');
  fixture.state.turn = 4;
  for (const player of [fixture.a, fixture.b]) {
    player.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(fixture.card('Dratini OBF'));
      return prize;
    });
    player.deck.cards.push(fixture.card('Dratini OBF'));
  }
  if (scenario === 'direct-pokestop') {
    fixture.a.hand.cards.push(fixture.card('PokéStop PGO'));
  } else if (scenario === 'secret-box-three-expired-vip') {
    fixture.a.hand.cards.push(fixture.card('Secret Box TWM'));
    for (let n = 0; n < 3; n += 1) {
      fixture.a.hand.cards.push(fixture.card('Battle VIP Pass FST'));
    }
    fixture.a.deck.cards.push(fixture.card('PokéStop PGO'));
  } else {
    throw new Error('Unsupported response test scenario: ' + scenario);
  }
  return fixture;
}

/** @param {ReturnType<typeof preparedStadiumResponse>} fixture */
function simplePolicyAction(fixture) {
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const definitions = load('simple-bot/simple-bot-definitions');
  const ai = new SimpleTacticsAi({id: fixture.a.id}, {
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: definitions.defaultArbiterOptions
  }, null);
  const action = ai.decodeNextAction(fixture.state);
  return {
    action: action?.constructor.name || null,
    card: action?.constructor.name === 'PlayCardAction' ?
      fixture.a.hand.cards[action.handIndex]?.fullName || null : null,
    rawAction: action
  };
}

/**
 * Record the pinned generic bot's actual choice between Temple response
 * and pass/other action. This test characterizes policy, not match quality.
 */
function inspectRaichuStadiumPolicy() {
  const sources = publishedRaichuEnergies();
  assert.deepEqual(sources.map(row => row.rank), [4, 17]);
  const direct = preparedStadiumResponse('direct-pokestop');
  const directChoice = simplePolicyAction(direct);
  assert.ok(directChoice.rawAction, 'SimpleTacticsAi must return a legal next action');
  const secret = preparedStadiumResponse('secret-box-three-expired-vip');
  const secretChoice = simplePolicyAction(secret);
  assert.ok(secretChoice.rawAction, 'SimpleTacticsAi must return a legal next action');
  const {CardType} = load('game/store/card/card-types');
  assert.deepEqual(providedEnergy(secret).map(row => row.provides), [[CardType.COLORLESS]],
    'Blocked Electro Rain source must actually require Stadium removal');

  // An Item play is lawful here: Battle VIP Pass is dead after the first turn
  // and can pay Secret Box's three-card discard requirement.
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const target = {player: PlayerType.ANY, slot: SlotType.BOARD, index: 0};
  const manual = new PlayCardAction(secret.a.id, 0, target);
  secret.store.dispatch(manual);
  const prompt = secret.state.prompts.find(p => p.result === undefined);
  assert.ok(prompt, 'Manual Secret Box line must present a legal discard prompt');

  return {
    board: 'UNM Alolan Raichu + Unit Energy LPM facing Temple, no other playables',
    directStadiumInHand: {action: directChoice.action, card: directChoice.card},
    sourceRealisticSecretBoxHand: {
      expiredBattleVipPass: 3,
      deckStadium: 'PokéStop PGO',
      botAction: secretChoice.action,
      botCard: secretChoice.card,
      manualSecretBoxDispatchPrompts: prompt.constructor.name
    },
    scope: 'Injected turn-four board with source-representable cards; generic bot decision, not competitive policy'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(inspectRaichuStadiumPolicy(), null, 2));
}
module.exports = {preparedStadiumResponse, simplePolicyAction, inspectRaichuStadiumPolicy};
