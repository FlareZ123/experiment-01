'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {resolveManifest}=require('./resolve-field.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** @returns {object} Exact candidate printing resolution before any game. */
function main(){
  const root=path.resolve(__dirname,'../..');
  const source=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const original=source.decks.find(d=>d.rank===2);
  assert.ok(original&&Array.isArray(original.cards));
  const read=name=>JSON.parse(fs.readFileSync(path.join(root,
    'results/als',name),'utf8'));
  const v1=read('agent18-exeggutor-vileplume-source-v1.json');
  const v2=read('agent18-exeggutor-vileplume-native-v2.json');
  const report=resolveManifest({source:source.source,
    decks:[original,{...v1,rank:102,player:'Agent18 v1'},
      {...v2,rank:103,player:'Agent18 v2'}]},
    {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const rows=report.decks.map(d=>({
    rank:d.rank,size:d.deckSize,
    valid:d.playableUnderEngine,
    exactRows:d.nativeExactRows,
    modifications:d.modifications,
    unresolved:d.unresolved,
    idCardCount:d.cardIds.length,
    species:d.cardIds.filter(c=>/^Exeggcute |^Exeggutor /.test(c))
  }));
  const orig=rows.find(d=>d.rank===2),
    a=rows.find(d=>d.rank===102),b=rows.find(d=>d.rank===103);
  assert.equal(orig.valid,true,
    'Frozen source rank2 must still resolve in the pinned engine');
  assert.equal(a.valid,false,'MEG4 v1 printing expected unresolved');
  assert.ok(a.unresolved.some(x=>x.name==='Exeggcute' &&
    x.requested?.set==='MEG'),'Pinned v1 unavailable print must be explicit');
  assert.equal(b.valid,true,
    'Native-primary-parts v2 should resolve every printed card without silent proxy');
  assert.ok(b.species.includes('Exeggcute PLF'));
  assert.ok(b.species.includes('Exeggcute VIV'));
  assert.ok(b.species.filter(x=>x==='Exeggutor PLF').length===2);
  const clean=b.modifications.every(x=>
    x.reason==='same-set-basic-energy-number-mismatch' ||
    x.reason==='prism-glyph-name-alias' ||
    x.reason==='research-only-japanese-promo-implementation');
  assert.equal(clean,true);
  return {schema:'agent18-rank2-blockade-printed-native-coverage-v1',
    engineRevision:PIN,rows,originalRank2Valid:orig.valid,
    v1FailsExactMEG4:a.unresolved.some(x=>x.name==='Exeggcute' &&
      x.requested?.set==='MEG'),v2All60NativeIDsResolvable:b.valid,
    competitiveQualifiedGames:0,
    caveat:'Native printed ID and DeckAnalyser Expanded validation, not effect implementation, paper legality, genuine setup, engine prompts or match outcomes.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={PIN,main};
