'use strict';
const {withOriginalRank1HeldLillie,runOriginalRank1HeldLillieABA}=
  require('./agent15-rank1-mirror-lillie-aba.cjs');
const {withPaperRandomDirectNightWatch}=
  require('./agent43-nightwatch-paper-random-resolver.cjs');

const VERSION='agent15-rank1-lillie-source-direct-nightwatch-paper-random-aba-v1';
const ENTROPY_SEED=20261106;

/**
 * The exact original source owner Lillie treatment from the preceding A/B/A
 * with Agent43's preexisting, default-off seeded direct Night Watch random
 * hand-index chooser. Only the B selected-game run is instrumented.
 *
 * @template T
 * @param {()=>T} execute Real source Store headless experiment.
 * @returns {{result:T,audit:object}}
 */
function withPaperRandomOwnerLillie(execute){
  const outer=withPaperRandomDirectNightWatch(
    ()=>withOriginalRank1HeldLillie(execute),
    {seed:ENTROPY_SEED});
  return {
    result:outer.result.result,
    audit:{...outer.result.audit,
      version:VERSION,
      directNightWatchPaperRandom:outer.audit,
      admission:'unqualified-developmental',
      qualifiedPaperGames:0}
  };
}

/** @returns {object} Precommitted exact-source A/B/A native runner. */
function runOriginalRank1RandomNightWatchLillieABA(){
  const r=runOriginalRank1HeldLillieABA({
    treatment:withPaperRandomOwnerLillie
  });
  return {...r,schema:VERSION,
    sourceNativeBaseline:
      '13ab25c071544c887a1226ebfea909798e73eb7c6f2b92a4c0',
    separateRandomSeed:ENTROPY_SEED};
}
module.exports={VERSION,ENTROPY_SEED,
  withPaperRandomOwnerLillie,
  runOriginalRank1RandomNightWatchLillieABA};
