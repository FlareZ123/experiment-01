'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {joint}=require('./agent3-rank26-coupled-lone-basic-root.cjs');
const {normalizeName}=require('./aichi_opening_audit.cjs');

const ROOT=path.resolve(__dirname,'..');

/** Load precise registered English printing, not name-only guesses. */
function printIndex(){
  const resources=path.join(ROOT,'resources');
  const sets=JSON.parse(fs.readFileSync(path.join(resources,'sets/en.json'),'utf8'));
  const byCode=new Map();
  for(const set of sets){
    const code=set.ptcgoCode;
    if(!code)continue;
    const group=byCode.get(code)||[];
    group.push(set.id);
    byCode.set(code,group);
  }
  const cache=new Map();
  return card=>{
    const promo={SMP:'smp',XYP:'xyp',BWP:'bwp',SWSP:'swshp',SVP:'svp'};
    const ids=byCode.get(card.printing?.set)||
      (promo[card.printing?.set]?[promo[card.printing.set]]:[]);
    const sought=normalizeName(card.name);
    const matches=[];
    for(const id of ids){
      if(!cache.has(id))
        cache.set(id,JSON.parse(fs.readFileSync(
          path.join(resources,'cards/en',id+'.json'),'utf8')));
      for(const printed of cache.get(id)){
        const no=String(card.printing.number);
        const promoPrefix={SMP:'SM',XYP:'XY',BWP:'BW',SWSP:'SWSH',SVP:'SVP'};
        const matchesNumber=String(printed.number)===no||
          (promoPrefix[card.printing.set]&&
          String(printed.number)===promoPrefix[card.printing.set]+no);
        if(matchesNumber&&normalizeName(printed.name)===sought)
          matches.push(printed);
      }
    }
    if(matches.length!==1)throw Error('Printing resolution '+
      card.name+' '+JSON.stringify(card.printing)+' matched '+matches.length);
    return matches[0];
  };
}

/**
 * Enumerate source-exact 29 original lists for Basic Pokémon with enough
 * effective current HP to survive an unmodified Psychic 280 attack.
 * This is strictly a printed HP/Weakness/Resistance screen. Abilities,
 * Tools, prior damage, external modifiers and actual play are excluded.
 */
function audit(){
  const roster=JSON.parse(fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const get=printIndex();
  const me=roster.decks.find(d=>d.rank===26);
  const melo=get(me.cards.find(c=>c.name==='Meloetta ex'));
  const tm=get(me.cards.find(c=>c.name==='Technical Machine: Crisis Punch'));
  if(melo.types.join(',')!=='Psychic'||!melo.abilities?.some(a=>
    a.name==='Debut Performance'))throw Error('Source Meloetta printing changed');
  const attack=tm.attacks?.find(a=>a.name==='Crisis Punch');
  if(attack?.damage!=='280')throw Error('Printed Crisis Punch no longer 280');
  const rows=[];
  for(const deck of roster.decks){
    let basics=0;
    const exceptions=[];
    const boundary=[];
    for(const entry of deck.cards.filter(c=>c.category==='Pokémon')){
      const card=get(entry);
      if(!card.subtypes?.includes('Basic'))continue;
      basics+=entry.count;
      const hit=card.weaknesses?.find(x=>x.type==='Psychic');
      const resist=card.resistances?.find(x=>x.type==='Psychic');
      const damage=(hit?280*Number(hit.value.replace('×','')):280)+
        (resist?Number(resist.value):0);
      if(Number(card.hp)>damage)exceptions.push({name:entry.name,
        printing:entry.printing,count:entry.count,hp:Number(card.hp),
        unmodifiedPsychicDamage:damage});
      if(Number(card.hp)===damage)boundary.push({name:entry.name,
        printing:entry.printing,count:entry.count,hp:Number(card.hp)});
    }
    const scenario=joint(basics,'hand-aware');
    const chance=exceptions.reduce((sum,e)=>sum+e.count,0)/basics;
    rows.push({rank:deck.rank,archetype:deck.archetype,basicCount:basics,
      exceptions,boundary,conditionalSoleBasicSurvivesDamage:chance,
      directRootAndForcedLone:scenario.conditionalJointSetupAndSourceRoot,
      directRootForcedLoneAndDamageSurvivor:
        scenario.conditionalJointSetupAndSourceRoot*chance});
  }
  if(rows.length!==29)throw Error('Authenticated original 29 changed');
  return {schema:'rank26-280-HP-original-basic-hard-survival-screen-v1',
    sourceRank:26,sourceAttack:'Crisis Punch',
    printedPsychicDamage:280,originalOpponentLists:29,
    exceptions:rows.filter(r=>r.exceptions.length),
    exact280Boundary:rows.filter(r=>r.boundary.length),
    rows,modeledGameWins:0,
    caveat:'Screen of full-HP solo registered Basic surviving exact unmodified 280 Psychic damage only. Excludes damage prevention, board modifiers, actual line, searches, attachment, opponent decisions and games.'};
}
module.exports={printIndex,audit};
if(require.main===module)
  process.stdout.write(JSON.stringify(audit(),null,2)+'\n');
