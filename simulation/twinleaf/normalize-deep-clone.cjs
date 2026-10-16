'use strict';
const assert=require('node:assert/strict');

/**
 * Recover the true class prototype without getters. CardManager's pinned
 * deepClone gives real card instances template-object prototype links.
 * Removing those links is safe only when all intermediate data is own-shadowed.
 * @param {object} value
 * @returns {object}
 */
function stableClassPrototype(value) {
  const dynamic=[],visited=new Set();
  let proto=Object.getPrototypeOf(value);
  while(proto!==null && !visited.has(proto)) {
    visited.add(proto);
    const ctor=Object.getOwnPropertyDescriptor(proto,'constructor');
    if(ctor) {
      assert.ok(Object.hasOwn(ctor,'value') &&
        typeof ctor.value==='function' && ctor.value.prototype===proto,
        'Pinned deepClone input has a non-class dynamic prototype');
      for(const intermediate of dynamic) {
        for(const key of Reflect.ownKeys(intermediate)) {
          const d=Object.getOwnPropertyDescriptor(intermediate,key);
          const own=Object.getOwnPropertyDescriptor(value,key);
          assert.ok(typeof key==='string' && d.enumerable &&
            Object.hasOwn(d,'value') && own && own.enumerable &&
            Object.hasOwn(own,'value'),
            'Pinned deepClone input has a non-class dynamic prototype');
        }
      }
      return proto;
    }
    dynamic.push(proto);
    proto=Object.getPrototypeOf(proto);
  }
  throw new Error('Pinned deepClone input has a non-class dynamic prototype');
}

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
    stableClassPrototype(value);
    assert.ok(!(value instanceof Map || value instanceof Set ||
      value instanceof Date || value instanceof RegExp ||
      value instanceof ArrayBuffer || ArrayBuffer.isView(value) ||
      value instanceof WeakMap || value instanceof WeakSet),
    'Pinned deepClone does not copy internal object slots');
    visited.add(value);
    if (Array.isArray(value)) activeArrays.add(value);
    for (const key of Reflect.ownKeys(value)) {
      if (Array.isArray(value) && key === 'length') continue;
      const descriptor = Object.getOwnPropertyDescriptor(value,key);
      assert.ok(typeof key === 'string' && descriptor.enumerable &&
        Object.hasOwn(descriptor,'value'),
      'Pinned deepClone cannot safely preserve symbol, accessor or non-enumerable properties');
      if (Array.isArray(value)) {
        // The vendor uses Array.map(), which copies indices and discards
        // arbitrary named properties (unlike object-property traversal).
        const index=Number(key);
        assert.ok(Number.isSafeInteger(index) && index>=0 &&
          String(index)===key && index<value.length,
        'Pinned deepClone drops custom Array own properties');
      } else {
        // Object.create(source) then assignment cannot shadow a readonly
        // own data property inherited from the original source object.
        assert.ok(descriptor.writable,
          'Pinned deepClone cannot copy non-writable own properties');
      }
      inspect(descriptor.value);
    }
    if (Array.isArray(value)) activeArrays.delete(value);
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
    // The pinned Simulator may clone an already-detached State a second time.
    // Its final objects then inherit from intermediate *clones*, rather than
    // from src directly. Restore the actual source class prototype in both
    // one-pass and two-pass cases, after the preflight has checked shadowing.
    const classPrototype=stableClassPrototype(src);
    if(Object.getPrototypeOf(dst)!==classPrototype) {
      Object.setPrototypeOf(dst,classPrototype);
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
