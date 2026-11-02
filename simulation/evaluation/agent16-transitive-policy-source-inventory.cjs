'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent16-static-local-cjs-closure-and-env-v1';

/** @param {Buffer} bytes @returns {string} */
function gitBlobHash(bytes){
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}

/**
 * Read-only inventory of statically referenced local CommonJS modules and
 * the process.env.KEY mentions in their source text. This provides a
 * reproducible proposal for a release-profile source manifest.
 *
 * The graph is intentionally NOT described as complete: dynamic require,
 * engine(path), lazy runtime loaders, ESM import, vendor dependencies and
 * evaluated conditional requirements may escape this static scanner.
 *
 * @param {string} repoRoot
 * @param {string[]} roots Paths relative to the repository root
 * @returns {object}
 */
function scanPolicySourceClosure(repoRoot,roots){
  assert.ok(typeof repoRoot==='string'&&repoRoot.length>0);
  assert.ok(Array.isArray(roots)&&roots.length>0);
  const base=fs.realpathSync(repoRoot);
  const inside=absolute=>{
    const relative=path.relative(base,absolute);
    return relative===''||
      (!relative.startsWith('..'+path.sep)&&relative!=='..'&&
        !path.isAbsolute(relative));
  };
  const queue=roots.map(p=>{
    assert.ok(typeof p==='string'&&p.length>0);
    const absolute=fs.realpathSync(path.resolve(base,p));
    assert.ok(inside(absolute),'Root cannot escape repository');
    return absolute;
  });
  const visited=new Set(),records=[],env=new Set();
  const unparsedRequires=[],computedRequireSites=[],
    unresolvedRelative=[],externalPackages=[];
  while(queue.length){
    const file=queue.shift();
    if(visited.has(file))continue;
    assert.ok(inside(file),'Module escaped repository during scan');
    visited.add(file);
    const bytes=fs.readFileSync(file);
    const relative=path.relative(base,file).split(path.sep).join('/');
    const text=bytes.toString('utf8');
    const keys=[...new Set([...text.matchAll(
      /\bprocess\.env\.([A-Za-z_][A-Za-z0-9_]*)/g)]
      .map(m=>m[1]))].sort();
    keys.forEach(key=>env.add(key));
    records.push({path:relative,gitBlobSha:gitBlobHash(bytes),keys});
    if(!/\.(cjs|js|mjs)$/.test(file))continue;
    // Native CJS string-literal imports only. Bare package names are noted
    // separately and require their lockfile/vendor revision in a real freeze.
    const staticRequires=[...text.matchAll(
      /\brequire\s*\(\s*(['"])([^'"]+)\1\s*\)/g)];
    const allCalls=[...text.matchAll(/\brequire\s*\(/g)];
    const staticPositions=new Set(staticRequires.map(m=>m.index));
    const missed=allCalls.filter(m=>!staticPositions.has(m.index));
    if(missed.length){
      unparsedRequires.push({path:relative,count:missed.length});
      for(const m of missed){
        const suffix=text.slice(m.index+m[0].length);
        const shape=/^\s*([\w.]+)/.exec(suffix)?.[1]??'unclassified';
        computedRequireSites.push({path:relative,shape});
      }
    }
    for(const m of staticRequires){
      const spec=m[2];
      if(!spec.startsWith('.')&&!path.isAbsolute(spec)){
        externalPackages.push({path:relative,spec});
        continue;
      }
      let resolved;
      try{resolved=require.resolve(path.resolve(path.dirname(file),spec));}
      catch(e){
        unresolvedRelative.push({path:relative,spec,error:e.code??'unknown'});
        continue;
      }
      const real=fs.realpathSync(resolved);
      if(!inside(real)){
        unresolvedRelative.push({path:relative,spec,error:'outside-repo'});
        continue;
      }
      if(!visited.has(real))queue.push(real);
    }
  }
  records.sort((a,b)=>a.path.localeCompare(b.path,'en'));
  const hashMaterial=records.map(x=>x.path+'\t'+x.gitBlobSha).join('\n');
  const sourceDigestSha256=createHash('sha256')
    .update(hashMaterial,'utf8').digest('hex');
  const sort=(a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b),'en');
  return {
    version:VERSION,roots:roots.slice(),sourceCount:records.length,
    sourceDigestSha256,records,envKeys:[...env].sort(),
    unparsedRequires:unparsedRequires.sort(sort),
    unresolvedRelative:unresolvedRelative.sort(sort),
    computedRequireShapeCounts:Object.fromEntries([...new Set(
      computedRequireSites.map(site=>site.shape))].sort().map(shape=>[
      shape,computedRequireSites.filter(site=>site.shape===shape).length])),
    nonPathJoinComputedRequires:computedRequireSites.filter(site=>
      site.shape!=='path.join').sort(sort),
    externalPackages:externalPackages.sort(sort),
    fullTransitiveBehaviorCertified:false,
    staticLocalCommonJsOnly:true,
    qualification:'audit-only-dependency-coverage-not-a-release-policy'
  };
}

module.exports={VERSION,gitBlobHash,scanPolicySourceClosure};
