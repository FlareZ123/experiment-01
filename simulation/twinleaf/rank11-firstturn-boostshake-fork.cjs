'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const mod=name=>require(path.join(root,name));

/**
 * Intervene only in rank11's genuine first source turn. All printed effects
 * execute via Store actions and selected-card prompts, including payment.
 * @template T
 * @param {()=>T} execute
 */
function withRank11FirstTurnBoostShake(execute){
  const {SimpleTacticsAi}=mod('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    mod('game/store/actions/play-card-action');
  const {UseAbilityAction}=mod('game/store/actions/game-actions');
  const {ResolvePromptAction}=mod('game/store/actions/resolve-prompt-action');
  const {GamePhase}=mod('game/store/state/state');
  const old=SimpleTacticsAi.prototype.decodeNextAction;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const active={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  let stage=0,witness=null,response=null;
  const events=[];
  /** @param {any} state @param {string} reason @param {any} action */
  function issue(state,reason,action){
    events.push({stage,turn:state.turn,reason,action:action.constructor.name});
    stage++;
    return action;
  }
  /** @param {any} player @param {string} name @param {any} target */
  function play(player,name,target){
    const index=player.hand.cards.findIndex(c=>c.name===name);
    assert.ok(index>=0,'Source hand lacks '+name);
    return new PlayCardAction(player.id,index,target);
  }
  /** @param {any} prompt @param {any} state @param {string} name */
  function search(prompt,state,name){
    const card=prompt.cards.cards.find(c=>c.name===name);
    assert.ok(card,'Source search lacks '+name);
    assert.equal(prompt.validate([card],state),true);
    return new ResolvePromptAction(prompt.id,[card]);
  }
  const trubbish=p=>p.bench.findIndex(s=>s.getPokemonCard()?.name==='Trubbish');
  SimpleTacticsAi.prototype.decodeNextAction=function sourceFork(state){
    const player=state.players.find(p=>p.id===this.client?.id);
    const source=state.players.find(p=>p.id===101);
    const pending=state.prompts.find(p=>p.result===undefined);
    if(stage>=11&&!response&&state.turn>=2&&
       state.activePlayer===1&&state.phase===GamePhase.PLAYER_TURN){
      response={turn:state.turn,sourceUsedVSTAR:source.usedVSTAR,
        sourceBench:source.bench.map(s=>({name:s.getPokemonCard()?.name||null,
          tools:s.tools.map(t=>t.name)}))};
    }
    if(player?.id!==101)return old.call(this,state);
    if(pending){
      if(stage===1&&pending.constructor.name==='ChooseCardsPrompt')
        return issue(state,'VIP benches own Trubbish',
          search(pending,state,'Trubbish'));
      if(stage===3&&pending.constructor.name==='ChooseCardsPrompt')
        return issue(state,'Back Order gets Forest Seal Stone',
          search(pending,state,'Forest Seal Stone'));
      if(stage===6&&pending.constructor.name==='ChooseCardsPrompt')
        return issue(state,'Star Alchemy gets Boost Shake',
          search(pending,state,'Boost Shake'));
      if(stage===9&&pending.constructor.name==='ChooseCardsPrompt')
        return issue(state,'Boost Shake searches Garbodor',
          search(pending,state,'Garbodor'));
      if(stage===10&&pending.constructor.name==='ChoosePokemonPrompt'){
        const i=trubbish(player);
        assert.ok(i>=0);
        assert.equal(pending.validate([player.bench[i]],state),true);
        return issue(state,'Evolve source Tool-bearing Trubbish',
          new ResolvePromptAction(pending.id,[player.bench[i]]));
      }
      return old.call(this,state);
    }
    if(stage===0){
      if(state.turn!==1||state.activePlayer!==0||
        state.phase!==GamePhase.PLAYER_TURN)
        return old.call(this,state);
      witness={active:player.active.getPokemonCard()?.name,
        ownHand:player.hand.cards.map(c=>c.fullName),
        sourceBench:player.bench.map(s=>s.getPokemonCard()?.name||null),
        activeTools:player.active.tools.map(c=>c.name)};
      assert.equal(witness.active,'Oranguru V');
      assert.equal(witness.activeTools.length,0);
      return issue(state,'Play actual first-turn Battle VIP Pass',
        play(player,'Battle VIP Pass',board));
    }
    if(stage===2){
      assert.ok(trubbish(player)>=0,'VIP did not bench Trubbish');
      return issue(state,'Use Oranguru V Back Order',
        new UseAbilityAction(player.id,'Back Order',active));
    }
    if(stage===4)
      return issue(state,'Attach Forest Seal Stone to Oranguru V',
        play(player,'Forest Seal Stone',active));
    if(stage===5)
      return issue(state,'Use Star Alchemy for Boost Shake',
        new UseAbilityAction(player.id,'Star Alchemy',active));
    if(stage===7){
      const i=trubbish(player);
      assert.ok(i>=0);
      return issue(state,'Attach held Float Stone to source Trubbish',
        play(player,'Float Stone',{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.BENCH,index:i}));
    }
    if(stage===8)
      return issue(state,'Play fetched Boost Shake',play(player,'Boost Shake',board));
    if([1,3,6,9,10].includes(stage))
      throw Error('Missing expected printed prompt, stage '+stage);
    return old.call(this,state);
  };
  try{return {result:execute(),stage,events,witness,response};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=old;}
}
module.exports={withRank11FirstTurnBoostShake};
