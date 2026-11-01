'use strict';

const {createHash}=require('node:crypto');

/**
 * Research-side, read-only deep fingerprint of native State own data fields.
 * Unlike actorObservation, this audit can detect mutation of the private deck,
 * prizes, attached cards, prompts and turn flags. Its digest must NEVER be
 * supplied to an action scorer or released in an opponent-visible observation.
 *
 * A guard instance holds reference IDs stable across before/after snapshots.
 * It covers ordinary own-data JS objects, cyclic graphs, Maps, Sets and binary
 * views. Accessors are described but never called. Private class fields and
 * closure state are outside this guard: do not label it a complete engine
 * purity proof.
 *
 * @returns {{digest(state:object):string}}
 */
function createNativeStateFingerprintGuard(){
  const refs=new WeakMap(),symbols=new Map();
  let next=1;
  function id(value){
    if(typeof value==='symbol'){
      if(!symbols.has(value))symbols.set(value,next++);
      return symbols.get(value);
    }
    if(!refs.has(value))refs.set(value,next++);
    return refs.get(value);
  }
  function key(value){
    return typeof value==='symbol'?
      'symbol:'+id(value):'string:'+value;
  }
  function walk(value,seen,depth){
    if(depth>128)throw Error('Native state exceeds fingerprint depth limit');
    if(value===null)return null;
    const kind=typeof value;
    if(kind==='undefined')return ['undefined'];
    if(kind==='boolean'||kind==='string')return value;
    if(kind==='number')return Number.isFinite(value)?
      value:['number',String(value)];
    if(kind==='bigint')return ['bigint',value.toString()];
    if(kind==='symbol')return ['symbol',id(value),value.description??null];
    if(kind==='function')return ['function',id(value),
      value.name??'',value.length];
    const reference=id(value);
    if(seen.has(value))return ['reference',reference];
    seen.add(value);
    if(value instanceof WeakMap||value instanceof WeakSet)
      throw Error('Native state contains opaque weak collection');
    if(value instanceof Date)return ['date',reference,value.getTime()];
    if(value instanceof RegExp)
      return ['regexp',reference,value.source,value.flags];
    if(value instanceof Map)
      return ['map',reference,[...value.entries()].map(([k,v])=>[
        walk(k,seen,depth+1),walk(v,seen,depth+1)
      ])];
    if(value instanceof Set)
      return ['set',reference,[...value.values()].map(v=>
        walk(v,seen,depth+1))];
    if(value instanceof ArrayBuffer)
      return ['arraybuffer',reference,
        Buffer.from(value).toString('base64')];
    if(ArrayBuffer.isView(value))
      return ['view',reference,value.constructor?.name??'View',
        Buffer.from(value.buffer,value.byteOffset,value.byteLength)
          .toString('base64')];
    const prototype=Object.getPrototypeOf(value);
    const type=prototype===null?'null-prototype':
      (prototype.constructor?.name??'unknown');
    const descriptors=Object.getOwnPropertyDescriptors(value);
    const properties=Reflect.ownKeys(descriptors)
      .sort((a,b)=>key(a).localeCompare(key(b)))
      .map(name=>{
        const descriptor=descriptors[name];
        return [key(name),descriptor.get||descriptor.set?
          ['accessor',Boolean(descriptor.get),
            Boolean(descriptor.set)]:
          walk(descriptor.value,seen,depth+1)];
      });
    return ['object',reference,type,properties];
  }
  function digest(state){
    const snapshot=walk(state,new WeakSet(),0);
    return createHash('sha256')
      .update(JSON.stringify(snapshot)).digest('hex');
  }
  return {digest};
}

module.exports={createNativeStateFingerprintGuard};
