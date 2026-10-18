'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch} = require('./headless.cjs');

const RANK = 19;
const PROBES = 160;
const MAX_ACTIONS = 45;
const ADP = 'Arceus & Dialga & Palkia-GX CEC';
const ENERGY = 'Double Dragon Energy ROS';

/** @param {unknown} value @returns {string} */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Preserve the actual source opening and normal first reply independently
 * from the bot's choice of Active, Energy attachment and attack.
 * The first-draw state is from an opt-in read-only own-hand snapshot.
 *
 * @param {object} game One bounded pinned real-Store source match
 * @param {number} seed Source draw seed
 * @returns {object}
 */
function project(game, seed) {
  const sourceSlot = 0;
  const first = game.firstTurnSlot;
  const actualSourceSecond = game.verifiedByDrawLog === true && first === 1 &&
    game.firstTurnPlayerId === 202 &&
    game.firstTurnPlayerName === 'research-B' &&
    game.firstDrawLogName === 'research-B';
  const sourceSetup = (game.decisionTrace || [])
    .filter(row => row.playerSlot === sourceSlot && row.turnBefore === 0 &&
      Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  const adpInInitialSeven = sourceSetup.some(row =>
    row.decisionHandBefore.ownHandPrintings.includes(ADP));
  const firstOwn = (game.copycatTurnStartEvidence || [])
    .find(event => event.turn === (actualSourceSecond ? 2 : 1));
  const sourceActive = firstOwn?.board?.[sourceSlot]?.active?.name ?? null;
  const ddEnergyAtOwnFirst = !!firstOwn?.candidateHand?.includes(ENERGY);
  const directReadyAfterOpponent =
    actualSourceSecond && sourceActive === 'Arceus & Dialga & Palkia-GX' &&
    ddEnergyAtOwnFirst && firstOwn.candidateUsedGX === false;
  const actualSourceFirstTurn = actualSourceSecond ? 2 : 1;
  const declarations = (game.attackDeclarationTrace || [])
    .filter(event => event.playerSlot === sourceSlot &&
      event.turnBefore === actualSourceFirstTurn);
  const firstTurnActions = (game.decisionTrace || [])
    .filter(event => event.playerSlot === sourceSlot &&
      event.turnBefore === actualSourceFirstTurn)
    .map(event => ({
      ordinal:event.actionOrdinal,action:event.action,
      card:event.card??null,attack:event.attack??null,
      ability:event.ability??null,attackChoice:event.attackChoice??null
    })).slice(0,18);
  return {
    seed,firstTurnVerified:game.verifiedByDrawLog===true,
    firstTurnSlot:first,actualSourceSecond,
    setupHandEvidenceAvailable:sourceSetup.length>0,
    adpInInitialSeven,
    sourceActiveAtFirstDecision:sourceActive,
    ddEnergyAtOwnFirst,directReadyAfterOpponent,
    firstTurnActions,
    sourceFirstTurnDeclarations:declarations.map(event=>({
      attack:event.attackName,turn:event.turnBefore,
      root:event.triggerAction,player:event.playerSlot
    })),
    alteredCreationDeclaredOnFirstTurn:declarations.some(event=>
      event.attackName==='Altered Creation-GX'),
    actions:game.actions,turns:game.turns,
    engineException:null,qualifiedForCompetitiveInference:false
  };
}

/**
 * One prospectively fixed 160-seed original rank19 versus rank1 source-deal
 * diagnostic. All attempts and exceptions are retained; no seed is filtered
 * by its final outcome and no competitive win metric is returned.
 * @returns {object}
 */
function run() {
  const source=planAichi(19,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const reference=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  assert.equal(source.candidate.cards?.length,60,'Rank19 source not engine-ready');
  assert.equal(reference.candidate.cards?.length,60,'Rank1 source not engine-ready');
  assert.equal(source.engineRevision,reference.engineRevision);
  assert.equal(source.opponents.find(row=>row.rank===1)?.status,'ready');
  assert.deepEqual(source.opponents.find(row=>row.rank===1).cards,
    reference.candidate.cards,'Source opponent mapping drift');
  const entries=[];
  for(let repeat=0;repeat<PROBES;repeat++) {
    const base=20261018+Math.floor(repeat/100);
    const seed=deriveSlotSeeds(base,'published-field',RANK,repeat%100).A;
    try {
      const game=runMatch({
        deckA:source.candidate.cards,deckB:reference.candidate.cards,
        seed,label:'rank19-ADP-direct-source:'+repeat,
        maxActions:MAX_ACTIONS,strictPromptValidation:true,
        forestSealSearchCorrection:true,
        isolatePolicyRandomness:true,
        captureDecisionTrace:true,captureCopycatTurnStartSeat:0
      });
      assert.deepEqual(game.deckHashes,
        [digest(source.candidate.cards),digest(reference.candidate.cards)]);
      entries.push({repeat,status:'engine-observed',...project(game,seed)});
    } catch(error) {
      entries.push({repeat,seed,status:'engine-exception',
        engineException:String(error?.stack||error).slice(0,1400),
        qualifiedForCompetitiveInference:false});
    }
  }
  return {
    schema:'rank19-direct-adp-source-deal-policy-screen-v1',
    firstTurnProof:'engine actor and draw-log required',
    rank:19,referenceOpponentRank:1,
    sourceEngineRevision:source.engineRevision,
    sourceEngineDeckDigest:digest(source.candidate.cards),
    referenceEngineDeckDigest:digest(reference.candidate.cards),
    declaredSeedBase:20261018,seedProtocol:'decorrelated-slots-v3',
    physicalSourceSlot:0,maxActionsPerGame:MAX_ACTIONS,
    allAttemptsRetained:entries.length===PROBES,
    counts:{
      attempted:entries.length,
      engineExceptions:entries.filter(row=>row.status==='engine-exception').length,
      drawVerified:entries.filter(row=>row.firstTurnVerified).length,
      sourceActualSecond:entries.filter(row=>row.actualSourceSecond).length,
      setupHandEvidence:entries.filter(row=>row.setupHandEvidenceAvailable).length,
      adpSeenInInitialSeven:entries.filter(row=>row.adpInInitialSeven).length,
      directResourceReady:entries.filter(row=>row.directReadyAfterOpponent).length,
      firstTurnAlteredCreationDeclared:entries.filter(row=>
        row.alteredCreationDeclaredOnFirstTurn).length,
      directReadyAndDeclared:entries.filter(row=>
        row.directReadyAfterOpponent &&
        row.alteredCreationDeclaredOnFirstTurn).length
    },
    entries,
    qualifiedForCompetitiveInference:false,
    limitation:'Source Store root action and log observations only. No effect resolution, competent opponent policy, paper-match clock or independent competitive games.'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={project,run};
