'use strict';

const crypto = require('node:crypto');

/**
 * Canonically describe the own-data graph behind a live Store. Object aliasing,
 * class names, sparse Arrays, descriptors and Map/Set entries are preserved.
 * Logging timestamps and the host handler are excluded. A function's source
 * text cannot prove equality of its captured lexical environment.
 *
 * @param {object} store Actual root Twinleaf Store.
 * @returns {{schema:string,digest:string,nodes:number,opaqueFunctions:number,excluded:string[]}}
 */
function storeDataGraphFingerprint(store) {
  if (!store || !store.state) throw new TypeError('Expected a Store with State');
  const seen = new WeakMap();
  const nodes = [];
  let opaqueFunctions = 0;

  /** @param {unknown} value @returns {unknown} */
  function visit(value) {
    if (value === null) return ['null'];
    const type = typeof value;
    if (type === 'undefined') return ['undefined'];
    if (type === 'string' || type === 'boolean') return [type,value];
    if (type === 'number') {
      return ['number',Object.is(value,-0) ? '-0' : String(value)];
    }
    if (type === 'bigint') return ['bigint',String(value)];
    if (type === 'symbol') {
      throw new TypeError('Symbol values have no stable cross-process identity');
    }
    if (type === 'function') {
      opaqueFunctions++;
      return ['function',value.name,value.length,
        Function.prototype.toString.call(value)];
    }
    if (seen.has(value)) return ['ref',seen.get(value)];
    const id = nodes.length;
    seen.set(value,id);
    const prototype = Object.getPrototypeOf(value);
    const className = prototype?.constructor?.name ?? 'null';
    const record = {className,fields:[]};
    nodes.push(record);

    if (value instanceof Map) {
      record.entries = [...value].map(([key,item])=>[visit(key),visit(item)]);
      return ['ref',id];
    }
    if (value instanceof Set) {
      record.entries = [...value].map(visit);
      return ['ref',id];
    }
    if (value instanceof Date) {
      record.time = value.getTime();
      return ['ref',id];
    }
    if (value instanceof RegExp) {
      record.regexp = [value.source,value.flags,value.lastIndex];
    }
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer ||
        value instanceof WeakMap || value instanceof WeakSet) {
      throw new TypeError('Opaque built-in object in Store graph: '+className);
    }

    const keys = Reflect.ownKeys(value);
    if (keys.some(key=>typeof key==='symbol')) {
      throw new TypeError('Symbol property in Store graph: '+className);
    }
    keys.sort();
    for (const key of keys) {
      const desc = Object.getOwnPropertyDescriptor(value,key);
      const flags = [desc.enumerable,desc.configurable];
      if (Object.hasOwn(desc,'value')) {
        flags.push(desc.writable);
        const captured = value===store.state && key==='logs'
          ? ['log-count',value.logs.length] : visit(desc.value);
        record.fields.push([key,flags,captured]);
      } else {
        flags.push('accessor');
        record.fields.push([key,flags,desc.get?.name??null,
          desc.set?.name??null]);
      }
    }
    return ['ref',id];
  }

  // Store.handler is a transport-side observer and can contain environment
  // closures. Every other enumerable Store field is included automatically,
  // including promptItems, waitItems and trainerPromptSources.
  const storeFields = Object.keys(store).filter(key=>key!=='handler').sort();
  const root = storeFields.map(key=>[key,visit(store[key])]);
  const data = JSON.stringify({root,nodes});
  return {
    schema:'live-store-data-graph-except-logs-v1',
    digest:crypto.createHash('sha256').update(data).digest('hex'),
    nodes:nodes.length,
    opaqueFunctions,
    excluded:['Store.handler','State.logs contents (count retained)',
      'function lexical environments','prototype methods and identities']
  };
}

module.exports = {storeDataGraphFingerprint};
