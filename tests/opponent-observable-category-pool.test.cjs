'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {opponentObservableCategoryCounts:observe,
  unseenHandCategoryPosterior:forecast}=
  require('../simulation/twinleaf/unseen-hand-category-posterior.cjs');
const roster=[...Array.from({length:52},(_,i)=>'P'+(i+1)),
  ...Array.from({length:4},(_,i)=>'T'+(i+1)),
  ...Array.from({length:4},(_,i)=>'E'+(i+1))];
const categoryPrintings=['T1','T2','T3','T4'];
const card=fullName=>({fullName});
const privateCard=fullName=>new Proxy({}, {
  get(_,field){if(field==='fullName'||field==='name'||field==='id')
    throw Error('Illicit physical concealed identity read: '+fullName);
    return undefined;}
});
function opponentFixture(handTrainers){
  const hidden=handTrainers?
    [...categoryPrintings,...['E1','E2','E3','E4']]:
    [...['E1','E2','E3','E4'],...categoryPrintings];
  return {
    active:{cards:[card('P1')],tools:[card('P2')],energies:{cards:[]}},
    bench:[{cards:[card('P3')],tools:[card('P4')]},
      ...Array.from({length:4},()=>({cards:[],tools:[]}))],
    discard:{cards:roster.slice(4,52).map(card)},
    lostzone:{cards:[]},stadium:{cards:[]},supporter:{cards:[]},
    hand:{cards:hidden.slice(0,4).map(privateCard)},
    deck:{cards:hidden.slice(4,6).map(privateCard)},
    prizes:hidden.slice(6,8).map(n=>({cards:[privateCard(n)]}))
  };
}
const input=opponent=>({opponent,registeredPrintings:roster,
  categoryPrintings,fullRosterKnownToActor:true,
  opponentHandIdentityUnobserved:true});
test('strict actor-observable source zone counts yield exactly 1/70 from two hidden deals',()=>{
  const first=observe(input(opponentFixture(true)));
  const second=observe(input(opponentFixture(false)));
  assert.deepEqual(first,second);
  assert.equal(first.unknownHandCount,4);
  assert.equal(first.unseenCategoryCount,4);
  assert.equal(first.unseenOtherCount,4);
  assert.equal(first.publicPrintings.length,52);
  const p=forecast({...first,unitEffect:50,threshold:200,
    uniformUnknownHandAllocation:true});
  assert.deepEqual([p.thresholdNumerator,p.thresholdDenominator],['1','70']);
});
test('rejects roster-knowledge claims and contradictory public count',()=>{
  assert.throws(()=>observe({...input(opponentFixture(true)),fullRosterKnownToActor:false}),/Actor roster/);
  assert.throws(()=>observe({...input(opponentFixture(true)),opponentHandIdentityUnobserved:false}),/Actor roster/);
  const changed=opponentFixture(true);
  changed.discard.cards.pop();
  assert.throws(()=>observe(input(changed)),/do not reconcile/);
  assert.throws(()=>observe({...input(changed),categoryPrintings:['U1']}),/unique roster/);
});
test('never double-counts Energy secondary slot index',()=>{
  const opponent=opponentFixture(true);
  opponent.active.cards.push(opponent.discard.cards.pop());
  opponent.active.energies.cards.push(opponent.active.cards.at(-1));
  const p=observe(input(opponent));
  assert.equal(p.publicPrintings.length,52);
  assert.equal(p.unseenCategoryCount,4);
});
