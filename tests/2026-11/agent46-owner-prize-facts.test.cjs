'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createOwnerPrizeFacts}=require('../../simulation/evaluation/2026-11/agent46-owner-prize-facts.cjs');
const R='Radiant Eternatus CRZ',HB='Hisuian Heavy Ball ASR',FOG='Fog Crystal CRE',P='Psychic Energy SVE';
class ChooseCardsPrompt{constructor(playerId,cards,id){Object.assign(this,{playerId,cards,id});}}
function fixture(seat) {
  const rows=[{name:'Radiant Eternatus',engineFullName:R,count:1},{name:'Hisuian Heavy Ball',engineFullName:HB,count:1},{name:'Fog Crystal',engineFullName:FOG,count:4},{name:'Psychic Energy',engineFullName:P,count:54}];
  const fullNames=rows.flatMap(r=>Array(r.count).fill(r.engineFullName));
  const hidden=()=>Object.defineProperty({},'fullName',{get(){throw Error('hidden prize content accessed');}});
  const prizes=Array.from({length:6},()=>({cards:[hidden()]}));
  const owner={id:'owner',deck:{cards:[...Array(49).fill(P),...Array(3).fill(FOG)].map(fullName=>({fullName}))},prizes};
  const other={id:'other',get deck(){throw Error('opponent deck accessed')},get prizes(){throw Error('opponent prizes accessed')}};
  const state={turn:3,players:seat===0?[owner,other]:[other,owner],prompts:[]};
  const store={state};
  const sources=new WeakMap();
  const hook={getPromptProvenance:p=>sources.get(p)};
  const baseObserve=(s,a)=>({actorSeat:a,globalTurn:s.turn,
    decisionKind:s.prompts.some(p=>p.result===undefined)?'owner-prompt':'owner-root',
    pendingOwnerDeckSearch:s.prompts.some(p=>p.cards===owner.deck&&p.result===undefined),
    ownHand:[HB],ownPublic:{prizeCount:owner.prizes.length,active:null,bench:[],
      stadium:[],discard:[FOG],lostZone:[],resolvingSupporter:[]},ownerK1:null});
  const adapter=createOwnerPrizeFacts({candidateSeat:seat,resolved:{fullNames,resolvedRows:rows},baseObserve});
  adapter.bindStore(store,hook);
  function search(source=FOG,actualOwner=true,id='s1') {
    const p=new ChooseCardsPrompt(owner.id,actualOwner?owner.deck:{cards:[]},id);
    state.prompts=[p];sources.set(p,{sourceKind:'card-effect',sourceCard:{fullName:source}});return p;
  }
  function after(p,ordinal,source=FOG,actorSeat=seat,actionName=null) {
    state.prompts=[];
    adapter.onAction({dispatchStatus:'succeeded',actionOrdinal:ordinal,actingSeat:actorSeat,
      actionName:actionName??(p?'ResolvePromptAction':'PlayCardAction'),selectedCardIdentity:{fullName:source}},
      {store,state,pendingPrompt:p});
  }
  return {state,owner,adapter,search,after};
}
test('owner-only K1 capture exposes all-copy targets but no full Prize multiset',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    assert.equal(f.adapter.observe(f.state,seat).ownerK1,null);
    f.search(FOG,false);
    assert.equal(f.adapter.observe(f.state,seat).ownerK1,null);
    const p=f.search();
    let v=f.adapter.observe(f.state,seat);
    assert.deepEqual(v.ownerK1.prizeFacts.fullyPrized,[{cardName:'Radiant Eternatus',printing:R,copies:1}]);
    assert.equal(v.ownerK1.knownPrintings,null);
    assert.equal(f.adapter.observe(f.state,1-seat).ownerK1,null);
    assert.throws(()=>f.adapter.observe({...f.state},seat));
    f.after(p,1);
    v=f.adapter.observe(f.state,seat);
    assert.equal(v.ownerK1.epoch,2);
    assert.equal(v.ownerK1.prizeFacts.fullyPrized[0].cardName,'Radiant Eternatus');
    f.after(null,2,P,seat,'AttachEnergyAction');
    assert.ok(f.adapter.observe(f.state,seat).ownerK1,
      'ordinary action with unchanged physical Prizes must retain certified Prize facts');
    f.owner.prizes[0].cards=[{}];
    f.after(null,3,HB,seat,'ResolvePromptAction');
    assert.equal(f.adapter.observe(f.state,seat).ownerK1,null);
  }
});
test('Prize custody, not acting seat, governs retention; incomplete accounting cannot recertify',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const p=f.search();
    assert.ok(f.adapter.observe(f.state,seat).ownerK1);
    f.after(p,1);
    f.after(null,2,FOG,1-seat,'EndTurnAction');
    assert.ok(f.adapter.observe(f.state,seat).ownerK1,
      'opponent action does not erase owner Prize knowledge when physical Prizes are unchanged');
    f.owner.prizes[1].cards=[{}];
    f.after(null,3,FOG,1-seat,'EndTurnAction');
    assert.equal(f.adapter.observe(f.state,seat).ownerK1,null);
    f.owner.deck.cards.pop();
    f.search(FOG,true,'s2');
    assert.equal(f.adapter.observe(f.state,seat).ownerK1,null);
  }
});

test('duplicate prompt identity does not recapture and a failed search cannot reset the epoch',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);const p=f.search();
    const first=f.adapter.observe(f.state,seat).ownerK1.epoch;
    // Re-observe the same pending native prompt object. A different object
    // with the same recycled ID is not a duplicate native prompt.
    assert.equal(f.adapter.observe(f.state,seat).ownerK1.epoch,first);
    f.after(p,1);
    f.owner.deck.cards.push({fullName:HB});
    f.search(FOG,true,'bad');
    assert.equal(f.adapter.observe(f.state,seat).ownerK1,null);
    f.owner.deck.cards.pop();
    f.search(FOG,true,'fresh');
    assert.ok(f.adapter.observe(f.state,seat).ownerK1.epoch>first+1);
  }
});

test('distinct same-turn searches can reuse a native prompt ID and must recertify K1',()=>{
  for(const seat of [0,1]) {
    const f=fixture(seat);
    const first=f.search(FOG,true,1);
    const old=f.adapter.observe(f.state,seat).ownerK1;
    assert.ok(old?.prizeFacts?.fullyPrized.some(x=>x.printing===R));
    assert.equal(f.adapter.observe(f.state,seat).ownerK1.epoch,old.epoch,
      'observing the same live prompt must not recapture');
    f.after(first,1);
    // Model a Prize/deck identity exchange that leaves the Prize *count* at 6:
    // the formerly Prized singleton moves into the deck, a Psychic Energy
    // becomes Prized, and the physical Prize card reference changes.
    f.owner.prizes[0].cards=[{}];
    f.owner.deck.cards[0]={fullName:R};
    f.after(null,2,R,seat,'ResolvePromptAction');
    assert.equal(f.adapter.observe(f.state,seat).ownerK1,null,
      'stale Prize composition must fail closed until a fresh search');
    const second=f.search(FOG,true,1);
    assert.notEqual(second,first);
    assert.equal(second.id,first.id,'pinned Store can recycle numeric prompt IDs');
    const refreshed=f.adapter.observe(f.state,seat).ownerK1;
    assert.ok(refreshed,'new live prompt must recapture despite same turn/ID');
    assert.ok(refreshed.epoch>old.epoch);
    assert.deepEqual(refreshed.prizeFacts.fullyPrized,[],
      'singleton moved from Prize to deck must no longer be marked fully Prized');
    assert.equal(f.adapter.observe(f.state,seat).ownerK1.epoch,refreshed.epoch,
      'second observation of the new prompt remains idempotent');
  }
});
