'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');

const rank=31;
const repeat=2;
const seedBase=20261016;
const expectedSeeds={A:1428369012,B:1245823196};

/**
 * Unconditional source-dealt A/B comparison. The two seeds, physical
 * slots and all three policies are fixed before any replay. Retain
 * no-opportunity games and every full terminal/action cap.
 *
 * @returns {object} Match policy diagnostic; no qualified game claim.
 */
function run() {
  const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank1=source.decks.find(row=>row.rank===1);
  const rank31=source.decks.find(row=>row.rank===rank);
  assert.ok(rank1&&rank31);
  initializeCards();
  const plan=planAichi({label:'champion-reference',cards:rank1.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(row=>row.rank===rank);
  assert.equal(opponent?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opponent.cards.length,60);
  const digest=cards=>crypto.createHash('sha256')
    .update(JSON.stringify(cards)).digest('hex');
  assert.equal(digest(plan.candidate.cards),
    'de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311');
  assert.equal(digest(opponent.cards),
    '6a38420649c4ed689f3e5bf831d97f5990cecad18b294b353d3b62bae38ddd32');
  const seeds=deriveSlotSeeds(seedBase,'published-field',rank,repeat);
  assert.deepEqual(seeds,expectedSeeds);

  /**
   * @param {object} game Actual source Store match.
   * @param {0|1} seat Rank31 physical seat.
   */
  function observe(game,seat) {
    const decisions=(game.decisionTrace||[]).filter(row=>row.playerSlot===seat);
    return {
      finished:game.finished,
      winner:game.finished?game.winner:null,
      actionCapReached:!game.finished,
      actions:game.actions,turns:game.turns,
      firstTurnSlot:game.firstTurnSlot,
      firstDrawVerified:game.verifiedByDrawLog,
      deckHashes:game.deckHashes,
      prizesRemaining:game.prizesRemaining,
      rank31FogPlays:decisions.filter(row=>
        row.action==='PlayCardAction'&&row.card==='Fog Crystal')
        .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore})),
      rank31OwnSearchSelections:decisions.filter(row=>
        row.cardSelection?.sourceZone==='deck' &&
        row.cardSelection.sourcePlayerSlot===seat)
        .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore,
          cards:row.cardSelection.selectedCards,
          message:row.cardSelection.message})),
      rank31ManualEnergyAttachments:decisions.filter(row=>
        row.action==='PlayCardAction' &&
        /Energy/.test(row.card??''))
        .map(row=>({ordinal:row.actionOrdinal,
          turn:row.turnBefore,card:row.card})),
      rank31BellAttacks:game.attackDeclarationTrace.filter(row=>
        row.playerSlot===seat && row.attackName==='Bell of Silence')
        .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore,
          triggerAction:row.triggerAction})),
      rank31FirstTurnDecisions:decisions.slice(0,25)
        .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore,
          action:row.action,card:row.card??null,
          attack:row.attack??null,
          selected:row.cardSelection?.selectedCards??null}))
    };
  }

  const trials=[];
  for(const slot of ['A','B']) {
    const candidateSeat=slot==='A'?0:1;
    const opponentSeat=1-candidateSeat;
    const request={
      deckA:candidateSeat===0?plan.candidate.cards:opponent.cards,
      deckB:candidateSeat===1?plan.candidate.cards:opponent.cards,
      seed:seeds[slot],maxActions:240,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      forestSealSearchCorrection:true,doubleDragonRecovery:true,
      supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
      radiantGateLockCorrection:true,entryDrawLockCorrection:true,
      grandTreeFirstTurnCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      captureDecisionTrace:true,
      label:'rank31 Fog Basic-occupancy repeated-source contrast '+slot
    };
    try {
      const modes={
        generic:runMatch(request),
        strict:runMatch({...request,rank31FogEnergySeat:opponentSeat}),
        broader:runMatch({...request,
          rank31FogEnergyBroaderSeat:opponentSeat})
      };
      const starts=Object.values(modes).map(game=>game.firstTurnSlot);
      assert.ok(starts.every(start=>start===starts[0]));
      assert.ok(Object.values(modes).every(game=>game.verifiedByDrawLog));
      assert.deepEqual(modes.generic.deckHashes,modes.strict.deckHashes);
      assert.deepEqual(modes.generic.deckHashes,modes.broader.deckHashes);
      trials.push({slot,seed:seeds[slot],opponentSeat,status:'observed',
        generic:observe(modes.generic,opponentSeat),
        strict:observe(modes.strict,opponentSeat),
        broader:observe(modes.broader,opponentSeat)});
    } catch(error) {
      trials.push({slot,seed:seeds[slot],opponentSeat,
        status:'engine-error',error:String(error?.message||error)});
    }
  }
  return {
    schema:'rank31-fog-basic-occupancy-three-policy-source-contrast-v1',
    candidate:'unchanged published rank1',opponent:'published rank31',
    fixedSeedProtocol:'aichi-decorrelated-slots-v3',
    seedBase,repeat,seeds,independentOriginalDeals:2,
    candidatePrintHash:digest(plan.candidate.cards),
    opponentPrintHash:digest(opponent.cards),
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    hypotheses:[
      'Broader policy permits Psychic Energy search when the strict selector vetoes other Basics',
      'Selected Energy must still be attached and Bell declared to establish attack conversion'
    ],
    trials,qualifiedCompetitiveGames:0,
    statisticalCaution:'Three policy branches reuse each original deal. This is a prospective two-original-deal policy diagnostic under generic remaining tactics, capped at 240 actions. Retain all nonexposures and errors. No win-rate or competence inference.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
