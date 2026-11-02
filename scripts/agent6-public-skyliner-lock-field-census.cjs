'use strict';

const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');

const VERSION='agent6-public-skyliner-lock-source-field-v1';
const SPEC=Object.freeze({
  'path-to-the-peak':[{name:'Path to the Peak',print:'CRE 148'}],
  'silent-lab':[{name:'Silent Lab',print:'PRC 140'}],
  'iron-thorns-initialization':[{name:'Iron Thorns ex',print:'TWM 77'}],
  'active-klefki':[{name:'Klefki',print:'SVI 96'}],
  'garbotoxin-with-tool':[
    {name:'Garbodor',print:'LTR 68'},
    {name:'Garbodor',print:'BKP 57'}
  ],
  'active-galarian-weezing':[
    {name:'Galarian Weezing',print:'RCL 113'}
  ],
  'alolan-muk':[{name:'Alolan Muk',print:'SUM 58'}]
});

/**
 * Count distinct original printed sixties carrying a candidate lock card.
 * The presence of a conditional source card is NOT its active applicability.
 *
 * @param {object[]} [decks] Exact original published field records.
 * @returns {object} Reproducible physical deck-presence census.
 */
function census(decks=manifest.decks){
  const ranks=new Set();
  for(const d of decks){
    assert.ok(Number.isSafeInteger(d.rank));
    assert.ok(!ranks.has(d.rank),'duplicate source rank');
    ranks.add(d.rank);
    assert.equal(d.cards.reduce((sum,card)=>sum+card.count,0),60);
  }
  const names=Object.keys(SPEC);
  const byMechanism=Object.fromEntries(names.map(name=>[name,[]]));
  for(const d of decks){
    for(const [name,conditions] of Object.entries(SPEC)){
      if(d.cards.some(card=>conditions.some(p=>
        card.name===p.name&&
        card.printing?.set+' '+card.printing?.number===p.print))){
        byMechanism[name].push(d.rank);
      }
    }
  }
  for(const matches of Object.values(byMechanism))
    matches.sort((a,b)=>a-b);
  const union=[...new Set(Object.values(byMechanism).flat())]
    .sort((a,b)=>a-b);
  // Tool Jammer is a separate, conditional obstruction to the
  // already-attached Float Stone fallback; it does not suppress Skyliner.
  const toolJammerRanks=decks.filter(d=>d.cards.some(card=>
    card.name==='Tool Jammer'&&
    card.printing?.set==='BST'&&card.printing?.number==='136'))
    .map(d=>d.rank).sort((a,b)=>a-b);
  const thornsRanks=byMechanism['iron-thorns-initialization'];
  const pathRanks=byMechanism['path-to-the-peak'];

  return {
    version:VERSION,
    authenticatedOriginals:decks.length,
    sourceRank30Present:ranks.has(30),
    originalRank30HasSkyliner:decks.some(d=>d.rank===30&&
      d.cards.some(card=>card.name==='Latias ex'&&
        card.printing?.set==='SSP'&&card.printing?.number==='76')),
    conditionalCardPresenceOnly:true,
    byMechanism,unionRanks:union,unionCount:union.length,
    sourceRank30FloatStoneCount:decks.filter(d=>d.rank===30)
      .flatMap(d=>d.cards.filter(card=>card.name==='Float Stone'&&
        card.printing?.set==='BKT'&&card.printing?.number==='137'))
      .reduce((sum,card)=>sum+card.count,0),
    toolJammerRanks,
    thornsWithToolJammer:thornsRanks.filter(rank=>
      toolJammerRanks.includes(rank)),
    pathWithToolJammer:pathRanks.filter(rank=>
      toolJammerRanks.includes(rank)),
    knownMissingOriginalRanks:[23,25,28],
    qualification:'no established lock uptime or human-game win probability'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(census(),null,2)+'\n');
module.exports={VERSION,SPEC,census};
