'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const source=require('../results/als/new-moon-official-japanese-print-60.json');
const candidate=require('../results/als/new-moon-lockbreak-japanese-print-60.json');

const EXPECTED_SHA256='13bbed10dc9610e8457a653262717dc35f865324726da6434e3c1710d8db9047';
const ADDITIONS=Object.freeze([
  {name_en:'Field Blower',count:2,japanese_card_id:34321,japanese_set:'SM4p'},
  {name_en:'Canceling Cologne',count:2,japanese_card_id:41294,japanese_set:'S9a'}
]);

/**
 * Validate a constructed, specifically identified Japanese-printing candidate
 * against a previously extracted official 60 and its declared four-card swap.
 * Does not certify card-specific errata, tournament registration, or play.
 * @param {object} proposed
 * @param {object} original
 * @returns {{sha256:string,total:number,pokemon:number,trainer:number,energy:number,unique:number}}
 */
function validateJapanesePrintCandidate(proposed,original) {
  assert.equal(proposed.schema,'new-moon-lockbreak-proposed-japanese-prints-v1');
  assert.equal(proposed.target_event_date,'2026-05-10');
  assert.equal(proposed.source_deck_code,original.source_code);
  assert.equal(proposed.source_official_url,original.official_url);
  assert.ok(Array.isArray(original.entries));
  assert.ok(Array.isArray(proposed.entries));
  assert.equal(original.entries.length,33);
  assert.equal(proposed.entries.length,34);
  const ids=proposed.entries.map(e=>e.japanese_card_id);
  assert.equal(new Set(ids).size,ids.length,'Repeated Japanese print ID');

  const sourceNames=new Set(original.entries.map(e=>e.name_en));
  assert.equal(sourceNames.size,original.entries.length);
  const names=new Set();
  const printIds=new Set();
  const expectedCounts=new Map(original.entries.map(e=>[e.name_en,e.count]));
  expectedCounts.set('Rescue Carrier',expectedCounts.get('Rescue Carrier')-2);
  expectedCounts.delete("Trainer's Mail");
  for(const extra of ADDITIONS) {
    assert.equal(sourceNames.has(extra.name_en),false);
    expectedCounts.set(extra.name_en,extra.count);
  }
  assert.equal(expectedCounts.size,proposed.entries.length);

  const sourceByName=new Map(original.entries.map(e=>[e.name_en,e]));
  let total=0,pokemon=0,trainer=0,energy=0;
  const pokemonNames=new Set(original.entries.slice(0,14).map(e=>e.name_en));
  const energyNames=new Set(original.entries.slice(-2).map(e=>e.name_en));
  for(const e of proposed.entries) {
    assert.ok(!names.has(e.name_en),'Repeated card name: '+e.name_en);
    assert.ok(!printIds.has(e.japanese_card_id),
      'Repeated Japanese print ID: '+e.japanese_card_id);
    names.add(e.name_en);
    printIds.add(e.japanese_card_id);
    assert.equal(e.count,expectedCounts.get(e.name_en),
      'Unexpected copy count: '+e.name_en);
    assert.ok(Number.isInteger(e.count)&&e.count>=1&&e.count<=4);
    assert.ok(Number.isInteger(e.japanese_card_id)&&e.japanese_card_id>0);
    assert.ok(typeof e.japanese_set==='string'&&e.japanese_set);
    const originalEntry=sourceByName.get(e.name_en);
    if(originalEntry) {
      assert.equal(e.japanese_card_id,originalEntry.japanese_card_id,
        'Source print ID altered: '+e.name_en);
      assert.equal(e.japanese_set,originalEntry.japanese_set,
        'Source Japanese expansion altered: '+e.name_en);
    } else {
      const added=ADDITIONS.find(x=>x.name_en===e.name_en);
      assert.ok(added,'Unknown new card: '+e.name_en);
      assert.equal(e.japanese_card_id,added.japanese_card_id);
      assert.equal(e.japanese_set,added.japanese_set);
      assert.match(e.printing_source||'',/^https:\/\/www\.pokemon-card\.com\/card-search\/details\.php\/card\/\d+$/);
    }
    total+=e.count;
    if(pokemonNames.has(e.name_en))pokemon+=e.count;
    else if(energyNames.has(e.name_en))energy+=e.count;
    else trainer+=e.count;
  }
  assert.equal(names.size,expectedCounts.size);
  assert.equal(total,60);
  assert.deepEqual({total,unique:names.size,pokemon,trainer,energy},
    {total:60,unique:34,pokemon:19,trainer:35,energy:6});
  assert.deepEqual(proposed.counts,{total,unique:names.size,pokemon,trainer,energy});

  const canonical=proposed.entries
    .map(e=>e.japanese_card_id+':'+e.count)
    .sort()
    .join('\n')+'\n';
  const sha256=crypto.createHash('sha256').update(canonical).digest('hex');
  assert.equal(sha256,EXPECTED_SHA256,'Published print-ID/count fingerprint drift');
  return {sha256,total,pokemon,trainer,energy,unique:names.size};
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(validateJapanesePrintCandidate(candidate,source),null,2)+'\n');
}

module.exports={validateJapanesePrintCandidate,EXPECTED_SHA256,ADDITIONS};
