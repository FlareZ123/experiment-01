'use strict';

const assert = require('node:assert/strict');
const {installStateScopedCopySessionLoader} =
  require('./copied-session-state-scope-hook.cjs');

const restoreLoader = installStateScopedCopySessionLoader();
let restoreSimulator = () => {};
try {
  const {runSimulatorSessionProbe} =
    require('./copy-session-speculative-simulator.cjs');
  const {installCopySessionAwareSimulatorHook} =
    require('./copy-session-aware-simulator-hook.cjs');

  const isolated = runSimulatorSessionProbe('pinned');
  assert.equal(isolated.simulatorError, null);
  assert.deepEqual(isolated.events, [
    'real','real','speculative','real','real'
  ]);

  restoreSimulator = installCopySessionAwareSimulatorHook();
  const inherited = runSimulatorSessionProbe('pinned');
  assert.equal(inherited.simulatorError, null);
  assert.deepEqual(inherited.events, [
    'real','real','speculative','speculative','real','real'
  ]);

  restoreSimulator();
  const {installPrototypeSafeSimulatorHook} =
    require('./prototype-safe-simulator-hook.cjs');
  const restoreDetached = installPrototypeSafeSimulatorHook();
  try {
    restoreSimulator = installCopySessionAwareSimulatorHook();
    const detached = runSimulatorSessionProbe('pinned');
    assert.equal(detached.simulatorConstructed, false);
    assert.ok(detached.simulatorError?.includes('Cloned Pokemon identity differs'));

    console.log('CLONED_COPY_SESSION',JSON.stringify({
      engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      isolated,inherited,detached,
      scope:'Experimental pinned clone transfer; detached clone explicitly rejected'
    },null,2));
  } finally {
    restoreSimulator();
    restoreSimulator = () => {};
    restoreDetached();
  }


} finally {
  restoreSimulator();
  restoreLoader();
}
