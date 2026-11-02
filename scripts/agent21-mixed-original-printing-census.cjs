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
        const card=resolve(p.set,p.number,name);
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
  const ids=new Map();
  for(const set of sets){
    if(!set.ptcgoCode)continue;
    if(!ids.has(set.ptcgoCode))ids.set(set.ptcgoCode,[]);
    ids.get(set.ptcgoCode).push(set.id);
  }
  const cache=new Map();
  return (set,number,name)=>{
    const candidateIds=ids.get(set)??[];
    assert.ok(candidateIds.length,'Unknown English PTCGO set: '+set);
    const matches=[];
    for(const id of candidateIds){
      if(!cache.has(id)){
        const cards=JSON.parse(fs.readFileSync(
          path.join(CARDROOT,id+'.json'),'utf8'));
        cache.set(id,new Map(cards.map(c=>[String(c.number),c])));
      }
      const card=cache.get(id).get(String(number));
      if(card&&(!name||card.name===name))matches.push(card);
    }
    assert.equal(matches.length,1,
      'Missing or ambiguous card printing: '+set+' '+number+
      (name?' '+name:''));
    return matches[0];
  };
}


/**
 * Audit same-name, mechanically different Pokémon across the ENTIRE
 * authenticated original opponent field, including differences never
 * co-located in a single registered 60. This is a source-printing
 * inventory, not a runtime/policy correctness result.
 * @param {object} source Original source manifest.
 * @param {(set:string,number:string,name:string)=>object} resolve
 * @returns {object}
 */
function crossDeckPrintingCensus(source,resolve){
  assert.ok(Array.isArray(source?.decks));
  assert.equal(typeof resolve,'function');
  const names=new Map();
  const observedRanks=new Set();
  let sourcePhysicalSlots=0;
  for(const deck of source.decks){
    assert.ok(Number.isSafeInteger(deck.rank));
    assert.ok(!observedRanks.has(deck.rank),'Repeated source rank');
    observedRanks.add(deck.rank);
    assert.ok(Array.isArray(deck.cards));
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    sourcePhysicalSlots+=60;
    for(const card of deck.cards){
      if(card.category!=='Pokémon')continue;
      assert.ok(Number.isSafeInteger(card.count)&&card.count>0);
      assert.ok(card.name&&card.printing?.set&&card.printing?.number);
      const key=card.printing.set+':'+String(card.printing.number);
      let variants=names.get(card.name);
      if(!variants){variants=new Map();names.set(card.name,variants);}
      let variant=variants.get(key);
      if(!variant){
        variant={set:card.printing.set,number:String(card.printing.number),
          physicalCopies:0,deckRanks:[]};
        variants.set(key,variant);
      }
      variant.physicalCopies+=card.count;
      if(!variant.deckRanks.includes(deck.rank))variant.deckRanks.push(deck.rank);
    }
  }
  const groups=[];
  for(const [name,variants] of names){
    if(variants.size<2)continue;
    const printings=[...variants.values()].map(variant=>{
      const card=resolve(variant.set,variant.number,name);
      assert.equal(card.name,name);
      return {...variant,cardId:card.id,
        abilityNames:(card.abilities??[]).map(a=>a.name),
        attackNames:(card.attacks??[]).map(a=>a.name),
        effectSignature:JSON.stringify({
          abilities:card.abilities??[],attacks:card.attacks??[]
        })};
    });
    const rankSet=new Set(printings.flatMap(x=>x.deckRanks));
    groups.push({
      name,physicalCopies:printings.reduce((n,x)=>n+x.physicalCopies,0),
      deckRanks:[...rankSet].sort((a,b)=>a-b),
      printings,
      attackOrAbilityTextDiffers:
        new Set(printings.map(x=>x.effectSignature)).size>1
    });
  }
  groups.sort((a,b)=>a.name.localeCompare(b.name));
  return {schema:'agent21-crossdeck-original-printing-census-v1',
    sourceEvent:source.event,originalDecks:source.decks.length,
    sourcePhysicalSlots,
    incompleteSourceRanks:source.missing_full_lists?.map(x=>x.rank)??[],
    mixedNameGroups:groups.length,
    effectDifferentGroups:groups.filter(x=>x.attackOrAbilityTextDiffers).length,
    affectedDeckRanks:[...new Set(groups.flatMap(x=>x.deckRanks))].sort((a,b)=>a-b),
    affectedPhysicalCopies:groups.reduce((n,x)=>n+x.physicalCopies,0),
    groups,competitiveQualifiedGames:0,
    caution:'Bundled English-equivalent card-text inventory; not native gameplay, importer correctness, policy competence, Japanese legality, or a game-win estimate.'};
}

function runCrossDeck(){
  return crossDeckPrintingCensus(
    JSON.parse(fs.readFileSync(SRC,'utf8')),englishPrintingResolver());
}

function run(){
  return mixedPrintingCensus(
    JSON.parse(fs.readFileSync(SRC,'utf8')),
    englishPrintingResolver());
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,mixedPrintingCensus,englishPrintingResolver,run,
  crossDeckPrintingCensus,runCrossDeck};
