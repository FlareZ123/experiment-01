'use strict';

const assert=require('node:assert/strict');
const {stableClassPrototype}=require('./normalize-deep-clone.cjs');

/**
 * Find the earliest graph descriptor, primitive, class or identity-alias
 * mismatch between a genuine State and its detached clone. Reports the
 * property path and mismatch category only. No original or cloned card
 * identities, physical values or hidden Prize/hand strings are emitted.
 *
 * This is a read-only diagnostic of the same descriptor graph hashed by
 * stateGraphFingerprint. It intentionally avoids invoking getters.
 *
 * @param {unknown} source
 * @param {unknown} copy
 * @param {{maxNodes?:number,canonicalClassPrototypes?:boolean}} [options]
 * @returns {{matched:boolean,category:string|null,path:string[],
 *   nodesChecked:number,sourceType?:string,copyType?:string}}
 */
function firstNativeCloneStructureDifference(source,copy,
  {maxNodes=200000,canonicalClassPrototypes=false}={}) {
  assert.ok(Number.isSafeInteger(maxNodes)&&maxNodes>=1);
  const queue=[{a:source,b:copy,parent:-1,key:'State'}];
  const seenA=new WeakMap(),seenB=new WeakMap();
  let objects=0,checked=0;
  const pathAt=index=>{
    const names=[];
    while(index>=0) {
      names.unshift(String(queue[index].key));
      index=queue[index].parent;
    }
    return names;
  };
  const mismatch=(index,category,detail={})=>({
    matched:false,category,path:pathAt(index),
    nodesChecked:checked,...detail
  });
  const className=value=>{
    const proto=canonicalClassPrototypes?
      stableClassPrototype(value):Object.getPrototypeOf(value);
    const descriptor=proto&&Object.getOwnPropertyDescriptor(proto,'constructor');
    return typeof descriptor?.value==='function'?
      descriptor.value.name:Array.isArray(value)?'Array':'object';
  };
  const keyName=key=>typeof key==='symbol'?String(key):String(key);
  for(let head=0;head<queue.length;head++) {
    const item=queue[head];checked++;
    if(checked>maxNodes)return mismatch(head,'graph-size-budget-exceeded');
    const {a,b}=item;
    if(a===null||b===null) {
      if(a!==b)return mismatch(head,'null-value-mismatch');
      continue;
    }
    const ta=typeof a,tb=typeof b;
    if(ta!==tb)return mismatch(head,'value-type-mismatch',{
      sourceType:ta,copyType:tb
    });
    if(ta!=='object') {
      if(!Object.is(a,b))return mismatch(head,'primitive-value-mismatch',{
        sourceType:ta,copyType:tb
      });
      continue;
    }
    const sa=seenA.get(a),sb=seenB.get(b);
    if(sa!==undefined||sb!==undefined) {
      if(sa!==sb)return mismatch(head,'object-alias-topology-mismatch');
      continue;
    }
    seenA.set(a,objects);seenB.set(b,objects);objects++;
    if(className(a)!==className(b))
      return mismatch(head,'prototype-class-mismatch',{
        sourceType:className(a),copyType:className(b)
      });
    const ka=Reflect.ownKeys(a),kb=Reflect.ownKeys(b);
    if(ka.length!==kb.length)
      return mismatch(head,'own-key-count-mismatch');
    for(let i=0;i<ka.length;i++) {
      const left=ka[i],right=kb[i];
      if(keyName(left)!==keyName(right))
        return mismatch(head,'own-key-order-or-identity-mismatch');
      const da=Object.getOwnPropertyDescriptor(a,left);
      const db=Object.getOwnPropertyDescriptor(b,right);
      const pathNode={a:da?.value,b:db?.value,parent:head,key:keyName(left)};
      const index=queue.length;queue.push(pathNode);
      if(!da||!db)return mismatch(index,'descriptor-missing');
      for(const flag of ['enumerable','configurable']) {
        if(da[flag]!==db[flag])
          return mismatch(index,flag+'-descriptor-mismatch');
      }
      const va=Object.hasOwn(da,'value'),vb=Object.hasOwn(db,'value');
      if(va!==vb)return mismatch(index,'data-vs-accessor-mismatch');
      if(va) {
        if(da.writable!==db.writable)
          return mismatch(index,'writable-descriptor-mismatch');
      } else {
        for(const flag of ['get','set']) {
          if((da[flag]?.name??null)!==(db[flag]?.name??null))
            return mismatch(index,flag+'-accessor-mismatch');
        }
        queue.pop();
      }
    }
  }
  return {matched:true,category:null,path:[],nodesChecked:checked};
}

module.exports={firstNativeCloneStructureDifference};
