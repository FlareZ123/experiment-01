'use strict';

const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(root,name));
const PINNED_TWINLEAF_COMMIT='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
let activeRestore=null;

/**
 * Pinned Twinleaf's COPY_OPPONENTS_LAST_ATTACK rejects any opponent attack
 * with copycatAttack===true, but Mimikyu GRI's printed Copycat prohibits only
 * a GX attack. Regidrago VSTAR SIT's ordinary Apex Dragon is marked
 * copycatAttack in the engine because its effect copies a discard attack.
 *
 * This precise adapter permits only that printed interaction. It neither
 * changes Mimikyu's GX restriction nor other nested-copied-attack cases.
 * The flag is restored synchronously, including when the reducer throws.
 *
 * @param {Function} original card's original reducer
 * @param {Function} AttackEffect pinned native constructor
 * @returns {Function} source-bounded replacement
 */
function wrapMimikyuApexReducer(original,AttackEffect){
  if(typeof original!=='function'||typeof AttackEffect!=='function')
    throw new TypeError('Native reducer and AttackEffect constructor required');
  return function correctedMimikyuReducer(store,state,effect){
    const eligible=effect instanceof AttackEffect &&
      this?.fullName==='Mimikyu GRI'&&
      effect?.source?.getPokemonCard?.()===this&&
      effect?.attack?.name==='Copycat'&&
      effect.attack.gxAttack!==true&&
      effect?.opponent?.id!==undefined;
    const previous=eligible?state?.playerLastAttack?.[effect.opponent.id]:null;
    const attack=previous?.attack;
    if(!attack||
       previous.sourceCard?.fullName!=='Regidrago VSTAR SIT'||
       attack.name!=='Apex Dragon'||
       attack.copycatAttack!==true||
       attack.gxAttack===true){
      return original.call(this,store,state,effect);
    }
    const originalFlag=attack.copycatAttack;
    attack.copycatAttack=false;
    try{
      return original.call(this,store,state,effect);
    }finally{
      attack.copycatAttack=originalFlag;
    }
  };
}

/**
 * Install reversible, opt-in paper Expanded correction at the pinned Mimikyu
 * class boundary. Keep vendor untouched. Install/restore in LIFO order with
 * other prototype hooks; do not install until the pinned server is loaded.
 */
function installMimikyuApexCopycatHook(){
  if(activeRestore)return activeRestore;
  const {Mimikyu}=load('sets/08-sun-and-moon/set-guardians-rising/mimikyu');
  const {AttackEffect}=load('game/store/effects/game-effects');
  if(typeof Mimikyu?.prototype?.reduceEffect!=='function')
    throw new TypeError('Pinned Mimikyu GRI reducer is not available');
  const original=Mimikyu.prototype.reduceEffect;
  const corrected=wrapMimikyuApexReducer(original,AttackEffect);
  Mimikyu.prototype.reduceEffect=corrected;
  activeRestore=()=>{
    if(Mimikyu.prototype.reduceEffect===corrected)
      Mimikyu.prototype.reduceEffect=original;
    activeRestore=null;
  };
  return activeRestore;
}

module.exports={
  PINNED_TWINLEAF_COMMIT,
  wrapMimikyuApexReducer,
  installMimikyuApexCopycatHook
};
