'use strict';

const path = require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Own-hand/public-board route to a protected, Benched Shadow Rider VMAX.
 * The attached Energy can be placed on this same Benched Psychic Pokémon.
 * This returns only source-public and owner-visible information.
 * @param {object} state
 * @param {object} own
 * @param {object} opponent
 * @param {0|1} seat
 * @param {number} playerTurnPhase
 * @returns {{index:number,printing:string}|null}
 */
function protectedDoorOpportunity(state,own,opponent,seat,playerTurnPhase) {
  if(state.activePlayer!==seat || state.phase!==playerTurnPhase ||
     state.prompts.some(prompt=>prompt.result===undefined) ||
     !own.hand.cards.some(card=>card.name==='Psychic Energy') ||
     ![opponent.active,...opponent.bench].some(zone=>
       zone.getPokemonCard()?.name==='Garbodor' && zone.tools.length>0)) {
    return null;
  }
  const index=own.bench.findIndex(zone=>
    zone.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX' &&
    zone.tools.some(card=>card.name==='Stealthy Hood'));
  if(index<0)return null;
  return {index,printing:own.bench[index].getPokemonCard().fullName};
}

/**
 * One autonomous, original-root decision with genuine Store prompt completion.
 * No seed, rank or turn appears in the predicate; all hidden opponent cards
 * remain inaccessible. The wrapper records selected and verified actual
 * effects, without producing a competitive strength claim.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withProtectedUnderworldDoor(candidateSeat,execute) {
  if(![0,1].includes(candidateSeat)||typeof execute!=='function') {
    throw new TypeError('Need physical seat and a synchronous runner');
  }
  const load=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {UseAbilityAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {GamePhase}=load('game/store/state/state');
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const ownerId=candidateSeat===0?101:202;
  let phase='idle',before=null,selected=false,verified=false;
  const events=[];
  function choose(state) {
    const own=state.players.find(player=>player.id===this.client?.id);
    if(own?.id!==ownerId)return previous.call(this,state);
    const opponent=state.players[1-candidateSeat];
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if(phase==='attach' && pending?.constructor.name==='AttachEnergyPrompt' &&
       pending.playerId===own.id && before) {
      const energy=pending.cardList.cards.find(card=>card.name==='Psychic Energy');
      const target={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:before.benchIndex};
      const answer=energy?[{card:energy,to:target}]:[];
      if(energy && pending.validate(answer)) {
        phase='verify';
        events.push({turn:state.turn,kind:'selected-live-attachment',
          energy:energy.fullName,benchIndex:before.benchIndex});
        return new ResolvePromptAction(pending.id,answer);
      }
      events.push({turn:state.turn,kind:'attachment-prompt-rejected'});
      phase='done';
    }
    if(phase==='verify' && !pending) {
      const bench=own.bench[before.benchIndex];
      const attached=bench.energies.cards.filter(card=>card.name==='Psychic Energy')
        .length===before.psychicEnergyCount+1;
      const drawnTwo=own.deck.cards.length===before.deckCount-2;
      const garbodorStillTooled=[opponent.active,...opponent.bench].some(zone=>
        zone.getPokemonCard()?.name==='Garbodor'&&zone.tools.length>0);
      const hoodStillAttached=bench.tools.some(card=>card.name==='Stealthy Hood');
      verified=attached && drawnTwo && garbodorStillTooled && hoodStillAttached;
      events.push({turn:state.turn,kind:'verified-real-store-effect',
        attached,drawnTwo,garbodorStillTooled,hoodStillAttached});
      phase='done';
    }
    if(phase==='idle' && !selected && !pending) {
      const opportunity=protectedDoorOpportunity(state,own,opponent,candidateSeat,
        GamePhase.PLAYER_TURN);
      if(opportunity) {
        const action=new UseAbilityAction(own.id,'Underworld Door',{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
          index:opportunity.index
        });
        if(this.isValidAction(state,action)) {
          selected=true;phase='attach';
          const bench=own.bench[opportunity.index];
          before={deckCount:own.deck.cards.length,
            psychicEnergyCount:bench.energies.cards.filter(card=>
              card.name==='Psychic Energy').length,benchIndex:opportunity.index};
          events.push({turn:state.turn,kind:'selected-live-ability',
            ability:'Underworld Door',source:opportunity.printing,
            ownHand:own.hand.cards.map(card=>card.fullName),
            opponentGarbodorTools:[opponent.active,...opponent.bench].flatMap(zone=>
              zone.getPokemonCard()?.name==='Garbodor'?
                zone.tools.map(card=>card.fullName):[])});
          return action;
        }
        events.push({turn:state.turn,kind:'ability-declined-by-pinned-legality',
          source:opportunity.printing});
      }
    }
    return previous.call(this,state);
  }
  SimpleTacticsAi.prototype.decodeNextAction=choose;
  try {
    const result=execute();
    return {result,policyAudit:{
      version:'protected-benched-underworld-door-source-v1',
      candidateSeat,selected,phaseAtEnd:phase,
      realAttachmentAndDrawVerified:verified,events,
      qualifiedForCompetitiveInference:false
    }};
  } finally {
    if(SimpleTacticsAi.prototype.decodeNextAction!==choose) {
      throw new Error('Protected Door policy lost prototype ownership');
    }
    SimpleTacticsAi.prototype.decodeNextAction=previous;
  }
}

module.exports={protectedDoorOpportunity,withProtectedUnderworldDoor};
