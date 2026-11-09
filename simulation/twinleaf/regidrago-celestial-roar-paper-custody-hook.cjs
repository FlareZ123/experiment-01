'use strict';

const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const VERSION='regidrago-sit135-celestial-roar-mandatory-paper-custody-v2';
let installed=null;

/**
 * Make pinned Regidrago V SIT135 Celestial Roar honor the printed mandatory
 * action: discard three actual top-deck cards; attach every Energy drawn to
 * the attacking Pokémon and discard every other card. Both Basic and Special
 * Energy are eligible. Card reference identity and 60-card custody survive.
 *
 * Pinned Twinleaf loses one physical card by mutating an array in forEach.
 * Its optional AttachEnergyPrompt is additionally unnecessary for the paper
 * text: all attached Energy must go to the sole "this Pokémon" destination.
 * Avoiding that artificial prompt prevents native bot selection failures.
 *
 * Reversible research adapter only; never writes or modifies vendor source.
 * @returns {()=>void} Undo the exact installed prototype replacement.
 */
function installRegidragoCelestialRoarPaperCustodyHook(){
  if(installed)return ()=>{};
  const {RegidragoV}=require(path.join(root,
    'sets/09-sword-and-shield/set-silver-tempest/regidrago-v'));
  const {WAS_ATTACK_USED,MOVE_CARDS}=require(path.join(root,
    'game/store/prefabs/prefabs'));
  const {CardList}=require(path.join(root,'game/store/state/card-list'));
  const {EnergyCard}=require(path.join(root,'game/store/card/energy-card'));
  const original=RegidragoV.prototype.reduceEffect;

  /** @param {object} store @param {object} state @param {object} effect */
  function corrected(store,state,effect){
    if(!WAS_ATTACK_USED(effect,0,this))
      return original.call(this,store,state,effect);

    const owner=effect.player;
    const drawn=new CardList();
    MOVE_CARDS(store,state,owner.deck,drawn,{count:3,sourceCard:this});

    // Printed Celestial Roar has one fixed destination for every Energy.
    // Snapshot the temporary list so moving cards cannot skip successors.
    for(const card of [...drawn.cards]){
      const destination=card instanceof EnergyCard?
        owner.active:owner.discard;
      MOVE_CARDS(store,state,drawn,destination,
        {cards:[card],sourceCard:this});
    }
    if(drawn.cards.length)
      throw new Error('Celestial Roar left cards outside tracked physical zones');
    return state;
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

module.exports={VERSION,installRegidragoCelestialRoarPaperCustodyHook};
