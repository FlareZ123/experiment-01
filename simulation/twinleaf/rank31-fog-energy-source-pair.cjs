'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');

/**
 * Compare exact rank31 source deck with an optional Fog choice policy on two
 * prospectively selected repeat-1 source deals. Both outcome branches of
 * each original deal are kept, regardless of whether Fog or Bell occurs.
 * Diagnostic only: 240-action caps, generic surrounding tactics, no
 * validated competitive outcome and no independent four-game sample.
 *
 * @returns {object} Full two-seat paired diagnostic, including nonexposures
 */
function main() {
  const field = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'), 'utf8'));
  const rank1 = field.decks.find(row => row.rank === 1);
  const rank31 = field.decks.find(row => row.rank === 31);
  assert.ok(rank1 && rank31);
  const seeds = deriveSlotSeeds(20261016, 'published-field', 31, 1);
  assert.deepEqual(seeds, {A:2481088205, B:2932006358});

  initializeCards();
  const plan = planAichi({label:'champion-reference', cards:rank1.cards}, {
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent = plan.opponents.find(row => row.rank === 31);
  assert.equal(plan.candidate.cards.length, 60);
  assert.equal(opponent.status, 'ready');
  assert.equal(opponent.cards.length, 60);
  const deckDigest = cards => crypto.createHash('sha256')
    .update(JSON.stringify(cards)).digest('hex');
  assert.equal(deckDigest(plan.candidate.cards),
    'de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311');
  assert.equal(deckDigest(opponent.cards),
    '6a38420649c4ed689f3e5bf831d97f5990cecad18b294b353d3b62bae38ddd32');

  /**
   * @param {object} game Actual synchronous runMatch return
   * @param {number} ownerSeat Physical seat of source rank31
   */
  function summarize(game, ownerSeat) {
    const decisions = game.decisionTrace || [];
    const own = decisions.filter(event => event.playerSlot === ownerSeat);
    const searches = own.filter(event =>
      event.cardSelection?.promptKind === 'ChooseCardsPrompt' &&
      event.cardSelection.sourceZone === 'deck' &&
      event.cardSelection.sourcePlayerSlot === ownerSeat);
    const attacks = game.attackTrace.filter(event => event.seat === ownerSeat);
    return {
      deckHashes:game.deckHashes, firstTurnSlot:game.firstTurnSlot,
      rank31ActuallySecond:game.firstTurnSlot !== ownerSeat,
      actions:game.actions, turns:game.turns,
      finished:game.finished, winner:game.finished ? game.winner : null,
      prizesRemaining:game.prizesRemaining,
      fogPlays:own.filter(event => event.action === 'PlayCardAction' &&
        event.card === 'Fog Crystal').map(event => ({
          actionOrdinal:event.actionOrdinal, turn:event.turnBefore
        })),
      ownerDeckChoices:searches.map(event => ({
        actionOrdinal:event.actionOrdinal, turn:event.turnBefore,
        message:event.cardSelection.message,
        selectedCards:event.cardSelection.selectedCards
      })),
      bellAttacks:attacks.filter(event => event.attack === 'Bell of Silence')
        .map(event => ({turn:event.turn, attacker:event.activePokemon})),
      firstOwnerActions:own.slice(0, 35).map(event => ({
        actionOrdinal:event.actionOrdinal, turn:event.turnBefore,
        action:event.action, card:event.card ?? null,
        attack:event.attack ?? null,
        selectedCards:event.cardSelection?.selectedCards ?? null
      }))
    };
  }

  const records = [];
  for (const candidatePhysicalSlot of ['A', 'B']) {
    const candidateSeat = candidatePhysicalSlot === 'A' ? 0 : 1;
    const ownerSeat = 1 - candidateSeat;
    const deckA = candidateSeat === 0 ? plan.candidate.cards : opponent.cards;
    const deckB = candidateSeat === 1 ? plan.candidate.cards : opponent.cards;
    const base = {
      deckA, deckB,
      seed:seeds[candidatePhysicalSlot],
      label:'rank31:prospective-fog-energy:repeat1:'+candidatePhysicalSlot,
      maxActions:240, strictPromptValidation:true,
      isolatePolicyRandomness:true, forestSealSearchCorrection:true,
      doubleDragonRecovery:true, supporterDecisionCorrection:true,
      leleEntryAbilityLockCorrection:true, radiantGateLockCorrection:true,
      entryDrawLockCorrection:true, grandTreeFirstTurnCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      captureDecisionTrace:true
    };
    try {
      const generic = runMatch(base);
      const attackFirst = runMatch({...base, rank31FogEnergySeat:ownerSeat});
      assert.ok([0, 1].includes(generic.firstTurnSlot));
      assert.ok([0, 1].includes(attackFirst.firstTurnSlot));
      assert.deepEqual(generic.deckHashes, attackFirst.deckHashes);
      assert.equal(generic.firstTurnSlot, attackFirst.firstTurnSlot);
      records.push({
        candidatePhysicalSlot, rank31PhysicalSeat:ownerSeat,
        seed:base.seed, status:'engine-run',
        generic:summarize(generic, ownerSeat),
        attackFirst:summarize(attackFirst, ownerSeat)
      });
    } catch (error) {
      records.push({
        candidatePhysicalSlot, rank31PhysicalSeat:ownerSeat,
        seed:base.seed, status:'engine-error',
        error:String(error?.message || error).slice(0, 400)
      });
    }
  }
  return {
    schema:'rank31-fog-energy-two-deal-paired-source-probe-v1',
    evidenceClass:'prospectively nominated repeat1 source-deal mechanical/policy diagnostic only',
    candidate:'rank1 champion source 60', opponent:'rank31 Dusknoir Chimecho source 60',
    sourceRank:31, actualEngine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    phase:'published-field', repeat:1,
    seedBase:20261016, seedProtocol:'decorrelated-slots-v3',
    registrationCommit:'b88804b593d8b7f85df7a630b6e2e67b7c676461',
    runResearchCommit:process.env.GITHUB_SHA ?? null,
    seeds, originalDeals:records.length, pairedAlternativeBranches:true,
    records,
    qualifiedForCompetitiveInference:false,
    caution:'At most two independent original deals; alternate choices reuse each deal. 240-action caps and unqualified opponent/candidate policies. No strength estimate.'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(main(), null, 2) + '\n');
module.exports = {main};
