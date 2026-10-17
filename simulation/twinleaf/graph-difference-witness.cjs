'use strict';

/**
 * Reconstruct a readable owner path to the first differing canonical
 * Store-own-data node. The graph already contains only recorded descriptor
 * values; no live objects are examined and no actions are proposed.
 *
 * @param {object} graph Canonical graph produced by storeDataGraphFingerprint.
 * @param {number} wanted Canonical node index.
 * @returns {string|null}
 */
function graphOwnerPath(graph,wanted) {
  const queue=[];
  for(const [key,value] of graph.root) {
    if(value[0]==='ref') queue.push([value[1], 'Store.'+key]);
  }
  const visited=new Set();
  for(let i=0;i<queue.length;i++) {
    const [id,path]=queue[i];
    if(id===wanted) return path;
    if(visited.has(id)) continue;
    visited.add(id);
    const node=graph.nodes[id];
    if(!node) continue;
    for(const [key,,value] of node.fields) {
      if(value?.[0]==='ref') {
        const fragment=node.className==='Array'?'['+key+']':
          /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)?'.'+key:
            '['+JSON.stringify(key)+']';
        queue.push([value[1],path+fragment]);
      }
    }
    if(Array.isArray(node.entries)) {
      for(let entry=0;entry<node.entries.length;entry++) {
        const item=node.entries[entry];
        const vals=Array.isArray(item)&&Array.isArray(item[0])?item:[item];
        for(let j=0;j<vals.length;j++) {
          if(vals[j]?.[0]==='ref')
            queue.push([vals[j][1],path+'.entries['+entry+']['+j+']']);
        }
      }
    }
  }
  return null;
}

/**
 * Convert a canonical graph firstMismatch into a compact human-auditable
 * description. A canonical node number alone does not identify a game field.
 *
 * @param {object} previousGraph
 * @param {object} currentGraph
 * @param {{path:string,before?:unknown,after?:unknown}|null} mismatch
 * @returns {object|null}
 */
function graphDifferenceWitness(previousGraph,currentGraph,mismatch) {
  if(!mismatch) return null;
  const found=/^\$\.nodes\[(\d+)\](?:\.fields\[(\d+)\])?/.exec(mismatch.path);
  if(!found) return {canonicalPath:mismatch.path,
    before:mismatch.before??null,after:mismatch.after??null};
  const index=Number(found[1]),fieldIndex=found[2]===undefined?null:Number(found[2]);
  const before=previousGraph.nodes[index],after=currentGraph.nodes[index];
  const firstField=fieldIndex===null?null:before?.fields[fieldIndex]??null;
  const nextField=fieldIndex===null?null:after?.fields[fieldIndex]??null;
  return {
    canonicalPath:mismatch.path,
    gamePath:graphOwnerPath(previousGraph,index)||
      graphOwnerPath(currentGraph,index),
    className:before?.className??after?.className??null,
    property:firstField?.[0]??nextField?.[0]??null,
    fieldsBefore:before?.fields.length??null,
    fieldsAfter:after?.fields.length??null,
    before:mismatch.before??null,
    after:mismatch.after??null
  };
}
module.exports={graphOwnerPath,graphDifferenceWitness};
