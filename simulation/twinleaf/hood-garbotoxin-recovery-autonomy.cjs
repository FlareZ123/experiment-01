'use strict';

const path = require('node:path');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const {
  liveGarbotoxinSlots,hasLiveGarbotoxin,
  canUseHoodedDoorUnderGarbotoxin,hasHoodedDoorRecoveryWindow,
  hoodedDoorRecoveryPlan,hasUnspentActiveUnderworldDoor
}=require('./hood-ability-lock-state.cjs');

/** @param {string} suffix */
const engine = suffix => require(path.join(output,suffix));

/**
 * Resolve the first concrete, owner-visible recovery entry and retain the
 * exact physical Energy identity. The three plans are ordered by least
 * resource expenditure: direct hand Energy, Night Stretcher from discard,
 * then Battle Compressor plus Night Stretcher from deck.
 *
 * @param {object} own Native acting player.
 * @returns {{plan:string,phase:string,energyCard:object|null}|null}
 */
function hoodedDoorRecoveryEntry(own) {
  const plan=hoodedDoorRecoveryPlan(own);
  if(plan==='direct') {
    const energyCard=own.hand.cards.find(card=>card.name==='Psychic Energy');
    return energyCard?{plan,phase:'door',energyCard}:null;
  }
  if(plan==='stretcher') {
    const energyCard=own.discard.cards.find(card=>card.name==='Psychic Energy');
    return energyCard?{plan,phase:'stretcher',energyCard}:null;
  }
  if(plan==='compressor-stretcher') {
    return {plan,phase:'compressor-choice',energyCard:null};
  }
  return null;
}

/**
 * Audit the exact physical Energy selected by the policy. Field Blower is
 * retained as telemetry only; it is not a prerequisite for Underworld Door.
 *
 * @param {object} args
 * @returns {object}
 */
function hoodedDoorEffectReceipt(args) {
  const {own,selectedEnergyCard,targetBenchIndex,deckBefore,
    markerSpent,garbotoxinStillLive}=args;
  const target=own?.bench?.[targetBenchIndex];
  const attached=!!selectedEnergyCard&&
    target?.energies?.cards?.includes(selectedEnergyCard)===true;
  const drawnTwo=Number.isSafeInteger(deckBefore)&&
    own?.deck?.cards?.length===deckBefore-2;
  const energyInHand=own?.hand?.cards?.includes(selectedEnergyCard)===true;
  const energyInDiscard=own?.discard?.cards?.includes(selectedEnergyCard)===true;
  const energyInDeck=own?.deck?.cards?.includes(selectedEnergyCard)===true;
  const energyInPrizes=(own?.prizes??[]).some(prize=>
    prize?.cards?.includes(selectedEnergyCard)===true);
  const physicalConserved=attached&&!energyInHand&&!energyInDiscard&&
    !energyInDeck&&!energyInPrizes;
  const fieldBlowerRetained=own?.hand?.cards?.some(card=>
    card.name==='Field Blower')===true;
  return {
    selectedEnergyPrinting:selectedEnergyCard?.fullName??null,
    attached,drawnTwo,markerSpent:markerSpent===true,
    garbotoxinStillLive:garbotoxinStillLive===true,
    energyInHand,energyInDiscard,energyInDeck,energyInPrizes,
    physicalConserved,fieldBlowerRetained,
    successfulEffect:physicalConserved&&drawnTwo&&markerSpent===true&&
      garbotoxinStillLive===true
  };
}

/**
 * An own-hand/public-board candidate response to live Garbotoxin from an
 * Active or Benched Garbodor with any Pokémon Tool while the player's Active
 * VMAX has Stealthy Hood. It fails closed when Active Tool Jammer, Jamming
 * Tower, or Path to the Peak suppresses the required Tool/Ability.
 *
 * The policy supports three owner-visible Energy routes, in preference order:
 * direct Psychic Energy from hand; Night Stretcher from discard; or Battle
 * Compressor followed by Night Stretcher when Energy remains in deck.
 *
 * This is a conditional recovery subpolicy, not a full-turn optimizer. It
 * attempts at most once per match; it does not schedule repeated recoveries
 * across several VMAX sources or evaluate strategic opportunity costs.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute
 * @param {object} [deps] Test seam for pinned engine constructors.
 * @returns {{result:T,policyAudit:object}}
 */
function withHoodGarbotoxinRecoveryAutonomy(candidateSeat,execute,deps={}) {
  if (![0,1].includes(candidateSeat) || typeof execute !== 'function') {
    throw new TypeError('Requires candidate physical seat and synchronous runner');
  }
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const actionTypes=deps.actionTypes??{
    ...engine('game/store/actions/play-card-action'),
    ...engine('game/store/actions/resolve-prompt-action'),
    ...engine('game/store/actions/game-actions')
  };
  const {PlayCardAction,PlayerType,SlotType,ResolvePromptAction,UseAbilityAction}=
    actionTypes;
  const GamePhase=deps.GamePhase??engine('game/store/state/state').GamePhase;
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const ownId=candidateSeat===0?101:202;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  let phase='idle';
  let phaseTurnKey=null;
  let recoveryPlan=null;
  let selectedEnergyCard=null;
  let beforeDoor=null;
  let activeAttempt=null;
  const attempts=[];
  const events=[];
  /** @param {object} own @param {string} name */
  const play=(own,name)=>{
    const index=own.hand.cards.findIndex(card=>card.name===name);
    if(index<0)return null;
    return new PlayCardAction(own.id,index,board);
  };
  /** @param {object} state @param {string} step @param {object} action */
  const selected=(state,step,action)=>{
    const event={turn:state.turn,kind:'selected-action',step,
      recoveryPlan,action:action.constructor.name,
      energy:selectedEnergyCard?.fullName??null};
    events.push(event);
    activeAttempt?.events.push(event);
    return action;
  };
  /** @param {object} state @param {string} reason */
  const abort=(state,reason)=>{
    const event={turn:state.turn,kind:'opportunity-aborted',reason,
      recoveryPlan,energy:selectedEnergyCard?.fullName??null};
    events.push(event);
    activeAttempt?.events.push(event);
    if(activeAttempt)activeAttempt.aborted=reason;
    phase='done';
  };
  function choose(state) {
    const turnKey=`${state.turn}:${state.activePlayer}`;
    if(phaseTurnKey!==null&&turnKey!==phaseTurnKey) {
      if(phase!=='done') {
        const reason='Recovery sequence crossed a turn boundary';
        const event={turn:state.turn,kind:'opportunity-aborted',reason,
          recoveryPlan,energy:selectedEnergyCard?.fullName??null};
        events.push(event);
        activeAttempt?.events.push(event);
        if(activeAttempt)activeAttempt.aborted=reason;
      }
      phase='idle';
      phaseTurnKey=null;
      recoveryPlan=null;
      selectedEnergyCard=null;
      beforeDoor=null;
      activeAttempt=null;
    }
    const own=state.players.find(player=>player.id===this.client?.id);
    if(own?.id!==ownId)return original.call(this,state);
    const opponent=state.players[1-candidateSeat];
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if(phase==='idle'&&phaseTurnKey!==turnKey&&
       state.activePlayer===candidateSeat&&
       state.phase===GamePhase.PLAYER_TURN&&!pending&&
       hasHoodedDoorRecoveryWindow(own,opponent,state)) {
      const entry=hoodedDoorRecoveryEntry(own);
      if(entry) {
        phaseTurnKey=turnKey;
        recoveryPlan=entry.plan;
        selectedEnergyCard=entry.energyCard;
        activeAttempt={turn:state.turn,candidateSeat,recoveryPlan,
          selectedEnergy:selectedEnergyCard?.fullName??null,
          successfulEffect:false,events:[]};
        attempts.push(activeAttempt);
        const event={turn:state.turn,kind:'eligible-own-state',
          recoveryPlan,handPrintings:own.hand.cards.map(card=>card.fullName),
          activeHoodPrintings:own.active.tools.map(card=>card.fullName),
          liveGarbotoxinSources:liveGarbotoxinSlots(opponent),
          selectedEnergy:selectedEnergyCard?.fullName??null};
        events.push(event);
        activeAttempt.events.push(event);
        if(entry.phase==='door') {
          phase='door';
        } else if(entry.phase==='stretcher') {
          phase='stretcher';
        } else if(entry.phase==='compressor-choice') {
          const action=play(own,'Battle Compressor');
          if(action&&this.isValidAction(state,action)) {
            phase='compressor-choice';
            return selected(state,'Battle Compressor from hand',action);
          }
          abort(state,'Battle Compressor no longer legal');
        }
      }
    }
    if(phase==='compressor-choice') {
      if(pending?.constructor.name==='ChooseCardsPrompt'&&
         pending.playerId===own.id&&pending.cards===own.deck) {
        const energy=pending.cards.cards.find(card=>
          card.name==='Psychic Energy'&&own.deck.cards.includes(card));
        if(energy&&pending.validate([energy])) {
          selectedEnergyCard=energy;
          if(activeAttempt)activeAttempt.selectedEnergy=energy.fullName;
          phase='stretcher';
          return selected(state,'Discard exact Psychic Energy through deck search',
            new ResolvePromptAction(pending.id,[energy]));
        }
        abort(state,'No legal Psychic discard candidate in real deck search');
      } else if(!pending) {
        abort(state,'Battle Compressor did not present its owner-deck prompt');
      }
    }
    if(phase==='stretcher'&&!pending) {
      if(!selectedEnergyCard||!own.discard.cards.includes(selectedEnergyCard)) {
        abort(state,'Selected Psychic Energy did not physically reach owner discard');
      } else {
        const action=play(own,'Night Stretcher');
        if(action&&this.isValidAction(state,action)) {
          phase='stretcher-choice';
          return selected(state,'Night Stretcher from hand',action);
        }
        abort(state,'Night Stretcher no longer legal');
      }
    }
    if(phase==='stretcher-choice') {
      if(pending?.constructor.name==='ChooseCardsPrompt'&&
         pending.playerId===own.id) {
        if(selectedEnergyCard&&own.discard.cards.includes(selectedEnergyCard)&&
           pending.cards?.cards?.includes(selectedEnergyCard)&&
           pending.validate([selectedEnergyCard])) {
          phase='door';
          return selected(state,'Recover the same Psychic Energy through discard prompt',
            new ResolvePromptAction(pending.id,[selectedEnergyCard]));
        }
        abort(state,'Night Stretcher prompt did not offer the exact selected Energy');
      } else if(!pending) {
        abort(state,'Night Stretcher did not present its owner-discard prompt');
      }
    }
    if(phase==='door'&&!pending) {
      const energyInHand=!!selectedEnergyCard&&
        own.hand.cards.includes(selectedEnergyCard);
      if(energyInHand&&canUseHoodedDoorUnderGarbotoxin(own,opponent,state)&&
         hasUnspentActiveUnderworldDoor(own)) {
        const action=new UseAbilityAction(own.id,'Underworld Door',{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
        });
        if(this.isValidAction(state,action)) {
          const benchIndex=own.bench.findIndex(slot=>
            slot.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX');
          if(benchIndex>=0) {
            beforeDoor={deck:own.deck.cards.length,benchIndex};
            phase='attach';
            return selected(state,'Hooded Active Underworld Door under Garbotoxin',
              action);
          }
        }
      }
      abort(state,'Protected Door action or exact Energy is no longer available');
    }
    if(phase==='attach') {
      if(pending?.constructor.name==='AttachEnergyPrompt'&&
         pending.playerId===own.id) {
        const index=beforeDoor?.benchIndex;
        if(selectedEnergyCard&&own.hand.cards.includes(selectedEnergyCard)&&
           pending.cardList?.cards?.includes(selectedEnergyCard)&&
           Number.isSafeInteger(index)&&index>=0&&own.bench[index]) {
          const assignment=[{card:selectedEnergyCard,to:{
            player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
          }}];
          if(pending.validate(assignment)) {
            phase='verify';
            return selected(state,'Attach exact recovered Psychic to Benched VMAX',
              new ResolvePromptAction(pending.id,assignment));
          }
        }
        abort(state,'Underworld Door prompt lacks the exact Energy/own VMAX target');
      } else if(!pending) {
        abort(state,'Underworld Door attachment prompt missing');
      }
    }
    if(phase==='verify'&&!pending) {
      const receipt=hoodedDoorEffectReceipt({
        own,selectedEnergyCard,targetBenchIndex:beforeDoor?.benchIndex,
        deckBefore:beforeDoor?.deck,
        markerSpent:!hasUnspentActiveUnderworldDoor(own),
        garbotoxinStillLive:hasLiveGarbotoxin(opponent)
      });
      const event={turn:state.turn,kind:'completed-source-effect',
        recoveryPlan,...receipt};
      events.push(event);
      activeAttempt?.events.push(event);
      if(activeAttempt) {
        activeAttempt.receipt=receipt;
        activeAttempt.successfulEffect=receipt.successfulEffect;
      }
      phase='done';
    }
    return original.call(this,state);
  }
  SimpleTacticsAi.prototype.decodeNextAction=choose;
  try {
    const result=execute();
    return {result,policyAudit:{
      version:'hood-garbotoxin-recovery-autonomy-v4-repeatable-own-turn',
      candidateSeat,opponentSeat:1-candidateSeat,
      recoveryPlan,selectedEnergy:selectedEnergyCard?.fullName??null,
      triggered:attempts.length>0,attemptCount:attempts.length,
      successfulEffect:attempts.some(attempt=>attempt.successfulEffect),
      successfulEffectCount:attempts.filter(attempt=>attempt.successfulEffect).length,
      attempts,phaseAtEnd:phase,events,
      qualifiedForCompetitiveInference:false
    }};
  } finally {
    if(SimpleTacticsAi.prototype.decodeNextAction!==choose) {
      throw Error('Autonomous Hood policy lost prototype ownership');
    }
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={
  hoodedDoorRecoveryEntry,hoodedDoorEffectReceipt,
  withHoodGarbotoxinRecoveryAutonomy
};
