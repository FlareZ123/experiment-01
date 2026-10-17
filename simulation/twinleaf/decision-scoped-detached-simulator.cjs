'use strict';

/**
 * Install the existing research-side source-detached Simulator only during a
 * single synchronous decision. Previous and subsequent policy calls retain
 * their original Simulator profile. Restoration is mandatory on success and
 * exceptions. The caller determines which decision is being probed.
 *
 * This does not itself establish paper-game fidelity, information-set fairness
 * or equality of speculative reducers to the real source Store.
 *
 * @template T
 * @param {()=>T} work One original Bot.decodeNextAction invocation.
 * @param {()=>()=>void} [install] Test seam; production installs the actual
 *   post-constructor graph reconciliation profile.
 * @returns {T} Original decision result.
 */
function withDecisionScopedDetachedSimulator(work,install=()=>{
  return require('./post-super-alias-repair-hook.cjs')
    .installPostSuperAliasRepairHook();
}) {
  if(typeof work!=='function' || typeof install!=='function') {
    throw new TypeError('Expected synchronous policy and install callbacks');
  }
  const restore=install();
  if(typeof restore!=='function') {
    throw new TypeError('Detached Simulator installer did not supply a restore');
  }
  try { return work(); }
  finally { restore(); }
}

module.exports={withDecisionScopedDetachedSimulator};
