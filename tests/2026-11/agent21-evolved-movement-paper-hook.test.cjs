'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  currentStack, movedToActiveInEvolutionLineage,
  withPaperEvolutionMovement
} = require('../../simulation/twinleaf/agent21-evolved-movement-paper-hook.cjs');
const { publicEventReceipt } =
  require('../../simulation/twinleaf/agent8-public-event-receipt.cjs');

function card(id, fullName) {
  return {id, fullName, name:fullName.split(' M2')[0]};
}
function slot(...stack) {
  return {
    getPokemonCard: () => stack[stack.length-1] ?? undefined,
    getPokemons: () => stack.slice()
  };
}
function player(active, bench = [], moved = []) {
  return {
    active, bench, movedToActiveThisTurn:moved,
    marker:{hasMarker:()=>false},
    pokemonKnockedOutDuringOpponentsLastTurn:false,
    pokemonKnockedOutByAttackDuringOpponentsLastTurn:false
  };
}
function stateFor(owner, other, actorSeat) {
  return {players:actorSeat === 0 ? [owner,other] : [other,owner],
    activePlayer:actorSeat,turn:4};
}

test('pinned old same-id check misses the moved Buneary after evolution',()=>{
  const buneary=card(101,'Buneary M2');
  const mega=card(202,'Mega Lopunny ex M2');
  const own=player(slot(buneary,mega),[],[101]);
  assert.equal(own.movedToActiveThisTurn.includes(mega.id),false);
  assert.deepEqual(currentStack(own,mega),[buneary,mega]);
  assert.equal(movedToActiveInEvolutionLineage(own,mega),true);
});

test('same-turn original-top move remains supported; no move stays false',()=>{
  const mega=card(202,'Mega Lopunny ex M2');
  assert.equal(movedToActiveInEvolutionLineage(
    player(slot(mega),[],[202]),mega),true);
  assert.equal(movedToActiveInEvolutionLineage(
    player(slot(mega),[],[]),mega),false);
});

test('a moved unrelated Pokémon cannot lend its history to an identical print',()=>{
  const old=card(101,'Buneary M2');
  const mega=card(202,'Mega Lopunny ex M2');
  const other=card(303,'Mega Lopunny ex M2');
  const own=player(slot(old,mega),[slot(other)],[303]);
  assert.equal(movedToActiveInEvolutionLineage(own,mega),false);
  assert.equal(movedToActiveInEvolutionLineage(own,other),true);
});

test('corrupt or unauthenticated stacks and ledgers fail closed',()=>{
  const old=card(101,'Buneary M2'),mega=card(202,'Mega Lopunny ex M2');
  const own=player(slot(old,mega),[],['101']);
  assert.equal(movedToActiveInEvolutionLineage(own,mega),false);
  own.movedToActiveThisTurn=[101];
  const absent=card(202,'Mega Lopunny ex M2');
  assert.equal(currentStack(own,absent),null);
  assert.equal(movedToActiveInEvolutionLineage(own,absent),false);
  const malformed={getPokemonCard:()=>mega,getPokemons:()=>[old]};
  assert.equal(currentStack(player(malformed),mega),null);
});

test('compiled prefab hook is scoped, preserves old positives and restores on throw',()=>{
  const old=card(101,'Buneary M2'),mega=card(202,'Mega Lopunny ex M2');
  const owner=player(slot(old,mega),[],[101]);
  const native=(p,c)=>p.movedToActiveThisTurn.includes(c.id);
  const prefab={MOVED_TO_ACTIVE_THIS_TURN:native};
  const originalDescriptor=Object.getOwnPropertyDescriptor(
    prefab,'MOVED_TO_ACTIVE_THIS_TURN');
  const answer=withPaperEvolutionMovement(()=>{
    assert.notEqual(prefab.MOVED_TO_ACTIVE_THIS_TURN,native);
    assert.equal(prefab.MOVED_TO_ACTIVE_THIS_TURN(owner,mega),true);
    assert.equal(prefab.MOVED_TO_ACTIVE_THIS_TURN(owner,old),false);
    owner.movedToActiveThisTurn.push(mega.id);
    assert.equal(prefab.MOVED_TO_ACTIVE_THIS_TURN(owner,mega),true);
    owner.movedToActiveThisTurn.pop();
    return 'paper lineage';
  },{prefabs:prefab});
  assert.equal(answer,'paper lineage');
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    prefab,'MOVED_TO_ACTIVE_THIS_TURN'),originalDescriptor);
  assert.throws(()=>withPaperEvolutionMovement(()=>{
    throw new Error('state error');
  },{prefabs:prefab}),/state error/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    prefab,'MOVED_TO_ACTIVE_THIS_TURN'),originalDescriptor);
  assert.throws(()=>withPaperEvolutionMovement(
    ()=>Promise.resolve(1),{prefabs:prefab}),/async boundary/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    prefab,'MOVED_TO_ACTIVE_THIS_TURN'),originalDescriptor);
});

test('public receipt reports the evolved move for each physical seat, without ids',()=>{
  for(const seat of [0,1]){
    const original=card(101,'Buneary M2'),mega=card(202,'Mega Lopunny ex M2');
    const own=player(slot(original,mega),[],[101]);
    own.id=100+seat;
    const other=player(slot(card(303,'Budew ASC')),[],[]);
    other.id=200+seat;
    const receipt=publicEventReceipt(stateFor(own,other,seat),seat);
    assert.equal(receipt.actorSeat,seat);
    assert.equal(receipt.ownerActive.printing,'Mega Lopunny ex M2');
    assert.equal(receipt.ownerActive.movedFromBenchToActiveThisTurn,true);
    assert.deepEqual(Object.keys(receipt.ownerActive),
      ['printing','movedFromBenchToActiveThisTurn','knownAbilityUse']);
    assert.equal(JSON.stringify(receipt).includes('202'),false);
    assert.equal(JSON.stringify(receipt).includes('101'),false);
  }
});

test('public receipt does not infer missing/other-mon movement',()=>{
  const old=card(101,'Buneary M2'),mega=card(202,'Mega Lopunny ex M2');
  const own=player(slot(old,mega),[slot(card(303,'Budew ASC'))],[303]);
  own.id=1;
  const other=player(slot(card(404,'Mimikyu GRI')),[],[]);
  other.id=2;
  const receipt=publicEventReceipt(stateFor(own,other,0),0);
  assert.equal(receipt.ownerActive.movedFromBenchToActiveThisTurn,false);
  assert.equal(receipt.ownerBench[0].movedFromBenchToActiveThisTurn,true);
});
