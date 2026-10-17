'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {SimpleTacticsAi}=require(path.join(root,'simple-bot/simple-tactics-ai'));
const {PlayCardAction,PlayerType,SlotType}=
  require(path.join(root,'game/store/actions/play-card-action'));
const {ResolvePromptAction}=
  require(path.join(root,'game/store/actions/resolve-prompt-action'));
const {GamePhase}=require(path.join(root,'game/store/state/state'));

/**
 * Deliberately force one exact-hand counter to the verified source rank8
 * Garbotoxin setup. This is a tactical feasibility witness only.
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,events:object[],stage:number,initial:object|null,cleared:object|null}}
 */
function withRank8FieldBlowerReply(execute){
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const events=[];
  let stage=0,initial=null,cleared=null;
  const mark=(state,description,action)=>{
    events.push({stage,turn:state.turn,description,action:action.constructor.name});
    stage++;
    return action;
  };
  SimpleTacticsAi.prototype.decodeNextAction=function forcedFieldBlower(state){
    const p=state.players.find(player=>player.id===this.client.id);
    const pending=state.prompts.find(x=>x.result===undefined);
    if(p?.id!==202) return original.call(this,state);
    if(stage===0 && !pending && state.turn===8 &&
       state.activePlayer===1 && state.phase===GamePhase.PLAYER_TURN){
      const index=p.hand.cards.findIndex(c=>c.name==='Field Blower');
      assert.ok(index>=0,'Candidate lacks observed Field Blower');
      const target=state.players[0].bench.find(
        slot=>slot.getPokemonCard()?.name==='Garbodor');
      assert.ok(target && target.tools.some(t=>t.name==='Float Stone'));
      initial={hand:p.hand.cards.map(c=>c.fullName),
        equippedGarbodor:true,activeTools:p.active.tools.map(c=>c.name)};
      return mark(state,'Play Field Blower from genuine challenger hand',
        new PlayCardAction(p.id,index,
          {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    }
    if(stage===1 && pending?.constructor.name==='SelectOptionPrompt'){
      return mark(state,'Keep Sky Field, discard up to two Tools',
        new ResolvePromptAction(pending.id,1));
    }
    if(stage===2 && pending?.constructor.name==='ChoosePokemonPrompt'){
      const garbo=state.players[0].bench.find(
        slot=>slot.getPokemonCard()?.name==='Garbodor');
      assert.ok(garbo && garbo.tools.some(c=>c.name==='Float Stone'));
      assert.equal(pending.validate([garbo],state),true);
      return mark(state,'Select opposing Float Stone Garbodor',
        new ResolvePromptAction(pending.id,[garbo]));
    }
    if(stage===3 && !pending && state.turn===8 &&
        state.phase===GamePhase.PLAYER_TURN){
      const garbo=state.players[0].bench.find(
        slot=>slot.getPokemonCard()?.name==='Garbodor');
      assert.ok(garbo);
      assert.equal(garbo.tools.length,0,'Targeted opponent Tool survived');
      cleared={sourcePokemon:garbo.getPokemonCard().name,
        remainingTools:garbo.tools.map(c=>c.name),
        candidateHand:p.hand.cards.map(c=>c.fullName),
        sourceDiscard:state.players[0].discard.cards.map(c=>c.name)};
      stage=4;
    }
    return original.call(this,state);
  };
  try{return {result:execute(),events,stage,initial,cleared};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=original;}
}
module.exports={withRank8FieldBlowerReply};
