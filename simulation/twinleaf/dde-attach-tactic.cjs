'use strict';

const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(root,name));

/**
 * Opt-in research tactic to recover a missed legal Double Dragon attachment.
 * Insert immediately AFTER upstream AttachEnergyTactic so proven static-score
 * attachments retain their existing priority.
 *
 * It tests the actual PlayCardAction on a cloned engine state and requires
 * the attached card to contribute effective Energy under current effects.
 * No source changes to Twinleaf are needed.
 *
 * @returns {Function} A class accepted by SimpleTacticsAi options.tactics.
 */
function makeDoubleDragonAttachTactic() {
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {Simulator}=load('game/bots/simulator');
  const {CheckProvidedEnergyEffect}=load('game/store/effects/check-effects');

  return class DoubleDragonAttachTactic extends SimpleTactic {
    /** @param {object} state @param {object} player @returns {object|undefined} */
    useTactic(state,player) {
      if (state.prompts.some(p=>p.result===undefined)) return;
      if (player.energyPlayedTurn>=state.turn) return;
      const handIndex=player.hand.cards.findIndex(c=>
        c.name==='Double Dragon Energy'&&c.set==='ROS');
      if (handIndex<0) return;
      const wanted=player.hand.cards[handIndex];
      const positions=[
        {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0},
        ...player.bench.map((_,index)=>({
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
        }))
      ];
      for(const target of positions) {
        const action=new PlayCardAction(player.id,handIndex,target);
        try {
          const sim=new Simulator(state,this.options.arbiter);
          sim.dispatch(action);
          if (sim.store.state.prompts.some(p=>p.result===undefined)) continue;
          const updated=sim.store.state.players.find(p=>p.id===player.id);
          const location=target.slot===SlotType.ACTIVE
            ? updated.active:updated.bench[target.index];
          if (!location.cards.includes(wanted)) continue;
          const check=new CheckProvidedEnergyEffect(updated,location);
          sim.store.reduceEffect(sim.store.state,check);
          const units=check.energyMap
            .filter(row=>row.card===wanted)
            .reduce((n,row)=>n+row.provides.length,0);
          if(units>0) return action;
        } catch {
          continue;
        }
      }
    }
  };
}

/** @param {object} options Existing SimpleBotOptions. @returns {object} */
function withDoubleDragonRecovery(options) {
  const basic=options.tactics.findIndex(Tactic=>Tactic.name==='AttachEnergyTactic');
  if(basic<0) throw new Error('Required default AttachEnergyTactic missing');
  return {
    ...options,
    tactics:[
      ...options.tactics.slice(0,basic+1),
      makeDoubleDragonAttachTactic(),
      ...options.tactics.slice(basic+1)
    ]
  };
}
module.exports={makeDoubleDragonAttachTactic,withDoubleDragonRecovery};
