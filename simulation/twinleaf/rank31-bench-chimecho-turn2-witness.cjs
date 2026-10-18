'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');

const sourceSeed=1245823196;

/**
 * Read-only source-game post-choice diagnostic. The seed was selected
 * AFTER observing a no-first-turn-Bell match in a preregistered panel.
 * This study measures one actual public board and root action sequence;
 * it is not a prospective performance sample.
 *
 * @returns {object} Real source-dealt rank31 first-own-turn board witness.
 */
function run() {
  initializeCards();
  const field=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank1=field.decks.find(row=>row.rank===1);
  const rank31=field.decks.find(row=>row.rank===31);
  assert.ok(rank1&&rank31);
  const input=planAichi({label:'champion-reference',cards:rank1.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true
  });
  const opponent=input.opponents.find(row=>row.rank===31);
  assert.equal(opponent?.status,'ready');
  const sourceSeat=0;
  const game=runMatch({
    deckA:opponent.cards,deckB:input.candidate.cards,
    seed:sourceSeed,maxActions:36,captureDecisionTrace:true,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true,
    grandTreeFirstTurnCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    label:'selected-after-exposure rank31 turn2 actual public board'
  });
  assert.equal(game.firstTurnSlot,1,'Source rank31 should go second');
  assert.equal(game.verifiedByDrawLog,true);
  const decisions=game.decisionTrace.filter(row=>
    row.playerSlot===sourceSeat && row.turnBefore===2);
  const ownerPass=decisions.find(row=>row.action==='PassTurnAction');
  assert.ok(ownerPass,'Selected source seed must have actual turn2 Pass');
  assert.equal(ownerPass.actionOrdinal,34,
    'Recorded original root pass must remain stable');
  assert.ok(ownerPass.publicBoardBeforePass,
    'Need an actual pre-pass public board, not inferred card placement');
  const line=decisions.map(row=>({
    ordinal:row.actionOrdinal,action:row.action,
    card:row.card??null,
    selectedCards:row.cardSelection?.selectedCards??null,
    handBefore:row.decisionHandBefore?.ownHandPrintings??null
  }));
  return {
    schema:'rank31-chimecho-first-own-turn-public-board-witness-v1',
    sourceRank:31,sourceSeat,candidateRank:1,
    seed:sourceSeed,seedSelectedAfterInitialResult:true,
    earlyHorizonOnly:true,engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    verifiedFirstTurnSlot:game.firstTurnSlot,
    actions:game.actions,turns:game.turns,
    deckHashes:game.deckHashes,
    originalRootPassOrdinal:ownerPass.actionOrdinal,
    sourceTurn2Actions:line,
    sourceTurn2PassHand:ownerPass.decisionHandBefore?.ownHandPrintings??null,
    publicBoardBeforeSourcePass:ownerPass.publicBoardBeforePass,
    rank31BellAttackDeclarationsBeforeCap:game.attackDeclarationTrace.filter(row=>
      row.playerSlot===sourceSeat&&row.attackName==='Bell of Silence'),
    inference:'Source-selected real board and actions only; no revised play policy, matchup win, or opportunity-frequency claim',
    qualifiedCompetitiveGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
