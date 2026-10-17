'use strict';

const assert = require('node:assert/strict');
const {installStateScopedCopySessionLoader} =
  require('./copied-session-state-scope-hook.cjs');

const restoreLoader = installStateScopedCopySessionLoader();
let restoreSimulator = () => {};
let restoreDetached = () => {};
try {
  const {runSimulatorSessionProbe} =
    require('./copy-session-speculative-simulator.cjs');
  const {installCopySessionAwareSimulatorHook} =
    require('./copy-session-aware-simulator-hook.cjs');
  const {installPrototypeSafeSimulatorHook} =
    require('./prototype-safe-simulator-hook.cjs');

  const isolated = runSimulatorSessionProbe('pinned');
  assert.equal(isolated.simulatorError, null);
  assert.deepEqual(isolated.events,
    ['real','real','speculative','real','real']);

  restoreSimulator = installCopySessionAwareSimulatorHook();
  const inherited = runSimulatorSessionProbe('pinned');
  assert.equal(inherited.simulatorError, null);
  assert.deepEqual(inherited.events,
    ['real','real','speculative','speculative','real','real']);

  restoreSimulator();
  restoreSimulator = () => {};
  restoreDetached = installPrototypeSafeSimulatorHook();
  restoreSimulator = installCopySessionAwareSimulatorHook();
  const detached = runSimulatorSessionProbe('pinned');
  assert.equal(detached.simulatorConstructed, false);
  assert.ok(detached.simulatorError?.includes('Cloned Pokemon identity differs'));

  restoreSimulator();
  restoreSimulator = () => {};
  restoreDetached();
  restoreDetached = () => {};
  restoreSimulator = installCopySessionAwareSimulatorHook();
  const reverseOrder = runSimulatorSessionProbe('prototype-safe');
  assert.equal(reverseOrder.simulatorConstructed, false);
  assert.ok(reverseOrder.simulatorError?.includes('must remain outermost'));

  console.log('CLONED_COPY_SESSION',JSON.stringify({
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    isolated,inherited,detached,reverseOrder,
    scope:'Experimental pinned clone transfer; detached clone and unsafe wrapper order rejected'
  },null,2));
} finally {
  restoreSimulator();
  restoreDetached();
  restoreLoader();
}
