'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceTurn22OwnerReply} =
  require('../simulation/evaluation/agent6-rank11-source-reply-hand.cjs');

function game(seat = 0) {
  return {decisionTrace: [
    {playerSlot: seat, turnBefore: 22, actionOrdinal: 155,
      action: 'PlayCardAction', card: 'Tapu Lele-GX',
      decisionHandBefore: {perspectiveSeat: seat,
        ownHandPrintings: ['Tapu Lele-GX GRI', 'VS Seeker PHF', 'Battle VIP Pass FST']}},
    {playerSlot: seat, turnBefore: 22, actionOrdinal: 156,
      action: 'ResolvePromptAction', decisionHandBefore: {
        perspectiveSeat: seat, ownHandPrintings: ['VS Seeker PHF']}},
    {playerSlot: seat, turnBefore: 22, actionOrdinal: 157,
      action: 'PassTurnAction', decisionHandBefore: {
        perspectiveSeat: seat,
        ownHandPrintings: ['VS Seeker PHF', 'Battle VIP Pass FST']}},
    {playerSlot: 1-seat, turnBefore: 23, actionOrdinal: 162,
      action: 'ResolvePromptAction', decisionHandBefore: {
        perspectiveSeat: 1-seat,
        ownHandPrintings: ['Mysterious Treasure FLI']}}
  ]};
}

test('genuine owner source reply retains printings, no inferred legal Trainer', () => {
  const evidence = sourceTurn22OwnerReply(game(), 0);
  assert.equal(evidence.sourceSeat, 0);
  assert.equal(evidence.actualPassRoot, 157);
  assert.deepEqual(evidence.sourceOwnerHandBeforePass,
    ['VS Seeker PHF', 'Battle VIP Pass FST']);
  assert.equal(evidence.sourceRootDecisionsThroughPass.length, 3);
  assert.equal(evidence.candidatePolicySawSourceHand, false);
  assert.equal(evidence.trainerLegalityCertified, false);
});

test('works for other physical source seat without mixing actors', () => {
  const evidence = sourceTurn22OwnerReply(game(1), 1);
  assert.equal(evidence.sourceSeat, 1);
  assert.equal(evidence.sourceRootDecisionsThroughPass[0].card,
    'Tapu Lele-GX');
});

test('fails closed on missing source Pass', () => {
  const data = game();
  data.decisionTrace.splice(2, 1);
  assert.throws(() => sourceTurn22OwnerReply(data, 0),
    /Missing historical source Pass/);
});

test('fails closed on opponent-owned hidden-hand snapshot', () => {
  const data = game();
  data.decisionTrace[2].decisionHandBefore.perspectiveSeat = 1;
  assert.throws(() => sourceTurn22OwnerReply(data, 0),
    /Expected values to be strictly equal/);
});

test('fails closed on mismatched real PlayCard root', () => {
  const data = game();
  data.decisionTrace[0].card = 'Field Blower';
  assert.throws(() => sourceTurn22OwnerReply(data, 0),
    /Missing historical source Tapu Lele/);
});
