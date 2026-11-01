'use strict';

const field=require('../results/aichi-2026/full-decklists.json');
const MILL=['Team Rocket\'s Handiwork','Bellelba & Brycen-Man'];
const CONTROL=['Lusamine',...MILL,'Gladion','Peonia','VS Seeker',
  "Lillie's Determination"];

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||
     n<0||k<0||k>n)return 0n;
  let value=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    value=value*BigInt(n-i+1)/BigInt(i);
  return value;
}

/** @param {{cards:{name:string,count:number}[]}} deck */
function sourceControlDeck(deck){
  const count=name=>deck.cards.filter(c=>c.name===name)
    .reduce((sum,c)=>sum+c.count,0);
  const copies=Object.fromEntries(CONTROL.map(name=>[name,count(name)]));
  const mills=MILL.filter(name=>copies[name]>0);
  return {rank:deck.rank,archetype:deck.archetype,copies,mills,
    twoLusamineMillEngine:copies.Lusamine>=2&&mills.length>0,
    handworkEngine:copies.Lusamine>=2&&
      copies["Team Rocket's Handiwork"]>0,
    symmetricMillEngine:copies.Lusamine>=2&&
      copies['Bellelba & Brycen-Man']>0};
}

/**
 * Conditional, original rank29 no-Prize-taking Peonia recovery envelope.
 * Three named core cards L1,L2,H and one Peonia in 60 physical cards.
 * If Peonia is unprized, two nonshuffling selections of complementary 3
 * positions access all original six Prize cards, requiring enough safe
 * replacements and actual Peonia retrieval between Supporter turns.
 * @returns {object}
 */
function peoniaPrizeEnvelope(){
  const total=choose(60,6);
  const selections=choose(6,3);
  const direct=choose(57,6);
  let blindSuccess=direct*selections;
  for(let x=1;x<=3;x++){
    blindSuccess+=choose(3,x)*choose(56,6-x)*choose(6-x,3-x);
  }
  const peoniaPrizedWithCore=choose(59,5)-choose(56,5);
  const twicePotential=total-peoniaPrizedWithCore;
  return {
    total,blindSelectionPaths:total*selections,
    directNoCorePrized:direct,blindOneSelectionSuccessPaths:blindSuccess,
    blindOneSelectionProbability:
      Number(blindSuccess)/Number(total*selections),
    peoniaPrizedWithCore,
    twoNonshuffledSelectionPotentialDeals:twicePotential,
    twoSelectionPotentialFraction:Number(twicePotential)/Number(total)
  };
}

/** @returns {object} */
function runCensus(){
  const decks=field.decks.map(sourceControlDeck);
  const mills=decks.filter(d=>d.mills.length>0);
  const recursive=mills.filter(d=>d.twoLusamineMillEngine);
  return {sourceDeckCount:decks.length,exactOriginals:field.published_deck_count,
    millingRanks:mills.map(d=>d.rank),
    twoLusamineMillRanks:recursive.map(d=>d.rank),
    handworkRanks:recursive.filter(d=>d.handworkEngine).map(d=>d.rank),
    symmetricRanks:recursive.filter(d=>d.symmetricMillEngine).map(d=>d.rank),
    millSources:mills,
    rank29Peonia:peoniaPrizeEnvelope()};
}

if(require.main===module){
  const report=runCensus();
  console.log(JSON.stringify(report,(_,value)=>typeof value==='bigint'?
    value.toString():value,null,2));
}
module.exports={MILL,CONTROL,choose,sourceControlDeck,peoniaPrizeEnvelope,
  runCensus};
