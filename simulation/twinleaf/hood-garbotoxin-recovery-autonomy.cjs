'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const {hasHoodedDoorWindow} = require('./rank8-hooded-door-source-reply.cjs');

/** @param {string} suffix */
const engine = suffix => require(path.join(output,suffix));

/**
 * An own-hand/public-board candidate response to an opponent's equipped
 * Garbodor while the player's Active VMAX has Stealthy Hood. The trigger
 * and all subsequent choices use the player's own legal Store prompts.
 * Unlike the diagnostic source fork, there is no seed, rank, or turn trigger.
 *
 * The policy only demonstrates one possible conditional line, and does
 * not evaluate its strategic opportunity costs.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withHoodGarbotoxinRecoveryAutonomy(candidateSeat,execute) {
  if (![0,1].includes(candidateSeat) || typeof execute !== 'function') {
    throw new TypeError('Requires candidate physical seat and synchronous runner');
  }
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {UseAbilityAction}=engine('game/store/actions/game-actions');
  const {GamePhase}=engine('game/store/state/state');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const ownId=candidateSeat===0?101:202;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  let phase='idle';
  let attempted=false;
  let selectedEnergy=null;
  let beforeDoor=null;
  const events=[];
  /** @param {object} own @param {string} name */
  const play=(own,name)=>{
    const index=own.hand.cards.findIndex(card=>card.name===name);
    if(index<0)return null;
    return new PlayCardAction(own.id,index,board);
  };
  /** @param {object} state @param {string} step @param {object} action */
  const selected=(state,step,action)=>{
    events.push({turn:state.turn,kind:'selected-action',step,
      action:action.constructor.name});
    return action;
  };
  /** @param {object} state @param {string} reason */
  const abort=(state,reason)=>{
    events.push({turn:state.turn,kind:'opportunity-aborted',reason});
    phase='done';
  };
  function choose(state) {
    const own=state.players.find(player=>player.id===this.client?.id);
    if(own?.id!==ownId)return original.call(this,state);
    const opponent=state.players[1-candidateSeat];
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if(phase==='idle' && !attempted &&
        state.activePlayer===candidateSeat &&
        state.phase===GamePhase.PLAYER_TURN && !pending &&
        hasHoodedDoorWindow(own,opponent)) {
      const action=play(own,'Battle Compressor');
      if(action && this.isValidAction(state,action)) {
        attempted=true;
        phase='compressor-choice';
        events.push({turn:state.turn,kind:'eligible-own-state',
          handPrintings:own.hand.cards.map(card=>card.fullName),
          activeHoodPrintings:own.active.tools.map(card=>card.fullName),
          opposingGarbodorTools:opponent.bench.flatMap(slot=>
            slot.getPokemonCard()?.name==='Garbodor'?
              slot.tools.map(card=>card.fullName):[])});
        return selected(state,'Battle Compressor from hand',action);
      }
      events.push({turn:state.turn,kind:'play-rejected-by-legality-filter',
        card:'Battle Compressor'});
    }
    if(phase==='compressor-choice') {
      if(pending?.constructor.name==='ChooseCardsPrompt' &&
          pending.playerId===own.id) {
        const energy=pending.cards.cards.find(card=>card.name==='Psychic Energy');
        if(energy && pending.validate([energy])) {
          selectedEnergy=energy.fullName;
          phase='stretcher';
          return selected(state,'Discard Psychic Energy through deck search',
            new ResolvePromptAction(pending.id,[energy]));
        }
        abort(state,'No legal Psychic discard candidate in real search');
      }
      if(!pending && phase==='compressor-choice') {
        abort(state,'Battle Compressor did not present card-choice prompt');
      }
    }
    if(phase==='stretcher' && !pending) {
      const action=play(own,'Night Stretcher');
      if(action && this.isValidAction(state,action)) {
        phase='stretcher-choice';
        return selected(state,'Night Stretcher from hand',action);
      }
      abort(state,'Night Stretcher no longer legal');
    }
    if(phase==='stretcher-choice') {
      if(pending?.constructor.name==='ChooseCardsPrompt' &&
          pending.playerId===own.id) {
        const energy=pending.cards.cards.find(card=>
          card.name==='Psychic Energy');
        if(energy && pending.validate([energy])) {
          phase='door';
          return selected(state,'Recover Psychic Energy through discard prompt',
            new ResolvePromptAction(pending.id,[energy]));
        }
        abort(state,'No legal Psychic recovery selection');
      }
      if(!pending && phase==='stretcher-choice') {
        abort(state,'Night Stretcher did not present card-choice prompt');
      }
    }
    if(phase==='door' && !pending) {
      const hood=own.active.tools.some(card=>card.name==='Stealthy Hood');
      const lock=opponent.bench.some(slot=>
        slot.getPokemonCard()?.name==='Garbodor'&&slot.tools.length>0);
      const energy=own.hand.cards.some(card=>card.name==='Psychic Energy');
      if(hood && lock && energy) {
        const action=new UseAbilityAction(own.id,'Underworld Door',{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
        });
        if(this.isValidAction(state,action)) {
          const bench=own.bench.find(slot=>
            slot.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX');
          if(bench) {
            beforeDoor={hand:own.hand.cards.length,
              deck:own.deck.cards.length,
              benchPsychic:bench.energies.cards.filter(card=>
                card.name==='Psychic Energy').length};
            phase='attach';
            return selected(state,'Hooded Active Underworld Door under Garbotoxin',
              action);
          }
        }
      }
      abort(state,'Protected Door action unpayable after recovery');
    }
    if(phase==='attach') {
      if(pending?.constructor.name==='AttachEnergyPrompt' &&
          pending.playerId===own.id) {
        const energy=pending.cardList.cards.find(card=>
          card.name==='Psychic Energy');
        const index=own.bench.findIndex(slot=>
          slot.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX');
        if(energy && index>=0) {
          const assignment=[{card:energy,to:{
            player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
          }}];
          if(pending.validate(assignment)) {
            phase='verify';
            return selected(state,'Attach recovered Psychic to Benched VMAX',
              new ResolvePromptAction(pending.id,assignment));
          }
        }
        abort(state,'No valid Psychic attachment target in own prompt');
      }
      if(!pending && phase==='attach')abort(state,'Underworld Door prompt missing');
    }
    if(phase==='verify' && !pending) {
      const bench=own.bench.find(slot=>
        slot.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX');
      const attached=bench?.energies.cards.filter(card=>
        card.name==='Psychic Energy').length === beforeDoor.benchPsychic+1;
      const drawn=own.deck.cards.length===beforeDoor.deck-2;
      const retained=own.hand.cards.some(card=>card.name==='Field Blower');
      const stillEquipped=opponent.bench.some(slot=>
        slot.getPokemonCard()?.name==='Garbodor'&&slot.tools.length>0);
      events.push({turn:state.turn,kind:'completed-source-effect',
        attached,drawnTwo:drawn,retainedFieldBlower:retained,
        garbodorStillEquipped:stillEquipped,
        recoveredEnergy: selectedEnergy});
      phase='done';
    }
    return original.call(this,state);
  }
  SimpleTacticsAi.prototype.decodeNextAction=choose;
  try {
    const result=execute();
    return {result,policyAudit:{
      version:'hood-garbotoxin-recovery-autonomous-v1',
      candidateSeat,opponentSeat:1-candidateSeat,
      triggered:attempted,phaseAtEnd:phase,
      successfulEffect:events.some(event=>
        event.kind==='completed-source-effect'&&event.attached&&
        event.drawnTwo&&event.retainedFieldBlower&&
        event.garbodorStillEquipped),
      events,qualifiedForCompetitiveInference:false
    }};
  } finally {
    if(SimpleTacticsAi.prototype.decodeNextAction!==choose) {
      throw Error('Autonomous Hood policy lost prototype ownership');
    }
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={withHoodGarbotoxinRecoveryAutonomy};
