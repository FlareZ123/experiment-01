'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards}=require('./headless.cjs');
const {pairedCandidateSlots,runArm}=require('./new-moon-second-start-paired.cjs');
const source=require('../../results/als/new-moon-perfection-english-map.json');
const contender=require('../../results/als/new-moon-lockbreak-english-proxy-60.json');

/** @param {object} game @param {0|1} seat */
function firstOwnTurn(game,seat) {
  const first=(game.copycatTurnStartEvidence||[])[0];
  if(!first)return null;
  return {
    turn:first.turn,
    active:first.board[seat]?.active?.name??null,
    bench:(first.board[seat]?.bench??[]).map(card=>card.name),
    activeEnergy:first.board[seat]?.active?.energyCards??[],
    psychicEnergyInHand:first.candidateHand.filter(name=>
      name.startsWith('Psychic Energy')||
      name.startsWith('Telepathic Psychic Energy'))
  };
}

/** The first source turn two is only a *screen*, not proof of a setup choice. */
function opportunity(game,seat) {
  const t=firstOwnTurn(game,seat);
  return game.verifiedByDrawLog===true && game.firstTurnSlot===1-seat &&
    t!==null &&
    [t.active,...t.bench].some(name=>name?.startsWith('Gengar & Mimikyu-GX')) &&
    t.psychicEnergyInHand.length>0;
}

/** @param {object} game @param {0|1} seat */
function summarize(game,seat) {
  const own=(game.decisionTrace||[]).filter(row=>row.playerSlot===seat);
  const opponent=(game.decisionTrace||[]).filter(row=>row.playerSlot===1-seat);
  return {
    firstTurnSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    firstOwnTurn:firstOwnTurn(game,seat),
    actions:game.actions,turns:game.turns,finished:game.finished,
    endReason:game.endReason,
    candidateAttacks:game.attackTrace.filter(row=>row.seat===seat)
      .map(row=>row.name??row.attack??null),
    opponentAttacks:game.attackTrace.filter(row=>row.seat===1-seat)
      .map(row=>row.name??row.attack??null),
    candidatePerfectionUses:game.abilityTrace.filter(row=>
      row.seat===seat&&row.name==='Perfection').length,
    candidatePasses:own.filter(row=>row.action==='PassTurnAction').length,
    candidateInitialDecisions:own.slice(0,18).map(row=>({
      turn:row.turnBefore,action:row.action,
      card:row.card??null,attack:row.attack??null,ability:row.ability??null
    })),
    opponentInitialDecisions:opponent.slice(0,12).map(row=>({
      turn:row.turnBefore,action:row.action,
      card:row.card??null,attack:row.attack??null,ability:row.ability??null
    })),
    engineWinner:game.winner,prizesRemaining:game.prizesRemaining,
    qualifiedForCompetitiveInference:false
  };
}

function run() {
  initializeCards();
  const slots=pairedCandidateSlots();
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(row=>row.rank===6);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const seat=1;
  const probes=[];
  let selected=null;
  for(let repeat=0;repeat<64;repeat++) {
    const seed=deriveSlotSeeds(20261017,'pilot',6,repeat).B;
    const game=runArm(slots.source,opponent.cards,seat,seed,90,true);
    const early=firstOwnTurn(game,seat);
    const eligible=opportunity(game,seat);
    probes.push({repeat,seed,firstTurnSlot:game.firstTurnSlot,
      drawVerified:game.verifiedByDrawLog,
      active:early?.active??null,bench:early?.bench??[],
      visiblePsychic:early?.psychicEnergyInHand.length??0,
      nativeGengarAndPsychicOnFirstOwnTurn:eligible});
    if(eligible){selected={repeat,seed};break;}
  }
  const comparisons=[];
  if(selected) {
    for(const variant of ['source','lockbreak']) {
      const control=runArm(slots[variant],opponent.cards,seat,
        selected.seed,350,true,false);
      const pivot=runArm(slots[variant],opponent.cards,seat,
        selected.seed,350,true,true);
      assert.equal(control.firstTurnSlot,0);
      assert.equal(pivot.firstTurnSlot,0);
      assert.equal(control.verifiedByDrawLog,true);
      assert.equal(pivot.verifiedByDrawLog,true);
      comparisons.push({variant,control:summarize(control,seat),
        nativeOpeningPivot:summarize(pivot,seat),
        activeChangedOnFirstOwnTurn:firstOwnTurn(control,seat)?.active!==
          firstOwnTurn(pivot,seat)?.active});
    }
  }
  return {
    schema:'new-moon-native-opening-pivot-rank6-source-contrast-v1',
    evidenceType:'authentic source-dealt candidate-going-second policy diagnostic',
    qualification:'No opponent decision-policy, cloned Simulator, or paper-effect certification; all terminal winners unqualified',
    sourcePrintHash:source.sha256_id_counts,
    candidatePrintHash:contender.canonical_id_count_sha256,
    opponentRank:6,candidateSeat:seat,
    seedProtocol:'decorrelated-slots-v3: first 64 rank-6 seat B candidate-second turn-two source-board opportunities, then same-seed paired control and native Gengar pivot',
    intervention:'Only reorder already chosen setup Basics to native Gengar & Mimikyu-GX when own hand contains Psychic or Telepathic Psychic Energy',
    caveat:'Turn-two board visibility is a screening proxy for setup opportunity; a candidate may draw Energy after setup, so a selected seed can show no actual pivot. The hook never uses the opponent identity or hidden deck/Prize information.',
    scanned:probes.length,selected,probes,comparisons,
    qualifiedForCompetitiveInference:false
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,firstOwnTurn,opportunity,summarize};
