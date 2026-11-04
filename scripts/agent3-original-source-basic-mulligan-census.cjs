'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {originalFieldToolAnswerVisibility}=
  require('./agent38-original-field-tool-visibility.cjs');
const {choose}=require('../simulation/evaluation/agent3-coupled-opening-input-order.cjs');

const SOURCE_FILE=path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json');
const VERSION='agent3-original-29-ideal-first-seven-basic-census-v1';

/**
 * Audit exactly the physical original published card rows against the real
 * installed source printing corpus; only fully resolved Pokémon stages
 * qualify for an exact 7-card mulligan probability.
 *
 * The initial-seven formula is an ideal uniform-without-replacement card
 * sampling result, not an actual bot-policy simulation or proof of Twinleaf
 * xorshift fairness.
 * @returns {object}
 */
function originalSourceBasicCensus(){
  const raw=fs.readFileSync(SOURCE_FILE,'utf8');
  const input=JSON.parse(raw);
  const scan=originalFieldToolAnswerVisibility(input);
  assert.equal(input.decks.length,29);
  assert.equal(input.published_deck_count,29);
  assert.equal(scan.originalSources,29);
  assert.equal(scan.resolvedOriginals,29);
  assert.equal(scan.unresolvedOriginals,0);
  const ranks=scan.rows.map(row=>{
    assert.equal(row.status,'resolved-corpus-basic-stage');
    assert.ok(Number.isSafeInteger(row.basicCount)&&
      row.basicCount>=1&&row.basicCount<=60);
    const failed=choose(60-row.basicCount,7)/choose(60,7);
    assert.ok(Number.isFinite(failed)&&failed>=0&&failed<1);
    return {
      rank:row.rank,archetype:row.archetype,
      exactSourceBasicCount:row.basicCount,
      initialSevenMulliganProbability:failed,
      initialSevenHasBasicProbability:1-failed,
      idealExpectedMulliganCount:failed/(1-failed)
    };
  }).sort((a,b)=>a.rank-b.rank);
  assert.equal(new Set(ranks.map(row=>row.rank)).size,29);
  assert.deepEqual(ranks.map(row=>row.rank),
    input.decks.map(row=>row.rank).sort((a,b)=>a-b));
  return {
    schema:VERSION,
    sourceRosterSha256:createHash('sha256').update(raw).digest('hex'),
    knownOriginals:29,unavailableOriginals:[23,25,28],
    exactResolvedSourceBasicStages:29,unknownSourceStages:0,
    hypotheticalOpeningSampling:'ideal-uniform-without-replacement-first-seven',
    caveat:'Only authenticated printed source roster and local English card-subtype classifications. Original ranks 23,25,28 remain missing. No actual game outcome, no RNG quality assurance, no paper era-legality or clock certification.',
    ranks
  };
}
module.exports={VERSION,SOURCE_FILE,originalSourceBasicCensus};

if(require.main===module)process.stdout.write(
  'AGENT3_ORIGINAL29_BASIC_MULLIGAN_CENSUS '+
  JSON.stringify(originalSourceBasicCensus())+'\n');
