'use strict';

const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const {replacementDistance}=require('./agent42-missing-opponent-proxy-envelope.cjs');

/** @param {object} deck @returns {Map<string,number>} */
function printCounts(deck){
  const m=new Map();
  for(const c of deck.cards){
    assert.ok(c.printing?.set && c.printing?.number);
    const key=[c.name,c.printing.set,c.printing.number,
      c.printing.language??''].join('|');
    m.set(key,(m.get(key)||0)+c.count);
  }
  assert.equal([...m.values()].reduce((a,b)=>a+b,0),60);
  return m;
}

/**
 * Same-name cards with different printed text are distinct resources.
 * @param {object} a @param {object} b
 */
function printingSubstitutions(a,b){
  const x=printCounts(a),y=printCounts(b);
  return 60-[...x].reduce((s,[key,n])=>
    s+Math.min(n,y.get(key)||0),0);
}

function run(){
  const pick=rank=>field.decks.find(d=>d.rank===rank);
  const r4=pick(4),r17=pick(17);
  const reg=field.decks.filter(d=>d.archetype==='Regidrago');
  const pairs=[];
  for(let i=0;i<reg.length;i++)
    for(let j=i+1;j<reg.length;j++)
      pairs.push({ranks:[reg[i].rank,reg[j].rank],
        byName:replacementDistance(reg[i],reg[j]),
        byPrinting:printingSubstitutions(reg[i],reg[j])});
  assert.equal(pairs.length,36);
  return {
    schema:'agent42-raichu-printing-sensitivity-v1',
    raichuRanks:[4,17],
    nameReplacements:replacementDistance(r4,r17),
    printedReplacements:printingSubstitutions(r4,r17),
    rank4Pikachu:r4.cards.find(c=>c.name==='Pikachu').printing,
    rank17Pikachu:r17.cards.find(c=>c.name==='Pikachu').printing,
    regidragoPairs:pairs,
    regidragoPrintingDivergencePairs:pairs.filter(p=>
      p.byPrinting!==p.byName),
    originalExactLists:field.decks.length,
    qualifiedCompetitiveGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={printCounts,printingSubstitutions,run};
