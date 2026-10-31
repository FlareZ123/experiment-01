'use strict';
const assert=require('node:assert/strict');
const {choose,WITNESS_GROUPS}=
  require('./agent3-rank26-donk-prize-witness-upper.cjs');
const source=require('../results/aichi-2026/full-decklists.json')
  .decks.find(d=>d.rank===26);
assert.ok(source);
const copies=new Map(source.cards.map(c=>[c.name,c.count]));
assert.equal(copies.get('Unown'),4);
assert.equal(copies.get('Bunnelby'),1);
assert.equal(copies.get('Dowsing Machine'),1);

const GROUPS=[...WITNESS_GROUPS,{name:'Dowsing Machine',copies:1,needed:0}];
const remaining=60-GROUPS.reduce((x,g)=>x+g.copies,0);
assert.ok(remaining>=0);
GROUPS.push({name:'other',copies:remaining,needed:0});

/**
 * Exact joint hand-seven / subsequent six-Prize combinations for a declared
 * source starter and one of three otherwise fixed conditional witnesses.
 * Product weights choose(n,hand)*choose(n-hand,Prizes) count actual physical
 * cards; all face-down/source unknowns are averaged, never inspected by a
 * fictional owner policy.
 * @param {'Bunnelby'|'Unown'} starter
 * @param {'three-pumps-two-eggs'|'two-pumps-dowsing'|'one-egg-dowsing'} branch
 * @returns {bigint}
 */
function count(starter,branch){
  assert.ok(starter==='Bunnelby'||starter==='Unown');
  assert.ok(['three-pumps-two-eggs','two-pumps-dowsing','one-egg-dowsing'].includes(branch));
  const isOriginal=branch==='three-pumps-two-eggs';
  let dp=Array.from({length:8},()=>Array(7).fill(0n));
  dp[0][0]=1n;
  for(const group of GROUPS){
    const next=Array.from({length:8},()=>Array(7).fill(0n));
    const n=group.copies;
    for(let h=0;h<=Math.min(n,7);h++){
      if(group.name==='Bunnelby'&&
         h!==(starter==='Bunnelby'?1:0))continue;
      if(group.name==='Unown'&&starter==='Unown'&&h<1)continue;
      for(let p=0;p<=Math.min(n-h,6);p++){
        const left=n-p;
        const requisite=group.name==='Bunnelby'?0:
          group.name==='Unown'?(starter==='Unown'?2:1):
          group.name==='Damage Pump'?(isOriginal?3:
            branch==='two-pumps-dowsing'?2:4):
          group.name==='Exeggcute'?(branch==='one-egg-dowsing'?1:2):
          group.name==='Dowsing Machine'?(isOriginal?0:1):group.needed;
        if(left<requisite)continue;
        if(group.name==='Damage Pump'&&
          !isOriginal&&left!==requisite)continue;
        if(group.name==='Exeggcute'&&branch==='one-egg-dowsing'&&
          left!==1)continue;
        const weight=choose(n,h)*choose(n-h,p);
        for(let H=0;H+h<=7;H++){
          for(let P=0;P+p<=6;P++){
            if(dp[H][P])next[H+h][P+p]+=dp[H][P]*weight;
          }
        }
      }
    }
    dp=next;
  }
  return dp[7][6];
}

/** Exact disjoint union of Bunnelby-first priority and alternative Unown. */
function run(){
  const totals={};
  for(const starter of ['Bunnelby','Unown']){
    const counts={};
    for(const branch of ['three-pumps-two-eggs','two-pumps-dowsing',
      'one-egg-dowsing'])counts[branch]=count(starter,branch);
    totals[starter]=counts;
  }
  const validHands=choose(60,7)-choose(48,7);
  const allPrizeDraws=choose(53,6);
  const denom=validHands*allPrizeDraws;
  const format=values=>({
    numerators:Object.fromEntries(Object.entries(values).map(
      ([k,v])=>[k,v.toString()])),
    conditionalValidBasicSevenProbability:
      Number(Object.values(values).reduce((x,v)=>x+v,0n))/Number(denom)
  });
  const b=format(totals.Bunnelby),u=format(totals.Unown);
  const oldB=0.0651118949414483;
  assert.ok(Math.abs(b.conditionalValidBasicSevenProbability-oldB)<1e-12);
  return {schema:'rank26-Bunnelby-or-Unown-source-starter-exact-joint-v1',
    sourceRank:26,starterBranches:{Bunnelby:b,Unown:u},
    combinedProbability:b.conditionalValidBasicSevenProbability+
      u.conditionalValidBasicSevenProbability,
    numeratorValidOpeningSeven:validHands.toString(),
    prizeDrawsPerHand:allPrizeDraws.toString(),
    denominator:denom.toString(),
    disjointStarterRule:'Bunnelby starts if originally held; otherwise at least one original-seven Unown can start and a second Unown must remain unprized',
    caveat:'Only physical hand/Prize group survival for precise conditional attack paths. No other first-turn hand access, payment, acquisition, opposing active, opponent response, native rule, attack or win established.'};
}
module.exports={count,run};
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
