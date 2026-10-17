'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards} = require('./headless.cjs');
const {pairedCandidateSlots} = require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm} = require('./new-moon-second-start-paired.cjs');
const source = require('../../results/als/new-moon-perfection-english-map.json');
const contender = require('../../results/als/new-moon-lockbreak-english-proxy-60.json');

const RANK = 11;
const MAX_PROBES = 160;
const GENGAR = 'Gengar & Mimikyu-GX TEU';

/** @param {object} game @param {0|1} seat */
function initialChoice(game, seat) {
  const choices = (game.decisionTrace || []).filter(row =>
    row.turnBefore === 0 &&
    row.playerSlot === seat &&
    row.action === 'ResolvePromptAction' &&
    row.cardSelection?.selectedCards?.includes(GENGAR));
  if (choices.length !== 1) return null;
  const row = choices[0];
  return {
    ordinal:row.actionOrdinal,
    chosen:row.cardSelection.selectedCards,
    hand:row.decisionHandBefore?.ownHandPrintings || [],
    opposingHandSize:row.decisionHandBefore?.opponentHandSize ?? null
  };
}

/** @param {ReturnType<typeof initialChoice>} choice */
function pivotEligible(choice) {
  return !!choice &&
    choice.chosen.indexOf(GENGAR) > 0 &&
    choice.hand.some(name => name.startsWith('Psychic Energy') ||
      name.startsWith('Telepathic Psychic Energy'));
}

/** @param {object} game @param {0|1} seat @param {number} turn */
function publicActions(game, seat, turn) {
  return (game.decisionTrace || []).filter(row =>
    row.playerSlot === seat && row.turnBefore === turn)
    .map(row => ({
      ordinal:row.actionOrdinal, action:row.action,
      ...(row.card ? {card:row.card} : {}),
      ...(row.attack ? {attack:row.attack} : {}),
      ...(row.ability ? {ability:row.ability} : {})
    }));
}

/** @param {object} game @param {0|1} seat */
function summary(game,seat) {
  const choice=initialChoice(game,seat);
  const ownFirst=(game.copycatTurnStartEvidence||[])[0];
  const firstOwn=ownFirst ? {
    turn:ownFirst.turn,
    active:ownFirst.board[seat]?.active?.name??null,
    bench:(ownFirst.board[seat]?.bench||[]).map(x=>x.name),
    activeEnergy:ownFirst.board[seat]?.active?.energyCards||[]
  } : null;
  const candidateAttacks=game.attackTrace.filter(row=>row.seat===seat)
    .map(row=>({turn:row.turn,name:row.name,prizesAfter:row.prizeCountAfter}));
  const opponentAttacks=game.attackTrace.filter(row=>row.seat===1-seat)
    .map(row=>({turn:row.turn,name:row.name}));
  return {
    choice, firstOwn,firstTurnSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,finished:game.finished,
    actions:game.actions,turns:game.turns,winner:game.winner,
    prizesRemaining:game.prizesRemaining,endReason:game.endReason,
    opponentFirstTurn:publicActions(game,1-seat,1),
    candidateFirstTurn:publicActions(game,seat,2),
    opponentReply:publicActions(game,1-seat,3),
    candidateFollowup:publicActions(game,seat,4),
    candidateAttacks,opponentAttacks,
    candidatePasses:game.decisionTrace.filter(row=>
      row.playerSlot===seat&&row.action==='PassTurnAction').length,
    terminalTransition:game.terminalTransition,
    qualifiedForCompetitiveInference:false
  };
}

/** @param {string[]} candidate @param {string[]} opponent
 * @param {0|1} seat @param {number} seed @param {boolean} pivot */
function tryArm(candidate,opponent,seat,seed,pivot) {
  try {
    const game=runArm(candidate,opponent,seat,seed,350,true,pivot);
    return {ok:true,deckHashes:game.deckHashes,
      data:summary(game,seat)};
  } catch(error) {
    return {ok:false,error:String(error?.stack||error),
      qualifiedForCompetitiveInference:false};
  }
}

function run() {
  initializeCards();
  const slots=pairedCandidateSlots();
  const opponent=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  }).opponents.find(row=>row.rank===RANK);
  assert.equal(opponent?.status,'ready','Rank 11 must be source-ready');
  assert.equal(opponent.cards.length,60);
  const seats=[];

  for(const seat of [0,1]) {
    const inspected=[];
    let selected=null;
    for(let repeat=0;repeat<MAX_PROBES;repeat++) {
      const seedBase=20261017+Math.floor(repeat/100);
      const withinBaseRepeat=repeat%100;
      const seeds=deriveSlotSeeds(seedBase,'pilot',RANK,withinBaseRepeat);
      const seed=seeds[seat===0?'A':'B'];
      let game;
      try { game=runArm(slots.source,opponent.cards,seat,90,true,false); }
      catch(error) {
        inspected.push({seedBase,repeat:withinBaseRepeat,seed,screenError:String(error?.message||error)});
        continue;
      }
      const choice=initialChoice(game,seat);
      const second=game.verifiedByDrawLog===true &&
        game.firstTurnSlot===1-seat;
      const eligible=second&&pivotEligible(choice);
      inspected.push({seedBase,repeat:withinBaseRepeat,seed,firstTurnSlot:game.firstTurnSlot,
        drawVerified:game.verifiedByDrawLog,
        hasGengarInSelection:!!choice,
        eligible});
      if(eligible) {selected={seedBase,repeat:withinBaseRepeat,seed};break;}
    }

    const report={candidatePhysicalSeat:seat,
      authenticCandidateSecond:true,scanned:inspected.length,
      screenErrors:inspected.filter(x=>x.screenError).slice(0,8),
      selected,screenCensus:{
        verifiedCandidateSecond:inspected.filter(x=>x.drawVerified&&x.firstTurnSlot===1-seat).length,
        selectedGengar:inspected.filter(x=>x.hasGengarInSelection).length,
        eligible:inspected.filter(x=>x.eligible).length
      },comparisons:[],qualifiedForCompetitiveInference:false};
    if(selected) {
      for(const variant of ['source','lockbreak']) {
        const baseline=tryArm(slots[variant],opponent.cards,seat,selected.seed,false);
        const pivot=tryArm(slots[variant],opponent.cards,seat,selected.seed,true);
        const pair={variant,baseline,pivot};
        if(baseline.ok&&pivot.ok) {
          const a=baseline.data,b=pivot.data;
          assert.equal(a.firstTurnSlot,1-seat);
          assert.equal(b.firstTurnSlot,1-seat);
          assert.equal(a.verifiedByDrawLog,true);
          assert.equal(b.verifiedByDrawLog,true);
          assert.deepEqual(a.choice.hand,b.choice.hand,
            'Pivot must not alter exact initial own hand');
          assert.deepEqual([...a.choice.chosen].sort(),[...b.choice.chosen].sort(),
            'Pivot must preserve already-selected physical Basic printing multiset');
          assert.notEqual(a.choice.chosen[0],GENGAR);
          assert.equal(b.choice.chosen[0],GENGAR);
          assert.deepEqual(baseline.deckHashes,pivot.deckHashes,
            'Candidate or opponent deck print inventory changed');
          pair.activeChanged=a.firstOwn?.active!==b.firstOwn?.active;
          pair.opponentInitialActionsEqual=JSON.stringify(a.opponentFirstTurn)===
            JSON.stringify(b.opponentFirstTurn);
        }
        report.comparisons.push(pair);
      }
    }
    seats.push(report);
  }
  return {
    schema:'new-moon-rank11-native-gengar-authentic-hardmatchup-v1',
    provenance:'Exact published Aichi rank11 Absol Garbodor source 60',
    evidence:'Real source setup hands, exact printing inventory, actual start orders, candidate-only policy fork and observed legal bot actions',
    caveat:'First conditional screen per seat, selected seed, generic opponent policy, untested paper effect fidelity and hypothetical State alias bugs; outcomes never establish win rates',
    rank:RANK, opponent:opponent.archetype,
    sourcePrintHash:source.sha256_id_counts,
    contenderPrintHash:contender.canonical_id_count_sha256,
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    policy:'research opt-in native Gengar starting selection; source and Lockbreaker unchanged 60s',
    seedProtocol:'decorrelated-slots-v3 base 20261017 rank11, first 160 seeded attempts in each physical seat (100 max per v3 base; bases 20261017 and 20261018) satisfying initial hand Gengar+Psychic and candidate actually second',
    qualifiedForCompetitiveInference:false,seats
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,initialChoice,pivotEligible,summary};
