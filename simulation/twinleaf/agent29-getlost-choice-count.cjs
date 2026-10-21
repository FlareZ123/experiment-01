'use strict';

/** Determine the mandatory paper count for a printed two-card choice. */
function requiredGetLostCount(available) {
  if (!Number.isSafeInteger(available) || available < 0) {
    throw new RangeError('Public discard size must be a nonnegative integer');
  }
  return Math.min(2, available);
}

module.exports = { requiredGetLostCount };
