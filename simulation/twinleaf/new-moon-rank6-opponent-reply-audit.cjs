'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {initializeCards} = require('./headless.cjs');
const {pairedCandidateSlots} = require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm} = require('./new-moon-second-start-paired.cjs');
const field = require('../../results/aichi-2026/full-decklists.json');

const OPPONENT = 0;
const CANDIDATE = 1;
const SEED = 3730588627;
const ENERGY = ['Speed Lightning Energy', 'Capture Energy',
  'Spiky Energy', 'Double Colorless Energy'];
const expectedRank6 = field.decks.find(deck => deck.rank === 6);
assert.ok(expectedRank6 && expectedRank6.archetype === 'Iron Thorns');

/**
 * This classifier applies only to the verified rank-6 source inventory:
 * four Iron Thorns ex, eight named Energy and 48 Trainers.
 * Unknown physical printings fail closed.
 *
 * @param {string} printing
 * @param {Set<string>} inventory
 * @returns {'Pokémon'|'Energy'|'Trainer'}
 */
function rank6CardCategory(printing, inventory) {
  assert.ok(inventory.has(printing), 'Unregistered rank-6 printing: ' + printing);
  if (printing.startsWith('Iron Thorns ex ')) return 'Pokémon';
  if (ENERGY.some(name => printing.startsWith(name + ' '))) return 'Energy';
  return 'Trainer';
}

/**
 * @param {string[]} printings
 * @param {Set<string>} inventory
 */
function handCounts(printings, inventory) {
  const counts = {Pokémon:0,Energy:0,Trainer:0};
  for (const printing of printings) counts[rank6CardCategory(printing,inventory)]++;
  return {
    ...counts,
    size:printings.length,
    fingerprint:crypto.createHash('sha256')
      .update(JSON.stringify(printings)).digest('hex')
  };
}

/** @param {object} game @param {number} turn @param {string} action */
function actionAt(game, turn, action) {
  const found=game.decisionTrace.filter(row => row.playerSlot===OPPONENT &&
    row.turnBefore===turn && row.action===action);
  assert.equal(found.length,1,'Expected one opponent '+action+' on turn '+turn);
  return found[0];
}

/** @param {object} game @param {number} turn */
function candidateTurn(game,turn) {
  const found=game.copycatTurnStartEvidence.filter(row=>row.turn===turn);
  assert.equal(found.length,1,'Missing candidate turn-start '+turn);
  return found[0];
}

/**
 * Retrospective evaluation only, using the acting opponent's own hand
 * AFTER its decisions. Never presented to either playing policy.
 * @param {object} game
 * @param {string[]} opponentPrintings
 */
function auditPivot(game,opponentPrintings) {
  assert.equal(game.firstTurnSlot,OPPONENT);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.finished,true);
  assert.equal(game.winner,CANDIDATE);
  const inventory=new Set(opponentPrintings);
  assert.equal(opponentPrintings.filter(x=>rank6CardCategory(x,inventory)==='Pokémon').length,4);
  assert.equal(opponentPrintings.filter(x=>rank6CardCategory(x,inventory)==='Energy').length,8);
  assert.equal(opponentPrintings.filter(x=>rank6CardCategory(x,inventory)==='Trainer').length,48);

  const firstReply=actionAt(game,3,'PassTurnAction');
  const turn5Rows=game.decisionTrace.filter(row=>
    row.playerSlot===OPPONENT && row.turnBefore===5);
  assert.ok(turn5Rows.some(row=>row.action==='PlayCardAction' &&
    row.card==='Camping Gear'), 'Expected opponent Camping Gear turn five');
  const selected=turn5Rows.find(row=>row.cardSelection?.sourceZone==='deck' &&
    row.cardSelection?.selectedCards?.length===1);
  assert.ok(selected,'Missing mandatory Camping Gear searched card');
  const afterSelection=turn5Rows.find(row=>
    row.actionOrdinal>selected.actionOrdinal && row.decisionHandBefore);
  const turn5EndHand=afterSelection
    ? afterSelection.decisionHandBefore.ownHandPrintings
    : [...selected.decisionHandBefore.ownHandPrintings,
        ...selected.cardSelection.selectedCards];
  const firstHand=handCounts(firstReply.decisionHandBefore.ownHandPrintings,inventory);
  const secondHand=handCounts(turn5EndHand,inventory);
  const firstBoard=firstReply.publicBoardBeforePass;
  assert.ok(firstBoard);
  const firstActive=firstBoard[OPPONENT].active;
  assert.equal(firstActive.name,'Iron Thorns ex');
  const volt=firstActive.printedAttacks.find(attack=>attack.name==='Volt Cyclone');
  assert.ok(volt,'Expected native Iron Thorns printed attack');
  const stadiums=firstBoard.flatMap(player=>player.stadium);
  assert.ok(stadiums.includes('Path to the Peak'),
    'Pivot candidate had to replace Thunder Mountain with Path');
  assert.ok(!stadiums.some(name=>name.startsWith('Thunder Mountain')),
    'Thunder Mountain may not lower the observed printed attack cost');
  assert.ok(firstActive.energyCards.length < volt.cost.length,
    'Expected printed cost to be uncovered by number of attached Energy cards');
  assert.ok(firstHand.Trainer*50>=230,
    'First revealed-hand Trainer count does not support a 230-HP unmodified KO');

  const own4=candidateTurn(game,4);
  const own6=candidateTurn(game,6);
  assert.equal(own4.board[CANDIDATE].active.name,'Gengar & Mimikyu-GX');
  assert.equal(own6.board[CANDIDATE].active.name,'Gengar & Mimikyu-GX');
  assert.deepEqual(own4.prizeCounts,[6,6]);
  assert.deepEqual(own6.prizeCounts,[6,4]);
  assert.equal(secondHand.size,own6.opponentHandSize,
    'Reconstructed hand must match next actual opponent hand size');
  assert.ok(secondHand.Trainer*50>=230 - own6.board[OPPONENT].active.damage,
    'Second hand Trainer count cannot support final unmodified knockout');
  const ownAttacks=game.attackTrace.filter(row=>row.seat===CANDIDATE)
    .map(row=>({turn:row.turn,attack:row.name,declared:row.attack}));
  assert.deepEqual(ownAttacks.map(x=>x.turn),[2,4,6]);
  assert.deepEqual(ownAttacks.map(x=>x.declared),
    ['Horror House-GX','Poltergeist','Poltergeist']);
  assert.equal(game.terminalTransition.after.players[OPPONENT].inPlayPokemon,0);
  assert.equal(game.terminalTransition.actionLineage.initiatingAction.actionName,
    'AttackAction');

  return {
    seed:SEED,sourceHandAudit:'acting-player retrospective decision only',
    opponentTurn3:{
      action:firstReply.action,hand:firstHand,
      observedOpponentHand:firstReply.decisionHandBefore.ownHandPrintings,
      activeEnergy:firstActive.energyCards,
      printedVoltCycloneCost:volt.cost,
      stadiums,
      printedEnergyCardShortfall:volt.cost.length-firstActive.energyCards.length
    },
    candidateTurn4:{
      opponentActive:own4.board[OPPONENT].active.name,
      observedPriorDamage:own4.board[OPPONENT].active.damage,
      printedPoltergeistDamageFromOpponentTurn3Hand:firstHand.Trainer*50,
      prizesBefore:own4.prizeCounts
    },
    opponentTurn5:{action:'Camping Gear into automatic turn end',
      selectedPrinting:selected.cardSelection.selectedCards,
      hand:secondHand,
      beforeSearchHand:selected.decisionHandBefore.ownHandPrintings,
      reconstructedAfterSearchHand:turn5EndHand},
    candidateTurn6:{
      opponentActive:own6.board[OPPONENT].active.name,
      observedPriorDamage:own6.board[OPPONENT].active.damage,
      printedPoltergeistDamageFromOpponentTurn5Hand:secondHand.Trainer*50,
      prizesBefore:own6.prizeCounts
    },
    terminal:game.terminalTransition,
    qualification:'Source-dealt retrospective hand/printed-cost audit; response alternatives, complete reducer fidelity and policy competence not certified'
  };
}

function run() {
  initializeCards();
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(deck=>deck.rank===6);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const candidate=pairedCandidateSlots().source;
  const game=runArm(candidate,opponent.cards,CANDIDATE,SEED,350,true,true);
  return {schema:'new-moon-rank6-native-gengar-retrospective-reply-audit-v1',
    testKind:'Real source game, no change to either playing policy',
    opponentSource:'Aichi published rank 6',
    classifiedSourceInventory:expectedRank6.category_counts,
    audit:auditPivot(game,opponent.cards),
    qualifiedCompetitiveGames:0};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={rank6CardCategory,handCounts,auditPivot,run};
