'use strict';

/**
 * Agent30: exact paid T1 Guzma & Hala route discarding two ACTUAL hand
 * Pokémon (Mega Charizard-EX and Regidrago V) to put them in discard.
 * The enhanced G&H mode retrieves DDE physically from the remaining deck,
 * attach DDE to starting ADP and Altered Creation-GX T1 going second.
 * T2 use Thorton -> VSTAR -> Basic Grass/Fire -> copy Wild Blaze.
 *
 * Two disjoint routing branches: G&H directly held, otherwise Tag Call
 * held and a G&H card survives six Prizes. One ordinary draw per turn,
 * no other search/draw, no Extra Energy attachment, no opponent response.
 * Both branches deliberately choose no optional Stadium/Tool target when
 * permitted by restricted-class deck-search rules; the first branch
 * removes one DDE from deck, second removes G&H plus DDE.
 */
const assert=require('node:assert/strict');
const deck=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');

/** @param {number} n @param {number} k @returns {number} */
function C(n,k){
  if(k<0||k>n)return 0;
  let res=1;
  for(let i=1;i<=Math.min(k,n-k);i++)res=res*(n-i+1)/i;
  return Math.round(res);
}
/**
 * @param {number} a
 * @param {number} b
 * @param {number} unseen
 * @returns {number}
 */
function jointSurvival(a,b,unseen){
  const den=C(unseen,6);
  return 1-C(unseen-a,6-a)/den-C(unseen-b,6-b)/den+
    C(unseen-a-b,6-a-b)/den;
}

/**
 * @returns {{unconditional:object,conditional:object,basicValid:number}}
 */
function gxViaPaidGuzmaHala(){
  assert.equal(deck.canonicalCardsSha256,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
  const c=new Map(deck.cards.map(x=>[x.id,x.count]));
  const get=id=>c.get(id)??0;
  assert.equal([...c.values()].reduce((a,b)=>a+b,0),60);
  const n=[
    get('sm12-156'), // 2 ADP
    get('xy6-97'), // 4 DDE
    get('sm12-193'), // 3 Guzma & Hala
    get('sm12-206'), // 4 Tag Call
    get('xy2-69'), // 1 M Charizard EX
    get('swsh12-135'), // 3 Regidrago V
    get('swsh12-136'), // 3 VSTAR
    get('swsh11-167'), // 4 Thorton
    get('swsh12pt5-152')+get('swsh12pt5-153') // 7 basic
  ];
  assert.deepEqual(n,[2,4,3,4,1,3,3,4,7]);
  n.push(60-n.reduce((a,b)=>a+b,0)); // 29 other
  const counts=Array(9).fill(0),den8=C(60,8);
  const out={heldSourceT1:0,tagSourceT1:0,heldCompleteT2:0,
    tagCompleteT2:0,heldAllEight:0,tagAllEight:0};
  /** @param {number} i @param {number} left @param {number} ways */
  function enumerate(i,left,ways){
    if(i<9){
      for(let x=0;x<=Math.min(n[i],left);x++){
        counts[i]=x;
        enumerate(i+1,left-x,ways*C(n[i],x));
      }
      return;
    }
    if(left<0||left>n[9])return;
    const [adp,dde,gh,tag,char,rv,vstar,thorton,basic]=counts;
    if(!adp || !char || !rv)return;
    // G&H needs to search DDE from deck, even if another DDE held:
    // in this strict source route a fetched card is the T1 attachment.
    const ddeDeck=n[1]-dde;
    if(!ddeDeck)return;
    const mass=ways*C(n[9],left)/den8*(adp===1?7/8:1);
    let key,prizePayable,removed,ghDeck;
    if(gh){
      key='held';
      removed=1; // one fetched DDE, no Stadium/Tool selected
      prizePayable=1-C(52-ddeDeck,6-ddeDeck)/C(52,6);
    }else if(tag){
      key='tag';
      removed=2; // one G&H + one DDE fetched from deck
      ghDeck=n[2]-gh;
      prizePayable=jointSurvival(ddeDeck,ghDeck,52);
    }else return;
    out[key==='held'?'heldSourceT1':'tagSourceT1']+=mass*prizePayable;
    const missing=[6,7,8].filter(i=>counts[i]===0);
    if(!missing.length){
      out[key==='held'?'heldAllEight':'tagAllEight']+=mass*prizePayable;
      out[key==='held'?'heldCompleteT2':'tagCompleteT2']+=mass*prizePayable;
    }else if(missing.length===1){
      const target=n[missing[0]];
      const conditional=key==='held'
        ? 1-C(51-ddeDeck,6-ddeDeck)/C(51,6)
        : jointSurvival(ddeDeck,ghDeck,51);
      // There are 46 after initial hand/turn1 draw/6 prizes; a G&H
      // retrieves one DDE (or Tag Call retrieves G&H + one DDE);
      // it then shuffles. T2 natural draw from 45 or 44 cards.
      const extra=mass*target*46/(52*(46-removed))*conditional;
      out[key==='held'?'heldCompleteT2':'tagCompleteT2']+=extra;
    }
  }
  enumerate(0,8,1);
  const basicValid=1-C(53,7)/C(60,7);
  return {unconditional:out,basicValid,
    conditional:Object.fromEntries(Object.entries(out)
      .map(([key,value])=>[key,value/basicValid]))};
}

const result=gxViaPaidGuzmaHala();
const expected={
  heldSourceT1:0.0018893441312943008,
  tagSourceT1:0.001908805611363461,
  heldAllEight:0.000023302280332170015,
  tagAllEight:0.000028630884888180846,
  heldCompleteT2:0.000051235061455401945,
  tagCompleteT2:0.00006073775099335663
};
for(const [label,p] of Object.entries(expected)){
  assert.ok(Math.abs(result.unconditional[label]-p)<1e-12,label);
  console.log(label,'unconditional '+(100*result.unconditional[label]).toFixed(9)+'%',
    'conditional valid seven '+(100*result.conditional[label]).toFixed(9)+'%');
}
const source=result.conditional.heldSourceT1+result.conditional.tagSourceT1;
const full=result.conditional.heldCompleteT2+result.conditional.tagCompleteT2;
assert.ok(full<source);
console.log('Combined physical G&H-route full T2 opportunity:',
  (100*full).toFixed(9)+'% of valid seven-card openers');
console.log('PASS: exact printed two-card G&H payment, Tag Call,',
  'DDE search, ADP GX and Thorton copy completion.');
module.exports={gxViaPaidGuzmaHala,C,jointSurvival};
