'use strict';

const CANONICAL = 'Grand Tree SCR';
const NATIVE_MISSPELLING = 'Great Tree SCR';
const installed = new WeakMap();

/**
 * Restore a printed Grand Tree SCR 136 lookup at the pinned Twinleaf boundary.
 * The pinned set registers GreatTree.name='Grand Tree', setNumber='136',
 * but incorrectly sets fullName='Great Tree SCR'. This adapter changes only
 * lookups requested by the original printed identity. It does not edit vendor
 * files or create a duplicate registered ACE SPEC.
 *
 * Installs on an initialized CardManager instance. Nested installs are
 * reference-counted, and each disposer is idempotent.
 *
 * @param {object} manager Initialized native CardManager.
 * @returns {()=>void} Release this installation.
 */
function installGrandTreePrintingAlias(manager) {
  const previous = installed.get(manager);
  if (previous) {
    previous.references++;
    return disposer(manager, previous);
  }

  const get = manager.getCardByName;
  const defined = manager.isCardDefined;
  if (typeof get !== 'function' || typeof defined !== 'function') {
    throw new TypeError('Expected a native CardManager');
  }
  if (get.call(manager, CANONICAL)) return () => {};

  const native = get.call(manager, NATIVE_MISSPELLING);
  if (!native || native.name !== 'Grand Tree' ||
      native.set !== 'SCR' || String(native.setNumber) !== '136') {
    throw new Error('Pinned Grand Tree SCR 136 alias precondition failed');
  }

  function lookup(name) {
    const resolved = get.call(this,
      name === CANONICAL ? NATIVE_MISSPELLING : name);
    if (name === CANONICAL && resolved) resolved.fullName = CANONICAL;
    return resolved;
  }
  function isDefined(name) {
    return defined.call(this,
      name === CANONICAL ? NATIVE_MISSPELLING : name);
  }

  const entry = {get, defined, lookup, isDefined, references: 1};
  manager.getCardByName = lookup;
  manager.isCardDefined = isDefined;
  installed.set(manager, entry);
  return disposer(manager, entry);
}

/** @param {object} manager @param {object} entry @returns {()=>void} */
function disposer(manager, entry) {
  let released = false;
  return () => {
    if (released) return;
    released = true;
    entry.references--;
    if (entry.references !== 0) return;
    if (manager.getCardByName !== entry.lookup ||
        manager.isCardDefined !== entry.isDefined) {
      throw new Error('Grand Tree alias was superseded before teardown');
    }
    manager.getCardByName = entry.get;
    manager.isCardDefined = entry.defined;
    installed.delete(manager);
  };
}

module.exports = {
  CANONICAL, NATIVE_MISSPELLING, installGrandTreePrintingAlias
};
