'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../results/aichi-2026/full-decklists.json');
const {captureOwnerK1} =
  require('../simulation/twinleaf/owner-k1-prize-knowledge.cjs');
const {preflightOwnerSearchPlan} =
  require('../simulation/twinleaf/actor-k1-search-plan-veto.cjs');

/** Complete 60 physical exact-printing tokens. Synthetic tokens are shared by
 * our fabricated owner deck and the registered source for bookkeeping; this
 * fixture does not claim a specific Twinleaf Card.fullName name mapping.
 * @param {number} rank
 * @returns {string[]}
 */
function roster(rank) {
  const source = manifest.decks.find(entry=>entry.rank===rank);
  assert.ok(source,'Missing original source roster');
  const expanded=source.cards.flatMap(card=>
    Array.from({length:card.count},()=>
      card.name+'|'+card.printing.set+'|'+card.printing.number));
  assert.equal(expanded.length,60);
  return expanded;
}

/** @param {number} rank @param {string} fragment */
function uniqueTarget(rank,fragment){
  const copies=roster(rank).filter(printing=>printing.includes(fragment));
  assert.equal(copies.length,1,'Target fixture requires authentic singleton');
  return copies[0];
}

/**
 * A fully conserved artificial owner position. No face-down Prize identity
 * enters a policy-facing observation or the real helper call. The harness
 * chooses the synthetic Prize locations solely to test expected classifications.
 */
function fakeOwnerSearch(rank,target,inPrize,seat,repeat){
  const all=roster(rank);
  const starterFragment=rank===26?'Unown|':'Iron Thorns ex|';
  const starter=all.find(name=>name.startsWith(starterFragment));
  assert.ok(starter);
  const rem=[...all];
  rem.splice(rem.indexOf(starter),1);
  const shifted=rem.map((name,index)=>({
    name,order:(Math.imul(index+1,17713)+repeat*1021)>>>0
  })).sort((a,b)=>a.order-b.order).map(row=>row.name);
  const hand=shifted.filter(name=>name!==target).slice(0,6);
  for(const name of hand)shifted.splice(shifted.indexOf(name),1);
  const prize=[];
  if(inPrize){
    const i=shifted.indexOf(target);assert.ok(i>=0);
    prize.push(shifted.splice(i,1)[0]);
  }
  while(prize.length<6){
    const i=shifted.findIndex(name=>name!==target);
    prize.push(shifted.splice(i,1)[0]);
  }
  assert.equal(shifted.length,47);
  assert.equal(shifted.includes(target),!inPrize);
  class ChooseCardsPrompt{}
  const deck={cards:shifted.map(fullName=>({fullName}))};
  const owner={id:123,deck,
    prizes:Array.from({length:6},()=>({cards:[{}]}))};
  const opponent={id:124};
  const prompt=new ChooseCardsPrompt();
  Object.assign(prompt,{playerId:owner.id,cards:owner.deck,result:undefined,id:44});
  const state={turn:2,players:seat===0?[owner,opponent]:[opponent,owner],
    prompts:[prompt]};
  const view={
    actorSeat:seat,globalTurn:2,decisionKind:'owner-prompt',
    pendingOwnerDeckSearch:true,ownHand:hand,
    ownPublic:{prizeCount:6,active:{
      evolutionPrintings:[starter],energies:[],tools:[]},
      bench:[null,null,null,null,null],stadium:[],discard:[],
      lostZone:[],resolvingSupporter:[]},
    ownTurnResources:{supporterPlayedTurn:-1,itemPlayLocked:false}
  };
  return {state,view};
}

test('three original printed 60s preserve K0 and convert to correct owner-K1',()=>{
  for(const [rank,fragment] of [[6,'Double Colorless Energy|'],
    [24,'Thunder Mountain'],[26,'Double Colorless Energy|']]){
    const target=uniqueTarget(rank,fragment);
    for(const seat of [0,1]){
      for(const inPrize of [false,true]){
        for(let repeat=0;repeat<10;repeat++){
          const {state,view}=fakeOwnerSearch(rank,target,inPrize,seat,repeat);
          const snapshot=captureOwnerK1(state,seat,roster(rank),null,()=>view);
          assert.equal(snapshot.prizeInferenceCertified,true);
          assert.equal(snapshot.knownPrized.some(row=>
            row.printing===target),inPrize);
          const root={...view,decisionKind:'owner-root'};
          const goal={id:'Single deck search',actionKind:'other',
            deckRequirements:[{printing:target,copies:1}]};
          assert.equal(preflightOwnerSearchPlan(root,null,goal).status,
            'not-disproven','K0 must not read synthetic hidden Prize truth');
          const actual=preflightOwnerSearchPlan(root,snapshot,goal);
          assert.equal(actual.status,inPrize?'blocked':'not-disproven');
        }
      }
    }
  }
});
