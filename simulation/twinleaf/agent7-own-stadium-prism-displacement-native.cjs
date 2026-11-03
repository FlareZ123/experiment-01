'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { stageForcedActive, settleNative } =
  require('./agent5-forced-active-marshadow-chain-native.cjs');
const { actorObservation } = require('./actor-observation-contract.cjs');

const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const { ActionEnumerator } = require(path.join(OUT, 'advanced-bot/action-enumerator'));
const { PlayCardAction, PlayerType, SlotType } =
  require(path.join(OUT, 'game/store/actions/play-card-action'));
const TARGET = { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 };
const CASES = Object.freeze([
  Object.freeze({
    id: 'rank6-own-prism',
    original: 'Wondrous Labyrinth Prism Star TEU',
    replacement: 'Thunder Mountain Prism Star LOT',
    destination: 'lostZone'
  }),
  Object.freeze({
    id: 'rank9-own-ordinary',
    original: 'PokéStop PGO',
    replacement: 'Silent Lab PRC',
    destination: 'discard'
  })
]);

/**
 * Actual pinned Store owner-Stadium replacement, independent of native action
 * enumeration. These are constructed mechanics controls derived from genuine
 * original source Stadium identities, not recovered game states or outcomes.
 * @param {0|1} seat
 * @param {{id:string,original:string,replacement:string,destination:string}} fixture
 */
function runArm(seat, fixture) {
  const x = stageForcedActive(seat, 'floatstone');
  const manager = initializeCards();
  let nextId = 62000;
  const card = printing => {
    const item = manager.getCardByName(printing);
    assert.ok(item, 'Missing pinned native printing: ' + printing);
    item.id = nextId++;
    return item;
  };

  x.owner.hand.cards.length = 0;
  x.owner.stadium.cards.length = 0;
  x.opponent.stadium.cards.length = 0;
  x.owner.stadiumPlayedTurn = 0;

  x.owner.stadium.cards.push(card(fixture.original));
  x.owner.hand.cards.push(card(fixture.replacement));
  const originalTurn = x.state.turn;
  const before = actorObservation(x.state, seat);
  assert.deepEqual(before.ownPublic.stadium, [fixture.original]);
  assert.deepEqual(before.opponentPublic.stadium, []);
  assert.deepEqual(before.ownHand, [fixture.replacement]);

  const offered = new ActionEnumerator()
    .enumerate(x.state, x.owner, x.owner.id)
    .some(action => action instanceof PlayCardAction && action.handIndex === 0);
  assert.equal(offered, false,
    'Pinned enumerator own-Stadium false-negative must remain observable');

  const action = new PlayCardAction(x.owner.id, 0, TARGET);
  x.store.dispatch(action);
  const prompts = settleNative(x, false);
  const after = actorObservation(x.state, seat);
  const toLostZone = after.ownPublic.lostZone.includes(fixture.original);
  const toDiscard = after.ownPublic.discard.includes(fixture.original);

  assert.deepEqual(after.ownPublic.stadium, [fixture.replacement]);
  assert.ok(!after.ownHand.includes(fixture.replacement));
  assert.equal(x.state.turn, originalTurn);
  assert.equal(x.state.activePlayer, seat);
  assert.equal(x.owner.stadiumPlayedTurn, originalTurn);
  assert.equal(toLostZone, fixture.destination === 'lostZone');
  assert.equal(toDiscard, fixture.destination === 'discard');
  assert.deepEqual(after.opponentPublic.stadium, []);
  assert.deepEqual(prompts, []);

  return {
    seat,
    scenario: fixture.id,
    success: true,
    original: fixture.original,
    replacement: fixture.replacement,
    nativeEnumeratorOffered: offered,
    directStorePlayAccepted: true,
    previousStadiumDestination: fixture.destination,
    previousStadiumInLostZone: toLostZone,
    previousStadiumInDiscard: toDiscard,
    ownerStadiumNow: after.ownPublic.stadium,
    sameTurnPreserved: true
  };
}

function run() {
  const rows = [];
  for (const seat of [0, 1]) {
    for (const fixture of CASES) {
      try {
        rows.push(runArm(seat, fixture));
      } catch (error) {
        rows.push({
          seat,
          scenario: fixture.id,
          success: false,
          error: String(error?.stack ?? error)
        });
      }
    }
  }
  return {
    schema: 'agent7-own-stadium-prism-displacement-native-v1',
    enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    attempted: rows.length,
    passed: rows.filter(row => row.success).length,
    rows,
    originalSourceGames: 0,
    competitiveQualifiedGames: 0,
    scope: 'Constructed two-seat native Store mechanics, not a selected policy or ranked game.'
  };
}

if (require.main === module) {
  const result = run();
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (result.passed !== result.attempted) process.exitCode = 1;
}

module.exports = { CASES, run, runArm };
