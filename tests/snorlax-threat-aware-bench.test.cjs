'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  withSoloSnorlaxBenchPreservation, opponentHasVisibleAttachedEnergy
} = require('../simulation/twinleaf/snorlax-solo-opening-policy.cjs');

class PlayBasicTactic {
  useTactic() {return {action:'play-held-basic'};}
}
class OtherTactic {
  useTactic() {return {action:'other'};}
}

/**
 * @param {string|null} name
 * @param {number} energy
 * @returns {object}
 */
function slot(name,energy=0) {
  return {
    getPokemonCard:()=>name ? {fullName:name} : null,
    energies:{cards:Array.from({length:energy},(_,i)=>({name:'Energy '+i}))}
  };
}

/**
 * Public attachments are part of in-play slots; Energy in a player's hand
 * is intentionally present but must be ignored by the policy.
 * @param {{opponentActiveEnergy?:number,opponentBenchEnergy?:number,
 *   ownEnergy?:number,ownBench?:boolean,ownActive?:string,
 *   opponentHandEnergy?:number}} [opts]
 * @returns {{state:object,player:object}}
 */
function board(opts={}) {
  const own={
    id:101,
    active:slot(opts.ownActive??'Snorlax PGO',opts.ownEnergy??0),
    bench:[slot(opts.ownBench?'Bunnelby':null)],
    hand:{cards:[]}
  };
  const opponent={
    id:202,
    active:slot('Lillie\'s Clefairy ex',opts.opponentActiveEnergy??0),
    bench:[slot('Shadow Rider Calyrex V',opts.opponentBenchEnergy??0)],
    hand:{cards:Array.from({length:opts.opponentHandEnergy??0},()=>({name:'Psychic Energy'}))}
  };
  return {state:{players:[own,opponent]},player:own};
}

function tactic(policy) {
  const opts={tactics:[PlayBasicTactic,OtherTactic]};
  const out=withSoloSnorlaxBenchPreservation(opts,{PlayBasicTactic},policy);
  assert.strictEqual(opts.tactics[0],PlayBasicTactic);
  assert.strictEqual(out.tactics[1],OtherTactic);
  assert.strictEqual(withSoloSnorlaxBenchPreservation(out,{PlayBasicTactic},policy),out);
  return new out.tactics[0]();
}

test('no public opposing attached Energy preserves solo Snorlax',()=>{
  const {state,player}=board({ownEnergy:2,opponentHandEnergy:4});
  assert.equal(opponentHasVisibleAttachedEnergy(state,player),false);
  assert.equal(tactic({allowBackupOnVisibleOppEnergy:true}).useTactic(state,player),undefined);
});

test('public opposing Active Energy permits ordinary Basic Benching',()=>{
  const {state,player}=board({opponentActiveEnergy:1});
  assert.equal(opponentHasVisibleAttachedEnergy(state,player),true);
  assert.deepEqual(tactic({allowBackupOnVisibleOppEnergy:true})
    .useTactic(state,player),{action:'play-held-basic'});
});

test('public opposing Bench Energy also permits ordinary Basic Benching',()=>{
  const {state,player}=board({opponentBenchEnergy:1});
  assert.equal(opponentHasVisibleAttachedEnergy(state,player),true);
  assert.deepEqual(tactic({allowBackupOnVisibleOppEnergy:true})
    .useTactic(state,player),{action:'play-held-basic'});
});

test('opt-in false retains historical unconditional preservation',()=>{
  const {state,player}=board({opponentActiveEnergy:2});
  assert.equal(tactic({}).useTactic(state,player),undefined);
});

test('existing Bench or different Active keeps ordinary play behavior',()=>{
  for(const options of [{ownBench:true},{ownActive:'Mimikyu PAL'}]) {
    const {state,player}=board(options);
    assert.deepEqual(tactic({allowBackupOnVisibleOppEnergy:true})
      .useTactic(state,player),{action:'play-held-basic'});
  }
});
