'use strict';

// This is only a source-bundle builder. It does not start Twinleaf, register
// a policy, change a gate, run a game, or inspect any private information.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const folder='simulation/evaluation/2026-11/';
const read=p=>fs.readFileSync(path.join(root,p));
const sha=(algorithm,value)=>crypto.createHash(algorithm).update(value).digest('hex');
const blob=b=>sha('sha1',Buffer.concat([Buffer.from('blob '+b.length+'\0'),b]));
const base=read(folder+'agent50-rank4-raichu-electrode-opponent-policy-v2.cjs');
const overlay=read(folder+'agent50-rank17-family-overlay.inc.js');
const source=read('results/aichi-2026/full-decklists.json');
assert.equal(blob(base),'6897cd7f73ad8be8c01eafb97295fed6d74d376e','unexpected family base; review and deliberately repin');
assert.equal(blob(source),'ae773f6201d7aa69d31914dbfee66f3fba692200','unexpected source-list blob; review and deliberately repin');
const row=JSON.parse(source).decks.find(x=>x.rank===17);
assert.ok(row);
assert.equal(row.cards.reduce((n,c)=>n+c.count,0),60);
assert.equal(sha('sha256',JSON.stringify(row)),'41743dd93f080bff72981d0245b24df7615be3b1d3a03900e673a0dc2b6a2083','rank17 entry changed');
const tuples=row.cards.map(c=>[c.name,c.printing.set,c.printing.number,c.printing.language,c.count]);
tuples.sort((a,b)=>{for(let i=0;i<a.length;i++){if(a[i]!==b[i])return a[i]<b[i]?-1:1;}return 0;});
assert.equal(sha('sha256',JSON.stringify(tuples)),'2f23d234c18c648170dca695c51b64554af6f036c800fd9c34eb53b6dcba2ac0','rank17 inventory changed');
const result=Buffer.concat([base,Buffer.from('\n'),overlay]);
const dest=path.join(root,folder+'agent50-rank17-raichu-electrode-opponent-policy.cjs');
if(process.argv.includes('--check'))assert.deepEqual(fs.readFileSync(dest),result,'generated worker is stale; rebuild');
else fs.writeFileSync(dest,result);
process.stdout.write(JSON.stringify({status:'rank17-source-bound-bundle',sourceBlob:blob(source),workerBlob:blob(result),check:process.argv.includes('--check')})+'\n');
