'use strict';

const assert = require('node:assert/strict');
const {installStateScopedCopySessionLoader} =
  require('./copied-session-state-scope-hook.cjs');

const restore = installStateScopedCopySessionLoader();
try {
  const {checkGlobalSessionIsolation} =
    require('./copy-session-cross-store-leak.cjs');
  const {compareGxDeniedCounterline} =
    require('./spent-gx-to-mimikyu-copycat.cjs');

  const independent = checkGlobalSessionIsolation();
  const controlIncrement = independent.uninterrupted.sourceAfterSecond -
    independent.uninterrupted.sourceAfterInterleave;
  const restoredIncrement = independent.interleaved.sourceAfterSecond -
    independent.interleaved.sourceAfterInterleave;
  assert.equal(independent.interleaved.sourceAfterInterleave,
    independent.interleaved.sourceAfterFirst,
    'Foreign Store must not call the active source reducer');
  assert.equal(restoredIncrement, controlIncrement,
    'State-scoped session must persist across unrelated Store dispatch');

  const copycat = compareGxDeniedCounterline();
  assert.equal(copycat.restored.damageToRegidrago, 80,
    'Actual Copycat turn still must resolve the selected ordinary copy');

  console.log('STATE_SCOPED_COPY_SESSION', JSON.stringify({
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    independent, copycat,
    scope: 'Opt-in runtime-only research patch, injected real Stores, not a complete game or policy certificate'
  }, null, 2));
} finally {
  restore();
}
