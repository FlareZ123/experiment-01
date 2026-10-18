'use strict';

const path = require('node:path');
const {freeBenchIndex} = require('./rank11-direct-opportunity.cjs');
const {heldSealOpportunity, SOURCE_V} =
  require('./rank11-held-seal-opportunity.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

/**
 * Opt-in owner-information-constrained Forest Seal Stone -> Boost Shake
 * source-opponent policy. Only real own-deck prompts reveal hidden targets.
 * Restores the pinned bot after the synchronous research game.
 *
 * @template T
 * @param {0|1} sourceSeat Source physical seat.
 * @param {()=>T} execute Authentically deal and run one game.
 * @returns {{result:T,policyAudit:object}}
 */
function withRank11HeldSeal(sourceSeat, execute) {
  if (![0,1].includes(sourceSeat) || typeof execute !== 'function') {
    throw new TypeError('Need source physical seat and synchronous game function');
  }
  const load = name => require(path.join(OUTPUT,name));
  const {SimpleTacticsAi} = load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType} =
    load('game/store/actions/play-card-action');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {GamePhase} = load('game/store/state/state');
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = sourceSeat===0 ? 101 : 202;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  let line=null;
  let stepIndex=0;
  let aborted=null;
  let nextTurnWitness=null;
  const actions=[];

  /** @param {object} player @param {string} name @param {object} target */
  function play(player,name,target) {
    const index=player.hand.cards.findIndex(card=>card.name===name);
    return index<0 ? null : new PlayCardAction(player.id,index,target);
  }
  /** @param {object} state @param {object} player @param {object} prompt @param {string} name */
  function selectOwnSearch(state,player,prompt,name) {
    if (prompt?.constructor.name!=='ChooseCardsPrompt' ||
        prompt.playerId!==player.id || prompt.cards!==player.deck) return null;
    const card=prompt.cards.cards.find(item=>item.name===name);
    return card && prompt.validate([card],state) ?
      new ResolvePromptAction(prompt.id,[card]) : null;
  }
  /** @param {object} player @param {object} desired */
  function currentV(player,desired) {
    return desired.slot==='active' ? player.active : player.bench[desired.index];
  }
  /** @param {object} player @param {string} tool */
  function tooledTrubbish(player,tool) {
    return player.bench.find(slot=>
      slot.getPokemonCard()?.name==='Trubbish' &&
      slot.tools.some(item=>item.name===tool));
  }
  /** @param {object} player @param {object} desired */
  function targetRef(player,desired) {
    const found=currentV(player,desired);
    if (!found || !SOURCE_V.has(found.getPokemonCard()?.name)) return null;
    return {player:PlayerType.BOTTOM_PLAYER,
      slot:desired.slot==='active' ? SlotType.ACTIVE : SlotType.BENCH,
      index:desired.index};
  }
  SimpleTacticsAi.prototype.decodeNextAction=function heldSeal(state) {
    const player=state.players.find(side=>side.id===this.client?.id);
    if (line && stepIndex===line.steps.length && !nextTurnWitness &&
        state.activePlayer!==sourceSeat && state.turn>line.turn) {
      const source=state.players[sourceSeat];
      nextTurnWitness={turn:state.turn,equippedGarbodor:
        source.bench.some(slot=>slot.getPokemonCard()?.name==='Garbodor' &&
          slot.tools.some(tool=>tool.name===line.tool))};
    }
    if (!player || player.id!==sourceId) return previous.call(this,state);
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if (!line && !pending && player.cannotPlayItemCards!==true) {
      const opening=heldSealOpportunity(state,player,sourceSeat,
        GamePhase.PLAYER_TURN,true);
      if (opening) {
        const prep=opening.route==='vip'?['vip','trubbish-search'] :
          opening.route==='hand'?['trubbish-hand']:[];
        line={...opening,turn:state.turn,steps:[...prep,'attach-v-seal',
          'star-alchemy','shake-search','attach-trubbish-tool',
          'boost-shake','garbodor-search','garbodor-target']};
      }
    }
    if (!line || aborted || stepIndex>=line.steps.length) {
      return previous.call(this,state);
    }
    if (state.turn!==line.turn) {
      aborted={turn:state.turn,step:line.steps[stepIndex],
        reason:'source turn ended before complete line'};
      return previous.call(this,state);
    }
    const step=line.steps[stepIndex];
    const expected=step.endsWith('-search') ? 'ChooseCardsPrompt' :
      step==='garbodor-target'?'ChoosePokemonPrompt':null;
    if ((pending?.constructor.name??null)!==expected) {
      return previous.call(this,state);
    }
    let action=null;
    if (step==='vip') action=play(player,'Battle VIP Pass',board);
    if (step==='trubbish-hand') {
      const index=freeBenchIndex(player);
      if (index>=0) action=play(player,'Trubbish',
        {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index});
    }
    if (step==='trubbish-search') {
      action=selectOwnSearch(state,player,pending,'Trubbish');
      if (action && !pending.cards.cards.some(card=>card.name==='Garbodor')) {
        aborted={turn:state.turn,step,reason:'K1 owner-search no Garbodor in deck'};
        return previous.call(this,state);
      }
    }
    if (step==='attach-v-seal') {
      const ref=targetRef(player,line.vTarget);
      const slot=currentV(player,line.vTarget);
      if (ref && slot.tools.length===0) action=play(player,'Forest Seal Stone',ref);
    }
    if (step==='star-alchemy') {
      const ref=targetRef(player,line.vTarget);
      const slot=currentV(player,line.vTarget);
      if (ref && !player.usedVSTAR &&
          slot.tools.some(tool=>tool.name==='Forest Seal Stone')) {
        action=new UseAbilityAction(player.id,'Star Alchemy',ref);
      }
    }
    if (step==='shake-search') {
      action=selectOwnSearch(state,player,pending,'Boost Shake');
    }
    if (step==='attach-trubbish-tool') {
      const index=player.bench.findIndex(slot=>
        slot.getPokemonCard()?.name==='Trubbish' && slot.tools.length===0);
      if (index>=0) action=play(player,line.tool,
        {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index});
    }
    if (step==='boost-shake' && tooledTrubbish(player,line.tool)) {
      action=play(player,'Boost Shake',board);
    }
    if (step==='garbodor-search') {
      action=selectOwnSearch(state,player,pending,'Garbodor');
    }
    if (step==='garbodor-target') {
      const slot=tooledTrubbish(player,line.tool);
      if (slot && pending?.validate([slot],state)) {
        action=new ResolvePromptAction(pending.id,[slot]);
      }
    }
    if (!action) {
      const ownsSearch=pending?.playerId===player.id && pending.cards===player.deck;
      aborted={turn:state.turn,step,reason:'owner-legal action or prompt target missing',
        prompt:pending?.constructor.name??null,
        ownSearch:ownsSearch,
        targetInOwnSearch:ownsSearch ?
          pending.cards.cards.some(card=>card.name===
            (step==='shake-search'?'Boost Shake':'Garbodor')):null};
      return previous.call(this,state);
    }
    actions.push({turn:state.turn,step,action:action.constructor.name});
    stepIndex++;
    return action;
  };
  try {
    const result=execute();
    return {result,policyAudit:{version:'rank11-held-seal-v1',sourceSeat,
      opportunityTurn:line?.turn??null,route:line?.route??null,
      selectedTrubbishTool:line?.tool??null,
      selectedV:line?.vTarget??null,selectedActions:actions,aborted,
      nextTurnLockWitness:nextTurnWitness,completed:!!line && !aborted &&
        stepIndex===line.steps.length && nextTurnWitness?.equippedGarbodor===true,
      paperMechanicsVerified:false,qualifiedForCompetitiveInference:false}};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

module.exports={withRank11HeldSeal};
