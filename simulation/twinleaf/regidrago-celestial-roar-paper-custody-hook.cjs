'use strict';

const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let installed=null;

/**
 * Correct pinned Regidrago V SIT135 Celestial Roar with a reversible, single
 * printing-aware research adapter. Original Twinleaf reducer mutates
 * temp.cards inside forEach, skipping a discarded card and losing its physical
 * reference from every game zone whenever the attach prompt has residue.
 * It also excludes Special Energy despite printed "Energy cards".
 *
 * All three real top cards retain the original object identities:
 * each Energy is attached to the attacking Dragon, each other card discarded.
 * No simulator vendor files are changed. Never call this hook from a bot
 * decision; install it before actual Store actions and restore afterward.
 *
 * @returns {()=>void} Undo hook on the exact original pinned reducer.
 */
function installRegidragoCelestialRoarPaperCustodyHook(){
  if(installed)return ()=>{};
  const {RegidragoV}=require(path.join(root,
    'sets/09-sword-and-shield/set-silver-tempest/regidrago-v'));
  const {WAS_ATTACK_USED,MOVE_CARDS}=require(path.join(root,
    'game/store/prefabs/prefabs'));
  const {CardList}=require(path.join(root,'game/store/state/card-list'));
  const {AttachEnergyPrompt}=require(path.join(root,
    'game/store/prompts/attach-energy-prompt'));
  const {EnergyCard}=require(path.join(root,'game/store/card/energy-card'));
  const {SuperType}=require(path.join(root,'game/store/card/card-types'));
  const {PlayerType,SlotType}=require(path.join(root,
    'game/store/actions/play-card-action'));
  const {GameMessage}=require(path.join(root,'game/game-message'));
  const {GameError}=require(path.join(root,'game/game-error'));
  const {StateUtils}=require(path.join(root,'game/store/state-utils'));
  const original=RegidragoV.prototype.reduceEffect;

  /** @param {object} store @param {object} state @param {object} effect */
  function corrected(store,state,effect){
    if(!WAS_ATTACK_USED(effect,0,this))
      return original.call(this,store,state,effect);

    const player=effect.player;
    const temp=new CardList();
    MOVE_CARDS(store,state,player.deck,temp,{count:3,sourceCard:this});
    const energies=temp.cards.filter(card=>card instanceof EnergyCard);

    /** Move every remaining reference exactly once from the temporary list. */
    const discardRemaining=()=>{
      for(const card of [...temp.cards])
        MOVE_CARDS(store,state,temp,player.discard,
          {cards:[card],sourceCard:this});
      if(temp.cards.length)
        throw new Error('Celestial Roar temporary card custody not fully resolved');
    };

    if(!energies.length){
      discardRemaining();
      return state;
    }

    // Native prompt handles the exact originally drawn Energy objects,
    // including Special Energy. Its only recipient is Regidrago V Active.
    const prompt=new AttachEnergyPrompt(
      player.id,GameMessage.ATTACH_ENERGY_CARDS,temp,
      PlayerType.BOTTOM_PLAYER,[SlotType.ACTIVE],
      {superType:SuperType.ENERGY},
      {min:energies.length,max:energies.length,allowCancel:false}
    );
    return store.prompt(state,prompt,transfers=>{
      if(!Array.isArray(transfers)||transfers.length!==energies.length)
        throw new GameError(GameMessage.INVALID_PROMPT_RESULT);
      const selected=new Set();
      for(const {card,to} of transfers){
        if(selected.has(card)||!energies.includes(card)||
           !temp.cards.includes(card))
          throw new GameError(GameMessage.INVALID_PROMPT_RESULT);
        selected.add(card);
        const target=StateUtils.getTarget(state,player,to);
        MOVE_CARDS(store,state,temp,target,{cards:[card],sourceCard:this});
      }
      discardRemaining();
    });
  }

  RegidragoV.prototype.reduceEffect=corrected;
  installed={RegidragoV,original,corrected};
  return function restore(){
    if(installed?.corrected!==corrected)return;
    if(RegidragoV.prototype.reduceEffect!==corrected)
      throw new Error('Celestial Roar paper hook lost reducer ownership');
    RegidragoV.prototype.reduceEffect=original;
    installed=null;
  };
}

module.exports={installRegidragoCelestialRoarPaperCustodyHook};
