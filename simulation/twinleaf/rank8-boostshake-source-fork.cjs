'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {SimpleTacticsAi}=require(path.join(base,'simple-bot/simple-tactics-ai'));
const {PlayCardAction,PlayerType,SlotType}=
  require(path.join(base,'game/store/actions/play-card-action'));
const {ResolvePromptAction}=
  require(path.join(base,'game/store/actions/resolve-prompt-action'));
const {GamePhase}=require(path.join(base,'game/store/state/state'));

/**
 * Replay one alternative from an actual source-dealt rank-8 turn-7 hand.
 * Each chosen card is resolved through a real printed Store prompt.
 * Prior turns and the opponent policy are left unchanged.
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,events:object[],stage:number,witness:object|null,turn8:object|null}}
 */
function withRank8BoostShakeFork(execute){
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  let stage=0;
  let witness=null;
  let turn8=null;
  const events=[];
  const pay=['Dark Patch','VS Seeker','Iono'];
  const shownHand=['Boost Shake','Dark Patch','VS Seeker','Iono','Secret Box','Float Stone'];
  /** @param {object} p @param {string} name @param {object} target */
  const play=(p,name,target)=>{
    const index=p.hand.cards.findIndex(c=>c.name===name);
    assert.ok(index>=0,'Missing actual source card '+name);
    return new PlayCardAction(p.id,index,target);
  };
  /** @param {object} state @param {string} explanation @param {object} action */
  const record=(state,explanation,action)=>{
    events.push({stage,turn:state.turn,explanation,
      action:action.constructor.name});
    stage++;
    return action;
  };
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const activeSource=state=>{
    const p=state.players[0];
    return {turn:state.turn,hand:p.hand.cards.map(c=>c.fullName),
      availableBenchSlots:p.bench.filter(slot=>!slot.getPokemonCard()).length,
      bench:p.bench.map(slot=>({name:slot.getPokemonCard()?.name,
        tools:slot.tools.map(tool=>tool.name)})),
      active:p.active.getPokemonCard()?.name};
  };
  SimpleTacticsAi.prototype.decodeNextAction=function chooseTurn7(state){
    const p=state.players.find(x=>x.id===this.client.id);
    const pending=state.prompts.find(x=>x.result===undefined);
    if(stage>=11 && !turn8 && state.turn>=8 &&
        state.phase===GamePhase.PLAYER_TURN && !pending){
      turn8={turn:state.turn,
        board:state.players.map(player=>({
          active:player.active.getPokemonCard()?.name,
          bench:player.bench.map(slot=>({
            name:slot.getPokemonCard()?.name,
            tools:slot.tools.map(tool=>tool.name)}))
        }))};
    }
    if(p?.id!==101) return original.call(this,state);
    if(stage===0 && !pending && state.turn===7 &&
        state.activePlayer===0 && state.phase===GamePhase.PLAYER_TURN){
      witness=activeSource(state);
      assert.deepEqual(p.hand.cards.map(c=>c.name).sort(),
        shownHand.slice().sort(),'Source hand diverged before first branch');
      assert.equal(p.bench.filter(slot=>slot.getPokemonCard()).length,4);
      return record(state,'Play source-held Secret Box',play(p,'Secret Box',board));
    }
    if(stage===0) return original.call(this,state);
    if(stage===1 || stage===2 || stage===4 || stage===5 || stage===9){
      if(pending?.constructor.name!=='ChooseCardsPrompt')
        return original.call(this,state);
      const names=stage===1?pay:stage===2?
        ['Quick Ball','Temple of Sinnoh']:stage===4?
        ['Temple of Sinnoh']:stage===5?['Trubbish']:['Garbodor'];
      const chosen=names.map(name=>{
        const card=pending.cards.cards.find(c=>c.name===name);
        assert.ok(card,'Missing prompted card '+name+' at stage '+stage);
        return card;
      });
      assert.equal(pending.validate(chosen),true,
        'Printed prompt rejected declared cards at stage '+stage);
      return record(state,'Choose '+names.join(', '),
        new ResolvePromptAction(pending.id,chosen));
    }
    if(stage===10 && pending?.constructor.name==='ChoosePokemonPrompt'){
      const index=p.bench.findIndex(slot=>slot.getPokemonCard()?.name==='Trubbish');
      assert.ok(index>=0);
      assert.equal(pending.validate([p.bench[index]],state),true);
      return record(state,'Evolve actual source Trubbish into Garbodor',
        new ResolvePromptAction(pending.id,[p.bench[index]]));
    }
    if(pending) return original.call(this,state);
    if(stage===3) return record(state,'Pay Quick Ball with searched Stadium',
      play(p,'Quick Ball',board));
    if(stage===6){
      assert.equal(p.bench.filter(slot=>slot.getPokemonCard()).length,4);
      return record(state,'Bench actually searched Trubbish',
        play(p,'Trubbish',{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.BENCH,index:p.bench.findIndex(slot=>!slot.getPokemonCard())}));
    }
    if(stage===7){
      const index=p.bench.findIndex(slot=>slot.getPokemonCard()?.name==='Trubbish');
      assert.ok(index>=0);
      return record(state,'Attach held Float Stone to new Trubbish',
        play(p,'Float Stone',{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.BENCH,index}));
    }
    if(stage===8) return record(state,'Play held Boost Shake',play(p,'Boost Shake',board));
    if(stage===10){
      assert.equal(pending,null);
      throw Error('Boost Shake did not produce its expected evolution prompt');
    }
    return original.call(this,state);
  };
  try{return {result:execute(),events,stage,witness,turn8};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=original;}
}
module.exports={withRank8BoostShakeFork};
