'use strict';

/**
 * Agent30: source-printing exact first-own-turn enhanced Altered Creation-GX
 * opening opportunity for the immutable Agent5 ADP/Thorton/Regidrago v2.
 *
 * Going-second only. Deal 7 opener, 6 Prizes, 1 normal draw. ADP must be
 * chosen initial Active. One DDE attached to ADP pays both [Metal] and the
 * optional additional [Water] for the +1 Prize effect. Three disjoint cases:
 * DDE physically held, else held Guzma & Hala and a DDE survives Prizes,
 * else held Tag Call, G&H+DDE both survive Prizes.
 *
 * Guzma & Hala's optional two-card DISCARD is NOT tested for DCI or actual
 * physical payment. Nor are opponent Item lock, Temple, Active survival,
 * Energy disruption, next-turn Thorton or full win. The latter two branches
 * are optimistic search-access screens rather than certified legal actions.
 */
const assert=require('node:assert/strict');
const deck=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');

/** @param {number} n @param {number} k @returns {number} */
function C(n,k){
  if(k<0 || k>n)return 0;
  let v=1;
  for(let j=1;j<=Math.min(k,n-k);j++)v=v*(n-j+1)/j;
  return Math.round(v);
}
/**
 * @returns {{unconditional:object,conditional:object,
 * basicValid:number,adpStart:number}}
 */
function gxOpportunity(){
  const counts=new Map(deck.cards.map(c=>[c.id,c.count]));
  const get=id=>counts.get(id)||0;
  assert.equal(deck.canonicalCardsSha256,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
  assert.equal([...counts.values()].reduce((a,b)=>a+b,0),60);
  assert.equal(get('sm12-156'),2); // ADP Basic
  assert.equal(get('xy6-97'),4); // DDE
  assert.equal(get('sm12-206'),4); // Tag Call
  assert.equal(get('sm12-193'),3); // Guzma & Hala
  // Two ADP, three Regidrago V, one Lele, one Crobat = 7 Basics.
  assert.equal(get('swsh12-135'),3);
  assert.equal(get('sm2-60'),1);
  assert.equal(get('swsh3-104'),1);
  const n=[2,4,4,3,47], first8=Array(4).fill(0);
  const totals={held_dde:0,gh_discard:0,tag_gh_discard:0};
  const den=C(60,8), prizeDen=C(52,6);
  /**
   * @param {number} i
   * @param {number} left
   * @param {number} possibilities
   */
  function enumerate(i,left,possibilities){
    if(i<4){
      for(let x=0;x<=Math.min(n[i],left);x++){
        first8[i]=x;
        enumerate(i+1,left-x,possibilities*C(n[i],x));
      }
      return;
    }
    if(left<0 || left>n[4])return;
    const [adp,dde,tagCall,gh]=first8;
    if(!adp)return;
    const mass=possibilities*C(n[4],left)/den*(adp===1?7/8:1);
    if(dde){
      totals.held_dde+=mass;
      return;
    }
    const dLeft=n[1]-dde; // all 4 DDE outside visible first 8
    const pD=1-C(52-dLeft,6-dLeft)/prizeDen;
    if(gh){
      totals.gh_discard+=mass*pD;
    }else if(tagCall){
      const gLeft=n[3]-gh;
      const both=1-C(52-dLeft,6-dLeft)/prizeDen
        -C(52-gLeft,6-gLeft)/prizeDen
        +C(52-dLeft-gLeft,6-dLeft-gLeft)/prizeDen;
      totals.tag_gh_discard+=mass*both;
    }
  }
  enumerate(0,8,1);
  const basicValid=1-C(53,7)/C(60,7);
  const adpStart=1-C(58,7)/C(60,7);
  return {unconditional:totals,basicValid,adpStart,
    conditional:Object.fromEntries(Object.entries(totals)
      .map(([k,v])=>[k,v/basicValid]))};
}
const x=gxOpportunity();
assert.ok(Math.abs(x.basicValid-0.6008795492323131)<1e-12);
assert.ok(Math.abs(x.adpStart/x.basicValid-0.36857457844358693)<1e-12);
const expectations={
  held_dde:0.15018760354909242,
  gh_discard:0.074885626862953245,
  tag_gh_discard:0.06486329971327038
};
for(const [k,v] of Object.entries(expectations)){
  assert.ok(Math.abs(x.conditional[k]-v)<1e-12,k+' exact');
  console.log(k,
    'unconditional '+(100*x.unconditional[k]).toFixed(9)+'%',
    'conditional legal opener '+(100*x.conditional[k]).toFixed(9)+'%');
}
const sum=Object.values(x.conditional).reduce((a,b)=>a+b,0);
assert.ok(Math.abs(sum-0.289936530125316)<1e-12);
console.log('Combined optimistic T1 enhanced GX access, Basic-valid opener:',
  (100*sum).toFixed(9)+'%');
console.log('PASS: exact original v2 first-eight, Prize and initial ADP Active gates.');
module.exports={C,gxOpportunity};
