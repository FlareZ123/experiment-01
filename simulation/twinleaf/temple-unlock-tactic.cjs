'use strict';

const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(root,name));

/**
 * Test action payment using the actual cloned engine, with no live-state
 * mutation. This is a tactical availability check, not attack-quality scoring.
 *
 * @param {object} state Stable Twinleaf State.
 * @param {number} playerId Acting player ID.
 * @param {object} arbiter Configured deterministic arbiter.
 * @returns {boolean}
 */
function canUseApex(state,playerId,arbiter) {
  const {Simulator}=load('game/bots/simulator');
  const {AttackAction}=load('game/store/actions/game-actions');
  try {
    const sim=new Simulator(state,arbiter);
    sim.dispatch(new AttackAction(playerId,'Apex Dragon'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Produce a research-owned, opt-in SimpleTactic, leaving Twinleaf untouched.
 * It spends a benchable Psychic Marshadow's Resetting Hole only when a
 * simulated, legally processed removal immediately enables Apex Dragon.
 * Ignores all other strategic value, matchups and future turns.
 * @returns {Function} Class accepted by SimpleTacticsAi options.tactics.
 */
function makeTempleUnlockTactic() {
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {UseAbilityAction}=load('game/store/actions/game-actions');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {Simulator}=load('game/bots/simulator');

  return class TempleUnlockTactic extends SimpleTactic {
    /** @param {object} state @param {object} player @returns {object|undefined} */
    useTactic(state,player) {
      const active=player.active.getPokemonCard();
      if (!active||active.name!=='Regidrago VSTAR'||active.set!=='SIT') return;
      if (!state.players.some(p=>p.stadium.cards.some(c=>c.name==='Temple of Sinnoh'))) return;
      if (canUseApex(state,player.id,this.options.arbiter)) return;
      for(let i=0;i<player.bench.length;i++) {
        const pokemon=player.bench[i].getPokemonCard();
        if (!pokemon||pokemon.name!=='Marshadow'||pokemon.set!=='UNB'||
            String(pokemon.setNumber)!=='81') continue;
        const action=new UseAbilityAction(player.id,'Resetting Hole',{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:i
        });
        try {
          const sim=new Simulator(state,this.options.arbiter);
          sim.dispatch(action);
          const pending=sim.store.state.prompts.filter(p=>p.result===undefined);
          if (pending.some(p=>p.constructor.name!=='WaitPrompt')) continue;
          for(const prompt of pending) {
            sim.dispatch(new ResolvePromptAction(prompt.id,null));
          }
          if (sim.store.state.prompts.some(p=>p.result===undefined)) continue;
          if (canUseApex(sim.store.state,player.id,this.options.arbiter)) return action;
        } catch {
          continue;
        }
      }
    }
  };
}
/**
 * Insert the narrow Temple-to-Apex response before ordinary Energy attachment
 * decisions. This deliberately leaves all default policy behavior unchanged
 * unless selected by the headless match options.
 * @param {object} options Valid pinned SimpleBotOptions.
 * @returns {object} Explicitly versioned experimental tactic set.
 */
function withTempleUnlockRecovery(options) {
  const position=options.tactics.findIndex(tactic=>tactic.name==='AttachEnergyTactic');
  if(position<0) throw new Error('Required AttachEnergyTactic absent');
  return {
    ...options,
    tactics:[
      ...options.tactics.slice(0,position),
      makeTempleUnlockTactic(),
      ...options.tactics.slice(position)
    ]
  };
}

module.exports={canUseApex,makeTempleUnlockTactic,withTempleUnlockRecovery};
