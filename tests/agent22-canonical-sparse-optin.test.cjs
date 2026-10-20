'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');

/** @param {string} name @param {string[]} hits */
function adapter(name,hits){
  return run=>{
    hits.push('install:'+name);
    const result=run();
    hits.push('restore:'+name);
    return {result,audit:{version:name,accepted:1,
      nativePromptPostconditionsConfirmed:1}};
  };
}

test('sparse owner-search opt-in selects the injectable adapter without default drift',()=>{
  const common=require.resolve(
    '../simulation/twinleaf/agent41-actor-owner-single-search.cjs');
  const sparse=require.resolve(
    '../simulation/twinleaf/agent22-sparse-owner-search-adapter.cjs');
  const priorCommon=require.cache[common],priorSparse=require.cache[sparse];
  const env=process.env.AGENT22_SPARSE_OWNER_BUNDLE_DEV;
  const hits=[];
  const use=name=>{
    const root=adapter('root',hits);
    const other=label=>adapter(label,hits);
    return withCanonicalActorOnlyPolicy(()=>27,{
      root,fog:other('fog'),select:other('select'),
      option:other('option'),attack:other('attack')
    },{ownerSingleSearch:true});
  };
  try{
    require.cache[common]={id:common,filename:common,loaded:true,
      exports:{withActorOwnerSingleSearch:adapter('common-owner',hits)}};
    require.cache[sparse]={id:sparse,filename:sparse,loaded:true,
      exports:{withSparseActorOwnerSearch:adapter('sparse-owner',hits)}};
    delete process.env.AGENT22_SPARSE_OWNER_BUNDLE_DEV;
    const normal=use('normal');
    assert.equal(normal.result,27);
    assert.equal(normal.audit.componentVersions.ownerSearch,'common-owner');
    assert.ok(hits.includes('install:common-owner'));
    assert.equal(hits.includes('install:sparse-owner'),false);
    hits.length=0;
    process.env.AGENT22_SPARSE_OWNER_BUNDLE_DEV='true';
    const selected=use('sparse');
    assert.equal(selected.result,27);
    assert.equal(selected.audit.componentVersions.ownerSearch,'sparse-owner');
    assert.ok(hits.includes('install:sparse-owner'));
    assert.equal(hits.includes('install:common-owner'),false);
    assert.equal(selected.audit.qualification.competitiveGames,0);
  }finally{
    if(priorCommon)require.cache[common]=priorCommon;
    else delete require.cache[common];
    if(priorSparse)require.cache[sparse]=priorSparse;
    else delete require.cache[sparse];
    if(env===undefined)delete process.env.AGENT22_SPARSE_OWNER_BUNDLE_DEV;
    else process.env.AGENT22_SPARSE_OWNER_BUNDLE_DEV=env;
  }
});
