'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {COST_BY_PRINT}=
  require('../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs');

const ROOT=path.resolve(__dirname,'..');
const VERSION='agent27-source-trainer-cardtext-cost-audit-v2-expanded-nohand';

/**
 * Verify actual bundled printed card rules for each cost-covered printing
 * present in the authenticated original 29. This is a deliberately narrow
 * text classifier, and MUST reject any unfamiliar discard expression rather
 * than treat it as zero cost or invent a numeric quantity.
 *
 * @param {string[]} rules Printed English rule clauses in bundled source.
 */
function printedHandDiscardModes(rules){
  assert.ok(Array.isArray(rules)&&rules.every(x=>typeof x==='string'));
  const text=rules.join(' ').replace(/\s+/g,' ').toLowerCase();
  const optionalTwo=/may discard 2 other cards from your hand/.test(text);
  const optionalThree=/may discard 3 other cards from your hand/.test(text);
  const optionalOne=/may discard another card from your hand/.test(text);
  const triple=!optionalThree&&/discard 3 other cards from your hand/.test(text);
  const double=!optionalTwo&&/discard 2 (?:other )?cards from your hand/.test(text);
  const single=!optionalOne&&/discard (?:another|a) card from your hand/.test(text);
  const found=[optionalTwo,optionalThree,optionalOne,triple,double,single]
    .filter(Boolean).length;
  assert.ok(found<=1,'Ambiguous hand-discard text must be reviewed');
  if(optionalTwo)return [0,2];
  if(optionalThree)return [0,3];
  if(optionalOne)return [0,1];
  if(triple)return [3];
  if(double)return [2];
  if(single)return [1];
  // 'from your discard pile into your hand' is a recovery effect, not a
  // discard FROM hand. Preserve review for unidentified actual hand discards.
  const withoutDiscardPile=text.replace(/discard pile/g,'discard-zone');
  assert.ok(!/discard.{0,50}(?:your )?hand/.test(withoutDiscardPile),
    'Unknown discard-from-hand text needs human review');
  return [0];
}

/**
 * Source-printing audit. The actual zip is also supplied as an attachment,
 * but this reproducible script uses the shared repository's matching JSON.
 */
function auditBundledSourceCardText(root=ROOT){
  const manifestPath=path.join(root,'results/aichi-2026/full-decklists.json');
  const manifestBytes=fs.readFileSync(manifestPath);
  const manifest=JSON.parse(manifestBytes);
  assert.equal(manifest.published_deck_count,29);
  const sets=JSON.parse(fs.readFileSync(path.join(root,
    'resources/sets/en.json'),'utf8'));
  const deckPrintings=new Map();
  for(const deck of manifest.decks){
    assert.equal(deck.cards.reduce((x,c)=>x+c.count,0),60);
    for(const card of deck.cards){
      if(card.category!=='Trainer')continue;
      const printing=card.name+' '+card.printing.set;
      if(!COST_BY_PRINT.has(printing))continue;
      deckPrintings.set(printing,(deckPrintings.get(printing)??0)+card.count);
    }
  }
  const records=[];
  for(const [printing,copies] of [...deckPrintings].sort()){
    const spec=COST_BY_PRINT.get(printing);
    const code=printing.slice(printing.lastIndexOf(' ')+1);
    const name=printing.slice(0,printing.lastIndexOf(' '));
    const matchingSets=sets.filter(s=>s.ptcgoCode===code);
    assert.ok(matchingSets.length>=1,'Missing source set: '+code);
    let printVariants=[];
    for(const set of matchingSets){
      const file=path.join(root,'resources/cards/en/'+set.id+'.json');
      const cards=JSON.parse(fs.readFileSync(file,'utf8'));
      for(const card of cards){
        if(card.name!==name)continue;
        assert.ok(card.supertype==='Trainer');
        const textModes=printedHandDiscardModes(card.rules);
        const catalogModes=spec.options.map(x=>x.discards).sort((a,b)=>a-b);
        assert.deepEqual(textModes,catalogModes,
          'Bundled card print cost conflicts with catalog for '+printing+
          ' physical '+card.id);
        printVariants.push({id:card.id,number:card.number,
          discardModes:textModes});
      }
    }
    assert.ok(printVariants.length>0,'No physical printing for '+printing);
    records.push({printing,copies,ruleModes:spec.options.map(x=>x.discards),
      printedVariants:printVariants,
      verifiedAllVariants:true});
  }
  const coveredCopies=records.reduce((s,r)=>s+r.copies,0);
  assert.equal(coveredCopies,754);
  return {version:VERSION,sourceManifestSha256:
    crypto.createHash('sha256').update(manifestBytes).digest('hex'),
    originalDecks:manifest.decks.length,
    verifiedExactSourcePrintings:records.length,
    verifiedOriginalTrainerCopies:coveredCopies,
    originalUnverifiedTrainerCopies:281,
    sourceCardTextVerified:true,
    paperTargetsAndNativePaymentUnverified:true,
    qualifiedCompetitiveGames:0,records};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(auditBundledSourceCardText(),null,2)+'\n');
module.exports={VERSION,ROOT,printedHandDiscardModes,auditBundledSourceCardText};
