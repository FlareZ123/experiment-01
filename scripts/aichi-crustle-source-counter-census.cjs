'use strict';

const fs=require('node:fs');
const path=require('node:path');

const rosterPath=path.resolve(__dirname,'../results/aichi-2026/full-decklists.json');

/** @param {{name:string,printing:{set:string,number:string}}} row */
const isCopycat=row=>row.name==='Mimikyu' &&
  row.printing?.set==='GRI' && row.printing?.number==='58';
/** @param {{name:string,printing:{set:string,number:string}}} row */
const isKlefki=row=>row.name==='Klefki' &&
  row.printing?.set==='SVI' && row.printing?.number==='96';

/**
 * Pure card-presence census, not a policy, legal-action or damage oracle.
 * Assumes supplied exact source 60s are already independently authenticated.
 * @param {{decks:Array<{rank:number,cards:object[]}>}} roster
 */
function census(roster){
  const rows=roster.decks;
  const group=predicate=>rows.filter(row=>row.cards.some(predicate))
    .map(row=>row.rank).sort((a,b)=>a-b);
  const named=name=>card=>card.name===name;
  const threats={
    garbotoxin:group(named('Garbodor')),
    wobbuffet:group(named('Wobbuffet')),
    flutterMane:group(named('Flutter Mane')),
    cancelingCologne:group(named('Canceling Cologne')),
    basicKlefki:group(isKlefki),
    copycatMimikyu:group(isCopycat),
    regidragoVstar:group(named('Regidrago VSTAR')),
    ironThorns:group(named('Iron Thorns ex'))
  };
  const sortedUnion=arrays=>[...new Set(arrays.flat())].sort((a,b)=>a-b);
  const exposedCrustleAbility=sortedUnion([
    threats.garbotoxin,threats.wobbuffet,
    threats.flutterMane,threats.cancelingCologne
  ]);
  const anyNamedExposure=sortedUnion([
    exposedCrustleAbility,threats.basicKlefki,
    threats.copycatMimikyu,threats.regidragoVstar
  ]);
  const thorns=rows.filter(row=>threats.ironThorns.includes(row.rank))
    .map(row=>({
      rank:row.rank,
      pokemon:row.cards.filter(card=>card.category==='Pokémon')
        .map(card=>({name:card.name,count:card.count})),
      energy:row.cards.filter(card=>card.category==='Energy')
        .map(card=>({name:card.name,count:card.count})),
      energyCopies:row.cards.filter(card=>card.category==='Energy')
        .reduce((sum,card)=>sum+card.count,0)
    }));
  return {
    schema:'aichi-source-printed-immunity-wall-risk-census-v1',
    exactSourceDeckCount:rows.length,
    threats,
    exposedCrustleAbility,
    exposedCrustleAbilityCount:exposedCrustleAbility.length,
    anyNamedExposure,
    anyNamedExposureCount:anyNamedExposure.length,
    thorns,
    qualification:{
      exactPrintInventoryOnly:true,
      counterLegalActionObserved:false,
      counterAccessProbabilityEstimated:false,
      matchWinEvidence:false
    }
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(census(
    JSON.parse(fs.readFileSync(rosterPath,'utf8'))),null,2)+'\n');
}
module.exports={census,isCopycat,isKlefki};
