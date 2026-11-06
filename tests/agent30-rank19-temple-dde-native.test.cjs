'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name Compiled genuine Twinleaf module name. */
const native=name=>require(path.join(OUTPUT,name));

/**
 * Rank19 source-bearing ADP with one attached printed DDE, facing a Temple
 * held in play by the other seat. The alternative is one genuine printed
 * Sky Field play that replaces Temple before a paid printed GX attack.
 * This is staged source inventory, not a natural full game opportunity.
 *
 * @param {0|1} seat Physical ADP player seat.
 * @param {boolean} sourceSkyFieldPlayed Whether to exercise the held counter.
 * @returns {object} Native Store receipt with both physical Stadium zones.
 */
function run(seat,sourceSkyFieldPlayed){
  const x=stage(seat), manager=initializeCards();
  let id=980000+seat*10000+Number(sourceSkyFieldPlayed)*100000;
  const physical=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned original card '+name);
    c.id=id++;
    return c;
  };
  const {AttackAction}=native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const adp=physical('Arceus & Dialga & Palkia GX CEC');
  const dde=physical('Double Dragon Energy ROS');
  const temple=physical('Temple of Sinnoh ASR');
  const sky=physical('Sky Field ROS');
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(adp,dde);
  x.owner.active.energies.cards.push(dde);
  x.opponent.stadium.cards.push(temple);
  x.owner.hand.cards.unshift(sky);
  x.store.state.activePlayer=seat;
  x.store.state.turn=2;
  x.store.state.phase=x.GamePhase.PLAYER_TURN;
  const owner=()=>x.store.state.players.find(p=>p.id===x.owner.id);
  const opponent=()=>x.store.state.players.find(p=>p.id===x.opponent.id);
  assert.equal(owner().usedGX,false);
  assert.ok(opponent().stadium.cards.includes(temple));
  let rejectedDueToTemple=false;
  if(sourceSkyFieldPlayed){
    x.store.dispatch(new PlayCardAction(owner().id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    assert.ok(owner().stadium.cards.includes(sky));
    assert.equal(opponent().stadium.cards.includes(temple),false);
    assert.ok(opponent().discard.cards.includes(temple));
  }
  if(!sourceSkyFieldPlayed){
    assert.throws(()=>x.store.dispatch(
      new AttackAction(owner().id,'Altered Creation-GX')
    ),e=>typeof e?.message==='string'&&
      /ENERGY|CANNOT|ATTACK/i.test(e.message));
    rejectedDueToTemple=true;
    assert.equal(owner().usedGX,false);
    assert.equal(owner().usedAlteredCreation,false);
    assert.equal(owner().alteredCreationDamage,false);
    assert.equal(owner().active.energies.cards.some(c=>c.fullName===
      'Double Dragon Energy ROS'),true);
  }else{
    x.store.dispatch(new AttackAction(owner().id,'Altered Creation-GX'));
    for(let i=0;i<16;i++){
      const state=x.store.state;
      const pending=state.prompts.find(p=>p.result===undefined);
      if(!pending){
        assert.equal(state.phase,x.GamePhase.PLAYER_TURN);
        assert.equal(state.activePlayer,1-seat);
        break;
      }
      assert.equal(pending.constructor.name,'WaitPrompt');
      x.store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(owner().usedGX,true);
    assert.equal(owner().alteredCreationDamage,true);
    assert.equal(owner().usedAlteredCreation,true);
  }
  return {seat,sourceSkyFieldPlayed,originalRank:19,
    templeInitiallyPublic:true,templeReplaced:
      !opponent().stadium.cards.includes(temple),
    rejectedDueToTemple,
    gxUsed:owner().usedGX,
    gxBonusDamage:owner().alteredCreationDamage,
    gxExtraPrize:owner().usedAlteredCreation,
    remainingOriginalDdeCount:owner().active.energies.cards.filter(
      card=>card.fullName==='Double Dragon Energy ROS').length,
    sourceStadiumInPlay:owner().stadium.cards.map(card=>card.fullName),
    opponentStadiumInPlay:opponent().stadium.cards.map(card=>card.fullName),
    competitiveQualifiedGames:0};
}
for(const seat of [0,1]){
  for(const sourceSkyFieldPlayed of [false,true]){
    test('native rank19 DDE ADP Temple Sky Field counter, seat '+seat+
      ', source plays Sky Field '+sourceSkyFieldPlayed,()=>{
      const out=run(seat,sourceSkyFieldPlayed);
      console.log('AGENT30_NATIVE_TEMPLE_RANK19',
        JSON.stringify(out));
      assert.equal(out.gxUsed,sourceSkyFieldPlayed);
      assert.equal(out.templeReplaced,sourceSkyFieldPlayed);
      assert.equal(out.rejectedDueToTemple,!sourceSkyFieldPlayed);
    });
  }
}
module.exports={run};
