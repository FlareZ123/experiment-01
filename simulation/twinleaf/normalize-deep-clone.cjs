'use strict';
const assert=require('node:assert/strict');

/**
 * Reject input shapes pinned deepClone cannot faithfully reproduce. It reads
 * source own enumerable fields and lacks cycle tracking in its array branch.
 *
 * @param {object} source Original pinned State.
 */
function assertVendorCloneCompatibleSource(source) {
  const visited = new WeakSet();
  const activeArrays = new WeakSet();
  function inspect(value) {
    if (value === null || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      assert.equal(activeArrays.has(value), false,
        'Pinned deepClone cannot clone cyclic arrays');
    }
    if (visited.has(value)) return;
    assert.ok(Object.getPrototypeOf(value) !== null,
      'Pinned deepClone would share a null-prototype object');
    assert.ok(typeof value.constructor === 'function' &&
      Object.getPrototypeOf(value) === value.constructor.prototype,
      'Pinned deepClone input has a non-class dynamic prototype');
    assert.ok(!(value instanceof Map || value instanceof Set ||
      value instanceof Date || value instanceof RegExp ||
      value instanceof ArrayBuffer || ArrayBuffer.isView(value) ||
      value instanceof WeakMap || value instanceof WeakSet),
    'Pinned deepClone does not copy internal object slots');
    if (Array.isArray(value)) activeArrays.add(value);
    for (const key of Reflect.ownKeys(value)) {
      if (Array.isArray(value) && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(value,key);
      assert.ok(typeof key === 'string' && descriptor.enumerable &&
        Object.hasOwn(descriptor,'value'),
      'Pinned deepClone cannot safely preserve symbol, accessor or non-enumerable properties');
      inspect(descriptor.value);
    }
    if (Array.isArray(value)) activeArrays.delete(value);
    visited.add(value);
  }
  inspect(source);
}

/**
 * The pinned Twinleaf deepClone creates every non-array object with
 * Object.create(source), making the real source object its direct prototype.
 * Restore the original object's class prototype on the clone, keeping the
 * own-field deep-copy intact. Repair repeated array aliases which the vendor
 * helper does not track in its object-only alias map.
 *
 * This only repairs inherited-source links introduced by that vendor clone.
 * It is not a general structural-clone implementation, and it must be tested
 * when Twinleaf's upstream deepClone implementation changes.
 *
 * @param {object} source Original State.
 * @param {object} copy Result of pinned deepClone(source), with no ignores.
 * @returns {object} Cloned state with source prototypes detached.
 */
function normalizeDeepClonePrototypes(source,copy) {
  const canonical=new WeakMap();
  function visit(src,dst,owner,key) {
    if(src===null||typeof src!=='object')return;
    assert.ok(dst!==null&&typeof dst==='object','Clone lost an object');
    assert.notStrictEqual(src,dst,'Clone retains a live object identity');
    if(canonical.has(src)) {
      const first=canonical.get(src);
      if(dst!==first) {
        assert.ok(owner!==undefined,'Duplicate root graph identity');
        owner[key]=first;
      }
      return;
    }
    canonical.set(src,dst);
    if(Object.getPrototypeOf(dst)===src) {
      Object.setPrototypeOf(dst,Object.getPrototypeOf(src));
    }
    if(Array.isArray(src)){
      assert.ok(Array.isArray(dst),'Array clone was not an array');
      assert.equal(dst.length,src.length);
      for(let i=0;i<src.length;i+=1)visit(src[i],dst[i],dst,i);
    } else {
      for(const key of Object.keys(src))visit(src[key],dst[key],dst,key);
    }
  }
  visit(source,copy);
  return copy;
}
module.exports={normalizeDeepClonePrototypes,assertVendorCloneCompatibleSource};
