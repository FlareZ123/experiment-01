'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent8-fairyzone-original29-dragon-nine-set-minimum-census-v1';
const ROOT=path.resolve(__dirname,'../../..');
const SETS=Object.freeze({
  SIT:'swsh12',TWM:'sv6',LOR:'swsh11',PAL:'sv2',
  JTG:'sv9',ASC:'me2pt5',CEC:'sm12',UPR:'sm5',SSP:'sv8'
});
const SOURCE='results/aichi-2026/full-decklists.json';

/**
 * Read and count printed Dragon type entries in nine independently identified
 * source sets. These are a deliberately bounded subset of all original cards,
 * so the field-rank coverage is a *lower bound*, not exhaustive enumeration.
 * Do not infer gameplay, physical copy access, Ability survival or damage.
 * @returns {object} Plain JSON-compatible reproducible read-only census.
 */
function census(){
  const decks=JSON.parse(fs.readFileSync(path.join(ROOT,SOURCE),'utf8')).decks;
  assert.equal(decks.length,29,'Only the 29 published source 60s are available');
  const pool=Object.fromEntries(Object.entries(SETS).map(([code,id])=>[
    code,new Map(JSON.parse(fs.readFileSync(path.join(
      ROOT,'resources/cards/en',id+'.json'),'utf8')).map(c=>[
        String(c.number),c
      ]))
  ]));
  const rows=[];
  for(const deck of decks){
    for(const original of deck.cards){
      if(original.category!=='Pokémon')continue;
      const code=original.printing?.set;
      if(!Object.hasOwn(pool,code))continue;
      const card=pool[code].get(String(original.printing.number));
      assert.ok(card,
        'Source Pokemon printing absent from nine-set database: '+
        code+' '+original.printing.number);
      if(!card.types?.includes('Dragon'))continue;
      assert.ok(Number.isSafeInteger(original.count)&&original.count>0);
      const hp=Number(card.hp);
      assert.ok(Number.isSafeInteger(hp)&&hp>0);
      rows.push({
        rank:deck.rank,sourcePrinting:code+' '+original.printing.number,
        name:original.name,count:original.count,hp,
        dragonTypeConfirmed:true,
        printedHpWithin420:hp<=420
      });
    }
  }
  const ranks=[...new Set(rows.map(r=>r.rank))].sort((a,b)=>a-b);
  const perRank=ranks.map(rank=>{
    const pokemon=rows.filter(r=>r.rank===rank);
    return {
      rank,dragonCopies:pokemon.reduce((a,b)=>a+b.count,0),
      pokemon
    };
  });
  return {
    schema:VERSION,source:SOURCE,
    restriction:'Only nine explicitly mapped source card sets; lower bound on full Dragon coverage',
    originalSourceDecks:decks.length,
    includedSourceSetCodes:Object.keys(SETS),
    printedDragonCopies:rows.reduce((a,b)=>a+b.count,0),
    distinctOriginalDecksWithDragon:ranks.length,
    ranks,largestPrintedDragonHp:Math.max(...rows.map(x=>x.hp)),
    allEnumeratedPrintedDragonHpWithin420:rows.every(x=>x.printedHpWithin420),
    perRank,
    qualifiesAsNativeGames:false,paperQualifiedGames:0,
    causalRequirement:'Mew VMAX Cross Fusion copies Genesect Techno Blast 210; Fairy Zone active against a Dragon; no other prevention, HP modification or damage reduction'
  };
}

if(require.main===module){
  const result=census();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={VERSION,SETS,SOURCE,census};
