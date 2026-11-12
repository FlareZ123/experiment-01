'use strict';

const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const {
  canonicalJson,sha256,buildEnvironmentManifest
}=require('./agent36-4410-policy-provenance.cjs');

function relativeWithinRoot(root,filename){
  const relative=path.relative(root,path.resolve(filename));
  if(!relative||relative==='.')return relative||'';
  if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))
    return null;
  return relative.split(path.sep).join('/');
}

function isResearchOwnedPath(root,filename){
  const relative=relativeWithinRoot(root,filename);
  return typeof relative==='string'&&
    (relative.startsWith('simulation/')||relative.startsWith('scripts/'));
}

function isExcludedRepositoryPath(relative){
  return relative.startsWith('vendor/')||relative.startsWith('node_modules/')||
    relative.startsWith('agents/')||relative.startsWith('communications/')||
    relative.startsWith('artifacts/')||relative.startsWith('results/')||
    relative.startsWith('resources/')||relative.startsWith('.github/')||
    relative.startsWith('.git/');
}

/**
 * Capture the pre-deal transitive module.children closure for one role.
 * All decision wrappers and lazy imports must be initialized before calling.
 * Any research module first loaded later is rejected by the paired role guard.
 *
 * @param {{repositoryRoot:string,role:string,entryFiles:string[],config?:object}} args
 * @returns {{manifest:object,sha256:string|null,allowedFiles:string[]}}
 */
function captureRoleEntryManifest(args){
  const root=path.resolve(args.repositoryRoot);
  const role=args.role;
  const entryFiles=args.entryFiles;
  if(typeof role!=='string'||!role.trim())throw new TypeError('role is required');
  if(!Array.isArray(entryFiles)||entryFiles.length===0)
    throw new TypeError('At least one role entry file is required');
  const config=args.config??{};
  // Reject functions, class instances, undefined, non-finite numbers and cycles.
  canonicalJson(config);

  const roots=[];
  const missingEntries=[];
  const normalizedEntries=[];
  for(const entry of entryFiles){
    if(typeof entry!=='string'||!entry.trim())
      throw new TypeError('Role entry paths must be non-empty strings');
    const absolute=path.isAbsolute(entry)?path.resolve(entry):path.resolve(root,entry);
    const relative=relativeWithinRoot(root,absolute);
    normalizedEntries.push(relative??absolute);
    let resolved;
    try{resolved=require.resolve(absolute);}catch(error){
      missingEntries.push({path:relative??absolute,error:String(error?.message||error)});
      continue;
    }
    const loaded=require.cache[resolved];
    if(!loaded){
      missingEntries.push({path:relative??absolute,error:'entry module is not loaded before freeze'});
      continue;
    }
    roots.push(loaded);
  }

  const byPath=new Map();
  const unreadable=[];
  const unclassified=[];
  const visited=new Set();
  function visit(mod){
    if(!mod||typeof mod.filename!=='string')return;
    const absolute=path.resolve(mod.filename);
    if(visited.has(absolute))return;
    visited.add(absolute);
    const relative=relativeWithinRoot(root,absolute);
    if(relative===null)return;
    if(relative.startsWith('simulation/')||relative.startsWith('scripts/')){
      try{
        byPath.set(relative,{path:relative,absolutePath:absolute,
          sha256:fs.readFileSync(absolute).length>=0?
            require('node:crypto').createHash('sha256')
              .update(fs.readFileSync(absolute)).digest('hex'):null});
      }catch(error){
        unreadable.push({path:relative,error:String(error?.message||error)});
      }
      for(const child of mod.children??[])visit(child);
      return;
    }
    if(relative&&!isExcludedRepositoryPath(relative))
      unclassified.push(relative);
  }
  for(const rootModule of roots)visit(rootModule);

  const files=[...byPath.values()].sort((a,b)=>a.path.localeCompare(b.path));
  const publicFiles=files.map(({path,sha256})=>({path,sha256}));
  const environment=files.length?buildEnvironmentManifest(files):{
    schema:'agent36-policy-environment-manifest-v1',values:[],unresolved:[],
    complete:false,sha256:null
  };
  const missingResearchEntries=normalizedEntries.filter(entry=>
    !files.some(file=>file.path===entry));
  const complete=missingEntries.length===0&&unreadable.length===0&&
    unclassified.length===0&&missingResearchEntries.length===0&&
    environment.complete;
  const unsigned={
    schema:'agent41-role-local-policy-entry-manifest-v1',
    role,
    closureMethod:'pre-deal module.children graph from explicit role entry modules; runtime Module._load guard rejects out-of-closure research modules',
    entryFiles:normalizedEntries,
    missingEntries,
    missingResearchEntries,
    unclassifiedRepositoryModules:[...new Set(unclassified)].sort(),
    unreadable,
    files:publicFiles,
    environment,
    config,
    complete
  };
  const digest=complete?sha256(unsigned):null;
  const manifest={...unsigned,sha256:digest};
  return {manifest,sha256:digest,allowedFiles:publicFiles.map(file=>file.path)};
}

/**
 * Freeze research-owned module loading separately for each active role.
 * The V3 runner must wrap each synchronous policy decision/Store step in
 * withRole(role, fn). Common modules must appear in both role closures.
 *
 * @param {{repositoryRoot:string,allowedByRole:Record<string,string[]|object>}} args
 * @returns {{withRole:Function,restore:Function,getActiveRole:Function}}
 */
function installRoleLocalModuleLoadGuard(args){
  const root=path.resolve(args.repositoryRoot);
  const entries=Object.entries(args.allowedByRole??{});
  if(entries.length<2)throw new TypeError('Candidate and opponent closures are required');
  const allowedByRole=new Map();
  for(const [role,value] of entries){
    const paths=Array.isArray(value)?value:
      Array.isArray(value?.allowedFiles)?value.allowedFiles:
      Array.isArray(value?.manifest?.files)?value.manifest.files.map(file=>file.path):null;
    if(!paths||paths.length===0)throw new TypeError('Missing non-empty closure for role '+role);
    const allowed=new Set(paths.map(file=>path.resolve(root,file)));
    allowedByRole.set(role,allowed);
  }

  const original=Module._load;
  if(typeof original!=='function')throw new Error('Node Module._load is unavailable');
  let activeRole=null;
  let restored=false;
  function guardedLoad(request,parent,isMain){
    const resolved=Module._resolveFilename(request,parent,isMain);
    if(typeof resolved==='string'&&path.isAbsolute(resolved)&&
       isResearchOwnedPath(root,resolved)){
      if(activeRole===null)
        throw new Error('Research module load outside an active policy role: '+
          relativeWithinRoot(root,resolved));
      const allowed=allowedByRole.get(activeRole);
      if(!allowed?.has(path.resolve(resolved)))
        throw new Error('Unmanifested research module for '+activeRole+': '+
          relativeWithinRoot(root,resolved));
    }
    return original.apply(this,arguments);
  }
  Module._load=guardedLoad;

  function withRole(role,fn){
    if(restored)throw new Error('Role module guard is already restored');
    if(!allowedByRole.has(role))throw new Error('Unknown policy role: '+role);
    if(typeof fn!=='function')throw new TypeError('withRole requires a function');
    const previous=activeRole;
    activeRole=role;
    try{
      const result=fn();
      if(result&&typeof result.then==='function')
        throw new Error('Role module guard requires synchronous policy execution');
      return result;
    }finally{
      activeRole=previous;
    }
  }

  function restore(){
    if(restored)throw new Error('Role module guard restored twice');
    if(activeRole!==null)throw new Error('Cannot restore role module guard inside a role context');
    if(Module._load!==guardedLoad)
      throw new Error('Role module guard lost Module._load ownership');
    Module._load=original;
    restored=true;
  }

  return {withRole,restore,getActiveRole:()=>activeRole};
}

module.exports={
  relativeWithinRoot,isResearchOwnedPath,
  captureRoleEntryManifest,installRoleLocalModuleLoadGuard
};
