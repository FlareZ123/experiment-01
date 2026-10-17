'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards}=require('./headless.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const source=require('../../results/als/new-moon-perfection-english-map.json');
const contender=require('../../results/als/new-moon-lockbreak-english-proxy-60.json');

const SEAT=1;
const SEED=3730588627;
const GENGAR='Gengar & Mimikyu-GX TEU';
const MEWTWO='Mewtwo & Mew-GX UNM';

/** @param {object} game */
function setupChoice(game) {
  const matches=game.decisionTrace.filter(row=>
    row.turnBefore===0 && row.playerSlot===SEAT &&
    row.action==='ResolvePromptAction' &&
    row.cardSelection?.selectedCards?.includes(GENGAR) &&
    row.cardSelection?.selectedCards?.includes(MEWTWO));
  assert.equal(matches.length,1,'Candidate must have one visible selected-Basics source setup prompt');
  const row=matches[0];
  assert.ok(row.decisionHandBefore?.ownHandPrintings?.includes(GENGAR));
  assert.ok(row.decisionHandBefore.ownHandPrintings.includes(MEWTWO));
  return {
    promptActionOrdinal:row.actionOrdinal,
    promptMessage:row.cardSelection.message,
    promptKind:row.cardSelection.promptKind,
    sourceZone:row.cardSelection.sourceZone,
    chosenStartingPrints:row.cardSelection.selectedCards,
    originalOwnHandPrints:row.decisionHandBefore.ownHandPrintings,
    opponentHandSize:row.decisionHandBefore.opponentHandSize
  };
}

/** @param {object} game @param {number} seat @param {number} turn */
function publicActions(game,seat,turn) {
  return game.decisionTrace.filter(row=>row.playerSlot===seat &&
    row.turnBefore===turn).map(row=>({
      actionOrdinal:row.actionOrdinal,
      action:row.action,
      ...(row.card ? {card:row.card} : {}),
      ...(row.attack ? {attack:row.attack} : {}),
      ...(row.ability ? {ability:row.ability} : {})
  }));
}

/** @param {object} game */
function concise(game) {
  const setup=setupChoice(game);
  const start=game.copycatTurnStartEvidence[0];
  const opp=0;
  return {
    setup,
    firstTurnSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    firstOwnTurn:{
      turn:start?.turn,
      active:start?.board[SEAT]?.active?.name??null,
      bench:start?.board[SEAT]?.bench?.map(p=>p.name)??[],
      ownHandPsychic:start?.candidateHand.filter(name=>
        name.startsWith('Psychic Energy')||
        name.startsWith('Telepathic Psychic Energy'))??[]
    },
    sourceOpponentFirstTurn:publicActions(game,opp,1),
    candidateFirstTurnActions:publicActions(game,SEAT,2),
    sourceOpponentReply:publicActions(game,opp,3),
    candidateFollowup:publicActions(game,SEAT,4),
    ownAttacks:game.attackTrace.filter(a=>a.seat===SEAT)
      .map(a=>({turn:a.turn,name:a.name,prizeCountAfter:a.prizeCountAfter})),
    opponentAttacks:game.attackTrace.filter(a=>a.seat===opp)
      .map(a=>({turn:a.turn,name:a.name})),
    qualifiedForCompetitiveInference:false,
    policy:game.policy,
    actions:game.actions,
    turns:game.turns,
    winner:game.winner,
    prizesRemaining:game.prizesRemaining,
    terminalTransition:game.terminalTransition,
    finalState:game.finalState,
    deckHashes:game.deckHashes
  };
}

function run() {
  initializeCards();
  const slots=pairedCandidateSlots();
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(row=>row.rank===6);
  assert.equal(opponent?.status,'ready');
  const expected=deriveSlotSeeds(20261017,'pilot',6,53).B;
  assert.equal(SEED,expected,'Fixed seed must match published pilot derivation');
  const variants=[];
  for(const variant of ['source','lockbreak']) {
    const control=runArm(slots[variant],opponent.cards,SEAT,SEED,350,true,false);
    const pivot=runArm(slots[variant],opponent.cards,SEAT,SEED,350,true,true);
    assert.equal(control.firstTurnSlot,0);
    assert.equal(pivot.firstTurnSlot,0);
    assert.equal(control.verifiedByDrawLog,true);
    assert.equal(pivot.verifiedByDrawLog,true);
    const a=concise(control),b=concise(pivot);
    assert.deepEqual(a.deckHashes,b.deckHashes,'Candidate print inventory drift');
    assert.deepEqual(a.setup.originalOwnHandPrints,b.setup.originalOwnHandPrints,
      'Setup hands must match before the deliberate Active choice');
    assert.deepEqual([...a.setup.chosenStartingPrints].sort(),
      [...b.setup.chosenStartingPrints].sort(),
      'The pivot must not add or omit any selected starting Basic');
    assert.equal(a.setup.chosenStartingPrints[0],MEWTWO);
    assert.equal(b.setup.chosenStartingPrints[0],GENGAR);
    assert.deepEqual(a.sourceOpponentFirstTurn,b.sourceOpponentFirstTurn,
      'Opponent actions before the candidate turn must match exactly');
    assert.equal(a.firstOwnTurn.active,'Mewtwo & Mew-GX');
    assert.equal(b.firstOwnTurn.active,'Gengar & Mimikyu-GX');
    assert.deepEqual(a.firstOwnTurn.ownHandPsychic,b.firstOwnTurn.ownHandPsychic);
    assert.equal(a.candidateFirstTurnActions.at(-1)?.attack,undefined);
    assert.ok(b.candidateFirstTurnActions.some(x=>x.attack==='Horror House-GX'),
      'Native printed GX must be an actual source AttackAction');
    variants.push({variant,control:a,pivot:b});
  }
  return {
    schema:'new-moon-native-gengar-fixed-rank6-reducer-prompt-witness-v1',
    evidenceClass:'authentic source-dealt game; prompt selection and public response; unqualified',
    candidatePhysicalSeat:SEAT,opponentRank:6,seed:SEED,repeat:53,
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePrintHash:source.sha256_id_counts,
    contenderPrintHash:contender.canonical_id_count_sha256,
    assertionScope:'Original candidate setup hand, selected Basic multiset, both actual first turns, identical initial opponent actions, actual native attack declaration, and terminal public transitions',
    noncertification:'Cloned reducer graph, card-specific paper-effect fidelity, opponent competence, physical Japanese print legality, and independent seeds still require separate tests',
    qualifiedForCompetitiveInference:false,
    variants
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,setupChoice,publicActions,concise};
