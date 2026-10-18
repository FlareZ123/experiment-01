'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const source=require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const alternate=require('../results/als/new-moon-two-gengar-one-cologne-english-proxy-60.json');

/** @param {{english_proxy_card_id:string,count:number}[]} entries */
function canonicalHash(entries) {
  const rows=entries.map(e=>e.english_proxy_card_id+':'+e.count+'\n').sort().join('');
  return createHash('sha256').update(rows,'utf8').digest('hex');
}

/** @param {object} manifest */
function categoryTotals(manifest) {
  const tally={total:0,unique:manifest.entries.length,'Pokémon':0,Trainer:0,Energy:0};
  for(const row of manifest.entries) {
    assert.ok(Number.isInteger(row.count) && row.count>0);
    assert.ok(row.count<=4 || row.type==='Energy',
      'Ordinary four-of limit violated for '+row.name_en);
    tally[row.type]+=row.count;
    tally.total+=row.count;
  }
  return tally;
}

test('original and alternate identities are genuine canonical 60-card SHA256 lists',()=>{
  assert.equal(canonicalHash(source.entries),
    source.canonical_id_count_sha256);
  assert.equal(canonicalHash(alternate.entries),
    alternate.canonical_id_count_sha256);
  assert.equal(source.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(alternate.canonical_id_count_sha256,
    '3c1cf2b5fa73a966c23260f3ceb85a5ebd70073cdd805f44b269969bfea2bd33');
  assert.deepEqual(categoryTotals(alternate),alternate.counts);
});

test('only the claimed Gengar and Cologne print counts differ',()=>{
  const a=new Map(source.entries.map(x=>[x.english_proxy_card_id,x.count]));
  const b=new Map(alternate.entries.map(x=>[x.english_proxy_card_id,x.count]));
  assert.equal(a.size,34);
  assert.equal(b.size,34);
  const changes=[];
  for(const [id,count] of a) {
    assert.ok(b.has(id),'Alternatives cannot drop an original printing');
    if(b.get(id)!==count)changes.push([id,b.get(id)-count]);
  }
  assert.deepEqual(changes.sort((x,y)=>x[0].localeCompare(y[0])),
    [['sm9-53',1],['swsh10-136',-1]]);
  assert.deepEqual(alternate.counts,{
    total:60,unique:34,'Pokémon':20,Trainer:34,Energy:6
  });
});
