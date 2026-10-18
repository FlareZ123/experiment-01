'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {selectTrajectory}=require('./detached-simulator-game-contrast.cjs');
const {installPinnedSourceGraphDecision}=
  require('./source-graph-decision-boundary.cjs');
const {installPostSuperAliasRepairHook}=
  require('./post-super-alias-repair-hook.cjs');

/**
 * One source-dealt complete game, with read-only original State graph
 * descriptor snapshots before/after exactly one real bot decision.
 * @param {object} request
 * @param {number} ordinal
 * @param {boolean} detached
 * @returns {object}
 */
function runGraphDecision(request,ordinal,detached) {
  const observer=installPinnedSourceGraphDecision(ordinal);
  let undo=null;
  try {
    if(detached)undo=installPostSuperAliasRepairHook();
    const game=selectTrajectory(runMatch(request));
    if(!observer.report.witness)throw new Error(
      'Requested original bot decision never occurred');
    return {game,observed:observer.report.witness};
  } finally {
    if(undo)undo();
    observer.restore();
  }
}

/** @returns {object} */
function compareActualSourceGraphBoundaries() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const byRank=new Map(field.decks.map(d=>[d.rank,d]));
  const a=byRank.get(1),b=byRank.get(10);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine);
  const request={
    deckA:a.cardIds,deckB:b.cardIds,
    seed:20261049,maxActions:350,strictPromptValidation:true,
    forestSealSearchCorrection:true,supporterDecisionCorrection:true,
    doubleDragonRecovery:true,isolatePolicyRandomness:true
  };
  const bare=selectTrajectory(runMatch(request));
  const cases=[];
  for(const ordinal of [5,110]){
    const stock=runGraphDecision(request,ordinal,false);
    const detached=runGraphDecision(request,ordinal,true);
    assert.deepEqual(stock.game,bare,
      'Read-only source graph inspection changed stock source game');
    assert.deepEqual(stock.game.deckHashes,detached.game.deckHashes);
    assert.equal(stock.game.actualFirstTurn,detached.game.actualFirstTurn);
    cases.push({
      ordinal,
      entryZoneDigestsEqual:stock.observed.entryZoneDigest===
        detached.observed.entryZoneDigest,
      stock:stock.observed,
      detached:detached.observed,
      afterZoneDigestsEqual:stock.observed.exitZoneDigest===
        detached.observed.exitZoneDigest,
      trajectoryDigestsEqual:stock.game.recordFingerprint===
        detached.game.recordFingerprint,
      engineWinnersEqual:stock.game.winner===detached.game.winner
    });
  }
  return {
    experiment:'source-ranked-selected-decisions-own-graph-integrity-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRanks:[1,10],seed:20261049,
    sourceDeckHashes:bare.deckHashes,
    actualFirstTurn:bare.actualFirstTurn,
    instrumentedStockMatchesUnobservedSourceGame:true,
    cases,
    competitiveGamesQualified:0,
    caveat:'Enumerates own JS descriptors of objects reachable from root live State at entry and compares after synchronous bot policy; no Map/Set internal slots, closures, module-global registries, hypothetical intermediate restores or qualified two-player outcomes.'
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(compareActualSourceGraphBoundaries(),null,2)+'\n');
module.exports={runGraphDecision,compareActualSourceGraphBoundaries};
