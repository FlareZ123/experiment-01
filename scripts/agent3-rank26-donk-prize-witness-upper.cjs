'use strict';

/**
 * Hard event upper limits for the SPECIFIC source-first 21-action Meloetta
 * five-self-KO paper witness. Every original printed source copy required by
 * the staged sequence must remain unprized. Its starting Active Bunnelby
 * must already appear in source's original opening seven. This does not
 * bound alternative first-turn attack routes, actual owner decision policy,
 * access of cards on source turn1 or overall win probability.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let x=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    x=x*BigInt(n-i+1)/BigInt(i);
  return x;
}

/** @typedef {{name:string,copies:number,needed:number}} Group */
/** @type {Group[]} */
const WITNESS_GROUPS=[
  {name:'Bunnelby',copies:1,needed:1},
  {name:'Meloetta ex',copies:1,needed:1},
  {name:'Tapu Koko Prism Star',copies:1,needed:1},
  {name:'Exeggcute',copies:2,needed:2},
  {name:'Unown',copies:4,needed:1},
  {name:'Risky Ruins',copies:4,needed:1},
  {name:'Damage Pump',copies:4,needed:3},
  {name:'Battle Compressor',copies:4,needed:1},
  {name:'Double Colorless Energy',copies:1,needed:1},
  {name:'Technical Machine: Crisis Punch',copies:2,needed:1},
  {name:'Escape Rope',copies:1,needed:1},
  {name:'Lightning Energy',copies:2,needed:2}
];

/**
 * Count 6-card Prize subsets of a deck with grouped required copies. The
 * remainder of its card slots are unrestricted and may be Prized freely.
 * @param {number} deckSize
 * @param {Group[]} groups
 * @returns {{validPrizes:bigint,totalPrizes:bigint,probability:number}}
 */
function exactPrizeSurvival(deckSize,groups){
  if(!Number.isInteger(deckSize)||deckSize<6||deckSize>60)
    throw new RangeError('Deck size must be 6..60');
  const named=groups.reduce((n,g)=>{
    if(!Number.isInteger(g.copies)||!Number.isInteger(g.needed)||
      g.copies<0||g.needed<0||g.needed>g.copies)
      throw new RangeError('Invalid card group');
    return n+g.copies;
  },0);
  if(named>deckSize)throw new RangeError('Group copies exceed deck size');
  /** @type {Group[]} */
  const all=[...groups,{name:'other',copies:deckSize-named,needed:0}];
  let dp=[1n,0n,0n,0n,0n,0n,0n];
  for(const group of all){
    const next=Array(7).fill(0n);
    for(let taken=0;taken<=6;taken++)
      for(let prized=0;prized<=Math.min(group.copies,6-taken);prized++)
        if(group.copies-prized>=group.needed)
          next[taken+prized]+=dp[taken]*choose(group.copies,prized);
    dp=next;
  }
  const totalPrizes=choose(deckSize,6);
  return {validPrizes:dp[6],totalPrizes,
    probability:Number(dp[6])/Number(totalPrizes)};
}

/**
 * @returns {{
 *  unprizedAllWitnessGroups:number,
 *  unprizedWitnessAndCologne:number,
 *  bunnelbyInValidOpeningSeven:number,
 *  groupSurvivalGivenBunnelbyInSeven:number,
 *  firstSevenBunnelbyAndAllOtherRequiredUnprized:number,
 *  firstSevenBunnelbyAndCologneUnprized:number
 * }}
 */
function rank26WitnessUpper(){
  const cologne={name:'Canceling Cologne',copies:1,needed:1};
  const rest=WITNESS_GROUPS.filter(g=>g.name!=='Bunnelby');
  const pBunnelby=(7/60)/(1-
    Number(choose(48,7))/Number(choose(60,7)));
  const given=exactPrizeSurvival(59,rest).probability;
  return {
    unprizedAllWitnessGroups:
      exactPrizeSurvival(60,WITNESS_GROUPS).probability,
    unprizedWitnessAndCologne:
      exactPrizeSurvival(60,[...WITNESS_GROUPS,cologne]).probability,
    bunnelbyInValidOpeningSeven:pBunnelby,
    groupSurvivalGivenBunnelbyInSeven:given,
    firstSevenBunnelbyAndAllOtherRequiredUnprized:pBunnelby*given,
    firstSevenBunnelbyAndCologneUnprized:pBunnelby*
      exactPrizeSurvival(59,[...rest,cologne]).probability
  };
}

module.exports={choose,WITNESS_GROUPS,exactPrizeSurvival,rank26WitnessUpper};
if(require.main===module){
  process.stdout.write(JSON.stringify(rank26WitnessUpper(),null,2)+'\n');
}
