'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const path=require('node:path');
const source=require('../../results/als/new-moon-perfection-english-map.json');
const candidate=require('../../results/als/new-moon-hood-english-proxy-60.json');
const legality=require('../../results/legality/japan-expanded-aichi-2026.json');

/** @param {{id:string,count:number}[]} entries */
function idCountHash(entries) {
  const rows=entries.map(e=>[e.id,e.count]).sort((a,b)=>a[0].localeCompare(b[0],'en'));
  return createHash('sha256').update(rows.map(([id,n])=>id+':'+n+'\n').join('')).digest('hex');
}

/** Pure frozen-source/print count and ban identity checks. */
function verifyManifest() {
  assert.equal(source.entries.length,33);
  assert.equal(candidate.entries.length,33);
  assert.equal(source.entries.reduce((n,e)=>n+e.count,0),60);
  assert.equal(candidate.entries.reduce((n,e)=>n+e.count,0),60);
  assert.equal(idCountHash(source.entries),source.sha256_id_counts);
  assert.equal(idCountHash(candidate.entries),candidate.candidate_sha256_id_counts);
  assert.equal(candidate.source_sha256_id_counts,source.sha256_id_counts);
  const difference={};
  for(const e of source.entries)difference[e.id]=(difference[e.id]||0)-e.count;
  for(const e of candidate.entries) {
    assert.ok(Number.isInteger(e.count)&&e.count>=1&&e.count<=4);
    assert.ok(!legality.banned_identities.some(b=>
      b.selector.type==='trainer_name'&&b.english_name===e.name),
      'Candidate includes Japanese paper-banned Trainer: '+e.name);
    difference[e.id]=(difference[e.id]||0)+e.count;
  }
  assert.deepEqual(Object.fromEntries(Object.entries(difference).filter(([,n])=>n)),
    {'xy6-92':-2,'sm10-186':2});
  assert.deepEqual([
    candidate.entries.slice(0,14).reduce((s,e)=>s+e.count,0),
    candidate.entries.slice(14,31).reduce((s,e)=>s+e.count,0),
    candidate.entries.slice(31).reduce((s,e)=>s+e.count,0)
  ],[19,35,6]);
  assert.equal(candidate.entries.filter(e=>e.name==='Secret Box').length,1);
  return {total:60,sha256:candidate.candidate_sha256_id_counts,
    replacedTrainersMail:2,addedStealthyHood:2};
}

/** Check all 60 printed engine fullNames and Expanded deck acceptance. */
function validate() {
  const manifest=verifyManifest();
  const {initializeCards}=require('./headless.cjs');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {DeckAnalyser}=require(path.join(output,'game/cards/deck-analyser'));
  const {Format}=require(path.join(output,'game/store/card/card-types'));
  const manager=initializeCards();
  const fullNames=[],printed=[];
  for(const e of candidate.entries) {
    const card=manager.getCardByName(e.twinleaf_full_name);
    assert.ok(card,'Pinned Twinleaf missing '+e.twinleaf_full_name);
    assert.equal(card.fullName,e.twinleaf_full_name);
    if(e.signature && e.name!=='Stealthy Hood') {
      assert.ok([...(card.powers||[]).map(p=>p.name),
        ...(card.attacks||[]).map(a=>a.name)].includes(e.signature),
      'Mechanic mismatch: '+e.name);
    }
    if(e.name==='Stealthy Hood') {
      assert.ok((card.rules||[]).some(t=>/Prevent all effects of your opponent.s Abilities/.test(t)),
        'Wrong Stealthy Hood mechanical effect');
    }
    for(let i=0;i<e.count;i++)fullNames.push(card.fullName);
    printed.push({id:e.id,card:e.name,count:e.count,fullName:card.fullName});
  }
  assert.equal(fullNames.length,60);
  assert.equal(new DeckAnalyser(fullNames).isValid(Format.EXPANDED),true,
    'Pinned Expanded validator rejects frozen Hood comparator');
  return {schema:'new-moon-two-hood-print-acceptance-v1',...manifest,
    compiledTwinleafAccepted:true,paperJapanesePrintingVerified:false,
    qualifiedForCompetitiveInference:false,printed};
}

if(require.main===module)process.stdout.write(JSON.stringify(validate(),null,2)+'\n');
module.exports={idCountHash,verifyManifest,validate};
