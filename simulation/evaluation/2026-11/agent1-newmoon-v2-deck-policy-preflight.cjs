'use strict';
/* Research-only fixed-60 and policy-source binding preflight. No native game,
 * no CI dispatch, no worker launch or registered V3 role manifest.
 *
 * node simulation/evaluation/2026-11/agent1-newmoon-v2-deck-policy-preflight.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {DECK_SHA,POLICY_VERSION,createPolicy}=
  require('./agent1-newmoon-v2-jammer-decision.cjs');
const protocol=require('./agent49-policy-protocol.cjs');
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
const die=message=>{throw Error('NEWMOON_V2_BINDING_FAILED: '+message)};
const repoRoot=path.resolve(__dirname,'../../..');
const deckPath=path.join(repoRoot,'results/als/new-moon-tool-jammer-v2-60.json');
const policyPath=path.join(__dirname,'agent1-newmoon-v2-jammer-decision.cjs');
const deck=JSON.parse(fs.readFileSync(deckPath,'utf8'));
if(!Array.isArray(deck.entries)||deck.entries.length!==35)
  die('Unexpected fixed-60 identity count');
const counts=new Map();
const byType={};
for(const row of deck.entries){
 if(!row||typeof row.id!=='string'||!row.id||typeof row.name!=='string'||
    !Number.isSafeInteger(row.count)||row.count<1||
    !['Pokémon','Trainer','Energy'].includes(row.type)||counts.has(row.id))
   die('Invalid or duplicate card entry');
 if(row.count>4&&row.name!=='Basic Psychic Energy')
   die('Copy limit exceeded');
 counts.set(row.id,row.count);
 byType[row.type]=(byType[row.type]??0)+row.count;
}
const total=[...counts.values()].reduce((a,b)=>a+b,0);
if(total!==60||deck.counts?.total!==60||deck.counts?.unique!==35||
   byType.Pokémon!==19||byType.Trainer!==35||byType.Energy!==6)
 die('Fixed 60 total or type distribution changed');
if(counts.get('swsh5-136')!==1||counts.get('xy6-89')!==1||
   counts.get('sv6pt5-19')!==2||counts.get('swsh4-69')!==2)
 die('Lockbreak carriers/counts changed');
const canonical=[...counts].map(([id,count])=>id+':'+count).sort()
  .join('\n')+'\n';
const deckDigest=sha256(Buffer.from(canonical,'utf8'));
if(deckDigest!==DECK_SHA||deckDigest!==deck.canonical_id_count_sha256)
 die('Canonical fixed-60 hash mismatch');
const policyBytes=fs.readFileSync(policyPath);
const policySourceSha256=sha256(policyBytes);
const init={schema:protocol.INIT_SCHEMA,type:'init',role:'candidate',seat:0,
 policyVersion:POLICY_VERSION,bundleSha256:policySourceSha256,config:{}};
protocol.validateInit(init);
const policy=createPolicy({role:init.role,seat:init.seat,
 policyVersion:init.policyVersion,config:init.config});
if(typeof policy.decide!=='function'||
   typeof policy.decideWithAudit!=='function')
 die('Candidate policy exports do not satisfy worker contract');
// This is a source-byte SHA for an eventual role bundle, not evidence that a
// runner has pinned or loaded a matching bundle/deck or authorized a game.
const result={schema:'agent1-newmoon-v2-research-binding-preflight-v0',
 deploymentGate:'NOT_ADMITTED',deckPath:path.relative(repoRoot,deckPath),
 fixed60Count:total,uniquePrintings:counts.size,canonicalIdCountSha256:deckDigest,
 policySourcePath:path.relative(repoRoot,policyPath),policySourceSha256,
 workerInit: init,qualifiedGameCount:0,nativeStoreExecuted:false};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
module.exports=result;
