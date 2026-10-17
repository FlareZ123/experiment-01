'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');

const candidatePath=path.resolve(__dirname,
  '../results/als/new-moon-perfection-english-map.json');
const sourcePath=path.resolve(__dirname,
  '../results/als/new-moon-perfection-source-60.json');
const cardsRoot=path.resolve(__dirname,'../resources/cards/en');
const setsPath=path.resolve(__dirname,'../resources/sets/en.json');
const nameEquivalents=new Map([
  ['Battle Compressor','Battle Compressor Team Flare Gear'],
  ["Trainer's Mail","Trainers' Mail"],
  ["Basic Psychic Energy","Psychic Energy"]
]);

/**
 * Freeze and test one representative, printed English identity for each
 * original Japanese source-image row. This cannot certify Japanese print IDs,
 * Japanese licensing, errata or actual simulator implementation.
 *
 * @param {object} candidate Research candidate object.
 * @param {object} source Source-image transcription.
 * @param {(id:string)=>object} getCard Lookup from complete per-set card data.
 * @param {(setId:string)=>object} getSet Lookup release-date and set information.
 * @returns {object} Strictly bounded structural and database eligibility audit.
 */
function audit(candidate,source,getCard,getSet) {
  assert.equal(candidate.schema,'aichi-newmoon-english-simulation-mapping-v1');
  assert.equal(candidate.entries.length,source.entries.length);
  const sourceByName=new Map(source.entries.map(e=>[e.name_en,e.count]));
  const printedNames=new Map();
  let quantity=0,aceSpecCount=0;
  const totals={Pokémon:0,Trainer:0,Energy:0};
  const verified=[];
  for(const row of candidate.entries) {
    assert.ok(Number.isSafeInteger(row.count)&&row.count>0);
    assert.equal(sourceByName.get(row.name),row.count,
      'Changed original source card quantity: '+row.name);
    const card=getCard(row.id);
    assert.ok(card,'Printing unavailable in snapshot: '+row.id);
    const targetName=nameEquivalents.get(row.name)||
      row.name;
    assert.equal(card.name,targetName,'Ambiguous or wrong printed card: '+row.id);
    assert.equal(card.legalities?.expanded,'Legal',
      'English database printing Expanded flag is not Legal');
    const set=getSet(row.id.split('-')[0]);
    assert.ok(set);
    assert.ok(set.releaseDate<=candidate.event_date.replace(/-/g,'/'),
      'Selected English printing released after event cutoff');
    assert.ok(Object.hasOwn(totals,card.supertype));
    totals[card.supertype]+=row.count;
    quantity+=row.count;
    const current=printedNames.get(card.name)||0;
    printedNames.set(card.name,current+row.count);
    if(card.rules?.some(r=>r.includes('ACE SPEC'))) aceSpecCount+=row.count;
    verified.push({
      name:card.name,id:card.id,count:row.count,
      printed_supertype:card.supertype,
      release_date:set.releaseDate
    });
  }
  for(const [name,count] of printedNames) {
    if(name!=='Psychic Energy') assert.ok(count<=4,
      'Name-level four-copy deck rule: '+name);
  }
  assert.equal(quantity,60);
  assert.deepEqual(totals,{'Pokémon':19,Trainer:35,Energy:6});
  assert.equal(aceSpecCount,1);
  assert.equal(candidate.entries.filter(r=>r.english_print_id==='xy7-30').length,1,
    'Use Farewell Letter Unown rather than banned SM8 variants');
  assert.equal(candidate.entries.filter(r=>r.english_print_id==='sv6pt5-18').length,1,
    'Use legal Shrouded Fable Duskull rather than prohibited SM11a print');
  for(const [name,id,ability] of [
    ['Unown','xy7-30','Farewell Letter'],
    ['Duskull','sv6pt5-18',null],
    ['Dusclops','sv6pt5-19','Cursed Blast'],
    ['Solrock','sm7-62','Sunbeam'],
    ['Lunatone','sv3-92','New Moon'],
    ['Klefki','sv1-96','Mischievous Lock'],
    ['Mewtwo & Mew-GX','sm11-71','Perfection']
  ]) {
    const card=getCard(id);
    assert.equal(card.name,name);
    if(ability!==null) assert.ok(card.abilities?.some(a=>a.name===ability),
      'Missing specified strategic ability '+ability+' from '+id);
  }
  const canonical=candidate.entries
    .map(row=>[row.id,row.count])
    .sort(([a],[b])=>a.localeCompare(b,'en',{sensitivity:'variant'}))
    .map(([id,n])=>id+':'+n+'\n').join('');
  const sha=crypto.createHash('sha256').update(canonical).digest('hex');
  assert.equal(sha,candidate.sha256_id_counts);
  return {
    schema:'new-moon-source-print-equivalence-audit-v1',
    count:quantity,unique:verified.length,totals,
    sourceHash:source.official_japanese_deck_code,
    aceSpecCount,hash:sha,
    date:candidate.event_date,
    englishDatabaseExpandedFlag:true,
    englishPrintingOnOrBeforeEvent:true,
    authenticJapanesePrintsVerified:false,
    japaneseTournamentLegalityFullyVerified:false,
    gameplayQualified:false,
    cardList:verified
  };
}

function auditFromResources() {
  const candidate=JSON.parse(fs.readFileSync(candidatePath,'utf8'));
  const source=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
  const sets=JSON.parse(fs.readFileSync(setsPath,'utf8'));
  const setMap=new Map(sets.map(s=>[s.id,s]));
  const cache=new Map();
  const getCard=id=>{
    const setId=id.split('-')[0];
    if(!cache.has(setId)) cache.set(setId,
      new Map(JSON.parse(fs.readFileSync(path.join(cardsRoot,setId+'.json'),'utf8'))
        .map(c=>[c.id,c])));
    return cache.get(setId).get(id);
  };
  return audit(candidate,source,getCard,id=>setMap.get(id));
}
if(require.main===module) process.stdout.write(JSON.stringify(auditFromResources(),null,2)+'\n');
module.exports={audit,auditFromResources};
