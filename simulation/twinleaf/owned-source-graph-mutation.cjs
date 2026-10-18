'use strict';

/**
 * Compare original object *identities* and own-data descriptors before/after
 * a synchronous bot decision. This is an exact boundary check for enumerated
 * reachable JavaScript object descriptors, independent of cloned Card types.
 *
 * Does not introspect internal slots of Map, Set or WeakMap, closures, native
 * methods, module-global registries, or effects that mutate and then restore
 * the source before the decision returns.
 *
 * @param {object} root
 * @returns {{entries:Map<object,object>,paths:Map<object,string>}}
 */
function snapshotOwnedGraph(root) {
  if(root===null||typeof root!=='object') {
    throw new TypeError('Expected live root State object');
  }
  const entries=new Map(),paths=new Map();
  /** @param {object} obj @param {string} path */
  function visit(obj,path) {
    if(entries.has(obj))return;
    const descriptors=Object.getOwnPropertyDescriptors(obj);
    entries.set(obj,{
      prototype:Object.getPrototypeOf(obj),
      descriptors
    });
    paths.set(obj,path);
    for(const key of Reflect.ownKeys(descriptors)) {
      const descriptor=descriptors[key];
      if(!Object.hasOwn(descriptor,'value'))continue;
      const child=descriptor.value;
      if(child!==null && typeof child==='object') {
        visit(child,path+'.'+String(key));
      }
    }
  }
  visit(root,'state');
  return {entries,paths};
}

/**
 * Detect mutations of objects existing at the entry snapshot. The diagnostic
 * witnesses changes without serializing hidden cards or invoking own getters.
 * @param {{entries:Map<object,object>,paths:Map<object,string>}} entry
 * @param {{maxExamples?:number}} options
 * @returns {{objectsObserved:number,changedObjects:number,changedFields:number,
 *   byKind:object,examples:Array<object>}}
 */
function compareOwnedGraphSnapshot(entry,{maxExamples=36}={}) {
  const byKind={},examples=[];
  let changedObjects=0,changedFields=0;
  /** @param {string} kind @param {string} path */
  function change(kind,path) {
    byKind[kind]=(byKind[kind]||0)+1;
    changedFields++;
    if(examples.length<maxExamples)examples.push({kind,path});
  }
  for(const [object,before] of entry.entries) {
    const path=entry.paths.get(object);
    const older=before.descriptors;
    const newer=Object.getOwnPropertyDescriptors(object);
    let changed=false;
    if(Object.getPrototypeOf(object)!==before.prototype){
      changed=true;
      change('prototype',path);
    }
    for(const key of new Set([
      ...Reflect.ownKeys(older),...Reflect.ownKeys(newer)
    ])) {
      const k=String(key);
      const a=older[key],b=newer[key];
      if(a===undefined||b===undefined){
        changed=true;
        change(a===undefined?'added-property':'deleted-property',path+'.'+k);
        continue;
      }
      if(a.configurable!==b.configurable ||
         a.enumerable!==b.enumerable ||
         (Object.hasOwn(a,'value')!==Object.hasOwn(b,'value'))){
        changed=true;change('descriptor-shape',path+'.'+k);continue;
      }
      if(Object.hasOwn(a,'value')){
        if(a.writable!==b.writable){
          changed=true;change('writability',path+'.'+k);
        }
        if(!Object.is(a.value,b.value)){
          changed=true;
          change((typeof a.value==='object'||typeof b.value==='object')?
            'reference-or-object-value':'scalar-value',path+'.'+k);
        }
      }else if(a.get!==b.get || a.set!==b.set){
        changed=true;change('accessor-identity',path+'.'+k);
      }
    }
    if(changed)changedObjects++;
  }
  return {
    objectsObserved:entry.entries.size,changedObjects,changedFields,
    byKind,examples
  };
}

module.exports={snapshotOwnedGraph,compareOwnedGraphSnapshot};
