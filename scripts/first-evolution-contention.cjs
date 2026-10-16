'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {choose,countsFromDeck}=require('./first-evolution-natural.cjs');
const {loadBasicIndex}=require('./aichi_opening_audit.cjs');

/**
 * Exact opening resource event: >=2 target Basics seen by end of turn one,
 * and exactly one matching Evolution seen by start of turn two, conditional
 * on a valid original starting seven. Uniform six Prizes are marginalized.
 * The event is only an upper bound on states in which a single copy creates
 * a genuine target-choice contention, even before search is considered.
 *
 * @param {{deckSize:number,openingSize:number,prizeCount:number,
 *  basicCount:number,targetBasicCount:number,stageOneCount:number,
 *  bonusDraws?:number}} input
 * @returns {number}
 */
function competingEvolutionOpportunity(input) {
  const {deckSize:n,openingSize:h,prizeCount:p,basicCount:B,
    targetBasicCount:V,stageOneCount:M,bonusDraws:d=0}=input;
  if (![n,h,p,B,V,M,d].every(Number.isInteger) ||
      n<1 || h<1 || p<0 || d<0 || B<1 || V<1 || M<1 ||
      V>B || B+M>n || h+p+d+2>n) {
    throw new RangeError('Invalid deck partition or draw horizon');
  }
  const t1=h+1+d, filler=n-B-M;
  const valid=1-Number(choose(n-B,h))/Number(choose(n,h));
  let probability=0;
  for(let v=2;v<=Math.min(V,t1);v++) {
    for(let m=0;m<=Math.min(1,M,t1-v);m++) {
      for(let b=0;b<=B-V;b++) {
        const f=t1-v-m-b;
        if(f<0 || f>filler) continue;
        const combinations=choose(V,v)*choose(M,m)*
          choose(B-V,b)*choose(filler,f);
        const weight=Number(combinations)/Number(choose(n,t1));
        const noBasicInOriginal=
          Number(choose(t1-v-b,h))/Number(choose(t1,h));
        const missingStage=M-m;
        const nextStageProbability=m===0 ?
          missingStage/(n-t1) : (n-t1-missingStage)/(n-t1);
        probability += weight*(1-noBasicInOriginal)*nextStageProbability;
      }
    }
  }
  return probability/valid;
}

if(require.main===module) {
  const root=path.resolve(__dirname,'..');
  const source=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const folder=path.join(root,'results/aichi-2026');
  const decks=[
    ['champion-reference',source.decks.find(d=>d.rank===1)],
    ['hood-shield-v1',JSON.parse(fs.readFileSync(
      path.join(folder,'candidate-hood-shadow-rider.json'),'utf8'))],
    ['temple-v1',JSON.parse(fs.readFileSync(
      path.join(folder,'candidate-temple-shadow-rider.json'),'utf8'))]
  ];
  const index=loadBasicIndex(path.join(root,'resources/cards/en'));
  for(const [name,deck] of decks) {
    const counts=countsFromDeck(deck,index);
    const probability=competingEvolutionOpportunity({
      deckSize:60,openingSize:7,prizeCount:6,...counts
    });
    process.stdout.write(JSON.stringify({name,counts,probability})+'\n');
  }
}

module.exports={competingEvolutionOpportunity};
