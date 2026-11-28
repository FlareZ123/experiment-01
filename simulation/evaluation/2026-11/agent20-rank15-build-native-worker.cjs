#!/usr/bin/env node
'use strict';

/*
 * Development-only native V3 worker packaging for original Aichi rank15.
 * This script never changes the engine, dispatches CI, claims performance,
 * or silently registers the policy as a qualified field opponent.
 * The shared agent49 worker loads the literal filename "policy.cjs" beside
 * itself; packaging it with the protocol removes the prior manual-copy gap.
 *
 * Usage:
 *   node simulation/evaluation/2026-11/agent20-rank15-build-native-worker.cjs --out /tmp/rank15-worker
 *
 * Output: policy.cjs, agent49-policy-worker.cjs, agent49-policy-protocol.cjs,
 * original-source-deck.json and manifest.json. Run the emitted worker only
 * under the approved pinned-Store experiment with genuine V3 request inputs.
 */
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const LOCAL=__dirname;
const NAMES=Object.freeze([
  ['policy.cjs','agent20-rank15-lopunny-vileplume-opponent-policy.cjs'],
  ['agent49-policy-worker.cjs','agent49-policy-worker.cjs'],
  ['agent49-policy-protocol.cjs','agent49-policy-protocol.cjs'],
  ['original-source-deck.json','agent20-rank15-engine-opponent-deck.json']
]);
// The strict Agent49 init contract requires config={} for every role. The
// optional *packaged* playable mode therefore adapts the factory in the
// research-owned policy source, not in the protocol, without trusting an
// impossible nonempty config field or changing shared vendor code.
const PLAYABLE_POLICY_SUFFIX=String.raw`
;(function(){
  const strictFactory=module.exports.createPolicy;
  module.exports.createPolicy=function constructorWithPassFallback(init){
    if(init&&init.config&&Object.keys(init.config).length===0)
      return strictFactory({...init,config:{allowPassFallback:true}});
    return strictFactory(init);
  };
})();
`;
function sha(bytes){return crypto.createHash('sha256').update(bytes).digest('hex');}
function loadSource60(file){
  const src=JSON.parse(fs.readFileSync(file,'utf8'));
  if(src.source_rank!==15||src.card_count!==60||
     !Array.isArray(src.cards)||src.cards.length!==35||
     src.cards.some(c=>typeof c.printing!=='string'||c.printing.length<3||
       !Number.isInteger(c.count)||c.count<=0||c.count>4)||
     src.cards.reduce((n,c)=>n+c.count,0)!==60||
     new Set(src.cards.map(c=>c.printing)).size!==35)
    throw new Error('RANK15_SOURCE_60_MISMATCH');
  if(Object.keys(src.aliases??{}).length!==2||
    src.aliases['Karen XYP 177']!=='Karen PR-XY XY177'||
    src.aliases['Grass Energy MEE 9']!=='Grass Energy BLW 105')
    throw new Error('RANK15_SOURCE_ALIAS_MISMATCH');
  return src;
}
function bundle({out,allowExisting=false,mode='strict'}={}){
  if(mode!=='strict'&&mode!=='playable')throw new Error('INVALID_BUNDLE_MODE');
  const dest=out?path.resolve(out):fs.mkdtempSync(path.join(os.tmpdir(),'agent20-rank15-v3-'));
  if(fs.existsSync(dest)){
    if(!allowExisting&&fs.readdirSync(dest).length)throw new Error('BUNDLE_OUTPUT_NOT_EMPTY');
    if(!fs.statSync(dest).isDirectory())throw new Error('BUNDLE_OUTPUT_NOT_DIR');
  }else fs.mkdirSync(dest,{recursive:true});
  const original=loadSource60(path.join(LOCAL,'agent20-rank15-engine-opponent-deck.json'));
  // Ensure exact template and its metadata, not merely an arbitrary 60.
  const bytes={};
  for(const [output,input] of NAMES){
    let content=fs.readFileSync(path.join(LOCAL,input));
    if(output==='policy.cjs'&&mode==='playable')
      content=Buffer.from(content.toString('utf8')+PLAYABLE_POLICY_SUFFIX,'utf8');
    bytes[output]=content;
  }
  for(const [output,content] of Object.entries(bytes)){
    const file=path.join(dest,output);
    fs.writeFileSync(file,content,{flag:allowExisting?'w':'wx',mode:0o600});
  }
  const manifest={
    schema:'agent20-rank15-unqualified-v3-bundle-v1',
    source_rank:15,
    source_list_sha1:original.source_blob_sha1,
    source_card_count:60,
    original_source_printings:35,
    aliases:original.aliases,
    protocol:'agent49',
    policyVersion:'agent20-rank15-lopunny-vileplume-opponent-v1',
    status:'DEVELOPMENT_ONLY_NOT_BENCHMARK_QUALIFIED',
    mode,
    passFallback:mode==='playable'?'OPT_IN_AT_BUNDLE_BUILD':'STRICT_ABSTENTION',
    workerInitConfig:{}, // Agent49 validateInit requires exactly empty {}.
    files:Object.fromEntries(Object.entries(bytes).map(([name,value])=>[
      name,{sha256:sha(value),bytes:value.length}
    ])),
    run_worker:['node',path.join(dest,'agent49-policy-worker.cjs')],
    note:'Native worker requires approved live Store V3 init/requests; no match was run by packaging.'
  };
  fs.writeFileSync(path.join(dest,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',
    {flag:allowExisting?'w':'wx',mode:0o600});
  return {outDir:dest,manifest};
}
if(require.main===module){
  const args=process.argv.slice(2);
  if(!([2,3].includes(args.length)&&args[0]==='--out'&&args[1]&&
    (args.length===2||args[2]==='--playable'))){
    process.stderr.write('Usage: node agent20-rank15-build-native-worker.cjs --out EMPTY_DIRECTORY [--playable]\n');
    process.exitCode=2;
  }else{
    try{const result=bundle({out:args[1],mode:args[2]==='--playable'?'playable':'strict'});
      process.stdout.write(JSON.stringify(result,null,2)+'\n');
    }catch(error){process.stderr.write('RANK15_PACKAGE_ERROR '+error.message+'\n');process.exitCode=1;}
  }
}
module.exports={bundle,loadSource60,NAMES,PLAYABLE_POLICY_SUFFIX,sha};
