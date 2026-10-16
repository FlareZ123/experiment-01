'use strict';
const path=require('node:path');
const {sampleDeckOrder}=require('./speculative-deck-sampling.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let restoreActive=null;

/**
 * Sample unknown card membership across the acting player's deck and facedown
 * Prizes when no deck search or Prize reveal has occurred (strict K0).
 * Preserves any explicitly known top-of-deck prefix. Input MUST be a private
 * Simulator clone, never a live Store state.
 * @param {object} player Cloned engine Player.
 * @param {()=>number} random Isolated policy RNG.
 * @param {number} knownTopCount Proven known prefix (usually zero in K0).
 */
function sampleK0OwnZones(player,random,knownTopCount=0){
 const deck=player.deck.cards;
 if(!Number.isInteger(knownTopCount)||knownTopCount<0||knownTopCount>deck.length)
  throw new RangeError('Invalid known top-deck prefix');
 const occupied=player.prizes.filter(slot=>slot.cards.length===1);
 const prefix=deck.slice(0,knownTopCount);
 const hidden=[...deck.slice(knownTopCount),...occupied.map(slot=>slot.cards[0])];
 sampleDeckOrder(hidden,random);
 const unknownDeckCount=deck.length-knownTopCount;
 deck.splice(0,deck.length,...prefix,...hidden.slice(0,unknownDeckCount));
 occupied.forEach((slot,i)=>slot.cards.splice(0,1,hidden[unknownDeckCount+i]));
}

/**
 * Hypothetical-engine K0-only experiment: ensures equal observation pools
 * produce equal sampled deck/Prize allocations under common random bits.
 * Does not model K1 search knowledge, partial Prize reveals, opponent hand
 * uncertainty, or the bot's real decision competence.
 * @param {{random:()=>number,playerId:number,knownTopCount?:number}} options
 */
function installSpeculativeK0Sampling(options){
 if(restoreActive)throw new Error('K0 sampler already installed');
 if(typeof options?.random!=='function'||!Number.isInteger(options.playerId))
  throw new TypeError('Isolated random and numeric acting playerId required');
 const mod=require(path.join(OUTPUT,'game/bots/simulator'));
 const Base=mod.Simulator;
 class K0Simulator extends Base{
  constructor(state,arbiterOptions){
   super(state,arbiterOptions);
   const player=this.store.state.players.find(p=>p.id===options.playerId);
   if(!player)throw new Error('K0 perspective player absent');
   sampleK0OwnZones(player,options.random,options.knownTopCount||0);
   for(const other of this.store.state.players){
    if(other!==player)sampleDeckOrder(other.deck.cards,options.random);
   }
  }
 }
 mod.Simulator=K0Simulator;
 function restore(){
  if(mod.Simulator!==K0Simulator)throw new Error('Restore Simulator hooks in reverse order');
  mod.Simulator=Base;restoreActive=null;
 }
 restoreActive=restore;
 return restore;
}
module.exports={sampleK0OwnZones,installSpeculativeK0Sampling};
