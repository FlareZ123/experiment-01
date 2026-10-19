'use strict';
const path=require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * A source-locked owner/public-board opportunity to answer Hood. The source
 * knows its own hand and the opposing public Bench, but has no right to inspect
 * its opponent's hand, original Prize configuration or future draws.
 *
 * @param {object} state Original live Store State.
 * @param {object} source Source rank6 player.
 * @param {object} opponent Public opposing board.
 * @param {0|1} sourceSeat Physical source seat.
 * @param {number} playerTurnPhase Pinned compiled GamePhase.PLAYER_TURN.
 * @returns {{card:string,targets:Array<{index:number,pokemon:string,tool:string}>}|null}
 */
function sourceRemovalOpportunity(state,source,opponent,sourceSeat,playerTurnPhase){
  if(state.phase!==playerTurnPhase || state.activePlayer!==sourceSeat ||
    state.prompts.some(prompt=>prompt.result===undefined) ||
    source.active.getPokemonCard()?.name!=='Iron Thorns ex')return null;
  const targets=opponent.bench.flatMap((zone,index)=>{
    const name=zone.getPokemonCard()?.name;
    if(!['Shadow Rider Calyrex V','Shadow Rider Calyrex VMAX'].includes(name)){
      return [];
    }
    return zone.tools.filter(tool=>tool.name==='Stealthy Hood')
      .map(tool=>({index,pokemon:zone.getPokemonCard().fullName,tool:tool.fullName}));
  });
  if(targets.length===0)return null;
  const held=source.hand.cards.map(card=>card.name);
  const card=held.includes('Megaton Blower')?'Megaton Blower':
    held.includes('Faba')?'Faba':null;
  return card?{card,targets}:null;
}

/**
 * One opt-in, original-root source-owner counterfactual, with the printed
 * source Item preferred to the Supporter. Pending effect prompts are
 * resolved by the original pinned policy, with no forced target selection.
 *
 * @template T
 * @param {0|1} sourceSeat
 * @param {()=>T} execute
 * @param {{targetHoodWithFaba?:boolean}} [options] Opt-in owner-visible Faba prompt policy.
 * @returns {{result:T,policyAudit:object}}
 */
function withRank6HoodRemoval(sourceSeat,execute,{targetHoodWithFaba=false}={}){
  if(![0,1].includes(sourceSeat)||typeof execute!=='function'){
    throw new TypeError('Require source physical seat and synchronous runner');
  }
  const load=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {GamePhase}=load('game/store/state/state');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {sourceFabaHoodPromptChoice}=require('./rank6-faba-hood-target.cjs');
  const prior=SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId=sourceSeat===0?101:202;
  const events=[];
  let selected=false;
  let fabaStage=null;
  let fabaTargetZone=null;
  function choose(state){
    const own=state.players.find(side=>side.id===this.client?.id);
    if(own?.id!==sourceId)return prior.call(this,state);
    const opponent=state.players[1-sourceSeat];
    if(targetHoodWithFaba && fabaStage && fabaStage!=='done'){
      const prompt=state.prompts.find(row=>
        row.playerId===own.id&&row.result===undefined);
      if(prompt){
        const decision=sourceFabaHoodPromptChoice({
          state,source:own,opponent,prompt,stage:fabaStage,
          targetZone:fabaTargetZone
        });
        if(decision){
          const action=new ResolvePromptAction(prompt.id,decision.result);
          fabaStage=decision.nextStage;
          fabaTargetZone=decision.targetZone;
          events.push({kind:'selected-source-faba-prompt',
            turn:state.turn,choice:decision.kind,stageAfter:fabaStage,
            targetPokemon:fabaTargetZone?.getPokemonCard()?.fullName??null});
          return action;
        }
      }else if(fabaStage==='tool'){
        // A singly tooled target resolves directly after choosing Pokemon.
        fabaStage='done';
      }
    }
    if(selected)return prior.call(this,state);
    const opportunity=sourceRemovalOpportunity(state,own,opponent,
      sourceSeat,GamePhase.PLAYER_TURN);
    if(!opportunity)return prior.call(this,state);
    const index=own.hand.cards.findIndex(card=>card.name===opportunity.card);
    const action=new PlayCardAction(own.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    if(!this.isValidAction(state,action)){
      events.push({kind:'pinned-source-play-rejected',turn:state.turn,
        proposedCard:opportunity.card,visibleTargets:opportunity.targets});
      return prior.call(this,state);
    }
    selected=true;
    if(targetHoodWithFaba&&opportunity.card==='Faba')fabaStage='choice';
    events.push({kind:'selected-source-play',turn:state.turn,
      card:own.hand.cards[index].fullName,visibleTargets:opportunity.targets,
      sourceActive:own.active.getPokemonCard()?.fullName,
      candidateActive:opponent.active.getPokemonCard()?.fullName});
    return action;
  }
  SimpleTacticsAi.prototype.decodeNextAction=choose;
  try{
    const result=execute();
    return {result,policyAudit:{
      version:targetHoodWithFaba?
        'rank6-owner-public-hood-removal-faba-target-v2':
        'rank6-owner-public-hood-removal-v1',
      sourceSeat,selected,targetHoodWithFaba,fabaStage,events,
      qualifiedCompetitiveGames:0
    }};
  }finally{
    if(SimpleTacticsAi.prototype.decodeNextAction!==choose){
      throw new Error('Rank6 removal wrapper lost its prototype');
    }
    SimpleTacticsAi.prototype.decodeNextAction=prior;
  }
}
module.exports={sourceRemovalOpportunity,withRank6HoodRemoval};
