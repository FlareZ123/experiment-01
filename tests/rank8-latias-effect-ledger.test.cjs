'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {rank8ImmediateEffectSnapshot,withRank8SourceActionEffects} =
  require('../simulation/twinleaf/rank8-latias-effect-ledger.cjs');

/** @param {string} name */
const card=name=>({name,fullName:name+' source'});
/** @param {string} name @param {number} n @param {string[]} tools */
const pokemon=(name,n=0,tools=[])=>({
  getPokemonCard(){return card(name);},
  damage:0,energies:{cards:Array.from({length:n},()=>card('Psychic Energy'))},
  tools:tools.map(card)
});
function fixture() {
  const latias=pokemon('Latias ex',2);
  const dusk=pokemon('Trevenant & Dusknoir-GX',3);
  const garbo=pokemon('Garbodor',0,['Float Stone']);
  const candidate={
    id:101,active:latias,bench:[dusk],discard:{cards:[]},hand:{cards:[card('Field Blower')]},
    retreatedTurn:-1
  };
  const opponent={
    id:202,active:pokemon('Crobat V'),bench:[garbo],
    discard:{cards:[]},hand:{cards:[card('A'),card('B'),card('C')]},
    deck:{cards:[card('D'),card('E')]}
  };
  const state={turn:21,phase:2,activePlayer:0,
    prompts:[],players:[candidate,opponent]};
  return {state,candidate,opponent,latias,dusk,garbo};
}
class AddPlayerAction {}
class RetreatAction {}
class AttackAction {constructor(name){this.name=name;}}
class FakeStore {
  constructor(state){this.state=state;}
  dispatch(action) {
    if(action.constructor.name==='RetreatAction') {
      const c=this.state.players[0];
      c.active=c.bench[0];c.bench[0]=fixtureLatias;
      c.discard.cards.push(...fixtureLatias.energies.cards.splice(0,2));
      c.retreatedTurn=21;
    }
    if(action.constructor.name==='AttackAction') {
      const e=this.state.players[1];
      e.active.damage+=150;
      e.deck.cards.push(...e.hand.cards.splice(0,2));
    }
  }
}
let fixtureLatias;
test('snapshot is narrow read-only and observes Tool and Energy counts',()=>{
  const {state,latias}=fixture();
  fixtureLatias=latias;
  const before=JSON.stringify(state.players.map(p=>p.hand?.cards.length));
  const view=rank8ImmediateEffectSnapshot(state,101);
  assert.equal(view.latias.where,'active');
  assert.equal(view.latias.energy.length,2);
  assert.equal(view.trevenantDusknoir.energy.length,3);
  assert.deepEqual(view.garbodor.tools,['Float Stone source']);
  assert.equal(view.opponentHandCount,3);
  assert.equal(JSON.stringify(state.players.map(p=>p.hand?.cards.length)),before);
});
test('root-only action ledger sees exact paid Energy and Night Watch effect',()=>{
  const {state,latias}=fixture();fixtureLatias=latias;
  const original=FakeStore.prototype.dispatch;
  const answer=withRank8SourceActionEffects(FakeStore,()=>{
    const live=new FakeStore(state);
    live.dispatch(new AddPlayerAction());
    live.dispatch(new RetreatAction());
    live.dispatch(new AttackAction('Night Watch'));
    return 'completed';
  },{turn:21,playerId:101});
  assert.equal(answer.result,'completed');
  assert.equal(FakeStore.prototype.dispatch,original);
  const retreat=answer.observations.find(x=>x.action==='RetreatAction');
  const attack=answer.observations.find(x=>x.action==='AttackAction');
  assert.equal(retreat.before.latias.energy.length,2);
  assert.equal(retreat.after.latias.energy.length,0);
  assert.equal(retreat.after.ownerDiscardedPsychic,2);
  assert.equal(retreat.after.ownerActive,'Trevenant & Dusknoir-GX');
  assert.equal(attack.before.opponentActiveDamage,0);
  assert.equal(attack.after.opponentActiveDamage,150);
  assert.equal(attack.before.opponentHandCount,3);
  assert.equal(attack.after.opponentHandCount,1);
  assert.equal(attack.before.opponentDeckCount,2);
  assert.equal(attack.after.opponentDeckCount,4);
});
test('observer restores pinned dispatch after an exceptional run',()=>{
  const old=FakeStore.prototype.dispatch;
  assert.throws(()=>withRank8SourceActionEffects(FakeStore,()=>{
    throw new Error('test error');
  },{turn:21,playerId:101}),/test error/);
  assert.equal(FakeStore.prototype.dispatch,old);
});
