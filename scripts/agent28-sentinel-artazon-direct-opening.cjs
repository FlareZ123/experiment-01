'use strict';

/** @typedef {'B'|'O'|'F'|'A'|'G'|'T'|'L'|'V'|'M'|'J'|'C'|'R'|'X'|'Y'} CardClass */

// Fixed Sentinel v1 inventory, collapsed to interaction-relevant printed classes.
// B Bunnelby, O Oddish, F Fan Rotom, A Artazon, G Guzma & Hala,
// T Tag Call, L Gloom, V Vileplume, M TM Evolution, J Jet Energy,
// C Capture Energy, R Basic Grass Energy, X other Basics, Y other cards.
const COUNTS = Object.freeze({
  B:2,O:2,F:1,A:1,G:4,T:4,L:2,V:2,M:2,J:3,C:2,R:1,X:9,Y:25
});
const DECK = Object.entries(COUNTS).flatMap(([k,n]) => Array(n).fill(k));
const BASIC = new Set(['B','O','F','X']);

/** @param {CardClass[]} cards */
function tally(cards) {
  const t = Object.fromEntries(Object.keys(COUNTS).map(k=>[k,0]));
  for(const c of cards)t[c]++;
  return t;
}

/**
 * Restricted going-second resource-access model. G&H's optional two-card
 * discard is assumed payable/strategically acceptable. This is not native
 * turn execution or a game-win model.
 * @param {{opening:CardClass[],prizes:CardClass[],draw:CardClass,remaining:CardClass[]}} deal
 */
function evaluate(deal) {
  const initial=tally(deal.opening);
  const hand=tally([...deal.opening,deal.draw]);
  const deck=tally(deal.remaining);
  const valid=deal.opening.some(c=>BASIC.has(c));
  const supporter=hand.G>0||(hand.T>0&&deck.G>0);
  const stages=deck.L>0&&deck.V>0;
  const tm=hand.M+deck.M>0;
  const art=hand.A+deck.A>0;
  const jet=hand.J+deck.J>0;
  const capture=hand.C+deck.C>0;
  const energyForInitialB=jet||capture||hand.R>0;
  const bSeen=hand.B>0;
  const oSeen=hand.O>0;
  const fanB=hand.F>0&&deck.B>0;
  const immediateB=bSeen&&(initial.B>0?energyForInitialB:jet);
  const direct=immediateB&&oSeen;
  const artOdd=immediateB&&!oSeen&&art&&deck.O>0;
  const fanArt=!bSeen&&fanB&&jet&&(oSeen||(art&&deck.O>0));
  const artB=!bSeen&&oSeen&&art&&deck.B>0&&jet;
  const captureOdd=initial.B>0&&!oSeen&&deck.O>0&&capture;
  const artFan=!bSeen&&hand.F===0&&oSeen&&art&&deck.F>0&&deck.B>0&&jet;
  const core=valid&&supporter&&stages&&tm;
  const oldOpportunity=core&&(direct||artOdd||fanArt||artFan||captureOdd);
  const newOpportunity=core&&(direct||artOdd||fanArt||artB||captureOdd);
  return {valid,core,direct:core&&direct,artOdd:core&&artOdd,
    fanArt:core&&fanArt,artB:core&&artB,captureOdd:core&&captureOdd,
    artFan:core&&artFan,oldOpportunity,newOpportunity,
    improvedAccess:newOpportunity&&!oldOpportunity,connectorDominance:core&&artFan};
}

/** @param {number} seed */
function makeRandom(seed) {
  let x=seed>>>0;
  return ()=>{
    x=(x+0x6D2B79F5)>>>0;
    let t=x;
    t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}

/** @param {CardClass[]} cards @param {()=>number} random */
function sampleDeal(cards,random) {
  const a=cards.slice();
  for(let i=0;i<14;i++){
    const j=i+Math.floor(random()*(60-i));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return {opening:a.slice(0,7),prizes:a.slice(7,13),draw:a[13],remaining:a.slice(14)};
}

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if(k<0||k>n)return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)result=result*BigInt(n-i+1)/BigInt(i);
  return result;
}

/**
 * Exact allocation DP for the new and disjoint Artazon->Bunnelby
 * opportunity when Fan Rotom is Prized. The last class combines 28
 * nonbasic cards irrelevant to this incremental route.
 */
function exactArtazonIncrement() {
  const classes=[['B',2],['F',1],['A',1],['O',2],['G',4],['T',4],
    ['L',2],['V',2],['M',2],['J',3],['X',9],['Y',28]];
  let states=new Map([['0,0,0,0,0,0,0',1n]]);
  for(const [name,n] of classes) {
    const options=[];
    for(let h=0;h<=n;h++)for(let p=0;p<=n-h;p++)
      for(let d=0;d<=Math.min(1,n-h-p);d++){
        const r=n-h-p-d;
        if(name==='B'&&(h>0||d>0||r===0))continue;
        if(name==='F'&&p!==1)continue;
        if(name==='A'&&p>0)continue;
        if(name==='O'&&h+d===0)continue;
        if((name==='L'||name==='V')&&r===0)continue;
        if((name==='M'||name==='J')&&p===n)continue;
        options.push([h,p,d,r,choose(n,h)*choose(n-h,p)*choose(n-h-p,d)]);
      }
    const next=new Map();
    for(const [encoded,ways] of states) {
      const [H,P,D,initialBasic,gSeen,tSeen,gDeck]=encoded.split(',').map(Number);
      for(const [h,p,d,r,w] of options) {
        if(H+h>7||P+p>6||D+d>1)continue;
        const key=[H+h,P+p,D+d,
          Number(Boolean(initialBasic||((name==='O'||name==='X')&&h>0))),
          Number(Boolean(gSeen||(name==='G'&&h+d>0))),
          Number(Boolean(tSeen||(name==='T'&&h+d>0))),
          Number(Boolean(gDeck||(name==='G'&&r>0)))].join(',');
        next.set(key,(next.get(key)||0n)+ways*w);
      }
    }
    states=next;
  }
  let numerator=0n;
  for(const [encoded,ways] of states) {
    const [H,P,D,initialBasic,gSeen,tSeen,gDeck]=encoded.split(',').map(Number);
    if(H===7&&P===6&&D===1&&initialBasic&&(gSeen||(tSeen&&gDeck)))
      numerator+=ways;
  }
  const denominator=choose(60,7)*choose(53,6)*47n;
  const validDenominator=(choose(60,7)-choose(46,7))*choose(53,6)*47n;
  return {numerator,denominator,validDenominator,
    unconditionalPercent:100*Number(numerator)/Number(denominator),
    conditionalValidPercent:100*Number(numerator)/Number(validDenominator)};
}

/** @param {number} iterations @param {number} seed */
function simulate(iterations,seed) {
  const random=makeRandom(seed);
  const example=evaluate({opening:DECK.slice(0,7),prizes:DECK.slice(7,13),
    draw:DECK[13],remaining:DECK.slice(14)});
  const counts=Object.fromEntries(Object.keys(example).map(k=>[k,0]));
  for(let i=0;i<iterations;i++) {
    const flags=evaluate(sampleDeal(DECK,random));
    for(const [key,present] of Object.entries(flags))if(present)counts[key]++;
  }
  const exact=exactArtazonIncrement();
  return {iterations,seed,counts,percentagesConditionalValid:
    Object.fromEntries(Object.entries(counts).filter(([k])=>k!=='valid')
      .map(([k,v])=>[k,100*v/counts.valid])),
    exactAdditionalArtazonRoute:Object.fromEntries(Object.entries(exact)
      .map(([k,v])=>[k,typeof v==='bigint'?v.toString():v])),
    caveat:'Restricted physical resource access, not executed turns, paper qualification, or wins'};
}

if(require.main===module)
  console.log(JSON.stringify(simulate(Number(process.argv[2]||2000000),
    Number(process.argv[3]||27042026)),null,2));
module.exports={COUNTS,DECK,evaluate,makeRandom,sampleDeal,simulate,exactArtazonIncrement};
