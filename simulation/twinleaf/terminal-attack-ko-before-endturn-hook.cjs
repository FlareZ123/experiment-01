'use strict';
const assert=require('node:assert/strict');

const VERSION='agent3-paper-terminal-attack-ko-before-endturn-v1';

/**
 * Research-owned opt-in correction for a terminal attack KO which must
 * resolve before the EndTurnEffect's queued delayed opponent-turn effects.
 *
 * Pinned game-effect.ts normally enters EndTurnEffect after non-Barrage
 * attack damage. Pinned game-phase-effect.ts then resolves queued end-turn
 * effects before its first checkState. If the attack itself already reduces
 * the defender's *last* Pokémon to 0 HP, the paper game must resolve first.
 *
 * This hook uses the engine's own CheckHpEffect and checkState and only acts
 * when its genuine root Store has a lethal Active damaged from an attack,
 * with no reserve Bench. Speculative bot Stores are untouched. Promptful
 * preflight is rejected: more comprehensive KO ordering needs a continuation.
 *
 * @param {{Store:Function,EndTurnEffect:Function,CheckHpEffect:Function,
 *   GamePhase:object,checkState:Function,rootStore:object}} types
 * @returns {{restore:()=>void,evidence:()=>object}}
 */
function installTerminalAttackKoBeforeEndTurnHook(types){
  const {Store,EndTurnEffect,CheckHpEffect,GamePhase,checkState,rootStore}=types;
  const original=Store.prototype.reduceEffect;
  assert.equal(typeof original,'function');
  const events=[];
  let possible=0;
  const corrected=function(state,effect){
    if(this!==rootStore || !(effect instanceof EndTurnEffect) ||
       state.phase!==GamePhase.ATTACK)
      return original.call(this,state,effect);
    const attackerSeat=state.players.findIndex(player=>player===effect.player);
    if(attackerSeat<0)return original.call(this,state,effect);
    const defenderSeat=1-attackerSeat;
    const defender=state.players[defenderSeat];
    const defenderCard=defender.active.getPokemonCard();
    if(!defenderCard || defender.bench.some(slot=>slot.getPokemonCard()))
      return original.call(this,state,effect);
    const hpEffect=new CheckHpEffect(defender,defender.active);
    state=original.call(this,state,hpEffect);
    if(defender.active.damage<hpEffect.hp)
      return original.call(this,state,effect);
    possible++;
    const before={
      attackerSeat,defenderSeat,turn:state.turn,
      defenderName:defenderCard.name,
      defenderDamage:defender.active.damage,
      defenderEffectiveHp:hpEffect.hp,
      nativeDelayedEffects:effect.player.pendingEndOfTurnEffects.map(item=>({
        type:item.type,attack:item.attack?.name??null
      })),
      originalPrizes:state.players.map(player=>
        player.prizes.filter(slot=>slot.cards.length>0).length)
    };
    state=checkState(this,state);
    if(this.hasPrompts())
      throw new Error('Paper attack-KO ordering needs an unsupported prompt continuation');
    const endedBeforeDelayedEffects=state.phase===GamePhase.FINISHED;
    events.push({...before,endedBeforeDelayedEffects});
    if(endedBeforeDelayedEffects)return state;
    return original.call(this,state,effect);
  };
  Store.prototype.reduceEffect=corrected;
  return Object.freeze({
    evidence:()=>({schema:VERSION,possible,events:events.map(x=>({...x,
      nativeDelayedEffects:x.nativeDelayedEffects.map(y=>({...y})),
      originalPrizes:[...x.originalPrizes]
    })),paperCertified:false,developmentOnly:true}),
    restore:()=>{
      assert.equal(Store.prototype.reduceEffect,corrected,
        'Terminal attack KO hook was overridden before restoration');
      Store.prototype.reduceEffect=original;
    }
  });
}
module.exports={VERSION,installTerminalAttackKoBeforeEndTurnHook};
