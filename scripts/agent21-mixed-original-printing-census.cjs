'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const SRC=path.join(ROOT,'results','aichi-2026','full-decklists.json');
const SETS=path.join(ROOT,'resources','sets','en.json');
const CARDROOT=path.join(ROOT,'resources','cards','en');
const VERSION='agent21-mixed-printing-inventory-v1';

/** Name collisions are meaningful only when different physical set/number
 * identities appear inside the SAME original registered 60.
 * @param {object} source Original 2026 Aichi deck manifest.
 * @param {(set:string,number:string)=>object} resolve Exact card resolver.
 * @returns {object} Printing-conscious, full-denominator inventory.
 */
function mixedPrintingCensus(source,resolve){
  assert.ok(Array.isArray(source?.decks),'Expected published original decks');
  const cases=[];
  let physicalSlots=0;
  for(const deck of source.decks){
    assert.ok(Number.isSafeInteger(deck.rank));
    assert.ok(Array.isArray(deck.cards));
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60,
      'Original 60 incomplete at rank '+deck.rank);
    physicalSlots+=60;
    const byName=new Map();
    for(const c of deck.cards){
      assert.ok(Number.isSafeInteger(c.count)&&c.count>0);
      assert.ok(typeof c.name==='string'&&c.name.length>0);
      assert.ok(c.printing?.set&&c.printing?.number);
      if(!byName.has(c.name))byName.set(c.name,[]);
      byName.get(c.name).push(c);
    }
    for(const [name,rows] of byName){
      const variants=new Map();
      for(const c of rows){
        const id=c.printing.set+':'+String(c.printing.number);
        if(!variants.has(id))variants.set(id,{id,count:0,
          set:c.printing.set,number:String(c.printing.number)});
        variants.get(id).count+=c.count;
      }
      if(variants.size<2)continue;
      const printings=[...variants.values()].map(p=>{
        const card=resolve(p.set,p.number);
        assert.equal(card.name,name,
          'Bundled printing/name mismatch: '+deck.rank+' '+p.id);
        const abilityNames=(card.abilities??[]).map(x=>x.name);
        const attackNames=(card.attacks??[]).map(x=>x.name);
        return {...p,cardId:card.id,abilityNames,attackNames,
          abilities:card.abilities??[],attacks:card.attacks??[]};
      });
      const signatures=printings.map(c=>JSON.stringify({
        abilities:c.abilities,attacks:c.attacks}));
      cases.push({rank:deck.rank,player:deck.player,
        archetype:deck.archetype,name,
        physicalCopies:printings.reduce((n,p)=>n+p.count,0),
        printings,attackOrAbilityTextDiffers:
          new Set(signatures).size>1});
    }
  }
  cases.sort((a,b)=>a.rank-b.rank||a.name.localeCompare(b.name));
  return {schema:VERSION,sourceEvent:source.event,
    originalDecks:source.decks.length,
    originalPhysicalSlots:physicalSlots,
    incompleteSourceRanks:source.missing_full_lists?.map(x=>x.rank)??[],
    mixedNameGroups:cases.length,
    affectedDeckRanks:[...new Set(cases.map(x=>x.rank))],
    affectedPhysicalSlots:cases.reduce((n,c)=>n+c.physicalCopies,0),
    groupsWithDifferentAttackOrAbilityText:
      cases.filter(x=>x.attackOrAbilityTextDiffers).length,
    cases,competitiveQualifiedGames:0,
    caution:'Only bundled English print equivalents were compared. Native runtime lookup, Japanese legality, actual use and match outcomes are not certified.'};
}

/** Look up only physical printings used by source name collisions.
 * @returns {(set:string,number:string)=>object}
 */
function englishPrintingResolver(){
  const sets=JSON.parse(fs.readFileSync(SETS,'utf8'));
  const ids=new Map(sets.map(x=>[x.ptcgoCode,x.id]));
  const cache=new Map();
  return (set,number)=>{
    const id=ids.get(set);
    assert.ok(id,'Unknown English PTCGO set: '+set);
    if(!cache.has(id)){
      const cards=JSON.parse(fs.readFileSync(
        path.join(CARDROOT,id+'.json'),'utf8'));
      cache.set(id,new Map(cards.map(c=>[String(c.number),c])));
    }
    const card=cache.get(id).get(String(number));
    assert.ok(card,'Unknown card printing: '+set+' '+number);
    return card;
  };
}

function run(){
  return mixedPrintingCensus(
    JSON.parse(fs.readFileSync(SRC,'utf8')),
    englishPrintingResolver());
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,mixedPrintingCensus,englishPrintingResolver,run};
