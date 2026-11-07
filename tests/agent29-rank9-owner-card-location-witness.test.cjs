'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOriginalRank9OwnerCardLocations,originalRoleCardZones}=
  require('../simulation/twinleaf/agent29-rank9-owner-card-location-witness.cjs');

class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
class Store {
  constructor(state){this.state=state;}
  dispatch(){return this.state;}
}

/** @param {string} fullName */
const card=fullName=>({fullName});
/** @param {Array<{fullName:string}>} [cards] */
const zone=(cards=[])=>({cards});
/** @param {string|null} [identity] */
const slot=(identity=null)=>({
  cards:identity?[card(identity)]:[],
  getPokemonCard(){return this.cards.at(-1);}
});
function fixture(seat){
  const source={id:100,deck:zone([card('Electrode-GX CES')]),
    hand:zone([card('Battle Compressor PHF'),card('Ultra Ball MEG')]),
    prizes:[zone([card('Mega Absol ex M1L')]),zone([])],
    active:slot('Voltorb ROS'),bench:[slot()],
    discard:zone([card('Electrode-GX CES')]),lostzone:zone(),
    stadium:zone(),supporter:zone(),
    getPrizeLeft(){return this.prizes.flatMap(p=>p.cards).length;}};
  const enemy={id:101};
  return {source,store:new Store({turn:8,activePlayer:seat,
    players:seat===0?[source,enemy]:[enemy,source]})};
}

test('read-only printed role count includes face-down Prize and all other physical zones',()=>{
  const f=fixture(0);
  const z=originalRoleCardZones(f.source);
  assert.equal(z.mega.prizes,1);
  assert.equal(z.voltorb.active,1);
  assert.equal(z.electrode.deck,1);
  assert.equal(z.electrode.discard,1);
  assert.equal(z.physicalRoleConservation,true);
  assert.equal(z.ownHandCompressor,1);
  assert.equal(z.ownHandConnectorCounts.ultraBall,1);
  assert.equal(z.ownActive,'Voltorb ROS');
});

test('actual registered source Pass recorded for both seats, no opponent Pass',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const original=Store.prototype.dispatch;
    const result=withOriginalRank9OwnerCardLocations(register=>{
      register(f.store,'9:300:'+(seat===0?'B':'A')+':champion-reference');
      f.store.dispatch(new PassTurnAction(f.source.id));
      f.store.dispatch(new PassTurnAction(101));
      return true;
    },{Store});
    assert.equal(result.result,true);
    assert.equal(Store.prototype.dispatch,original);
    assert.equal(result.audit.observedSourcePasses,1);
    assert.equal(result.audit.heldItemSourcePasses,1);
    assert.equal(result.audit.nonConservingRoleSnapshots,0);
    const e=result.audit.events[0];
    assert.equal(e.sourceSeat,seat);
    assert.equal(e.globalTurn,8);
    assert.equal(e.mega.prizes,1);
  }
});

test('unregistered Store clones do not enter source audit; thrown runner restores dispatch',()=>{
  const f=fixture(1),clone=fixture(1);
  const original=Store.prototype.dispatch;
  assert.throws(()=>withOriginalRank9OwnerCardLocations(register=>{
    register(f.store,'9:301:A:new-moon-lockbreaker-v1');
    clone.store.dispatch(new PassTurnAction(clone.source.id));
    throw Error('native observer abort');
  },{Store}),/native observer abort/);
  assert.equal(Store.prototype.dispatch,original);
});
