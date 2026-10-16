'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let installed=null;

/**
 * Card-effect-aware canPlay guard for Guzma BUS.
 * The pinned version lets Guzma be played and discarded with no opposing
 * Bench, even though its complete switch effect cannot change the board.
 * Research-only reversible correction for the Supporter no-state-change rule.
 * @returns {() => void}
 */
function installGuzmaNoTargetHook(){
  if(installed)return()=>{};
  const {Guzma}=require(path.join(
    output,'sets/08-sun-and-moon/set-burning-shadows/guzma'
  ));
  const {StateUtils}=require(path.join(output,'game/store/state-utils'));
  const original=Guzma.prototype.canPlay;

  function correctedCanPlay(store,state,player){
    if(!original.call(this,store,state,player))return false;
    const opponent=StateUtils.getOpponent(state,player);
    return opponent.bench.some(slot=>slot.cards.length>0);
  }
  Guzma.prototype.canPlay=correctedCanPlay;
  installed={original,corrected:correctedCanPlay};

  return function restoreGuzmaNoTargetHook(){
    if(!installed||Guzma.prototype.canPlay!==installed.corrected)return;
    Guzma.prototype.canPlay=installed.original;
    installed=null;
  };
}
module.exports={installGuzmaNoTargetHook};
