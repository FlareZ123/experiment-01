'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {choose}=require('./aichi-champion-critical-prize-collapse.cjs');

/**
 * Exactly enumerate six-card Prize subsets after a singleton Klefki is known
 * in the initial seven. By exchangeability, these Prizes are uniformly
 * distributed over the other 59 physical cards.
 *
 * The only physical package required by this narrow query is:
 * - U-Turn Board not Prized
 * - source Stadium replacement (rank4 Sky Field, rank17 PokéStop) not all Prized
 * - a Voltorb/ Electrode and Pikachu/ Alolan Raichu evolution pair, where
 *   Ditto Prism may substitute for exactly one missing Basic
 * - two Reversal, two Counter, and one Unit LPM Energy not Prized
 *
 * It ignores whether these cards can actually be reached, discarded,
 * attached, evolved or played on any turn.
 *
 * @param {number[]} counts Ten non-Klefki physical category counts:
 * Voltorb, Electrode, Pikachu, Ditto, Raichu, Board, Stadium,
 * Reversal, Counter, Unit LPM.
 * @param {number} other Other cards after removing the singleton Klefki.
 * @param {number} prizeSize Number of face-down Prize cards.
 * @returns {{favorable:bigint,all:bigint}}
 */
function physicalPrizeGate(counts,other,prizeSize=6){
  if(counts.length!==10||counts.some(n=>!Number.isInteger(n)||n<0)||
    !Number.isInteger(other)||other<0||
    !Number.isInteger(prizeSize)||prizeSize<0||
    prizeSize>counts.reduce((n,x)=>n+x,other))throw Error('Invalid counts');
  let favorable=0n;
  const prized=new Array(counts.length).fill(0);
  /** @param {number} index @param {number} selected @param {bigint} ways */
  function enumerate(index,selected,ways){
    if(index===counts.length){
      const otherPrized=prizeSize-selected;
      if(otherPrized<0||otherPrized>other)return;
      const survive=counts.map((count,i)=>count-prized[i]);
      const hasEvolutionBases=
        (survive[0]>=1&&survive[2]>=1)||
        (survive[3]>=1&&(survive[0]>=1||survive[2]>=1));
      if(survive[1]<1||survive[4]<1||survive[5]<1||
        survive[6]<1||survive[7]<2||survive[8]<2||
        survive[9]<1||!hasEvolutionBases)return;
      favorable+=ways*choose(other,otherPrized);
      return;
    }
    for(let n=0;n<=Math.min(counts[index],prizeSize-selected);n++){
      prized[index]=n;
      enumerate(index+1,selected+n,ways*choose(counts[index],n));
    }
  }
  enumerate(0,0,1n);
  return {favorable,all:choose(counts.reduce((n,x)=>n+x,other),prizeSize)};
}

/** @param {4|17} rank @returns {object} */
function sourcePrizeGate(rank){
  if(rank!==4&&rank!==17)throw Error('Supported source ranks: 4 and 17');
  const field=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=field.decks.find(row=>row.rank===rank);
  if(!deck||deck.cards.reduce((n,row)=>n+row.count,0)!==60||
    !/Raichu Electrode/.test(deck.archetype))throw Error('Missing exact source');
  const count=name=>deck.cards.filter(row=>row.name===name)
    .reduce((n,row)=>n+row.count,0);
  const basicCount=deck.cards.filter(row=>row.category==='Pokémon')
    .reduce((n,row)=>n+row.count,0)-5;
  if(basicCount!==13||count('Klefki')!==1)throw Error('Source Basic or Klefki changed');
  const stadiumName=rank===4?'Sky Field':'PokéStop';
  const names=[
    'Voltorb','Electrode-GX','Pikachu','Ditto ♢',
    'Alolan Raichu','U-Turn Board',stadiumName,
    'Reversal Energy','Counter Energy','Unit Energy LPM'
  ];
  const counts=names.map(count);
  const expected=[2,3,1,1,2,1,rank===4?3:1,4,4,4];
  if(counts.some((n,i)=>n!==expected[i]))throw Error('Original source signature changed');
  const other=59-counts.reduce((n,x)=>n+x,0);
  const {favorable,all}=physicalPrizeGate(counts,other,6);
  const validOpeningHands=choose(60,7)-choose(60-basicCount,7);
  const directKlefkiStartingOptions=choose(59,6);
  return {
    rank,sourcePlayer:deck.player,stadiumName,counts,other,
    validOpeningHands,prizeSubsetsGivenStartingKlefki:all,
    favorablePrizeSubsetsGivenStartingKlefki:favorable,
    probabilityKlefkiInValidInitialSeven:
      Number(directKlefkiStartingOptions)/Number(validOpeningHands),
    probabilityExactPackageUnprizedGivenStartingKlefki:
      Number(favorable)/Number(all),
    probabilityStartingKlefkiAndExactPackageUnprizedGivenValidInitialSeven:
      Number(favorable)/Number(validOpeningHands),
    probabilityFractionJoint:String(favorable)+'/'+String(validOpeningHands),
    status:'SIX_PRIZE_STATIC_CUSTODY_GATE_NOT_SETUP_OR_MATCHUP_WIN'
  };
}

if(require.main===module){
  const rows=[sourcePrizeGate(4),sourcePrizeGate(17)].map(row=>Object.fromEntries(
    Object.entries(row).map(([k,v])=>[k,typeof v==='bigint'?String(v):v])));
  process.stdout.write(JSON.stringify(rows,null,2)+'\n');
}
module.exports={physicalPrizeGate,sourcePrizeGate};
