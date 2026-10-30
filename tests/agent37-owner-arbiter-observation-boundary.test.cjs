'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {arbitrateOwnerRootIntent}=
  require('../simulation/twinleaf/agent41-owner-root-arbitration.cjs');

const VERSION='agent37-owner-observation-to-arbiter-metamorphic-v1';
const ATTACK=Object.freeze({kind:'attack',attackName:'Collapse'});
const OPTIONS=Object.freeze({publicContextSpecialEnergy:true});
const CATALOG={
  colorlessEnergyType:0,
  basicEnergyTypes:{Lightning:4,Psychic:5},
  stages:{BASIC:0},
  specialEnergies:new Set(['Capture Energy RCL','Double Colorless Energy SUM']),
  dragonPokemonPrintings:new Set()
};

/** @param {string} fullName @returns {object} */
function card(fullName){return {fullName};}

/** @param {string} fullName @param {string[]} energies @param {number[]} cost */
function pokemonSlot(fullName,energies,cost){
  const name=fullName.slice(0,fullName.lastIndexOf(' '));
  const pokemon={
    fullName,name,stage:0,cardType:[],retreat:[],weakness:[],
    resistance:[],hp:130,attacks:[{name:fullName.startsWith('Snorlax')?
      'Collapse':'Burrow',cost}],powers:[]
  };
  return {
    cards:[pokemon],getPokemonCard:()=>pokemon,damage:0,
    energies:{cards:energies.map(card)},tools:[],
    specialConditions:[]
  };
}

/** @returns {object} */
function emptySlot(){
  return {cards:[],getPokemonCard:()=>null,damage:0,
    energies:{cards:[]},tools:[]};
}

/** @param {boolean} readyBench */
function fixture(readyBench=false){
  const owner={
    id:1,
    active:pokemonSlot('Snorlax PGO',
      ['Double Colorless Energy SUM','Double Colorless Energy SUM'],[0,0,0,0]),
    bench:[pokemonSlot('Bunnelby PRC',
      readyBench?['Capture Energy RCL']:[],[0]),
      emptySlot(),emptySlot(),emptySlot(),emptySlot()],
    hand:{cards:[card('Capture Energy RCL')]},
    deck:{cards:[card('Own unseen card')]},
    prizes:Array.from({length:6},()=>({cards:[card('Face-down own prize')]})),
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},supporterTurn:0,energyPlayedTurn:0,
    stadiumPlayedTurn:0
  };
  const opponent={
    id:2,active:pokemonSlot('Latias ex SSP',[],[5]),
    bench:Array.from({length:5},emptySlot),
    hand:{cards:[card('Opponent hidden A')]},
    deck:{cards:[card('Opponent deck A')]},
    prizes:Array.from({length:6},()=>({cards:[card('Opponent prize A')]})),
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},supporterTurn:0,energyPlayedTurn:0,
    stadiumPlayedTurn:0
  };
  return {turn:22,phase:5,activePlayer:0,prompts:[],players:[owner,opponent]};
}

/** @param {object} state */
function choose(state){
  const view=actorObservation(state,0);
  return arbitrateOwnerRootIntent(view,CATALOG,ATTACK,OPTIONS);
}

/** @param {number} n @returns {object} */
function forbiddenZone(n){
  return new Proxy({length:n},{get(target,key){
    if(key==='length')return target.length;
    throw new Error('Forbidden concealed identity read: '+String(key));
  }});
}

test('real detached observation and production collector fund Bunnelby before a turn-ending attack',()=>{
  const result=choose(fixture());
  assert.deepEqual(result.intent,{
    kind:'attach-special-energy',printing:'Capture Energy RCL',
    handIndex:0,slot:'bench',index:0
  });
  assert.equal(result.receipt.reason,
    'fund-public-bench-attack-before-turn-ending-root');
  assert.deepEqual(result.receipt.selectedTarget,{
    slot:'bench',index:0,pokemonPrinting:'Bunnelby PRC',
    pokemonName:'Bunnelby'
  });
  assert.equal(result.receipt.nativePlayability,'unverified');
});

test('K0 concealed worlds and poisoned hidden zones cannot change composed choice',()=>{
  const a=fixture(),b=fixture();
  b.players[0].deck.cards=[card('Unseen owner deck B')];
  b.players[0].prizes[0].cards=[card('Different own prize')];
  b.players[1].hand.cards=[card('Other private hand card')];
  b.players[1].deck.cards=[card('Other private deck card')];
  b.players[1].prizes[0].cards=[card('Other hidden prize')];
  assert.deepEqual(choose(a),choose(b));
  b.players[0].deck.cards=forbiddenZone(1);
  for(const prize of b.players[0].prizes)prize.cards=forbiddenZone(1);
  b.players[1].hand.cards=forbiddenZone(1);
  b.players[1].deck.cards=forbiddenZone(1);
  for(const prize of b.players[1].prizes)prize.cards=forbiddenZone(1);
  assert.deepEqual(choose(a),choose(b));
});

test('resource-hold negative: an already funded Bench attack preserves the attack',()=>{
  const result=choose(fixture(true));
  assert.strictEqual(result.intent,ATTACK);
  assert.equal(result.receipt.reason,'no-supported-bench-special-offer');
});

test('potential last-Prize attack preserves the terminal option',()=>{
  const state=fixture();
  state.players[0].prizes=[{cards:[card('Hidden own prize')]}];
  const result=choose(state);
  assert.strictEqual(result.intent,ATTACK);
  assert.equal(result.receipt.reason,'potential-last-prize-attack');
});

module.exports={VERSION};
