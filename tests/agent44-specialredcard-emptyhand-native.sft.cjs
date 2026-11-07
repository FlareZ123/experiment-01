'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {stage} =
  require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const nativeOutput = path.resolve(__dirname,
  '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name Compiled pinned engine module. */
const native = name => require(path.join(nativeOutput, name));

/**
 * Inspect a genuine pinned Store dispatch from a controlled, explicitly
 * staged original Japanese Special Red Card situation. These states are
 * diagnostic fixtures, not legal tournament setups or competitive games.
 *
 * @param {0|1} seat Physical acting seat.
 * @param {number} opposingPrizes 3 or 4.
 * @param {number} opposingHand 0 or 1.
 */
function inspectNativeSpecialRedCard(seat, opposingPrizes, opposingHand) {
  assert.ok([0,1].includes(seat));
  assert.ok([3,4].includes(opposingPrizes));
  assert.ok([0,1].includes(opposingHand));
  const x = stage(seat);
  const manager = initializeCards();
  const item = manager.getCardByName('Special Red Card M4');
  assert.ok(item, 'Pinned native Japanese source printing unavailable');
  assert.equal(item.name, 'Special Red Card');
  assert.equal(item.fullName, 'Special Red Card M4');
  assert.equal(item.set, 'CRI');
  assert.equal(String(item.setNumber), '82');
  item.id = 840000 + seat*100 + opposingPrizes*10 + opposingHand;
  x.owner.hand.cards.unshift(item);

  for (let i = opposingPrizes; i < 6; i += 1)
    x.opponent.prizes[i].moveTo(x.opponent.deck);
  for (let i = 0; i < opposingHand; i += 1) {
    const held = manager.getCardByName('Psychic Energy SVE');
    assert.ok(held);
    held.id = item.id + 1000 + i;
    x.opponent.hand.cards.push(held);
  }

  const paperEligible = opposingPrizes <= 3 && opposingHand > 0;
  const nativeCanPlay = item.canPlay(x.store, x.store.state, x.owner);
  const snapshotBefore = {
    ownerHand:x.owner.hand.cards.length,
    opponentHand:x.opponent.hand.cards.length,
    opponentDeck:x.opponent.deck.cards.length,
    opponentPrizes:x.opponent.prizes.filter(p=>p.cards.length>0).length
  };
  assert.equal(snapshotBefore.opponentPrizes,opposingPrizes);
  assert.equal(snapshotBefore.opponentHand,opposingHand);
  const {PlayCardAction,PlayerType,SlotType} =
    native('game/store/actions/play-card-action');
  const target = {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

  let nativeError = null;
  try {
    x.store.dispatch(new PlayCardAction(x.owner.id,0,target));
  } catch (error) {
    nativeError = String(error?.message ?? error);
  }

  // Failed dispatch may replace Store.state with a restored clone.
  const liveOwner = x.store.state.players.find(p=>p.id===x.owner.id);
  const liveOpponent = x.store.state.players.find(p=>p.id===x.opponent.id);
  assert.ok(liveOwner && liveOpponent);
  const inHand = liveOwner.hand.cards.some(c=>c.fullName===item.fullName);
  const inDiscard = liveOwner.discard.cards.some(c=>c.fullName===item.fullName);
  const inSupporter = liveOwner.supporter.cards.some(c=>c.fullName===item.fullName);
  const dispatchAccepted = nativeError === null;

  if (dispatchAccepted) {
    assert.equal(inHand,false,'Accepted native Item must leave owner hand');
    assert.ok(inDiscard || inSupporter,
      'Accepted Item should be retained in play or discarded');
  } else {
    assert.equal(inHand,true,'Rejected native Item should remain held');
  }
  if (opposingHand===0) {
    assert.equal(liveOpponent.hand.cards.length,0,
      'Native card itself gates both shuffle and draw for empty opponent hand');
  }

  return {
    schema:'agent44-pinned-m4-zero-opponent-hand-native-store-fixture-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePrinting:item.fullName,
    seat,opposingPrizes,opposingHand,
    officialPaperEligible:paperEligible,
    nativeCanPlayAdvertises:nativeCanPlay,
    nativeStoreAccepted:dispatchAccepted,
    nativeError,ownerItemInHand:inHand,
    ownerItemInDiscard:inDiscard,
    ownerItemInSupporter:inSupporter,
    opponentHandAfter:liveOpponent.hand.cards.length,
    opponentDeckAfter:liveOpponent.deck.cards.length,
    pendingPrompts:x.store.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    paperViolationObserved:dispatchAccepted && !paperEligible,
    stagedOnly:true,competitivelyQualifiedGames:0,
    before:snapshotBefore
  };
}

for (const seat of [0,1]) {
  for (const [prizes,hand] of [[3,0],[3,1],[4,1]]) {
    test('native exact M4 Special Red Card, seat '+seat+
      ', opponent Prizes '+prizes+', hand '+hand,()=>{
      const receipt=inspectNativeSpecialRedCard(seat,prizes,hand);
      console.log('AGENT44_M4_NATIVE_STORE',JSON.stringify(receipt));
      assert.equal(receipt.officialPaperEligible,
        prizes<=3 && hand>=1);
      assert.equal(receipt.competitivelyQualifiedGames,0);
    });
  }
}

const {installSpecialRedCardEmptyHandHook} =
  require('../simulation/twinleaf/agent44-special-red-card-empty-hand-hook.cjs');

for (const seat of [0,1]) {
  test('paper-correct M4 hook repairs native Store in seat '+seat+
    ', leaves permitted play and original methods intact',()=>{
    const original = inspectNativeSpecialRedCard(seat,3,0);
    assert.equal(original.nativeCanPlayAdvertises,true);
    assert.equal(original.paperViolationObserved,true);
    const restore = installSpecialRedCardEmptyHandHook();
    try {
      const blocked = inspectNativeSpecialRedCard(seat,3,0);
      assert.equal(blocked.officialPaperEligible,false);
      assert.equal(blocked.nativeCanPlayAdvertises,false);
      assert.equal(blocked.nativeStoreAccepted,false);
      assert.equal(blocked.nativeError,'CANNOT_PLAY_THIS_CARD');
      assert.equal(blocked.ownerItemInHand,true);
      assert.equal(blocked.ownerItemInDiscard,false);
      assert.equal(blocked.opponentHandAfter,0);

      const allowed = inspectNativeSpecialRedCard(seat,3,1);
      assert.equal(allowed.nativeCanPlayAdvertises,true);
      assert.equal(allowed.nativeStoreAccepted,true);
      assert.equal(allowed.opponentHandAfter,3);
      assert.equal(allowed.ownerItemInDiscard,true);

      const tooManyPrizes = inspectNativeSpecialRedCard(seat,4,1);
      assert.equal(tooManyPrizes.nativeCanPlayAdvertises,false);
      assert.equal(tooManyPrizes.nativeStoreAccepted,false);
      assert.equal(tooManyPrizes.ownerItemInHand,true);
      assert.equal(tooManyPrizes.nativeError,'CANNOT_PLAY_THIS_CARD');

      console.log('AGENT44_M4_PAPER_HOOK',
        JSON.stringify({seat,originalViolation:original,
          correctedEmptyHand:blocked,validPlay:allowed,
          originalPrizeBlock:tooManyPrizes,
          qualifiedCompetitiveGames:0}));
    } finally {
      restore();
    }
    const restored = inspectNativeSpecialRedCard(seat,3,0);
    assert.equal(restored.nativeCanPlayAdvertises,true);
    assert.equal(restored.nativeStoreAccepted,true);
    assert.equal(restored.paperViolationObserved,true);
  });
}

module.exports = {inspectNativeSpecialRedCard};
