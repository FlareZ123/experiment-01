'use strict';

const assert=require('node:assert/strict');

const SEEDS=Object.freeze({
  'second-a':{seed:1769876458,active:'Mewtwo & Mew-GX',
    bench:2,vip:1,opponentActive:'Crobat V',
    firstTurnCards:['Psychic Energy','Powerglass','Forest Seal Stone','Escape Rope']},
  'second-b':{seed:2809154458,active:'Unown',
    bench:3,vip:2,opponentActive:'Tapu Lele-GX',
    firstTurnCards:['Psychic Energy']}
});
const VARIANTS=Object.freeze([
  'new-moon-generic','new-moon-horror-compressor',
  'new-moon-blower-horror-compressor'
]);
const PRINTED_BASIC_POKEMON=17;
const STARTING_PRIZES=6;

/**
 * Audits source-selected first-turn plays and unspent Item access. Deck Basic
 * count and VIP text are independently grounded in the frozen English proxy
 * and FST225 printing, not inferred from a bot's action-selection scores.
 * This is an observable paper-rule necessary-condition audit, NOT an engine
 * acceptance or tactical superiority witness.
 *
 * @param {object} report Full compiled versioned rank11 source report.
 * @returns {object} Fully attributed six-arm nonuse report.
 */
function auditFirstTurnVipNonuse(report) {
  assert.equal(report.schema,
    'rank11-direct-held-shake-candidate-attack-window-source-v2');
  assert.equal(report.sourceRank,11);
  assert.equal(report.sourceSeat,0);
  assert.equal(report.candidateSeat,1);
  assert.equal(report.qualifiedCompetitiveGames,0);
  assert.ok(Array.isArray(report.attempts));
  const selected=report.attempts.filter(arm=>
    Object.hasOwn(SEEDS,arm.sourceSeedIdentity) &&
    VARIANTS.includes(arm.candidate));
  assert.equal(selected.length,6,'Six predefined New Moon observations required');

  const seen=new Set();
  const observations=[];
  for(const arm of selected) {
    const key=arm.sourceSeedIdentity+':'+arm.candidate;
    assert.ok(!seen.has(key),'Duplicate policy arm');
    seen.add(key);
    const expected=SEEDS[arm.sourceSeedIdentity];
    assert.equal(arm.seed,expected.seed);
    assert.equal(arm.status,'engine-observed');
    assert.equal(arm.startVerified,true);
    assert.equal(arm.actualSourceFirst,false);
    assert.equal(arm.actualFirstTurnSlot,1);
    assert.equal(arm.sourcePolicyCompleted,true);
    assert.equal(arm.candidateAttackDeclarationCount,0);
    assert.ok(Array.isArray(arm.candidateOpeningDecisions));
    assert.ok(Array.isArray(arm.candidatePassDecisions));
    const firstTurn=arm.candidateOpeningDecisions.filter(event=>
      event.turnBefore===1 && event.playerSlot===1);
    const played=firstTurn.filter(x=>x.action==='PlayCardAction').map(x=>x.card);
    assert.deepEqual(played,expected.firstTurnCards,
      'The audited candidate first-turn actions have changed');
    assert.equal(firstTurn.at(-1)?.action,'PassTurnAction');
    assert.ok(!firstTurn.some(x=>
      x.action==='PlayCardAction' && x.card==='Battle VIP Pass'),
      'VIP was played and the unused-Item witness is no longer valid');
    const passes=arm.candidatePassDecisions.filter(x=>x.turnBefore===1);
    assert.equal(passes.length,1,'One authentic first-turn Pass required');
    const pass=passes[0];
    const own=pass.ownPublicBoard;
    const opponent=pass.opposingPublicBoard;
    assert.equal(own?.active?.name,expected.active);
    assert.equal(own?.bench?.length,expected.bench);
    assert.equal(opponent?.active?.name,expected.opponentActive);
    assert.ok(Array.isArray(own.stadium)&&own.stadium.length===0);
    assert.ok(Array.isArray(opponent.stadium)&&opponent.stadium.length===0);
    const hand=pass.ownHandPrintings;
    assert.ok(Array.isArray(hand));
    const copies=hand.filter(name=>name==='Battle VIP Pass FST').length;
    assert.equal(copies,expected.vip,'Held live first-turn VIP count changed');
    // None of the first-turn source-visible hand cards is a Basic Pokémon.
    // The validated first-turn plays do not discard Pokémon from the game.
    const nonPokemonHand=new Set([
      'Dusclops SFA','Battle VIP Pass FST','Fog Crystal CRE',
      'Psychic Energy MEE','Rescue Carrier EVS'
    ]);
    assert.ok(hand.every(name=>nonPokemonHand.has(name)),
      'First-turn own-hand identities changed');
    const visibleBasic=1+own.bench.length;
    const minimumRemainingBasic=PRINTED_BASIC_POKEMON-visibleBasic-STARTING_PRIZES;
    assert.ok(minimumRemainingBasic>=2,
      'Two live deck Basic targets can no longer be guaranteed');
    assert.ok(5-own.bench.length>=2,
      'Insufficient ordinary Bench room for two Basic targets');
    assert.ok(opponent.bench.every(x=>
      x.name!=='Vileplume' && x.name!=='Budew' && x.name!=='Jellicent ex'),
      'Known early Item lock entered opponent board');
    observations.push({
      seedIdentity:arm.sourceSeedIdentity,seed:arm.seed,
      candidatePolicy:arm.candidate,globalTurn:1,actualCandidateFirst:true,
      sourceCandidateSeat:1,endingFirstTurnHand:[...hand],
      unspentBattleVipPassCopies:copies,
      candidateBenchOccupied:own.bench.length,
      freeBenchSlots:5-own.bench.length,
      minimumRemainingBasicPokemonInDeck:minimumRemainingBasic,
      candidateFirstTurnRootCards:played,
      opponentActive:opponent.active.name,
      choiceStage:'available-print-condition-left-unplayed',
      pinnedStoreAcceptsProposedVIP:'unverified',
      alternativeOptimality:'unreviewed'
    });
  }
  return {
    schema:'rank11-candidate-first-unspent-vip-openings-v1',
    sourceArtifact:'CI 39139876662 attempt 2, artifact 12141268506',
    fixedEnglishProxyBasicPokemonCount:PRINTED_BASIC_POKEMON,
    retrospectiveSourceDeals:2,policyArmRepetitions:6,
    observations,
    unspentVipCopiesAcrossRepeatedArms:observations.reduce(
      (n,row)=>n+row.unspentBattleVipPassCopies,0),
    independentCompetitiveGamesQualified:0,
    caution:'First-turn printed availability and a finite-population Basic target lower bound are observed; full pinned-Store action acceptance and tactical superiority require a controlled replay. Three policy arms per source deal are repeated observations, not independent games.'
  };
}

module.exports={SEEDS,VARIANTS,auditFirstTurnVipNonuse};
