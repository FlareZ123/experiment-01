'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent38-rank6-lastprinting-earlyhand.cjs');

/** Identity of an original physical printing. */
function keyOf(card){
  return JSON.stringify([card.name,card.printing?.set??'',
    card.printing?.number??'',card.printing?.language??'']);
}

/**
 * K0 pre-search exact probability that a two-card payment leaves at least
 * one copy of each paid printing in hand or unprized deck.
 *
 * @param {{inventory:object[],seen:string[],spent:string[],
 *   payment:string[],prizes?:number}} x
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function replacementProbability(x){
  const {inventory,seen,spent,payment,prizes=6}=x;
  assert.ok(Array.isArray(payment)&&payment.length===2);
  const totals=new Map(inventory.map(card=>[keyOf(card),card.count]));
  assert.equal(totals.size,inventory.length);
  const frequencies=xs=>{
    const result=new Map();
    for(const id of xs){
      assert.ok(totals.has(id));
      result.set(id,(result.get(id)??0)+1);
    }
    return result;
  };
  const held=frequencies(seen),played=frequencies(spent);
  const paid=frequencies(payment);
  for(const [id,n] of held)assert.ok(n<=totals.get(id));
  for(const [id,n] of paid)
    assert.ok((held.get(id)??0)>=n+(played.get(id)??0));
  for(const [id,n] of played)
    assert.ok((held.get(id)??0)>=n+(paid.get(id)??0));
  const deckSize=inventory.reduce((a,c)=>a+c.count,0);
  const unseen=deckSize-seen.length;
  assert.ok(Number.isInteger(prizes)&&prizes>=0&&prizes<=unseen);
  const denominator=choose(unseen,prizes);
  const vulnerable=[];
  for(const [id,n] of paid){
    const retained=(held.get(id)??0)-n-(played.get(id)??0);
    if(retained===0)vulnerable.push(totals.get(id)-(held.get(id)??0));
  }
  const lost=indices=>{
    const n=indices.reduce((a,i)=>a+vulnerable[i],0);
    return choose(unseen-n,prizes-n);
  };
  let favorable=denominator;
  for(let mask=1;mask<(1<<vulnerable.length);mask++){
    const selection=vulnerable.map((_,i)=>i)
      .filter(i=>(mask&(1<<i))!==0);
    const loss=lost(selection);
    favorable+=selection.length%2===0?loss:-loss;
  }
  assert.ok(favorable>=0n&&favorable<=denominator);
  return {numerator:String(favorable),denominator:String(denominator),
    probability:Number(favorable)/Number(denominator)};
}
module.exports={keyOf,replacementProbability};
