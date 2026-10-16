'use strict';
const assert=require('node:assert/strict');
const {GROUPS,cardGroups,choose,probabilitySearchable,exactOpportunity}=
  require('../scripts/aichi-vileplume-tm-opening.cjs');

/** Exhaustively enumerate genuinely ordered miniature decks, independently
 * checking concrete Prize composition and post-setup draw. */
function brute(counts, opening, prizes) {
 const cards=GROUPS.flatMap(k=>Array(counts[k]).fill(k));
 const used=Array(cards.length).fill(false), seq=[];
 const successes={direct:0, core:0, bench:0};
 let accepted=0, total=0;
 function visit() {
  if(seq.length===cards.length) {
   total++;
   const initial=seq.slice(0,opening), hand=[...initial,seq[opening+prizes]];
   const deck=seq.slice(opening+prizes+1);
   const count=(arr,k)=>arr.filter(x=>x===k).length;
   const b7=count(initial,'b')>0;
   if(!['b','e','o'].some(k=>count(initial,k))) return;
   accepted++;
   if(!count(hand,'b'))return;
   const hasTool=count(hand,'m')>0;
   const hasEnergy=b7?['j','s','g'].some(k=>count(hand,k)>0):count(hand,'j')>0;
   const direct=hasTool&&hasEnergy;
   const halas=count(hand,'h')>0 || (count(hand,'t')>0 && count(deck,'h')>0);
   const rescued=halas && (hasTool||count(deck,'m')>0)
      && (hasEnergy|| (b7?['j','s'].some(k=>count(deck,k)>0):count(deck,'j')>0));
   const core=direct||rescued;
   const target=count(hand,'e')>0;
   if(direct)successes.direct++;
   if(core)successes.core++;
   if(core&&target)successes.bench++;
   return;
  }
  for(let i=0;i<cards.length;i++)if(!used[i]) {
   used[i]=true;seq.push(cards[i]);visit();seq.pop();used[i]=false;
  }
 }
 visit();
 return {validOpeningProbability:accepted/total, directConditional:successes.direct/accepted,
  resourceConditional:successes.core/accepted,benchTargetConditional:successes.bench/accepted};
}

const toy={b:1,e:1,o:1,h:1,t:1,m:1,j:1,s:1,g:0,x:0};
const exact=exactOpportunity(toy,{opening:3,prizes:2});
const observed=brute(toy,3,2);
for(const key of Object.keys(observed))
 assert.ok(Math.abs(exact[key]-observed[key])<1e-12,
   key+': '+exact[key]+' vs '+observed[key]);
assert.equal(choose(52,6),20358520);
assert.equal(probabilitySearchable({h:1,m:1,j:1},[['h'],['m'],['j']],0),1);
assert.ok(probabilitySearchable({h:1,m:1,j:1},[['h'],['m'],['j']],2)<1e-12);
assert.equal(probabilitySearchable({h:1,m:1,j:1},[['h'],['m'],['j']],3),0);

const source=require('../results/aichi-2026/full-decklists.json');
const rank2=source.decks.find(d=>d.rank===2);
assert.equal(rank2.archetype,'Vileplume Control');
const full=exactOpportunity(cardGroups(rank2.cards));
assert.ok(Math.abs(full.validOpeningProbability-0.8614093191287199)<1e-12);
assert.ok(Math.abs(full.directConditional-0.030425098169716457)<1e-12);
assert.ok(Math.abs(full.resourceConditional-0.2000701403213941)<1e-12);
assert.ok(Math.abs(full.benchTargetConditional-0.1066092646999868)<1e-12);
assert.ok(Math.abs(full.byBunnelby.initial.core+
 full.byBunnelby.firstDraw.core-full.resourceConditional)<1e-12);
console.log(JSON.stringify({test:'40320-permutation exhaustive cross-check and rank-2 source regression',
 full, observed, passed:true},null,2));
