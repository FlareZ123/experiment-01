'use strict';
const {createHash}=require('node:crypto');
const {seededRandom,deckPermutation}=require('../twinleaf/headless.cjs');
const VERSION='agent4-physical-shuffle-cross-player-rng-coupling-v1';
const digest=sequence=>createHash('sha256').update(JSON.stringify(sequence))
  .digest('hex');

/**
 * This is a synthetic stream-coupling witness, not a reconstruction of
 * any game's hidden deck order or exact native RNG cursor position.
 * @param {number} seed Frozen original trial seed, used here only as example.
 * @returns {object}
 */
function demonstrateSharedStreamCoupling(seed=100){
  const sourceFirstDeckLengths=[44,43];
  const candidateDeckLength=43;
  const untreatedRandom=seededRandom(seed);
  const candidateWithNoEarlierSourceSearch=
    deckPermutation(candidateDeckLength,untreatedRandom);
  const treatedRandom=seededRandom(seed);
  const sourceExtraShufflePermutations=sourceFirstDeckLengths.map(n=>
    deckPermutation(n,treatedRandom));
  const candidateAfterSourceSearchShuffles=
    deckPermutation(candidateDeckLength,treatedRandom);
  const separateCandidateSeed=(seed^0xbb67ae85)>>>0;
  const baselinePerSeat=deckPermutation(
    candidateDeckLength,seededRandom(separateCandidateSeed));
  const extraSearchPerSeat=deckPermutation(
    candidateDeckLength,seededRandom(separateCandidateSeed));
  return {
    schema:VERSION,seed,
    syntheticOnly:true,
    noClaimAboutActualSourceDeckLength:true,
    potentialSharedGlobalRngCoupling:true,
    sourceExtraShuffleLengths:sourceFirstDeckLengths,
    candidateShuffleLength:candidateDeckLength,
    candidatePermutationControlSHA256:digest(candidateWithNoEarlierSourceSearch),
    candidatePermutationWithTwoExtraSourceShufflesSHA256:
      digest(candidateAfterSourceSearchShuffles),
    candidatePermutationsDifferUnderSharedStream:
      digest(candidateWithNoEarlierSourceSearch)!==
      digest(candidateAfterSourceSearchShuffles),
    sourceExtraShuffleSHA256:sourceExtraShufflePermutations.map(digest),
    independentCandidateStreamSeed:separateCandidateSeed,
    independentCandidatePermutationControlSHA256:digest(baselinePerSeat),
    independentCandidatePermutationExtraSourceShuffleSHA256:
      digest(extraSearchPerSeat),
    independentCandidatePermutationInvariant:
      digest(baselinePerSeat)===digest(extraSearchPerSeat),
    actualCausalAttributionOfAnyNativeCandidateAction: 'unverified',
    competitiveGames:0
  };
}
if(require.main===module){
  process.stdout.write('AGENT4_SYNTHETIC_RNG_COUPLING '+
    JSON.stringify(demonstrateSharedStreamCoupling())+'\n');
}
module.exports={VERSION,demonstrateSharedStreamCoupling};
