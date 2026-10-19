'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {sourceZoneSnapshot,zoneSnapshotDigest} =
  require('./source-zone-checkpoint.cjs');

const ROOT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine = name => require(path.join(ROOT,name));
const SEED = 1111464409;
const DARK_PATCH = 'Dark Patch ASR';
const DARKNESS_PREFIX = 'Darkness Energy ';

/** @param {string[]} names @param {string} printing @returns {number} */
function count(names,printing) {
  return names.filter(name=>name===printing).length;
}

/**
 * Retrospective physical source-state census taken after a bot decision.
 * No unrevealed card identities influence the actual policy.
 * @param {any} state Pinned live game state.
 * @returns {object} Detached source-only data and public target information.
 */
function turn23Frontier(state) {
  const snapshot=sourceZoneSnapshot(state);
  const owner=snapshot.players[0];
  const target=snapshot.players[1];
  const crobat=owner.bench.find(slot=>slot.cards.some(name=>
    name==='Crobat V DAA'));
  const latias=owner.bench.find(slot=>slot.cards.some(name=>
    name==='Latias ex SSP'));
  const garbodor=owner.bench.find(slot=>slot.cards.some(name=>
    name==='Garbodor BKP'));
  assert.ok(crobat && latias && garbodor,
    'Source turn23 Crobat/Latias/Garbodor board drifted');
  const basicDarkness=names=>names.filter(name=>name.startsWith(DARKNESS_PREFIX)).length;
  const patched={
    deck:count(owner.deck,DARK_PATCH),
    hand:count(owner.hand,DARK_PATCH),
    discard:count(owner.discard,DARK_PATCH),
    prizes:count(owner.prizes.flat(),DARK_PATCH),
    lostZone:count(owner.lostzone,DARK_PATCH)
  };
  const physicalCount=Object.values(patched).reduce((a,b)=>a+b,0);
  assert.equal(physicalCount,3,'Source three Dark Patch cards not conserved');
  const candidateActive=target.active;
  const targetCard=state.players[1].active.getPokemonCard();
  const candidatePrintedHp=targetCard?.hp??null;
  assert.equal(targetCard?.fullName,'Mewtwo & Mew-GX UNM',
    'Printed candidate Active drifted');
  assert.equal(candidatePrintedHp,270,'Candidate printed HP drifted');
  const prerequisites={
    vstarAvailable:owner.usedVSTAR===false,
    darkPatchSearchable:patched.deck>0,
    darknessInDiscard:basicDarkness(owner.discard)>0,
    sealOnLatias:latias.tools.includes('Forest Seal Stone SIT'),
    crobatEmptyTool:crobat.tools.length===0,
    crobatHasOneDarkness:basicDarkness(crobat.energies)===1,
    shoppingCenterInPlay:owner.stadium.includes('Shopping Center EVS'),
    garbotoxinUntooled:garbodor.tools.length===0,
    targetReachableBy70:candidatePrintedHp-candidateActive.damage<=70
  };
  return {
    schema:'rank11-source-turn23-crobat-stone-frontier-v1',
    seed:SEED,rank:11,turn:23,sourceSeat:0,candidateSeat:1,
    postDecisionReadOnly:true,allEarlierSourceActionsUntouched:true,
    opaqueFullZoneDigest:zoneSnapshotDigest(snapshot),
    sourceVSTARUsed:owner.usedVSTAR,
    ownerDarkPatchZoneCount:patched,
    ownerDarknessDiscardCount:basicDarkness(owner.discard),
    ownerRemainingPrizes:owner.prizes.length,
    sourceActive:owner.active,
    sourceCrobat:crobat,
    sourceLatias:latias,
    sourceGarbodor:garbodor,
    sourceStadium:owner.stadium,
    candidateActive,
    candidatePrintedHp,
    sourcePrizeCountBeforeHypotheticalKO:owner.prizes.length,
    sourcePrizeCountAfterHypotheticalThreePrizeKO:
      Math.max(0,owner.prizes.length-3),
    prerequisites,
    allAttackResourcePrerequisitesSeen:
      Object.values(prerequisites).every(Boolean),
    interpretiveLimit:'This is a retrospective prerequisite census, not a legal '+
      'Shopping Center/Star Alchemy/Dark Patch/retreat/attack Store fork. '+
      'It does not show paper damage modifiers or player competence.'
  };
}

/**
 * Capture the first genuine rank11 decision after Shopping Center enters
 * play. The original bot selects its action before the source snapshot.
 * @template T
 * @param {()=>T} work Authentic game execution.
 * @returns {{result:T,frontier:object}}
 */
function withTurn23Frontier(work) {
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {GamePhase}=engine('game/store/state/state');
  const proto=SimpleTacticsAi.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  let frontier=null;
  const wrapped=function(state) {
    const action=original.value.call(this,state);
    if(frontier===null && state.turn===23 && state.activePlayer===0 &&
       state.phase===GamePhase.PLAYER_TURN &&
       state.players[0].id===this.client?.id &&
       !state.prompts.some(prompt=>prompt.result===undefined) &&
       state.players[0].stadium.cards.some(card=>
         card.fullName==='Shopping Center EVS')) {
      frontier=turn23Frontier(state);
      frontier.observedRootActionChoice=action?.constructor?.name??null;
    }
    return action;
  };
  Object.defineProperty(proto,'decodeNextAction',{...original,value:wrapped});
  try {
    const result=work();
    assert.ok(frontier,'No authentic post-Shopping Center source decision');
    return {result,frontier};
  } finally {
    Object.defineProperty(proto,'decodeNextAction',original);
  }
}

/** @returns {object} */
function run() {
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {pairedCandidateSlots}=
    require('./new-moon-lockbreak-source-diagnostic.cjs');
  const {runArm}=require('./new-moon-second-start-paired.cjs');
  const source=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  }).opponents.find(row=>row.rank===11);
  assert.equal(source?.status,'ready');
  const candidate=pairedCandidateSlots().lockbreak;
  assert.equal(source.cards.length,60);
  assert.equal(candidate.length,60);
  const args=[candidate,source.cards,1,SEED,350,true,true,false,false];
  const baseline=runArm(...args);
  const probe=withTurn23Frontier(()=>runArm(...args));
  assert.equal(baseline.firstTurnSlot,0);
  assert.equal(probe.result.firstTurnSlot,0);
  assert.equal(probe.result.verifiedByDrawLog,true);
  assert.deepEqual(probe.result.rootActionLedger,baseline.rootActionLedger,
    'Read-only frontier observer must preserve every source root action');
  assert.deepEqual(probe.result.prizesRemaining,baseline.prizesRemaining);
  assert.equal(probe.result.winner,baseline.winner);
  const poltergeist=baseline.attackDeclarationTrace.find(row=>
    row.playerSlot===1 && row.turnBefore===22 &&
    row.attackName==='Poltergeist');
  assert.equal(poltergeist?.actionOrdinal,210,
    'Frozen authentic copied-attack prefix drifted');
  return {
    ...probe.frontier,
    pinnedEngine:baseline.engine,
    sourceDeckHashes:baseline.deckHashes,
    observedCopyOrdinal:poltergeist.actionOrdinal,
    observerRootReplayIdentical:true,
    observedFinalWinner:baseline.winner,
    observedFinalPrizes:baseline.prizesRemaining,
    qualifiedCompetitiveGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={turn23Frontier,withTurn23Frontier,run};
