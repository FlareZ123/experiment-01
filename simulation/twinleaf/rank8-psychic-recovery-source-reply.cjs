'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {SimpleTacticsAi}=require(path.join(root,'simple-bot/simple-tactics-ai'));
const {PlayCardAction,PlayerType,SlotType}=
  require(path.join(root,'game/store/actions/play-card-action'));
const {ResolvePromptAction}=
  require(path.join(root,'game/store/actions/resolve-prompt-action'));
const {UseAbilityAction}=
  require(path.join(root,'game/store/actions/game-actions'));
const {GamePhase}=require(path.join(root,'game/store/state/state');

/**
 * Following a real Field Blower reply, use a source-hand Battle Compressor and
 * Night Stretcher to recover a Basic Psychic Energy, then Underworld Door.
 * Searches read only their presented Store prompts.
 * @template T
 * @param {()=>T} execute
 * @returns {{result:T,events:object[],stage:number,witness:object|null}}
 */
function withRank8PsychicRecoveryReply(execute){
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const events=[];
  let stage=0,witness=null;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const mark=(state,detail,action)=>{
    events.push({stage,turn:state.turn,detail,action:action.constructor.name});
    stage++;
    return action;
  };
  const play=(p,name)=>{
    const index=p.hand.cards.findIndex(card=>card.name===name);
    assert.ok(index>=0,'Missing actual challenger card '+name);
    return new PlayCardAction(p.id,index,board);
  };
  SimpleTacticsAi.prototype.decodeNextAction=function forceRecovery(state){
    const p=state.players.find(x=>x.id===this.client.id);
    const pending=state.prompts.find(x=>x.result===undefined);
    if(p?.id!==202) return original.call(this,state);
    if(stage===0 && state.turn===8 && state.activePlayer===1 &&
       state.phase===GamePhase.PLAYER_TURN && !pending &&
       p.discard.cards.some(c=>c.name==='Field Blower') &&
       !p.hand.cards.some(c=>c.name==='Field Blower')){
      const garbo=state.players[0].bench.find(slot=>slot.getPokemonCard()?.name==='Garbodor');
      assert.ok(garbo && garbo.tools.length===0);
      return mark(state,'Search actual deck with Battle Compressor',play(p,'Battle Compressor'));
    }
    if(stage===0) return original.call(this,state);
    if(stage===1 && pending?.constructor.name==='ChooseCardsPrompt'){
      const energy=pending.cards.cards.find(card=>card.name==='Psychic Energy');
      assert.ok(energy,'No Psychic Energy in actual searched deck');
      assert.equal(pending.validate([energy]),true);
      return mark(state,'Send one Basic Psychic Energy from searched deck to discard',
        new ResolvePromptAction(pending.id,[energy]));
    }
    if(stage===2 && !pending && state.turn===8 &&
        state.phase===GamePhase.PLAYER_TURN){
      return mark(state,'Play source-held Night Stretcher',play(p,'Night Stretcher'));
    }
    if(stage===3 && pending?.constructor.name==='ChooseCardsPrompt'){
      const energy=pending.cards.cards.find(card=>card.name==='Psychic Energy');
      assert.ok(energy);
      assert.equal(pending.validate([energy]),true);
      return mark(state,'Recover exact Basic Psychic Energy from discard',
        new ResolvePromptAction(pending.id,[energy]));
    }
    if(stage===4 && !pending && state.turn===8 &&
        state.phase===GamePhase.PLAYER_TURN){
      assert.ok(p.hand.cards.some(card=>card.name==='Psychic Energy'));
      assert.equal(p.active.getPokemonCard()?.name,'Shadow Rider Calyrex VMAX');
      return mark(state,'Use Hooded Active Underworld Door',
        new UseAbilityAction(p.id,'Underworld Door',
          {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}));
    }
    if(stage===5 && pending?.constructor.name==='AttachEnergyPrompt'){
      const psychic=pending.cardList.cards.find(card=>card.name==='Psychic Energy');
      const index=p.bench.findIndex(slot=>slot.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX');
      assert.ok(psychic && index>=0);
      const assign=[{card:psychic,to:{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index}}];
      assert.equal(pending.validate(assign),true);
      return mark(state,'Attach recovered Psychic to Bench VMAX and draw two',
        new ResolvePromptAction(pending.id,assign));
    }
    if(stage===6 && !pending && state.turn===8 &&
        state.phase===GamePhase.PLAYER_TURN){
      const target=p.bench.find(slot=>slot.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX');
      assert.ok(target?.energies.cards.some(card=>card.name==='Psychic Energy'));
      witness={turn:state.turn,source:'Active Shadow Rider Calyrex VMAX',
        benchTarget:target.getPokemonCard().name,
        attachedPsychic:target.energies.cards.filter(c=>c.name==='Psychic Energy').length,
        candidateHand:p.hand.cards.map(card=>card.fullName),
        underworldDoorDeclared:true};
      stage=7;
    }
    return original.call(this,state);
  };
  try{return {result:execute(),events,stage,witness};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=original;}
}
module.exports={withRank8PsychicRecoveryReply};