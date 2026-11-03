'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent9-jp-expanded-source-structural-negative-screen-20260219-v1';
const BASIC_ENERGIES=new Set(['Grass Energy','Fire Energy','Water Energy',
  'Lightning Energy','Psychic Energy','Fighting Energy',
  'Darkness Energy','Metal Energy','Fairy Energy']);
const BANNED_TRAINER_NAMES=new Set([
  'Chip-Chip Ice Axe','Delinquent','Forest of Giant Plants','Ghetsis',
  'Hex Maniac','Island Challenge Amulet','Jessie & James',
  "Lt. Surge's Strategy","Lysandre's Trump Card",
  "Maxie's Hidden Ball Trick",'Puzzle of Time','Red Card',
  'Reset Stamp','Scoop Up Net'
]);
const BANNED_POKEMON_MECHANISMS=Object.freeze({
  Archeops:Object.freeze({abilities:['Ancient Power']}),
  Duskull:Object.freeze({abilities:['Spiritborne Evolution']}),
  'Flabébé':Object.freeze({abilities:['Evolutionary Advantage']}),
  Flapple:Object.freeze({abilities:['Apple Drop']}),
  Marshadow:Object.freeze({abilities:['Let Loose']}),
  'Medicham V':Object.freeze({attacks:['Yoga Loop']}),
  Milotic:Object.freeze({abilities:['Energy Grace']}),
  Mismagius:Object.freeze({abilities:['Mysterious Message']}),
  Oranguru:Object.freeze({attacks:['Resource Management']}),
  Sableye:Object.freeze({attacks:['Junk Hunt']}),
  'Shaymin-EX':Object.freeze({abilities:['Set Up']}),
  Unown:Object.freeze({abilities:['DAMAGE','HAND']})
});
const SUPPORTER_FAMILIES=Object.freeze([
  Object.freeze(['Professor Juniper','Professor Sycamore',"Professor's Research"]),
  Object.freeze(['Lysandre',"Boss's Orders"])
]);

/**
 * Index English metadata by displayed name, set abbreviation and collector
 * number. Different same-print public records remain explicit ambiguity.
 * No missing or ambiguous English metadata proves a Japanese printing illegal.
 * @param {object[]} sets Public sets/en.json records.
 * @param {{setId:string,cards:object[]}[]} groups Public cards/en/*.json.
 * @returns {Map<string,object[]>}
 */
function buildExactPrintIndex(sets,groups){
  assert.ok(Array.isArray(sets)&&Array.isArray(groups));
  const codes=new Map(sets.map(s=>[s.id,s.ptcgoCode]));
  const index=new Map();
  for(const group of groups){
    const code=codes.get(group.setId);
    if(typeof code!=='string'||!code)continue;
    for(const card of group.cards){
      const key=card.name+'|'+code+'|'+String(card.number);
      const rows=index.get(key)??[];
      rows.push(card);
      index.set(key,rows);
    }
  }
  return index;
}

/** @param {string} resourceRoot Checked-out repository resources directory. */
function loadExactPrintIndex(resourceRoot){
  const sets=JSON.parse(fs.readFileSync(
    path.join(resourceRoot,'sets','en.json'),'utf8'));
  const dir=path.join(resourceRoot,'cards','en');
  const groups=fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort()
    .map(x=>({setId:path.basename(x,'.json'),cards:JSON.parse(
      fs.readFileSync(path.join(dir,x),'utf8'))}));
  return buildExactPrintIndex(sets,groups);
}

/**
 * 2026-02-19 official Japanese Expanded construction and banlist necessary
 * conditions. The source manifest is in mechanically translated EN printings;
 * English metadata can resolve some cards but never certifies Japanese release
 * date or that a translated source line matches the original paper print.
 * @param {object} deck A source-authenticated 60 from full-decklists.json.
 * @param {Map<string,object[]>} prints Exact English print metadata.
 * @returns {object} Only definitive negative conclusions; no paper-legality pass.
 */
function screenOneSourceDeck(deck,prints){
  assert.ok(Array.isArray(deck?.cards));
  assert.ok(prints instanceof Map);
  const violations=[],uncertainties=[],byName=new Map();
  let size=0,knownAceSpecCopies=0,knownRadiantCopies=0;
  let knownBasicCopies=0,matchedCopies=0,unmatchedCopies=0;
  const seenPrismNames=new Map();
  for(const c of deck.cards){
    assert.ok(Number.isSafeInteger(c.count)&&c.count>0);
    assert.ok(typeof c.name==='string'&&c.name.length>0);
    assert.ok(['Pokémon','Trainer','Energy'].includes(c.category));
    assert.ok(typeof c.printing?.set==='string');
    const printing=c.name+'|'+c.printing.set+'|'+String(c.printing.number);
    size+=c.count;
    byName.set(c.name,(byName.get(c.name)??0)+c.count);
    const matches=prints.get(printing)??[];
    const signature=matches.map(card=>JSON.stringify({
      supertype:card.supertype,subtypes:card.subtypes??[],
      abilities:(card.abilities??[]).map(x=>x.name).sort(),
      attacks:(card.attacks??[]).map(x=>x.name).sort()
    }));
    const known=matches.length>0&&new Set(signature).size===1;
    if(!known){
      unmatchedCopies+=c.count;
      uncertainties.push({kind:'unmatched-or-ambiguous-English-proxy',
        printing,copies:c.count});
    }else matchedCopies+=c.count;
    const card=known?matches[0]:null;
    const subtypes=card?.subtypes??[];
    if(subtypes.includes('ACE SPEC'))knownAceSpecCopies+=c.count;
    if(subtypes.includes('Radiant'))knownRadiantCopies+=c.count;
    if(c.category==='Pokémon'&&subtypes.includes('Basic')){
      knownBasicCopies+=c.count;
    }
    if(subtypes.includes('Prism Star')||c.name.includes('♢')){
      seenPrismNames.set(c.name,(seenPrismNames.get(c.name)??0)+c.count);
    }
    if(c.category==='Trainer'&&BANNED_TRAINER_NAMES.has(c.name)){
      violations.push({kind:'official-banned-Trainer-name',printing,
        copies:c.count});
    }
    if(c.category==='Pokémon'&&Object.hasOwn(BANNED_POKEMON_MECHANISMS,c.name)){
      const mechanism=BANNED_POKEMON_MECHANISMS[c.name];
      if(!known){
        uncertainties.push({kind:'official-form-specific-ban-unresolved',
          printing,copies:c.count});
      }else{
        const abilities=(card.abilities??[]).map(x=>x.name);
        const attacks=(card.attacks??[]).map(x=>x.name);
        if((mechanism.abilities??[]).some(x=>abilities.includes(x))||
           (mechanism.attacks??[]).some(x=>attacks.includes(x))){
          violations.push({kind:'official-banned-Pokémon-mechanism',
            printing,copies:c.count,abilities,attacks});
        }
      }
    }
  }
  if(size!==60)violations.push({kind:'deck-size',observed:size,required:60});
  for(const [name,count] of byName){
    if(count>4&&!BASIC_ENERGIES.has(name))
      violations.push({kind:'four-copy-name-limit',name,count});
  }
  for(const [name,count] of seenPrismNames){
    if(count>1)violations.push({kind:'prism-star-one-per-name',name,count});
  }
  if(knownAceSpecCopies>1)
    violations.push({kind:'multiple-known-ACE-SPEC',knownAceSpecCopies});
  if(knownRadiantCopies>1)
    violations.push({kind:'multiple-known-Radiant',knownRadiantCopies});
  for(const family of SUPPORTER_FAMILIES){
    const present=family.filter(n=>byName.get(n)>0);
    if(present.length>1)
      violations.push({kind:'official-exclusive-Supporter-family',present});
  }
  if(size===60&&matchedCopies===60&&knownBasicCopies===0)
    violations.push({kind:'no-Pokémon-Basic-in-full-known-metadata'});
  else if(knownBasicCopies===0)
    uncertainties.push({kind:'Basic-starter-availability-unresolved'});
  return {
    rank:deck.rank,player:deck.player,archetype:deck.archetype,
    sourcePhysicalCopies:size,matchedEnglishProxyCopies:matchedCopies,
    unmatchedEnglishProxyCopies:unmatchedCopies,
    knownAceSpecCopies,knownRadiantCopies,knownBasicCopies,
    violations,uncertainties,
    noViolationProven:violations.length===0,
    paperLegalityCertified:false,
    releaseChronologyVerified:false,
    JapaneseOriginalPrintIdentityCertified:false,
    completeBanReprintEquivalenceCertified:false,
    scope:VERSION
  };
}

/** @param {object} manifest @param {Map<string,object[]>} index */
function screenManifest(manifest,index){
  assert.ok(Array.isArray(manifest?.decks));
  const rows=manifest.decks.map(d=>screenOneSourceDeck(d,index));
  return {
    version:VERSION,officialJapaneseSource:
      'https://www.pokemon-card.com/rules/regulation/index.html',
    officialRuleUpdated:'2026-02-19',eventDate:'2026-05-10',
    authenticatedDeckRows:rows.length,missingOriginalDecks:
      (manifest.missing_full_lists??[]).map(d=>d.rank),
    observedDefiniteViolationDecks:rows.filter(r=>r.violations.length).length,
    observedUnresolvedMetadataDecks:rows.filter(r=>r.uncertainties.length).length,
    paperLegalityCertifiedDecks:0,competitiveQualifiedGames:0,rows
  };
}

module.exports={VERSION,BANNED_TRAINER_NAMES,BANNED_POKEMON_MECHANISMS,
  SUPPORTER_FAMILIES,buildExactPrintIndex,loadExactPrintIndex,
  screenOneSourceDeck,screenManifest};
