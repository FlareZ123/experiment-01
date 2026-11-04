'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const DEFAULT_RESOURCES=path.resolve(__dirname,'../resources');

/**
 * Match printed original card identity against the bundled English corpus.
 * This is deliberately a corpus coverage check, not proof of Japanese
 * event-era legality or the native engine's exact printing support.
 *
 * @param {object} manifest One fixed print-aware deck manifest.
 * @param {string} [root] Bundled research resources directory.
 * @returns {object} Per-entry exact card identity match and missing set/row.
 */
function auditPrintedSixty(manifest,root=DEFAULT_RESOURCES){
  assert.ok(manifest&&Array.isArray(manifest.cards));
  assert.ok(manifest.cards.every(c=>
    Number.isSafeInteger(c.count)&&c.count>0&&
    typeof c.name==='string'&&typeof c.printing?.set==='string'&&
    c.printing?.number!=null));
  const quantities=manifest.cards.reduce((s,c)=>s+c.count,0);
  assert.equal(quantities,60,'Submitted physical deck must total 60');
  const sets=JSON.parse(fs.readFileSync(path.join(root,'sets/en.json'),'utf8'));
  const memo=new Map();
  let foundCopies=0;
  const rows=manifest.cards.map(row=>{
    const {name,count,category,printing}=row;
    // The bundled collection includes Sun & Moon promo card records at
    // cards/en/smp.json with native IDs such as smp-SM217, even though
    // sets/en.json has no ptcgoCode SMP entry. Resolve the exact card and
    // name in that existing bundled file; never infer a promo stage by name.
    const indexed=sets.filter(s=>s.ptcgoCode===printing.set);
    const promo=printing.set==='SMP' &&
      /^\d+$/.test(String(printing.number)) ?
      [{id:'smp',promoPrefix:'SM'}]:[];
    const setCandidates=indexed.length?indexed:promo;
    if(!setCandidates.length){
      return {name,count,category,printing,
        state:'set-absent-from-bundled-corpus',matchedIds:[]};
    }
    const found=[];
    for(const set of setCandidates){
      const location=path.join(root,'cards/en/'+set.id+'.json');
      if(!fs.existsSync(location))continue;
      if(!memo.has(set.id))
        memo.set(set.id,JSON.parse(fs.readFileSync(location,'utf8')));
      const cards=memo.get(set.id);
      const id=set.id+'-'+(set.promoPrefix||'')+
        String(printing.number);
      for(const card of cards){
        if(card.id===id&&card.name===name&&
            ((category==='Pokémon'&&card.supertype==='Pokémon')||
              (category==='Trainer'&&card.supertype==='Trainer')||
              (category==='Energy'&&card.supertype==='Energy'))){
          found.push({
            id:card.id,subtypes:card.subtypes||[],
            printedExpandedFlag:card.legalities?.expanded??null
          });
        }
      }
    }
    if(found.length){
      foundCopies+=count;
      return {name,count,category,printing,state:'exact-bundled-printing',
        matchedIds:found};
    }
    return {name,count,category,printing,
      state:'printing-not-matched-in-existing-set-corpus',matchedIds:[]};
  });
  const basicEnergyTypes=[
    'Grass','Fire','Water','Lightning','Psychic','Fighting',
    'Darkness','Metal','Fairy'
  ];
  const basicEnergyNames=new Set(basicEnergyTypes.flatMap(type=>[
    type+' Energy','Basic '+type+' Energy'
  ]));
  const byName=new Map();
  for(const card of manifest.cards){
    if(card.category==='Energy'&&basicEnergyNames.has(card.name))continue;
    byName.set(card.name,(byName.get(card.name)??0)+card.count);
  }
  const noMoreThanFour=[...byName.values()].every(count=>count<=4);
  const aceSpecRows=rows.filter(row=>row.matchedIds.some(
    match=>match.subtypes.includes('ACE SPEC')));
  const totalAceSpec=aceSpecRows.reduce((n,c)=>n+c.count,0);
  return {
    schema:'agent38-candidate-bundled-printing-coverage-v1',
    deckLabel:manifest.label||null,
    quantities,
    foundEntries:rows.filter(row=>row.state==='exact-bundled-printing').length,
    totalEntries:rows.length,matchedCopies:foundCopies,
    unmatchedCopies:60-foundCopies,
    noMoreThanFourFromNamesAndCategory:noMoreThanFour,
    knownAceSpecCopies:totalAceSpec,
    rows,
    caveat:'Corpus coverage is neither physical Japanese event-print legality '+
      'nor native engine card support. A missing set may still be an authentic '+
      'basic Energy printing. Additional format bans are not evaluated.'
  };
}

module.exports={auditPrintedSixty,DEFAULT_RESOURCES};
