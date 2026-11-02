'use strict';

const assert=require('node:assert/strict');
const {choose,gcd}=require('./agent18-exeggutor-opener-risk.cjs');

/**
 * Exact direct-hand turn-two Grand Tree + Jet setup for one named Basic
 * evolving into either a Stage1 (Exeggutor) or Stage2 (Stoutland).
 * Going first: seven opening cards and one draw by own turn two; the target
 * Basic must have been among the opening seven.
 * Going second: seven plus two draws by own turn two; the target Basic
 * must have appeared by the eighth card, before the next opponent turn.
 * Stage copies must remain in the deck after opening, draw and Prizes,
 * because Grand Tree searches from the deck. No draw, tutor, natural
 * evolution, opponent response or player policy is modeled.
 *
 * @param {{deckSize:number,opening:number,prizes:number,targetBasics:number,otherBasics:number,grandTrees:number,jet:number,stages:number[],draws:1|2}} c
 * @returns {{fraction:string,probability:number,percent:number}}
 */
function grandTreeDirectWindow(c){
  const {deckSize:n,opening:h,prizes:p,targetBasics:e,otherBasics:b,
    grandTrees:t,jet:j,stages,draws:d}=c;
  assert.ok([n,h,p,e,b,t,j,d].every(v=>Number.isSafeInteger(v)&&v>=0));
  assert.ok(d===1||d===2);
  assert.ok(h>=1&&n>h+p+d&&e>0&&t>0&&j>0&&
    Array.isArray(stages)&&stages.length>=1&&stages.length<=2&&
    stages.every(v=>Number.isSafeInteger(v)&&v>0));
  const filler=n-e-b-t-j-stages.reduce((a,v)=>a+v,0);
  assert.ok(filler>=0);
  const groups=[e,b,t,j,...stages,filler];
  const seen=h+d,unseen=n-seen;
  let good=0n;

  /** @param {number[]} counts @param {number} index @param {number} selected */
  function visit(counts,index,selected){
    if(index===groups.length-1){
      const remainder=seen-selected;
      if(remainder<0||remainder>filler)return;
      const q=[...counts,remainder];
      if(q[0]<1||q[2]<1||q[3]<1)return;
      const remainingStages=stages.map((v,i)=>v-q[4+i]);
      if(remainingStages.some(v=>v<1))return;
      const ways=q.reduce((a,v,i)=>a*choose(groups[i],v),1n);
      let assignments=0n;
      /** @param {number[]} after @param {number[]} selectedTypes */
      function draws(after,selectedTypes,placements){
        if(selectedTypes.length===d){
          if(after[0]+after[1]<1)return;
          if(d===1&&after[0]<1)return;
          if(d===2&&q[0]-(selectedTypes[1]===0?1:0)<1)return;
          assignments+=placements;
          return;
        }
        for(let i=0;i<after.length;i++)if(after[i]>0){
          const next=[...after];next[i]--;
          draws(next,[...selectedTypes,i],placements*BigInt(after[i]));
        }
      }
      draws(q,[],1n);
      let prizeSurvival=0n;
      for(let mask=0;mask<(1<<remainingStages.length);mask++){
        let count=0;
        for(let i=0;i<remainingStages.length;i++)if(mask&(1<<i))count+=remainingStages[i];
        const term=count<=p?choose(unseen-count,p-count):0n;
        prizeSurvival+=mask.toString(2).replace(/0/g,'').length%2?-term:term;
      }
      good+=ways*assignments*prizeSurvival;
      return;
    }
    for(let v=0;v<=Math.min(groups[index],seen-selected);v++)
      visit([...counts,v],index+1,selected+v);
  }
  visit([],0,0);
  const openerValid=choose(n,h)-choose(n-e-b,h);
  const drawWays=Array.from({length:d},(_,i)=>BigInt(n-h-i))
    .reduce((a,v)=>a*v,1n);
  const total=openerValid*drawWays*choose(n-h-d,p);
  assert.ok(total>0n&&good>=0n&&good<=total);
  const div=gcd(good,total);
  return {fraction:String(good/div)+'/'+String(total/div),
    probability:Number(good)/Number(total),
    percent:Number(good)*100/Number(total)};
}

/** @returns {object} */
function main(){
  const shared={deckSize:60,opening:7,prizes:6,targetBasics:2,
    otherBasics:12,grandTrees:1};
  const candidates=[
    {label:'exact-original-Stoutland',jet:2,stages:[2,1]},
    {label:'frozen-Exeggutor-v2',jet:3,stages:[2]}
  ];
  return {schema:'agent18-turn2-grand-tree-direct-opening-physical-v1',
    table:[1,2].flatMap(draws=>candidates.map(({label,jet,stages})=>({
      seat:draws===1?'going-first':'going-second',label,
      ...grandTreeDirectWindow({...shared,jet,stages,draws})}))),
    competitiveQualifiedGames:0,
    scope:'Untutored natural physical presence of target Basic by previous turn, Grand Tree and Jet by turn 2, and Stage(s) in deck; no other playable setup or wins inferred.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={grandTreeDirectWindow,main};
