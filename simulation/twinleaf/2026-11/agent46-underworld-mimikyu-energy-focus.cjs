'use strict';

const path=require('node:path');
const OUTPUT=path.resolve(__dirname,
  '../../../vendor/twinleaf/ptcg-server/output');
const {installTreasureMimikyuSetup}=
  require('./agent46-mimikyu-treasure-search-setup.cjs');
const {facingVisibleRegidrago}=
  require('./agent46-mimikyu-fog-search-setup.cjs');
const {mimikyuCopycatReadiness}=
  require('../agent50-mimikyu-copycat-readiness.cjs');
const MIMIKYU='Mimikyu GRI';
const VMAX='Shadow Rider Calyrex VMAX CRE';
let installed=null;

/**
 * Owner-visible Underworld Door attachment window. No deck, Prize or
 * opponent-hand information is consulted.
 * @param {object} state Native State.
 * @param {object} player Actual acting owner.
 * @param {0|1} seat Owner physical seat.
 * @returns {{mimikyuIndex:number,vmaks:{slot:number,index:number,card:object}[]}|null}
 */
function underworldOpportunity(state,player,seat){
  if(state.players[seat]?.id!==player.id||
    !facingVisibleRegidrago(state,player))return null;
  const mIndex=player.bench.findIndex(slot=>
    slot.getPokemonCard()?.fullName===MIMIKYU);
  if(mIndex<0||mimikyuCopycatReadiness(state,player,seat,
      {slot:'bench',index:mIndex}).status!=='not-payable')return null;
  const all=[{slot:'active',index:0,cardList:player.active},
    ...player.bench.map((cardList,index)=>({slot:'bench',index,cardList}))];
  const vmarks=all.filter(entry=>
    entry.cardList.getPokemonCard()?.fullName===VMAX&&
    !player.marker.hasMarker('UNDERWORLD_DOOR_MARKER',
      entry.cardList.getPokemonCard()));
  if(vmarks.length===0)return null;
  return {mimikyuIndex:mIndex,vmarks};
}

/**
 * Reversible additional owner-only Energy emphasis. The existing
 * Fog+Treasure owner setup stays identical in both experimental arms.
 * @param {{seat:0|1,onEvent?:(event:object)=>void}} options
 * @returns {()=>void}
 */
function installUnderworldMimikyuFocus({seat,onEvent}){
  if(![0,1].includes(seat))throw new RangeError('Expected physical seat 0 or 1');
  if(installed){
    if(installed.seat!==seat)throw new Error('Conflicting Underworld owner seat');
    return installed.restore;
  }
  const restoreTreasure=installTreasureMimikyuSetup({seat,onEvent});
  const {PlayerType,SlotType}=require(path.join(OUTPUT,
    'game/store/actions/play-card-action'));
  const {UseAbilityAction}=require(path.join(OUTPUT,
    'game/store/actions/game-actions'));
  const {ResolvePromptAction}=require(path.join(OUTPUT,
    'game/store/actions/resolve-prompt-action'));
  const {EnergyCard}=require(path.join(OUTPUT,
    'game/store/card/energy-card'));
  const {EnergyType,CardType}=require(path.join(OUTPUT,
    'game/store/card/card-types'));
  const {UseAbilityTactic}=require(path.join(OUTPUT,
    'simple-bot/simple-tactics/use-ability-tactic'));
  const {AttachEnergyPromptResolver}=require(path.join(OUTPUT,
    'simple-bot/prompt-resolver/attach-energy-prompt-resolver'));
  const previousAbility=UseAbilityTactic.prototype.useTactic;
  const previousEnergy=AttachEnergyPromptResolver.prototype.resolvePrompt;

  function note(kind,state,player,data={}){
    if(onEvent)onEvent({kind,seat,turn:state.turn,
      ownerHandNames:player.hand.cards.map(card=>card.fullName),...data});
  }
  const psychic=card=>card instanceof EnergyCard&&
    card.energyType===EnergyType.BASIC&&
    card.provides.includes(CardType.PSYCHIC);

  function priorityUnderworld(state,player){
    const opportunity=underworldOpportunity(state,player,seat);
    if(!opportunity||!player.hand.cards.some(psychic)){
      return previousAbility.call(this,state,player);
    }
    for(const row of opportunity.vmarks){
      const target={player:PlayerType.BOTTOM_PLAYER,
        slot:row.slot==='active'?SlotType.ACTIVE:SlotType.BENCH,
        index:row.index};
      const action=new UseAbilityAction(player.id,'Underworld Door',target);
      const score=this.evaluateAction(state,player.id,action,
        this.options.scores.tactics.passTurn);
      if(score!==undefined){
        note('proposed-underworld-door',state,player,
          {recipientBenchIndex:opportunity.mimikyuIndex,abilityTarget:target});
        return action;
      }
    }
    return previousAbility.call(this,state,player);
  }

  function priorityPsychicTransfer(state,player,prompt){
    const opportunity=underworldOpportunity(state,player,seat);
    if(opportunity&&prompt?.playerId===player.id&&
      prompt?.constructor?.name==='AttachEnergyPrompt'&&
      prompt.message==='ATTACH_ENERGY_TO_BENCH'&&
      prompt.cardList===player.hand&&
      prompt.slots?.includes(SlotType.BENCH)&&
      prompt.options?.min===1&&prompt.options?.max===1){
      const index=prompt.cardList.cards.findIndex((c,i)=>
        psychic(c)&&!prompt.options.blocked.includes(i));
      const to={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:opportunity.mimikyuIndex};
      const blockedTarget=prompt.options.blockedTo.some(row=>
        row.player===to.player&&row.slot===to.slot&&row.index===to.index);
      if(index>=0&&!blockedTarget){
        const physical=prompt.cardList.cards[index];
        const assignment={to,card:physical};
        if(prompt.validate([assignment])){
          note('proposed-physical-underworld-to-mimikyu',state,player,
            {recipientBenchIndex:to.index,energy:physical.fullName,
              promptId:prompt.id});
          return new ResolvePromptAction(prompt.id,[assignment]);
        }
      }
    }
    return previousEnergy.call(this,state,player,prompt);
  }

  UseAbilityTactic.prototype.useTactic=priorityUnderworld;
  AttachEnergyPromptResolver.prototype.resolvePrompt=priorityPsychicTransfer;
  function restore(){
    if(UseAbilityTactic.prototype.useTactic===priorityUnderworld){
      UseAbilityTactic.prototype.useTactic=previousAbility;
    }
    if(AttachEnergyPromptResolver.prototype.resolvePrompt===priorityPsychicTransfer){
      AttachEnergyPromptResolver.prototype.resolvePrompt=previousEnergy;
    }
    restoreTreasure();
    if(installed?.restore===restore)installed=null;
  }
  installed={seat,restore};
  return restore;
}
module.exports={MIMIKYU,VMAX,underworldOpportunity,
  installUnderworldMimikyuFocus};
