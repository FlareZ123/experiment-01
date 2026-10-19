'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {canonicalCards}=require('./aichi-comparison-campaign.cjs');
const {fingerprintPublishedField}=require('./aichi-source-fingerprint-map.cjs');
const {assertTerminalOutcomeBinding}=
  require('./aichi-qualified-outcome-binding.cjs');
const {assessCorrelatedFieldEvidence}=
  require('./aichi-correlated-round-evidence.cjs');

/** @param {unknown} value @returns {string} */
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Fail closed on an incomplete 32-rank inventory or one game against a
 * different 60. This only compares the records with the supplied map, and
 * does not authenticate the map's source or verify printed-card legality.
 *
 * @param {object[][]} rounds Complete 64-cell rank/actual-start rounds.
 * @param {object} fieldMap Fingerprint of 32 source-ranked print inventories.
 * @param {string} candidateDigest Frozen 60-card candidate canonical digest.
 */
function assertFullFieldSourceBinding(rounds,fieldMap,candidateDigest) {
  if(!fieldMap || fieldMap.complete!==true ||
      fieldMap.rankCount!==32 || !Array.isArray(fieldMap.ranked) ||
      fieldMap.ranked.length!==32 ||
      !/^[0-9a-f]{64}$/.test(candidateDigest)) {
    throw new Error('Full Aichi 32-rank source inventory is unavailable or candidate is unbound');
  }
  const expected=new Map();
  for(const row of fieldMap.ranked) {
    if(!Number.isInteger(row?.rank) || row.rank<1 || row.rank>32 ||
        !/^[0-9a-f]{64}$/.test(row.sourceDeckSha256) ||
        row.status!=='verified-printed-inventory' || expected.has(row.rank)) {
      throw new Error('Invalid or duplicated rank in the complete Aichi source fingerprint');
    }
    expected.set(row.rank,row.sourceDeckSha256);
  }
  if(expected.size!==32) throw new Error('Aichi source fingerprint lacks a rank');
  for(const round of rounds) {
    if(!Array.isArray(round)) throw new Error('Each field evidence round must be an array');
    for(const game of round) {
      if(game?.opponentDeckSha256!==expected.get(game.rank) ||
          game.candidateDeckSha256!==candidateDigest) {
        throw new Error('Field game deck fingerprint contradicts frozen printed 60: rank '+
          game?.rank);
      }
    }
  }
}

/**
 * Final-claim intake for the current canonical source repository. A
 * successful arithmetic assessment remains conditional on genuine independent
 * games, competent policies, paper legality, clock, and external provenance.
 * This function intentionally refuses a partial 29-deck benchmark.
 *
 * @param {object[][]} rounds Complete evidence rounds.
 * @param {object[]} candidateCards One frozen print-specific 60-card inventory.
 * @param {object} [options] Predeclared statistical-process options.
 */
function assessRepositoryFullFieldClaim(rounds,candidateCards,options={}) {
  const sourceDir=path.resolve(__dirname,'../results/aichi-2026');
  const published=JSON.parse(fs.readFileSync(
    path.join(sourceDir,'full-decklists.json'),'utf8'));
  const fieldCsv=fs.readFileSync(path.join(sourceDir,'field.csv'),'utf8');
  const fieldMap=fingerprintPublishedField(published,fieldCsv);
  if(!fieldMap.complete) {
    throw new Error('Aichi full 32 source decks unavailable; missing ranks: '+
      fieldMap.missingRanks.join(','));
  }
  const canonical=canonicalCards(candidateCards);
  if(canonical.reduce((n,row)=>n+row[1],0)!==60) {
    throw new Error('Candidate must contain exactly 60 cards');
  }
  assertFullFieldSourceBinding(rounds,fieldMap,digest(canonical));
  for(const round of rounds) {
    for(const game of round) assertTerminalOutcomeBinding(game);
  }
  return {
    ...assessCorrelatedFieldEvidence(rounds,options),
    fieldManifestSha256:fieldMap.fieldManifestSha256,
    sourceInventoryDigestSha256:fieldMap.sourceInventoryDigestSha256,
    candidateDeckSha256:digest(canonical),
    sourceRanksBound:32,
    scope:'source-fingerprint and numerical evidence checks; independent gameplay and paper qualification remain external'
  };
}

module.exports={assertFullFieldSourceBinding,assessRepositoryFullFieldClaim};
