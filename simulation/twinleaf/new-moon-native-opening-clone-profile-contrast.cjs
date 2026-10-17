'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards}=require('./headless.cjs');
const {pairedCandidateSlots}=require('./new-moon-lockbreak-source-diagnostic.cjs');
const {runArm}=require('./new-moon-second-start-paired.cjs');
const {setupChoice,publicActions}=require('./new-moon-native-opening-fixed-source-proof.cjs');

const SEAT=1;
const REPEAT=53;
const SEED=3730588627;

/** @param {object} game @param {string} id */
function summarize(game,id) {
  const setup=setupChoice(game);
  return {
    id,actualFirstSlot:game.firstTurnSlot,verifiedByDrawLog:game.verifiedByDrawLog,
    finished:game.finished,turns:game.turns,actions:game.actions,
    winner:game.winner,prizesRemaining:game.prizesRemaining,
    setupChoice:setup.chosenStartingPrints,
    setupHand:setup.originalOwnHandPrints,
    openingOpponentActions:publicActions(game,0,1),
    firstOwnActions:publicActions(game,SEAT,2),
    opponentReply:publicActions(game,0,3),
    printedOwnAttacks:game.attackTrace.filter(x=>x.seat===SEAT)
      .map(x=>({turn:x.turn,name:x.name})),
    printedOpponentAttacks:game.attackTrace.filter(x=>x.seat===0)
      .map(x=>({turn:x.turn,name:x.name})),
    terminalTransition:game.terminalTransition,
    finalState:game.finalState,
    deckHashes:game.deckHashes,
    qualifiedForCompetitiveInference:false
  };
}

function run() {
  initializeCards();
  assert.equal(deriveSlotSeeds(20261017,'pilot',6,REPEAT).B,SEED);
  const slots=pairedCandidateSlots();
  const opponent=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true}).opponents.find(x=>x.rank===6);
  assert.equal(opponent?.status,'ready');

  /** @param {boolean} pivot @param {boolean} postSuper */
  const arm=(pivot,postSuper)=>runArm(slots.source,opponent.cards,
    SEAT,SEED,350,true,pivot,postSuper);

  const originals=[arm(false,false),arm(true,false)];
  const repaired=[arm(false,true),arm(true,true)];
  const recheck=arm(false,false);
  assert.deepEqual(recheck,originals[0],
    'Opt-in reconciled Simulator must restore all subsequent pinned game semantics');
  for(const games of [originals,repaired]){
    const [control,pivot]=games;
    assert.equal(control.firstTurnSlot,0);
    assert.equal(pivot.firstTurnSlot,0);
    assert.equal(control.verifiedByDrawLog,true);
    assert.equal(pivot.verifiedByDrawLog,true);
    const a=setupChoice(control),b=setupChoice(pivot);
    assert.deepEqual(a.originalOwnHandPrints,b.originalOwnHandPrints);
    assert.deepEqual([...a.chosenStartingPrints].sort(),
      [...b.chosenStartingPrints].sort());
    assert.equal(a.chosenStartingPrints[0],'Mewtwo & Mew-GX UNM');
    assert.equal(b.chosenStartingPrints[0],'Gengar & Mimikyu-GX TEU');
  }
  assert.deepEqual(originals[0].deckHashes,repaired[0].deckHashes,
    'Pinned and repaired profiles require fixed candidate/source inventories');
  assert.deepEqual(setupChoice(originals[0]).originalOwnHandPrints,
    setupChoice(repaired[0]).originalOwnHandPrints,
    'Both clone profiles must preserve the same physical opening hand');

  return {
    schema:'new-moon-native-gengar-iron-thorns-reconciled-clone-fork-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    candidateSeat:SEAT,opponentRank:6,seed:SEED,repeat:REPEAT,
    qualification:'One selected physical source seed under two *experimental* speculative Simulator implementations. No competitive inference.',
    firstHandEqual:true,startingBasicMultisetsEqual:true,
    pinnedRepeatRestoredIdentically:true,
    original:{
      control:summarize(originals[0],'pinned-default'),
      pivot:summarize(originals[1],'pinned-native-pivot')
    },
    postSuperReconciled:{
      control:summarize(repaired[0],'post-super-reconciled-default'),
      pivot:summarize(repaired[1],'post-super-reconciled-native-pivot')
    },
    qualifiedForCompetitiveInference:false
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,summarize};
