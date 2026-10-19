'use strict';

const TOTAL_REPEATS = 12;
const PARTITION_SIZE = 3;
const PARTITION_COUNT = TOTAL_REPEATS / PARTITION_SIZE;

/**
 * Recover an immutable, disjoint subset of the already declared 0..11
 * New Moon source-deal repeats. No seed selection or outcome filtering.
 * @param {number|null} partitionIndex null preserves the original full cohort.
 * @returns {number[]}
 */
function scheduledRepeats(partitionIndex = null) {
  if (partitionIndex === null) {
    return Array.from({length:TOTAL_REPEATS},(_,repeat)=>repeat);
  }
  if (!Number.isInteger(partitionIndex) ||
      partitionIndex < 0 || partitionIndex >= PARTITION_COUNT) {
    throw new RangeError('partitionIndex must be 0, 1, 2 or 3');
  }
  const first=partitionIndex*PARTITION_SIZE;
  return Array.from({length:PARTITION_SIZE},(_,offset)=>first+offset);
}

module.exports={TOTAL_REPEATS,PARTITION_SIZE,PARTITION_COUNT,
  scheduledRepeats};
