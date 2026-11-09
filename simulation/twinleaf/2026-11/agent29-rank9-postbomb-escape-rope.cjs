'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent29-rank9-owner-postbomb-escape-rope-v12';
const ELECTRODE='Electrode-GX CES';
const MEGA='Mega Absol ex M1L';
const ROPE='Escape Rope BST';

/**
 * Source-only proposal after a real prior Electrode self-KO. Every input is
 * owner-hand or face-up board/Prize-count information. Native Store acceptance,
 * opponent choice, and owner prompt settlement are separate requirements.
 * @param {object} state Actual pinned native GameState.
 * @param {0|1} sourceSeat Original rank9 source physical seat.
 * @returns {{handIndex:number,megaBenchIndex:number}|null}
 */
function choosePostBombRope(state,sourceSeat){
  const owner=state.players?.[sourceSeat],opponent=state.players?.[1-sourceSeat];
  if(!owner||!opponent||owner.cannotPlayItemCards===true||
     state.activePlayer!==sourceSeat||
     state.prompts?.some(p=>p.result===undefined)||
     opponent.getPrizeLeft()>4||opponent.getPrizeLeft()<=0||
     owner.discard?.cards?.some(c=>c.fullName===ELECTRODE)!==true||
     owner.active?.getPokemonCard()?.fullName===MEGA||
     !opponent.bench?.some(b=>b.getPokemonCard())||
     !Array.isArray(owner.hand?.cards))return null;
  const handIndex=owner.hand.cards.findIndex(c=>c.fullName===ROPE);
  if(handIndex<0)return null;
  const megaBenchIndex=owner.bench.findIndex(b=>
    b.getPokemonCard()?.fullName===MEGA&&
    b.energies.cards.length>=3);
  if(megaBenchIndex<0)return null;
  return {handIndex,megaBenchIndex};
}


/**
 * Opponent-owner public Bench survival choice at the opponent's own Escape
 * Rope switch prompt. This deliberately maximizes printed remaining HP.
 * It is a stress-policy hypothesis, not a claim about optimal opponent play.
 * @param {object} state Native state containing public Pokémon slots.
 * @param {0|1} sourceSeat Registered original rank9 source physical seat.
 * @param {object} prompt Exact native opponent switch prompt.
 * @returns {{slot:object,benchIndex:number,printing:string,remainingHp:number}|null}
 */
function chooseOpponentRopeSurvival(state,sourceSeat,prompt){
  const opponent=state.players?.[1-sourceSeat];
  if(!opponent||prompt?.playerId!==opponent.id||
     !Array.isArray(opponent.bench))return null;
  const eligible=[];
  for(const [benchIndex,slot] of opponent.bench.entries()){
    const pokemon=slot.getPokemonCard?.();
    if(!pokemon||!Number.isSafeInteger(pokemon.hp)||
       !Number.isSafeInteger(slot.damage)||
       !prompt.validate([slot],state))continue;
    eligible.push({slot,benchIndex,printing:pokemon.fullName,
      remainingHp:pokemon.hp-slot.damage});
  }
  eligible.sort((a,b)=>b.remainingHp-a.remainingHp||
    a.benchIndex-b.benchIndex);
  return eligible[0]??null;
}

/**
 * Default-off original-source native mobility intervention. It only replaces
 * a real source Pass after the v10 paid self-KO and has no target-turn override.
 * Opponent Escape Rope prompts follow the unmodified native policy.
 * @template T
 * @param {()=>T} play Genuine registered native source game.
 * @param {0|1} sourceSeat The original rank9 physical seat.
 * @param {object} deps Optional pinned types for pure contract tests.
 * @returns {{result:T,audit:object}}
 */
function withPostBombOwnerRope(play,sourceSeat,deps={}){
  assert.equal(typeof play,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const output=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
  const native=name=>require(path.join(output,name));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const GamePhase=deps.GamePhase??native('game/store/state/state').GamePhase;
  const GameMessage=deps.GameMessage??native('game/game-message').GameMessage;
  const {PlayCardAction,PlayerType,SlotType}=deps.playActions??
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=deps.promptActions??
    native('game/store/actions/resolve-prompt-action');
  const aiPrior=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const storePrior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof aiPrior?.value,'function');
  assert.equal(typeof storePrior?.value,'function');
  let realStore=null;
  const usedStores=new WeakSet();
  const proposals=new WeakMap(),ownChoices=new WeakMap();
  const audit={version:VERSION,sourceSeat,sourceOnly:true,
    originalSourceOpportunityPasses:0,eligiblePasses:0,
    proposedRopes:0,acceptedRopes:0,rejectedRopes:0,
    ownerSwitchPromptsChosen:0,ownerSwitchPromptsAccepted:0,
    ownerSwitchPromptsRejected:0,
    firstRope:null,ropes:[],ownerPromotedMega:false,
    opposingSwitchChoiceNeverOverridden:deps.defensiveOpponentChoice!==true,
    adversarialOpponentSurvivalOptIn:deps.defensiveOpponentChoice===true,
    adversarialOpponentPromptChoices:[],
    competitiveQualifiedGames:0};

  function ai(state,...args){
    const owner=state.players?.[sourceSeat];
    const opponent=state.players?.[1-sourceSeat];
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(deps.defensiveOpponentChoice===true&&
       state===realStore?.state&&
       state.phase===GamePhase.PLAYER_TURN&&
       state.activePlayer===sourceSeat&&
       usedStores.has(realStore)&&
       opponent?.id===this.client?.id&&
       pending?.constructor?.name==='ChoosePokemonPrompt'&&
       pending.playerId===opponent.id&&
       pending.message===GameMessage.CHOOSE_POKEMON_TO_SWITCH&&
       pending.slots?.includes(SlotType.BENCH)){
      const answer=chooseOpponentRopeSurvival(state,sourceSeat,pending);
      if(answer){
        const choice=new ResolvePromptAction(pending.id,[answer.slot]);
        ownChoices.set(choice,{promptId:pending.id,
          ownerSeat:1-sourceSeat,opponentDefense:true,
          printing:answer.printing,remainingHp:answer.remainingHp,
          turn:state.turn});
        audit.adversarialOpponentPromptChoices.push({
          turn:state.turn,actorSeat:1-sourceSeat,
          printing:answer.printing,remainingHp:answer.remainingHp,
          benchIndex:answer.benchIndex,outcome:'proposed'});
        return choice;
      }
    }
    if(state!==realStore?.state||state.phase!==GamePhase.PLAYER_TURN||
       state.activePlayer!==sourceSeat||
       owner?.id!==this.client?.id)
      return aiPrior.value.call(this,state,...args);
    if(usedStores.has(realStore)&&pending?.constructor?.name==='ChoosePokemonPrompt'&&
       pending.playerId===owner.id&&
       pending.message===GameMessage.CHOOSE_POKEMON_TO_SWITCH&&
       pending.slots?.includes(SlotType.BENCH)){
      const target=owner.bench.find(b=>b.getPokemonCard()?.fullName===MEGA);
      if(target&&pending.validate([target],state)){
        const choice=new ResolvePromptAction(pending.id,[target]);
        ownChoices.set(choice,{promptId:pending.id,
          turn:state.turn,ownerSeat:sourceSeat});
        audit.ownerSwitchPromptsChosen++;
        return choice;
      }
    }
    const prior=aiPrior.value.call(this,state,...args);
    if(prior?.constructor?.name!=='PassTurnAction'||pending||
       usedStores.has(realStore))return prior;
    audit.originalSourceOpportunityPasses++;
    const picked=choosePostBombRope(state,sourceSeat);
    if(!picked)return prior;
    audit.eligiblePasses++;
    const action=new PlayCardAction(owner.id,picked.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    proposals.set(action,{turn:state.turn,sourceSeat,
      handIndex:picked.handIndex,megaBenchIndex:picked.megaBenchIndex});
    audit.proposedRopes++;
    return action;
  }

  function dispatch(action,...args){
    const proposed=proposals.get(action),ownChoice=ownChoices.get(action);
    try{
      const result=storePrior.value.call(this,action,...args);
      if(action?.constructor?.name==='AddPlayerAction')
        realStore=this;
      if(proposed&&this===realStore){
        usedStores.add(this);
        audit.acceptedRopes++;
        const event={...proposed,rootActionName:action.constructor.name,
          ownerActiveAfter:this.state.players[sourceSeat].active
            .getPokemonCard()?.fullName??null};
        audit.ropes.push(event);
        audit.firstRope??=event;
      }
      if(ownChoice&&this===realStore){
        if(ownChoice.opponentDefense===true){
          const auditRow=audit.adversarialOpponentPromptChoices
            .findLast(x=>x.outcome==='proposed'&&x.turn===ownChoice.turn);
          if(auditRow)auditRow.outcome='native-accepted';
        }else{
          audit.ownerSwitchPromptsAccepted++;
          audit.ownerPromotedMega=
            this.state.players[sourceSeat].active.getPokemonCard()?.fullName===MEGA;
        }
      }
      return result;
    }catch(error){
      if(proposed)audit.rejectedRopes++;
      if(ownChoice){
        if(ownChoice.opponentDefense===true){
          const auditRow=audit.adversarialOpponentPromptChoices
            .findLast(x=>x.outcome==='proposed'&&x.turn===ownChoice.turn);
          if(auditRow)auditRow.outcome='native-rejected';
        }else audit.ownerSwitchPromptsRejected++;
      }
      if(error&&typeof error==='object')error.agent29RopeAudit=audit;
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...aiPrior,value:ai});
  Object.defineProperty(Store.prototype,'dispatch',
    {...storePrior,value:dispatch});
  try{return {result:play(),audit};}
  finally{
    Object.defineProperty(Store.prototype,'dispatch',storePrior);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',aiPrior);
  }
}

module.exports={VERSION,ELECTRODE,MEGA,ROPE,
  choosePostBombRope,chooseOpponentRopeSurvival,withPostBombOwnerRope};
