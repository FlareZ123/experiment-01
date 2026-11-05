'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {nativeSinglePokemonChoices}=
  require('./agent8-actor-only-choose-pokemon.cjs');
const native=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));

/**
 * Original rank3 source seat0 reciprocal Guzma against rank1 seat1.
 * Reads source own hand, public boards and the owner's pending prompts.
 * @template T
 * @param {()=>T} work
 * @param {object} [deps] Native dependency injection for pure regression tests.
 * @returns {{result:T,audit:object}}
 */
function withRank3SourceGuzmaReply(work,deps={}){
  const {SimpleTacticsAi}=deps.ai??native('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    deps.play??native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    deps.prompt??native('game/store/actions/resolve-prompt-action');
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const audit={roots:0,opposingChoices:0,ownChoices:0,receipts:[]};
  let selected=false;
  const decoder=function(state,...args){
    const owner=state.players[0];
    const pending=state.prompts.find(p=>p.result===undefined);
    if(selected&&state.turn===16&&pending?.constructor.name==='ChoosePokemonPrompt'&&
       pending.playerId===owner.id){
      const eligible=(deps.choices??nativeSinglePokemonChoices)(state,pending);
      const opp=eligible.filter(c=>c.seat===1&&c.zone==='bench');
      const own=eligible.filter(c=>c.seat===0&&c.zone==='bench');
      let chosen=null,side='';
      if(opp.length&&!own.length){
        chosen=opp.find(c=>c.physical.getPokemonCard()?.name==='Dialga-GX')||opp[0];
        side='opponent';
      }else if(own.length&&!opp.length){
        chosen=own.find(c=>c.physical.getPokemonCard()?.fullName==='Bunnelby PRC');
        side='own';
      }
      if(chosen){
        assert.equal(pending.validate([chosen.physical],state),true);
        if(side==='own')audit.ownChoices++;
        else audit.opposingChoices++;
        audit.receipts.push({turn:state.turn,side,
          printing:chosen.physical.getPokemonCard()?.fullName,
          legalOptions:eligible.length,promptId:pending.id});
        return new ResolvePromptAction(pending.id,[chosen.physical]);
      }
    }
    if(!selected&&!pending&&state.activePlayer===0&&state.turn===16&&
       owner.active.getPokemonCard()?.fullName==='Snorlax PGO'&&
       owner.bench.some(p=>p.getPokemonCard()?.fullName==='Bunnelby PRC'&&
         p.energies.cards.length>0)&&
       state.players[1].bench.some(p=>Boolean(p.getPokemonCard()))&&
       owner.supporterTurn===0&&!owner.cannotPlaySupporterCards){
      const i=owner.hand.cards.findIndex(c=>c.fullName==='Guzma BUS');
      if(i>=0){
        selected=true;
        audit.roots++;
        audit.receipts.push({turn:16,ownerHandIndex:i,
          card:owner.hand.cards[i].fullName,
          ownerSupporterTurn:owner.supporterTurn,
          ownerCannotPlaySupporterCards:owner.cannotPlaySupporterCards});
        return new PlayCardAction(owner.id,i,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        });
      }
    }
    return previous.call(this,state,...args);
  };
  SimpleTacticsAi.prototype.decodeNextAction=decoder;
  try{return {result:work(),audit};}
  finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,decoder);
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}
module.exports={withRank3SourceGuzmaReply};
