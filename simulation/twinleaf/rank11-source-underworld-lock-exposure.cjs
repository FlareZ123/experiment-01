'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {withRank11FirstTurnBoostShake}=
  require('./rank11-firstturn-boostshake-fork.cjs');
const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const mod=name=>require(path.join(base,name));

/**
 * Record only public in-play Garbotoxin sources and rank1's in-play
 * Underworld Door legality. Re-acquire every Player from live Store state.
 * No hidden opponent cards are examined and no actions are modified.
 * @template T
 * @param {any} Store Actual pinned engine class
 * @param {()=>T} execute
 */
function observeLockedDoor(Store,execute){
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const {GamePhase}=mod('game/store/state/state');
  const {IS_ABILITY_BLOCKED}=mod('game/store/prefabs/prefabs');
  let root=null;
  const seen=new Set(),samples=[];
  function dispatch(action,...args){
    if(!root && action?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root){
      const s=this.state;
      if(s?.phase===GamePhase.PLAYER_TURN&&s.activePlayer===1){
        const rank1=s.players[1],rank11=s.players[0];
        if(rank1&&rank11){
          const own=[rank1.active,...rank1.bench]
            .filter(slot=>slot.getPokemonCard());
          const enemy=[rank11.active,...rank11.bench]
            .filter(slot=>slot.getPokemonCard());
          const maxes=own.filter(slot=>
            slot.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX');
          const equipped=enemy.filter(slot=>
            slot.getPokemonCard()?.name==='Garbodor'&&slot.tools.length>0);
          const rows=maxes.map(slot=>{
            const card=slot.getPokemonCard();
            const power=card.powers.find(x=>x.name==='Underworld Door');
            assert.ok(power,'Exact VMAX lacks Underworld Door');
            return IS_ABILITY_BLOCKED(this,s,rank1,card,power);
          });
          if(maxes.length||equipped.length){
            const signature=[s.turn,action.constructor.name,maxes.length,
              equipped.length,rows.join(',')].join(':');
            if(!seen.has(signature)){
              seen.add(signature);
              samples.push({turn:s.turn,action:action.constructor.name,
                shadowRiderVMAXInPlay:maxes.length,
                sourceEquippedGarbodor:equipped.length,
                underworldDoorBlocked:rows,
                rank1FieldBlowerInOwnHand:rank1.hand.cards.some(c=>
                  c.name==='Field Blower'),
                rank1Active:rank1.active.getPokemonCard()?.name||null});
            }
          }
        }
      }
    }
    return descriptor.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{return {result:execute(),samples};}
  finally{Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}
function run(){
  initializeCards();
  const {Store}=mod('game/store/store');
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source=plan.opponents.find(x=>x.rank===11);
  assert.equal(source?.status,'ready');
  const request={deckA:source.cards,deckB:plan.candidate.cards,
    seed:1244180408,maxActions:450,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true};
  const control=observeLockedDoor(Store,()=>runMatch(request));
  const forced=observeLockedDoor(Store,()=>
    withRank11FirstTurnBoostShake(()=>runMatch(request)));
  assert.equal(forced.result.stage,11);
  const original=control.result,fork=forced.result.result;
  assert.deepEqual(original.deckHashes,fork.deckHashes);
  assert.equal(original.firstTurnSlot,0);
  assert.equal(fork.firstTurnSlot,0);
  const stats=obs=>({
    observedSignatures:obs.samples.length,
    vmaxStates:obs.samples.filter(x=>x.shadowRiderVMAXInPlay>0).length,
    equippedStates:obs.samples.filter(x=>x.sourceEquippedGarbodor>0).length,
    exercisedLockedVMAX:obs.samples.filter(x=>
      x.shadowRiderVMAXInPlay>0&&x.sourceEquippedGarbodor>0&&
      x.underworldDoorBlocked.some(Boolean)).length,
    firstLockWitness:obs.samples.find(x=>
      x.shadowRiderVMAXInPlay>0&&x.sourceEquippedGarbodor>0) || null,
    sample:obs.samples.filter(x=>x.shadowRiderVMAXInPlay>0&&
      x.sourceEquippedGarbodor>0).slice(0,12)
  });
  return {study:'rank11 actual source Garbotoxin vs own rank1 Underworld Door',
    seed:1244180408,engine:plan.engineRevision,
    original:stats(control),forced:stats(forced),
    originalWinner:original.winner,forkWinner:fork.winner,
    firstForkOpponentResponse:forced.result.response,
    qualifiedForCompetitiveInference:false,
    caveat:'Read-only in-play availability test, not a legal full policy decision, action of Underworld Door, or matchup win rate'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={observeLockedDoor,run};
