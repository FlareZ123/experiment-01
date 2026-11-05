'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {stage}=require('../simulation/twinleaf/agent27-source-lastbench-two-basic-native.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {IS_ABILITY_BLOCKED}=require(path.join(output,'game/store/prefabs/prefabs'));

/**
 * Probe the same exact physical Tapu Lele-GX before and after native PlayCard.
 * The synthetic board uses physical registered source rank 1 versus rank 6
 * or rank 10 printings, and retains six physical Prize cards per owner.
 * @param {0|1} seat
 * @param {6|10} rank
 * @returns {object}
 */
function entryTiming(seat,rank){
  const x=stage(seat,rank);
  const lele=x.owner.hand.cards.find(c=>c.fullName==='Tapu Lele-GX GRI');
  assert.ok(lele);
  assert.equal(x.owner.hand.cards.includes(lele),true);
  const beforeBlocked=IS_ABILITY_BLOCKED(x.store,x.state,x.owner,lele);
  const beforeZone='hand';
  x.store.dispatch(new x.PlayCardAction(x.owner.id,
    x.owner.hand.cards.indexOf(lele),{
      player:x.PlayerType.BOTTOM_PLAYER,slot:x.SlotType.BENCH,index:4
    }));
  const inBench=x.owner.bench[4].getPokemonCard()===lele;
  const afterBlocked=IS_ABILITY_BLOCKED(x.store,x.state,x.owner,lele);
  const pending=x.state.prompts.filter(p=>p.result===undefined)
    .map(p=>p.constructor.name);
  return {seat,rank,beforeBlocked,afterBlocked,beforeZone,inBench,pending,
    opponentActive:x.opponent.active.getPokemonCard()?.fullName,
    ownerBenchFull:x.owner.bench.every(slot=>!!slot.getPokemonCard()),
    actualSourcePrinted60s:true,controlledArtificialBoard:true,
    qualifiedCompetitiveGames:0};
}

test('pinned Iron Thorns active suppresses already-Benched Lele ability, while early on-play probe misses lock',()=>{
  for(const seat of [0,1]){
    const r=entryTiming(seat,6);
    console.log('AGENT1_WONDERTAG_THORNS_TIMING',JSON.stringify(r));
    assert.equal(r.opponentActive,'Iron Thorns ex TWM');
    assert.equal(r.beforeBlocked,false);
    assert.equal(r.inBench,true);
    assert.equal(r.afterBlocked,true);
    assert.deepEqual(r.pending,['ConfirmPrompt']);
    assert.equal(r.qualifiedCompetitiveGames,0);
  }
});

test('nonlocking Regidrago active preserves Wonder Tag ability before and after placement',()=>{
  for(const seat of [0,1]){
    const r=entryTiming(seat,10);
    console.log('AGENT1_WONDERTAG_UNLOCKED_CONTROL',JSON.stringify(r));
    assert.equal(r.opponentActive,'Regidrago V SIT');
    assert.equal(r.beforeBlocked,false);
    assert.equal(r.inBench,true);
    assert.equal(r.afterBlocked,false);
    assert.deepEqual(r.pending,['ConfirmPrompt']);
    assert.equal(r.qualifiedCompetitiveGames,0);
  }
});
