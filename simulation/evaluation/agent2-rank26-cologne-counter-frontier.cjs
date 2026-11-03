'use strict';
const assert=require('node:assert/strict');

const BASICS=new Set(['Unown','Exeggcute','Meloetta ex','Tapu Koko ♢',
  'Bunnelby','Squawkabilly ex','Crobat V','Dedenne-GX']);
const COUNTS=Object.freeze({basic:12,mail:4,pad:3,cologne:1,other:40});

/** @param {number} n @param {number} k @returns {number} */
function choose(n,k){
  if(k<0||k>n)return 0;
  let v=1;
  for(let i=1;i<=Math.min(k,n-k);i++)v=v*(n-i+1)/i;
  return Math.round(v);
}

/**
 * Reconcile original rank26 physical 60, preserving exact Trainer counts.
 * @param {{rank:number|string,cards:{name:string,count:number}[]}} source
 * @returns {typeof COUNTS}
 */
function sourceCounts(source){
  assert.equal(Number(source.rank),26);
  const n=new Map(source.cards.map(c=>[c.name,c.count]));
  assert.equal(n.size,source.cards.length);
  assert.equal(source.cards.reduce((v,c)=>v+c.count,0),60);
  const basic=[...BASICS].reduce((v,name)=>v+(n.get(name)||0),0);
  assert.equal(basic,12);
  assert.equal(n.get("Trainers' Mail"),4);
  assert.equal(n.get('Order Pad'),3);
  assert.equal(n.get('Canceling Cologne'),1);
  const out={basic,mail:4,pad:3,cologne:1,other:40};
  assert.equal(Object.values(out).reduce((a,b)=>a+b,0),60);
  return out;
}

/**
 * Exact no-bonus T1 raw opportunity to hold/find Cologne using at most
 * one Trainers' Mail looking at TOP FOUR and one Order Pad coin.
 *
 * Places original seven, six unseen Prizes, normal first-turn draw and
 * actual top four deck cards as disjoint physical positions. Valid starting
 * seven requires >=1 Basic. Source cannot pay any extra actions here:
 * neither player has acted, no Item lock, no draw Abilities or Supporters.
 * The reported union assumes a heads result for at most one held Order Pad;
 * it deliberately excludes Mail->Pad, several Pads, and any other search.
 *
 * @param {{basic:number,mail:number,pad:number,cologne:number,other:number}} counts
 * @returns {{validOpening:number,direct:number,mailTop4:number,padHeads:number,
 *   mailPadOverlap:number,combined:number}}
 */
function exactOpeningCounter(counts=COUNTS){
  assert.deepEqual(counts,COUNTS);
  const den=choose(60,7);
  const families=[
    ['basic',12],['mail',4],['pad',3],['cologne',1],['other',40]
  ];
  const sum={validOpening:0,direct:0,mailTop4:0,padHeads:0,
    mailPadOverlap:0,combined:0};
  for(let basic=1;basic<=7;basic++)
   for(let mail=0;mail<=4;mail++)
    for(let pad=0;pad<=3;pad++)
     for(let cologne=0;cologne<=1;cologne++){
      const other=7-basic-mail-pad-cologne;
      if(other<0||other>40)continue;
      const hand={basic,mail,pad,cologne,other};
      const weight=choose(12,basic)*choose(4,mail)*
        choose(3,pad)*choose(1,cologne)*choose(40,other)/den;
      sum.validOpening+=weight;
      if(cologne===1){
        sum.direct+=weight;
        sum.combined+=weight;
        continue;
      }
      const drawDirect=weight/53;
      sum.direct+=drawDirect;
      sum.combined+=drawDirect;
      for(const [name,total] of families){
        if(name==='cologne')continue;
        const firstDrawProbability=(total-hand[name])/53;
        if(firstDrawProbability<=0)continue;
        const mailHeld=mail>0||name==='mail';
        const padHeld=pad>0||name==='pad';
        const throughMail=mailHeld?4/52:0;
        const throughPad=padHeld?46/52/2:0;
        const overlap=(mailHeld&&padHeld)?4/52/2:0;
        const w=weight*firstDrawProbability;
        sum.mailTop4+=w*throughMail;
        sum.padHeads+=w*throughPad;
        sum.mailPadOverlap+=w*overlap;
        sum.combined+=w*(throughMail+throughPad-overlap);
      }
     }
  const valid=sum.validOpening;
  for(const name of ['direct','mailTop4','padHeads','mailPadOverlap','combined'])
    sum[name]/=valid;
  return sum;
}

module.exports={BASICS,COUNTS,choose,sourceCounts,exactOpeningCounter};
