'use strict';

const assert=require('node:assert/strict');
const {originalSourceBasicCensus}=
  require('./agent3-original-source-basic-mulligan-census.cjs');
const {frozenRankOneNewMoonCase}=
  require('../simulation/evaluation/agent3-coupled-opening-input-order.cjs');
const {sourceBonusDisagreement}=
  require('../simulation/evaluation/agent3-source-bonus-coupled-mulligan-model.cjs');

const VERSION='agent3-ideal-source-bonus-full32-partial-field-bound-v1';

/**
 * Hypothetical common-index, fully compensated, uniform-mulligan model for
 * original ranks with complete verified Basic counts. Missing 3 original 60s
 * have between 1 and 60 Basics, so enumerate all possible counts rather
 * than fabricate a likely count from a named archetype.
 *
 * @returns {object}
 */
function originalSourceBonus32Bound(){
  const census=originalSourceBasicCensus();
  const trial=frozenRankOneNewMoonCase();
  const rset=new Set(trial.historicalReferenceBasicPositions);
  const oset=new Set(trial.historicalChallengerBasicPositions);
  const reference=Array.from({length:60},(_,i)=>rset.has(i));
  const originalOrder=Array.from({length:60},(_,i)=>oset.has(i));
  const notReference=Array.from({length:60},(_,i)=>!rset.has(i));
  const maxSet=new Set([
    ...trial.historicalReferenceBasicPositions,
    ...Array.from({length:60},(_,i)=>i)
      .filter(i=>notReference[i]).slice(0,3)
  ]);
  const minSet=new Set(
    Array.from({length:60},(_,i)=>i)
      .filter(i=>notReference[i]).slice(0,17)
  );
  const cases={
    originalSourceRowOrder:originalOrder,
    maximalBasicPositionOverlap:Array.from({length:60},(_,i)=>maxSet.has(i)),
    minimalBasicPositionOverlap:Array.from({length:60},(_,i)=>minSet.has(i))
  };
  assert.equal(census.knownOriginals,29);
  assert.deepEqual(census.unavailableOriginals,[23,25,28]);
  const projections={};
  for(const [scenario,challenger] of Object.entries(cases)){
    const rows=census.ranks.map(row=>{
      const p=sourceBonusDisagreement(reference,challenger,
        row.exactSourceBasicCount).sourceBonusCardCountDisagreement;
      return {
        rank:row.rank,sourceBasics:row.exactSourceBasicCount,
        modelSourceBonusMismatchProbability:p
      };
    });
    const allValidBasicCounts=Array.from({length:60},(_,i)=>i+1);
    const possibilities=allValidBasicCounts.map(s=>
      sourceBonusDisagreement(reference,challenger,s)
        .sourceBonusCardCountDisagreement);
    const minMissing=Math.min(...possibilities);
    const maxMissing=Math.max(...possibilities);
    const knownSum=rows.reduce((sum,row)=>
      sum+row.modelSourceBonusMismatchProbability,0);
    projections[scenario]={
      knownRankCount:29,
      verifiedKnownRankAverage:knownSum/29,
      unknownRankCount:3,
      missingSourceBasicCountRange:[1,60],
      missingSingleRankProbabilityRange:[minMissing,maxMissing],
      equalRankFull32MeanProbabilityRange:[
        (knownSum+3*minMissing)/32,
        (knownSum+3*maxMissing)/32
      ],
      knownRanks:rows
    };
  }
  return {
    schema:VERSION,
    sourceRosterSha256:census.sourceRosterSha256,
    candidates:['champion-reference','new-moon-lockbreaker-v1'],
    originalAuthenticatedSources:29,missingOriginalSourceRanks:[23,25,28],
    sourceSetupModel:'ideal independent uniform per-attempt source shuffles, both candidate arms sharing independent uniform shuffled index positions, all optional source compensation cards taken',
    aggregateRankWeighting:'each of 32 Aichi Top32 ranks weighted equally',
    sourceBasicCountRequirements:'Every unknown source has at least one Basic, at most sixty Basics',
    projections,
    caveat:'Analytical experimental-source-coupling geometry only. Distinguish source bonus differences from actual terminal match results. Missing three genuine printed 60s, nonuniform seeded PRNG, player decision policy, paper format and match-clock qualifications remain blockers.',
    competitivelyQualifiedGameCount:0
  };
}
module.exports={VERSION,originalSourceBonus32Bound};

if(require.main===module) {
  const x=originalSourceBonus32Bound();
  process.stdout.write('AGENT3_SOURCE_BONUS_FULL32_BOUND '+
    JSON.stringify(x)+'\n');
}
