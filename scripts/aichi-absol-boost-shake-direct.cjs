'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {choose,audit}=require('./aichi-absol-garbotoxin-window.cjs');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}

/** @param {bigint} n @param {bigint} d */
function fraction(n,d){
  const factor=gcd(n,d);
  return {numerator:String(n/factor),denominator:String(d/factor),
    probability:Number(n)/Number(d)};
}

/**
 * Exact first-own-turn direct Trubbish + Float Stone + Boost Shake visibility,
 * conditional on at least one Basic in the original seven. At least one
 * searched-for Garbodor must remain in the deck after six unknown Prizes.
 * Draw eight is the first compulsory turn draw, not an extra mulligan card.
 * It presumes a turn where Items/Tools are playable and no outside lock.
 * @param {{basics:number,trubbish:number,garbodor:number,floatStone:number,boostShake:number}} x
 */
function shakeTurnOneWindow(x){
  const {basics,trubbish,garbodor,floatStone,boostShake}=x;
  assert([basics,trubbish,garbodor,floatStone,boostShake].every(v=>Number.isInteger(v)&&v>=0));
  const pops=[trubbish,garbodor,floatStone,boostShake,basics-trubbish,
    60-basics-garbodor-floatStone-boostShake];
  assert(pops.every(v=>v>=0));
  const opener=choose(60,7)-choose(60-basics,7);
  const prizeAll=choose(52,6);
  let numerator=0n;
  for(let t=0;t<=Math.min(7,pops[0]);t++)
  for(let g=0;g<=Math.min(7-t,pops[1]);g++)
  for(let f=0;f<=Math.min(7-t-g,pops[2]);f++)
  for(let s=0;s<=Math.min(7-t-g-f,pops[3]);s++)
  for(let b=0;b<=Math.min(7-t-g-f-s,pops[4]);b++){
    const o=7-t-g-f-s-b;
    if(o>pops[5]||t+b===0)continue;
    const opening=[t,g,f,s,b,o];
    const ways=opening.reduce((product,n,i)=>product*choose(pops[i],n),1n);
    for(let draw=0;draw<6;draw++){
      const available=pops[draw]-opening[draw];
      if(available===0)continue;
      const T=t+(draw===0?1:0),G=g+(draw===1?1:0);
      const F=f+(draw===2?1:0),S=s+(draw===3?1:0);
      if(T===0||F===0||S===0)continue;
      const remainingG=garbodor-G;
      if(remainingG===0)continue;
      const allRemainingGPrized=choose(52-remainingG,6-remainingG);
      numerator+=ways*BigInt(available)*(prizeAll-allRemainingGPrized);
    }
  }
  return fraction(numerator,opener*53n*prizeAll);
}

/** @param {object} data */
function sourceReport(data){
  const ranks=audit(data).ranks;
  return {source:'results/aichi-2026/full-decklists.json',
    event:'Boost Shake first-own-turn direct access after normal draw, valid opening seven, six Prize cards',
    excluded:'All search, Oranguru Back Order, Star Alchemy, Secret Box, hand-replacement Supporters, bonus draws, prior opponent locks, decision costs, and Tool substitutes',
    ranks:ranks.map(row=>{
      const deck=data.decks.find(d=>d.rank===row.rank);
      const boostShake=deck.cards.filter(c=>c.name==='Boost Shake')
        .reduce((n,c)=>n+c.count,0);
      return {rank:row.rank,basics:row.basics,trubbish:row.trubbish,
        garbodor:row.garbodor,floatStone:row.floatStone,boostShake,
        earlyDirectAccess:shakeTurnOneWindow({...row,boostShake})};
    })};
}

if(require.main===module){
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  process.stdout.write(JSON.stringify(sourceReport(source),null,2)+'\n');
}
module.exports={shakeTurnOneWindow,sourceReport};
